import { cfg, futureDate } from '$lib'
import type { Cookies } from '@sveltejs/kit'
import { eq, lt } from 'drizzle-orm'
import { db, schema, urlId } from '..'


export const grantSession = async (userId: number, cookies: Cookies) => {
	const [newSession] = await db.insert(schema.session).values({
		token: urlId(30),
		expires: futureDate(cfg.sessionMaxAgeDays),
		userId,
	}).returning()

	// Drop anything already expired, then trim the user back to their session budget.
	await db.delete(schema.session).where(lt(schema.session.expires, new Date()))

	const sessions = await db.query.session.findMany({
		where: { userId },
		orderBy: { expires: 'asc' },
		columns: { token: true },
	})

	for (const session of sessions.slice(0, -cfg.maxSessionsPerUser)) {
		await db.delete(schema.session).where(eq(schema.session.token, session.token))
	}

	cookies.set('session_token', newSession!.token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: newSession!.expires,
	})
}
