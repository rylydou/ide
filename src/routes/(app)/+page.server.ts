import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { db, schema } from '$lib/server'
import { redirect } from '@sveltejs/kit'


export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) throw redirect(303, '/login')

	const user = locals.session?.user

	const groups = (await db.query.users_to_groups.findMany({
		where: eq(schema.users_to_groups.user_id, user.id),
		with: {
			group: {
				columns: {
					secret: false,
				}
			}
		}
	})).map(({ group }) => group)

	const projects = await db.query.project.findMany({
		orderBy: (projects, { desc }) => desc(projects.updated_at),
		where: eq(schema.project.author_id, user.id),
		columns: {
			data: false,
		},
	})

	return {
		groups,
		projects,
	}
}
