# IDE

A browser-based HTML/CSS/JS editor for classrooms. Students join a class with a code, write
code in a Monaco editor with a live preview, and share the result with a public link.

Built with SvelteKit 5 (runes) on Bun, with a self-hosted Postgres database. It runs entirely
from `docker compose` — no serverless platform and no hosted database.

## Running it

Copy `.env.example` to `.env` and fill in `POSTGRES_PASSWORD`, `ADMIN_SECRET`, and `ORIGIN`,
then:

```bash
docker compose up -d --build
```

The app listens on `:3000` and applies pending migrations on start. `ORIGIN` **must** match the
public URL exactly, or form submissions fail SvelteKit's CSRF check. TLS is out of scope here —
terminate it at whatever reverse proxy sits in front.

The `db` service keeps its data in the `pgdata` volume. It has no backup story yet; set one up
before this becomes the system of record.

### First admin

Sign up at `/register/admin` with the `ADMIN_SECRET`. Admins can create classes, edit them, and
see join codes.

## Developing

```bash
bun install
docker compose up -d db      # Postgres only
bun run db:migrate
bun run dev
```

| Script | What it does |
| --- | --- |
| `bun run dev` | Vite dev server on `:5173` |
| `bun run build` / `bun run start` | Production build, then serve it with `Bun.serve` |
| `bun run check` | `svelte-check` — should stay at zero errors |
| `bun run db:generate` | Generate a migration from schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:studio` | Drizzle Studio (needs the `db` port published) |

Everything runs under Bun, including Vite (`bun --bun`), because the server code uses Bun APIs
directly: `Bun.SQL` for Postgres, `Bun.password` for hashing, and Bun's built-in `.env` loading.

## Migrating from the old Turso database

The previous deployment stored data in Turso (libSQL/SQLite). To move it across, set `DB_URL`
and `DB_TOKEN` alongside the new `DATABASE_URL` and run:

```bash
bun run db:migrate
bun run db:import-turso
```

The import refuses to write anything until the source data satisfies the new schema — the old
SQLite database enforced neither foreign keys nor unique emails, and silently dropping a row
would orphan that user's projects. If it reports duplicate emails, either fix them upstream or
re-run with `--fix`, which keeps the oldest account on the original address and suffixes the
newer ones so no account or project is lost.

Sessions are not carried over, so everyone signs in once more. Passwords are: existing bcrypt
hashes keep working and are re-hashed to argon2id on next login.

## Conventions

TypeScript identifiers are `camelCase`; database columns are `snake_case`, derived automatically
from the schema keys by `pgTableCreator(..., 'snake_case')` in `src/lib/server/db/schema/shared.ts`.
Nothing in the schema spells a column name out by hand.

Relations live in one place — `src/lib/server/db/relations.ts` — using Drizzle's Relations v2
`defineRelations`. `group.users` and `user.groups` reach *through* the `users_to_groups` junction,
so queries never mention it. Filters use the v2 object syntax (`where: { authorId: user.id }`)
rather than `eq(...)`, and a class's access check is expressed as a filter on the related users.

## Authentication

Two tokens, both `httpOnly` cookies:

- **`session_token`** — a 30-char opaque string with a row in the `session` table. The only
  revocable credential, and the only thing a database lookup can invalidate.
- **`access_token`** — a short-lived HS256 JWT (signed with [jose](https://github.com/panva/jose),
  on Web Crypto) carrying the session payload, so an ordinary request from a signed-in user needs
  no query at all. When it expires, the session token mints a new one.

The generic factory is [src/lib/server/common/auth.ts](src/lib/server/common/auth.ts); this app's
instance is [src/lib/server/auth.ts](src/lib/server/auth.ts), and [hooks.server.ts](src/hooks.server.ts)
puts the result on `locals.session`.

Tunables live in [src/lib/config.ts](src/lib/config.ts). Session tokens rotate on every refresh, so a
stolen one is single-use, and each user keeps at most `maxSessionsPerUser` live sessions. A
rotated-away token keeps working for 30 seconds (`rotationGrace`) — without that, two requests
racing to refresh the same expired access token would sign the loser out, which happens in bursts
on every restart.

**There is no JWT secret to configure.** The signing key is 32 random bytes generated at startup.
Access tokens are only a cache in front of the `session` table, so a restart invalidates them all
and costs each signed-in user one extra query — nobody is signed out. This does mean the app must
run as a **single instance**; two replicas would reject each other's access tokens. Scaling out
means moving the key to a shared secret.

Because access tokens are self-contained, revoking a session server-side does not take effect
until the outstanding token expires — `accessTokenTimeToLive` (15m) is the worst-case revocation
delay. Shorten it if that matters more than the saved queries.

## Notes

- The live preview runs student code in an iframe with `sandbox="allow-scripts …"` and **no**
  `allow-same-origin`, so it gets an opaque origin and cannot reach the parent page, its
  cookies, or its storage.
- Share links use an unguessable `share_slug`, not the sequential project id.
- Projects are capped at `cfg.max_payload_length` characters, enforced server-side.
