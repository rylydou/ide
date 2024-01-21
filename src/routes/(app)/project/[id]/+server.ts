import { db, schema, } from '$lib/server'
import { error, json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { RequestHandler } from './$types'
import type { AuthSession } from '$lib/types'


const project_save_schema = z.object({
	name: z.string(),
	data: z.any(),
})


const get_project = async (user: AuthSession['user'], params_id: unknown) => {
	const id_schema = z.number({ coerce: true }).int()
	const parse_id_result = await id_schema.safeParseAsync(params_id)
	if (!parse_id_result.success) throw error(400, parse_id_result.error.message)
	const project_id = parse_id_result.data

	const project = await db.query.project.findFirst({
		where: eq(schema.project.id, project_id),
		columns: {
			id: true,
			author_id: true,
		}
	})

	if (!project) throw error(404)

	return project
}


export const PUT: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.session) throw error(401)
	const { user } = locals.session

	const project = await get_project(user, params.id)

	const request_result = await project_save_schema.safeParseAsync(await request.json())
	if (!request_result.success) throw error(400, request_result.error.message)
	const new_project = request_result.data

	if (project.author_id === user.id) {
		// Save the project
		await db.update(schema.project).set({
			...new_project,
			updated_at: new Date(),
		}).where(eq(schema.project.id, project.id))

		return json({}, { status: 200, })
	}

	// Fork the project
	const forked_project = (await db.insert(schema.project).values({
		name: new_project.name,
		data: new_project.data,
		author_id: user.id,
	}).returning())[0]

	return json({
		forked_to: forked_project.id
	}, { status: 200, })
}


export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) throw error(401)
	const { user } = locals.session

	const project = await get_project(user, params.id)
	await db.delete(schema.project).where(eq(schema.project.id, project.id))
	return json({}, { status: 200 })
}
