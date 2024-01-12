import type { Handle } from '@sveltejs/kit'


export const handle: Handle = async ({ event, resolve }) => {
	event.cookies.get('sessionid')
	event.locals.user = await getUserInformation()
	const response = await resolve(event); response.headers.set('x-custom-header', 'potato')
	return response
}
