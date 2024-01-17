import { drizzle } from 'drizzle-orm/libsql'
import { db_client } from './db_client'
import * as schema from './schema'


export * from './perms'
export * as schema from './schema'


console.log('connecting drizzle orm')
export const db = drizzle(db_client, { schema })
