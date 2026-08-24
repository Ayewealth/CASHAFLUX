import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { invoices, expenses, clients } from '@shared/schema'
import { and, eq, gte, lt, lte, sql } from 'drizzle-orm'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

function generateMonthRange(start: Date, end: Date) {
  const months: { month: string; year: string; total: string }[] = []
  const d = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDate = new Date(end.getFullYear(), end.getMonth(), 1)
  while (d <= endDate) {
    months.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: String(d.getFullYear()),
      total: '0',
    })
    d.setMonth(d.getMonth() + 1)
  }
  return months
}

router.get('/summary', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const orgId = userOrg.orgId
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    // MTD Revenue (paid invoices by issueDate)
    const mtdRevenue = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), '0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.issueDate, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    const prevMonthRevenue = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), '0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.issueDate, firstOfPrevMonth), lt(invoices.issueDate, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    // Outstanding invoices total
    const outstanding = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), '0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'sent')))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    // MTD Expenses (by expense date)
    const mtdExpenses = await db
      .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}), '0')` })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.date, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    const prevMonthExpenses = await db
      .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}), '0')` })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.date, firstOfPrevMonth), lt(expenses.date, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    // Net cash flow
    const netCashFlow = mtdRevenue - mtdExpenses
    const prevNetCashFlow = prevMonthRevenue - prevMonthExpenses

    // Monthly cash flow for chart (last 12 months by issueDate/date)
    const rawIncome = await db
      .select({
        month: sql<string>`to_char(${invoices.issueDate}, 'Mon')`,
        year: sql<string>`to_char(${invoices.issueDate}, 'YYYY')`,
        total: sql<string>`COALESCE(SUM(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.issueDate, twelveMonthsAgo)))
      .groupBy(sql`to_char(${invoices.issueDate}, 'Mon')`, sql`to_char(${invoices.issueDate}, 'YYYY')`)
      .orderBy(sql`MIN(${invoices.issueDate})`)

    const rawExpenses = await db
      .select({
        month: sql<string>`to_char(${expenses.date}, 'Mon')`,
        year: sql<string>`to_char(${expenses.date}, 'YYYY')`,
        total: sql<string>`COALESCE(SUM(${expenses.amount}), '0')`,
      })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.date, twelveMonthsAgo)))
      .groupBy(sql`to_char(${expenses.date}, 'Mon')`, sql`to_char(${expenses.date}, 'YYYY')`)
      .orderBy(sql`MIN(${expenses.date})`)

    // Zero-fill: generate all 12 months, overlay actual data
    const monthSkeleton = generateMonthRange(twelveMonthsAgo, now)
    const incomeMap = new Map(rawIncome.map((r) => [`${r.month}-${r.year}`, r.total]))
    const expenseMap = new Map(rawExpenses.map((r) => [`${r.month}-${r.year}`, r.total]))

    const monthlyIncome = monthSkeleton.map((m) => ({
      ...m,
      total: incomeMap.get(`${m.month}-${m.year}`) ?? '0',
    }))
    const monthlyExpenses = monthSkeleton.map((m) => ({
      ...m,
      total: expenseMap.get(`${m.month}-${m.year}`) ?? '0',
    }))

    // Recent 5 invoices (by issueDate descending)
    const recentInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: clients.name,
        clientCompany: clients.company,
        amount: invoices.total,
        dueDate: invoices.dueDate,
        status: invoices.status,
      })
      .from(invoices)
      .innerJoin(clients, eq(clients.id, invoices.clientId))
      .where(eq(invoices.orgId, orgId))
      .orderBy(sql`${invoices.issueDate} DESC NULLS LAST`)
      .limit(5)

    // Recent 5 expenses (by date descending)
    const recentExpenses = await db.query.expenses.findMany({
      where: (e, { eq }) => eq(e.orgId, orgId),
      orderBy: (e, { desc }) => [desc(e.date)],
      limit: 5,
    })

    // Upcoming due invoices (within 14 days)
    const fourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const upcomingDue = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: clients.name,
        amount: invoices.total,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .innerJoin(clients, eq(clients.id, invoices.clientId))
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'sent'), lte(invoices.dueDate, fourteenDays)))
      .orderBy(invoices.dueDate)

    // Client count
    const clientCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(and(eq(clients.orgId, orgId), eq(clients.archived, false)))
      .then((r) => Number(r[0]?.count ?? 0))

    // Build KPI response
    const revenueChange = prevMonthRevenue > 0 ? ((mtdRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : mtdRevenue > 0 ? 100 : 0
    const expensesChange = prevMonthExpenses > 0 ? ((mtdExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : mtdExpenses > 0 ? 100 : 0
    const netChange = Math.abs(prevNetCashFlow) > 0 ? ((netCashFlow - prevNetCashFlow) / Math.abs(prevNetCashFlow)) * 100 : netCashFlow !== 0 ? 100 : 0

    res.json({
      kpis: {
        revenue: { value: mtdRevenue, change: revenueChange, up: revenueChange >= 0 },
        outstanding: { value: outstanding, change: 0, up: false },
        expenses: { value: mtdExpenses, change: expensesChange, up: expensesChange >= 0 },
        netCashFlow: { value: netCashFlow, change: netChange, up: netChange >= 0 },
      },
      cashFlow: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
      },
      recentInvoices,
      recentExpenses,
      upcomingDue,
      clientCount,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch dashboard summary' })
  }
})

export default router