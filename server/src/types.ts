/**
 * Express Request augmentation for authenticated routes.
 *
 * `requireAuth` middleware (see `server/src/middleware/auth.ts`) populates
 * these fields after verifying a Better Auth session. Route handlers behind
 * `requireAuth` can safely assume `req.user` and `req.session` are defined.
 *
 * `plan` and other app-level fields (from the `users` table, not Better
 * Auth's `user` table) are intentionally omitted here — they require a
 * separate DB lookup per request and will be added when needed. Role /
 * permission checks are deferred to Phase 7.
 */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string }
      session?: { id: string; expiresAt: Date }
    }
  }
}

export {}
