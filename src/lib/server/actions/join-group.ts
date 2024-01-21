import { and, eq } from 'drizzle-orm'
import { db, schema } from '..'


export const join_group = async (secret: string, user_id: number) => {
	secret = secret.toLowerCase()
	if (secret.length < 4) return

	const group = await db.query.group.findFirst({
		where: eq(schema.group.secret, secret),
		columns: {
			id: true,
		},
	})
	if (!group) return

	const found_group = await db.query.users_to_groups.findFirst({
		where: and(eq(schema.users_to_groups.user_id, user_id), eq(schema.users_to_groups.group_id, group.id)),
	})
	if (found_group) return

	await db.insert(schema.users_to_groups).values({
		user_id: user_id,
		group_id: group.id,
	})
}
