import { integer, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { project } from './project'
import { table } from './table'


export const user = table('user', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	password: text('password').notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),

	projects: integer('projects').array().notNull(),
})
