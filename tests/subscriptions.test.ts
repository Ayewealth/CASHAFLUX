import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: { users: { findFirst: vi.fn() } },
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
}

vi.mock('../server/src/db/client', () => ({ db: mockDb }))

vi.mock('../server/src/middleware/auth', () => ({
  requireAuth: vi.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', name: 'Test', email: 'test@test.com' }
    req.orgId = 'org-1'
    req.orgRole = 'owner'
    next()
  }),
  requireRole: vi.fn(() => (_req: any, _res: any, next: any) => next()),
  requirePlan: vi.fn(() => (_req: any, _res: any, next: any) => next()),
}))

const mockStripe = {
  customers: { create: vi.fn().mockResolvedValue({ id: 'cus_123' }) },
  checkout: { sessions: { create: vi.fn() } },
  billingPortal: { sessions: { create: vi.fn() } },
  subscriptions: { retrieve: vi.fn() },
  invoices: { list: vi.fn().mockResolvedValue({ data: [] }) },
  webhooks: {
    constructEvent: vi.fn((body: any, sig: string) => {
      if (!sig || sig === 'bad') throw new Error('Invalid signature')
      return typeof body === 'string' ? JSON.parse(body) : body
    }),
  },
}

vi.mock('../server/src/lib/stripe', () => ({
  stripe: mockStripe,
  resolvePriceId: vi.fn((plan: string, _interval: string) => {
    if (plan === 'pro') return 'price_pro_monthly'
    if (plan === 'business') return 'price_biz_monthly'
    return null
  }),
  resolvePlanFromPriceId: vi.fn((priceId: string) => {
    if (priceId === 'price_pro_monthly') return { plan: 'pro', interval: 'month' }
    if (priceId === 'price_biz_monthly') return { plan: 'business', interval: 'month' }
    return null
  }),
}))

describe('Subscription API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free', subscriptionStatus: 'active' })
    app = express()
    app.use(express.json())
  })

  it('GET /api/subscription/status returns free active for unsubscribed', async () => {
    const routes = (await import('../server/src/routes/subscription')).default
    app.use('/api/subscription', routes)
    const res = await supertest(app).get('/api/subscription/status')
    expect(res.status).toBe(200)
    expect(res.body.plan).toBe('free')
    expect(res.body.status).toBe('active')
  })

  it('GET /api/subscription/plans returns 3 plans', async () => {
    const routes = (await import('../server/src/routes/subscription')).default
    app.use('/api/subscription', routes)
    const res = await supertest(app).get('/api/subscription/plans')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
    expect(res.body[0].id).toBe('free')
    expect(res.body[1].id).toBe('pro')
    expect(res.body[2].id).toBe('business')
  })

  it('POST /api/subscription/checkout creates session', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://checkout.stripe.com/session' })
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free', email: 'test@test.com' })
    const routes = (await import('../server/src/routes/subscription')).default
    app.use('/api/subscription', routes)
    const res = await supertest(app).post('/api/subscription/checkout').send({ plan: 'pro', interval: 'month' })
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://checkout.stripe.com/session')
  })

  it('POST /api/subscription/portal returns portal URL', async () => {
    mockStripe.billingPortal.sessions.create.mockResolvedValue({ url: 'https://portal.stripe.com/session' })
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'pro', stripeCustomerId: 'cus_123' })
    const routes = (await import('../server/src/routes/subscription')).default
    app.use('/api/subscription', routes)
    const res = await supertest(app).post('/api/subscription/portal')
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://portal.stripe.com/session')
  })

  it('POST /api/subscription/portal returns 400 when no subscription', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free', stripeCustomerId: null })
    const routes = (await import('../server/src/routes/subscription')).default
    app.use('/api/subscription', routes)
    const res = await supertest(app).post('/api/subscription/portal')
    expect(res.status).toBe(400)
  })

  it('GET /api/subscription/status returns plan info for subscribed user', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'pro', subscriptionStatus: 'active', stripeSubscriptionId: 'sub_123', planInterval: 'month', currentPeriodEnd: new Date('2026-12-31'), stripeCustomerId: 'cus_123' })
    mockStripe.subscriptions.retrieve.mockResolvedValue({ status: 'active', current_period_end: 1767052800, items: { data: [{ price: { id: 'price_pro_monthly' } }] } })
    const routes = (await import('../server/src/routes/subscription')).default
    app.use('/api/subscription', routes)
    const res = await supertest(app).get('/api/subscription/status')
    expect(res.status).toBe(200)
    expect(res.body.plan).toBe('pro')
  })

  describe('Stripe webhooks', () => {
    beforeEach(() => {
      app = express()
    })

    it('checkout.session.completed updates user plan', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        current_period_end: 1767052800,
        items: { data: [{ price: { id: 'price_pro_monthly' } }] },
      })
      mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'free', stripeCustomerId: null })
      const routes = (await import('../server/src/routes/stripe-webhook')).default
      app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), routes)
      const res = await supertest(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid')
        .send({
          type: 'checkout.session.completed',
          data: {
            object: {
              client_reference_id: 'user-1',
              subscription: 'sub_123',
              customer: 'cus_123',
            },
          },
        })
      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
    })

    it('customer.subscription.updated with past_due works', async () => {
      mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-1', plan: 'pro', stripeCustomerId: 'cus_123' })
      const routes = (await import('../server/src/routes/stripe-webhook')).default
      app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), routes)
      const res = await supertest(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid')
        .send({
          type: 'customer.subscription.updated',
          data: {
            object: {
              id: 'sub_123',
              customer: 'cus_123',
              status: 'past_due',
              current_period_end: 1767052800,
              items: { data: [{ price: { id: 'price_pro_monthly' } }] },
            },
          },
        })
      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
    })
  })
})