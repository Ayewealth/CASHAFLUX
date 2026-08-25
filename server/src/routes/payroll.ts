import { Router } from 'express'
import { requireAuth, requirePlan } from '../middleware/auth'
import { db } from '../db/client'
import { payrollEntries, expenses, insertPayrollEntrySchema } from '@shared/schema'
import { and, eq, gte, lte, isNull, sql } from 'drizzle-orm'
import { demoFilter, andDemoFilter } from '../lib/demo-filter'

const router = Router()
router.use(requireAuth)
router.use(requirePlan('business'))

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const year = parseInt((req.query as any).year) || new Date().getFullYear()
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    const rows = await db.query.payrollEntries.findMany({
      where: (p, { and, eq, isNull }) => and(eq(p.orgId, req.orgId), gte(p.payDate, yearStart), lte(p.payDate, yearEnd), req.demoSessionId ? eq(p.demoSessionId, req.demoSessionId) : isNull(p.demoSessionId)),
      orderBy: (p, { desc }) => [desc(p.payDate)],
    })
    const totalEmployees = [...new Set(rows.map(r => r.name))].length
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1); thisMonthStart.setHours(0, 0, 0, 0)
    const mtdTotal = rows.filter(r => r.payDate >= thisMonthStart).reduce((s, r) => s + parseFloat(r.grossAmount), 0)
    const ytdTotal = rows.reduce((s, r) => s + parseFloat(r.grossAmount), 0)

    res.json({ entries: rows, totalEmployees, mtdTotal: +mtdTotal.toFixed(2), ytdTotal: +ytdTotal.toFixed(2) })
  } catch { res.status(500).json({ error: 'Failed to fetch payroll' }) }
})

router.post('/', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const parsed = insertPayrollEntrySchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() }); return }

    const [entry] = await db.insert(payrollEntries).values({
      ...parsed.data, id: crypto.randomUUID(), orgId: req.orgId, createdBy: req.user!.id,
    }).returning()

    // Auto-post to Wages expense if status is paid
    if (parsed.data.status === 'paid') {
      await db.insert(expenses).values({
        id: crypto.randomUUID(), orgId: req.orgId, date: new Date(), merchant: 'Payroll', amount: parsed.data.grossAmount,
        category: 'Wages', description: `Payroll: ${parsed.data.name}`, reconciled: false, createdBy: req.user!.id,
      })
    }

    res.status(201).json(entry)
  } catch { res.status(500).json({ error: 'Failed to create payroll entry' }) }
})

router.put('/:id', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const existing = await db.query.payrollEntries.findFirst({ where: (p, { and, eq, isNull }) => and(eq(p.id, req.params.id), eq(p.orgId, req.orgId), req.demoSessionId ? eq(p.demoSessionId, req.demoSessionId) : isNull(p.demoSessionId)) })
    if (!existing) { res.status(404).json({ error: 'Payroll entry not found' }); return }
    const parsed = insertPayrollEntrySchema.partial().safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() }); return }
    const [updated] = await db.update(payrollEntries).set(parsed.data).where(eq(payrollEntries.id, req.params.id)).returning()
    res.json(updated)
  } catch { res.status(500).json({ error: 'Failed to update payroll entry' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const existing = await db.query.payrollEntries.findFirst({ where: (p, { and, eq, isNull }) => and(eq(p.id, req.params.id), eq(p.orgId, req.orgId), req.demoSessionId ? eq(p.demoSessionId, req.demoSessionId) : isNull(p.demoSessionId)) })
    if (!existing) { res.status(404).json({ error: 'Payroll entry not found' }); return }
    await db.delete(payrollEntries).where(eq(payrollEntries.id, req.params.id))
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to delete payroll entry' }) }
})

router.get('/export/csv', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const year = parseInt((req.query as any).year) || new Date().getFullYear()
    const rows = await db.query.payrollEntries.findMany({
      where: (p, { and, eq, isNull }) => and(eq(p.orgId, req.orgId), gte(p.payDate, new Date(year, 0, 1)), lte(p.payDate, new Date(year, 11, 31)), req.demoSessionId ? eq(p.demoSessionId, req.demoSessionId) : isNull(p.demoSessionId)),
      orderBy: (p, { desc }) => [desc(p.payDate)],
    })
    const header = 'Name,Type,Pay Date,Gross Pay,Hours\n'
    const csv = rows.map(r => `"${r.name}",${r.type},${r.payDate.toISOString().split('T')[0]},${r.grossAmount},${r.hours ?? ''}`).join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="payroll-${year}.csv"`)
    res.send(header + csv)
  } catch { res.status(500).json({ error: 'Failed to export payroll' }) }
})

export default router