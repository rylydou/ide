import { cfg } from '$lib'
import { check, db, schema } from '$lib/server'
import { grant_session, join_group } from '$lib/server/actions'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Actions } from './$types'


export type FormResponse = {
	status: 'ok'
} | {
	status: 'failed'
	message: string
}


export const actions: Actions = {
	default: async ({ request, cookies }) => {
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

		await grant_session(user.id, cookies)

		const secret = cookies.get('join_secret')
		if (secret) {
			cookies.delete('join_secret', { path: '/' })
			await join_group(secret, user.id)
		}

		throw redirect(303, '/')
	},
}
