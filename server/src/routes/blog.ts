import { Router } from 'express'
import { db } from '../db/client'
import { blogPosts, insertBlogPostSchema } from '@shared/schema'
import { eq, desc, isNotNull } from 'drizzle-orm'

const router = Router()

// List published blog posts
router.get('/', async (_req, res) => {
  try {
    const posts = await db.query.blogPosts.findMany({
      where: isNotNull(blogPosts.publishedAt),
      orderBy: [desc(blogPosts.publishedAt)],
    })
    res.json(posts)
  } catch (err) {
    console.error('Blog list error:', err)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// Get single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, req.params.slug),
    })
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json(post)
  } catch (err) {
    console.error('Blog post error:', err)
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

export default router