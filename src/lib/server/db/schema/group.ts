import { relations } from 'drizzle-orm'
import { text } from 'drizzle-orm/pg-core'
import { users_to_groups } from '.'
import { id, table } from './shared'


export const group = table('group', {
	id: id('id').primaryKey(),
	name: text('name').notNull(),
	secret: text('secret').unique('group-secret', { nulls: 'distinct' }),
})


export const group_relations = relations(group, ({ many }) => ({
	users_to_groups: many(users_to_groups),
}))


export type GroupInfo = {
	id: number,
	name: string,
}
