import { env } from '$env/dynamic/private'
import { db, encrypt, schema } from '$lib/server'
import { grant_session } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Actions } from './$types'


const data_schema = z.object({
	secret: z.string(),
	email: z.string().trim().toLowerCase().min(1, 'An email is required'),
	name: z.string().trim().min(3, 'Your name must be at least 3 characters long'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})


export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const result = data_schema.safeParse(Object.fromEntries(await request.formData()))

		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const data = result.data

		// Constant-time compare so the admin secret can't be probed by timing.
		const admin_secret = env.ADMIN_SECRET ?? ''
		const valid = admin_secret.length > 0
			&& data.secret.length === admin_secret.length
			&& timingSafeEqual(Buffer.from(data.secret), Buffer.from(admin_secret))

		if (!valid) {
			return fail(401, { message: 'Invalid secret code' })
		}

		const existing = await db.query.user.findFirst({
			where: eq(schema.user.email, data.email),
			columns: { id: true },
		})

		if (existing) {
			return fail(409, { message: 'An account with that email already exists.' })
		}

		const [new_user] = await db.insert(schema.user).values({
			name: data.name,
			email: data.email,
			password: await encrypt(data.password),
			is_admin: true,
		}).returning()

		cookies.delete('join_secret', { path: '/' })
		await grant_session(new_user!.id, cookies)

		redirect(303, '/')
	},
}
