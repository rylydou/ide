import { db, fixAmbiguous } from '$lib/server'
import { joinGroup } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { Actions } from './$types'


const formSchema = z.object({
	secret: z.string().transform(fixAmbiguous).refine((s) => s.length >= 4, 'Join code is too short'),
})


export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const result = formSchema.safeParse(Object.fromEntries(await request.formData()))

		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const { secret } = result.data

		const group = await db.query.group.findFirst({
			where: { secret },
			columns: { id: true },
		})

		if (!group) {
			return fail(401, { message: 'Invalid secret code' })
		}

		const session = locals.session
		if (!session) {
			cookies.set('join_secret', secret, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 30,
			})
			redirect(303, '/register')
		}

		await joinGroup(secret, session.user.id)
		redirect(303, '/')
	},
}
