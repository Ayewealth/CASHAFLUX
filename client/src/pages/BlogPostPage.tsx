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
  image?: string
}

function MarkdownContent({ content }: { content: string }) {
  if (!content) return null
  const lines = content.split('\n')
  const rendered = lines.map((line, i) => {
    if (line.startsWith('## ')) {
      const text = line.slice(3)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h2 key={i} id={id} className="text-xl font-bold font-heading text-brand-navy mt-8 mb-3">{text}</h2>
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
  'track-business-expenses': {
    title: 'How to Track Business Expenses Like a Pro',
    author: 'Sarah Mitchell',
    date: '2026-08-05',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## Why expense tracking matters

Tracking business expenses is essential for accurate bookkeeping, maximizing tax deductions, and understanding your true profitability.

## Use IRS Schedule C categories

Cashaflux comes pre-loaded with IRS Schedule C categories including Advertising, Car & Truck, Commissions, Insurance, Legal & Professional, Office Expenses, and more.

## Snap receipts on the go

Use Cashaflux receipt upload feature to photograph receipts as you get them. Stored securely in the cloud, accessible from any device.

## Best practices for expense tracking

- Log expenses weekly, not monthly
- Use dedicated business accounts only
- Categorize every transaction consistently
- Attach digital copies of all receipts over $75

## Common deductible expenses

- Office supplies and equipment
- Software subscriptions (including Cashaflux!)
- Home office deduction (if you qualify)
- Business travel and meals (50% deductible)
- Marketing and advertising costs

By building a consistent expense tracking habit with Cashaflux, you will save hours during tax season and maximize every deduction you are entitled to.
    `.trim(),
  },
  'bank-reconciliation-guide': {
    title: 'Bank Reconciliation: Why It Matters and How to Do It',
    author: 'James Chen',
    date: '2026-07-28',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## What is bank reconciliation?

Bank reconciliation is the process of matching your internal financial records against your bank statement to ensure everything matches.

## Why it matters

Regular reconciliation catches errors, prevents fraud, and ensures your financial reports are accurate. It is essential for tax preparation and business decision-making.

## Common discrepancies to watch for

- Bank fees you forgot to record
- Deposits that have not cleared yet
- Duplicate entries in your books
- Unauthorized transactions or fraud

## How Cashaflux helps

Cashaflux bank reconciliation feature lets you import CSV files from your bank, auto-match transactions to invoices and expenses, and reconcile with one click. The system flags unmatched items so you can investigate quickly.
    `.trim(),
  },
  '1099-vs-w2': {
    title: '1099 vs W-2: Understanding Worker Classification',
    author: 'Alex Rivera',
    date: '2026-07-20',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## The difference matters

Worker classification determines tax obligations, benefits, and legal protections. Getting it wrong can result in penalties from the IRS and Department of Labor.

## 1099 independent contractors

Independent contractors control how and when they work. You do not withhold taxes for them. They set their own schedule, provide their own tools, and can work for multiple clients.

## W-2 employees

Employees work under your direction and control. You must withhold payroll taxes, pay employer taxes, and provide benefits as required by law.

## Consequences of misclassification

- Back payroll taxes plus interest and penalties
- Fines under the Fair Labor Standards Act
- Lawsuits for unpaid benefits and overtime

## Use Cashaflux Payroll Export

Cashaflux helps you track both W-2 and 1099 payments and export payroll-ready CSVs for Gusto, ADP, or Paychex.
    `.trim(),
  },
  'freelance-invoicing-guide': {
    title: 'The Complete Guide to Freelance Invoicing',
    author: 'Priya Patel',
    date: '2026-07-15',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## Why professional invoicing matters

Your invoice is more than a request for payment. It is a professional document that represents your brand. A clear, well-designed invoice builds trust and sets expectations.

## Essential elements of every invoice

- Your business name, address, and contact information
- Client name and billing address
- Unique invoice number for tracking
- Invoice date and payment due date
- Detailed line items with descriptions, rates, and quantities
- Subtotal, any taxes, and total amount due
- Payment terms and accepted payment methods

## Creating invoices with Cashaflux

Cashaflux invoicing tool lets you create professional invoices in seconds. Choose from customizable templates, add your logo, set payment terms, and send directly from the platform.

## Following up on late payments

- Due date: Send a gentle reminder
- 3 days late: Send a polite follow-up
- 7 days late: Send a more direct request
- 14 days late: Final notice and consider pausing work

## Best practices for getting paid faster

- Send invoices immediately after completing work
- Offer a small discount for early payment
- Set up recurring invoices for retainer clients
- Use Cashaflux automatic payment reminders
    `.trim(),
  },
  'mileage-deduction-2026': {
    title: 'Mileage Deduction 2026: What You Need to Know',
    author: 'Alex Rivera',
    date: '2026-07-10',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## What is the mileage deduction?

If you use your personal vehicle for business purposes, the IRS allows you to deduct a standard mileage rate per mile driven. This rate covers gas, maintenance, depreciation, and insurance.

## Who qualifies for the deduction?

- Meeting clients at their location
- Traveling to job sites
- Running business errands (bank, office supply store, post office)
- Attending conferences or networking events

Commuting between your home and regular workplace does not qualify.

## Standard vs actual expenses

You can choose between the standard mileage rate and the actual expense method. The standard rate is simpler, but the actual method may yield a larger deduction.

## Tracking miles with Cashaflux

Cashaflux mileage tracking feature lets you log trips with starting and ending odometer readings. Categorize each trip as business, personal, medical, or charitable. Generate a mileage report at tax time with one click.

## Common mistakes to avoid

- Claiming commuting miles as business miles
- Forgetting to log individual trips
- Estimating mileage instead of using exact readings
- Mixing personal and business trips without proper allocation
    `.trim(),
  },
  'tax-season-success': {
    title: 'Tax Season Success: A Month-by-Month Preparation Plan',
    author: 'Priya Patel',
    date: '2026-07-05',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## Why year-round tax preparation matters

Waiting until March to think about taxes is a recipe for stress, missed deductions, and costly errors. The most successful business owners treat tax preparation as a year-round discipline.

## January: Set your foundation

- Review your prior year tax return for carryovers and insights
- Set up your bookkeeping system for the new year
- Update your estimated tax calculations based on projected income
- Schedule quarterly estimated tax payments in Cashaflux Tax Centre

## April: Q1 deadline and planning

April 15 is the first estimated tax deadline. Use Cashaflux Tax Centre to file your payment. Start thinking about major purchases before year-end.

## September: Tax planning season

- Review year-to-date income and expenses
- Meet with your accountant for a mid-year tax planning session
- Consider equipment purchases before year-end

## November-December: Year-end strategies

- Make necessary purchases to maximize deductions
- Pay any outstanding business expenses
- Make charitable contributions

## Using Cashaflux year-round

Cashaflux is built for year-round financial management. Use the dashboard to track income and expenses, run reports anytime, store receipts digitally, and export everything your accountant needs.
    `.trim(),
  },
  'read-profit-and-loss': {
    title: 'How to Read a Profit and Loss Statement',
    author: 'James Chen',
    date: '2026-06-28',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## What is a Profit and Loss statement?

A Profit and Loss statement summarizes your revenue, costs, and expenses over a specific period. It tells you whether your business is profitable and where money is being made or lost.

## The core components

- Revenue: Total income from sales and services
- Cost of Goods Sold (COGS): Direct costs of producing your product
- Gross Profit: Revenue minus COGS
- Operating Expenses: Rent, salaries, marketing, software
- Net Profit: The final bottom line

## Key ratios to calculate

- Gross margin: Gross profit divided by revenue
- Operating margin: Operating income divided by revenue
- Net profit margin: Net profit divided by revenue

## Using Cashaflux for P&L reporting

Cashaflux Reports section generates your Profit and Loss statement automatically from your recorded transactions. View it by month, quarter, or year. Compare periods side by side. Export to PDF or CSV for your accountant.

## Action items after reviewing your P&L

- If gross margin is low: raise prices or reduce COGS
- If operating expenses are high: cut unnecessary subscriptions
- If net profit is thin: focus on your most profitable products
    `.trim(),
  },
  'bookkeeping-vs-accounting': {
    title: 'Bookkeeping vs Accounting: What is the Difference?',
    author: 'Sarah Mitchell',
    date: '2026-06-20',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
## Not the same thing

Bookkeeping and accounting are often confused, but they serve different purposes. Understanding the distinction helps you hire the right people and use the right tools.

## Bookkeeping: the daily work

Bookkeeping is the day-to-day recording of financial transactions. Tasks include recording sales, logging expenses, categorizing transactions, reconciling bank accounts, and managing invoices.

## Accounting: the big picture

Accounting takes the data from bookkeeping and turns it into strategic insights. Accountants analyze reports, file taxes, provide business advice, and ensure compliance.

## Do you need both?

Every business needs both functions. How you deliver them depends on your stage:

- Solo founder: Use Cashaflux for bookkeeping, hire a CPA for tax season
- Small team: Part-time bookkeeper + annual CPA review
- Growing business: Full-time bookkeeper + quarterly CPA meetings

## How Cashaflux fits in

Cashaflux handles the heavy lifting of bookkeeping: automated transaction categorization, receipt storage, bank reconciliation, invoicing, and report generation. Your accountant gets clean, organized data they can work with immediately.
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
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">{title}</h1>
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
