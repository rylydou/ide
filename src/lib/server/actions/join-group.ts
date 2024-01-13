import { eq } from 'drizzle-orm'
import { db, schema } from '..'


export const join_group = async (secret: string, user_id: number) => {
	const group = await db.query.group.findFirst({
		where: eq(schema.group.secret, secret),
	})
	if (!group) return
	if (group.user_ids.indexOf(user_id) >= 0) return
	group.user_ids.push(user_id)
	await db.update(schema.group).set({
		user_ids: group.user_ids
	})
}
