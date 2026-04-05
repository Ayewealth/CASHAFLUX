import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import { env } from './env'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  basePath: '/api/auth',
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
  },
})
