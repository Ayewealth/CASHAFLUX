import { Router } from 'express'
import { db } from '../db/client'
import { contactSubmissions, insertContactSubmissionSchema } from '@shared/schema'
import { sendEmail } from '../emails/send'
import { env } from '../env'

const router = Router()

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const parsed = insertContactSubmissionSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid form data', details: parsed.error.flatten() })
    }

    const submission = await db.insert(contactSubmissions).values(parsed.data).returning()

    // Send notification email to support
    await sendEmail({
      to: env.SUPPORT_EMAIL,
      subject: `Contact form: ${parsed.data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${parsed.data.name}</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
        <p><strong>Subject:</strong> ${parsed.data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${parsed.data.message}</p>
      `,
    })

    // Send acknowledgement to the submitter
    await sendEmail({
      to: parsed.data.email,
      subject: 'We received your message',
      html: `<p>Hi ${parsed.data.name},</p><p>Thanks for reaching out! We've received your message and will get back to you within 24 hours.</p><p>Best,<br/>The Cashaflux Team</p>`,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    res.status(500).json({ error: 'Failed to submit form' })
  }
})

export default router