import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { invoices, expenses, clients, orgMembers } from '@shared/schema'
import { and, eq, gte, lt, lte, sql } from 'drizzle-orm'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

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

    // MTD Revenue (paid invoices)
    const mtdRevenue = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), '0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    const prevMonthRevenue = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), '0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, firstOfPrevMonth), lt(invoices.createdAt, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    // Outstanding invoices total
    const outstanding = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), '0')` })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'sent')))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    // MTD Expenses
    const mtdExpenses = await db
      .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}), '0')` })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.createdAt, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    const prevMonthExpenses = await db
      .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}), '0')` })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.createdAt, firstOfPrevMonth), lt(expenses.createdAt, firstOfMonth)))
      .then((r) => parseFloat(r[0]?.total ?? '0'))

    // Net cash flow
    const netCashFlow = mtdRevenue - mtdExpenses
    const prevNetCashFlow = prevMonthRevenue - prevMonthExpenses

    // Monthly cash flow for chart (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const monthlyIncome = await db
      .select({
        month: sql<string>`to_char(${invoices.createdAt}, 'Mon')`,
        year: sql<string>`to_char(${invoices.createdAt}, 'YYYY')`,
        total: sql<string>`COALESCE(SUM(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, twelveMonthsAgo)))
      .groupBy(sql`to_char(${invoices.createdAt}, 'Mon')`, sql`to_char(${invoices.createdAt}, 'YYYY')`)
      .orderBy(sql`MIN(${invoices.createdAt})`)

    const monthlyExpenses = await db
      .select({
        month: sql<string>`to_char(${expenses.createdAt}, 'Mon')`,
        year: sql<string>`to_char(${expenses.createdAt}, 'YYYY')`,
        total: sql<string>`COALESCE(SUM(${expenses.amount}), '0')`,
      })
      .from(expenses)
      .where(and(eq(expenses.orgId, orgId), gte(expenses.createdAt, twelveMonthsAgo)))
      .groupBy(sql`to_char(${expenses.createdAt}, 'Mon')`, sql`to_char(${expenses.createdAt}, 'YYYY')`)
      .orderBy(sql`MIN(${expenses.createdAt})`)

    // Recent 5 invoices with client names
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
      .orderBy(invoices.createdAt)
      .limit(5)

    // Recent 5 expenses
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
    const revenueChange = prevMonthRevenue > 0 ? ((mtdRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0
    const expensesChange = prevMonthExpenses > 0 ? ((mtdExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0
    const netChange = Math.abs(prevNetCashFlow) > 0 ? ((netCashFlow - prevNetCashFlow) / Math.abs(prevNetCashFlow)) * 100 : 0

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