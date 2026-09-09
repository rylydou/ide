import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'


/**
 * Relations v2: every relation lives here rather than beside its table, and each one is
 * declared once from the side that owns the foreign key. `r.many.x.through(...)` collapses
 * the `users_to_groups` junction, so a class's members are reachable as `group.users`
 * instead of walking `usersToGroups` in every query.
 */
export const relations = defineRelations(schema, (r) => ({
	user: {
		projects: r.many.project(),
		sessions: r.many.session(),
		groups: r.many.group({
			from: r.user.id.through(r.usersToGroups.userId),
			to: r.group.id.through(r.usersToGroups.groupId),
		}),
	},

	project: {
		author: r.one.user({
			from: r.project.authorId,
			to: r.user.id,
			optional: false,
		}),
	},

	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
			optional: false,
		}),
	},

	group: {
		users: r.many.user({
			from: r.group.id.through(r.usersToGroups.groupId),
			to: r.user.id.through(r.usersToGroups.userId),
		}),
	},
}))
