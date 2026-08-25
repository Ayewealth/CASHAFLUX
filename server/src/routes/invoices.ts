import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { invoices, invoiceLineItems, clients, organizations, insertInvoiceSchema, insertInvoiceLineItemSchema } from '@shared/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import { z } from 'zod'
import { demoFilter, andDemoFilter } from '../lib/demo-filter'
import { sendTemplateEmail, loadTemplate, renderTemplate } from '../emails/send'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '../lib/invoice-pdf'

const router = Router()
router.use(requireAuth)

const createInvoiceSchema = insertInvoiceSchema.extend({
  lineItems: z.array(insertInvoiceLineItemSchema.omit({ invoiceId: true })).optional(),
})

const updateInvoiceSchema = insertInvoiceSchema.partial().extend({
  lineItems: z.array(insertInvoiceLineItemSchema.omit({ invoiceId: true })).optional(),
})

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const filters = req.query as Record<string, string | undefined>
    const conditions = [eq(invoices.orgId, req.orgId)]
    andDemoFilter(conditions, invoices.demoSessionId, req.demoSessionId)

    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status as typeof invoices.$inferSelect.status))
    }
    if (filters.clientId) {
      conditions.push(eq(invoices.clientId, filters.clientId))
    }
    if (filters.dateFrom) {
      conditions.push(gte(invoices.issueDate, new Date(filters.dateFrom)))
    }
    if (filters.dateTo) {
      conditions.push(lte(invoices.issueDate, new Date(filters.dateTo)))
    }

    const rows = await db
      .select({
        id: invoices.id,
        orgId: invoices.orgId,
        clientId: invoices.clientId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxTotal: invoices.taxTotal,
        discount: invoices.discount,
        total: invoices.total,
        notes: invoices.notes,
        logoR2Key: invoices.logoR2Key,
        createdBy: invoices.createdBy,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        clientName: clients.name,
        clientCompany: clients.company,
        clientEmail: clients.email,
      })
      .from(invoices)
      .innerJoin(clients, eq(clients.id, invoices.clientId))
      .where(and(...conditions))
      .orderBy(invoices.createdAt)

    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = createInvoiceSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const { lineItems: bodyLineItems, ...invoiceData } = parsed.data
    const invoiceId = crypto.randomUUID()

    const [invoice] = await db.insert(invoices).values({
      ...invoiceData,
      id: invoiceId,
      orgId: req.orgId,
      createdBy: req.user!.id,
    }).returning()

    if (bodyLineItems && bodyLineItems.length > 0) {
      await db.insert(invoiceLineItems).values(
        bodyLineItems.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          invoiceId,
        }))
      )
    }

    const lineItems = await db.query.invoiceLineItems.findMany({
      where: (li, { eq }) => eq(li.invoiceId, invoiceId),
    })

    res.status(201).json({ ...invoice, lineItems })
  } catch {
    res.status(500).json({ error: 'Failed to create invoice' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const invoice = await db.query.invoices.findFirst({
      where: (i, { and, eq, isNull }) => and(eq(i.id, req.params.id), eq(i.orgId, req.orgId), req.demoSessionId ? eq(i.demoSessionId, req.demoSessionId) : isNull(i.demoSessionId)),
    })
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }

    const lineItems = await db.query.invoiceLineItems.findMany({
      where: (li, { eq }) => eq(li.invoiceId, req.params.id),
    })

    res.json({ ...invoice, lineItems })
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoice' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.invoices.findFirst({
      where: (i, { and, eq }) => and(eq(i.id, req.params.id), eq(i.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }

    const parsed = updateInvoiceSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const { lineItems: bodyLineItems, ...invoiceData } = parsed.data

    if (Object.keys(invoiceData).length > 0) {
      await db.update(invoices)
        .set({ ...invoiceData, updatedAt: new Date() })
        .where(eq(invoices.id, req.params.id))
    }

    if (bodyLineItems) {
      await db.delete(invoiceLineItems)
        .where(eq(invoiceLineItems.invoiceId, req.params.id))

      if (bodyLineItems.length > 0) {
        await db.insert(invoiceLineItems).values(
          bodyLineItems.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            invoiceId: req.params.id,
          }))
        )
      }
    }

    const updated = await db.query.invoices.findFirst({
      where: (i, { and, eq, isNull }) => and(eq(i.id, req.params.id), req.demoSessionId ? eq(i.demoSessionId, req.demoSessionId) : isNull(i.demoSessionId)),
    })
    const lineItems = await db.query.invoiceLineItems.findMany({
      where: (li, { eq }) => eq(li.invoiceId, req.params.id),
    })

    res.json({ ...updated, lineItems })
  } catch {
    res.status(500).json({ error: 'Failed to update invoice' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.invoices.findFirst({
      where: (i, { and, eq }) => and(eq(i.id, req.params.id), eq(i.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }

    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, req.params.id))
    await db.delete(invoices).where(eq(invoices.id, req.params.id))

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete invoice' })
  }
})

router.post('/:id/mark-paid', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.invoices.findFirst({
      where: (i, { and, eq }) => and(eq(i.id, req.params.id), eq(i.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }
    if (existing.status === 'paid') {
      res.status(400).json({ error: 'Invoice is already paid' })
      return
    }

    const [updated] = await db.update(invoices)
      .set({ status: 'paid', updatedAt: new Date() })
      .where(eq(invoices.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to mark invoice as paid' })
  }
})

router.post('/:id/send', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const invoice = await db.query.invoices.findFirst({
      where: (i, { and, eq, isNull }) => and(eq(i.id, req.params.id), eq(i.orgId, req.orgId), req.demoSessionId ? eq(i.demoSessionId, req.demoSessionId) : isNull(i.demoSessionId)),
    })
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }

    const client = await db.query.clients.findFirst({
      where: (c, { and, eq, isNull }) => and(eq(c.id, invoice.clientId), req.demoSessionId ? eq(c.demoSessionId, req.demoSessionId) : isNull(c.demoSessionId)),
    })
    if (!client || !client.email) {
      res.status(400).json({ error: 'Client has no email address' })
      return
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, req.orgId),
    })

    const orgName = org?.name ?? 'Your Business'
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(invoice.total))
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const invoiceUrl = `${req.protocol}://${req.get('host')}/dashboard/invoices/${invoice.id}/edit`

    const template = loadTemplate('invoice-sent')
    const html = renderTemplate(template, {
      INVOICE_NUMBER: invoice.invoiceNumber,
      CLIENT_NAME: client.name,
      ORG_NAME: orgName,
      AMOUNT: amount,
      DUE_DATE: dueDate,
      INVOICE_URL: invoiceUrl,
      ORG_ADDRESS: [org?.addressLine1, org?.city, org?.state, org?.zip].filter(Boolean).join(', '),
    })

    const result = await sendTemplateEmail({
      to: client.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${orgName}`,
      html,
    })

    if ('error' in result) {
      res.status(500).json({ error: 'Failed to send email' })
      return
    }

    await db.update(invoices)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(invoices.id, req.params.id))

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to send invoice' })
  }
})

router.get('/:id/pdf', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const invoice = await db.query.invoices.findFirst({
      where: (i, { and, eq, isNull }) => and(eq(i.id, req.params.id), eq(i.orgId, req.orgId), req.demoSessionId ? eq(i.demoSessionId, req.demoSessionId) : isNull(i.demoSessionId)),
    })
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }

    const lineItems = await db.query.invoiceLineItems.findMany({
      where: (li, { eq }) => eq(li.invoiceId, req.params.id),
    })

    const client = await db.query.clients.findFirst({
      where: (c, { and, eq, isNull }) => and(eq(c.id, invoice.clientId), req.demoSessionId ? eq(c.demoSessionId, req.demoSessionId) : isNull(c.demoSessionId)),
    })

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, req.orgId),
    })

const { default: React } = await import('react')
    const { renderToStream } = await import('@react-pdf/renderer')

    const element = React.createElement(InvoicePDF, { invoice, lineItems, client, org })
    const stream = await renderToStream(element as any)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`)
    stream.pipe(res)
  } catch {
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

export default router