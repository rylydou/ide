import { userSession } from '$lib/server/auth'
import { redirect, type Actions } from '@sveltejs/kit'


// POST-only: a GET-triggered logout can be fired by any third-party <img> tag.
export const actions: Actions = {
	default: async ({ cookies }) => {
		await userSession.deleteUsingCookie(cookies)
		redirect(303, '/login')
	},
}
