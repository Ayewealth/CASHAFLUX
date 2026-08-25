import { db } from './db/client'
import { reseBlogPosts } from './seed'

async function main() {
  console.log('[rese-blog] Starting blog re-seed...')
  await reseBlogPosts()
  console.log('[rese-blog] Done')
  process.exit(0)
}

main().catch((err) => {
  console.error('[rese-blog] Failed:', err)
  process.exit(1)
})