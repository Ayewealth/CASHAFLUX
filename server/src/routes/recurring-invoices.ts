import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { recurringInvoices, invoices, invoiceLineItems, insertRecurringInvoiceSchema } from '@shared/schema'
import { and, eq, lte } from 'drizzle-orm'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const rows = await db.query.recurringInvoices.findMany({
      where: (r, { eq }) => eq(r.orgId, userOrg.orgId),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch recurring invoices' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
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
      orgId: userOrg.orgId,
    }).returning()

    res.status(201).json(ri)
  } catch {
    res.status(500).json({ error: 'Failed to create recurring invoice' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const existing = await db.query.recurringInvoices.findFirst({
      where: (r, { and, eq }) => and(eq(r.id, req.params.id), eq(r.orgId, userOrg.orgId)),
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
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const now = new Date()
    const due = await db.query.recurringInvoices.findMany({
      where: (r, { and, eq }) => and(eq(r.orgId, userOrg.orgId), eq(r.active, true), lte(r.nextDate, now)),
    })

    const FREQUENCY_DAYS: Record<string, number> = {
      weekly: 7, fortnightly: 14, monthly: 30, quarterly: 91, annually: 365,
    }

    let generated = 0
    for (const ri of due) {
      const template = await db.query.invoices.findFirst({
        where: (i, { eq }) => eq(i.id, ri.templateInvoiceId),
      })
      if (!template) continue

      const items = await db.query.invoiceLineItems.findMany({
        where: (li, { eq }) => eq(li.invoiceId, ri.templateInvoiceId),
      })

      const newId = crypto.randomUUID()
      await db.insert(invoices).values({
        id: newId,
        orgId: userOrg.orgId,
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