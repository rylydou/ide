import { integer, serial, text } from 'drizzle-orm/pg-core'
import { table } from './table'


export const group = table('group', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	secret: text('secret').notNull().unique('group-secret'),

	teacher_ids: integer('teacher_ids').array().notNull(),
	student_ids: integer('student_ids').array().notNull(),
})
