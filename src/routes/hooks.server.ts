import { db, schema } from '$lib/server'
import type { Handle, MaybePromise, RequestEvent } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'


export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = null

	const session_token = event.cookies.get('session_token')
	if (!session_token) {
		return await resolve(event)
	}

	const session = await db.query.session.findFirst({ where: eq(schema.session.token, session_token) })
	if (!session) {
		event.locals.session = null
		return await resolve(event)
	}

	const user = await db.query.user.findFirst({ where: eq(schema.session.token, session_token) })
	if (!user) {
		event.locals.session = null
		return await resolve(event)
	}

	event.cookies.set('session_token', session?.token, {
		path: '/',
		sameSite: 'lax',
		secure: true,
		maxAge: 34560000,
	})

	event.locals.session = {
		token: session.token,
		expires: session.expires,
		user: {
			id: user.id,
			name: user.name,
		}
	}

	return await resolve(event)
}
