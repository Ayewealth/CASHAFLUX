import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: {
    users: { findFirst: vi.fn() },
    organizations: { findFirst: vi.fn() },
    orgMembers: { findFirst: vi.fn(), findMany: vi.fn() },
    clients: { findFirst: vi.fn(), findMany: vi.fn() },
    expenses: { findFirst: vi.fn() },
    invoices: { findFirst: vi.fn() },
    bankAccounts: { findMany: vi.fn() },
    recurringInvoices: { findFirst: vi.fn(), findMany: vi.fn() },
    user: { findFirst: vi.fn() },
  },
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
}

vi.mock('../server/src/db/client', () => ({ db: mockDb }))

const mockUserPlan = { current: 'free' as string }

vi.mock('../server/src/middleware/auth', () => ({
  requireAuth: vi.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', name: 'Test', email: 'test@test.com', plan: mockUserPlan.current }
    req.orgId = 'org-1'
    req.orgRole = 'owner'
    req.session = { id: 's1' }
    next()
  }),
  requireRole: vi.fn(() => (_req: any, _res: any, next: any) => next()),
  requirePlan: (...plans: string[]) => {
    return (req: any, res: any, next: any) => {
      if (mockUserPlan.current === 'free' && !plans.includes('free')) {
        return res.status(403).json({ error: 'Upgrade required', requiredPlans: plans, code: 'PLAN_LIMIT' })
      }
      next()
    }
  },
}))

vi.mock('../server/src/lib/org', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', role: 'owner' }),
}))

vi.mock('../server/src/emails/send', () => ({
  sendTemplateEmail: vi.fn().mockResolvedValue({ success: true }),
  loadTemplate: vi.fn(() => 'template'),
  renderTemplate: vi.fn(() => 'html'),
}))

describe('Plan limits - handler-level', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUserPlan.current = 'free'
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free', subscriptionStatus: 'active' })
    app = express()
    app.use(express.json())
  })

  it('POST /api/clients free plan with 5 clients returns 403 PLAN_LIMIT', async () => {
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.then = vi.fn((cb: any) => cb([{ count: '5' }]))
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free' })
    const routes = (await import('../server/src/routes/clients')).default
    app.use('/api/clients', routes)
    const res = await supertest(app).post('/api/clients').send({ name: 'New Client' })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('PLAN_LIMIT')
  })

  it('POST /api/clients free plan with 3 clients returns 201', async () => {
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.then = vi.fn((cb: any) => cb([{ count: '3' }]))
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free' })
    mockDb.insert().values().returning.mockResolvedValue([{ id: 'c1', name: 'New Client', orgId: 'org-1' }])
    const routes = (await import('../server/src/routes/clients')).default
    app.use('/api/clients', routes)
    const res = await supertest(app).post('/api/clients').send({ id: crypto.randomUUID(), orgId: 'org-1', name: 'New Client' })
    expect(res.status).toBe(201)
  })

  it('POST /api/team/invite free plan returns 403', async () => {
    mockDb.query.orgMembers.findMany.mockResolvedValue([{ joinedAt: new Date() }])
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free' })
    mockDb.query.organizations.findFirst.mockResolvedValue({ id: 'org-1', name: 'Test Org' })
    const routes = (await import('../server/src/routes/team')).default
    app.use('/api/team', routes)
    const res = await supertest(app).post('/api/team/invite').send({ emails: ['a@b.com'] })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('PLAN_LIMIT')
  })
})

describe('Plan limits - middleware-level', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUserPlan.current = 'free'
    app = express()
    app.use(express.json())
  })

  it('GET /api/bank-accounts free plan blocked', async () => {
    const routes = (await import('../server/src/routes/bank-accounts')).default
    app.use('/api/bank-accounts', routes)
    const res = await supertest(app).get('/api/bank-accounts')
    expect(res.status).toBe(403)
  })

  it('GET /api/bank-accounts pro plan allowed', async () => {
    mockUserPlan.current = 'pro'
    mockDb.query.bankAccounts.findMany.mockResolvedValue([])
    const routes = (await import('../server/src/routes/bank-accounts')).default
    app.use('/api/bank-accounts', routes)
    const res = await supertest(app).get('/api/bank-accounts')
    expect(res.status).toBe(200)
  })

  it('GET /api/recurring-invoices free plan blocked', async () => {
    const routes = (await import('../server/src/routes/recurring-invoices')).default
    app.use('/api/recurring-invoices', routes)
    const res = await supertest(app).get('/api/recurring-invoices')
    expect(res.status).toBe(403)
  })

  it('GET /api/reports free plan blocked', async () => {
    const routes = (await import('../server/src/routes/reports')).default
    app.use('/api/reports', routes)
    const res = await supertest(app).get('/api/reports/profit-and-loss')
    expect(res.status).toBe(403)
  })

  it('GET /api/tax free plan blocked', async () => {
    const routes = (await import('../server/src/routes/tax')).default
    app.use('/api/tax', routes)
    const res = await supertest(app).get('/api/tax/summary')
    expect(res.status).toBe(403)
  })

  it('GET /api/payroll free plan blocked', async () => {
    const routes = (await import('../server/src/routes/payroll')).default
    app.use('/api/payroll', routes)
    const res = await supertest(app).get('/api/payroll')
    expect(res.status).toBe(403)
  })
})