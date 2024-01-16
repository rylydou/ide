import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
dotenv.config()


const db_url = process.env.DB_URL!
const db_token = process.env.DB_TOKEN!
console.log('sql connecting to', db_url)
export const db_client = createClient({ url: db_url, authToken: db_token, })
