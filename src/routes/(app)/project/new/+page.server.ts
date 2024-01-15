import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db, random_name, schema } from '$lib/server'


export const load = (async ({ locals }) => {
	if (!locals.session) throw redirect(303, '/login')
	const { user } = locals.session

	const project = (await db.insert(schema.project).values({
		author_id: user.id,
		name: random_name(),
	}).returning())[0]

	redirect(303, `/project/${project.id}`)
}) satisfies PageServerLoad
