import { integer, jsonb, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { table } from './table'
import { relations } from 'drizzle-orm'
import { user } from '.'


export const project = table('project', {
	id: serial('id').primaryKey(),
	name: text('name').default('Untitled Project').notNull(),
	author_id: integer('author_id').notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
	data: jsonb('data'),
})


export const project_relations = relations(project, ({ one }) => ({
	author: one(user, { fields: [project.author_id], references: [user.id] }),
}))


export type ProjectInfo = {
	id: number,
	name: string,
	author_id: number,
	created_at: Date,
	updated_at: Date,
}
