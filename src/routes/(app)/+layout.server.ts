import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'


export const load: LayoutServerLoad = async ({ url, locals, cookies }) => {
	const session = locals.session

	if (!session?.user) {
		cookies.set('continue_to', url.pathname + url.search, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 30,
		})
		redirect(303, '/join')
	}

	return { session }
}
