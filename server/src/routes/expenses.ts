import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { expenses, expenseAllocations, insertExpenseSchema, insertExpenseAllocationSchema } from '@shared/schema'
import { and, eq, gte, lte, inArray, isNull, sql } from 'drizzle-orm'
import { uploadFile } from '../lib/r2'
import { z } from 'zod'
import { demoFilter, andDemoFilter } from '../lib/demo-filter'

const router = Router()
router.use(requireAuth)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

const createExpenseSchema = insertExpenseSchema.extend({
  allocations: z.array(insertExpenseAllocationSchema.omit({ expenseId: true })).optional(),
})

const updateExpenseSchema = insertExpenseSchema.partial().extend({
  allocations: z.array(insertExpenseAllocationSchema.omit({ expenseId: true })).optional(),
})

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const filters = req.query as Record<string, string | undefined>
    const conditions = [eq(expenses.orgId, req.orgId)]
    andDemoFilter(conditions, expenses.demoSessionId, req.demoSessionId)

    if (filters.category) {
      conditions.push(eq(expenses.category, filters.category))
    }
    if (filters.reconciled === 'true') {
      conditions.push(eq(expenses.reconciled, true))
    } else if (filters.reconciled === 'false') {
      conditions.push(eq(expenses.reconciled, false))
    }
    if (filters.dateFrom) {
      conditions.push(gte(expenses.date, new Date(filters.dateFrom)))
    }
    if (filters.dateTo) {
      conditions.push(lte(expenses.date, new Date(filters.dateTo)))
    }
    if (filters.amountMin) {
      conditions.push(gte(expenses.amount, filters.amountMin))
    }
    if (filters.amountMax) {
      conditions.push(lte(expenses.amount, filters.amountMax))
    }
    if (filters.search) {
      const term = `%${filters.search.toLowerCase()}%`
      conditions.push(
        sql`(LOWER(${expenses.merchant}) LIKE ${term} OR LOWER(${expenses.description}) LIKE ${term})`
      )
    }

    const rows = await db.query.expenses.findMany({
      where: and(...conditions),
      orderBy: (e, { desc }) => [desc(e.date)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = createExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const { allocations: bodyAllocations, ...expenseData } = parsed.data
    const expenseId = crypto.randomUUID()

    const [expense] = await db.insert(expenses).values({
      ...expenseData,
      id: expenseId,
      orgId: req.orgId,
      createdBy: req.user!.id,
    }).returning()

    if (bodyAllocations && bodyAllocations.length > 0) {
      await db.insert(expenseAllocations).values(
        bodyAllocations.map((a) => ({
          ...a,
          id: crypto.randomUUID(),
          expenseId,
        }))
      )
    }

    res.status(201).json(expense)
  } catch {
    res.status(500).json({ error: 'Failed to create expense' })
  }
})

router.get('/export/csv', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const filters = req.query as Record<string, string | undefined>
    const conditions = [eq(expenses.orgId, req.orgId)]
    andDemoFilter(conditions, expenses.demoSessionId, req.demoSessionId)

    if (filters.category) conditions.push(eq(expenses.category, filters.category))
    if (filters.dateFrom) conditions.push(gte(expenses.date, new Date(filters.dateFrom)))
    if (filters.dateTo) conditions.push(lte(expenses.date, new Date(filters.dateTo)))

    const rows = await db.query.expenses.findMany({
      where: and(...conditions),
      orderBy: (e, { desc }) => [desc(e.date)],
    })

    const header = 'Date,Merchant,Category,Amount,Reconciled,Description\n'
    const csv = rows.map((e) =>
      `${e.date.toISOString().split('T')[0]},"${e.merchant}","${e.category}",${e.amount},${e.reconciled ? 'Yes' : 'No'},"${(e.description ?? '').replace(/"/g, '""')}"`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"')
    res.send(header + csv)
  } catch {
    res.status(500).json({ error: 'Failed to export expenses' })
  }
})

router.post('/bulk-delete', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body)
    if (ids.length === 0) {
      res.status(400).json({ error: 'No IDs provided' })
      return
    }

    await db.delete(expenses).where(and(eq(expenses.orgId, req.orgId), inArray(expenses.id, ids), ...(req.demoSessionId ? [eq(expenses.demoSessionId, req.demoSessionId)] : [isNull(expenses.demoSessionId)])))

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to bulk delete expenses' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const expense = await db.query.expenses.findFirst({
      where: (e, { and, eq, isNull }) => and(eq(e.id, req.params.id), eq(e.orgId, req.orgId), req.demoSessionId ? eq(e.demoSessionId, req.demoSessionId) : isNull(e.demoSessionId)),
    })
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' })
      return
    }

    const allocations = await db.query.expenseAllocations.findMany({
      where: (a, { eq }) => eq(a.expenseId, req.params.id),
    })

    res.json({ ...expense, allocations })
  } catch {
    res.status(500).json({ error: 'Failed to fetch expense' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.expenses.findFirst({
      where: (e, { and, eq }) => and(eq(e.id, req.params.id), eq(e.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Expense not found' })
      return
    }

    const parsed = updateExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const { allocations: bodyAllocations, ...expenseData } = parsed.data

    if (Object.keys(expenseData).length > 0) {
      await db.update(expenses)
        .set(expenseData)
        .where(eq(expenses.id, req.params.id))
    }

    if (bodyAllocations) {
      await db.delete(expenseAllocations).where(eq(expenseAllocations.expenseId, req.params.id))
      if (bodyAllocations.length > 0) {
        await db.insert(expenseAllocations).values(
          bodyAllocations.map((a) => ({
            ...a,
            id: crypto.randomUUID(),
            expenseId: req.params.id,
          }))
        )
      }
    }

    const [updated] = await db.select().from(expenses).where(and(eq(expenses.id, req.params.id), req.demoSessionId ? eq(expenses.demoSessionId, req.demoSessionId) : isNull(expenses.demoSessionId))).limit(1)

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update expense' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.expenses.findFirst({
      where: (e, { and, eq }) => and(eq(e.id, req.params.id), eq(e.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Expense not found' })
      return
    }

    await db.delete(expenses).where(eq(expenses.id, req.params.id))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

router.post('/:id/receipt', upload.single('file'), async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const expenseId = req.params.id as string

    const existing = await db.query.expenses.findFirst({
      where: (e, { and, eq }) => and(eq(e.id, expenseId), eq(e.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Expense not found' })
      return
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const key = await uploadFile(req.orgId, 'receipts', req.file.buffer, req.file.mimetype)
    if (!key) {
      res.status(503).json({ error: 'File upload is not configured' })
      return
    }

    await db.update(expenses)
      .set({ receiptR2Key: key })
      .where(eq(expenses.id, expenseId))

    res.json({ key })
  } catch {
    res.status(500).json({ error: 'Failed to upload receipt' })
  }
})

export default router