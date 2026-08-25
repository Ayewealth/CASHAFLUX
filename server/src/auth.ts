import { betterAuth, APIError } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import { env } from './env'
import { users } from '@shared/schema'

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
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for'],
      trustedProxies: ['::1'],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async (data) => {
      const { sendTemplateEmail, loadTemplate, renderTemplate } = await import('./emails/send')
      const template = loadTemplate('reset-password')
      const html = renderTemplate(template, { RESET_URL: data.url })
      const result = await sendTemplateEmail({
        to: data.user.email,
        subject: 'Reset your Cashaflux password',
        html,
      })
      if ('error' in result) {
        console.error('[auth] Failed to send password reset email:', result.error)
        throw new APIError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to send password reset email',
        })
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      const { sendTemplateEmail, loadTemplate, renderTemplate } = await import('./emails/send')
      const template = loadTemplate('verify-email')
      const html = renderTemplate(template, { VERIFY_URL: data.url })
      const result = await sendTemplateEmail({
        to: data.user.email,
        subject: 'Verify your Cashaflux email',
        html,
      })
      if ('error' in result) {
        console.error('[auth] Failed to send verification email:', result.error)
        throw new APIError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to send verification email',
        })
      }
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
            hashedPassword: '',
            plan: 'free',
          })
          try {
            const { sendTemplateEmail, loadTemplate, renderTemplate } = await import('./emails/send')
            const template = loadTemplate('welcome')
            const html = renderTemplate(template, { APP_URL: env.BETTER_AUTH_URL })
            const result = await sendTemplateEmail({
              to: user.email,
              subject: 'Welcome to Cashaflux — let\'s get started',
              html,
            })
            if ('error' in result) {
              console.error('[auth] Failed to send welcome email:', result.error)
            }
          } catch (err) {
            console.error('[auth] Failed to send welcome email:', err)
          }
        },
      },
    },
  },
})