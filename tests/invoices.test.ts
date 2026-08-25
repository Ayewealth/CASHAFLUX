import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: {
    organizations: { findFirst: vi.fn() },
    invoices: { findFirst: vi.fn(), findMany: vi.fn() },
    invoiceLineItems: { findMany: vi.fn() },
    clients: { findFirst: vi.fn() },
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
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
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
  requireRole: vi.fn(() => (_req, _res, next) => next()),
}))

vi.mock('../server/src/lib/org', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', role: 'owner' }),
}))

describe('Invoices API', () => {
  let app: express.Express
  let request: supertest.SuperTest<supertest.Test>

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/invoices')).default
    app.use('/api/invoices', routes)
    request = supertest(app)
  }, 15000)

  it('POST / returns 400 for missing required fields', async () => {
    const res = await request.post('/api/invoices').send({})
    expect(res.status).toBe(400)
  })

  it('GET /:id returns a single invoice', async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-001' })
    mockDb.query.invoiceLineItems.findMany.mockResolvedValue([])
    const res = await request.get('/api/invoices/inv-1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('inv-1')
  })

  it('DELETE /:id deletes an invoice', async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue({ id: 'inv-1', orgId: 'org-1' })
    const res = await request.delete('/api/invoices/inv-1')
    expect(res.status).toBe(200)
  })
})
