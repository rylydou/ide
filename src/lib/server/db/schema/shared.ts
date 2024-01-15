import { integer, pgTableCreator, serial } from 'drizzle-orm/pg-core'
// import { url_id } from '$lib/server'


// export const table = pgTableCreator((name) => `builder_${name}`)
export const table = pgTableCreator((name) => name)

// export const id = (name: string, length = 15) => char(name, { length }).unique('id').$defaultFn(() => url_id(length))
// export const ref = (name: string, length = 15) => char(name, { length })

export const id = (name: string) => serial(name)
export const ref = (name: string) => integer(name)
