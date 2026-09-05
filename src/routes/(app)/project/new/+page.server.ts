import { db, random_name, schema, url_id } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session

	const [project] = await db.insert(schema.project).values({
		author_id: user.id,
		name: random_name(),
		share_slug: url_id(15),
	}).returning()

	redirect(303, `/project/${project!.id}`)
}) satisfies PageServerLoad
