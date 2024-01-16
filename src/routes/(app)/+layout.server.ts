import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'


export const load: LayoutServerLoad = async ({ url, locals, cookies }) => {
	const session = locals.session
	if (!session?.user) {
		cookies.set('continue_to', url.toString(), {
			path: '/',
			sameSite: 'lax',
			secure: true,
		})
		throw redirect(303, '/join')
	}

	return {
		session,
	}
}
