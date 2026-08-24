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

vi.mock('../server/src/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn((body, sig) => {
        if (sig === 'bad-signature' || !sig) throw new Error('Invalid signature')
        return typeof body === 'string' ? JSON.parse(body) : body
      }),
    },
    subscriptions: { retrieve: vi.fn() },
  },
  resolvePlanFromPriceId: vi.fn(),
}))

describe('Stripe Webhook', () => {
  let app: express.Express
  let request: supertest.SuperTest<supertest.Test>

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    const routes = (await import('../server/src/routes/stripe-webhook')).default
    app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), routes)
    request = supertest(app)
  })

  it('POST / returns 400 for missing signature', async () => {
    const res = await request.post('/api/stripe/webhook').send({ type: 'checkout.session.completed' })
    expect(res.status).toBe(400)
  })

  it('POST / returns 400 with invalid signature', async () => {
    const res = await request
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'bad-signature')
      .send({ type: 'checkout.session.completed' })
    expect(res.status).toBe(400)
  })
})
