import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { mileageLogs, insertMileageLogSchema } from '@shared/schema'
import { and, eq, gte, lte } from 'drizzle-orm'

const router = Router()
router.use(requireAuth)

const IRS_MILEAGE_RATE_2025 = 0.70

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const filters = req.query as Record<string, string | undefined>
    const conditions = [eq(mileageLogs.orgId, req.orgId)]

    if (filters.dateFrom) {
      conditions.push(gte(mileageLogs.date, new Date(filters.dateFrom)))
    }
    if (filters.dateTo) {
      conditions.push(lte(mileageLogs.date, new Date(filters.dateTo)))
    }

    const rows = await db.query.mileageLogs.findMany({
      where: and(...conditions),
      orderBy: (m, { desc }) => [desc(m.date)],
    })

    const totalMiles = rows.reduce((sum, r) => sum + parseFloat(r.miles), 0)
    const totalDeduction = +(totalMiles * IRS_MILEAGE_RATE_2025).toFixed(2)

    res.json({ logs: rows, totalMiles: +totalMiles.toFixed(1), totalDeduction })
  } catch {
    res.status(500).json({ error: 'Failed to fetch mileage logs' })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = insertMileageLogSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [log] = await db.insert(mileageLogs).values({
      ...parsed.data,
      id: crypto.randomUUID(),
      orgId: req.orgId,
      createdBy: req.user!.id,
    }).returning()

    res.status(201).json(log)
  } catch {
    res.status(500).json({ error: 'Failed to create mileage log' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const log = await db.query.mileageLogs.findFirst({
      where: (m, { and, eq }) => and(eq(m.id, req.params.id), eq(m.orgId, req.orgId)),
    })
    if (!log) {
      res.status(404).json({ error: 'Mileage log not found' })
      return
    }

    res.json(log)
  } catch {
    res.status(500).json({ error: 'Failed to fetch mileage log' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.mileageLogs.findFirst({
      where: (m, { and, eq }) => and(eq(m.id, req.params.id), eq(m.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Mileage log not found' })
      return
    }

    const parsed = insertMileageLogSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [updated] = await db.update(mileageLogs)
      .set(parsed.data)
      .where(eq(mileageLogs.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update mileage log' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.mileageLogs.findFirst({
      where: (m, { and, eq }) => and(eq(m.id, req.params.id), eq(m.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Mileage log not found' })
      return
    }

    await db.delete(mileageLogs).where(eq(mileageLogs.id, req.params.id))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete mileage log' })
  }
})

export default router