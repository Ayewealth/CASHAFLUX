import { db } from './db/client'
import { industries, expenseCategories, blogPosts } from '@shared/schema'

const SEED_INDUSTRIES = [
  'Accounting', 'Advertising', 'Agriculture', 'Architecture', 'Automotive',
  'Biotechnology', 'Construction', 'Consulting', 'Education', 'Energy',
  'Engineering', 'Entertainment', 'Finance', 'Food & Beverage', 'Government',
  'Healthcare', 'Hospitality', 'Information Technology', 'Insurance', 'Legal',
  'Manufacturing', 'Marketing', 'Media', 'Nonprofit', 'Real Estate',
  'Retail', 'Science', 'Telecommunications', 'Transportation', 'Utilities',
  'Wholesale',
]

export const IRS_CATEGORIES = [
  'Advertising', 'Car & Truck', 'Commissions', 'Insurance', 'Legal & Professional',
  'Office Expenses', 'Rent', 'Repairs', 'Supplies', 'Travel', 'Meals',
  'Utilities', 'Wages', 'Other',
]

export async function seedIndustries(): Promise<void> {
  try {
    const existing = await db.query.industries.findFirst()
    if (existing) {
      console.log('[seed] Industries already seeded, skipping')
      await seedBlogPosts()
      return
    }

    const values = SEED_INDUSTRIES.map((name) => ({
      id: crypto.randomUUID(),
      name,
    }))

    await db.insert(industries).values(values)
    console.log(`[seed] Seeded ${values.length} industries`)
    await seedBlogPosts()
  } catch (error) {
    console.error('[seed] Failed to seed industries:', error)
  }
}

