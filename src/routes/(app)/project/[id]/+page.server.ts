import { db, schema } from '$lib/server'
import { project_update_schema } from '$lib/server/db/schema'
import { error, redirect, type Actions } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'
import { createInsertSchema } from 'drizzle-zod'


export const load = (async ({ locals, params, }) => {
	if (!locals.session) throw redirect(303, '/login')
	const { user } = locals.session

	const project_id_schema = z.number({ coerce: true }).int('id must be a whole number')
	const project_id_result = await project_id_schema.safeParseAsync(params.id)
	if (!project_id_result.success) throw error(400)
	const project_id = project_id_result.data

	const project = await db.query.project.findFirst({
		where: eq(schema.project.id, project_id),
		with: {
			author: {
				columns: {
					password: false,
				}
			}
		}
	})

	if (!project) throw error(404)

	let readonly = true
	let is_author = false

	if (project?.author_id === user.id) {
		readonly = false
		is_author = true
	}
	else {
		// If the user is not the author then they can only view projects by users in the same groups as them
		const user_groups = (await db.query.users_to_groups.findMany({
			where: eq(schema.users_to_groups.user_id, user.id),
			columns: { group_id: true, },
		})).map(({ group_id }) => group_id)

		const author_groups = (await db.query.users_to_groups.findMany({
			where: eq(schema.users_to_groups.user_id, project.author_id),
			columns: { group_id: true, },
		})).map(({ group_id }) => group_id)

		const share_groups = user_groups.some((g) => author_groups.includes(g))
		if (!share_groups) throw error(404)
	}

	return {
		readonly,
		is_author,
		project,
	}
}) satisfies PageServerLoad


const project_update_schema = createInsertSchema(schema.project, {
	id: z.never(),
	author_id: z.never(),
	created_at: z.never(),
	updated_at: z.never(),
})


export const actions = {
	update: async ({ request, locals, params, }) => {
		if (!locals.session) throw error(401)
		const { user } = locals.session

		const project_id_schema = z.number({ coerce: true }).int()
		const project_id_result = await project_id_schema.safeParseAsync(params.id)
		if (!project_id_result.success) throw error(400)
		const project_id = project_id_result.data

		const project = await db.query.project.findFirst({
			where: eq(schema.project.id, project_id),
			columns: { author_id: true, }
		})

		if (!project) throw error(404)

		if (!user.is_admin) {
			// Just throwing 404 if user is not the author,
			// I don't want to implement view permissions all over again.
			if (project.author_id !== user.id) throw error(404)
		}

		const request_result = await project_update_schema.safeParseAsync(await request.json())
		if (!request_result.success) throw error(400)
		const new_project = request_result.data
		await db.update(schema.project).set({
			...new_project,
			updated_at: new Date(),
		})
	},
} satisfies Actions
