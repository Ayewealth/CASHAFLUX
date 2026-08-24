import { useParams, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useScroll, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import AuthorCard from '../components/shared/AuthorCard'
import RelatedPosts from '../components/shared/RelatedPosts'
import TOC from '../components/shared/TOC'
import Screenshot from '../components/shared/Screenshot'
import { usePageMeta } from '@/lib/usePageMeta'

interface BlogPost {
  id: string
  title: string
  slug: string
  contentMd: string
  excerpt: string | null
  publishedAt: string | null
  author: string | null
}

function MarkdownContent({ content }: { content: string }) {
  if (!content) return null
  const lines = content.split('\n')
  const rendered = lines.map((line, i) => {
    if (line.startsWith('## ')) {
      const text = line.slice(3)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h2 key={i} id={id} className="text-xl font-bold text-brand-navy mt-8 mb-3">{text}</h2>
    }
    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-brand-navy mt-6 mb-2">{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={i} className="text-sm text-text-muted leading-relaxed ml-4 list-disc">{line.slice(2)}</li>
    if (line.trim() === '') return <div key={i} className="h-3" />
    return <p key={i} className="text-sm text-text-muted leading-relaxed mb-3">{line}</p>
  })
  return <div>{rendered}</div>
}

const SEED_CONTENT: Record<string, { title: string; content: string; author: string; date: string; image: string }> = {
  'cash-flow-tips': {
    title: '5 Cash Flow Tips Every Small Business Owner Should Know',
    author: 'Sarah Mitchell',
    date: '2026-08-15',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## Why cash flow matters

Cash flow is the lifeblood of any small business. Even profitable businesses can fail if they run out of cash. Here are five tips to keep your cash flow healthy.

## 1. Invoice promptly and follow up

The sooner you send an invoice, the sooner you get paid. Use Cashaflux to create and send invoices instantly. Set up automatic payment reminders for overdue invoices.

## 2. Offer multiple payment options

Make it easy for clients to pay you. While Cashaflux doesn't process payments directly (yet), you can include your payment links, Venmo, or bank details on every invoice.

## 3. Track expenses in real time

Don't wait until the end of the month to log expenses. Use Cashaflux's mobile-friendly interface to log expenses as they happen. Snap a photo of the receipt and upload it immediately.

## 4. Maintain a cash reserve

Aim to keep 3-6 months of operating expenses in reserve. Use Cashaflux's cash flow reports to forecast your monthly needs and plan accordingly.

## 5. Review your reports monthly

Set aside time each month to review your Profit & Loss statement and Cash Flow report. Cashaflux makes this easy with visual charts and one-click report generation.

The key to cash flow management is consistency. With Cashaflux, you can stay on top of your finances without spending hours on accounting.
    `.trim(),
  },
  'quarterly-tax-deadlines-2026': {
    title: 'Understanding US Quarterly Tax Deadlines for 2026',
    author: 'James Chen',
    date: '2026-08-10',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## What are quarterly estimated taxes?

If you're self-employed or a small business owner, the IRS requires you to pay estimated taxes quarterly on income that isn't subject to withholding.

## 2026 Quarterly Deadlines

- Q1 (Jan 1 - Mar 31): Due April 15, 2026
- Q2 (Apr 1 - May 31): Due June 15, 2026
- Q3 (Jun 1 - Aug 31): Due September 15, 2026
- Q4 (Sep 1 - Dec 31): Due January 15, 2027

## How to calculate estimated taxes

Use Cashaflux's Tax Centre to see your year-to-date income and expenses. The general rule is to pay at least 90% of your current year tax liability or 100% of your prior year liability.

## What happens if you miss a deadline?

The IRS charges a penalty for late payments, even if you're due a refund when you file. The penalty is calculated based on how much you owe and how late you are.

## Stay on track with Cashaflux

Cashaflux's Tax Centre includes quarterly deadline reminders, so you'll never miss a payment. Set it and forget it.
    `.trim(),
  },
}

function getReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(' ').length / 200))
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [scrollProgress, setScrollProgress] = useState(0)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (v) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(h > 0 ? v / h : 0)
    })
    return () => unsubscribe()
  }, [scrollY])

  const { data: post } = useQuery<BlogPost>({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })

  const seed = slug ? SEED_CONTENT[slug] : null
  const title = post?.title || seed?.title || 'Blog Post'
  const author = post?.author || seed?.author || 'Cashaflux Team'
  const date = post?.publishedAt || seed?.date || ''
  const content = post?.contentMd || seed?.content || ''
  const image = seed?.image || ''

  usePageMeta({ title, description: post?.excerpt || 'Read our latest blog post' })
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white">
        <div
          className="h-full bg-brand-navy transition-all duration-100"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <Header />

      <article className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-navy transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to blog
            </Link>
          </SmoothScrollReveal>

          <SmoothScrollReveal delay={0.1}>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-4">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-4 pb-4 border-b border-border/50">
              {date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              <span>By {author}</span>
              {content && <span>{getReadTime(content)} min read</span>}
            </div>
            {image && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-border/50">
                <Screenshot fallback="Article header" src={image} alt={title} />
              </div>
            )}
          </SmoothScrollReveal>

          <div className="grid lg:grid-cols-[1fr_200px] gap-8 lg:gap-12">
            {/* TOC — desktop sidebar */}
            <TOC content={content} className="hidden lg:block order-2 sticky top-28 self-start" />

            {/* Content */}
            <div className="order-1">
              <SmoothScrollReveal delay={0.2}>
                {content ? (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownContent content={content} />
                  </div>
                ) : (
                  <p className="text-text-muted">Post content coming soon.</p>
                )}
              </SmoothScrollReveal>

              {/* Author Bio */}
              <SmoothScrollReveal delay={0.3}>
                <div className="mt-10 pt-8 border-t border-border/50">
                  <AuthorCard name={author} role="Contributor" />
                </div>
              </SmoothScrollReveal>
            </div>
          </div>

          {/* Related Posts */}
          <SmoothScrollReveal delay={0.3}>
            <div className="mt-12 pt-8 border-t border-border/50">
              <RelatedPosts
                posts={[
                  { slug: 'freelance-invoicing-guide', title: 'The Complete Guide to Freelance Invoicing', excerpt: 'From setting payment terms to following up on late payments...' },
                  { slug: 'track-business-expenses', title: 'How to Track Business Expenses Like a Pro', excerpt: 'Stop letting receipts pile up. Learn the best practices...' },
                  { slug: 'bank-reconciliation-guide', title: 'Bank Reconciliation: Why It Matters and How to Do It', excerpt: 'Bank reconciliation is critical for accurate books...' },
                ]}
              />
            </div>
          </SmoothScrollReveal>

          {/* CTA */}
          <SmoothScrollReveal delay={0.3}>
            <div className="mt-12 p-6 rounded-2xl bg-brand-navy text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <p className="text-white font-semibold text-sm mb-3">Try Cashaflux free</p>
                <p className="text-white/60 text-xs mb-4">No credit card required. Set up in minutes.</p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-brand-navy font-semibold rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 text-sm"
                >
                  Start for free <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </SmoothScrollReveal>
        </div>
      </article>

      <Footer />
    </div>
  )
}
