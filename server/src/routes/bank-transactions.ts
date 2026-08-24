import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import {
  bankTransactions,
  invoices,
  expenses,
  insertBankTransactionSchema,
} from '@shared/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

function normalizeDate(value: string): Date | null {
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

router.get('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const filters = req.query as Record<string, string | undefined>
    const conditions = [eq(bankTransactions.orgId, userOrg.orgId)]

    if (filters.bankAccountId) {
      conditions.push(eq(bankTransactions.bankAccountId, filters.bankAccountId))
    }
    if (filters.type) {
      conditions.push(eq(bankTransactions.type, filters.type as 'debit' | 'credit'))
    }
    if (filters.reconciled === 'true') {
      conditions.push(eq(bankTransactions.reconciled, true))
    } else if (filters.reconciled === 'false') {
      conditions.push(eq(bankTransactions.reconciled, false))
    }
    if (filters.dateFrom) {
      const from = normalizeDate(filters.dateFrom)
      if (from) conditions.push(gte(bankTransactions.date, from))
    }
    if (filters.dateTo) {
      const to = normalizeDate(filters.dateTo)
      if (to) conditions.push(lte(bankTransactions.date, to))
    }
    if (filters.unmatched === 'true') {
      const unmatchedCondition = and(
        sql`${bankTransactions.matchedInvoiceId} IS NULL`,
        sql`${bankTransactions.matchedExpenseId} IS NULL`,
      )
      if (unmatchedCondition) conditions.push(unmatchedCondition)
    }

    const rows = await db.query.bankTransactions.findMany({
      where: and(...conditions),
      orderBy: (t, { desc }) => [desc(t.date)],
    })
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch bank transactions' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = insertBankTransactionSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [transaction] = await db.insert(bankTransactions).values({
      ...parsed.data,
      id: crypto.randomUUID(),
      orgId: userOrg.orgId,
    }).returning()

    res.status(201).json(transaction)
  } catch {
    res.status(500).json({ error: 'Failed to create bank transaction' })
  }
})

// ─── Reconciliation summary ───
// Returns aggregate totals for a given account + date range.

router.get('/reconciliation-summary', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const filters = req.query as Record<string, string | undefined>
    const conditions = [eq(bankTransactions.orgId, userOrg.orgId)]

    if (filters.bankAccountId) {
      conditions.push(eq(bankTransactions.bankAccountId, filters.bankAccountId))
    }
    if (filters.dateFrom) {
      const from = normalizeDate(filters.dateFrom)
      if (from) conditions.push(gte(bankTransactions.date, from))
    }
    if (filters.dateTo) {
      const to = normalizeDate(filters.dateTo)
      if (to) conditions.push(lte(bankTransactions.date, to))
    }

    const rows = await db.query.bankTransactions.findMany({
      where: and(...conditions),
    })

    const sum = (list: typeof rows) => list.reduce((s, t) => s + parseFloat(t.amount), 0)
    const reconciled = rows.filter((t) => t.reconciled)
    const unreconciled = rows.filter((t) => !t.reconciled)

    res.json({
      totalTransactions: rows.length,
      totalAmount: +sum(rows).toFixed(2),
      reconciledTransactions: reconciled.length,
      reconciledAmount: +sum(reconciled).toFixed(2),
      unreconciledTransactions: unreconciled.length,
      unreconciledAmount: +sum(unreconciled).toFixed(2),
      matchedToInvoiceAmount: +sum(rows.filter((t) => t.matchedInvoiceId)).toFixed(2),
      matchedToExpenseAmount: +sum(rows.filter((t) => t.matchedExpenseId)).toFixed(2),
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch reconciliation summary' })
  }
})

// ─── CSV import with column mapping + duplicate detection ───
// Client sends raw rows (string[][]) plus a column map describing which
// column index holds each field. Server parses and validates per the map.

