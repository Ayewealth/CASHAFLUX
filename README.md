# Fullstack Template

A single-repo full-stack SaaS starter.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript |
| Backend | Express + TypeScript |
| ORM | Drizzle ORM + drizzle-zod |
| Database | PostgreSQL |
| Auth | Better Auth (email/password) |
| Object storage | MinIO (S3-compatible) |
| Email (dev) | Mailpit |
| Deploy | Coolify via Nixpacks |

## Project structure

```
.
├── client/src/          # React frontend
├── server/src/          # Express backend
│   ├── index.ts         # Entry point
│   ├── vite.ts          # Dev: Vite middleware setup
│   ├── static.ts        # Prod: static file serving
│   ├── auth.ts          # Better Auth config
│   ├── env.ts           # Environment variables
│   └── db/client.ts     # Drizzle client
├── shared/
│   └── schema.ts        # Drizzle tables + Zod schemas + inferred types
├── index.html           # Vite entry point
├── vite.config.ts
├── tsconfig.json        # Single config for all three areas
├── drizzle.config.ts
└── docker-compose.yml
```

## Local development

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment**

```bash
cp .env.example .env
# Set BETTER_AUTH_SECRET to a random string:
openssl rand -base64 32
```

**3. Start local infrastructure**

```bash
docker compose up -d
```

Services started:
- PostgreSQL on `localhost:5432`
- MinIO on `localhost:9000` (console at `localhost:9001`)
- Mailpit SMTP on `localhost:1025` (web UI at `localhost:8025`)

**4. Push the database schema**

```bash
pnpm db:push
```

> Better Auth creates its own tables automatically on first request.
> To generate the Better Auth schema for Drizzle (recommended):
> ```bash
> npx better-auth generate
> ```
> Then add the output to `shared/schema.ts`.

**5. Start the dev server**

```bash
pnpm dev
```

A single Express process starts on `http://localhost:3000`. Vite runs as middleware inside
it, so there is no second port, no proxy, and HMR works out of the box.

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start everything (one process) |
| `pnpm build` | Build client to `dist/client/` |
| `pnpm start` | Run the server in production mode |
| `pnpm db:push` | Push Drizzle schema to the database |
| `pnpm db:studio` | Open Drizzle Studio |

## Shared types and validation

`shared/schema.ts` is the single source of truth for data shapes:

```ts
// Define the table once
export const posts = pgTable('posts', { … })

// Derive Zod schema for request validation (server)
export const insertPostSchema = createInsertSchema(posts)
export type InsertPost = z.infer<typeof insertPostSchema>

// Derive TypeScript type for client state
export type Post = typeof posts.$inferSelect
```

Import anywhere with the `@shared/*` alias:

```ts
import type { Post } from '@shared/schema'               // client
import { insertPostSchema } from '@shared/schema'        // server
```

## Production architecture

In production (`NODE_ENV=production`), Express serves `dist/client/` as static files and
falls back to `index.html` for all non-API routes. There is no separate Vite process.

```
pnpm build   → dist/client/  (Vite build)
pnpm start   → tsx server/src/index.ts  (Express, port 3000)
```

## Deploying to Coolify

1. Push this repo to GitHub/GitLab.
2. Create a new **Nixpacks** service in Coolify pointing at the repo.
3. Coolify detects `package.json`, runs `pnpm build`, then `tsx server/src/index.ts`.
4. Add all variables from `.env.example` in the Coolify environment panel.
5. Attach a PostgreSQL service and set `DATABASE_URL`.

No `Dockerfile` needed — Nixpacks handles it via the root `build` and `start` scripts.

## Auth

Better Auth is mounted at `/api/auth/*`. To use it in the client:

```ts
import { createAuthClient } from 'better-auth/client'

const authClient = createAuthClient({ baseURL: '/api/auth' })
```

Only email/password is enabled by default. Add providers in `server/src/auth.ts`.

## Adding packages

```bash
pnpm add <package>        # runtime dependency
pnpm add -D <package>     # dev dependency
```
