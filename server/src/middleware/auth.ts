import { type Request, type Response, type NextFunction } from 'express'
import { auth } from '../auth'
import { getUserOrg, getUserOrgs } from '../lib/org'
import { db } from '../db/client'
import { organizations, users } from '@shared/schema'
import { eq } from 'drizzle-orm'

function parseCookie(cookie: string | undefined, name: string): string | undefined {
  if (!cookie) return undefined
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  })
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  req.user = session.user
  req.session = session.session
  // Resolve the active org from cookie or first membership
  const orgs = await getUserOrgs(req.user.id)
  if (orgs.length > 0) {
    const selectedOrgId = parseCookie(req.headers.cookie, 'cashaflux_org')
    const active = selectedOrgId ? orgs.find(o => o.orgId === selectedOrgId) : undefined
    req.orgId = (active ?? orgs[0]).orgId
    req.orgRole = (active ?? orgs[0]).role
  } else {
    req.orgId = ''
    req.orgRole = ''
  }
  // Resolve the active demo session
  if (req.orgId) {
    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, req.orgId),
      columns: { activeDemoSessionId: true },
    })
    req.demoSessionId = org?.activeDemoSessionId ?? null
  } else {
    req.demoSessionId = null
  }
  next()
}

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    if (!req.orgRole || !roles.includes(req.orgRole)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}

export function requirePlan(...plans: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    })
    if (!user || !plans.includes(user.plan) || user.subscriptionStatus === 'past_due') {
      res.status(403).json({ error: 'Upgrade required', requiredPlans: plans })
      return
    }
    next()
  }
}