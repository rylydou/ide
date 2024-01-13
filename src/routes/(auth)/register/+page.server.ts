import { error, json, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { z } from 'zod'
import { db, schema } from '$lib/server'
import { eq, ilike } from 'drizzle-orm'
import { nanoid } from '$lib'


export type FormResponse = {
	status: 'ok'
} | {
	status: 'failed'
	message: string
}


export const load: PageServerLoad = async ({ locals, cookies }) => {
	const join_secret = (cookies.get('join-secret') || '').trim()

	const group = join_secret ? await db.query.group.findFirst({
		where: ilike(schema.group.secret, join_secret),
	}) : null

	console.log(group)

	if (!group) {
		console.log('group not found, redirecting to join')
		throw redirect(303, '/join')
	}

	return {
		group,
	}
}


export const actions: Actions = {
	default: async ({ locals, request, cookies, url }) => {
		const data_schema = z.object({
			secret: z.string().min(4).toLowerCase(),
			name: z.string().min(3),
			password: z.string().min(8),
		})

		const form_data = Object.fromEntries(await request.formData())
		const result = await data_schema.safeParseAsync({
			...form_data,
			secret: url.searchParams.get('secret')
		})

		if (!result.success) {
			throw error(400, { message: 'Zod: ' + result.error.message })
		}

		const data = result.data

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
