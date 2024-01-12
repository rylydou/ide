import { relations } from 'drizzle-orm'
import { pgTable, serial, text } from 'drizzle-orm/pg-core'
import { user } from '.'


export const group = pgTable('group', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	secret: text('secret').notNull(),
})


export const group_relations = relations(group, ({ many }) => ({
	users: many(user),
}))


export type Group = typeof group.$inferSelect
export type NewGroup = typeof group.$inferInsert
