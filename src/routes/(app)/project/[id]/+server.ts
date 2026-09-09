import { cfg } from '$lib'
import { projectDataSchema } from '$lib/projectData'
import { db, schema, urlId } from '$lib/server'
import { error, json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { RequestHandler } from './$types'


const projectSaveSchema = z.object({
	name: z.string().max(40, 'Project name is too long.'),
	data: projectDataSchema.refine(
		(data) => Object.values(data).join('').length <= cfg.maxPayloadLength,
		`Projects are limited to ${cfg.maxPayloadLength} characters in total.`,
	),
})


const getProject = async (paramsId: unknown) => {
	const id = z.coerce.number().int().safeParse(paramsId)
	if (!id.success) error(400, id.error.message)

	const project = await db.query.project.findFirst({
		where: { id: id.data },
		columns: { id: true, authorId: true },
	})

	if (!project) error(404)

	return project
}


export const PUT: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.session) error(401)
	const session = locals.session

	const project = await getProject(params.id)

	const result = projectSaveSchema.safeParse(await request.json())
	if (!result.success) error(400, z.prettifyError(result.error))
	const newProject = result.data

	// Authors save in place; everyone else gets a fork of their own.
	if (project.authorId === session.userId) {
		await db.update(schema.project).set({
			...newProject,
			updatedAt: new Date(),
		}).where(eq(schema.project.id, project.id))

		return json({})
	}

	const [forked] = await db.insert(schema.project).values({
		name: newProject.name,
		data: newProject.data,
		authorId: session.userId,
		shareSlug: urlId(15),
	}).returning()

	return json({ forkedTo: forked!.id })
}


export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) error(401)
	const session = locals.session

	const project = await getProject(params.id)

	if (!session.isAdmin && project.authorId !== session.userId) error(403)

	await db.delete(schema.project).where(eq(schema.project.id, project.id))
	return json({})
}