const importColumnMapSchema = z.object({
  date: z.number().int().nonnegative(),
  description: z.number().int().nonnegative(),
  amount: z.number().int().nonnegative(),
  type: z.number().int().nonnegative().optional(),
  category: z.number().int().nonnegative().optional(),
})

const importTransactionsSchema = z.object({
  bankAccountId: z.string().min(1),
  columnMap: importColumnMapSchema,
  rows: z.array(z.array(z.string())).min(1),
  hasHeader: z.boolean().default(true),
})

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[$,]/g, '').trim()
  return parseFloat(cleaned) || 0
}

function parseDate(raw: string): Date | null {
  const cleaned = raw.trim()
  if (!cleaned) return null
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d
  // MM/DD/YYYY or M/D/YYYY
  const mdy = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (mdy) {
    const parsed = new Date(Number(mdy[3]), Number(mdy[1]) - 1, Number(mdy[2]))
    return isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

router.post('/import', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = importTransactionsSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const { bankAccountId, columnMap, rows, hasHeader } = parsed.data

    const account = await db.query.bankAccounts.findFirst({
      where: (a, { and, eq }) => and(eq(a.id, bankAccountId), eq(a.orgId, userOrg.orgId)),
    })
    if (!account) {
      res.status(404).json({ error: 'Bank account not found' })
      return
    }

    // Fetch existing transactions in this account for duplicate detection.
    const existing = await db.query.bankTransactions.findMany({
      where: (t, { eq }) => eq(t.bankAccountId, bankAccountId),
    })
    const existingSet = new Set(
      existing.map((t) => {
        const d = t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date).split('T')[0]
        return `${d}|${t.amount}|${t.description}`
      })
    )

    const dataRows = hasHeader ? rows.slice(1) : rows
    const toInsert: Array<{
      id: string
      bankAccountId: string
      orgId: string
      date: Date
      description: string
      amount: string
      type: 'debit' | 'credit'
      category: string | null
      reconciled: boolean
      matchedInvoiceId: null
      matchedExpenseId: null
    }> = []
    const duplicates: Array<{ date: string; description: string; amount: string }> = []
    const skipped: Array<{ reason: string; row: string[] }> = []

    for (const row of dataRows) {
      const dateStr = row[columnMap.date]?.trim() ?? ''
      const description = row[columnMap.description]?.trim() ?? ''
      const amountStr = row[columnMap.amount]?.trim() ?? ''
      if (!dateStr || !description || !amountStr) {
        skipped.push({ reason: 'Missing required value', row })
        continue
      }

      const date = parseDate(dateStr)
      if (!date) {
        skipped.push({ reason: 'Invalid date', row })
        continue
      }

      let amount = parseAmount(amountStr)
      let type: 'debit' | 'credit'

      if (columnMap.type !== undefined) {
        const typeRaw = (row[columnMap.type] ?? '').toLowerCase()
        type = typeRaw.includes('debit') || typeRaw.includes('withdrawal') || typeRaw.includes('payment')
          ? 'debit'
          : typeRaw.includes('credit') || typeRaw.includes('deposit')
            ? 'credit'
            : amount < 0 ? 'debit' : 'credit'
      } else {
        type = amount < 0 ? 'debit' : 'credit'
        amount = Math.abs(amount)
      }

      const category = columnMap.category !== undefined && row[columnMap.category]?.trim()
        ? row[columnMap.category].trim()
        : null

      const normalizedAmount = amount.toFixed(2)
      const dedupKey = `${date.toISOString().split('T')[0]}|${normalizedAmount}|${description}`
      if (existingSet.has(dedupKey)) {
        duplicates.push({ date: date.toISOString().split('T')[0], description, amount: normalizedAmount })
        continue
      }
      existingSet.add(dedupKey)

      toInsert.push({
        id: crypto.randomUUID(),
        bankAccountId,
        orgId: userOrg.orgId,
        date,
        description,
        amount: normalizedAmount,
        type,
        category,
        reconciled: false,
        matchedInvoiceId: null,
        matchedExpenseId: null,
      })
    }

    let inserted: Array<Record<string, unknown>> = []
    if (toInsert.length > 0) {
      inserted = await db.insert(bankTransactions).values(toInsert).returning()
    }

    res.status(201).json({
      imported: toInsert.length,
      skipped: skipped.length,
      duplicates: duplicates.length,
      duplicateDetails: duplicates,
      transactions: inserted,
    })
  } catch {
    res.status(500).json({ error: 'Failed to import bank transactions' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const transaction = await db.query.bankTransactions.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, req.params.id), eq(t.orgId, userOrg.orgId)),
    })
    if (!transaction) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    res.json(transaction)
  } catch {
    res.status(500).json({ error: 'Failed to fetch bank transaction' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.bankTransactions.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, req.params.id), eq(t.orgId, userOrg.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    const parsed = insertBankTransactionSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    const [updated] = await db.update(bankTransactions)
      .set(parsed.data)
      .where(eq(bankTransactions.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update bank transaction' })
  }
})

// ─── Reconciliation endpoints ───

async function findTransaction(id: string, orgId: string) {
  return db.query.bankTransactions.findFirst({
    where: (t, { and, eq }) => and(eq(t.id, id), eq(t.orgId, orgId)),
  })
}

router.post('/:id/match-invoice', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const transaction = await findTransaction(req.params.id, userOrg.orgId)
    if (!transaction) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    const { invoiceId } = z.object({ invoiceId: z.string().min(1) }).parse(req.body)
    const invoice = await db.query.invoices.findFirst({
      where: (i, { and, eq }) => and(eq(i.id, invoiceId), eq(i.orgId, userOrg.orgId)),
    })
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' })
      return
    }

    const [updated] = await db.update(bankTransactions)
      .set({ matchedInvoiceId: invoiceId, matchedExpenseId: null })
      .where(eq(bankTransactions.id, req.params.id))
      .returning()

    // Side-effect: matching to an invoice marks it paid.
    await db.update(invoices)
      .set({ status: 'paid', updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId))

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to match invoice' })
  }
})

