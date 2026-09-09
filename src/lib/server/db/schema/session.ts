import { index } from 'drizzle-orm/pg-core'
import { ref, str, table, timestamp } from './shared'
import { user } from './user'


export const session = table('session', {
	token: str(30).notNull().primaryKey(),
	userId: ref().notNull().references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp().notNull(),
	/** Last time this session minted an access token. */
	usedAt: timestamp().notNull(),
	/**
	 * The token this session held before its last rotation, honoured for a short grace period.
	 * Without it, two requests racing to refresh the same expired access token would leave the
	 * loser holding a token that no longer exists — i.e. signed out. See `rotationGrace`.
	 */
	previousToken: str(30),
	rotatedAt: timestamp(),
}, (t) => [
	index('session-user_id').on(t.userId),
	index('session-expires_at').on(t.expiresAt),
	index('session-previous_token').on(t.previousToken),
])
