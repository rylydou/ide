import { boolean, customType, doublePrecision, integer, pgTableCreator, text, timestamp as pg_timestamp, varchar } from 'drizzle-orm/pg-core'


/** Tables are created verbatim — no prefix. */
export const table = pgTableCreator((name) => name)


export const int = (name: string) => integer(name)
export const bool = (name: string) => boolean(name)
export const float = (name: string) => doublePrecision(name)

export const timestamp = (name: string) => pg_timestamp(name, { withTimezone: true, mode: 'date' }).defaultNow()
export const str = (name: string, options?: { length?: number, enum?: [string, ...string[]] }) =>
	options?.length === undefined
		? text(name, options?.enum ? { enum: options.enum } : undefined)
		: varchar(name, { length: options.length, ...(options.enum ? { enum: options.enum } : {}) })
/**
 * `jsonb`, but handing the value to the driver untouched.
 *
 * Drizzle's own `jsonb()` calls `JSON.stringify` in `toDriver`, and `Bun.SQL` then encodes
 * that string as JSON in turn — the column ends up holding a jsonb *string* rather than an
 * object, which reads back fine but is unqueryable from SQL.
 */
const jsonb_passthrough = customType<{ data: unknown, driverData: unknown }>({
	dataType: () => 'jsonb',
	toDriver: (value) => value,
})

export const json = <T>(name: string) => jsonb_passthrough(name).$type<T>()

/** Identity primary key. `byDefault` so explicit ids can still be inserted (see `scripts/import-from-turso.ts`). */
export const id = (name: string) => integer(name).primaryKey().generatedByDefaultAsIdentity()
export const ref = (name: string) => integer(name)
