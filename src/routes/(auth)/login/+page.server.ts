import { cfg } from '$lib'
import { check, db, encrypt, needsRehash, schema } from '$lib/server'
import { userSession } from '$lib/server/auth'
import { joinGroup } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Actions } from './$types'


const dataSchema = z.object({
	email: z.string().trim().toLowerCase().min(1, 'An email is required'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})


export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const result = dataSchema.safeParse(Object.fromEntries(await request.formData()))

		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const data = result.data
		if (!data.email.includes('@')) data.email += cfg.defaultEmailDomain

		const user = await db.query.user.findFirst({ where: { email: data.email } })

		if (!user) {
			return fail(401, { message: 'No accounts found with that email' })
		}

		if (!await check(data.password, user.password)) {
			return fail(401, { message: 'Invalid email and/or password' })
		}

		// Legacy bcrypt hashes are upgraded to argon2id the first time they're used.
		if (needsRehash(user.password)) {
			await db.update(schema.user)
				.set({ password: await encrypt(data.password) })
				.where(eq(schema.user.id, user.id))
		}

		await userSession.grant(cookies, {
			userId: user.id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
		})

		const secret = cookies.get('join_secret')
		if (secret) {
			cookies.delete('join_secret', { path: '/' })
			await joinGroup(secret, user.id)
		}

		redirect(303, '/')
	},
}
