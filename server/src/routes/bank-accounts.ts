import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { bankAccounts, bankTransactions, insertBankAccountSchema } from '@shared/schema'
import { and, eq } from 'drizzle-orm'
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

    const rows = await db.query.bankAccounts.findMany({
      where: (a, { eq }) => eq(a.orgId, userOrg.orgId),
      orderBy: (a, { asc }) => [asc(a.name)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch bank accounts' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = insertBankAccountSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [account] = await db.insert(bankAccounts).values({
      ...parsed.data,
      id: crypto.randomUUID(),
      orgId: userOrg.orgId,
    }).returning()

    res.status(201).json(account)
  } catch {
    res.status(500).json({ error: 'Failed to create bank account' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const account = await db.query.bankAccounts.findFirst({
      where: (a, { and, eq }) => and(eq(a.id, req.params.id), eq(a.orgId, userOrg.orgId)),
    })
    if (!account) {
      res.status(404).json({ error: 'Bank account not found' })
      return
    }

    res.json(account)
  } catch {
    res.status(500).json({ error: 'Failed to fetch bank account' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.bankAccounts.findFirst({
      where: (a, { and, eq }) => and(eq(a.id, req.params.id), eq(a.orgId, userOrg.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Bank account not found' })
      return
    }

    const parsed = insertBankAccountSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [updated] = await db.update(bankAccounts)
      .set(parsed.data)
      .where(eq(bankAccounts.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update bank account' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.bankAccounts.findFirst({
      where: (a, { and, eq }) => and(eq(a.id, req.params.id), eq(a.orgId, userOrg.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Bank account not found' })
      return
    }

    await db.delete(bankTransactions).where(eq(bankTransactions.bankAccountId, req.params.id))
    await db.delete(bankAccounts).where(eq(bankAccounts.id, req.params.id))

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete bank account' })
  }
})

export default router