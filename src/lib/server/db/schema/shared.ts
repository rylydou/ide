import { integer, real, sqliteTableCreator, text } from 'drizzle-orm/sqlite-core'


export const table = sqliteTableCreator((name) => name)


export const int = (name: string) => integer(name, { mode: 'number' })
export const bool = (name: string) => integer(name, { mode: 'boolean' })
export const float = (name: string) => real(name)

export const timestamp = (name: string) => integer(name, { mode: 'timestamp' }).$defaultFn(() => new Date())
export const str = (name: string, options?: { length?: number, enum?: [string, ...string[]] }) => text(name, { ...options, mode: 'text' })
export const json = (name: string) => text(name, { mode: 'json' })

export const id = (name: string) => integer(name).primaryKey({ autoIncrement: true, })
export const ref = (name: string) => integer(name)

// export const id = (name: string) => text(name, { length: 15, mode: 'text', }).$defaultFn(() => url_id(length))
// export const ref = (name: string) => text(name, { length: 15, mode: 'text', })

// export const id = (name: string) => serial(name)
// export const ref = (name: string) => integer(name)
