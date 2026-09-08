import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'


const url = Bun.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const client = new Bun.SQL(url)
const db = drizzle({ client })

console.log('migrating...')
await migrate(db, { migrationsFolder: 'drizzle' })
console.log('done')

await client.close()
