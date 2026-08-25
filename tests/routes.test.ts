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
    bankTransactions: { findMany: vi.fn() },
    mileageLogs: { findFirst: vi.fn(), findMany: vi.fn() },
    orgMembers: { findFirst: vi.fn(), findMany: vi.fn() },
    users: { findFirst: vi.fn() },
    user: { findFirst: vi.fn() },
    expenseCategories: { findFirst: vi.fn(), findMany: vi.fn() },
    activityLog: { findMany: vi.fn() },
    recurringInvoices: { findFirst: vi.fn(), findMany: vi.fn() },
    payrollEntries: { findFirst: vi.fn(), findMany: vi.fn() },
    industries: { findMany: vi.fn() },
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
}))

vi.mock('../server/src/seed', () => ({
  seedDefaultExpenseCategories: vi.fn().mockResolvedValue(undefined),
}))

describe('Clients CRUD', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/clients')).default
    app.use('/api/clients', routes)
  })

  it('GET / returns list', async () => {
    mockDb.query.clients.findMany.mockResolvedValue([{ id: 'c1', name: 'Client A', orgId: 'org-1' }])
    mockDb.then = vi.fn((cb: any) => cb([{ count: '1' }]))
    const res = await supertest(app).get('/api/clients')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('GET /:id returns single record', async () => {
    mockDb.query.clients.findFirst.mockResolvedValue({ id: 'c1', name: 'Client A' })
    const res = await supertest(app).get('/api/clients/c1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('c1')
  })

  it('GET /:id returns 404 for missing', async () => {
    mockDb.query.clients.findFirst.mockResolvedValue(null)
    const res = await supertest(app).get('/api/clients/nonexistent')
    expect(res.status).toBe(404)
  })

  it('POST / creates record', async () => {
    mockDb.then = vi.fn((cb: any) => cb([{ count: '0' }]))
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free' })
    mockDb.insert().values().returning.mockResolvedValue([{ id: 'c1', name: 'New Client', orgId: 'org-1' }])
    const res = await supertest(app).post('/api/clients').send({ id: crypto.randomUUID(), orgId: 'org-1', name: 'New Client' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('New Client')
  })

  it('PUT /:id updates record', async () => {
    mockDb.query.clients.findFirst.mockResolvedValue({ id: 'c1', name: 'Old Name', orgId: 'org-1' })
    mockDb.update().set().where.mockReturnThis()
    mockDb.returning.mockResolvedValue([{ id: 'c1', name: 'Updated Name' }])
    const res = await supertest(app).put('/api/clients/c1').send({ name: 'Updated Name' })
    expect(res.status).toBe(200)
  })

  it('DELETE /:id archives record', async () => {
    mockDb.query.clients.findFirst.mockResolvedValue({ id: 'c1', orgId: 'org-1' })
    const res = await supertest(app).delete('/api/clients/c1')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })
})

describe('Expenses CRUD', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/expenses')).default
    app.use('/api/expenses', routes)
  })

  it('GET / returns list', async () => {
    mockDb.query.expenses.findMany.mockResolvedValue([{ id: 'e1', merchant: 'Store', amount: '50', category: 'S', date: new Date() }])
    const res = await supertest(app).get('/api/expenses')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('GET /:id returns single', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue({ id: 'e1', merchant: 'Store', amount: '50' })
    mockDb.query.expenseAllocations.findMany.mockResolvedValue([])
    const res = await supertest(app).get('/api/expenses/e1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('e1')
  })

  it('GET /:id returns 404', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue(null)
    const res = await supertest(app).get('/api/expenses/nonexistent')
    expect(res.status).toBe(404)
  })

  it('POST / returns 400 for invalid body', async () => {
    const res = await supertest(app).post('/api/expenses').send({})
    expect(res.status).toBe(400)
  })

  it('PUT /:id updates', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue({ id: 'e1', orgId: 'org-1' })
    const res = await supertest(app).put('/api/expenses/e1').send({ merchant: 'Updated' })
    expect(res.status).toBe(200)
  })

  it('DELETE /:id deletes', async () => {
    mockDb.query.expenses.findFirst.mockResolvedValue({ id: 'e1', orgId: 'org-1' })
    const res = await supertest(app).delete('/api/expenses/e1')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })
})