const SEED_BLOG_POSTS = [
  {
    title: '5 Cash Flow Tips Every Small Business Owner Should Know',
    slug: 'cash-flow-tips',
    excerpt: 'Learn how to manage your cash flow effectively with these five practical tips that can help your business stay healthy and profitable.',
    author: 'Sarah Mitchell',
    contentMd: `## Why cash flow matters\n\nCash flow is the lifeblood of any small business. Even profitable businesses can fail if they run out of cash. Here are five tips to keep your cash flow healthy.\n\n## 1. Invoice promptly and follow up\n\nThe sooner you send an invoice, the sooner you get paid. Use Cashaflux to create and send invoices instantly. Set up automatic payment reminders for overdue invoices.\n\n## 2. Offer multiple payment options\n\nMake it easy for clients to pay you. While Cashaflux does not process payments directly (yet), you can include your payment links, Venmo, or bank details on every invoice.\n\n## 3. Track expenses in real time\n\nDo not wait until the end of the month to log expenses. Use Cashaflux mobile-friendly interface to log expenses as they happen. Snap a photo of the receipt and upload it immediately.\n\n## 4. Maintain a cash reserve\n\nAim to keep 3-6 months of operating expenses in reserve. Use Cashaflux cash flow reports to forecast your monthly needs and plan accordingly.\n\n## 5. Review your reports monthly\n\nSet aside time each month to review your Profit & Loss statement and Cash Flow report. Cashaflux makes this easy with visual charts and one-click report generation.\n\nThe key to cash flow management is consistency. With Cashaflux, you can stay on top of your finances without spending hours on accounting.`,
  },
  {
    title: 'Understanding US Quarterly Tax Deadlines for 2026',
    slug: 'quarterly-tax-deadlines-2026',
    excerpt: 'Stay ahead of IRS deadlines with our complete guide to quarterly estimated tax payments for 2026. Never miss a deadline again.',
    author: 'James Chen',
    contentMd: `## What are quarterly estimated taxes?\n\nIf you are self-employed or a small business owner, the IRS requires you to pay estimated taxes quarterly on income that is not subject to withholding.\n\n## 2026 Quarterly Deadlines\n\n- Q1 (Jan 1 - Mar 31): Due April 15, 2026\n- Q2 (Apr 1 - May 31): Due June 15, 2026\n- Q3 (Jun 1 - Aug 31): Due September 15, 2026\n- Q4 (Sep 1 - Dec 31): Due January 15, 2027\n\n## How to calculate estimated taxes\n\nUse Cashaflux Tax Centre to see your year-to-date income and expenses. The general rule is to pay at least 90% of your current year tax liability or 100% of your prior year liability.\n\n## What happens if you miss a deadline?\n\nThe IRS charges a penalty for late payments, even if you are due a refund when you file.\n\n## Stay on track with Cashaflux\n\nCashaflux Tax Centre includes quarterly deadline reminders, so you will never miss a payment.`,
  },
  {
    title: 'How to Track Business Expenses Like a Pro',
    slug: 'track-business-expenses',
    excerpt: 'Stop letting receipts pile up. Learn the best practices for tracking business expenses and making tax season a breeze.',
    author: 'Sarah Mitchell',
    contentMd: `## Why expense tracking matters\n\nTracking business expenses is essential for accurate bookkeeping, tax deductions, and understanding your true profitability.\n\n## Use IRS Schedule C categories\n\nCashaflux comes pre-loaded with IRS Schedule C categories including Advertising, Car & Truck, Commissions, Insurance, Legal & Professional, Office Expenses, and more.\n\n## Snap receipts on the go\n\nUse Cashaflux receipt upload feature to photograph receipts as you get them. Stored securely in the cloud, accessible from any device.\n\n## Reconcile regularly\n\nMatch your logged expenses against bank transactions monthly to catch errors and ensure nothing is missed.`,
  },
  {
    title: 'Bank Reconciliation: Why It Matters and How to Do It',
    slug: 'bank-reconciliation-guide',
    excerpt: 'Bank reconciliation is critical for accurate books. Here is why it matters and how Cashaflux makes it painless.',
    author: 'James Chen',
    contentMd: `## What is bank reconciliation?\n\nBank reconciliation is the process of matching your internal financial records against your bank statement to ensure everything matches.\n\n## Why it matters\n\nRegular reconciliation catches errors, prevents fraud, and ensures your financial reports are accurate. It is essential for tax preparation and business decision-making.\n\n## How Cashaflux helps\n\nCashaflux bank reconciliation feature lets you import CSV files from your bank, auto-match transactions to invoices and expenses, and reconcile with one click.`,
  },
  {
    title: '1099 vs W-2: Understanding Worker Classification',
    slug: '1099-vs-w2',
    excerpt: 'Misclassifying workers can cost you. Learn the difference between 1099 contractors and W-2 employees to stay compliant.',
    author: 'Alex Rivera',
    contentMd: `## The difference matters\n\nWorker classification determines tax obligations, benefits, and legal protections. Getting it wrong can result in penalties from the IRS and Department of Labor.\n\n## 1099 independent contractors\n\nIndependent contractors are self-employed individuals who control how and when they work. You do not withhold taxes for them.\n\n## W-2 employees\n\nEmployees work under your direction and control. You must withhold payroll taxes, pay employer taxes, and provide benefits as required by law.\n\n## Use Cashaflux Payroll Export\n\nCashaflux helps you track both W-2 and 1099 payments and export payroll-ready CSVs for Gusto, ADP, or Paychex.`,
  },
]

export async function seedBlogPosts(): Promise<void> {
  try {
    const existing = await db.query.blogPosts.findFirst()
    if (existing) {
      return
    }

    const values = SEED_BLOG_POSTS.map((post) => ({
      id: crypto.randomUUID(),
      title: post.title,
      slug: post.slug,
      contentMd: post.contentMd,
      excerpt: post.excerpt,
      publishedAt: new Date(),
      author: post.author,
    }))

    await db.insert(blogPosts).values(values)
    console.log(`[seed] Seeded ${values.length} blog posts`)
  } catch (error) {
    console.error('[seed] Failed to seed blog posts:', error)
  }
}

export async function seedDefaultExpenseCategories(orgId: string): Promise<void> {
  try {
    const existing = await db.query.expenseCategories.findFirst({
      where: (c, { eq }) => eq(c.orgId, orgId),
    })
    if (existing) return

    const values = IRS_CATEGORIES.map((name) => ({
      id: crypto.randomUUID(),
      orgId,
      name,
      irsDefault: true,
    }))

    await db.insert(expenseCategories).values(values)
    console.log(`[seed] Seeded ${values.length} expense categories for org ${orgId}`)
  } catch (error) {
    console.error('[seed] Failed to seed expense categories:', error)
  }
}