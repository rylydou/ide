import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'


export const load: LayoutServerLoad = async ({ locals }) => {
	const session = locals.session
	if (!session?.user) {
		throw redirect(303, '/join')
	}
	return { session, }
}
