import { db, randomName, schema, urlId } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals }) => {
	if (!locals.session) redirect(303, '/login')
	const session = locals.session

	const [project] = await db.insert(schema.project).values({
		authorId: session.userId,
		name: randomName(),
		shareSlug: urlId(15),
	}).returning()

	redirect(303, `/project/${project!.id}`)
}) satisfies PageServerLoad
