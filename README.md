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

## Notes

- The live preview runs student code in an iframe with `sandbox="allow-scripts …"` and **no**
  `allow-same-origin`, so it gets an opaque origin and cannot reach the parent page, its
  cookies, or its storage.
- Share links use an unguessable `share_slug`, not the sequential project id.
- Projects are capped at `cfg.max_payload_length` characters, enforced server-side.
