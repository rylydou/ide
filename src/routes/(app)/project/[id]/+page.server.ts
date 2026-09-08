import { db, isUsersMutuals } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals, params }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session

	const projectId = z.coerce.number().int('id must be a whole number').safeParse(params.id)
	if (!projectId.success) error(400)

	const project = await db.query.project.findFirst({
		where: { id: projectId.data },
		with: {
			author: {
				columns: { password: false },
			},
		},
	})

	if (!project) error(404)

	// Non-authors may only open projects belonging to someone in one of their classes.
	if (project.authorId !== user.id && !await isUsersMutuals(user.id, project.authorId))
		error(403, 'This project belongs to someone outside your classes.')

	return { project }
}) satisfies PageServerLoad
