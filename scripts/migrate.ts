import { drizzle } from "drizzle-orm/neon-serverless"
import { migrate } from "drizzle-orm/neon-serverless/migrator"
import { Pool } from '@neondatabase/serverless'
import dotenv from 'dotenv'
dotenv.config()


const db_url = process.env.DATABASE_URL!
console.log('connecting pool to', db_url)
const pool = new Pool({ connectionString: process.env.NEON_DB_URL, max: 1, })

console.log('connecting drizzle orm...')
const db = drizzle(pool)

console.log('migrating... (wish me luck)')
await migrate(db, { migrationsFolder: 'drizzle', })
console.log('done!')
