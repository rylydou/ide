import { db } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) redirect(303, '/login')
	const session = locals.session

	const [groups, projects] = await Promise.all([
		// `groups` reaches through the users_to_groups junction — see src/lib/server/db/relations.ts
		db.query.group.findMany({
			where: { users: { id: session.userId } },
			columns: { secret: false },
		}),
		db.query.project.findMany({
			where: { authorId: session.userId },
			orderBy: { updatedAt: 'desc' },
			columns: { data: false },
		}),
	])

	return { groups, projects }
}
