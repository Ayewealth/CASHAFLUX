import express from 'express'
import { createServer } from 'http'
import rateLimit from 'express-rate-limit'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { env } from './env'
import { serveStatic } from './static'
import { requireAuth } from './middleware/auth'
import { seedIndustries } from './seed'
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

// Subscription routes — Stripe billing
app.use('/api/subscription', requireAuth)

// Payroll routes — CRUD + CSV export for payroll entries
import payrollRoutes from './routes/payroll'
app.use('/api/payroll', payrollRoutes)

// Activity log routes — read team/organization activity
import activityLogRoutes from './routes/activity-log'
app.use('/api/activity-log', activityLogRoutes)

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
