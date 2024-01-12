import { sql } from './sql'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'


export * as schema from './schema'


console.log('connecting drizzle orm')
export const db = drizzle(sql, { schema })
