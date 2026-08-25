import { Router } from 'express'
import { requireAuth, requirePlan } from '../middleware/auth'
import { db } from '../db/client'
import { recurringInvoices, invoices, invoiceLineItems, insertRecurringInvoiceSchema } from '@shared/schema'
import { and, eq, lte, isNull } from 'drizzle-orm'
import { demoFilter, andDemoFilter } from '../lib/demo-filter'

const router = Router()
router.use(requireAuth)
router.use(requirePlan('pro', 'business'))

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const rows = await db.query.recurringInvoices.findMany({
      where: (r, { and, eq, isNull }) => and(eq(r.orgId, req.orgId), req.demoSessionId ? eq(r.demoSessionId, req.demoSessionId) : isNull(r.demoSessionId)),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch recurring invoices' })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = insertRecurringInvoiceSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [ri] = await db.insert(recurringInvoices).values({
      ...parsed.data,
      id: crypto.randomUUID(),
      orgId: req.orgId,
    }).returning()

    res.status(201).json(ri)
  } catch {
    res.status(500).json({ error: 'Failed to create recurring invoice' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const existing = await db.query.recurringInvoices.findFirst({
      where: (r, { and, eq, isNull }) => and(eq(r.id, req.params.id), eq(r.orgId, req.orgId), req.demoSessionId ? eq(r.demoSessionId, req.demoSessionId) : isNull(r.demoSessionId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Recurring invoice not found' })
      return
    }
    await db.update(recurringInvoices).set({ active: false }).where(eq(recurringInvoices.id, req.params.id))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to deactivate recurring invoice' })
  }
})

router.post('/process', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const now = new Date()
    const due = await db.query.recurringInvoices.findMany({
      where: (r, { and, eq, isNull }) => and(eq(r.orgId, req.orgId), eq(r.active, true), lte(r.nextDate, now), req.demoSessionId ? eq(r.demoSessionId, req.demoSessionId) : isNull(r.demoSessionId)),
    })

    const FREQUENCY_DAYS: Record<string, number> = {
      weekly: 7, fortnightly: 14, monthly: 30, quarterly: 91, annually: 365,
    }

    let generated = 0
    for (const ri of due) {
      const template = await db.query.invoices.findFirst({
        where: (i, { and, eq, isNull }) => and(eq(i.id, ri.templateInvoiceId), req.demoSessionId ? eq(i.demoSessionId, req.demoSessionId) : isNull(i.demoSessionId)),
      })
      if (!template) continue

      const items = await db.query.invoiceLineItems.findMany({
        where: (li, { and, eq, isNull }) => and(eq(li.invoiceId, ri.templateInvoiceId), req.demoSessionId ? eq(li.demoSessionId, req.demoSessionId) : isNull(li.demoSessionId)),
      })

      const newId = crypto.randomUUID()
      await db.insert(invoices).values({
        id: newId,
        orgId: req.orgId,
        clientId: template.clientId,
        invoiceNumber: `INV-${String(Date.now()).slice(-4)}`,
        status: 'draft',
        issueDate: now,
        dueDate: new Date(now.getTime() + (ri.frequency === 'monthly' ? 30 : FREQUENCY_DAYS[ri.frequency] ?? 30) * 24 * 60 * 60 * 1000),
        currency: template.currency,
        subtotal: template.subtotal,
        taxTotal: template.taxTotal,
        discount: template.discount,
        total: template.total,
        notes: template.notes,
        createdBy: req.user!.id,
      })

      if (items.length > 0) {
        await db.insert(invoiceLineItems).values(
          items.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            invoiceId: newId,
          }))
        )
      }

      const days = FREQUENCY_DAYS[ri.frequency] ?? 30
      const nextDate = new Date(ri.nextDate.getTime() + days * 24 * 60 * 60 * 1000)
      await db.update(recurringInvoices)
        .set({ nextDate })
        .where(eq(recurringInvoices.id, ri.id))

      generated++
    }

    res.json({ generated })
  } catch {
    res.status(500).json({ error: 'Failed to process recurring invoices' })
  }
})

export default router