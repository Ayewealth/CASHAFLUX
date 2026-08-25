import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: {
    organizations: { findFirst: vi.fn() },
    expenses: { findFirst: vi.fn(), findMany: vi.fn() },
    expenseCategories: { findMany: vi.fn() },
    expenseAllocations: { findMany: vi.fn() },
    users: { findFirst: vi.fn() },
    orgMembers: { findFirst: vi.fn() },
  },
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
}

vi.mock('../server/src/db/client', () => ({ db: mockDb }))

vi.mock('../server/src/middleware/auth', () => ({
  requireAuth: vi.fn((req, _res, next) => {
    req.user = { id: 'user-1', name: 'Test', email: 'test@example.com' }
    req.session = { id: 's1', expiresAt: new Date() }
    req.orgId = 'org-1'
    req.orgRole = 'owner'
    next()
  }),
  requirePlan: vi.fn(() => (_req, _res, next) => next()),
  requireRole: vi.fn(() => (_req, _res, next) => next()),
}))

vi.mock('../server/src/lib/org', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', role: 'owner' }),
}))

describe('Expenses API', () => {
  let app: express.Express
  let request: supertest.SuperTest<supertest.Test>

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/expenses')).default
    app.use('/api/expenses', routes)
    request = supertest(app)
  })

  it('GET / returns expenses list', async () => {
    mockDb.query.expenses.findMany.mockResolvedValue([
      { id: 'exp-1', merchant: 'Office Depot', amount: '50', category: 'Supplies', date: new Date() },
    ])
    const res = await request.get('/api/expenses')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /:id returns a single expense', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue({ id: 'exp-1', merchant: 'Office Depot', amount: '50', category: 'Supplies' })
    mockDb.query.expenseAllocations.findMany.mockResolvedValue([])
    const res = await request.get('/api/expenses/exp-1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('exp-1')
  })

  it('GET /:id returns 404 for unknown expense', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue(null)
    const res = await request.get('/api/expenses/unknown')
    expect(res.status).toBe(404)
  })

  it('DELETE /:id deletes an expense', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue({ id: 'exp-1', orgId: 'org-1' })
    const res = await request.delete('/api/expenses/exp-1')
    expect(res.status).toBe(200)
  })
})