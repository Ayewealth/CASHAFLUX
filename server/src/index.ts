import express from 'express'
import { createServer } from 'http'
import rateLimit from 'express-rate-limit'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { env } from './env'
import { serveStatic } from './static'
import { requireAuth } from './middleware/auth'
import './types'

const app = express()
const httpServer = createServer(app)

app.use(express.json())

// Rate limit auth endpoints: 10 requests / minute / IP.
// Mounted before the auth handler so it short-circuits abuse of
// sign-in / sign-up / password-reset endpoints.
// TODO: swap for rate-limit-redis before multi-instance
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

// --- Protected API routes ---
// Every business endpoint below requires an authenticated Better Auth
// session. Public/unauthenticated endpoints (/api/auth/*, /api/health,
// /api/blog, /api/contact) are mounted above this gate and are skipped.
app.use('/api/invoices', requireAuth)
app.use('/api/expenses', requireAuth)
app.use('/api/clients', requireAuth)
app.use('/api/bank-accounts', requireAuth)
app.use('/api/bank-transactions', requireAuth)
app.use('/api/reports', requireAuth)
app.use('/api/tax', requireAuth)
app.use('/api/mileage', requireAuth)
app.use('/api/team', requireAuth)
app.use('/api/settings', requireAuth)
app.use('/api/subscription', requireAuth)
app.use('/api/dashboard', requireAuth)

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
