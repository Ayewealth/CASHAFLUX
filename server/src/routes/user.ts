import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { users } from '@shared/schema'
import { eq } from 'drizzle-orm'

const router = Router()

router.use(requireAuth)

// PUT /api/user/plan — update the current user's plan
router.put('/plan', async (req, res) => {
  const { plan } = req.body
  if (!plan || !['free', 'pro', 'business'].includes(plan)) {
    res.status(400).json({ error: 'Invalid plan. Must be one of: free, pro, business' })
    return
  }

  try {
    await db.update(users)
      .set({ plan })
      .where(eq(users.id, req.user!.id))

    res.json({ plan })
  } catch {
    res.status(500).json({ error: 'Failed to update plan' })
  }
})

export default router