import { db, fix_ambiguous, human_id, schema } from '$lib/server'
import { error, redirect, type Actions } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


const group_id_schema = z.coerce.number().int('id must be a whole number')


export const load = (async ({ locals, params }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session

	const group_id_result = group_id_schema.safeParse(params.id)
	if (!group_id_result.success) error(400)

	const group = await db.query.group.findFirst({
		where: eq(schema.group.id, group_id_result.data),
		with: {
			users_to_groups: {
				columns: {
					user_id: false,
					group_id: false,
				},
				with: {
					user: {
						columns: {
							id: true,
							name: true,
							is_admin: true,
						},
						with: {
							projects: {
								columns: {
									id: true,
									name: true,
									created_at: true,
									updated_at: true,
								},
							},
						},
					},
				},
			},
		},
	})

	if (!group) error(404, 'Class not found')

	const users = group.users_to_groups.map(({ user }) => user)

	// Membership is the access check — don't leak the existence of other classes.
	if (!users.some((u) => u.id === user.id)) error(404, 'Class not found')

	return {
		group: {
			id: group.id,
			name: group.name,
			// The join code is an invite credential; only admins may see it.
			secret: user.is_admin ? group.secret : null,
			users,
		},
	}
}) satisfies PageServerLoad


const update_schema = z.object({
	name: z.string().trim().min(1, 'A class name is required').max(60),
	secret: z.string().transform(fix_ambiguous),
})


export const actions: Actions = {
	/**
	 * Note both of these are *named* actions. A `+server.ts` on this route would take
	 * precedence over a default action for POST, which is how class editing silently
	 * broke before — the form's POST was being handled as a JSON API request.
	 */
	update: async ({ request, locals, params }) => {
		if (!locals.session) redirect(303, '/login')
		const { user } = locals.session
		if (!user.is_admin) error(403, 'You have to be an admin to update a class.')

		const group_id_result = group_id_schema.safeParse(params.id)
		if (!group_id_result.success) error(400)

		const form_data = Object.fromEntries((await request.formData()).entries())
		const data_result = update_schema.safeParse(form_data)
		if (!data_result.success) error(400, z.prettifyError(data_result.error))
		const data = data_result.data

		// The "randomize" button submits a placeholder; an empty field closes the class.
		const secret = form_data.secret === '(randomize join code)'
			? human_id(6)
			: data.secret || null

		await db.update(schema.group).set({
			name: data.name,
			secret,
		}).where(eq(schema.group.id, group_id_result.data))

		return {}
	},

	/** Remove the current user from this class. */
	leave: async ({ locals, params }) => {
		if (!locals.session) redirect(303, '/login')
		const { user } = locals.session

		const group_id_result = group_id_schema.safeParse(params.id)
		if (!group_id_result.success) error(400)

		await db.delete(schema.users_to_groups).where(and(
			eq(schema.users_to_groups.user_id, user.id),
			eq(schema.users_to_groups.group_id, group_id_result.data),
		))

		redirect(303, '/')
	},
}
