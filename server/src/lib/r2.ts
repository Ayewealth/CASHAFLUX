import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../env'

let s3Client: S3Client | null = null

export function getS3Client(): S3Client | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
    return null
  }
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return s3Client
}

export async function uploadFile(
  orgId: string,
  type: 'logos' | 'receipts',
  buffer: Buffer,
  mimeType: string,
): Promise<string | null> {
  const s3 = getS3Client()
  if (!s3) return null

  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : mimeType === 'application/pdf' ? 'pdf' : 'jpg'
  const key = `${orgId}/${type}/${crypto.randomUUID()}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }))

  return key
}