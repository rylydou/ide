import { relations } from 'drizzle-orm'
import { integer, text, timestamp } from 'drizzle-orm/pg-core'
import { table } from './table'
import { user } from './user'


export const session = table('session', {
	token: text('token').notNull().primaryKey(),
	user_id: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade', }),
	expires: timestamp('expires', { mode: 'date' }).notNull(),
})


export const session_relations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.user_id], references: [user.id] }),
}))
