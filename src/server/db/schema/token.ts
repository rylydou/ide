import { pgTable, serial, text } from 'drizzle-orm/pg-core'


export const token = pgTable('token', {
	id: serial('id').primaryKey(),
	token: text('token').notNull(),
})


export type Token = typeof token.$inferSelect
export type NewToken = typeof token.$inferInsert
