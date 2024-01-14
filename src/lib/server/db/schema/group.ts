import { integer, serial, text } from 'drizzle-orm/pg-core'
import { table } from './table'
import { relations } from 'drizzle-orm'
import { user, users_to_groups } from '.'


export const group = table('group', {
	id: serial('id').primaryKey(),
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
