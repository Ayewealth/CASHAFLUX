declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string }
      session?: { id: string; expiresAt: Date }
      orgId: string
      orgRole: string
      demoSessionId: string | null
    }
  }
}

export {}