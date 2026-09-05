import type { ProjectData } from '../../../project-data'
import { relations } from 'drizzle-orm'
import { index } from 'drizzle-orm/pg-core'
import { user } from '.'
import { id, json, ref, str, table, timestamp } from './shared'


export const project = table('project', {
	id: id('id'),
	name: str('name').default('Untitled Project').notNull(),
	author_id: ref('author_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	created_at: timestamp('created_at').notNull(),
	updated_at: timestamp('updated_at').notNull(),
	/** Unguessable public identifier used by `/view/[slug]`. */
	share_slug: str('share_slug', { length: 15 }).notNull().unique('project-share_slug'),
	data: json<ProjectData>('data'),
}, (t) => [
	index('project-author_id').on(t.author_id),
])


export const project_relations = relations(project, ({ one }) => ({
	author: one(user, { fields: [project.author_id], references: [user.id] }),
}))


export type ProjectInfo = {
	id: number,
	name: string,
	author_id?: number,
	created_at: Date,
	updated_at: Date,
	share_slug?: string,
}
