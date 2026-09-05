import { db, is_users_mutuals, schema } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals, params }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session

	const project_id_result = z.coerce.number().int('id must be a whole number').safeParse(params.id)
	if (!project_id_result.success) error(400)

	const project = await db.query.project.findFirst({
		where: eq(schema.project.id, project_id_result.data),
		with: {
			author: {
				columns: { password: false },
			},
		},
	})

	if (!project) error(404)

	// Non-authors may only open projects belonging to someone in one of their groups.
	if (project.author_id !== user.id && !await is_users_mutuals(user.id, project.author_id))
		error(403, 'This project belongs to someone outside your classes.')

	return { project }
}) satisfies PageServerLoad
