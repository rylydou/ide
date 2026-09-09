import { cfg } from '$lib'
import { db, encrypt, schema } from '$lib/server'
import { userSession } from '$lib/server/auth'
import { joinGroup } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { Actions, PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ cookies }) => {
	const joinSecret = (cookies.get('join_secret') ?? '').trim()

	const group = joinSecret
		? await db.query.group.findFirst({
			where: { secret: joinSecret },
			columns: { id: true, name: true },
		})
		: null

	if (!group) redirect(303, '/join')

	return { group }
}


const dataSchema = z.object({
	email: z.string().trim().toLowerCase().min(1, 'An email is required'),
	name: z.string().trim().min(3, 'Your name must be at least 3 characters long'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})


export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const secret = cookies.get('join_secret')
		if (!secret) redirect(303, '/join')

		const result = dataSchema.safeParse(Object.fromEntries(await request.formData()))
		if (!result.success) {
			return fail(400, { message: result.error.issues[0]!.message })
		}

		const data = result.data
		if (!data.email.includes('@')) data.email += cfg.defaultEmailDomain

		const group = await db.query.group.findFirst({
			where: { secret },
			columns: { id: true },
		})

		if (!group) {
			return fail(401, { message: 'Invalid secret code' })
		}

		const existing = await db.query.user.findFirst({
			where: { email: data.email },
			columns: { id: true },
		})

		if (existing) {
			return fail(409, { message: 'An account with that email already exists. Try logging in.' })
		}

		const [newUser] = await db.insert(schema.user).values({
			name: data.name,
			email: data.email,
			password: await encrypt(data.password),
		}).returning()

		cookies.delete('join_secret', { path: '/' })
		await userSession.grant(cookies, {
			userId: newUser!.id,
			name: newUser!.name,
			email: newUser!.email,
			isAdmin: newUser!.isAdmin,
		})
		await joinGroup(secret, newUser!.id)

		redirect(303, '/')
	},
}
