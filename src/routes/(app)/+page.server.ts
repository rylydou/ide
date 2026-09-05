import { db, schema } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import { desc, eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session

	const groups = (await db.query.users_to_groups.findMany({
		where: eq(schema.users_to_groups.user_id, user.id),
		with: {
			group: {
				columns: { secret: false },
			},
		},
	})).map(({ group }) => group)

	const projects = await db.query.project.findMany({
		where: eq(schema.project.author_id, user.id),
		orderBy: desc(schema.project.updated_at),
		columns: { data: false },
	})

	return { groups, projects }
}
