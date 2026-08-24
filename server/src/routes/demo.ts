import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db } from '../db/client'
import { requireAuth } from '../middleware/auth'
import { getUserOrg } from '../lib/org'
import {
  organizations, clients, invoices, invoiceLineItems, expenses,
  bankAccounts, bankTransactions, mileageLogs, payrollEntries,
  demoSessions,
} from '@shared/schema'
import { eq, and, isNull } from 'drizzle-orm'

const router = Router()
router.use(requireAuth)

const IRS_CATEGORIES = [
  'Advertising', 'Car & Truck', 'Commissions', 'Insurance', 'Legal & Professional',
  'Office Expenses', 'Rent', 'Repairs', 'Supplies', 'Travel', 'Meals', 'Utilities', 'Wages',
]

const CLIENT_NAMES = [
  'Brightside Design Co', 'Nova Marketing Group', 'Summit Construction LLC',
  'Pioneer Medical Supply', 'Atlas Consulting Partners', 'Coastline Properties',
  'Horizon Tech Solutions', 'Meridian Financial Services', 'Alpine Craft Brewing',
  'Riverbend Architecture', 'Thornwood Legal Associates', 'Cedar & Oak Interiors',
]

const MERCHANTS = [
  { name: 'OfficeMax', category: 'Office Expenses' },
  { name: 'Adobe Inc.', category: 'Supplies' },
  { name: 'Delta Air Lines', category: 'Travel' },
  { name: 'WeWork', category: 'Rent' },
  { name: 'Google Ads', category: 'Advertising' },
  { name: 'HubSpot', category: 'Advertising' },
  { name: 'AWS', category: 'Supplies' },
  { name: 'Uber Eats', category: 'Meals' },
  { name: 'Staples', category: 'Office Expenses' },
  { name: 'Geico', category: 'Insurance' },
  { name: 'Comcast Business', category: 'Utilities' },
  { name: 'Docusign', category: 'Supplies' },
]

function seedRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function randBetween(min: number, max: number, rng: () => number): number {
  return Math.round((min + rng() * (max - min)) * 100) / 100
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

router.get('/status', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) { res.status(404).json({ error: 'No organization found' }); return }
    const org = await db.query.organizations.findFirst({ where: (o, { eq }) => eq(o.id, userOrg.orgId) })
    const session = org?.demoMode
      ? await db.query.demoSessions.findFirst({ where: (ds, { eq, and, isNull }) => and(eq(ds.orgId, userOrg.orgId), isNull(ds.cleanedUpAt)) })
      : null
    res.json({ demoMode: org?.demoMode ?? false, demoSessionId: session?.id ?? null })
  } catch { res.status(500).json({ error: 'Failed to check demo status' }) }
})

