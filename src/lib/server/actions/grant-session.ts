import { cfg, future_date } from '$lib'
import type { Cookies } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { db, schema, url_id } from '..'


export const grant_session = async (user_id: number, cookies: Cookies) => {
	const now = new Date()

	const new_session = (await db.insert(schema.session).values({
		token: url_id(30),
		expires: future_date(cfg.session_max_age_days),
		user_id,
	}).returning())[0]

	const sessions_oldest_to_newest = await db.query.session.findMany({
		where: eq(schema.session.user_id, user_id),
		orderBy: (sessions, { asc }) => [asc(sessions.expires)],
	})

	for (const session of sessions_oldest_to_newest) {
		if (session.expires < now)
			await db.delete(schema.session).where(eq(schema.session.token, session.token))
	}

	// delete extra sessions
	while (sessions_oldest_to_newest.length > cfg.max_sessions_per_user) {
		const session = sessions_oldest_to_newest.shift()
		if (!session) break
		await db.delete(schema.session).where(eq(schema.session.token, session.token))
	}

	cookies.set('session_token', new_session.token, {
		path: '/',
		secure: true,
		sameSite: 'lax',
		expires: new_session.expires,
	})
}
