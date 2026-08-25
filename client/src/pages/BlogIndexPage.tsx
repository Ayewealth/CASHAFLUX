import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { CalendarDays, ArrowUpRight, ArrowRight } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import NewsletterForm from '../components/shared/NewsletterForm'
import Screenshot from '../components/shared/Screenshot'
import { usePageMeta } from '@/lib/usePageMeta'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  author: string | null
  image?: string
}

const SEED_POSTS = [
  { id: '1', title: '5 Cash Flow Tips Every Small Business Owner Should Know', slug: 'cash-flow-tips', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'Learn how to manage your cash flow effectively with these five practical tips that can help your business stay healthy and profitable.', publishedAt: '2026-08-15T10:00:00Z', author: 'Sarah Mitchell' },
  { id: '2', title: 'Understanding US Quarterly Tax Deadlines for 2026', slug: 'quarterly-tax-deadlines-2026', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'Stay ahead of IRS deadlines with our complete guide to quarterly estimated tax payments for 2026. Never miss a deadline again.', publishedAt: '2026-08-10T10:00:00Z', author: 'James Chen' },
  { id: '3', title: 'How to Track Business Expenses Like a Pro', slug: 'track-business-expenses', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'Stop letting receipts pile up. Learn the best practices for tracking business expenses and making tax season a breeze.', publishedAt: '2026-08-05T10:00:00Z', author: 'Sarah Mitchell' },
  { id: '4', title: 'The Complete Guide to Freelance Invoicing', slug: 'freelance-invoicing-guide', image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'From setting payment terms to following up on late payments, this guide covers everything freelancers need to know about invoicing.', publishedAt: '2026-07-28T10:00:00Z', author: 'Alex Rivera' },
  { id: '5', title: 'Bank Reconciliation: Why It Matters and How to Do It', slug: 'bank-reconciliation-guide', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'Bank reconciliation is critical for accurate books. Here\'s why it matters and how Cashaflux makes it painless.', publishedAt: '2026-07-20T10:00:00Z', author: 'James Chen' },
  { id: '6', title: '1099 vs W-2: Understanding Worker Classification', slug: '1099-vs-w2', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'Misclassifying workers can cost you. Learn the difference between 1099 contractors and W-2 employees to stay compliant.', publishedAt: '2026-07-15T10:00:00Z', author: 'Sarah Mitchell' },
  { id: '7', title: 'Maximizing Your Mileage Deduction in 2026', slug: 'mileage-deduction-2026', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'The IRS standard mileage rate for 2026 is $0.70 per mile. Learn how to track and maximize your mileage deduction.', publishedAt: '2026-07-10T10:00:00Z', author: 'Alex Rivera' },
  { id: '8', title: 'Setting Up Your Business for Tax Season Success', slug: 'tax-season-success', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', excerpt: 'Year-round tax preparation is the key to a stress-free tax season. Here\'s how to set up your business for success.', publishedAt: '2026-07-05T10:00:00Z', author: 'James Chen' },
]

function getReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(' ').length / 200))
}

export default function BlogIndexPage() {
  usePageMeta({ title: 'Blog', description: 'Small business finance tips, tax deadline guides, and product updates from the Cashaflux team.' })
  const { data: posts } = useQuery<BlogPost[]>({
    queryKey: ['blog'],
    queryFn: async () => {
      const res = await fetch('/api/blog')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const displayPosts = posts && posts.length > 0 ? posts : SEED_POSTS
  const featured = displayPosts[0]
  const rest = displayPosts.slice(1)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 text-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
              Insights for your small business
            </h1>
            <p className="text-base text-text-muted leading-relaxed max-w-lg mx-auto mb-6">
              Tips, guides, and resources to help you manage your finances and grow your business.
            </p>
            <NewsletterForm
              placeholder="your@email.com"
              buttonText="Get weekly tips"
              className="max-w-md mx-auto"
            />
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 2. Featured Post */}
      {featured && (
        <section className="pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SmoothScrollReveal>
              <Link
                to={`/blog/${featured.slug}`}
                className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-navy/10 border border-border/50 p-8 lg:p-12 hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="inline-flex px-2.5 py-0.5 text-[10px] font-mono font-semibold text-brand-navy bg-white/80 rounded-full mb-4">
                      Featured
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-bold font-heading text-brand-navy mb-3 group-hover:text-brand-navy transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-sm text-text-muted leading-relaxed mb-4">{featured.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {featured.publishedAt
                          ? new Date(featured.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Coming soon'}
                      </span>
                      {featured.excerpt && (
                        <span>{getReadTime(featured.excerpt)} min read</span>
                      )}
                      {featured.author && <span>By {featured.author}</span>}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy mt-4 group-hover:gap-1.5 transition-all">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="hidden lg:block h-48 rounded-xl overflow-hidden border border-white/10">
                    <Screenshot fallback="Featured article" src={featured.image} alt={featured.title} />
                  </div>
                </div>
              </Link>
            </SmoothScrollReveal>
          </div>
        </section>
      )}

      {/* 3. Post Grid */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <SmoothScrollReveal key={post.id} delay={0.06 * i}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block p-6 rounded-2xl bg-white border border-border/50 hover:border-brand-navy/20 hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300"
                >
                  <div className="h-32 overflow-hidden rounded-xl border border-border/50 mb-4">
                    <Screenshot fallback="Blog thumbnail" src={post.image} alt={`${post.title} thumbnail`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Coming soon'}
                    {post.excerpt && <span>&middot; {getReadTime(post.excerpt)} min read</span>}
                  </div>
                  <h3 className="text-base font-bold text-brand-navy mb-2 group-hover:text-brand-navy transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {post.author && <span className="text-xs text-text-muted">By {post.author}</span>}
                    <span className="text-xs font-medium text-brand-navy group-hover:gap-1.5 inline-flex items-center gap-1 transition-all">
                      Read more <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Newsletter CTA */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="p-8 lg:p-10 rounded-2xl bg-brand-navy text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight mb-2">
                  Get weekly business tips
                </h2>
                <p className="text-sm text-white/60 mb-6 max-w-sm mx-auto">
                  Tax deadlines, cash flow advice, and product updates — delivered to your inbox.
                </p>
                <NewsletterForm
                  placeholder="your@email.com"
                  buttonText="Subscribe"
                  className="max-w-sm mx-auto"
                />
              </div>
            </div>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-4">
              Ready to put these tips into action?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-6 max-w-lg mx-auto">
              Cashaflux makes it easy to implement everything you've just read.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-md active:scale-[0.98] text-sm"
            >
              Start for free <ArrowUpRight className="w-4 h-4" />
            </a>
          </SmoothScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}