describe('Invoices CRUD', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/invoices')).default
    app.use('/api/invoices', routes)
  })

  it('GET / returns list', async () => {
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.orderBy.mockReturnThis()
    mockDb.then = vi.fn((cb: any) => cb([{ id: 'inv-1', invoiceNumber: 'INV-001', clientName: 'Client A' }]))
    const res = await supertest(app).get('/api/invoices')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('GET /:id returns single', async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-001' })
    mockDb.query.invoiceLineItems.findMany.mockResolvedValue([])
    const res = await supertest(app).get('/api/invoices/inv-1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('inv-1')
  })

  it('GET /:id returns 404', async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue(null)
    const res = await supertest(app).get('/api/invoices/nonexistent')
    expect(res.status).toBe(404)
  })

  it('POST / returns 400 for invalid body', async () => {
    const res = await supertest(app).post('/api/invoices').send({})
    expect(res.status).toBe(400)
  })

  it('PUT /:id updates', async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue({ id: 'inv-1', orgId: 'org-1' })
    mockDb.query.invoiceLineItems.findMany.mockResolvedValue([])
    const res = await supertest(app).put('/api/invoices/inv-1').send({ status: 'paid' })
    expect(res.status).toBe(200)
  })

  it('DELETE /:id deletes', async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue({ id: 'inv-1', orgId: 'org-1' })
    const res = await supertest(app).delete('/api/invoices/inv-1')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })
})

describe('Bank Accounts CRUD', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/bank-accounts')).default
    app.use('/api/bank-accounts', routes)
  })

  it('GET / returns list', async () => {
    mockDb.query.bankAccounts.findMany.mockResolvedValue([{ id: 'b1', name: 'Checking', orgId: 'org-1' }])
    const res = await supertest(app).get('/api/bank-accounts')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('GET /:id returns single', async () => {
    mockDb.query.bankAccounts.findFirst.mockResolvedValue({ id: 'b1', name: 'Checking' })
    const res = await supertest(app).get('/api/bank-accounts/b1')
    expect(res.status).toBe(200)
  })

  it('POST / creates', async () => {
    mockDb.insert().values().returning.mockResolvedValue([{ id: 'b1', name: 'New Account', orgId: 'org-1' }])
    const res = await supertest(app).post('/api/bank-accounts').send({ id: crypto.randomUUID(), orgId: 'org-1', name: 'New Account' })
    expect(res.status).toBe(201)
  })

  it('DELETE /:id deletes', async () => {
    mockDb.query.bankAccounts.findFirst.mockResolvedValue({ id: 'b1', orgId: 'org-1' })
    const res = await supertest(app).delete('/api/bank-accounts/b1')
    expect(res.status).toBe(200)
  })
})

describe('Mileage CRUD', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/mileage')).default
    app.use('/api/mileage', routes)
  })

  it('GET / returns list', async () => {
    mockDb.query.mileageLogs.findMany.mockResolvedValue([{ id: 'm1', origin: 'A', destination: 'B', miles: '10', date: new Date() }])
    const res = await supertest(app).get('/api/mileage')
    expect(res.status).toBe(200)
    expect(res.body.logs).toHaveLength(1)
  })

  it('GET /:id returns single', async () => {
    mockDb.query.mileageLogs.findFirst.mockResolvedValue({ id: 'm1', origin: 'A', destination: 'B', miles: '10' })
    const res = await supertest(app).get('/api/mileage/m1')
    expect(res.status).toBe(200)
  })

  it('POST / returns 400 for invalid body', async () => {
    const res = await supertest(app).post('/api/mileage').send({})
    expect(res.status).toBe(400)
  })

  it('DELETE /:id deletes', async () => {
    mockDb.query.mileageLogs.findFirst.mockResolvedValue({ id: 'm1', orgId: 'org-1' })
    const res = await supertest(app).delete('/api/mileage/m1')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })
})

describe('Members CRUD', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const routes = (await import('../server/src/routes/members')).default
    app.use('/api/members', routes)
  })

  it('GET / returns list', async () => {
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.then = vi.fn((cb: any) => cb([{ id: 'om-1', userId: 'u1', role: 'owner', name: 'Test', email: 'test@test.com' }]))
    const res = await supertest(app).get('/api/members')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('Dashboard Summary', () => {
  let app: express.Express
  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.orderBy.mockReturnThis()
    mockDb.limit.mockReturnThis()
    mockDb.groupBy.mockReturnThis()
    mockDb.then = vi.fn((cb: any) => cb([]))
    mockDb.query.expenses.findMany.mockResolvedValue([])
    const routes = (await import('../server/src/routes/dashboard')).default
    app.use('/api/dashboard', routes)
  })

  it('GET /summary returns KPI data', async () => {
    const res = await supertest(app).get('/api/dashboard/summary')
    expect(res.status).toBe(200)
    expect(res.body.kpis).toBeDefined()
    expect(res.body.kpis.revenue).toBeDefined()
    expect(typeof res.body.kpis.revenue.value).toBe('number')
  })
})