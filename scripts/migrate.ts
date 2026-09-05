import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'


const url = Bun.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const sql = new Bun.SQL(url)
const db = drizzle(sql)

console.log('migrating...')
await migrate(db, { migrationsFolder: 'drizzle' })
console.log('done')

await sql.close()
