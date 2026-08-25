import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { organizations, insertOrganizationSchema } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { decrypt, isEncrypted } from '../lib/encryption'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, req.orgId),
    })
    if (!org) {
      res.status(404).json({ error: 'Organization not found' })
      return
    }

    if (org.ein && isEncrypted(org.ein)) {
      org.ein = decrypt(org.ein)
    }

    res.json(org)
  } catch {
    res.status(500).json({ error: 'Failed to fetch organization' })
  }
})

router.put('/', async (req, res) => {
  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    const parsed = insertOrganizationSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
      return
    }

    await db.update(organizations)
      .set(parsed.data)
      .where(eq(organizations.id, req.orgId))

    const updated = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, req.orgId),
    })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update organization' })
  }
})

router.get('/user-orgs', async (req, res) => {
  try {
    const { getUserOrgs } = await import('../lib/org')
    const orgs = await getUserOrgs(req.user!.id)
    res.json(orgs)
  } catch {
    res.status(500).json({ error: 'Failed to fetch user organizations' })
  }
})

export default router