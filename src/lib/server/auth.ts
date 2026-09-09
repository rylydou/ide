import { cfg } from '$lib'
import type { UserSession } from '$lib/types'
import { and, eq, gt, lt, notInArray } from 'drizzle-orm'
import { z } from 'zod'
import { createAuth } from './common/auth'
import { db, schema } from './db'
import { urlId } from './nanoid'


/**
 * A fresh 256-bit signing key per process, generated at startup rather than configured.
 *
 * Nothing needs to survive a restart: access tokens are a cache in front of the `session` table,
 * and a token this process cannot verify simply falls through to the session-token path and gets
 * re-minted. So there is no secret to provision, leak, or rotate — a restart invalidates every
 * outstanding access token, which costs each signed-in user one extra query and nothing else.
 *
 * The tradeoff: **this only works on a single app instance.** Two replicas would each hold a
 * different key and reject each other's access tokens, sending every request down the refresh
 * path. If this ever scales out, move the key back to a shared secret.
 */
const accessTokenSecret = crypto.getRandomValues(new Uint8Array(32))

/**
 * How long a rotated-away session token keeps working.
 *
 * Long enough to cover the in-flight requests of a single page load, short enough that a stolen
 * token is still effectively single-use.
 */
const rotationGrace = 30_000

const graceCutoff = () => new Date(Date.now() - rotationGrace)


export const userSession = createAuth<UserSession>({
	accessTokenCookieKey: cfg.accessTokenCookieKey,
	sessionTokenCookieKey: cfg.sessionTokenCookieKey,

	accessTokenSecret: () => accessTokenSecret,
	accessTokenTimeToLive: cfg.accessTokenTimeToLive,
	sessionTokenTimeToLive: cfg.sessionTokenTimeToLive,
	refreshSessionTokenOnUse: cfg.refreshSessionTokenOnUse,
	rotateSessionTokenOnUse: cfg.rotateSessionTokenOnUse,

	accessTokenSchema: z.object({
		userId: z.number().int(),
		name: z.string(),
		email: z.string(),
		isAdmin: z.boolean(),
	}),

	newSessionToken: () => urlId(30),

	getSession: async (sessionToken) => {
		const session = await db.query.session.findFirst({
			// The expiry check belongs here — nothing in createAuth does it for us.
			// A just-rotated token is still accepted for `rotationGrace`, so a request that
			// loses a rotation race isn't treated as a forged token.
			where: {
				expiresAt: { gt: new Date() },
				OR: [
					{ token: sessionToken },
					{ previousToken: sessionToken, rotatedAt: { gt: graceCutoff() } },
				],
			},
			columns: {},
			with: {
				user: {
					columns: { id: true, name: true, email: true, isAdmin: true },
				},
			},
		})

		if (!session) return null

		return {
			userId: session.user.id,
			name: session.user.name,
			email: session.user.email,
			isAdmin: session.user.isAdmin,
		}
	},

	createSession: async (token, expiresAt, data) => {
		await db.insert(schema.session).values({
			token,
			userId: data.userId,
			expiresAt,
			usedAt: new Date(),
		})

		await pruneSessions(data.userId)
	},

	touchSession: async (sessionToken, expiresAt) => {
		await db.update(schema.session)
			// `expiresAt` is null when the session's expiry should stay put.
			.set({ usedAt: new Date(), ...(expiresAt ? { expiresAt } : {}) })
			.where(eq(schema.session.token, sessionToken))
	},

	rotateSession: async (oldToken, newToken, expiresAt) => {
		// Conditional on `oldToken` still being current, so only one of a batch of concurrent
		// refreshes actually swaps the token.
		const [rotated] = await db.update(schema.session)
			.set({
				token: newToken,
				previousToken: oldToken,
				rotatedAt: new Date(),
				expiresAt,
				usedAt: new Date(),
			})
			.where(eq(schema.session.token, oldToken))
			.returning({ token: schema.session.token })

		if (rotated) return rotated.token

		// Lost the race: a sibling request rotated this token moments ago. Adopt its result
		// instead of signing the user out.
		const winner = await db.query.session.findFirst({
			where: { previousToken: oldToken, rotatedAt: { gt: graceCutoff() } },
			columns: { token: true },
		})

		return winner?.token ?? null
	},

	deleteSession: async (sessionToken) => {
		await db.delete(schema.session).where(eq(schema.session.token, sessionToken))
	},
})


/** Drops expired sessions, then trims the user back to `maxSessionsPerUser` most recent. */
const pruneSessions = async (userId: number) => {
	await db.delete(schema.session).where(lt(schema.session.expiresAt, new Date()))

	const keep = await db.query.session.findMany({
		where: { userId, expiresAt: { gt: new Date() } },
		orderBy: { usedAt: 'desc' },
		limit: cfg.maxSessionsPerUser,
		columns: { token: true },
	})

	await db.delete(schema.session).where(and(
		eq(schema.session.userId, userId),
		notInArray(schema.session.token, keep.map(({ token }) => token)),
	))
}


/** Every live session for a user, for a "signed in on N devices" view or a force-logout. */
export const listSessions = async (userId: number) => await db.query.session.findMany({
	where: { userId, expiresAt: { gt: new Date() } },
	orderBy: { usedAt: 'desc' },
	columns: { token: true, usedAt: true, expiresAt: true },
})


/**
 * Revokes every session for a user. Access tokens already issued stay valid for up to
 * `accessTokenTimeToLive`, so this is not instant — see the note in ./common/auth.ts.
 */
export const revokeAllSessions = async (userId: number) =>
	await db.delete(schema.session).where(eq(schema.session.userId, userId))


// `gt` is re-exported so callers composing their own session filters don't reach into drizzle.
export { gt }
