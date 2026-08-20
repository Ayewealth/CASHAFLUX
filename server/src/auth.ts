import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import { env } from './env'
import { users } from '@shared/schema'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  basePath: '/api/auth',
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async (data) => {
      const { sendEmail } = await import('./emails/send')
      await sendEmail({
        to: data.user.email,
        subject: 'Reset your Cashaflux password',
        html: `<a href="${data.url}">Reset password</a>`,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      const { sendEmail } = await import('./emails/send')
      await sendEmail({
        to: data.user.email,
        subject: 'Verify your Cashaflux email',
        html: `<a href="${data.url}">Verify email</a>`,
      })
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(users).values({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: false,
            hashedPassword: '',
            plan: 'free',
          })
        },
      },
    },
  },
})
