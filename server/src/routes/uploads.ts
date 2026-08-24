import { Router } from 'express'
import multer from 'multer'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAuth } from '../middleware/auth'
import { db } from '../db/client'
import { organizations } from '@shared/schema'
import { eq } from 'drizzle-orm'
import { uploadFile, getS3Client } from '../lib/r2'
import { env } from '../env'

const router = Router()

router.use(requireAuth)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and WebP are allowed.'))
    }
  },
})

router.post('/logo', upload.single('file'), async (req, res) => {
  const { orgId } = req.body
  if (!orgId) {
    res.status(400).json({ error: 'orgId is required' })
    return
  }
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' })
    return
  }

  try {
    const key = await uploadFile(orgId, 'logos', req.file.buffer, req.file.mimetype)
    if (!key) {
      res.status(503).json({ error: 'File upload is not configured' })
      return
    }

    await db.update(organizations)
      .set({ logoR2Key: key })
      .where(eq(organizations.id, orgId))

    res.json({ key })
  } catch {
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

router.get('/:key(*)', async (req, res) => {
  try {
    const s3 = getS3Client()
    if (!s3) { res.status(503).json({ error: 'File storage not configured' }); return }
    const key = (req.params as Record<string, string>)['key']
    if (!key) { res.status(400).json({ error: 'Invalid key' }); return }
    const command = new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
    res.redirect(url)
  } catch {
    res.status(500).json({ error: 'Failed to serve file' })
  }
})

export default router