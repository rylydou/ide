import { sql } from '@vercel/postgres'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'


export * as schema from './schema'


export const db = drizzle(sql, { schema })


export const create_user = async (user_init: schema.NewUser) => {
	await db.insert(schema.user).values(user_init)
}


export const list_users = async () => {
	const users = await db.query.user.findMany()
	return users.map((user) => schema.to_user_info(user))
}


export const get_user_info = async (user_id: number) => {
	const user = await db.query.user.findFirst({
		where: eq(schema.user.id, user_id),
	})
	return schema.to_user_info(user)
}


export const list_user_projects = async (user_id: number) => {
	return await db.query.user.findMany({
		where: eq(schema.user.id, user_id),
		columns: {},
		with: {
			projects: {
				columns: {
					code_css: false,
					code_html: false,
				}
			}
		}
	})
}


export const get_project = async (project_id: number) => {
	return await db.query.project.findFirst({
		with: { id: project_id },
	})
}


export const get_group = async (group_id: number) => {
	return await db.query.group.findFirst({
		where: eq(schema.group.id, group_id)
	})
}



export const get_group_by_secret = async (secret: string) => {
	return await db.query.group.findFirst({
		where: eq(schema.group.secret, secret)
	})
}
