import 'dotenv/config'

function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: Number(optional('PORT', '3000')),

  DATABASE_URL: required('DATABASE_URL'),

  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: optional('BETTER_AUTH_URL', ''),

  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  EMAIL_FROM: optional('EMAIL_FROM', ''),

  STRIPE_SECRET_KEY: optional('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: optional('STRIPE_WEBHOOK_SECRET', ''),
  STRIPE_PRICE_PRO_MONTHLY: optional('STRIPE_PRICE_PRO_MONTHLY', ''),
  STRIPE_PRICE_PRO_ANNUAL: optional('STRIPE_PRICE_PRO_ANNUAL', ''),
  STRIPE_PRICE_BUSINESS_MONTHLY: optional('STRIPE_PRICE_BUSINESS_MONTHLY', ''),
  STRIPE_PRICE_BUSINESS_ANNUAL: optional('STRIPE_PRICE_BUSINESS_ANNUAL', ''),

  R2_ACCOUNT_ID: optional('R2_ACCOUNT_ID', ''),
  R2_ACCESS_KEY_ID: optional('R2_ACCESS_KEY_ID', ''),
  R2_SECRET_ACCESS_KEY: optional('R2_SECRET_ACCESS_KEY', ''),
  R2_BUCKET_NAME: optional('R2_BUCKET_NAME', ''),

  SUPPORT_EMAIL: optional('SUPPORT_EMAIL', ''),
} as const