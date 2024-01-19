import { db, schema } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
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
		// with: {}
	})

	if (!group) throw error(404, 'Class not found')

	const users = (await db.query.users_to_groups.findMany({
		where: eq(schema.users_to_groups, group.id),
		columns: {
			user_id: false,
			group_id: false,
		},
		with: {
			user: true,
		},
	})).map(({ user }) => user)

	return {
		group: {
			...group,
			secret: user.is_admin ? group.secret : undefined,
		},
		users,
	}
}) satisfies PageServerLoad
