import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"
dotenv.config()


export default {
	schema: "src/lib/server/db/schema/*",
	out: "./drizzle",
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL!,
		ssl: true,
	}
} satisfies Config
