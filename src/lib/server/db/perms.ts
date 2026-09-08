import { db } from '.'


/** @returns true if the two users share at least one class. */
export const isUsersMutuals = async (userIdA: number, userIdB: number) => {
	// `groups` reaches through the users_to_groups junction — see ./relations.ts
	const groupIds = async (userId: number) => (await db.query.group.findMany({
		where: { users: { id: userId } },
		columns: { id: true },
	})).map(({ id }) => id)

	const [a, b] = await Promise.all([groupIds(userIdA), groupIds(userIdB)])
	const shared = new Set(b)

	return a.some((groupId) => shared.has(groupId))
}
