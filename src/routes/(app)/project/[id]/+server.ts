import { cfg } from '$lib'
import { project_data_schema } from '$lib/project-data'
import { db, schema, url_id } from '$lib/server'
import { error, json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { RequestHandler } from './$types'


const project_save_schema = z.object({
	name: z.string().max(40, 'Project name is too long.'),
	data: project_data_schema.refine(
		(data) => Object.values(data).join('').length <= cfg.max_payload_length,
		`Projects are limited to ${cfg.max_payload_length} characters in total.`,
	),
})


const get_project = async (params_id: unknown) => {
	const id_result = z.coerce.number().int().safeParse(params_id)
	if (!id_result.success) error(400, id_result.error.message)

	const project = await db.query.project.findFirst({
		where: eq(schema.project.id, id_result.data),
		columns: {
			id: true,
			author_id: true,
		},
	})

	if (!project) error(404)

	return project
}


export const PUT: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.session) error(401)
	const { user } = locals.session

	const project = await get_project(params.id)

	const request_result = project_save_schema.safeParse(await request.json())
	if (!request_result.success) error(400, z.prettifyError(request_result.error))
	const new_project = request_result.data

	// Authors save in place; everyone else gets a fork of their own.
	if (project.author_id === user.id) {
		await db.update(schema.project).set({
			...new_project,
			updated_at: new Date(),
		}).where(eq(schema.project.id, project.id))

		return json({})
	}

	const [forked_project] = await db.insert(schema.project).values({
		name: new_project.name,
		data: new_project.data,
		author_id: user.id,
		share_slug: url_id(15),
	}).returning()

	return json({ forked_to: forked_project!.id })
}


export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) error(401)
	const { user } = locals.session

	const project = await get_project(params.id)

	if (!user.is_admin && project.author_id !== user.id) error(403)

	await db.delete(schema.project).where(eq(schema.project.id, project.id))
	return json({})
}
