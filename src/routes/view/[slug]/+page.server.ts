import { db, schema } from '$lib/server'
import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'


// Public, unauthenticated route. Keyed on the project's unguessable `share_slug`
// rather than its sequential id, so ids can't be enumerated.
export const load = (async ({ params }) => {
	const project = await db.query.project.findFirst({
		where: eq(schema.project.share_slug, params.slug),
		columns: {
			name: true,
			data: true,
		},
		with: {
			author: {
				columns: { name: true },
			},
		},
	})

	if (!project) error(404, 'Website not found')

	return { project }
}) satisfies PageServerLoad
