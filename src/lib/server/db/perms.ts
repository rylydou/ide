import { eq } from 'drizzle-orm'
import { db, schema } from '.'


/** @returns true if users are share similar groups */
export const is_users_mutuals = async (user_id_a: number, user_id_b: number) => {
	const user_groups = (await db.query.users_to_groups.findMany({
		where: eq(schema.users_to_groups.user_id, user_id_a),
		columns: { group_id: true, },
	})).map(({ group_id }) => group_id)

	const author_groups = (await db.query.users_to_groups.findMany({
		where: eq(schema.users_to_groups.user_id, user_id_b),
		columns: { group_id: true, },
	})).map(({ group_id }) => group_id)

	return user_groups.some((g) => author_groups.includes(g))
}
