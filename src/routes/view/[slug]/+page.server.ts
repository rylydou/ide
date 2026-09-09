import { db } from '$lib/server'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'


// Public, unauthenticated route. Keyed on the project's unguessable `shareSlug`
// rather than its sequential id, so ids can't be enumerated.
export const load = (async ({ params }) => {
	const project = await db.query.project.findFirst({
		where: { shareSlug: params.slug },
		columns: { name: true, data: true },
		with: {
			author: {
				columns: { name: true },
			},
		},
	})

	if (!project) error(404, 'Website not found')

	return { project }
}) satisfies PageServerLoad
