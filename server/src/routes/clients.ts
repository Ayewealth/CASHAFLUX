import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { clients, users, insertClientSchema } from '@shared/schema'
import { and, eq, sql } from 'drizzle-orm'
import { isAtLimit, planLimitResponse } from '../lib/limits'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const rows = await db.query.clients.findMany({
      where: (c, { and, eq }) => and(eq(c.orgId, req.orgId), eq(c.archived, false)),
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const clientCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(and(eq(clients.orgId, req.orgId), eq(clients.archived, false)))
      .then(r => Number(r[0]?.count ?? 0))

    const user = await db.query.users.findFirst({ where: (u, {eq}) => eq(u.id, req.user!.id) })
    if (isAtLimit({ current: clientCount, limit: 5, plan: user?.plan ?? 'free', resource: 'clients' })) {
      return planLimitResponse(res, { current: clientCount, limit: 5, plan: user?.plan ?? 'free', resource: 'clients' })
    }

    const parsed = insertClientSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [client] = await db.insert(clients).values({
      ...parsed.data,
      id: crypto.randomUUID(),
      orgId: req.orgId,
    }).returning()

    res.status(201).json(client)
  } catch {
    res.status(500).json({ error: 'Failed to create client' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const client = await db.query.clients.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, req.params.id), eq(c.orgId, req.orgId)),
    })
    if (!client) {
      res.status(404).json({ error: 'Client not found' })
      return
    }

    res.json(client)
  } catch {
    res.status(500).json({ error: 'Failed to fetch client' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.clients.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, req.params.id), eq(c.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Client not found' })
      return
    }

    const parsed = insertClientSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [updated] = await db.update(clients)
      .set(parsed.data)
      .where(eq(clients.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update client' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.clients.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, req.params.id), eq(c.orgId, req.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Client not found' })
      return
    }

    await db.update(clients)
      .set({ archived: true })
      .where(eq(clients.id, req.params.id))

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to archive client' })
  }
})

export default router