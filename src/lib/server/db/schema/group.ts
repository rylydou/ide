import { id, str, table } from './shared'


export const group = table('group', {
	id: id(),
	name: str().notNull(),
	/**
	 * Join code. `null` means the class is unjoinable — deliberately nullable rather than
	 * empty-string, so the unique constraint doesn't collide across closed classes.
	 */
	secret: str(6).unique('group-secret'),
})


export type GroupInfo = {
	id: number,
	name: string,
}
