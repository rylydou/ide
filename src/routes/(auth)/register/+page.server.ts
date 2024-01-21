import { error, fail, json, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { z } from 'zod'
import { db, encrypt, schema } from '$lib/server'
import { eq, ilike } from 'drizzle-orm'
import { grant_session, join_group } from '$lib/server/actions'
import { cfg } from '$lib'


export const load: PageServerLoad = async ({ cookies }) => {
	const join_secret = (cookies.get('join_secret') || '').trim()

	const group = join_secret ? await db.query.group.findFirst({
		where: eq(schema.group.secret, join_secret),
	}) : null

	if (!group) {
		throw redirect(303, '/join')
	}

	return {
		group,
	}
}


export const actions: Actions = {
	default: async ({ request, cookies, }) => {
		const data_schema = z.object({
			secret: z.string().trim().toLowerCase().min(6).max(6),
			email: z.string().trim().toLowerCase(),
			name: z.string().min(3),
			password: z.string().min(8),
		})

		const secret = cookies.get('join_secret')
		if (!secret) {
			throw redirect(303, '/join')
		}

		const form_data = Object.fromEntries(await request.formData())
		const result = await data_schema.safeParseAsync({
			...form_data,
			secret,
		})

		if (!result.success) {
			return fail(400, {
				message: result.error.errors[0].message,
			})
		}

		const data = result.data

		if (data.email.indexOf('@') < 0) {
			data.email += cfg.default_email_domain
		}

		const group = db.query.group.findFirst({
			where: eq(schema.group.secret, data.secret)
		})

		if (!group) {
			return fail(401, {
				message: 'Invalid secret code',
			})
		}

		const encrypted_password = await encrypt(data.password)
		const new_user = (await db.insert(schema.user).values({
			name: data.name,
			email: data.email,
			password: encrypted_password,
		}).returning())[0]

		cookies.delete('join_secret', { path: '/' })
		await grant_session(new_user.id, cookies)
		await join_group(data.secret, new_user.id)

		throw redirect(303, '/')
	},
}
