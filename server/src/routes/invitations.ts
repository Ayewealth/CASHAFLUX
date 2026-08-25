import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { invitations, orgMembers } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()

// Public: fetch invite info for the signup/login page
router.get('/info', async (req, res) => {
  try {
    const token = req.query.token as string | undefined
    if (!token) { res.status(400).json({ error: 'Missing token' }); return }

    const invitation = await db.query.invitations.findFirst({
      where: (i, { eq }) => eq(i.token, token),
      columns: { id: true, email: true, status: true, expiresAt: true, orgId: true },
    })
    if (!invitation || invitation.status !== 'pending') {
      res.status(404).json({ error: 'Invitation not found or already used' })
      return
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      res.json({ expired: true, email: invitation.email })
      return
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, invitation.orgId),
      columns: { id: true, name: true },
    })

    res.json({ email: invitation.email, orgId: invitation.orgId, orgName: org?.name ?? '', expired: false })
  } catch {
    res.status(500).json({ error: 'Failed to fetch invitation' })
  }
})

// Auth required: accept an invitation
router.get('/accept', requireAuth, async (req, res) => {
  try {
    const token = req.query.token as string | undefined
    if (!token) { res.status(400).json({ error: 'Missing token' }); return }

    const invitation = await db.query.invitations.findFirst({
      where: (i, { eq }) => eq(i.token, token),
    })
    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' })
      return
    }
    if (invitation.status === 'accepted') {
      res.json({ alreadyAccepted: true, orgId: invitation.orgId })
      return
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      res.json({ expired: true })
      return
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, invitation.orgId),
      columns: { id: true, name: true },
    })
    if (!org) { res.status(404).json({ error: 'Organization not found' }); return }

    // Ensure the logged-in user matches the invited email (or is allowed to join)
    if (req.user!.email.toLowerCase() !== invitation.email.toLowerCase()) {
      res.status(403).json({ error: 'Invitation email does not match your account' })
      return
    }

    const existing = await db.query.orgMembers.findFirst({
      where: (om, { and, eq }) => and(eq(om.orgId, invitation.orgId), eq(om.userId, req.user!.id)),
    })
    if (!existing) {
      await db.insert(orgMembers).values({
        id: crypto.randomUUID(),
        orgId: invitation.orgId,
        userId: req.user!.id,
        role: invitation.role,
        joinedAt: new Date(),
      })
    }
    await db.update(invitations).set({ status: 'accepted' }).where(eq(invitations.token, token))

    res.json({ accepted: true, orgId: invitation.orgId, orgName: org.name })
  } catch {
    res.status(500).json({ error: 'Failed to accept invitation' })
  }
})

export default router