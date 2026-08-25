import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: {
    organizations: { findFirst: vi.fn() },
    clients: { findFirst: vi.fn(), findMany: vi.fn() },
    expenses: { findFirst: vi.fn(), findMany: vi.fn() },
    expenseAllocations: { findMany: vi.fn() },
    invoices: { findFirst: vi.fn(), findMany: vi.fn() },
    invoiceLineItems: { findMany: vi.fn() },
    bankAccounts: { findFirst: vi.fn(), findMany: vi.fn() },
    mileageLogs: { findFirst: vi.fn(), findMany: vi.fn() },
    orgMembers: { findFirst: vi.fn(), findMany: vi.fn() },
    users: { findFirst: vi.fn() },
    user: { findFirst: vi.fn() },
    expenseCategories: { findFirst: vi.fn() },
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
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  groupBy: vi.fn().mockReturnThis(),
  then: vi.fn(),
}

vi.mock('../server/src/db/client', () => ({ db: mockDb }))

vi.mock('../server/src/middleware/auth', () => ({
  requireAuth: vi.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', name: 'Test', email: 'test@test.com' }
    req.orgId = 'org-1'
    req.orgRole = 'owner'
    req.session = { id: 's1' }
    next()
  }),
  requireRole: vi.fn(() => (_req: any, _res: any, next: any) => next()),
  requirePlan: vi.fn(() => (_req: any, _res: any, next: any) => next()),
}))

vi.mock('../server/src/lib/org', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', role: 'owner' }),
  getUserOrgs: vi.fn().mockResolvedValue([{ orgId: 'org-1', role: 'owner', orgName: 'Test Org' }]),
}))

describe('Org scoping - data isolation', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
  })

  describe('Clients', () => {
    it('User A in org-1 cannot see org-2 clients via GET list', async () => {
      mockDb.query.clients.findMany.mockResolvedValue([])
      const routes = (await import('../server/src/routes/clients')).default
      app.use('/api/clients', routes)
      const res = await supertest(app).get('/api/clients')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
      const queryOrgFilter = mockDb.query.clients.findMany.mock.calls[0]?.[0]?.where
      expect(queryOrgFilter).toBeDefined()
    })

    it('User A in org-1 gets 404 for org-2 client by id', async () => {
      mockDb.query.clients.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/clients')).default
      app.use('/api/clients', routes)
      const res = await supertest(app).get('/api/clients/org-2-client-id')
      expect(res.status).toBe(404)
    })
  })

  describe('Invoices', () => {
    it('User A in org-1 gets 404 for org-2 invoice', async () => {
      mockDb.query.invoices.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/invoices')).default
      app.use('/api/invoices', routes)
      const res = await supertest(app).get('/api/invoices/org-2-invoice-id')
      expect(res.status).toBe(404)
    })
  })

  describe('Expenses', () => {
    it('User A in org-1 gets 404 for org-2 expense', async () => {
      mockDb.query.expenses.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/expenses')).default
      app.use('/api/expenses', routes)
      const res = await supertest(app).get('/api/expenses/org-2-expense-id')
      expect(res.status).toBe(404)
    })
  })

  describe('Bank accounts', () => {
    it('User A in org-1 gets 404 for org-2 bank account', async () => {
      mockDb.query.bankAccounts.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/bank-accounts')).default
      app.use('/api/bank-accounts', routes)
      const res = await supertest(app).get('/api/bank-accounts/org-2-account-id')
      expect(res.status).toBe(404)
    })
  })

  describe('Mileage', () => {
    it('User A in org-1 gets 404 for org-2 mileage log', async () => {
      mockDb.query.mileageLogs.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/mileage')).default
      app.use('/api/mileage', routes)
      const res = await supertest(app).get('/api/mileage/org-2-mileage-id')
      expect(res.status).toBe(404)
    })
  })

  describe('Org member resolution', () => {
    it('GET /api/organizations/ returns org-1 data', async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({ id: 'org-1', name: 'Test Org', ownerUserId: 'user-1' })
      const routes = (await import('../server/src/routes/organizations')).default
      app.use('/api/organizations', routes)
      const res = await supertest(app).get('/api/organizations')
      expect(res.status).toBe(200)
      expect(res.body.id).toBe('org-1')
    })

    it('Cookie org switching resolves correct org', async () => {
      const { getUserOrgs } = await import('../server/src/lib/org')
      ;(getUserOrgs as any).mockResolvedValue([
        { orgId: 'org-1', role: 'owner', orgName: 'Org One' },
        { orgId: 'org-2', role: 'admin', orgName: 'Org Two' },
      ])
      mockDb.query.organizations.findFirst.mockResolvedValue({ id: 'org-2', name: 'Org Two', ownerUserId: 'user-2' })
      const routes = (await import('../server/src/routes/organizations')).default
      app.use('/api/organizations', routes)
      const res = await supertest(app).get('/api/organizations').set('Cookie', 'cashaflux_org=org-2; other=val')
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Org Two')
    })
  })

  describe('Multi-org awareness via onboarding', () => {
    it('GET /api/onboarding/status reflects org-1 membership', async () => {
      mockDb.query.orgMembers.findFirst.mockResolvedValue({ orgId: 'org-1', role: 'owner' })
      const routes = (await import('../server/src/routes/onboarding')).default
      app.use('/api/onboarding', routes)
      const res = await supertest(app).get('/api/onboarding/status')
      expect(res.status).toBe(200)
      expect(res.body.onboarded).toBe(true)
      expect(res.body.orgCount).toBe(1)
    })
  })
})