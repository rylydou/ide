import { bool, id, str, table, timestamp } from './shared'


export const user = table('user', {
	id: id(),
	email: str().notNull().unique('user-email'),
	name: str().notNull(),
	password: str().notNull(),
	createdAt: timestamp().notNull(),
	isAdmin: bool().default(false).notNull(),
})
