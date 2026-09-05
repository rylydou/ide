import { env } from '$env/dynamic/private'
import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from './schema'


export * from './perms'
export * as schema from './schema'


type Database = ReturnType<typeof connect>

const connect = () => {
	// Dynamic, not `$env/static/private`: static env is inlined at build time, which would
	// bake the Docker build stage's placeholder URL into the image.
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

	// Native Bun Postgres client — no `pg` or `postgres.js` driver in the dependency tree.
	return drizzle(new Bun.SQL(env.DATABASE_URL), { schema })
}

let instance: Database | undefined

/**
 * Connected on first use rather than on import: SvelteKit's build imports every server
 * module to analyse routes, and no database is reachable at that point.
 */
export const db = new Proxy({} as Database, {
	get: (_, property) => Reflect.get(instance ??= connect(), property),
})
