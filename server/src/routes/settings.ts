import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { auth } from '../auth'
import { db } from '../db/client'
import { clients, invoices, expenses, bankAccounts, bankTransactions, mileageLogs, payrollEntries, users, organizations, orgMembers } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { encrypt, decrypt, isEncrypted } from '../lib/encryption'
import { sanitizeObject } from '../lib/sanitize'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const org = await db.query.organizations.findFirst({ where: (o, { eq }) => eq(o.id, req.orgId) })
    if (!org) { res.status(404).json({ error: 'Organization not found' }); return }
    if (org.ein && isEncrypted(org.ein)) {
      org.ein = decrypt(org.ein)
    }
    res.json(org)
  } catch { res.status(500).json({ error: 'Failed to fetch settings' }) }
})

router.put('/', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const allowed = ['name', 'type', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'phone', 'website', 'ein', 'fiscalYearStart', 'currency', 'invoiceDefaults', 'notificationPreferences']
    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    if (data.ein) {
      data.ein = encrypt(data.ein as string)
    }
    if (typeof data.name === 'string') {
      const sanitized = sanitizeObject(data, ['name', 'type', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'phone', 'website'])
      Object.assign(data, sanitized)
    }
    await db.update(organizations).set(data).where(eq(organizations.id, req.orgId))
    const updated = await db.query.organizations.findFirst({ where: (o, { eq }) => eq(o.id, req.orgId) })
    if (updated?.ein && isEncrypted(updated.ein)) {
      updated.ein = decrypt(updated.ein)
    }
    res.json(updated)
  } catch { res.status(500).json({ error: 'Failed to update settings' }) }
})

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) { res.status(400).json({ error: 'Current and new password required' }); return }
    await auth.api.changePassword({ body: { currentPassword, newPassword }, headers: new Headers(req.headers as Record<string, string>) })
    res.json({ ok: true })
  } catch { res.status(400).json({ error: 'Failed to change password' }) }
})

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await auth.api.listSessions({ headers: new Headers(req.headers as Record<string, string>) })
    res.json(sessions)
  } catch { res.status(500).json({ error: 'Failed to fetch sessions' }) }
})

router.post('/revoke-session/:sessionId', async (req, res) => {
  try {
    await auth.api.revokeSession({ body: { token: req.params.sessionId }, headers: new Headers(req.headers as Record<string, string>) })
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to revoke session' }) }
})

router.get('/export', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const orgId = req.orgId
    const [org, clientRows, invoiceRows, expenseRows, bankRows, txnRows, mileageRows, payrollRows, memberRows] = await Promise.all([
      db.query.organizations.findFirst({ where: (o, { eq }) => eq(o.id, orgId) }),
      db.query.clients.findMany({ where: (c, { eq }) => eq(c.orgId, orgId) }),
      db.query.invoices.findMany({ where: (i, { eq }) => eq(i.orgId, orgId) }),
      db.query.expenses.findMany({ where: (e, { eq }) => eq(e.orgId, orgId) }),
      db.query.bankAccounts.findMany({ where: (b, { eq }) => eq(b.orgId, orgId) }),
      db.query.bankTransactions.findMany({ where: (t, { eq }) => eq(t.orgId, orgId) }),
      db.query.mileageLogs.findMany({ where: (m, { eq }) => eq(m.orgId, orgId) }),
      db.query.payrollEntries.findMany({ where: (p, { eq }) => eq(p.orgId, orgId) }),
      db.query.orgMembers.findMany({ where: (om, { eq }) => eq(om.orgId, orgId) }),
    ])
    res.json({ org: [org], clients: clientRows, invoices: invoiceRows, expenses: expenseRows, bankAccounts: bankRows, bankTransactions: txnRows, mileageLogs: mileageRows, payroll: payrollRows, members: memberRows })
  } catch { res.status(500).json({ error: 'Failed to export data' }) }
})

router.post('/delete-account', async (req, res) => {
  try {
    await db.update(users).set({ hashedPassword: '', email: `deleted-${req.user!.id}@cashaflux.com` }).where(eq(users.id, req.user!.id))
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to delete account' }) }
})

export default router