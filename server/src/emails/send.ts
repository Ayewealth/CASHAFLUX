import { Resend } from 'resend'
import { env } from '../env'

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
