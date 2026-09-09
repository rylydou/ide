/**
 * What a signed-in request knows about its user without hitting the database.
 *
 * Kept deliberately small: every field here is duplicated into a signed token that stays valid
 * for `cfg.accessTokenTimeToLive`, so anything that must be up-to-the-second (or is large, or is
 * secret) belongs in a query instead. Note there are no `Date` fields — JSON has no date type,
 * so a `Date` would come back out of the token as a string.
 */
export type UserSession = {
	userId: number
	name: string
	email: string
	isAdmin: boolean
}
