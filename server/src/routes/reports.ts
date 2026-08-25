import { Router } from 'express'
import { requireAuth, requirePlan } from '../middleware/auth'
import { db } from '../db/client'
import {
  invoices,
  expenseAllocations,
  expenses,
  clients,
  bankAccounts,
  bankTransactions,
  mileageLogs,
} from '@shared/schema'
import { and, eq, gte, lte, isNull, sql } from 'drizzle-orm'
import { demoFilter, andDemoFilter } from '../lib/demo-filter'

const router = Router()
router.use(requireAuth)
router.use(requirePlan('pro', 'business'))

function dateRange(filters: Record<string, string | undefined>) {
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().getFullYear(), 0, 1)
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date()
  return { dateFrom, dateTo }
}

function fmt(n: number): string { return n.toFixed(2) }
function parseDecimal(v: string | null | undefined): number { return parseFloat(v ?? '0') }

router.get('/:type', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }
    const orgId = req.orgId
    const { dateFrom, dateTo } = dateRange(req.query as Record<string, string | undefined>)
    const type = req.params.type
    let data: unknown[] = []
    let csv = ''

    switch (type) {
      // ─── Profit & Loss ───
      case 'profit-and-loss': {
        const revenueConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, dateFrom), lte(invoices.createdAt, dateTo)]
        andDemoFilter(revenueConditions, invoices.demoSessionId, req.demoSessionId)
        const revenue = await db
          .select({ total: sql<string>`COALESCE(SUM(${invoices.total}),'0')` })
          .from(invoices)
          .where(and(...revenueConditions))
          .then(r => parseDecimal(r[0]?.total))

        const expenseConditions = [eq(expenses.orgId, orgId), gte(expenses.createdAt, dateFrom), lte(expenses.createdAt, dateTo)]
        andDemoFilter(expenseConditions, expenses.demoSessionId, req.demoSessionId)
        const expenseRows = await db
          .select({ category: expenses.category, total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
          .from(expenses)
          .where(and(...expenseConditions))
          .groupBy(expenses.category)
          .orderBy(expenses.category)

        const expenseByCat = expenseRows.map(r => ({ category: r.category, amount: parseDecimal(r.total) }))
        const totalExpenses = expenseByCat.reduce((s, r) => s + r.amount, 0)
        const netIncome = revenue - totalExpenses

        data = [{ revenue, totalExpenses, netIncome, expensesByCategory: expenseByCat }]
        csv = 'Category,Amount\nRevenue,' + fmt(revenue) + '\n' +
          expenseByCat.map(r => `"${r.category}",${fmt(r.amount)}`).join('\n') +
          '\nTotal Expenses,' + fmt(totalExpenses) + '\nNet Income,' + fmt(netIncome)
        break
      }

      // ─── Balance Sheet ───
      case 'balance-sheet': {
        const bankBalancesConditions = [eq(bankAccounts.orgId, orgId)]
        andDemoFilter(bankBalancesConditions, bankAccounts.demoSessionId, req.demoSessionId)
        const bankBalances = await db
          .select({ total: sql<string>`COALESCE(SUM(${bankAccounts.currentBalance}),'0')` })
          .from(bankAccounts)
          .where(and(...bankBalancesConditions))
          .then(r => parseDecimal(r[0]?.total))

        const outstandingConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'sent')]
        andDemoFilter(outstandingConditions, invoices.demoSessionId, req.demoSessionId)
        const outstanding = await db
          .select({ total: sql<string>`COALESCE(SUM(${invoices.total}),'0')` })
          .from(invoices)
          .where(and(...outstandingConditions))
          .then(r => parseDecimal(r[0]?.total))

        const unpaidExpensesConditions = [eq(expenses.orgId, orgId), eq(expenses.reconciled, false)]
        andDemoFilter(unpaidExpensesConditions, expenses.demoSessionId, req.demoSessionId)
        const unpaidExpenses = await db
          .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
          .from(expenses)
          .where(and(...unpaidExpensesConditions))
          .then(r => parseDecimal(r[0]?.total))

        const revenueConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'paid')]
        andDemoFilter(revenueConditions, invoices.demoSessionId, req.demoSessionId)
        const revenue = await db
          .select({ total: sql<string>`COALESCE(SUM(${invoices.total}),'0')` })
          .from(invoices)
          .where(and(...revenueConditions))
          .then(r => parseDecimal(r[0]?.total))

        const totalExpensesConditions = [eq(expenses.orgId, orgId)]
        andDemoFilter(totalExpensesConditions, expenses.demoSessionId, req.demoSessionId)
        const totalExpenses = await db
          .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
          .from(expenses)
          .where(and(...totalExpensesConditions))
          .then(r => parseDecimal(r[0]?.total))

        const assets = bankBalances + outstanding
        const liabilities = unpaidExpenses
        const equity = revenue - totalExpenses
        data = [{ bankBalances, outstandingReceivables: outstanding, totalAssets: assets, liabilities, equity }]
        csv = 'Category,Amount\nCash & Bank,' + fmt(bankBalances) + '\nReceivables,' + fmt(outstanding) + '\nTotal Assets,' + fmt(assets) + '\nLiabilities,' + fmt(liabilities) + '\nEquity,' + fmt(equity)
        break
      }

      // ─── Cash Flow ───
      case 'cash-flow': {
        const incomeConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.updatedAt, dateFrom), lte(invoices.updatedAt, dateTo)]
        andDemoFilter(incomeConditions, invoices.demoSessionId, req.demoSessionId)
        const income = await db
          .select({
            month: sql<string>`to_char(${invoices.updatedAt}, 'Mon YYYY')`,
            total: sql<string>`COALESCE(SUM(${invoices.total}),'0')`,
          })
          .from(invoices)
          .where(and(...incomeConditions))
          .groupBy(sql`to_char(${invoices.updatedAt}, 'Mon YYYY')`)
          .orderBy(sql`MIN(${invoices.updatedAt})`)

        const outflowConditions = [eq(expenses.orgId, orgId), gte(expenses.createdAt, dateFrom), lte(expenses.createdAt, dateTo)]
        andDemoFilter(outflowConditions, expenses.demoSessionId, req.demoSessionId)
        const outflow = await db
          .select({
            month: sql<string>`to_char(${expenses.createdAt}, 'Mon YYYY')`,
            total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')`,
          })
          .from(expenses)
          .where(and(...outflowConditions))
          .groupBy(sql`to_char(${expenses.createdAt}, 'Mon YYYY')`)
          .orderBy(sql`MIN(${expenses.createdAt})`)

        data = [{ income, outflow }]
        csv = 'Month,Income,Expenses\n' +
          income.map((r, i) => `${r.month},${r.total},${outflow[i]?.total ?? '0'}`).join('\n')
        break
      }

      // ─── A/R Aging ───
      case 'receivable-aging': {
        const now = new Date()
        const agingConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'sent')]
        andDemoFilter(agingConditions, invoices.demoSessionId, req.demoSessionId)
        const rows = await db
          .select({
            id: invoices.id,
            total: invoices.total,
            dueDate: invoices.dueDate,
          })
          .from(invoices)
          .where(and(...agingConditions))
        const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
        for (const inv of rows) {
          const days = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000)
          if (days <= 30) buckets['0-30'] += parseDecimal(inv.total)
          else if (days <= 60) buckets['31-60'] += parseDecimal(inv.total)
          else if (days <= 90) buckets['61-90'] += parseDecimal(inv.total)
          else buckets['90+'] += parseDecimal(inv.total)
        }
        data = [buckets]
        csv = 'Bucket,Amount\n' + Object.entries(buckets).map(([k, v]) => `${k},${fmt(v)}`).join('\n')
        break
      }

      // ─── A/P Aging ───
      case 'payable-aging': {
        const now = new Date()
        const rows = await db.query.expenses.findMany({
          where: (e, { and, eq, isNull }) => and(eq(e.orgId, orgId), eq(e.reconciled, false), req.demoSessionId ? eq(e.demoSessionId, req.demoSessionId) : isNull(e.demoSessionId)),
        })
        const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
        for (const exp of rows) {
          const days = Math.floor((now.getTime() - new Date(exp.date).getTime()) / 86400000)
          if (days <= 30) buckets['0-30'] += parseDecimal(exp.amount)
          else if (days <= 60) buckets['31-60'] += parseDecimal(exp.amount)
          else if (days <= 90) buckets['61-90'] += parseDecimal(exp.amount)
          else buckets['90+'] += parseDecimal(exp.amount)
        }
        data = [buckets]
        csv = 'Bucket,Amount\n' + Object.entries(buckets).map(([k, v]) => `${k},${fmt(v)}`).join('\n')
        break
      }

      // ─── Tax Summary ───
      case 'tax-summary': {
        const incomeConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, dateFrom), lte(invoices.createdAt, dateTo)]
        andDemoFilter(incomeConditions, invoices.demoSessionId, req.demoSessionId)
        const income = await db
          .select({ total: sql<string>`COALESCE(SUM(${invoices.total}),'0')` })
          .from(invoices)
          .where(and(...incomeConditions))
          .then(r => parseDecimal(r[0]?.total))

        const byCategoryConditions = [eq(expenses.orgId, orgId), gte(expenses.createdAt, dateFrom), lte(expenses.createdAt, dateTo)]
        andDemoFilter(byCategoryConditions, expenses.demoSessionId, req.demoSessionId)
        const byCategory = await db
          .select({ category: expenses.category, total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
          .from(expenses)
          .where(and(...byCategoryConditions))
          .groupBy(expenses.category)
          .orderBy(expenses.category)

        const catRows = byCategory.map(r => ({ category: r.category, amount: parseDecimal(r.total) }))
        data = [{ totalIncome: income, categories: catRows }]
        csv = 'Category,Amount\nIncome,' + fmt(income) + '\n' +
          catRows.map(r => `"${r.category}",${fmt(r.amount)}`).join('\n')
        break
      }

      // ─── Sales by Client ───
      case 'sales-by-client': {
        const salesConditions = [eq(invoices.orgId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, dateFrom), lte(invoices.createdAt, dateTo)]
        andDemoFilter(salesConditions, invoices.demoSessionId, req.demoSessionId)
        const rows = await db
          .select({
            clientId: invoices.clientId,
            clientName: clients.name,
            clientCompany: clients.company,
            total: sql<string>`COALESCE(SUM(${invoices.total}),'0')`,
            count: sql<string>`COUNT(${invoices.id})`,
          })
          .from(invoices)
          .innerJoin(clients, eq(clients.id, invoices.clientId))
          .where(and(...salesConditions))
          .groupBy(invoices.clientId, clients.name, clients.company)
          .orderBy(sql`SUM(${invoices.total}) DESC`)

        data = rows.map(r => ({ clientName: r.clientName, company: r.clientCompany, total: parseDecimal(r.total), invoiceCount: parseInt(r.count) }))
        csv = 'Client,Company,Total,Invoices\n' +
          data.map((r: any) => `"${r.clientName}","${r.company ?? ''}",${fmt(r.total)},${r.invoiceCount}`).join('\n')
        break
      }

      // ─── Expense by Category ───
      case 'expense-by-category': {
        const expenseCatConditions = [eq(expenses.orgId, orgId), gte(expenses.createdAt, dateFrom), lte(expenses.createdAt, dateTo)]
        andDemoFilter(expenseCatConditions, expenses.demoSessionId, req.demoSessionId)
        const rows = await db
          .select({ category: expenses.category, total: sql<string>`COALESCE(SUM(${expenses.amount}),'0')` })
          .from(expenses)
          .where(and(...expenseCatConditions))
          .groupBy(expenses.category)
          .orderBy(sql`SUM(${expenses.amount}) DESC`)

        data = rows.map(r => ({ category: r.category, amount: parseDecimal(r.total) }))
        csv = 'Category,Amount\n' + data.map((r: any) => `"${r.category}",${fmt(r.amount)}`).join('\n')
        break
      }

      // ─── Invoice Report ───
      case 'invoice-report': {
        const invoiceReportConditions = [eq(invoices.orgId, orgId)]
        andDemoFilter(invoiceReportConditions, invoices.demoSessionId, req.demoSessionId)
        const rows = await db
          .select({
            id: invoices.id,
            status: invoices.status,
            total: invoices.total,
          })
          .from(invoices)
          .where(and(...invoiceReportConditions))
        const byStatus: Record<string, { count: number; total: number }> = {}
        for (const inv of rows) {
          if (!byStatus[inv.status]) byStatus[inv.status] = { count: 0, total: 0 }
          byStatus[inv.status].count++
          byStatus[inv.status].total += parseDecimal(inv.total)
        }
        data = [byStatus]
        csv = 'Status,Count,Total\n' + Object.entries(byStatus).map(([k, v]) => `${k},${v.count},${fmt(v.total)}`).join('\n')
        break
      }

      // ─── Mileage Log Report ───
      case 'mileage-log': {
        const rows = await db.query.mileageLogs.findMany({
          where: (m, { and, eq, isNull }) => and(eq(m.orgId, orgId), gte(m.date, dateFrom), lte(m.date, dateTo), req.demoSessionId ? eq(m.demoSessionId, req.demoSessionId) : isNull(m.demoSessionId)),
          orderBy: (m, { desc }) => [desc(m.date)],
        })
        const totalMiles = rows.reduce((s, r) => s + parseDecimal(r.miles), 0)
        data = [{ logs: rows, totalMiles: +totalMiles.toFixed(1), totalDeduction: +(totalMiles * 0.7).toFixed(2) }]
        csv = 'Date,Origin,Destination,Miles,Purpose\n' +
          rows.map(r => `${r.date.toISOString().split('T')[0]},"${r.origin}","${r.destination}",${r.miles},"${r.purpose ?? ''}"`).join('\n')
        break
      }

      default:
        res.status(400).json({ error: 'Unknown report type' })
        return
    }

    res.json({ type, generatedAt: new Date(), dateFrom, dateTo, data, csv })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

export default router