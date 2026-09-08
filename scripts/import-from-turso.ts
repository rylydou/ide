/**
 * One-shot migration from the old Turso (libSQL/SQLite) database to self-hosted Postgres.
 *
 * Usage — with DB_URL/DB_TOKEN (old) and DATABASE_URL (new) set, after `bun run db:migrate`:
 *   bun run db:import-turso            # aborts on any integrity problem
 *   bun run db:import-turso --fix      # additionally de-duplicates conflicting emails
 *
 * Reads only from Turso. Sessions are deliberately not carried over, so everyone signs in
 * once more; bcrypt password hashes transfer verbatim and keep working (see src/lib/server/hash.ts).
 *
 * The old SQLite database did not enforce foreign keys or unique emails, so this refuses to
 * insert anything until the source data actually satisfies the new schema — silently dropping
 * a row here would orphan that user's projects and class memberships.
 */

import { sql as raw } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sql'
import { createClient } from '@libsql/client'
import type { ProjectData } from '../src/lib/projectData'
import * as schema from '../src/lib/server/db/schema'
import { urlId } from '../src/lib/server/nanoid'


const fix = Bun.argv.includes('--fix')

const { DB_URL, DB_TOKEN, DATABASE_URL } = Bun.env
if (!DB_URL) throw new Error('DB_URL (the old Turso database) is not set')
if (!DATABASE_URL) throw new Error('DATABASE_URL (the new Postgres database) is not set')

const turso = createClient({ url: DB_URL, authToken: DB_TOKEN })
const pg = new Bun.SQL(DATABASE_URL)
const db = drizzle({ client: pg })

/** SQLite stored timestamps as integer seconds. */
const toDate = (value: unknown) => new Date(Number(value) * 1000)

/** The old blob used snake_case keys; the column is typed camelCase now. */
const toProjectData = (value: unknown): ProjectData | null => {
	const parsed = typeof value === 'string' ? JSON.parse(value) : value
	if (!parsed || typeof parsed !== 'object') return null

	const old = parsed as Record<string, string | undefined>
	return {
		htmlCode: old.html_code ?? old.htmlCode ?? '',
		cssCode: old.css_code ?? old.cssCode ?? '',
		jsCode: old.js_code ?? old.jsCode ?? '',
	}
}

const read = async (table: string) => (await turso.execute(`select * from "${table}"`)).rows

const fail = (message: string): never => {
	console.error(`\n${message}`)
	process.exit(1)
}


// ----- read -----

const users = await read('user')
const groups = await read('group')
const memberships = await read('users_to_groups')
const projects = await read('project')

console.log(`read ${users.length} users, ${groups.length} groups, ${memberships.length} memberships, ${projects.length} projects`)


// ----- pre-flight -----

const [{ existing }] = await pg`select count(*)::int as existing from "user"`
if (existing > 0) {
	fail(`refusing to import: the target database already has ${existing} users.\nDrop and re-run \`bun run db:migrate\` against an empty database first.`)
}

const userIds = new Set(users.map((row) => Number(row.id)))
const groupIds = new Set(groups.map((row) => Number(row.id)))

const orphans = [
	...memberships.filter((row) => !userIds.has(Number(row.user_id))).map((row) => `users_to_groups.user_id=${row.user_id}`),
	...memberships.filter((row) => !groupIds.has(Number(row.group_id))).map((row) => `users_to_groups.group_id=${row.group_id}`),
	...projects.filter((row) => !userIds.has(Number(row.author_id))).map((row) => `project#${row.id}.author_id=${row.author_id}`),
]

if (orphans.length) {
	fail(`refusing to import: ${orphans.length} row(s) reference a missing parent:\n  ${orphans.join('\n  ')}`)
}

// Emails are unique in the new schema but were not in the old one.
const byEmail = Map.groupBy(users, (row) => String(row.email).toLowerCase())
const duplicates = [...byEmail.values()].filter((rows) => rows.length > 1)

const emailOverrides = new Map<number, string>()

for (const rows of duplicates) {
	const [, ...rest] = rows.toSorted((a, b) => Number(a.id) - Number(b.id))

	if (!fix) {
		fail(
			`refusing to import: ${rows.length} accounts share the email ${rows[0]!.email}:\n`
			+ rows.map((row) => `  #${row.id} ${row.name} (${toDate(row.created_at).toISOString().slice(0, 10)})`).join('\n')
			+ '\n\nMerge or delete them in the old database, or re-run with --fix to keep the oldest'
			+ '\naccount on the original address and suffix the newer ones (no accounts or projects are lost).',
		)
	}

	// Keep the oldest account on the original address; suffix the rest so both survive.
	for (const [index, row] of rest.entries()) {
		const [local, domain] = String(row.email).split('@')
		emailOverrides.set(Number(row.id), `${local}+${index + 2}@${domain}`)
	}
}

if (emailOverrides.size) {
	console.log('\nde-duplicating emails:')
	for (const [id, email] of emailOverrides) console.log(`  user#${id} -> ${email}`)
}


// ----- write -----

await db.transaction(async (tx) => {
	if (users.length) {
		await tx.insert(schema.user).values(users.map((row) => ({
			id: Number(row.id),
			email: emailOverrides.get(Number(row.id)) ?? String(row.email).toLowerCase(),
			name: String(row.name),
			password: String(row.password),
			createdAt: toDate(row.created_at),
			isAdmin: Boolean(row.is_admin),
		})))
	}

	if (groups.length) {
		await tx.insert(schema.group).values(groups.map((row) => ({
			id: Number(row.id),
			name: String(row.name),
			// '' meant "unjoinable" in the old schema; the column is now nullable + unique.
			secret: row.secret ? String(row.secret) : null,
		})))
	}

	if (memberships.length) {
		await tx.insert(schema.usersToGroups).values(memberships.map((row) => ({
			userId: Number(row.user_id),
			groupId: Number(row.group_id),
		})))
	}

	if (projects.length) {
		await tx.insert(schema.project).values(projects.map((row) => ({
			id: Number(row.id),
			name: String(row.name),
			authorId: Number(row.author_id),
			createdAt: toDate(row.created_at),
			updatedAt: toDate(row.updated_at),
			// `shareSlug` is new — mint one per project so every project stays shareable.
			shareSlug: urlId(15),
			data: toProjectData(row.data),
		})))
	}

	// Identity columns are `generated by default`, so the explicit ids above left the
	// sequences at 1. Fast-forward each one past the highest imported id.
	for (const table of ['user', 'group', 'project']) {
		await tx.execute(raw`
			select setval(
				pg_get_serial_sequence(${table}, 'id'),
				coalesce((select max(id) from ${raw.identifier(table)}), 1)
			)
		`)
	}
})


// ----- verify -----

const sources = { user: users, group: groups, users_to_groups: memberships, project: projects }
const counts: Record<string, { turso: number, postgres: number }> = {}

for (const [name, rows] of Object.entries(sources)) {
	const [{ count }] = await pg`select count(*)::int as count from ${pg(name)}`
	counts[name] = { turso: rows.length, postgres: count }
}

console.table(counts)

const mismatched = Object.entries(counts).filter(([, c]) => c.turso !== c.postgres)
if (mismatched.length) {
	fail(`row counts differ for: ${mismatched.map(([name]) => name).join(', ')}`)
}

console.log('all row counts match')

await pg.close()
turso.close()
