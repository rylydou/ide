import { integer, pgEnum, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { table } from './table'


export const user_role = pgEnum('user_role', ['student', 'admin', 'teacher'])


export const user = table('user', {
	id: serial('id').primaryKey(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	password: text('password').notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	role: user_role('role').default('student').notNull(),

	projects: integer('projects').array().notNull(),
})
