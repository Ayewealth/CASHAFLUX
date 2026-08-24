import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { industries } from '@shared/schema'

const router = Router()

router.use(requireAuth)

// GET /api/industries — list all industries sorted by name
router.get('/', async (_req, res) => {
  try {
    const rows = await db.query.industries.findMany({
      orderBy: (industries, { asc }) => [asc(industries.name)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch industries' })
  }
})

// POST /api/industries — create a new industry
router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Industry name is required' })
    return
  }
  try {
    const trimmed = name.trim()
    const existing = await db.query.industries.findFirst({
      where: (industries, { sql }) => sql`LOWER(${industries.name}) = ${trimmed.toLowerCase()}`,
    })
    if (existing) {
      res.json(existing)
      return
    }
    const [industry] = await db.insert(industries).values({
      id: crypto.randomUUID(),
      name: trimmed,
    }).returning()
    res.json(industry)
  } catch {
    res.status(500).json({ error: 'Failed to create industry' })
  }
})

export default router