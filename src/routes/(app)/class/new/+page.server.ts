import { db, randomName, schema } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'


export const load = (async ({ locals }) => {
	if (!locals.session) redirect(303, '/login')
	const { user } = locals.session
	if (!user.isAdmin) error(403, 'You have to be an admin to create a class.')

	const [group] = await db.insert(schema.group).values({
		name: randomName(),
		secret: null,
	}).returning()

	await db.insert(schema.usersToGroups).values({
		userId: user.id,
		groupId: group!.id,
	})

	redirect(303, `/class/${group!.id}`)
}) satisfies PageServerLoad
