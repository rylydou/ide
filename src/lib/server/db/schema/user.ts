import { relations } from 'drizzle-orm'
import { project, session, users_to_groups } from '.'
import { bool, id, str, table, timestamp } from './shared'


export const user = table('user', {
	id: id('id').primaryKey(),
	email: str('email').notNull(),
	name: str('name').notNull(),
	password: str('password', { length: 60 }).notNull(),
	created_at: timestamp('created_at').notNull(),
	is_admin: bool('is_admin').default(false).notNull(),
})


export const user_relations = relations(user, ({ many }) => ({
	projects: many(project),
	sessions: many(session),
	users_to_groups: many(users_to_groups),
}))
