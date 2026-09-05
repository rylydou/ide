import { db, schema } from '$lib/server'
import type { Handle } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'


export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = undefined

	const clear = () => event.cookies.delete('session_token', { path: '/' })

	const session_token = event.cookies.get('session_token')
	if (session_token?.length !== 30) {
		if (session_token !== undefined) clear()
		return await resolve(event)
	}

	const session = await db.query.session.findFirst({
		where: eq(schema.session.token, session_token),
		with: {
			user: {
				columns: { password: false },
			},
		},
	})

	if (!session) {
		clear()
		return await resolve(event)
	}

	if (session.expires < new Date()) {
		clear()
		await db.delete(schema.session).where(eq(schema.session.token, session_token))
		return await resolve(event)
	}

	event.locals.session = {
		token: session.token,
		expires: session.expires,
		user: session.user,
	}

	return await resolve(event)
}
