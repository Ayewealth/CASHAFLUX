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
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## Why cash flow matters

Cash flow is the lifeblood of any small business. Even profitable businesses can fail if they run out of cash. Here are five tips to keep your cash flow healthy and your business thriving.

## 1. Invoice promptly and follow up

The sooner you send an invoice, the sooner you get paid. Use Cashaflux to create and send invoices instantly with customizable templates. Set up automatic payment reminders for overdue invoices so nothing falls through the cracks. Studies show that businesses using automated invoicing get paid an average of 15 days faster than those that rely on manual processes.

## 2. Offer multiple payment options

Make it easy for clients to pay you. While Cashaflux does not process payments directly (yet), you can include your payment links, Venmo, PayPal, or bank details on every invoice. The fewer barriers between your client and payment, the faster the cash hits your account.

## 3. Track expenses in real time

Do not wait until the end of the month to log expenses. Use Cashaflux mobile-friendly interface to log expenses as they happen. Snap a photo of the receipt and upload it immediately. This habit prevents forgotten deductions and gives you an accurate picture of your cash position at all times.

## 4. Maintain a cash reserve

Aim to keep 3-6 months of operating expenses in reserve. Use Cashaflux cash flow reports to forecast your monthly needs and plan accordingly. A healthy reserve protects you from slow seasons, unexpected repairs, or economic downturns.

## 5. Review your reports monthly

Set aside time each month to review your Profit & Loss statement and Cash Flow report. Cashaflux makes this easy with visual charts and one-click report generation. Look for trends: Are receivables growing faster than revenue? Are expenses creeping upward? Early detection means early correction.

