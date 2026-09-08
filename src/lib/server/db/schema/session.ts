import { index } from 'drizzle-orm/pg-core'
import { ref, str, table, timestamp } from './shared'
import { user } from './user'


export const session = table('session', {
	token: str(30).notNull().primaryKey(),
	userId: ref().notNull().references(() => user.id, { onDelete: 'cascade' }),
	expires: timestamp().notNull(),
}, (t) => [
	index('session-user_id').on(t.userId),
	index('session-expires').on(t.expires),
])
