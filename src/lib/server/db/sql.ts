import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
dotenv.config()


const db_url = process.env.DATABASE_URL!
console.log('sql connecting to', db_url)
export const sql = neon(db_url)
