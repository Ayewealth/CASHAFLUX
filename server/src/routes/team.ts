import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { db } from '../db/client'
import { orgMembers, activityLog, insertActivityLogSchema } from '@shared/schema'
import { eq, and } from 'drizzle-orm'
import { sendTemplateEmail, loadTemplate, renderTemplate } from '../emails/send'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) { res.status(404).json({ error: 'No organization found' }); return }
    const members = await db.query.orgMembers.findMany({
      where: (om, { eq }) => eq(om.orgId, userOrg.orgId),
    })
    res.json(members)
  } catch { res.status(500).json({ error: 'Failed to fetch members' }) }
})

router.post('/invite', requireRole('owner', 'admin'), async (req, res) => {
  const { emails } = req.body
  if (!emails || !Array.isArray(emails) || emails.length === 0) { res.json({ invited: 0 }); return }

  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) { res.status(404).json({ error: 'No organization found' }); return }
    const orgId = userOrg.orgId

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
      const existing = await db.query.orgMembers.findFirst({
        where: (om, { and, eq }) => and(eq(om.orgId, orgId), eq(om.userId, trimmed)),
      })
      if (existing) continue
      await db.insert(orgMembers).values({ id: crypto.randomUUID(), orgId, userId: trimmed, role: 'member', invitedAt: new Date() })
      const template = loadTemplate('team-invite')
      const html = renderTemplate(template, { ORG_NAME: org.name, INVITE_URL: `${req.protocol}://${req.get('host')}/signup` })
      await sendTemplateEmail({ to: trimmed, subject: `You've been invited to ${org.name}`, html })
      invited++
    }
    await db.insert(activityLog).values(insertActivityLogSchema.parse({ id: crypto.randomUUID(), orgId, userId: req.user!.id, action: 'invited', entityType: 'team' }))
    res.json({ invited })
  } catch { res.status(500).json({ error: 'Failed to send invitations' }) }
})

router.delete('/:userId', requireRole('owner', 'admin'), async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) { res.status(404).json({ error: 'No organization found' }); return }
    const userId = req.params.userId as string
    const existing = await db.query.orgMembers.findFirst({
      where: (om, { and, eq }) => and(eq(om.orgId, userOrg.orgId), eq(om.userId, userId)),
    })
    if (!existing) { res.status(404).json({ error: 'Member not found' }); return }
    await db.delete(orgMembers).where(and(eq(orgMembers.orgId, userOrg.orgId), eq(orgMembers.userId, userId)))
    await db.insert(activityLog).values(insertActivityLogSchema.parse({ id: crypto.randomUUID(), orgId: userOrg.orgId, userId: req.user!.id, action: 'removed', entityType: 'team', entityId: userId }))
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Failed to remove member' }) }
})

export default router