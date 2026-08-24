import { type Request, type Response, type NextFunction } from 'express'
import { auth } from '../auth'
import { getUserOrg } from '../lib/org'
import { db } from '../db/client'
import { users } from '@shared/schema'
import { eq } from 'drizzle-orm'

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
  next()
}

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const userOrg = await getUserOrg(req.user.id)
    if (!userOrg || !roles.includes(userOrg.role)) {
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