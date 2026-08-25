import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'

const mockDb = {
  query: { users: { findFirst: vi.fn() }, orgMembers: { findFirst: vi.fn(), findMany: vi.fn() }, organizations: { findFirst: vi.fn(), findMany: vi.fn() } },
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
}

vi.mock('../server/src/db/client', () => ({ db: mockDb }))

vi.mock('../server/src/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  validatePassword: vi.fn(),
}))

vi.mock('../server/src/lib/org', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', role: 'owner' }),
  getUserOrgs: vi.fn().mockResolvedValue([{ orgId: 'org-1', role: 'owner', orgName: 'Test Org' }]),
}))

describe('requireAuth', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
  })

  it('returns 401 when no session', async () => {
    const { auth } = await import('../server/src/auth')
    ;(auth.api.getSession as any).mockResolvedValue(null)
    app.get('/test', (await import('../server/src/middleware/auth')).requireAuth, (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Unauthorized')
  })

  it('returns 401 when session is null', async () => {
    const { auth } = await import('../server/src/auth')
    ;(auth.api.getSession as any).mockResolvedValue(null)
    app.get('/test', (await import('../server/src/middleware/auth')).requireAuth, (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(401)
  })

  it('populates req.user, req.orgId, req.orgRole on success', async () => {
    const { auth } = await import('../server/src/auth')
    ;(auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
      session: { id: 's1', expiresAt: new Date() },
    })
    mockDb.query.organizations.findFirst.mockResolvedValue({ activeDemoSessionId: null })
    let captured: any = {}
    app.get('/test', (await import('../server/src/middleware/auth')).requireAuth, (req: any, res: any) => {
      captured = { user: req.user, orgId: req.orgId, orgRole: req.orgRole }
      res.json({ ok: true })
    })
    const supertest = (await import('supertest')).default
    await supertest(app).get('/test')
    expect(captured.user.id).toBe('user-1')
    expect(captured.orgId).toBe('org-1')
    expect(captured.orgRole).toBe('owner')
  })

  it('resolves org from cookie', async () => {
    const { auth } = await import('../server/src/auth')
    ;(auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
      session: { id: 's1', expiresAt: new Date() },
    })
    mockDb.query.organizations.findFirst.mockResolvedValue({ activeDemoSessionId: null })
    const { getUserOrgs } = await import('../server/src/lib/org')
    ;(getUserOrgs as any).mockResolvedValue([
      { orgId: 'org-1', role: 'owner', orgName: 'Org One' },
      { orgId: 'org-2', role: 'admin', orgName: 'Org Two' },
    ])
    let capturedOrgId = ''
    app.get('/test', (await import('../server/src/middleware/auth')).requireAuth, (req: any, res: any) => { capturedOrgId = req.orgId; res.json({ ok: true }) })
    const supertest = (await import('supertest')).default
    await supertest(app).get('/test').set('Cookie', 'cashaflux_org=org-2')
    expect(capturedOrgId).toBe('org-2')
  })
})

describe('requireRole', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
  })

  it('allows correct role', async () => {
    const { requireRole } = await import('../server/src/middleware/auth')
    app.get('/test', (req: any, _res: any, next: any) => { req.user = { id: 'u1' }; req.orgRole = 'owner'; next() }, requireRole('owner'), (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(200)
  })

  it('forbids incorrect role', async () => {
    const { requireRole } = await import('../server/src/middleware/auth')
    app.get('/test', (req: any, _res: any, next: any) => { req.user = { id: 'u1' }; req.orgRole = 'member'; next() }, requireRole('owner'), (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(403)
  })

  it('returns 401 if no user', async () => {
    const { requireRole } = await import('../server/src/middleware/auth')
    app.get('/test', requireRole('owner'), (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(401)
  })
})

describe('requirePlan', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'u1', plan: 'pro', subscriptionStatus: 'active' })
  })

  it('allows matching plan', async () => {
    const { requirePlan } = await import('../server/src/middleware/auth')
    app.get('/test', (req: any, _res: any, next: any) => { req.user = { id: 'u1' }; next() }, requirePlan('pro', 'business'), (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(200)
  })

  it('forbids non-matching plan', async () => {
    const { requirePlan } = await import('../server/src/middleware/auth')
    app.get('/test', (req: any, _res: any, next: any) => { req.user = { id: 'u1' }; next() }, requirePlan('business'), (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(403)
  })

  it('forbids past_due subscription', async () => {
    const { requirePlan } = await import('../server/src/middleware/auth')
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'u1', plan: 'pro', subscriptionStatus: 'past_due' })
    app.get('/test', (req: any, _res: any, next: any) => { req.user = { id: 'u1' }; next() }, requirePlan('pro'), (_req: any, res: any) => res.json({ ok: true }))
    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/test')
    expect(res.status).toBe(403)
  })
})