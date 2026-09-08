import { index } from 'drizzle-orm/pg-core'
import type { ProjectData } from '../../../projectData'
import { id, json, ref, str, table, timestamp } from './shared'
import { user } from './user'


export const project = table('project', {
	id: id(),
	name: str().default('Untitled Project').notNull(),
	authorId: ref().notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
	/** Unguessable public identifier used by `/view/[slug]`. */
	shareSlug: str(15).notNull().unique('project-share_slug'),
	data: json<ProjectData>(),
}, (t) => [
	index('project-author_id').on(t.authorId),
])


export type ProjectInfo = {
	id: number,
	name: string,
	authorId?: number,
	createdAt: Date,
	updatedAt: Date,
	shareSlug?: string,
}
