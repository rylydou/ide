import type { Cookies } from '@sveltejs/kit'
import { db, schema, url_id } from '..'


export const grant_session = async (user_id: number, cookies: Cookies) => {
	const expires = new Date()
	expires.setUTCDate(expires.getUTCDate() + 30)
	const new_session = (await db.insert(schema.session).values({
		token: url_id(32),
		expires,
		user_id,
	}).returning())[0]

	cookies.set('session_id', new_session.token, {
		path: '/',
		secure: true,
		sameSite: 'lax',
		expires: new_session.expires,
	})
}
