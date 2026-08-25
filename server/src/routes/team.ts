import { Router } from 'express'
import { requireAuth, requireRole, requirePlan } from '../middleware/auth'
import { db } from '../db/client'
import { orgMembers, invitations, activityLog, insertActivityLogSchema } from '@shared/schema'
import { eq, and } from 'drizzle-orm'
import { isAtLimit, planLimitResponse } from '../lib/limits'
import { sendTemplateEmail, loadTemplate, renderTemplate } from '../emails/send'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const members = await db.query.orgMembers.findMany({
      where: (om, { eq }) => eq(om.orgId, req.orgId),
    })
    res.json(members)
  } catch { res.status(500).json({ error: 'Failed to fetch members' }) }
})

router.post('/invite', requireRole('owner', 'admin'), requirePlan('business'), async (req, res) => {
  const { emails } = req.body
  if (!emails || !Array.isArray(emails) || emails.length === 0) { res.json({ invited: 0 }); return }

  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const orgId = req.orgId

    const members = await db.query.orgMembers.findMany({ where: (om, {eq}) => eq(om.orgId, orgId), columns: { joinedAt: true } })
    const activeCount = members.filter(m => m.joinedAt).length
    const user = await db.query.users.findFirst({ where: (u, {eq}) => eq(u.id, req.user!.id) })
    const plan = user?.plan ?? 'free'
    if (isAtLimit({ current: activeCount, limit: 5, plan, resource: 'team members' })) {
      return planLimitResponse(res, { current: activeCount, limit: 5, plan, resource: 'team members' })
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, orgId),
      columns: { id: true, name: true },
    })
    if (!org) { res.status(404).json({ error: 'Organization not found' }); return }

    let invited = 0
    for (const email of emails) {
      if (!email || typeof email !== 'string') continue
      const trimmed = email.trim().toLowerCase()
      if (!trimmed) continue

      const userRecord = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.email, trimmed),
        columns: { id: true },
      })
      if (userRecord) {
        const existing = await db.query.orgMembers.findFirst({
          where: (om, { and, eq }) => and(eq(om.orgId, orgId), eq(om.userId, userRecord.id)),
        })
        if (existing) continue
      }

      const token = crypto.randomUUID()
      await db.insert(invitations).values({
        id: crypto.randomUUID(),
        orgId,
        email: trimmed,
        token,
        role: 'member',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      const template = loadTemplate('team-invite')
      const html = renderTemplate(template, { ORG_NAME: org.name, INVITE_URL: `${req.protocol}://${req.get('host')}/signup?token=${token}` })
      await sendTemplateEmail({ to: trimmed, subject: `You've been invited to ${org.name}`, html })
      invited++
    }
    await db.insert(activityLog).values(insertActivityLogSchema.parse({ id: crypto.randomUUID(), orgId, userId: req.user!.id, action: 'invited', entityType: 'team' }))
    res.json({ invited })
  } catch { res.status(500).json({ error: 'Failed to send invitations' }) }
})

router.delete('/:userId', requireRole('owner', 'admin'), async (req, res) => {
  try {
    if (!req.orgId) { res.status(404).json({ error: 'No organization found' }); return }
    const userId = req.params.userId as string
    const existing = await db.query.orgMembers.findFirst({
      where: (om, { and, eq }) => and(eq(om.orgId, req.orgId), eq(om.userId, userId)),
    })
    if (!existing) { res.status(404).json({ error: 'Member not found' }); return }
    await db.delete(orgMembers).where(and(eq(orgMembers.orgId, req.orgId), eq(orgMembers.userId, userId)))
    await db.insert(activityLog).values(insertActivityLogSchema.parse({ id: crypto.randomUUID(), orgId: req.orgId, userId: req.user!.id, action: 'removed', entityType: 'team', entityId: userId }))
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to remove member' }) }
})

export default router