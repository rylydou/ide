import { cfg, future_date } from '$lib'
import type { Cookies } from '@sveltejs/kit'
import { asc, eq, lt } from 'drizzle-orm'
import { db, schema, url_id } from '..'


export const grant_session = async (user_id: number, cookies: Cookies) => {
	const [new_session] = await db.insert(schema.session).values({
		token: url_id(30),
		expires: future_date(cfg.session_max_age_days),
		user_id,
	}).returning()

	// Drop anything already expired, then trim the user back to their session budget.
	await db.delete(schema.session).where(lt(schema.session.expires, new Date()))

	const sessions = await db.query.session.findMany({
		where: eq(schema.session.user_id, user_id),
		orderBy: asc(schema.session.expires),
		columns: { token: true },
	})

	for (const session of sessions.slice(0, -cfg.max_sessions_per_user)) {
		await db.delete(schema.session).where(eq(schema.session.token, session.token))
	}

	cookies.set('session_token', new_session!.token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: new_session!.expires,
	})
}
