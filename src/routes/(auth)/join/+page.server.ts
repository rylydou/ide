import { fail, json, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { z } from 'zod'
import { db, schema } from '$lib/server'
import { eq } from 'drizzle-orm'


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
				message: 'Invalid schema format'
			})
		}

		const data = result.data

		const group = await db.query.group.findFirst({
			where: eq(schema.group.secret, data.secret),
			columns: { id: true, }
		})

		if (!group) {
			return fail(401, {
				message: 'Invalid secret code'
			})
		}

		if (!locals.session) {
			console.log('redirecting to register')
			cookies.set('join-secret', data.secret, {
				path: '/',
				secure: true,
				sameSite: 'lax',
			})
			throw redirect(303, `/register`)
		}

		console.log('redirecting to home')
		throw redirect(303, '/')
	},
}
