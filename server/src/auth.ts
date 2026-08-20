import { betterAuth, APIError } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import { env } from './env'
import { users } from '@shared/schema'

/**
 * Validate password against the global auth policy.
 *
 * Better Auth v1.7.1's `emailAndPassword` config only exposes
 * `minPasswordLength` / `maxPasswordLength` — there is no
 * `passwordValidation` callback or regex hook. The sign-up /
 * password-reset route handlers MUST call this before invoking
 * `auth.api.signUp` / `auth.api.resetPassword` so complexity
 * rules are enforced server-side.
 *
 * Policy: 8-128 chars AND at least one digit.
 */
export function validatePassword(password: string): void {
  if (password.length < 8 || password.length > 128) {
    throw new APIError('BAD_REQUEST', {
      message: 'Password must be between 8 and 128 characters',
    })
  }
  if (!/\d/.test(password)) {
    throw new APIError('BAD_REQUEST', {
      message: 'Password must contain at least one number',
    })
  }
}

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
            emailVerified: user.emailVerified,
            hashedPassword: '', // Better Auth owns the hash in account.password — this field is unused
            plan: 'free',
          })
        },
      },
    },
  },
})
