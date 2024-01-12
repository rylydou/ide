import { relations } from 'drizzle-orm'
import { date, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { user } from '.'


export const token = pgTable('token', {
	id: serial('id').primaryKey(),
	secret: text('secret').notNull(),

	create_at: date('created_at').defaultNow().notNull(),
	max_age: integer('max_age').default(34560000).notNull(), // 400 days in seconds (the max)
})

export const token_relations = relations(token, ({ one }) => ({
	user: one(user).withFieldName('user'),
}))


export type Token = typeof token.$inferSelect
export type NewToken = typeof token.$inferInsert
