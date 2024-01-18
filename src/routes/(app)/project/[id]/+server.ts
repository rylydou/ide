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


const try_get_project = async (session: AuthSession | undefined, params_id: unknown) => {
	if (!session) throw error(401)
	const { user } = session

	const id_schema = z.number({ coerce: true }).int()
	const parse_id_result = await id_schema.safeParseAsync(params_id)
	if (!parse_id_result.success) throw error(400, parse_id_result.error.message)
	const project_id = parse_id_result.data

	const project = await db.query.project.findFirst({
		where: eq(schema.project.id, project_id),
		columns: { author_id: true, }
	})

	if (!project) throw error(404)

	if (!user.is_admin) {
		// Just throwing 404 if user is not the author,
		// I don't want to implement view permissions all over again.
		if (project.author_id !== user.id) throw error(404)
	}

	return project_id
}


export const PUT: RequestHandler = async ({ request, locals, params }) => {
	const project_id = await try_get_project(locals.session, params.id)

	const request_result = await project_save_schema.safeParseAsync(await request.json())
	if (!request_result.success) throw error(400, request_result.error.message)
	const new_project = request_result.data
	await db.update(schema.project).set({
		...new_project,
		updated_at: new Date(),
	}).where(eq(schema.project.id, project_id))

	return json({}, { status: 200, })
}


export const DELETE: RequestHandler = async ({ locals, params }) => {
	const project_id = await try_get_project(locals.session, params.id)
	await db.delete(schema.project).where(eq(schema.project.id, project_id))
	return json({}, { status: 200 })
}
