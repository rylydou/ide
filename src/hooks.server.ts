import { userSession } from '$lib/server/auth'
import type { Handle } from '@sveltejs/kit'


export const handle: Handle = async ({ event, resolve }) => {
	// Verifies the access token, or mints a new one from the session token. Only the second
	// path touches the database, so most requests resolve without a query.
	event.locals.session = await userSession.getAndRefresh(event.cookies) ?? undefined

	return await resolve(event)
}
