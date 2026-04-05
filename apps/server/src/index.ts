import express from 'express'
import path from 'path'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { env } from './env'

const app = express()

app.use(express.json())

// Auth — must be mounted before any catch-all routes.
// Handles: /api/auth/sign-in, /api/auth/sign-up, /api/auth/sign-out, etc.
app.all('/api/auth/*', toNodeHandler(auth))

// --- API routes ---

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// --- Static serving (production only) ---
// In development, Vite proxies /api to this server, so no static serving needed.

if (env.NODE_ENV === 'production') {
  // dist/client is built by `pnpm build` at the repo root
  const clientDist = path.resolve(process.cwd(), 'dist/client')

  app.use(express.static(clientDist))

  // SPA fallback — send index.html for any non-API route
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`)
})