router.post('/:id/match-expense', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const transaction = await findTransaction(req.params.id, userOrg.orgId)
    if (!transaction) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    const { expenseId } = z.object({ expenseId: z.string().min(1) }).parse(req.body)
    const expense = await db.query.expenses.findFirst({
      where: (e, { and, eq }) => and(eq(e.id, expenseId), eq(e.orgId, userOrg.orgId)),
    })
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' })
      return
    }

    const [updated] = await db.update(bankTransactions)
      .set({ matchedExpenseId: expenseId, matchedInvoiceId: null })
      .where(eq(bankTransactions.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to match expense' })
  }
})

router.post('/:id/unmatch', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const transaction = await findTransaction(req.params.id, userOrg.orgId)
    if (!transaction) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    const [updated] = await db.update(bankTransactions)
      .set({ matchedInvoiceId: null, matchedExpenseId: null })
      .where(eq(bankTransactions.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to unmatch transaction' })
  }
})

router.post('/:id/reconcile', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const transaction = await findTransaction(req.params.id, userOrg.orgId)
    if (!transaction) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    const [updated] = await db.update(bankTransactions)
      .set({ reconciled: true })
      .where(eq(bankTransactions.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to reconcile transaction' })
  }
})

router.post('/:id/unreconcile', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const transaction = await findTransaction(req.params.id, userOrg.orgId)
    if (!transaction) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    const [updated] = await db.update(bankTransactions)
      .set({ reconciled: false })
      .where(eq(bankTransactions.id, req.params.id))
      .returning()

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to unreconcile transaction' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const existing = await db.query.bankTransactions.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, req.params.id), eq(t.orgId, userOrg.orgId)),
    })
    if (!existing) {
      res.status(404).json({ error: 'Bank transaction not found' })
      return
    }

    await db.delete(bankTransactions).where(eq(bankTransactions.id, req.params.id))

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete bank transaction' })
  }
})

export default router