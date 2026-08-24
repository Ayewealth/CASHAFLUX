import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { invoices, expenses, expenseCategories } from '@shared/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

const IRS_QUARTERLY_DATES = [
  { quarter: 'Q1', deadline: 'Apr 15', month: 4, day: 15 },
  { quarter: 'Q2', deadline: 'Jun 15', month: 6, day: 15 },
  { quarter: 'Q3', deadline: 'Sep 15', month: 9, day: 15 },
  { quarter: 'Q4', deadline: 'Jan 15', month: 1, day: 15 },
]

router.get('/summary', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const orgId = userOrg.orgId
    const year = parseInt((req.query as any).year) || new Date().getFullYear()
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    const totalIncome = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}),'0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, yearStart), lte(invoices.createdAt, yearEnd)))
      .then(r => parseFloat(r[0]?.total ?? '0'))

    const byCategory = await db
      .select({ category: expenses.category, total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.createdAt, yearStart), lte(expenses.createdAt, yearEnd)))
      .groupBy(expenses.category)
      .orderBy(expenses.category)

    const quarterlyDeadlines = IRS_QUARTERLY_DATES.map((q) => {
      const deadlineDate = new Date(q.month >= 4 ? year : year + 1, q.month - 1, q.day)
      const now = new Date()
      const diff = deadlineDate.getTime() - now.getTime()
      let status: 'past' | 'upcoming' | 'future'
      if (diff < 0) status = 'past'
      else if (diff < 30 * 86400000) status = 'upcoming'
      else status = 'future'
      return { ...q, deadlineDate, status }
    })

    const totalExpenses = byCategory.reduce((s, r) => s + parseFloat(r.total), 0)

    res.json({
      year,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      quarterlyDeadlines,
      categories: byCategory.map(r => ({ category: r.category, amount: parseFloat(r.total) })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch tax summary' })
  }
})

router.get('/export', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const orgId = userOrg.orgId
    const year = parseInt((req.query as any).year) || new Date().getFullYear()
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    const totalIncome = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}),'0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, yearStart), lte(invoices.createdAt, yearEnd)))
      .then(r => parseFloat(r[0]?.total ?? '0'))

    const expenseRows = await db
      .select({ category: expenses.category, total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.createdAt, yearStart), lte(expenses.createdAt, yearEnd)))
      .groupBy(expenses.category)
      .orderBy(expenses.category)

    const totalExpenses = expenseRows.reduce((s, r) => s + parseFloat(r.total), 0)

    const expenseCsv = expenseRows.map(r => `"${r.category}",${r.total}`).join('\n')
    const csv = `Tax Year,${year}\n\nINCOME\nTotal Income,${totalIncome.toFixed(2)}\n\nEXPENSES\nCategory,Amount\n${expenseCsv}\n\nTotal Expenses,${totalExpenses.toFixed(2)}\nNet Income,${(totalIncome - totalExpenses).toFixed(2)}`

    res.json({
      year,
      totalIncome,
      totalExpenses,
      expensesByCategory: expenseRows.map(r => ({ category: r.category, amount: parseFloat(r.total) })),
      csv,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate tax export' })
  }
})

export default router