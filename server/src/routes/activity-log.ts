import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { activityLog } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'
import { getUserOrg } from '../lib/org'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const userOrg = await getUserOrg(req.user!.id)
    if (!userOrg) { res.status(404).json({ error: 'No organization found' }); return }
    const rows = await db.query.activityLog.findMany({
      where: (a, { eq }) => eq(a.orgId, userOrg.orgId),
      orderBy: (a, { desc }) => [desc(a.createdAt)],
      limit: 50,
    })
    res.json(rows)
  } catch { res.status(500).json({ error: 'Failed to fetch activity log' }) }
})

export default router