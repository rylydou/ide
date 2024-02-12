import { db, schema } from '$lib/server'
import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { PageServerLoad } from './$types'


export const load = (async ({ params }) => {
	const id_result = await z.number({ coerce: true }).safeParseAsync(params.id)
	if (!id_result.success) throw error(400)
	const id = id_result.data
	const project = await db.query.project.findFirst({
		where: eq(schema.project.id, id),
		columns: {
			name: true,
			data: true,
		},
		with: {
			author: {
				columns: {
					name: true,
				},
			},
		},
	})

	if (!project) throw error(404, 'Website not found')

	return { project }
}) satisfies PageServerLoad
