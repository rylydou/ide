import { primaryKey } from 'drizzle-orm/pg-core'
import { group } from './group'
import { ref, table } from './shared'
import { user } from './user'


export const usersToGroups = table('users_to_groups', {
	userId: ref().notNull().references(() => user.id, { onDelete: 'cascade' }),
	groupId: ref().notNull().references(() => group.id, { onDelete: 'cascade' }),
}, (t) => [
	primaryKey({ columns: [t.userId, t.groupId] }),
])
