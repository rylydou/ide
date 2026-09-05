import { relations } from 'drizzle-orm'
import { users_to_groups } from '.'
import { id, str, table } from './shared'


export const group = table('group', {
	id: id('id'),
	name: str('name').notNull(),
	/**
	 * Join code. `null` means the class is unjoinable — deliberately nullable rather than
	 * empty-string, so the unique constraint doesn't collide across closed classes.
	 */
	secret: str('secret', { length: 6 }).unique('group-secret'),
})


export const group_relations = relations(group, ({ many }) => ({
	users_to_groups: many(users_to_groups),
}))


export type GroupInfo = {
	id: number,
	name: string,
}
