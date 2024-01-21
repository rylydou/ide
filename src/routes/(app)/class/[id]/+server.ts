import { db, schema } from '$lib/server'
import { error, json, redirect } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'


export const POST = async ({ request, locals, params }) => {
	if (!locals.session) throw redirect(303, '/login')
	const { user } = locals.session

	const data = await request.json()
	if (data?.type !== 'leave') throw error(400)

	const group_id_schema = z.number({ coerce: true }).int('id must be a whole number')
	const group_id_result = await group_id_schema.safeParseAsync(params.id)
	if (!group_id_result.success) throw error(400)
	const group_id = group_id_result.data

	await db.delete(schema.users_to_groups).where(and(eq(schema.users_to_groups.user_id, user.id), eq(schema.users_to_groups.group_id, group_id)))

	return json({}, { status: 200 })
}


export const DELETE = async ({ locals, params }) => {
	if (!locals.session) throw redirect(303, '/login')
	const { user } = locals.session

	if (!user.is_admin) throw error(401)
}
