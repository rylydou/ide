import { error, fail, json, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { z } from 'zod'
import { db, encrypt, schema } from '$lib/server'
import { eq, ilike } from 'drizzle-orm'
import { grant_session, join_group } from '$lib/server/actions'


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
				message: result.error.message
			})
		}

		const data = result.data

		const group = db.query.group.findFirst({
			where: eq(schema.group.secret, data.secret)
		})

		if (!group) {
			return fail(401, {
				message: 'Invalid secret code'
			})
		}

		const encrypted_password = await encrypt(data.password)
		const new_user = (await db.insert(schema.user).values({
			name: data.name,
			email: data.email,
			password: encrypted_password,
		}).returning())[0]

		grant_session(new_user.id, cookies)
		join_group(data.secret, new_user.id)
		cookies.delete('join-secret', { path: '/' })

		throw redirect(303, '/')
	},
}
