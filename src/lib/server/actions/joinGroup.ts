import { db, schema } from '..'


export const joinGroup = async (secret: string, userId: number) => {
	if (secret.length < 4) return

	const group = await db.query.group.findFirst({
		where: { secret },
		columns: { id: true },
	})
	if (!group) return

	// Already a member? `onConflictDoNothing` makes this a no-op rather than a race.
	await db.insert(schema.usersToGroups)
		.values({ userId, groupId: group.id })
		.onConflictDoNothing()
}
