import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { env } from '../env'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, 'templates')

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY)
  }
  return resendClient
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ id: string } | { error: Error }> {
  try {
    const result = await getResend().emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    if (result.data) {
      return { id: result.data.id }
    }
    return {
      error: new Error(result.error?.message ?? 'Failed to send email'),
    }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }
}

export async function sendTemplateEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ id: string } | { error: Error }> {
  if (!env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set, skipping email to', to)
    return { id: 'skipped' }
  }
  return sendEmail({ to, subject, html })
}

export function loadTemplate(name: string): string {
  const path = join(TEMPLATES_DIR, `${name}.html`)
  return readFileSync(path, 'utf-8')
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}