import { db, schema } from '$lib/server'
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
	default: async ({ locals, request, cookies, }) => {
		const form_schema = z.object({
			secret: z.string().toLowerCase(),
		})

		const form_data = await request.formData()
		const result = await form_schema.safeParseAsync(Object.fromEntries(form_data.entries()))

		if (!result.success) {
			return fail(400, {
				message: 'Invalid schema format',
			})
		}

		const data = result.data

		const group = await db.query.group.findFirst({
			where: eq(schema.group.secret, data.secret),
			columns: { id: true, }
		})

		if (!group) {
			return fail(401, {
				message: 'Invalid secret code',
			})
		}

		if (!locals.session) {
			cookies.set('join_secret', data.secret, {
				path: '/',
				secure: true,
				sameSite: 'lax',
			})
			throw redirect(303, `/register`)
		}

		throw redirect(303, '/')
	},
}
