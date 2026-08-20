import express from 'express'
import { createServer } from 'http'
import rateLimit from 'express-rate-limit'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { env } from './env'
import { serveStatic } from './static'

const app = express()
const httpServer = createServer(app)

app.use(express.json())

// Rate limit auth endpoints: 10 requests / minute / IP.
// Mounted before the auth handler so it short-circuits abuse of
// sign-in / sign-up / password-reset endpoints.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

app.use('/api/auth', authLimiter)

// Auth — must be mounted before any catch-all routes.
// Handles /api/auth/sign-in, /api/auth/sign-up, /api/auth/sign-out, etc.
app.all('/api/auth/*', toNodeHandler(auth))

// --- API routes ---

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// --- Static / Vite ---
// In production: serve pre-built client from dist/client/
// In development: mount Vite as middleware (HMR, transforms, SPA fallback)

if (env.NODE_ENV === 'production') {
  serveStatic(app)
} else {
  // Dynamic import keeps the vite dependency out of the production code path
  const { setupVite } = await import('./vite')
  await setupVite(httpServer, app)
}

httpServer.listen(env.PORT, () => {
  console.log(`Listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`)
})
