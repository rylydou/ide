import { integer, primaryKey } from 'drizzle-orm/pg-core'
import { table } from './table'
import { group, user } from '.'
import { relations } from 'drizzle-orm'


export const users_to_groups = table('users_to_groups', {
	user_id: integer('user_id').notNull().references(() => user.id),
	group_id: integer('group_id').notNull().references(() => group.id),
}, (t) => ({
	pk: primaryKey({ columns: [t.user_id, t.group_id] }),
}),
)


export const users_to_groups_relations = relations(users_to_groups, ({ one }) => ({
	group: one(group, {
		fields: [users_to_groups.group_id],
		references: [group.id],
	}),
	user: one(user, {
		fields: [users_to_groups.user_id],
		references: [user.id],
	}),
}))
