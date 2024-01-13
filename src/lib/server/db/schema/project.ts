import { serial, text, timestamp } from 'drizzle-orm/pg-core'
import { table } from './table'


export const project = table('project', {
	id: serial('id').primaryKey(),
	name: text('name').default('Untitled Project').notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),

	updated_at: timestamp('updated_at').defaultNow().notNull(),
	code_html: text('code_html').default('').notNull(),
	code_css: text('code_css').default('').notNull(),
})
