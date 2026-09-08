import { db, fixAmbiguous, humanId, schema } from '$lib/server'
import { error, redirect, type Actions } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


const groupIdSchema = z.coerce.number().int('id must be a whole number')


export const load = (async ({ locals, params }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session

	const groupId = groupIdSchema.safeParse(params.id)
	if (!groupId.success) error(400)

	const group = await db.query.group.findFirst({
		// Membership is the access check, expressed as a filter on the related users —
		// a non-member gets no row at all, so other classes never leak their existence.
		where: { id: groupId.data, users: { id: user.id } },
		with: {
			users: {
				columns: { id: true, name: true, isAdmin: true },
				with: {
					projects: {
						columns: { id: true, name: true, createdAt: true, updatedAt: true },
					},
				},
			},
		},
	})

	if (!group) error(404, 'Class not found')

	return {
		group: {
			id: group.id,
			name: group.name,
			// The join code is an invite credential; only admins may see it.
			secret: user.isAdmin ? group.secret : null,
			users: group.users,
		},
	}
}) satisfies PageServerLoad


const updateSchema = z.object({
	name: z.string().trim().min(1, 'A class name is required').max(60),
	secret: z.string().transform(fixAmbiguous),
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
		if (!user.isAdmin) error(403, 'You have to be an admin to update a class.')

		const groupId = groupIdSchema.safeParse(params.id)
		if (!groupId.success) error(400)

		const formData = Object.fromEntries((await request.formData()).entries())
		const result = updateSchema.safeParse(formData)
		if (!result.success) error(400, z.prettifyError(result.error))

		// The "randomize" button submits a placeholder; an empty field closes the class.
		const secret = formData.secret === '(randomize join code)'
			? humanId(6)
			: result.data.secret || null

		await db.update(schema.group).set({
			name: result.data.name,
			secret,
		}).where(eq(schema.group.id, groupId.data))

		return {}
	},

	/** Remove the current user from this class. */
	leave: async ({ locals, params }) => {
		if (!locals.session) redirect(303, '/login')
		const { user } = locals.session

		const groupId = groupIdSchema.safeParse(params.id)
		if (!groupId.success) error(400)

		await db.delete(schema.usersToGroups).where(and(
			eq(schema.usersToGroups.userId, user.id),
			eq(schema.usersToGroups.groupId, groupId.data),
		))

		redirect(303, '/')
	},
}
