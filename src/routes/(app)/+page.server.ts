import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { db, schema } from '$lib/server'

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session!
	const user = (await db.query.user.findFirst({
		where: eq(schema.user.id, session.user.id),
		columns: {
			password: false,
		}
	}))!

	const projects = await db.query.project.findMany({
		where: eq(schema.project.author_id, user.id),
		columns: {
			data: false,
		}
	})

	return {
		user,
		projects,
	}
}
