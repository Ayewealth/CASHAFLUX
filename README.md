# Fullstack Template

A pnpm monorepo starter for a full-stack SaaS application.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | Vite + React + TypeScript |
| Backend | Express + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | Better Auth (email/password) |
| Object storage | MinIO (S3-compatible) |
| Email (dev) | Mailpit |
| Deploy | Coolify via Nixpacks |

## Project structure

```
.
├── apps/
│   ├── client/          # Vite + React frontend
│   └── server/          # Express backend
├── packages/
│   └── shared/          # Shared TypeScript types
├── dist/
│   └── client/          # Vite build output (git-ignored)
├── docker-compose.yml   # Local dev infrastructure
└── .env.example
```

## Local development

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment**

```bash
cp .env.example .env
# Edit .env — at minimum set BETTER_AUTH_SECRET to a random string:
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

> Better Auth creates its own tables automatically when it first handles a request.
> To generate the Better Auth schema for Drizzle (recommended), run:
> ```bash
> pnpm --filter @template/server exec better-auth generate
> ```
> Then paste the output into `apps/server/src/db/schema.ts`.

**5. Start the dev servers**

```bash
pnpm dev
```

- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:3000`

In development, Vite proxies all `/api` requests to Express, so there is no CORS configuration needed.

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start frontend and backend in watch mode |
| `pnpm build` | Build client to `dist/client/` |
| `pnpm start` | Start the server with tsx (production) |
| `pnpm db:push` | Push Drizzle schema to the database |
| `pnpm db:studio` | Open Drizzle Studio |

## Production architecture

In production, a single Express process:

1. Serves the Vite static build from `dist/client/`
2. Falls back to `dist/client/index.html` for all non-API routes (SPA routing)
3. Handles API requests under `/api`
4. Handles auth requests under `/api/auth`

Build output:

```
dist/
└── client/          <- Vite build (served as static files)
```

Start command (used by Nixpacks): `tsx apps/server/src/index.ts`

## Deploying to Coolify

1. Push this repo to GitHub/GitLab.
2. Create a new **Nixpacks** service in Coolify pointing at the repo.
3. Coolify detects `package.json`, runs `pnpm build`, then `tsx apps/server/src/index.ts`.
4. Add all variables from `.env.example` in the Coolify environment panel.
5. Attach a PostgreSQL service and set `DATABASE_URL`.

No `Dockerfile` is needed — Nixpacks handles everything via the root `build` and `start` scripts.

## Auth

Better Auth is wired into Express at `/api/auth/*`. To use the client SDK in the frontend:

```ts
import { createAuthClient } from 'better-auth/client'

const authClient = createAuthClient({ baseURL: '/api/auth' })
```

Only email/password is enabled by default. Add providers in `apps/server/src/auth.ts`.

## Adding packages

```bash
# Add a dependency to the server
pnpm --filter @template/server add <package>

# Add a dependency to the client
pnpm --filter @template/client add <package>

# Add a shared dev tool at the root
pnpm add -w -D <package>
```