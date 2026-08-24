import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import SmoothScrollReveal from './SmoothScrollReveal'
import Screenshot from './Screenshot'

interface RelatedPost {
  slug: string
  title: string
  excerpt: string | null
  image?: string
}

interface RelatedPostsProps {
  posts: RelatedPost[]
  className?: string
}

export default function RelatedPosts({ posts, className = '' }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-brand-navy mb-6">Continue reading</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <SmoothScrollReveal key={post.slug} delay={0.08 * i}>
            <Link
              to={`/blog/${post.slug}`}
              className="group block p-5 rounded-2xl bg-white border border-border/50 hover:border-brand-navy/20 hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300"
            >
<div className="h-24 overflow-hidden rounded-xl border border-border/50 mb-3">
                    <Screenshot fallback="Related post" src={post.image} alt={post.title} />
                  </div>
              <h4 className="text-sm font-bold text-brand-navy mb-1 group-hover:text-brand-navy transition-colors line-clamp-2">
                {post.title}
              </h4>
              {post.excerpt && (
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-2">{post.excerpt}</p>
              )}
              <span className="text-xs font-medium text-brand-navy inline-flex items-center gap-1 transition-all group-hover:gap-1.5">
                Read <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
          </SmoothScrollReveal>
        ))}
      </div>
    </div>
  )
}