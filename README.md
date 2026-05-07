# Fullstack Template

<details>
<summary>Prompt to recreate this template</summary>

```
Use the following framework and wiring conventions. Apply them to any new or existing repo.

## Stack
Single-repo (no monorepo tooling). Frontend: Vite + React + TypeScript in client/src/. Backend: Express + TypeScript in server/src/. Shared types and Drizzle schemas in shared/. ORM: Drizzle with postgres-js. Auth: Better Auth wired into Express with the Drizzle adapter. Email: Resend. Object storage: Cloudflare R2. Local dev infra only: Docker Compose with Postgres (no app service — the server always runs on the host).

## Architecture rules
- Single dev process: Vite runs as Express middleware in development (middlewareMode: true, no separate Vite port, no proxy). In production, Express serves the Vite static build from dist/client/ with a SPA fallback. API routes are under /api.
- Root build script runs vite build only. The start script runs the server with tsx: tsx server/src/index.ts (no server build step).
- server/src/index.ts branches on NODE_ENV: production calls serveStatic(app), development does const { setupVite } = await import('./vite') then setupVite(httpServer, app).
- server/src/vite.ts exports setupVite(httpServer, app) — creates a Vite dev server in middleware mode, mounts vite.middlewares on Express, and adds a catch-all that transforms and serves index.html.
- server/src/static.ts exports serveStatic(app) — express.static on dist/client/ plus a catch-all for index.html.
- Single tsconfig.json at the root covering client/src/, server/src/, and shared/. moduleResolution: bundler. Path alias @shared/* → ./shared/*.
- vite.config.ts at the root: @vitejs/plugin-react, resolve.alias for @shared, outDir: dist/client. No proxy config.
- index.html at the root. Script src points to /client/src/main.tsx.
- server/src/env.ts loads dotenv and exports a typed env object with required() and optional() helpers. Document all vars in .env.example.
- Drizzle config at root pointing at shared/schema.ts. Include db:push and db:studio scripts.
- Better Auth configured with the Drizzle adapter, basePath: /api/auth. Mounted in Express with app.all('/api/auth/*', toNodeHandler(auth)).
- shared/schema.ts uses drizzle-zod: for each Drizzle table, call createInsertSchema(table) and export the Zod schema plus inferred types (InsertX via z.infer, X via $inferSelect). This is the single source of truth — server validates with Zod, client imports the TypeScript types via @shared/*.
- Docker Compose for local dev only (no app service — server runs on the host). Include Postgres with a named volume and healthcheck. Use Cloudflare R2 for object storage and Resend for email instead of local service emulators.
- Nixpacks-compatible: root package.json has build and start scripts, no Dockerfile needed.
```

</details>

A single-repo full-stack SaaS starter.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript |
| Backend | Express + TypeScript |
| ORM | Drizzle ORM + drizzle-zod |
| Database | PostgreSQL |
| Auth | Better Auth (email/password) |
| Object storage | Cloudflare R2 |
| Email | Resend |
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

Object storage should use Cloudflare R2. When adding object storage, add the R2 credentials your implementation needs to `.env`.
Email is sent through Resend. When adding email sending, set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`.

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
