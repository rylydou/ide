import { relations } from 'drizzle-orm'
import { ref, str, table, timestamp } from './shared'
import { user } from './user'


export const session = table('session', {
	token: str('token', { length: 30 }).notNull().primaryKey(),
	user_id: ref('user_id').notNull().references(() => user.id, { onDelete: 'cascade', }),
	expires: timestamp('expires').notNull(),
})


export const session_relations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.user_id], references: [user.id] }),
}))
