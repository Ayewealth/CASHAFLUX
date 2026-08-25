import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { expenseCategories, insertExpenseCategorySchema } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { seedDefaultExpenseCategories } from '../seed'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    await seedDefaultExpenseCategories(req.orgId)

    const rows = await db.query.expenseCategories.findMany({
      where: (c, { eq }) => eq(c.orgId, req.orgId),
      orderBy: (c, { asc }) => [asc(c.name)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch expense categories' })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = insertExpenseCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [category] = await db.insert(expenseCategories).values({
      ...parsed.data,
      id: crypto.randomUUID(),
      orgId: req.orgId,
    }).returning()

    res.status(201).json(category)
  } catch {
    res.status(500).json({ error: 'Failed to create expense category' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.expenseCategories.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, req.params.id), eq(c.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Category not found' })
      return
    }

    await db.delete(expenseCategories).where(eq(expenseCategories.id, req.params.id))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete expense category' })
  }
})

export default router