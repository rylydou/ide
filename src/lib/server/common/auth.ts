import type { Cookies } from '@sveltejs/kit'
import { jwtVerify, SignJWT } from 'jose'
import ms from 'ms'
import type { z } from 'zod'


/**
 * Split-token session auth.
 *
 * A long-lived opaque **session token** lives in the database and is the only thing that can be
 * revoked. A short-lived signed **access token** (JWT) carries the session payload so the common
 * case — a request from a signed-in user — needs no database round trip. When the access token
 * expires, the session token mints a new one.
 *
 * Consequence worth knowing: revoking a session server-side does not invalidate an access token
 * that is already in a browser. `accessTokenTimeToLive` *is* your worst-case revocation delay,
 * so keep it short (minutes, not hours).
 */

export type SessionData = Record<string, unknown>

/** Signing algorithm, pinned on both sign and verify so a token cannot choose its own. */
const algorithm = 'HS256'

/** A time span, e.g. `'15m'` or `'30 days'`. Parsed by `ms`. */
export type Duration = ms.StringValue

/** Seconds, floored — both `Set-Cookie` max-age and the `exp` claim must be whole numbers. */
export const durationToSeconds = (duration: Duration) => Math.floor(ms(duration) / 1000)


export type AuthCreateOptions<TSessionData extends SessionData> = {
	// Cookie key names
	accessTokenCookieKey: string
	sessionTokenCookieKey: string

	/**
	 * Returns the HS256 signing key: raw bytes, or a string that will be encoded as UTF-8.
	 *
	 * A function, not a value, so the key is resolved at request time. A module-scope read of a
	 * runtime env var happens during SvelteKit's build-time route analysis, where that variable
	 * does not exist yet — and would bake whatever fallback was there into the build.
	 */
	accessTokenSecret: () => string | Uint8Array
	accessTokenTimeToLive: Duration

	// Session settings
	sessionTokenTimeToLive: Duration
	/** Slide the session's expiry forward every time it mints an access token. */
	refreshSessionTokenOnUse: boolean
	/**
	 * Issue a fresh session token whenever one is used, invalidating the old one.
	 * Costs a write per refresh but makes a stolen session token single-use.
	 */
	rotateSessionTokenOnUse?: boolean

	// Zod schema to validate the decoded JWT payload
	accessTokenSchema: z.ZodType<TSessionData>

	// Generate a new session token string
	newSessionToken: () => string

	/**
	 * Looks up a session by its token and returns the session payload, or null if the session
	 * does not exist **or has expired**. Implementations must check expiry themselves — nothing
	 * else in this module does.
	 */
	getSession: (sessionToken: string) => Promise<TSessionData | null>

	// Creates a new session row.
	createSession: (sessionToken: string, expiresAt: Date, data: TSessionData) => Promise<void>

	/**
	 * Records that a session was used. `expiresAt` is null when the session's expiry should be
	 * left alone (`refreshSessionTokenOnUse: false`) — only the last-used stamp moves.
	 *
	 * Awaited, so a rejection surfaces instead of becoming an unhandled rejection. If you want
	 * this off the request's critical path, resolve immediately and do the write in the
	 * background yourself.
	 */
	touchSession: (sessionToken: string, expiresAt: Date | null) => Promise<void>

	/**
	 * Atomically replaces a session's token, returning the token the client should now hold —
	 * or null if the session is gone. Required when rotating.
	 *
	 * Two requests can race to rotate the same token, which happens in bursts whenever a batch
	 * of access tokens expires together. The one that loses must adopt the winner's token rather
	 * than invent its own, so implementations should make the swap conditional on `oldToken`
	 * still being current and, when it isn't, return whatever token replaced it.
	 */
	rotateSession?: (oldToken: string, newToken: string, expiresAt: Date) => Promise<string | null>

	// Deletes a session by its token.
	deleteSession: (sessionToken: string) => Promise<void>
}

export type AuthOverrides = Partial<
	Pick<AuthCreateOptions<SessionData>, 'accessTokenCookieKey' | 'sessionTokenCookieKey'> & {
		token: string
	}
>

export type Auth<TSessionData extends SessionData> = {
	options: AuthCreateOptions<TSessionData>

	/** Verifies the access token, else refreshes it from the session token. Null if neither holds. */
	getAndRefresh: (cookies: Cookies, overrides?: AuthOverrides) => Promise<TSessionData | null>

	// Creates a new session and sets cookies on the client.
	grant: (cookies: Cookies, data: TSessionData, overrides?: AuthOverrides) => Promise<void>

	// Deletes the session associated with the provided cookies. Returns true if a session row was deleted.
	deleteUsingCookie: (cookies: Cookies, overrides?: AuthOverrides) => Promise<boolean>
}