The key to cash flow management is consistency. With Cashaflux, you can stay on top of your finances without spending hours on accounting.`,
  },
  {
    title: 'Understanding US Quarterly Tax Deadlines for 2026',
    slug: 'quarterly-tax-deadlines-2026',
    excerpt: 'Stay ahead of IRS deadlines with our complete guide to quarterly estimated tax payments for 2026. Never miss a deadline again.',
    author: 'James Chen',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## What are quarterly estimated taxes?

If you are self-employed or a small business owner, the IRS requires you to pay estimated taxes quarterly on income that is not subject to withholding. This includes earnings from freelancing, consulting, sole proprietorships, partnerships, and S-corporations.

## 2026 Quarterly Deadlines

- Q1 (Jan 1 - Mar 31): Due April 15, 2026
- Q2 (Apr 1 - May 31): Due June 15, 2026
- Q3 (Jun 1 - Aug 31): Due September 15, 2026
- Q4 (Sep 1 - Dec 31): Due January 15, 2027

## How to calculate estimated taxes

Use Cashaflux Tax Centre to see your year-to-date income and expenses. The general rule is to pay at least 90% of your current year tax liability or 100% of your prior year liability (110% if your adjusted gross income exceeded $150,000).

Here is a simple calculation method:

- Estimate your total annual income
- Subtract your expected deductions and business expenses
- Apply the tax rate based on your bracket
- Divide by four to get your quarterly payment

## What happens if you miss a deadline?

The IRS charges a penalty for late payments, even if you are due a refund when you file. The penalty is calculated based on how much you owe and how late you are. Currently the rate is around 8% per year on underpayments, compounded daily.

## Tips for staying on track

- Set calendar reminders for all four due dates
- Pay electronically through IRS Direct Pay or EFTPS
- Adjust your estimates mid-year if income changes significantly

## Stay on track with Cashaflux

Cashaflux Tax Centre includes quarterly deadline reminders and a dashboard that shows your estimated tax liability based on real income data. You will never miss a payment again.`,
  },
  {
    title: 'How to Track Business Expenses Like a Pro',
    slug: 'track-business-expenses',
    excerpt: 'Stop letting receipts pile up. Learn the best practices for tracking business expenses and making tax season a breeze.',
    author: 'Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## Why expense tracking matters

Tracking business expenses is essential for accurate bookkeeping, maximizing tax deductions, and understanding your true profitability. The IRS expects you to keep records that substantiate every deduction you claim. Without a system, you are leaving money on the table.

## Use IRS Schedule C categories

Cashaflux comes pre-loaded with IRS Schedule C categories including Advertising, Car & Truck, Commissions, Insurance, Legal & Professional, Office Expenses, and more. Using standard categories makes tax preparation seamless because your accountant can map directly to tax forms.

## Snap receipts on the go

Use Cashaflux receipt upload feature to photograph receipts as you get them. Stored securely in the cloud, accessible from any device. No more shoeboxes of crumpled receipts at tax time.

## Best practices for expense tracking

- Log expenses weekly, not monthly
- Use dedicated business accounts only
- Categorize every transaction consistently
- Attach digital copies of all receipts over $75
- Review uncategorized transactions every week

## Reconcile regularly

Match your logged expenses against bank transactions monthly to catch errors and ensure nothing is missed. Cashaflux bank reconciliation feature highlights discrepancies so you can fix them immediately.

## Common deductible expenses

- Office supplies and equipment
- Software subscriptions (including Cashaflux!)
- Home office deduction (if you qualify)
- Business travel and meals (50% deductible)
- Professional development and education
- Marketing and advertising costs

By building a consistent expense tracking habit with Cashaflux, you will save hours during tax season and maximize every deduction you are entitled to.`,
  },
  {
    title: 'Bank Reconciliation: Why It Matters and How to Do It',
    slug: 'bank-reconciliation-guide',
    excerpt: 'Bank reconciliation is critical for accurate books. Here is why it matters and how Cashaflux makes it painless.',
    author: 'James Chen',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## What is bank reconciliation?

Bank reconciliation is the process of matching your internal financial records against your bank statement to ensure everything matches. Every transaction in your books should have a corresponding transaction on your bank statement, and vice versa.

## Why it matters

Regular reconciliation catches errors, prevents fraud, and ensures your financial reports are accurate. It is essential for tax preparation and business decision-making. Without reconciliation, you might be making decisions based on incorrect numbers.

## Common discrepancies to watch for

- Bank fees you forgot to record
- Deposits that have not cleared yet
- Duplicate entries in your books
- Unauthorized transactions or fraud
- Data entry errors (transposed numbers, wrong amounts)

## How often should you reconcile?

- High-volume businesses: weekly
- Most small businesses: monthly
- Minimum: quarterly before tax filings

## How Cashaflux helps

Cashaflux bank reconciliation feature lets you import CSV files from your bank, auto-match transactions to invoices and expenses, and reconcile with one click. The system flags unmatched items so you can investigate quickly.

## Step-by-step reconciliation process

1. Import your latest bank statement as a CSV file
2. Cashaflux automatically matches transactions
3. Review any unmatched items and categorize them
4. Add bank fees or interest income if missing
5. Confirm the ending balance matches your bank statement
6. Run a reconciliation report for your records

Consistent reconciliation gives you confidence that your financial data is accurate. With Cashaflux, what used to take hours now takes minutes.`,
  },
  {
    title: '1099 vs W-2: Understanding Worker Classification',
    slug: '1099-vs-w2',
    excerpt: 'Misclassifying workers can cost you. Learn the difference between 1099 contractors and W-2 employees to stay compliant.',
    author: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## The difference matters

Worker classification determines tax obligations, benefits, and legal protections. Getting it wrong can result in penalties from the IRS and Department of Labor, including back taxes, fines, and lawsuits.

## 1099 independent contractors

Independent contractors are self-employed individuals who control how and when they work. You do not withhold taxes for them. Key characteristics:

- They set their own schedule
- They provide their own tools and equipment
- They can work for multiple clients
- They have their own business entity
- They are not eligible for employee benefits

## W-2 employees

Employees work under your direction and control. You must withhold payroll taxes, pay employer taxes, and provide benefits as required by law. Key characteristics:

- You control when, where, and how they work
- You provide the tools and equipment
- They work exclusively for your business
- They receive overtime and minimum wage protections
- They are eligible for unemployment insurance

## The 20-factor test

The IRS uses up to 20 factors grouped into three categories: behavioral control, financial control, and relationship type. No single factor decides the classification; it is the overall picture.

## Consequences of misclassification

- Back payroll taxes plus interest and penalties
- Fines under the Fair Labor Standards Act
- Lawsuits for unpaid benefits and overtime
- Damage to your business reputation

## Use Cashaflux Payroll Export

Cashaflux helps you track both W-2 and 1099 payments and export payroll-ready CSVs for Gusto, ADP, or Paychex. Keep all worker payments organized in one place, with clear records for tax filing.

When in doubt, consult a tax professional or use Form SS-8 to request a formal IRS determination.`,
  },
  {
    title: 'The Complete Guide to Freelance Invoicing',
    slug: 'freelance-invoicing-guide',
    excerpt: 'Master the art of freelance invoicing with professional templates, payment terms, and follow-up strategies that get you paid faster.',
    author: 'Priya Patel',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## Why professional invoicing matters

Your invoice is more than a request for payment. It is a professional document that represents your brand. A clear, well-designed invoice builds trust and sets expectations. Sloppy invoices lead to delayed payments and confused clients.

## Essential elements of every invoice

Every invoice you send should include these components:

- Your business name, address, and contact information
- Client name and billing address
- Unique invoice number for tracking
- Invoice date and payment due date
- Detailed line items with descriptions, rates, and quantities
- Subtotal, any taxes, and total amount due
- Payment terms and accepted payment methods
- Any late fee policy

## Setting payment terms

Net 30 is standard, but many freelancers prefer Net 15 or even payment upon receipt. Consider these factors when setting terms:

- Your cash flow needs and operating expenses
- The client history and relationship
- Industry norms in your field
- Project size and duration

## Creating invoices with Cashaflux

Cashaflux invoicing tool lets you create professional invoices in seconds. Choose from customizable templates, add your logo, set payment terms, and send directly from the platform. Every invoice is stored securely for record-keeping.

## Following up on late payments

Even with clear terms, late payments happen. Here is a follow-up schedule that works:

- Due date: Send a gentle reminder the day payment is due
- 3 days late: Send a polite follow-up asking if there was an issue
- 7 days late: Send a more direct request, restating the terms
- 14 days late: Send a final notice and consider pausing work
- 30 days late: Send via certified mail and consider collections

## Best practices for getting paid faster

- Send invoices immediately after completing work
- Offer a small discount for early payment (e.g., 2% off if paid within 10 days)
- Set up recurring invoices for retainer clients
- Clearly communicate your late fee policy upfront
- Use Cashaflux automatic payment reminders to reduce manual follow-up

Professional invoicing is a skill that pays dividends. With Cashaflux, you can look like a pro from your very first invoice.`,
  },
  {
    title: 'Mileage Deduction 2026: What You Need to Know',
    slug: 'mileage-deduction-2026',
    excerpt: 'The IRS mileage rate changes every year. Get the latest 2026 rates, tracking methods, and strategies to maximize your deduction.',
    author: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## What is the mileage deduction?

If you use your personal vehicle for business purposes, the IRS allows you to deduct a standard mileage rate per mile driven. This rate covers gas, maintenance, depreciation, and insurance. For 2026, the standard mileage rate is expected to be adjusted for inflation.

## 2026 Standard Mileage Rates

The IRS typically announces the new rates in December. Based on current trends, here are the expected rates:

- Business miles: approximately 70 cents per mile
- Medical/moving miles: approximately 21 cents per mile
- Charitable miles: 14 cents per mile (set by law)

## Who qualifies for the deduction?

You can claim the mileage deduction if you use your vehicle for:

- Meeting clients at their location
- Traveling to job sites
- Running business errands (bank, office supply store, post office)
- Attending conferences or networking events
- Picking up supplies or inventory

Commuting between your home and regular workplace does not qualify.

## Two methods: standard vs actual expenses

You can choose between the standard mileage rate and the actual expense method. The standard rate is simpler, but the actual method may yield a larger deduction if you drive an expensive or older vehicle.

- Standard mileage: Track miles driven, multiply by the rate
- Actual expenses: Track gas, oil, repairs, insurance, depreciation, and multiply by business-use percentage

Once you choose the standard rate for a vehicle in its first year of business use, you cannot switch to actual expenses later.

## Tracking miles with Cashaflux

Cashaflux mileage tracking feature lets you log trips with starting and ending odometer readings. Categorize each trip as business, personal, medical, or charitable. Generate a mileage report at tax time with one click.

## What to include in your mileage log

- Date of each trip
- Starting and ending odometer readings
- Purpose of the trip and client name
- Total miles driven
- Business percentage if the trip had multiple purposes

## Common mistakes to avoid

- Claiming commuting miles as business miles
- Forgetting to log individual trips
- Estimating mileage instead of using exact readings
- Mixing personal and business trips without proper allocation
- Missing the deadline for choosing the standard vs actual method

The mileage deduction can save you thousands of dollars each year. With Cashaflux mileage tracking, you will have a complete, audit-ready log at tax time.`,
  },
  {
    title: 'Tax Season Success: A Month-by-Month Preparation Plan',
    slug: 'tax-season-success',
    excerpt: 'Stop scrambling every April. Follow this month-by-month tax preparation plan to make filing season painless and stress-free.',
    author: 'Priya Patel',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## Why year-round tax preparation matters

Waiting until March to think about taxes is a recipe for stress, missed deductions, and costly errors. The most successful business owners treat tax preparation as a year-round discipline. Here is a month-by-month plan to keep you ahead of the game.

## January: Set your foundation

- Review your prior year tax return for carryovers and insights
- Set up your bookkeeping system for the new year
- Update your estimated tax calculations based on projected income
- Organize your filing system for digital receipts and records
- Schedule quarterly estimated tax payments in Cashaflux Tax Centre

## February: Business structure review

- Evaluate if your current business structure (LLC, S-Corp, sole prop) still makes sense
- Review retirement contribution limits and set up or adjust contributions
- Send 1099-NEC forms to contractors if you paid them $600 or more

## March: Mid-quarter check

Reconcile your Q1 books before the April 15 deadline. Run a Profit & Loss report in Cashaflux to see how your first quarter went. Adjust estimated tax payments if income is higher or lower than expected.

## April: Q1 deadline and planning

April 15 is the first estimated tax deadline. Use Cashaflux Tax Centre to file your payment. Also start thinking about major purchases you might need before year-end.

## May - August: Maintenance mode

- Reconcile bank accounts monthly using Cashaflux bank reconciliation
- Log all expenses as they happen
- Track mileage for business trips
- Review your financial reports quarterly
- Adjust estimated tax payments for Q2 and Q3 deadlines

## September: Tax planning season

- Review year-to-date income and expenses
- Meet with your accountant for a mid-year tax planning session
- Consider equipment purchases before year-end
- Evaluate if you need to accelerate or defer income

## October: Q3 deadline and review

- Pay Q3 estimated taxes by September 15
- Run a nine-month financial review
- Check if you are on track for retirement contributions
- Review your withholding if you also have a W-2 job

## November - December: Year-end strategies

- Make necessary purchases to maximize deductions
- Review your inventory and write off obsolete items
- Consider bonus depreciation on new equipment
- Pay any outstanding business expenses
- Make charitable contributions

## January (again): The final stretch

- Gather all your 1099 forms as they arrive
- Run year-end reports in Cashaflux
- Send your data to your accountant
- File early to avoid the rush

## Using Cashaflux year-round

Cashaflux is built for year-round financial management, not just tax season. Use the dashboard to track income and expenses, run reports anytime, store receipts digitally, and export everything your accountant needs. With Cashaflux, tax season becomes just another month.`,
  },
  {
    title: 'How to Read a Profit and Loss Statement',
    slug: 'read-profit-and-loss',
    excerpt: 'The Profit and Loss statement is the most important financial report for your business. Learn to read it like an expert.',
    author: 'James Chen',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## What is a Profit and Loss statement?

A Profit and Loss statement, also called an income statement, summarizes your revenue, costs, and expenses over a specific period. It tells you whether your business is profitable and where money is being made or lost.

## The core components

Every P&L statement has the same basic structure, moving from top-line revenue to bottom-line profit:

- **Revenue**: Total income from sales and services
- **Cost of Goods Sold (COGS)**: Direct costs of producing your product or service
- **Gross Profit**: Revenue minus COGS
- **Operating Expenses**: Rent, salaries, marketing, software, utilities
- **Operating Income**: Gross profit minus operating expenses
- **Other Income/Expenses**: Interest, gains, or losses from non-core activities
- **Net Profit**: The final bottom line

## How to analyze your P&L

Reading the numbers is one thing, understanding what they mean is another. Here are the key questions to ask:

- Is revenue growing month over month?
- Are gross margins stable or eroding?
- Are expenses growing faster than revenue?
- Is net profit trending in the right direction?
- Are there seasonal patterns you should plan for?

## Key ratios to calculate

- **Gross margin**: Gross profit divided by revenue. A healthy gross margin varies by industry, but generally above 40% is strong for service businesses.
- **Operating margin**: Operating income divided by revenue. Shows how efficiently you manage overhead.
- **Net profit margin**: Net profit divided by revenue. Your true profitability after everything.

## Common P&L mistakes

- Mixing personal and business expenses
- Misclassifying COGS versus operating expenses
- Forgetting to accrue for unpaid expenses
- Not separating one-time items from recurring ones
- Ignoring non-cash expenses like depreciation

## Using Cashaflux for P&L reporting

Cashaflux Reports section generates your Profit and Loss statement automatically from your recorded transactions. View it by month, quarter, or year. Compare periods side by side. Export to PDF or CSV for your accountant.

## Action items after reviewing your P&L

- If gross margin is low: raise prices or reduce COGS
- If operating expenses are high: look for subscriptions or services you can cut
- If net profit is thin: focus on your most profitable products or services
- If revenue is flat: invest in marketing and sales

Your P&L is your business report card. With Cashaflux, you can generate it in seconds and focus on what matters: growing your business.`,
  },
  {
    title: 'Bookkeeping vs Accounting: What is the Difference?',
    slug: 'bookkeeping-vs-accounting',
    excerpt: 'Many small business owners use these terms interchangeably, but bookkeeping and accounting have distinct roles. Understand both to build a stronger financial foundation.',
    author: 'Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    contentMd: `## Not the same thing

Bookkeeping and accounting are often confused, but they serve different purposes in your business. Understanding the distinction helps you hire the right people and use the right tools for each function.

## Bookkeeping: the daily work

Bookkeeping is the day-to-day recording of financial transactions. It is the foundation on which everything else is built. Bookkeeping tasks include:

- Recording sales and income
- Logging expenses and receipts
- Categorizing transactions
- Reconciling bank accounts
- Managing accounts receivable and payable
- Generating invoices and following up on payments
- Running basic financial reports

A good bookkeeper keeps your financial records accurate and up to date. With Cashaflux, many of these tasks are automated or simplified, reducing the time you need to spend on bookkeeping.

## Accounting: the big picture

Accounting takes the data prepared by bookkeeping and turns it into strategic insights. Accountants interpret, analyze, and advise. Accounting tasks include:

- Preparing and filing tax returns
- Analyzing financial reports for trends
- Providing strategic business advice
- Setting up business structures (LLC, S-Corp, etc.)
- Planning for growth and major purchases
- Auditing financial records for accuracy
- Ensuring compliance with tax laws and regulations

## Where bookkeeping ends and accounting begins

Think of bookkeeping as building with LEGO bricks and accounting as designing the castle. The bookkeeper places each brick accurately. The accountant looks at the structure and says, "We need a tower here and a stronger foundation there."

## Do you need both?

Yes, every business needs both bookkeeping and accounting. The question is how you deliver each function:

- **Solo founder**: Use Cashaflux for bookkeeping, hire a CPA for tax season accounting
- **Small team**: Part-time bookkeeper + annual CPA review
- **Growing business**: Full-time bookkeeper + quarterly CPA meetings
- **Established business**: In-house accounting team

## How Cashaflux fits in

Cashaflux handles the heavy lifting of bookkeeping: automated transaction categorization, receipt storage, bank reconciliation, invoicing, and report generation. Your accountant gets clean, organized data they can work with immediately.

## When to level up

- You are spending more than 5 hours per week on bookkeeping
- Your accountant charges extra to fix messy records
- You are making decisions without current financial data
- You missed deductions last tax season
- You want to scale but are not sure if you are profitable

Good bookkeeping saves you money on accounting fees. Good accounting saves you money on taxes and bad decisions. Together, they are the financial backbone of your business.`,
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
      image: post.image,
    }))

    await db.insert(blogPosts).values(values)
    console.log(`[seed] Seeded ${values.length} blog posts`)
  } catch (error) {
    console.error('[seed] Failed to seed blog posts:', error)
  }
}

export async function reseBlogPosts(): Promise<void> {
  try {
    await db.delete(blogPosts)
    console.log('[seed] Deleted existing blog posts')

    const values = SEED_BLOG_POSTS.map((post) => ({
      id: crypto.randomUUID(),
      title: post.title,
      slug: post.slug,
      contentMd: post.contentMd,
      excerpt: post.excerpt,
      publishedAt: new Date(),
      author: post.author,
      image: post.image,
    }))

    await db.insert(blogPosts).values(values)
    console.log(`[seed] Re-seeded ${values.length} blog posts`)
  } catch (error) {
    console.error('[seed] Failed to re-seed blog posts:', error)
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