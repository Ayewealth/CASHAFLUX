import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: {
    organizations: { findFirst: vi.fn() },
    orgMembers: { findFirst: vi.fn(), findMany: vi.fn() },
    clients: { findFirst: vi.fn() },
    invoices: { findFirst: vi.fn() },
    invoiceLineItems: { findMany: vi.fn() },
    expenses: { findFirst: vi.fn() },
    onboardingProgress: { findFirst: vi.fn() },
    industries: { findMany: vi.fn() },
    users: { findFirst: vi.fn() },
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
}

vi.mock('../server/src/db/client', () => ({ db: mockDb }))

vi.mock('../server/src/middleware/auth', () => ({
  requireAuth: vi.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', name: 'Test', email: 'test@test.com' }
    req.session = { id: 's1', expiresAt: new Date() }
    next()
  }),
}))

vi.mock('../server/src/lib/org', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', role: 'owner' }),
}))

describe('Onboarding API', () => {
  let app: express.Express
  let request: supertest.SuperTest<supertest.Test>

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    const onboardingRoutes = (await import('../server/src/routes/onboarding')).default
    app.use('/api/onboarding', onboardingRoutes)
    request = supertest(app)
  })

  it('GET /status returns onboarded=false when no org found', async () => {
    mockDb.query.organizations.findFirst.mockResolvedValue(null)
    const res = await request.get('/api/onboarding/status')
    expect(res.status).toBe(200)
    expect(res.body.onboarded).toBe(false)
  })

  it('GET /status returns onboarded=true with orgId', async () => {
    mockDb.query.organizations.findFirst.mockResolvedValue({ id: 'org-1' })
    const res = await request.get('/api/onboarding/status')
    expect(res.status).toBe(200)
    expect(res.body.onboarded).toBe(true)
    expect(res.body.orgId).toBe('org-1')
  })

  it('POST / creates org and member record', async () => {
    mockDb.insert().values().returning.mockResolvedValue([{ id: 'org-1' }])
    const res = await request.post('/api/onboarding').send({
      businessName: 'Test Business',
      businessType: 'sole_proprietor',
      industry: 'Technology',
      fiscalYearStart: 1,
    })
    expect(res.status).toBe(200)
    expect(res.body.orgId).toBe('org-1')
  })

  it('POST / succeeds with empty name (defaults to My Business)', async () => {
    mockDb.insert().values().returning.mockResolvedValue([{ id: 'org-2' }])
    const res = await request.post('/api/onboarding').send({ businessName: '' })
    expect(res.status).toBe(200)
    expect(res.body.orgId).toBe('org-2')
  })

  it('PUT /progress saves progress', async () => {
    mockDb.query.onboardingProgress.findFirst.mockResolvedValue(null)
    const res = await request.put('/api/onboarding/progress').send({ currentStep: 2, formData: { name: 'Test' } })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('PUT /progress with invalid body returns 400', async () => {
    const res = await request.put('/api/onboarding/progress').send({})
    expect(res.status).toBe(400)
  })

  it('PUT /progress updates existing progress', async () => {
    mockDb.query.onboardingProgress.findFirst.mockResolvedValue({ id: 'p1', userId: 'user-1', currentStep: 1, formData: '{}' })
    const res = await request.put('/api/onboarding/progress').send({ currentStep: 3, formData: { businessName: 'Test' } })
    expect(res.status).toBe(200)
  })

  it('DELETE /progress clears progress', async () => {
    const res = await request.delete('/api/onboarding/progress')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('GET /progress returns null when no progress', async () => {
    mockDb.query.onboardingProgress.findFirst.mockResolvedValue(null)
    const res = await request.get('/api/onboarding/progress')
    expect(res.status).toBe(200)
    expect(res.body).toBeNull()
  })

  it('GET /progress returns saved progress', async () => {
    mockDb.query.onboardingProgress.findFirst.mockResolvedValue({
      currentStep: 3, formData: JSON.stringify({ businessName: 'Test' }),
    })
    const res = await request.get('/api/onboarding/progress')
    expect(res.status).toBe(200)
    expect(res.body.currentStep).toBe(3)
    expect(res.body.formData.businessName).toBe('Test')
  })

  it('progress is restored between steps', async () => {
    mockDb.query.onboardingProgress.findFirst
      .mockResolvedValueOnce({ currentStep: 1, formData: JSON.stringify({}) })
      .mockResolvedValueOnce({ currentStep: 2, formData: JSON.stringify({ businessName: 'My Biz' }) })
    const res1 = await request.get('/api/onboarding/progress')
    expect(res1.status).toBe(200)
    const res2 = await request.get('/api/onboarding/progress')
    expect(res2.status).toBe(200)
    expect(res2.body.formData.businessName).toBe('My Biz')
  })
})