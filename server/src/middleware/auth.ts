import { type Request, type Response, type NextFunction } from 'express'
import { auth } from '../auth'
import { getUserOrg } from '../lib/org'

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