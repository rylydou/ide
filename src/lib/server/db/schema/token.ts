import { date, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'


export const token = pgTable('token', {
	id: serial('id').primaryKey(),
	token: text('token').notNull(),
	create_at: date('created_at').defaultNow().notNull(),
	max_age: integer('max_age').default(34560000).notNull(), // 400 days in seconds (the max)
})


export type Token = typeof token.$inferSelect
export type NewToken = typeof token.$inferInsert
