import { db, is_users_mutuals, schema } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals, params }) => {
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


	if (project?.author_id !== user.id) {
		// If the user is not the author then they can only view projects by users in the same groups as them
		await is_users_mutuals(user.id, project.author_id)
	}

	return {
		project,
	}
}) satisfies PageServerLoad
