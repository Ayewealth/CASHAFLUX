import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import supertest from 'supertest'

const mockDb = {
  query: {
    invitations: { findFirst: vi.fn() },
    organizations: { findFirst: vi.fn() },
    orgMembers: { findFirst: vi.fn(), findMany: vi.fn() },
  },
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
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

describe('Invitations API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
  })

  describe('GET /api/invitations/info', () => {
    it('returns email and org name for valid token', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue({ id: 'inv-1', email: 'a@b.com', status: 'pending', expiresAt: new Date(Date.now() + 86400000), orgId: 'org-1' })
      mockDb.query.organizations.findFirst.mockResolvedValue({ id: 'org-1', name: 'Test Org' })
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/info?token=valid-token')
      expect(res.status).toBe(200)
      expect(res.body.email).toBe('a@b.com')
      expect(res.body.orgName).toBe('Test Org')
      expect(res.body.expired).toBe(false)
    })

    it('returns 404 for invalid token', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/info?token=bad-token')
      expect(res.status).toBe(404)
    })

    it('returns 400 for missing token', async () => {
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/info')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/invitations/accept', () => {
    it('creates org member and marks accepted', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue({ id: 'inv-1', email: 'test@test.com', status: 'pending', expiresAt: new Date(Date.now() + 86400000), orgId: 'org-1', role: 'member', token: 'tok-1' })
      mockDb.query.organizations.findFirst.mockResolvedValue({ id: 'org-1', name: 'Test Org' })
      mockDb.query.orgMembers.findFirst.mockResolvedValue(null)
      mockDb.insert().values().returning.mockResolvedValue([{ id: 'om-1' }])
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/accept?token=valid-token')
      expect(res.status).toBe(200)
      expect(res.body.accepted).toBe(true)
      expect(res.body.orgId).toBe('org-1')
    })

    it('expired token returns expired: true', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue({ id: 'inv-1', email: 'test@test.com', status: 'pending', expiresAt: new Date(Date.now() - 86400000), orgId: 'org-1', role: 'member' })
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/accept?token=expired-token')
      expect(res.status).toBe(200)
      expect(res.body.expired).toBe(true)
    })

    it('already accepted returns alreadyAccepted: true', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue({ id: 'inv-1', email: 'test@test.com', status: 'accepted', expiresAt: new Date(Date.now() + 86400000), orgId: 'org-1' })
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/accept?token=used-token')
      expect(res.status).toBe(200)
      expect(res.body.alreadyAccepted).toBe(true)
    })

    it('returns 404 for unknown token', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/accept?token=unknown')
      expect(res.status).toBe(404)
    })

    it('returns 403 when email does not match', async () => {
      mockDb.query.invitations.findFirst.mockResolvedValue({ id: 'inv-1', email: 'other@test.com', status: 'pending', expiresAt: new Date(Date.now() + 86400000), orgId: 'org-1' })
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/accept?token=mismatch')
      expect(res.status).toBe(403)
    })

    it('returns 400 for missing token', async () => {
      const routes = (await import('../server/src/routes/invitations')).default
      app.use('/api/invitations', routes)
      const res = await supertest(app).get('/api/invitations/accept')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/organizations/user-orgs', () => {
    it('returns all user orgs', async () => {
      const { getUserOrgs } = await import('../server/src/lib/org')
      ;(getUserOrgs as any).mockResolvedValue([{ orgId: 'org-1', role: 'owner', orgName: 'Test Org' }, { orgId: 'org-2', role: 'admin', orgName: 'Org Two' }])
      const routes = (await import('../server/src/routes/organizations')).default
      app.use('/api/organizations', routes)
      const res = await supertest(app).get('/api/organizations/user-orgs')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0].orgName).toBe('Test Org')
    })
  })

  describe('GET /api/onboarding/status', () => {
    it('returns onboarded: true when user is in any org', async () => {
      mockDb.query.orgMembers.findFirst.mockResolvedValue({ orgId: 'org-1', role: 'owner' })
      const routes = (await import('../server/src/routes/onboarding')).default
      app.use('/api/onboarding', routes)
      const res = await supertest(app).get('/api/onboarding/status')
      expect(res.status).toBe(200)
      expect(res.body.onboarded).toBe(true)
    })

    it('returns onboarded: false when user has no org', async () => {
      mockDb.query.orgMembers.findFirst.mockResolvedValue(null)
      const routes = (await import('../server/src/routes/onboarding')).default
      app.use('/api/onboarding', routes)
      const res = await supertest(app).get('/api/onboarding/status')
      expect(res.status).toBe(200)
      expect(res.body.onboarded).toBe(false)
    })
  })
})