router.post('/toggle', async (req, res) => {
  try {
    const { enabled } = req.body
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) { res.status(404).json({ error: 'No organization found' }); return }
    const orgId = userOrg.orgId
    const userId = req.user!.id

    if (!enabled) {
      const session = await db.query.demoSessions.findFirst({
        where: (ds, { eq, and, isNull }) => and(eq(ds.orgId, orgId), isNull(ds.cleanedUpAt)),
      })
      if (session) {
        const demoId = session.id
        await Promise.all([
          db.delete(clients).where(and(eq(clients.orgId, orgId), eq(clients.demoSessionId, demoId))),
          db.delete(invoiceLineItems).where(eq(invoiceLineItems.demoSessionId, demoId)),
          db.delete(invoices).where(and(eq(invoices.orgId, orgId), eq(invoices.demoSessionId, demoId))),
          db.delete(expenses).where(and(eq(expenses.orgId, orgId), eq(expenses.demoSessionId, demoId))),
          db.delete(bankTransactions).where(and(eq(bankTransactions.orgId, orgId), eq(bankTransactions.demoSessionId, demoId))),
          db.delete(bankAccounts).where(and(eq(bankAccounts.orgId, orgId), eq(bankAccounts.demoSessionId, demoId))),
          db.delete(mileageLogs).where(and(eq(mileageLogs.orgId, orgId), eq(mileageLogs.demoSessionId, demoId))),
          db.delete(payrollEntries).where(and(eq(payrollEntries.orgId, orgId), eq(payrollEntries.demoSessionId, demoId))),
          db.update(demoSessions).set({ cleanedUpAt: new Date() }).where(eq(demoSessions.id, demoId)),
          db.update(organizations).set({ demoMode: false }).where(eq(organizations.id, orgId)),
        ])
      }
      res.json({ demoMode: false })
      return
    }

    // Toggle ON — generate demo data
    const demoId = nanoid()
    const rng = seedRandom(42)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Create demo session record
    await db.insert(demoSessions).values({ id: demoId, orgId })

    // ─── Bank Accounts ───
    const checkingId = nanoid()
    const savingsId = nanoid()
    await db.insert(bankAccounts).values([
      { id: checkingId, orgId, name: 'Business Checking', bankName: 'Chase', type: 'checking', currency: 'USD', currentBalance: '45820.00', demoSessionId: demoId },
      { id: savingsId, orgId, name: 'Business Savings', bankName: 'Chase', type: 'savings', currency: 'USD', currentBalance: '123450.00', demoSessionId: demoId },
    ])

    // ─── Clients ───
    const clientIds = CLIENT_NAMES.map(() => nanoid())
    const clientData = CLIENT_NAMES.map((name, i) => ({
      id: clientIds[i], orgId, name, company: name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      phone: `+1${String(555 + Math.floor(rng() * 1000)).padStart(3, '0')}${String(1000 + Math.floor(rng() * 9000))}`,
      city: pick(['New York', 'San Francisco', 'Austin', 'Chicago', 'Denver', 'Seattle', 'Miami', 'Portland'], rng),
      state: pick(['NY', 'CA', 'TX', 'IL', 'CO', 'WA', 'FL', 'OR'], rng),
      zip: String(10000 + Math.floor(rng() * 90000)),
      currency: 'USD', demoSessionId: demoId,
    }))
    await db.insert(clients).values(clientData)

    // ─── Invoices + Line Items ───
    const allInvoices: any[] = []
    const allLineItems: any[] = []
    for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
      const monthDate = addMonths(today, monthOffset)
      const numInvoices = 3 + Math.floor(rng() * 3)
      for (let i = 0; i < numInvoices; i++) {
        const invId = nanoid()
        const clientIdx = Math.floor(rng() * CLIENT_NAMES.length)
        const lineItemsCount = 1 + Math.floor(rng() * 3)
        let subtotal = 0
        const items: any[] = []

        for (let j = 0; j < lineItemsCount; j++) {
          const qty = 1 + Math.floor(rng() * 5)
          const unitPrice = randBetween(200, 3000, rng)
          const itemTotal = Math.round(qty * unitPrice * 100) / 100
          subtotal += itemTotal
          const taxRate = rng() > 0.5 ? 0 : randBetween(5, 10, rng)
          items.push({
            id: nanoid(), invoiceId: invId,
            description: pick(['Web design services', 'Consulting retainer', 'Logo package', 'Monthly social media management', 'Brand strategy session', 'SEO audit & recommendations', 'Email campaign setup', 'Video production services'], rng),
            quantity: qty, unitPrice: unitPrice.toFixed(2), taxRate: taxRate.toFixed(2), total: itemTotal.toFixed(2),
            demoSessionId: demoId,
          })
        }

        const taxTotal = Math.round(subtotal * (rng() > 0.5 ? 0 : randBetween(0.05, 0.10, rng)) * 100) / 100
        const discount = rng() > 0.7 ? Math.round(subtotal * randBetween(0.05, 0.15, rng) * 100) / 100 : 0
        const total = Math.round((subtotal + taxTotal - discount) * 100) / 100

        const statusRoll = rng()
        const status = statusRoll < 0.70 ? 'paid' : statusRoll < 0.85 ? 'sent' : statusRoll < 0.95 ? 'overdue' : 'draft'
        const issueDate = new Date(monthDate)
        issueDate.setDate(1 + Math.floor(rng() * 25))
        const dueDate = new Date(issueDate)
        dueDate.setDate(dueDate.getDate() + (rng() > 0.5 ? 30 : 15))

        allInvoices.push({
          id: invId, orgId, clientId: clientIds[clientIdx],
          invoiceNumber: `INV-${String(1000 + allInvoices.length).padStart(4, '0')}`,
          status, issueDate, dueDate, currency: 'USD',
          subtotal: subtotal.toFixed(2), taxTotal: taxTotal.toFixed(2),
          discount: discount > 0 ? discount.toFixed(2) : null,
          total: total.toFixed(2),
          notes: pick(['Thank you for your business!', 'Payment due within terms.', 'Great working with you!', null, null], rng),
          createdBy: userId, demoSessionId: demoId,
        })
        allLineItems.push(...items)
      }
    }
    await db.insert(invoices).values(allInvoices)
    await db.insert(invoiceLineItems).values(allLineItems)

    // ─── Expenses ───
    const allExpenses: any[] = []
    for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
      const monthDate = addMonths(today, monthOffset)
      const numExpenses = 2 + Math.floor(rng() * 3)
      for (let i = 0; i < numExpenses; i++) {
        const merchant = pick(MERCHANTS, rng)
        allExpenses.push({
          id: nanoid(), orgId, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 + Math.floor(rng() * 25)),
          merchant: merchant.name, amount: randBetween(50, 2500, rng).toFixed(2),
          category: merchant.category, description: `${merchant.category} expense`,
          reconciled: rng() > 0.3, createdBy: userId, demoSessionId: demoId,
        })
      }
    }
    await db.insert(expenses).values(allExpenses)

    // ─── Bank Transactions ───
    const allTxns: any[] = []
    for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
      const monthDate = addMonths(today, monthOffset)
      // Credits from invoices
      const monthInvoices = allInvoices.filter((inv) =>
        new Date(inv.issueDate).getMonth() === monthDate.getMonth() &&
        new Date(inv.issueDate).getFullYear() === monthDate.getFullYear()
      )
      for (const inv of monthInvoices) {
        allTxns.push({
          id: nanoid(), bankAccountId: checkingId, orgId,
          date: new Date(inv.dueDate), description: `Payment received — ${inv.invoiceNumber}`,
          amount: inv.total, type: 'credit', category: 'Income',
          reconciled: inv.status === 'paid', demoSessionId: demoId,
        })
      }
      // Debits from expenses
      const monthExpenses = allExpenses.filter((exp) =>
        new Date(exp.date).getMonth() === monthDate.getMonth() &&
        new Date(exp.date).getFullYear() === monthDate.getFullYear()
      )
      for (const exp of monthExpenses) {
        allTxns.push({
          id: nanoid(), bankAccountId: checkingId, orgId,
          date: new Date(exp.date), description: exp.merchant,
          amount: exp.amount, type: 'debit', category: exp.category,
          reconciled: exp.reconciled, demoSessionId: demoId,
        })
      }
      // Monthly bills
      allTxns.push(
        { id: nanoid(), bankAccountId: checkingId, orgId, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), description: 'Office rent', amount: '2500.00', type: 'debit', category: 'Rent', reconciled: true, demoSessionId: demoId },
        { id: nanoid(), bankAccountId: checkingId, orgId, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5), description: 'Internet & utilities', amount: '350.00', type: 'debit', category: 'Utilities', reconciled: true, demoSessionId: demoId },
      )
    }
    await db.insert(bankTransactions).values(allTxns)

    // ─── Mileage Logs ───
    const allMileage: any[] = []
    for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
      const monthDate = addMonths(today, monthOffset)
      allMileage.push({
        id: nanoid(), orgId, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10 + Math.floor(rng() * 15)),
        origin: pick(['Home Office', 'Downtown Office', 'Client Site'], rng),
        destination: pick(['Client Meeting', 'Post Office', 'Supply Store', 'Airport', 'Conference Venue'], rng),
        miles: randBetween(10, 200, rng).toFixed(1),
        purpose: pick(['Client meeting', 'Supply run', 'Conference', 'Site visit', 'Networking event'], rng),
        createdBy: userId, demoSessionId: demoId,
      })
    }
    await db.insert(mileageLogs).values(allMileage)

    // ─── Payroll ───
    const allPayroll: any[] = []
    for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
      const monthDate = addMonths(today, monthOffset)
      allPayroll.push(
        { id: nanoid(), orgId, name: 'Alex Rivera', type: 'w2', payDate: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
          grossAmount: randBetween(5500, 8000, rng).toFixed(2), hours: '160.0', status: 'paid', createdBy: userId, demoSessionId: demoId },
        { id: nanoid(), orgId, name: 'Jordan Taylor', type: '1099', payDate: new Date(monthDate.getFullYear(), monthDate.getMonth(), 25),
          grossAmount: randBetween(3500, 6000, rng).toFixed(2), hours: null, status: 'paid', createdBy: userId, demoSessionId: demoId },
      )
    }
    await db.insert(payrollEntries).values(allPayroll)

    // Mark org as demo mode
    await db.update(organizations).set({ demoMode: true }).where(eq(organizations.id, orgId))

    res.json({ demoMode: true, demoSessionId: demoId })
  } catch (err) {
    console.error('Demo toggle error:', err)
    res.status(500).json({ error: 'Failed to toggle demo mode' })
  }
})

export default router