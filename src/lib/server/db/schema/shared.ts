import { boolean, customType, doublePrecision, integer, pgTableCreator, text, timestamp as pgTimestamp, varchar } from 'drizzle-orm/pg-core'


/**
 * Tables keep their literal names; columns are derived from the TypeScript key in
 * `snake_case`, so the schema reads as idiomatic JS without renaming the database.
 */
export const table = pgTableCreator((name) => name, 'snake_case')


export const int = integer
export const bool = boolean
export const float = doublePrecision

export const timestamp = () => pgTimestamp({ withTimezone: true, mode: 'date' }).defaultNow()
export const str = (length?: number) => length === undefined ? text() : varchar({ length })

/**
 * `jsonb`, but handing the value to the driver untouched.
 *
 * Drizzle's own `jsonb()` calls `JSON.stringify` in `toDriver`, and `Bun.SQL` then encodes
 * that string as JSON in turn — the column ends up holding a jsonb *string* rather than an
 * object, which reads back fine but is unqueryable from SQL.
 */
const jsonbPassthrough = customType<{ data: unknown, driverData: unknown }>({
	dataType: () => 'jsonb',
	toDriver: (value) => value,
})

export const json = <T>() => jsonbPassthrough().$type<T>()

/** Identity primary key. `byDefault` so explicit ids can still be inserted (see `scripts/import-from-turso.ts`). */
export const id = () => integer().primaryKey().generatedByDefaultAsIdentity()
export const ref = integer
