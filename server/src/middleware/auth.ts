import { type Request, type Response, type NextFunction } from 'express'
import { auth } from '../auth'

/**
 * Protect an API route behind a Better Auth session.
 *
 * Calls `auth.api.getSession` with the incoming request headers (which
 * carries the Better Auth session cookie). On miss, responds 401. On hit,
 * attaches `req.user` and `req.session` for downstream handlers.
 *
 * Better Auth's `getSession` expects a Web Fetch `Headers` instance; Express
 * exposes Node's `IncomingHttpHeaders` (which allows array values), so we
 * construct a `Headers` here. The cast is safe — Express flattens array
 * headers into a single string for consumption.
 *
 * No role/permission checks yet — those land in Phase 7.
 */
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
