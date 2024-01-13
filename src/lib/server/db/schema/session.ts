import { integer, text, timestamp } from 'drizzle-orm/pg-core'
import { table } from './table'
import { user } from './user'


export const session = table('session', {
	token: text('token').notNull().primaryKey(),
	user_id: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade', }),
	expires: timestamp('expires', { mode: 'date' }).notNull(),
})
