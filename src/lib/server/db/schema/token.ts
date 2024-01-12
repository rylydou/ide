import { relations } from 'drizzle-orm'
import { date, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { user } from '.'


export const session = pgTable('session', {
	id: serial('id').primaryKey(),
	token: text('token').notNull(),

	create_at: date('created_at').defaultNow().notNull(),
	max_age: integer('max_age').default(34560000).notNull(), // 400 days in seconds (the max)
})

export const token_relations = relations(session, ({ one }) => ({
	user: one(user).withFieldName('user'),
}))


export type Token = typeof session.$inferSelect
export type NewToken = typeof session.$inferInsert
