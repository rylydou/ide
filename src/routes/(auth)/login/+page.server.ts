import { cfg } from '$lib'
import { check, db, encrypt, needs_rehash, schema } from '$lib/server'
import { grant_session, join_group } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Actions } from './$types'


const data_schema = z.object({
	email: z.string().trim().toLowerCase().min(1, 'An email is required'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})


export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const result = data_schema.safeParse(Object.fromEntries(await request.formData()))

		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const data = result.data
		if (!data.email.includes('@')) data.email += cfg.default_email_domain

		const user = await db.query.user.findFirst({
			where: eq(schema.user.email, data.email),
		})

		if (!user) {
			return fail(401, { message: 'No accounts found with that email' })
		}

		if (!await check(data.password, user.password)) {
			return fail(401, { message: 'Invalid email and/or password' })
		}

		// Legacy bcrypt hashes are upgraded to argon2id the first time they're used.
		if (needs_rehash(user.password)) {
			await db.update(schema.user)
				.set({ password: await encrypt(data.password) })
				.where(eq(schema.user.id, user.id))
		}

		await grant_session(user.id, cookies)

		const secret = cookies.get('join_secret')
		if (secret) {
			cookies.delete('join_secret', { path: '/' })
			await join_group(secret, user.id)
		}

		redirect(303, '/')
	},
}
