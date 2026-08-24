import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { orgMembers, user } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const members = await db
      .select({
        id: orgMembers.id,
        orgId: orgMembers.orgId,
        userId: orgMembers.userId,
        role: orgMembers.role,
        invitedAt: orgMembers.invitedAt,
        joinedAt: orgMembers.joinedAt,
        name: user.name,
        email: user.email,
      })
      .from(orgMembers)
      .innerJoin(user, eq(user.id, orgMembers.userId))
      .where(eq(orgMembers.orgId, userOrg.orgId))

    res.json(members)
  } catch {
    res.status(500).json({ error: 'Failed to fetch members' })
  }
})

export default router