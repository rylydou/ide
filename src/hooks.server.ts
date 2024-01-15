import { db, schema } from '$lib/server'
import type { Handle } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'


export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = null

	const session_token_schema = z.string().length(30, 'invalid session token length')
	const session_token_result = await session_token_schema.safeParseAsync(event.cookies.get('session_token'))
	if (!session_token_result.success) {
		event.cookies.delete('session_token', { path: '/' })
		return await resolve(event)
	}

	const session_token = session_token_result.data

	// find session
	const session = await db.query.session.findFirst({ where: eq(schema.session.token, session_token) })
	if (!session) {
		return await resolve(event)
	}

	// check if session is expired
	if (session.expires < new Date()) {
		return await resolve(event)
	}

	// find user assigned to session
	const user = await db.query.user.findFirst({ where: eq(schema.user.id, session.user_id) })
	if (!user) {
		return await resolve(event)
	}

	event.locals.session = {
		token: session.token,
		expires: session.expires,
		user: {
			id: user.id,
			name: user.name,
			is_admin: user.role === 'admin',
		},
	}

	return await resolve(event)
}
