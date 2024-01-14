import { ADMIN_SECRET } from '$env/static/private'
import { db, encrypt, schema } from '$lib/server'
import { grant_session, join_group } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { Actions } from './$types'


export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data_schema = z.object({
			secret: z.string(),
			email: z.string().trim().toLowerCase(),
			name: z.string().min(3),
			password: z.string().min(8),
		})

		const form_data = Object.fromEntries(await request.formData())
		const result = await data_schema.safeParseAsync({ ...form_data, })

		if (!result.success) {
			return fail(400, {
				message: result.error.message,
			})
		}

		const data = result.data

		if (data.secret !== ADMIN_SECRET) {
			return fail(401, {
				message: 'Invalid secret code',
			})
		}

		const encrypted_password = await encrypt(data.password)
		const new_user = (await db.insert(schema.user).values({
			name: data.name,
			email: data.email,
			password: encrypted_password,
			role: 'admin',
			projects: [],
		}).returning())[0]

		cookies.delete('join_secret', { path: '/' })
		await grant_session(new_user.id, cookies)
		await join_group(data.secret, new_user.id)

		throw redirect(303, '/')
	},
}
