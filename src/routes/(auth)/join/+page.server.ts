import { db, fix_ambiguous, schema } from '$lib/server'
import { join_group } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Actions } from './$types'


const form_schema = z.object({
	secret: z.string().transform(fix_ambiguous).refine((s) => s.length >= 4, 'Join code is too short'),
})


export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const result = form_schema.safeParse(Object.fromEntries(await request.formData()))

		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const { secret } = result.data

		const group = await db.query.group.findFirst({
			where: eq(schema.group.secret, secret),
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

		await join_group(secret, session.user.id)
		redirect(303, '/')
	},
}
