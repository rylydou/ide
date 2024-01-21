import { db, schema } from '$lib/server'
import type { Handle } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'


export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = undefined

	const session_token_schema = z.string().length(30, 'invalid session token length')
	const session_token_result = await session_token_schema.safeParseAsync(event.cookies.get('session_token'))
	if (!session_token_result.success) {
		event.cookies.delete('session_token', { path: '/' })
		return await resolve(event)
	}

	const session_token = session_token_result.data

	// find session
	const session = await db.query.session.findFirst({
		where: eq(schema.session.token, session_token),
		with: {
			user: {
				columns: {
					password: false,
				},
			},
		},
	})
	if (!session) {
		return await resolve(event)
	}

	// check if session is expired
	if (session.expires < new Date()) {
		return await resolve(event)
	}

	event.locals.session = {
		token: session.token,
		expires: session.expires,
		user: {
			...session.user,
		},
	}

	return await resolve(event)
}
