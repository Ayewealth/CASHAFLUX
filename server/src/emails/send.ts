// Email sending service — stub.
// Task 2 will implement this with the Resend SDK (env.RESEND_API_KEY / env.EMAIL_FROM).
// The dynamic import in auth.ts defers resolution to runtime, but TypeScript still
// type-checks the module surface, so the contract is declared here.

export interface SendEmailArgs {
  to: string
  subject: string
  html: string
}

export async function sendEmail(_args: SendEmailArgs): Promise<void> {
  // Intentional no-op until Task 2 wires up the Resend client.
}
