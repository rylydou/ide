import { db_client } from './db_client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'


export * as schema from './schema'


console.log('connecting drizzle orm')
export const db = drizzle(db_client, { schema })
