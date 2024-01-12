import { json, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { z } from 'zod'
import { db, schema } from '$lib/server'
import { eq } from 'drizzle-orm'
import { nanoid } from '$lib'


export type FormResponse = {
	status: 'ok'
} | {
	status: 'failed'
	message: string
}


export const actions: Actions = {
	default: async ({ locals, request, cookies, }) => {
		const data_schema = z.object({
			secret: z.string().min(4).toLowerCase(),
			name: z.string().min(3),
			password: z.string().min(8),
		})

		const form_data = Object.fromEntries(await request.formData())
		const data = data_schema.parse(form_data)

		const group = db.query.group.findFirst({
			where: eq(schema.group.secret, data.secret)
		})

		if (!group) {
			throw json({
				status: 'failed',
				message: 'Invalid secret code',
			} as FormResponse)
		}

		db.insert(schema.user).values({
			name: data.name,
			password: data.password,
		})

		const session = (await db.insert(schema.session).values({
			token: nanoid(),
		}).returning())[0]

		cookies.set('session_id', session.token, {
			maxAge: session.max_age,
			path: '/',
			secure: true,
			sameSite: 'lax',
		})

		throw redirect(303, '/')
	},
}
