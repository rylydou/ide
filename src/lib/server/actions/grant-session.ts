import type { Cookies } from '@sveltejs/kit'
import { db, schema, url_id } from '..'
import { cfg } from '$lib'
import { eq } from 'drizzle-orm'


export const grant_session = async (user_id: number, cookies: Cookies) => {
	const expires = new Date()
	expires.setUTCDate(expires.getUTCDate() + cfg.session_max_age_days)
	const new_session = (await db.insert(schema.session).values({
		token: url_id(32),
		expires,
		user_id,
	}).returning())[0]

	const sessions_oldest_to_newest = await db.query.session.findMany({
		where: eq(schema.session.user_id, user_id),
		orderBy: (sessions, { asc }) => [asc(sessions.expires)],
	})
	console.log({ sessions: sessions_oldest_to_newest })

	while (sessions_oldest_to_newest.length > cfg.max_sessions_per_user) {
		const session = sessions_oldest_to_newest.shift()
		if (!session) break
		console.log('too many sessions, deleting oldest session')
		await db.delete(schema.session).where(eq(schema.session.token, session.token))
	}

	cookies.set('session_token', new_session.token, {
		path: '/',
		secure: true,
		sameSite: 'lax',
		expires: new_session.expires,
	})
}
