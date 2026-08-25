import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { organizations, orgMembers, onboardingProgress } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '../lib/encryption'
import { sanitizeObject } from '../lib/sanitize'

const router = Router()

router.use(requireAuth)

// GET /api/onboarding/status — check if the user has completed onboarding
router.get('/status', async (req, res) => {
  try {
    const member = await db.query.orgMembers.findFirst({
      where: (om, { eq }) => eq(om.userId, req.user!.id),
      columns: { orgId: true, role: true },
    })
    const ownerOrg = member?.role === 'owner'
      ? member
      : await db.query.orgMembers.findFirst({
          where: (om, { and, eq }) => and(eq(om.userId, req.user!.id), eq(om.role, 'owner')),
          columns: { orgId: true },
        })
    res.json({ onboarded: !!member, hasOwnOrg: !!ownerOrg, orgCount: member ? 1 : 0 })
  } catch {
    res.status(500).json({ error: 'Failed to check onboarding status' })
  }
})

// GET /api/onboarding/progress — get saved progress for the current user
router.get('/progress', async (req, res) => {
  try {
    const progress = await db.query.onboardingProgress.findFirst({
      where: (op, { eq }) => eq(op.userId, req.user!.id),
    })
    if (!progress) {
      res.json(null)
      return
    }
    res.json({
      currentStep: progress.currentStep,
      formData: JSON.parse(progress.formData),
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch onboarding progress' })
  }
})

// PUT /api/onboarding/progress — upsert progress for the current user
router.put('/progress', async (req, res) => {
  const { currentStep, formData } = req.body
  if (typeof currentStep !== 'number' || !formData) {
    res.status(400).json({ error: 'currentStep and formData are required' })
    return
  }
  try {
    const existing = await db.query.onboardingProgress.findFirst({
      where: (op, { eq }) => eq(op.userId, req.user!.id),
    })
    if (existing) {
      await db.update(onboardingProgress)
        .set({
          currentStep,
          formData: JSON.stringify(formData),
        })
        .where(eq(onboardingProgress.userId, req.user!.id))
    } else {
      await db.insert(onboardingProgress).values({
        id: crypto.randomUUID(),
        userId: req.user!.id,
        currentStep,
        formData: JSON.stringify(formData),
      })
    }
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to save onboarding progress' })
  }
})

// DELETE /api/onboarding/progress — clear progress after completion
router.delete('/progress', async (req, res) => {
  try {
    await db.delete(onboardingProgress)
      .where(eq(onboardingProgress.userId, req.user!.id))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to clear onboarding progress' })
  }
})

// POST /api/onboarding — create organization + member record
router.post('/', async (req, res) => {
  const {
    businessName, businessType, industry, fiscalYearStart,
    addressLine1, addressLine2, city, state, zip,
    phone, website, ein, logoR2Key, plan
  } = req.body
  try {
    const sanitized = sanitizeObject({
      name: businessName || 'My Business',
      type: businessType || 'sole_proprietor',
      industry: industry || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      phone: phone || null,
      website: website || null,
    }, ['name', 'type', 'industry', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'phone', 'website'])

    const [org] = await db.insert(organizations).values({
      id: crypto.randomUUID(),
      ownerUserId: req.user!.id,
      ...sanitized,
      ein: ein ? encrypt(ein) : null,
      logoR2Key: logoR2Key || null,
      fiscalYearStart: typeof fiscalYearStart === 'number' ? fiscalYearStart : 1,
    }).returning()

    await db.insert(orgMembers).values({
      id: crypto.randomUUID(),
      orgId: org.id,
      userId: req.user!.id,
      role: 'owner',
    })

    res.json({ orgId: org.id })
  } catch {
    res.status(500).json({ error: 'Failed to create organization' })
  }
})

// PUT /api/onboarding/:orgId — update an existing organization
router.put('/:orgId', async (req, res) => {
  const { orgId } = req.params
  const {
    businessName, businessType, industry, fiscalYearStart,
    addressLine1, addressLine2, city, state, zip,
    phone, website, ein, logoR2Key
  } = req.body

  try {
    if (!req.orgId || req.orgId !== orgId) {
      res.status(404).json({ error: 'Organization not found' })
      return
    }

    const sanitized = sanitizeObject({
      name: businessName || 'My Business',
      type: businessType || 'sole_proprietor',
      industry: industry || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      phone: phone || null,
      website: website || null,
    }, ['name', 'type', 'industry', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'phone', 'website'])

    await db.update(organizations)
      .set({
        ...sanitized,
        ein: ein ? encrypt(ein) : undefined,
        logoR2Key: logoR2Key || null,
        fiscalYearStart: typeof fiscalYearStart === 'number' ? fiscalYearStart : 1,
      })
      .where(eq(organizations.id, orgId))

    res.json({ orgId })
  } catch {
    res.status(500).json({ error: 'Failed to update organization' })
  }
})

// PUT /api/onboarding/currency — set the organization's currency preference
router.put('/currency', async (req, res) => {
  const { currency } = req.body
  if (!currency || typeof currency !== 'string') {
    res.status(400).json({ error: 'Currency is required' })
    return
  }

  try {
    if (!req.orgId) {
      res.status(404).json({ error: 'No organization found for this user' })
      return
    }

    await db.update(organizations)
      .set({ currency })
      .where(eq(organizations.id, req.orgId))

    res.json({ currency })
  } catch {
    res.status(500).json({ error: 'Failed to update currency' })
  }
})

export default router