# syntax=docker/dockerfile:1

FROM oven/bun:1.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
# All secrets are read through $env/dynamic/private at runtime, so the build needs none.
RUN bun run build

FROM oven/bun:1.4-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY scripts/migrate.ts ./scripts/migrate.ts
USER bun
EXPOSE 3000
CMD ["sh", "-c", "bun scripts/migrate.ts && bun ./build/index.js"]
