import express from 'express'
import { createServer } from 'http'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { env } from './env'
import { serveStatic } from './static'
import { requireAuth } from './middleware/auth'
import { seedIndustries } from './seed'
import './types'

const app = express()
app.set('trust proxy', 1)
const httpServer = createServer(app)

// Security headers
const cspDirectives: Record<string, string[]> = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://js.stripe.com'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.gstatic.com'],
  fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.gstatic.com'],
  imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://*.r2.dev'],
  connectSrc: ["'self'", 'https://api.stripe.com', 'https://resend.com'],
  frameSrc: ["'self'", 'https://js.stripe.com'],
}

// In development, allow Vite's HMR inline scripts
if (env.NODE_ENV !== 'production') {
  cspDirectives.scriptSrc.push("'unsafe-inline'")
}

app.use(helmet({
  contentSecurityPolicy: { directives: cspDirectives },
  crossOriginEmbedderPolicy: false,
}))

// CORS — restrict to primary domain in production
if (env.NODE_ENV === 'production') {
  app.use(cors({ origin: env.BETTER_AUTH_URL, credentials: true }))
} else {
  app.use(cors({ origin: true, credentials: true }))
}

// Global rate limit: 200 req/min per IP as safety net
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})
app.use('/api', globalLimiter)

// Stripe webhook MUST be mounted BEFORE express.json() — it needs raw body
import stripeWebhookRoutes from './routes/stripe-webhook'
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRoutes)

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

// Invitations routes — accept invites, get invite info
import invitationsRoutes from './routes/invitations'
app.use('/api/invitations', invitationsRoutes)

// Onboarding routes — mounted before the generic requireAuth gate
// since the router applies requireAuth internally
import onboardingRoutes from './routes/onboarding'
app.use('/api/onboarding', onboardingRoutes)

// Industries routes — used by the industry combobox in onboarding
import industriesRoutes from './routes/industries'
app.use('/api/industries', industriesRoutes)

// Team routes — invite, list, remove members
import teamRoutes from './routes/team'
app.use('/api/team', teamRoutes)

// User routes — plan, settings
import userRoutes from './routes/user'
app.use('/api/user', userRoutes)

// Upload routes — R2 pre-signed URLs for logo uploads
import uploadsRoutes from './routes/uploads'
app.use('/api/uploads', uploadsRoutes)

// Organization routes — fetch and update the current user's org
import organizationsRoutes from './routes/organizations'
app.use('/api/organizations', organizationsRoutes)

// Member routes — list members of the current user's org
import membersRoutes from './routes/members'
app.use('/api/members', membersRoutes)

// Client routes — CRUD for clients scoped to the user's org
import clientsRoutes from './routes/clients'
app.use('/api/clients', clientsRoutes)

// Invoice routes — CRUD with line items scoped to the user's org
import invoicesRoutes from './routes/invoices'
app.use('/api/invoices', invoicesRoutes)

// Expense routes — CRUD for expenses scoped to the user's org
import expensesRoutes from './routes/expenses'
app.use('/api/expenses', expensesRoutes)

// Bank account routes — CRUD for bank accounts scoped to the user's org
import bankAccountsRoutes from './routes/bank-accounts'
app.use('/api/bank-accounts', bankAccountsRoutes)

// Bank transaction routes — CRUD + CSV import scoped to the user's org
import bankTransactionsRoutes from './routes/bank-transactions'
app.use('/api/bank-transactions', bankTransactionsRoutes)

// Settings routes — fetch and update org settings
import settingsRoutes from './routes/settings'
app.use('/api/settings', settingsRoutes)

// Dashboard routes — KPI summary for the dashboard
import dashboardRoutes from './routes/dashboard'
app.use('/api/dashboard', dashboardRoutes)

// Recurring invoice routes — create, list, process
import recurringInvoicesRoutes from './routes/recurring-invoices'
app.use('/api/recurring-invoices', recurringInvoicesRoutes)

// Expense category routes — IRS defaults + custom per org
import expenseCategoriesRoutes from './routes/expense-categories'
app.use('/api/expense-categories', expenseCategoriesRoutes)

// Mileage routes — CRUD for mileage logs
import mileageRoutes from './routes/mileage'
app.use('/api/mileage', mileageRoutes)

// --- Protected API routes ---
// Every business endpoint below requires an authenticated Better Auth
// session. Public/unauthenticated endpoints (/api/auth/*, /api/health,
// /api/blog, /api/contact) are mounted above this gate and are skipped.
// Reports routes — financial report generation
import reportsRoutes from './routes/reports'
app.use('/api/reports', reportsRoutes)

// Tax routes — tax summary and ready-export
import taxRoutes from './routes/tax'
app.use('/api/tax', taxRoutes)

// Blog routes — public
import blogRoutes from './routes/blog'
app.use('/api/blog', blogRoutes)

// Contact routes — public
import contactRoutes from './routes/contact'
app.use('/api/contact', contactRoutes)

// Subscription routes — Stripe billing
import subscriptionRoutes from './routes/subscription'
app.use('/api/subscription', subscriptionRoutes)

// Payroll routes — CRUD + CSV export for payroll entries
import payrollRoutes from './routes/payroll'
app.use('/api/payroll', payrollRoutes)

// Activity log routes — read team/organization activity
import activityLogRoutes from './routes/activity-log'
app.use('/api/activity-log', activityLogRoutes)

// Demo mode routes — generate/clean demo data
import demoRoutes from './routes/demo'
app.use('/api/demo', demoRoutes)

// --- SEO routes ---

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain')
  res.send(`User-agent: *
Allow: /
Allow: /pricing
Allow: /features
Allow: /blog
Allow: /how-it-works
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Disallow: /dashboard
Disallow: /api
Disallow: /onboarding
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email

Sitemap: https://cashaflux.com/sitemap.xml
`)
})

app.get('/sitemap.xml', async (_req, res) => {
  const BASE = 'https://cashaflux.com'
  const publicRoutes = [
    '', '/pricing', '/features', '/blog', '/how-it-works',
    '/about', '/contact', '/privacy', '/terms',
  ]
  const urls = publicRoutes.map((path) => ({
    loc: `${BASE}${path}`,
    changefreq: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? '1.0' : '0.8',
  }))

  try {
    const { db } = await import('./db/client')
    const { blogPosts } = await import('@shared/schema')
    const posts = await db.query.blogPosts.findMany({
      columns: { slug: true, createdAt: true },
      where: (p, { isNotNull }) => isNotNull(p.publishedAt),
    })
    for (const post of posts) {
      urls.push({
        loc: `${BASE}/blog/${post.slug}`,
        changefreq: 'monthly',
        priority: '0.6',
      })
    }
  } catch {
    // DB unavailable; serve with public routes only
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>`

  res.type('application/xml').send(xml)
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

// Seed data on startup (checks if already seeded internally)
await seedIndustries()

httpServer.listen(env.PORT, () => {
  console.log(`Listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`)
})
