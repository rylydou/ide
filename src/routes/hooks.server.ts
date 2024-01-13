import { db, schema } from '$lib/server'
import { type Handle } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'


export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = null

	const session_token = event.cookies.get('session_token')
	if (!session_token) {
		return await resolve(event)
	}

	// find session
	const session = await db.query.session.findFirst({ where: eq(schema.session.token, session_token) })
	if (!session) {
		event.locals.session = null
		return await resolve(event)
	}

	// check if session is expired
	if (session.expires < new Date()) {
		event.locals.session = null
		return await resolve(event)
	}

	// find user assigned to session
	const user = await db.query.user.findFirst({ where: eq(schema.user.id, session.user_id) })
	if (!user) {
		event.locals.session = null
		return await resolve(event)
	}

	const expires = new Date()
	expires.setUTCDate(expires.getUTCDate() + 30)
	session.expires = expires
	event.cookies.set('session_token', session?.token, {
		path: '/',
		sameSite: 'lax',
		secure: true,
		expires: session.expires,
	})

	event.locals.session = {
		token: session.token,
		expires: session.expires,
		user: {
			id: user.id,
			name: user.name,
		},
	}

	return await resolve(event)
}
