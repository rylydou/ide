import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import * as schema from '.'
import { relations } from 'drizzle-orm'


export const group = pgTable('group', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	secret: text('secret').notNull(),
})


export const group_relations = relations(group, ({ many }) => ({
	users: many(schema.user),
}))


export type Group = typeof group.$inferSelect
export type NewGroup = typeof group.$inferInsert