export const createAuth = <TSessionData extends SessionData>(
	options: AuthCreateOptions<TSessionData>,
): Auth<TSessionData> => {
	if (options.rotateSessionTokenOnUse && !options.rotateSession)
		throw new Error('rotateSessionTokenOnUse requires a rotateSession implementation')

	const keys = (overrides?: AuthOverrides) => ({
		access: overrides?.accessTokenCookieKey ?? options.accessTokenCookieKey,
		session: overrides?.sessionTokenCookieKey ?? options.sessionTokenCookieKey,
	})

	const cookieOptions = (duration: Duration) => ({
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: durationToSeconds(duration),
	}) as const

	/** HS256 takes raw bytes as its key. */
	const signingKey = () => {
		const secret = options.accessTokenSecret()
		return typeof secret === 'string' ? new TextEncoder().encode(secret) : secret
	}

	const expiryDate = (duration: Duration) => new Date(Date.now() + ms(duration))

	/**
	 * Signs the payload nested under `data` so the session's own fields can never collide with
	 * a reserved JWT claim — a payload containing `exp` would otherwise make `jwt.sign` throw.
	 */
	const issueAccessToken = async (cookies: Cookies, key: string, data: TSessionData) => {
		// An absolute epoch second, not a duration string: jose has its own time-span grammar
		// that overlaps `ms`'s without matching it, and one parser is easier to reason about.
		const expiresAt = Math.floor(Date.now() / 1000) + durationToSeconds(options.accessTokenTimeToLive)

		const token = await new SignJWT({ data })
			.setProtectedHeader({ alg: algorithm })
			.setIssuedAt()
			.setExpirationTime(expiresAt)
			.sign(signingKey())

		cookies.set(key, token, cookieOptions(options.accessTokenTimeToLive))
	}

	const readAccessToken = async (token: string): Promise<TSessionData | null> => {
		let payload: { data?: unknown }

		try {
			// jose verifies the signature *and* the `exp`/`nbf` claims, and rejects any token
			// whose header algorithm is not the one we pinned.
			;({ payload } = await jwtVerify(token, signingKey(), { algorithms: [algorithm] }))
		} catch {
			// Expired or tampered with — fall through to the session token.
			return null
		}

		const result = options.accessTokenSchema.safeParse(payload.data)

		return result.success ? result.data : null
	}

	const getAndRefresh = async (cookies: Cookies, overrides?: AuthOverrides): Promise<TSessionData | null> => {
		const key = keys(overrides)

		// Fast path: a valid access token means no database access at all.
		const accessToken = cookies.get(key.access)
		if (accessToken) {
			const data = await readAccessToken(accessToken)
			if (data) return data
		}

		// Slow path: mint a new access token from the session token.
		const sessionToken = overrides?.token ?? cookies.get(key.session)
		if (!sessionToken) return null

		const data = await options.getSession(sessionToken)
		if (!data) {
			// The session is gone or expired; don't leave dead cookies behind.
			cookies.delete(key.session, { path: '/' })
			cookies.delete(key.access, { path: '/' })
			return null
		}

		const extend = options.refreshSessionTokenOnUse
		// Null means "leave the expiry alone". Writing `now + accessTokenTimeToLive` here would
		// silently shorten a 30-day session to one access-token lifetime.
		const expiresAt = extend ? expiryDate(options.sessionTokenTimeToLive) : null

		if (options.rotateSessionTokenOnUse) {
			const nextToken = options.newSessionToken()
			const rotatedExpiry = expiresAt ?? expiryDate(options.sessionTokenTimeToLive)

			const currentToken = await options.rotateSession!(sessionToken, nextToken, rotatedExpiry)
			if (!currentToken) {
				cookies.delete(key.session, { path: '/' })
				cookies.delete(key.access, { path: '/' })
				return null
			}

			cookies.set(key.session, currentToken, cookieOptions(options.sessionTokenTimeToLive))
		} else {
			await options.touchSession(sessionToken, expiresAt)
			if (extend) cookies.set(key.session, sessionToken, cookieOptions(options.sessionTokenTimeToLive))
		}

		await issueAccessToken(cookies, key.access, data)

		return data
	}

	const grant = async (cookies: Cookies, data: TSessionData, overrides?: AuthOverrides): Promise<void> => {
		const key = keys(overrides)

		const token = overrides?.token ?? options.newSessionToken()
		const expiresAt = expiryDate(options.sessionTokenTimeToLive)

		await options.createSession(token, expiresAt, data)

		cookies.set(key.session, token, cookieOptions(options.sessionTokenTimeToLive))

		// Overwrite the access token immediately. Leaving a previous user's still-valid JWT in
		// place would make the very next request resolve as *them*, not as whoever just signed in.
		await issueAccessToken(cookies, key.access, data)
	}

	const deleteUsingCookie = async (cookies: Cookies, overrides?: AuthOverrides): Promise<boolean> => {
		const key = keys(overrides)
		const sessionToken = overrides?.token ?? cookies.get(key.session)

		// Clear cookies first and unconditionally: returning early on a missing session cookie
		// would leave a live access token behind and make logout a no-op for up to its lifetime.
		cookies.delete(key.session, { path: '/' })
		cookies.delete(key.access, { path: '/' })

		if (!sessionToken) return false

		await options.deleteSession(sessionToken)

		return true
	}

	return { options, getAndRefresh, grant, deleteUsingCookie }
}
