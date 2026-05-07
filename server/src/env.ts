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

  S3_ENDPOINT: optional('S3_ENDPOINT', ''),
  S3_BUCKET: optional('S3_BUCKET', ''),
  S3_ACCESS_KEY: optional('S3_ACCESS_KEY', ''),
  S3_SECRET_KEY: optional('S3_SECRET_KEY', ''),
} as const
