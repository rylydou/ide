import { cfg } from '$lib'
import { db, encrypt, schema } from '$lib/server'
import { grant_session, join_group } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Actions, PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ cookies }) => {
	const join_secret = (cookies.get('join_secret') ?? '').trim()

	const group = join_secret
		? await db.query.group.findFirst({
			where: eq(schema.group.secret, join_secret),
			columns: { id: true, name: true },
		})
		: null

	if (!group) redirect(303, '/join')

	return { group }
}


const data_schema = z.object({
	email: z.string().trim().toLowerCase().min(1, 'An email is required'),
	name: z.string().trim().min(3, 'Your name must be at least 3 characters long'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})


export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const secret = cookies.get('join_secret')
		if (!secret) redirect(303, '/join')

		const result = data_schema.safeParse(Object.fromEntries(await request.formData()))
		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const data = result.data
		if (!data.email.includes('@')) data.email += cfg.default_email_domain

		const group = await db.query.group.findFirst({
			where: eq(schema.group.secret, secret),
			columns: { id: true },
		})

		if (!group) {
			return fail(401, { message: 'Invalid secret code' })
		}

		const existing = await db.query.user.findFirst({
			where: eq(schema.user.email, data.email),
			columns: { id: true },
		})

		if (existing) {
			return fail(409, { message: 'An account with that email already exists. Try logging in.' })
		}

		const [new_user] = await db.insert(schema.user).values({
			name: data.name,
			email: data.email,
			password: await encrypt(data.password),
		}).returning()

		cookies.delete('join_secret', { path: '/' })
		await grant_session(new_user!.id, cookies)
		await join_group(secret, new_user!.id)

		redirect(303, '/')
	},
}
