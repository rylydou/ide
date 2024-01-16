import dotenv from 'dotenv'
import { drizzle, } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { db_client } from '../src/lib/server/db/db_client'
dotenv.config()


console.log('connecting drizzle orm...')
const db = drizzle(db_client)

console.log('migrating... (wish me luck)')
await migrate(db, { migrationsFolder: 'drizzle', })
console.log('done!')
