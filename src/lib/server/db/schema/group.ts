import { integer, serial, text } from 'drizzle-orm/pg-core'
import { table } from './table'


export const group = table('group', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	secret: text('secret').unique('group-secret'),

	user_ids: integer('user_ids').array().notNull(),
})
