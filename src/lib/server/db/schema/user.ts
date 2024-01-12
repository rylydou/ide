import { relations } from 'drizzle-orm'
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { project } from '.'


export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	password: text('password').notNull(),
})


export const user_relations = relations(user, ({ many }) => ({
	projects: many(project).withFieldName('projects'),
}))


export const to_user_info = (user: User | null | undefined): UserInfo | undefined => {
	if (!user) return undefined
	return {
		id: user.id,
		name: user.name,
		created_at: user.created_at,
	}
}


export type UserInfo = {
	id: number,
	name: string,
	created_at: Date,
}


export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
