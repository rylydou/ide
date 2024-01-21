import { db, fix_ambiguous, human_id, schema } from '$lib/server'
import { error, redirect, type Actions } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals, params }) => {
	if (!locals.session) throw redirect(303, '/login')
	const { user } = locals.session

	const group_id_schema = z.number({ coerce: true }).int('id must be a whole number')
	const group_id_result = await group_id_schema.safeParseAsync(params.id)
	if (!group_id_result.success) throw error(400)
	const group_id = group_id_result.data

	const group = await db.query.group.findFirst({
		where: eq(schema.project.id, group_id),
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
								}
							}
						}
					},
				},
			},
		},
	})

	if (!group) throw error(404, 'Class not found')

	const group_data = {
		id: group.id,
		name: group.name,
		secret: undefined as (string | undefined),
		users: group.users_to_groups.map(({ user }) => user),
	}

	if (!group_data.users.some(u => u.id === user.id)) throw error(404, 'Class not found')


	if (user.is_admin) {
		group_data.secret = group.secret
	}

	return {
		group: group_data,
	}
}) satisfies PageServerLoad


export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.session) throw redirect(303, '/login')
		const { user } = locals.session
		if (!user.is_admin) throw error(401, 'You have to be an admin to update a class.')

		const group_id_schema = z.number({ coerce: true }).int('id must be a whole number')
		const group_id_result = await group_id_schema.safeParseAsync(params.id)
		if (!group_id_result.success) throw error(400)
		const group_id = group_id_result.data

		const update_schema = z.object({
			name: z.string(),
			secret: z.string().toLowerCase().transform((str) => fix_ambiguous(str)),
		})

		const form_data = await request.formData()
		const data_result = await update_schema.safeParseAsync(Object.fromEntries(form_data.entries()))
		if (!data_result.success) throw error(400, data_result.error.message)
		const data = data_result.data

		if (data.secret.startsWith('(')) {
			data.secret = human_id(6)
		}

		await db.update(schema.group).set({
			name: data.name,
			secret: data.secret,
		}).where(eq(schema.group.id, group_id))

		return {}
	},
}
