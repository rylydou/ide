import { pgTableCreator } from 'drizzle-orm/pg-core'


// export const table = pgTableCreator((name) => `builder_${name}`)
export const table = pgTableCreator((name) => name)
