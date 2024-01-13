import { fail, json, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { z } from 'zod'
import { check, db, schema } from '$lib/server'
import { eq } from 'drizzle-orm'
import { nanoid } from '$lib/server'
import { grant_session, join_group } from '$lib/server/actions'
import { cfg } from '$lib'


export type FormResponse = {
	status: 'ok'
} | {
	status: 'failed'
	message: string
}


export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data_schema = z.object({
			email: z.string().trim().toLowerCase(),
			password: z.string().min(8),
		})


		const form_data = Object.fromEntries(await request.formData())
		const result = await data_schema.safeParseAsync({ ...form_data })

		if (!result.success) {
			return fail(400, {
				message: result.error.message,
			})
		}

		const data = result.data

		if (data.email.indexOf('@') < 0) {
			data.email += cfg.default_email_domain
		}

		const user = await (db.query.user.findFirst({
			where: eq(schema.user.email, data.email),
		}))

		if (!user) {
			return fail(401, {
				message: 'No accounts found with that email',
			})
		}

		const valid_password = await check(data.password, user.password)
		if (valid_password) {
			return fail(401, {
				message: 'Invalid email and/or password',
			})
		}

		grant_session(user.id, cookies)

		const secret = cookies.get('join-secret')
		if (secret) {
			join_group(secret, user.id)
			cookies.delete('join-secret', { path: '/' })
		}

		throw redirect(303, '/')
	},
}
