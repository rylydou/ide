import { db, random_name, schema } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session
	if (!user.is_admin) error(403, 'You have to be an admin to create a class.')

	const [group] = await db.insert(schema.group).values({
		name: random_name(),
		secret: null,
	}).returning()

	await db.insert(schema.users_to_groups).values({
		user_id: user.id,
		group_id: group!.id,
	})

	redirect(303, `/class/${group!.id}`)
}) satisfies PageServerLoad
