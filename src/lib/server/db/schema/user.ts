import { relations } from 'drizzle-orm'
import { char, pgEnum, text, timestamp } from 'drizzle-orm/pg-core'
import { project, session, users_to_groups } from '.'
import { id, table } from './shared'


export const user_role = pgEnum('user_role', ['student', 'admin', 'teacher'])


export const user = table('user', {
	id: id('id').primaryKey(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	password: char('password', { length: 60 }).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	role: user_role('role').default('student').notNull(),
})


export const user_relations = relations(user, ({ many }) => ({
	projects: many(project),
	sessions: many(session),
	users_to_groups: many(users_to_groups),
}))
