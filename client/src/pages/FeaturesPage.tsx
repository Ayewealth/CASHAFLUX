import { Link } from 'react-router'
import { CheckCircle2, ArrowUpRight, Receipt, Banknote, BarChart3, PieChart, FileText, Users, Wallet, Calculator, Sparkles } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import FeaturePreview from '../components/shared/FeaturePreview'
import { usePageMeta } from '@/lib/usePageMeta'

const PERSONAS = [
  { icon: Users, title: 'Freelancers & Sole Traders', color: 'from-brand-navy to-brand-navy-light', features: 'Simple invoicing, expense tracking, mileage log, tax-ready exports' },
  { icon: Wallet, title: 'Small Business Teams', color: 'from-blue-500 to-blue-600', features: 'Unlimited clients, bank reconciliation, recurring invoices, advanced reports' },
  { icon: Calculator, title: 'Accountants & Bookkeepers', color: 'from-violet-500 to-violet-600', features: 'Read-only access, tax-ready packages, 1099 tracking, multi-client management' },
]

const FEATURES_DETAIL = [
  {
    icon: Receipt, title: 'Smart Invoicing', color: 'from-brand-navy to-brand-navy-light',
    desc: 'Create professional, customizable invoices in seconds. Auto-numbering, dynamic line items, tax rate calculation, and discount support.',
    benefits: ['Auto-generated invoice numbers (INV-0042)', 'Client selector with inline creation', 'Dynamic line items with tax rates', 'PDF generation with @react-pdf/renderer', 'Send via email with auto-attached PDF', 'Mark as paid, overdue, or sent status'],
  },
  {
    icon: Banknote, title: 'Expense Tracking', color: 'from-blue-500 to-blue-600',
    desc: 'Log expenses with IRS Schedule C categories. Drag-and-drop receipt upload, split expenses across categories.',
    benefits: ['IRS Schedule C categories pre-loaded', 'Custom categories for your business', 'Receipt upload to Cloudflare R2', 'Split expenses across categories', 'Bulk delete and CSV export', 'Reconciled status tracking'],
  },
  {
    icon: BarChart3, title: 'Bank Reconciliation', color: 'from-amber-500 to-amber-600',
    desc: 'Import bank CSV files, auto-match transactions to invoices and expenses, and reconcile with one click. Supports major US bank formats.',
    benefits: ['CSV import with column mapping', 'Duplicate detection', 'Auto-match to invoices and expenses', 'One-click reconciliation', 'Reconciliation summary report', 'Support for Chase, BoA, Wells Fargo'],
  },
  {
    icon: PieChart, title: 'Financial Reports', color: 'from-rose-500 to-rose-600',
    desc: 'Comprehensive reports with Recharts visualizations. Export as PDF or CSV. Profit & Loss, Balance Sheet, Cash Flow, and more.',
    benefits: ['Profit & Loss Statement', 'Balance Sheet', 'Cash Flow Statement', 'A/R and A/P Aging reports', 'Sales by Client report', 'All reports exportable as CSV'],
  },
  {
    icon: FileText, title: 'Tax Centre', color: 'from-violet-500 to-violet-600',
    desc: 'Stay tax-ready year-round. Quarterly estimated tax reminders, 1099 contractor tracking, mileage log, and one-click accountant hand-off.',
    benefits: ['Quarterly tax deadline reminders', '1099-NEC contractor data export', 'Mileage log with IRS rate ($0.70/mi)', 'Tax-ready export package', 'Sales tax tracking by state', 'IRS category breakdown by tax year'],
  },
  {
    icon: Wallet, title: 'Mileage Tracking', color: 'from-orange-500 to-orange-600',
    desc: 'Log business trips with origin, destination, and purpose. Automatic IRS mileage rate calculation. Total deduction summary for tax time.',
    benefits: ['Date, origin, destination logging', 'IRS standard mileage rate applied', 'Total miles and deduction calculation', 'Purpose tracking per trip', 'Filter by date range', 'Export for tax reporting'],
  },
  {
    icon: Calculator, title: 'Payroll Export', color: 'from-cyan-500 to-cyan-600',
    desc: 'Record employee/contractor payments and export payroll-ready CSVs compatible with Gusto, ADP, and Paychex.',
    benefits: ['W-2 and 1099 payment tracking', 'Payroll register with CSV export', 'Auto-posting to Wages category', 'MTD and YTD payroll totals', 'Gusto-compatible format', 'ADP and Paychex compatible'],
  },
  {
    icon: Users, title: 'Team Collaboration', color: 'from-indigo-500 to-indigo-600',
    desc: 'Invite team members with granular role-based access. Owner, Admin, Accountant (read-only), and Member roles with activity audit logging.',
    benefits: ['Role-based access control', 'Accountant read-only mode', 'Activity audit log', 'Invite by email via Resend', 'Revoke access anytime', 'Up to 5 team members (Business)'],
  },
]

const COMING_SOON = [
  { title: 'Bank Feeds (Plaid)', desc: 'Automatic bank transaction syncing connected to your accounts' },
  { title: 'Mobile Apps', desc: 'iOS and Android apps for on-the-go expense logging and invoicing' },
  { title: 'Multi-Currency', desc: 'Support for international clients and multi-currency invoicing' },
  { title: 'Payment Links', desc: 'Accept credit card payments directly from your invoices via Stripe' },
]

export default function FeaturesPage() {
  usePageMeta({ title: 'Features', description: 'Discover Cashaflux features: smart invoicing, expense tracking, bank reconciliation, financial reports, and tax-ready exports.' })
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy tracking-tight mb-4">
                Everything you need. <span className="text-brand-navy">Nothing you don't.</span>
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                From invoicing to tax-ready exports, Cashaflux gives you the tools to stay on top of your finances — all in one beautifully designed platform.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm"
              >
                Start for free
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <FeaturePreview label="Feature Overview" screenshotSrc="/screenshots/hero-dashboard.png" screenshotAlt="Cashaflux feature overview" />
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Role-based breakdown */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-4">
              Built for how you work
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              Whether you're a solo freelancer or running a growing team, Cashaflux adapts to your needs.
            </p>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((p, i) => (
              <SmoothScrollReveal key={p.title} delay={0.1 * i}>
                <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <p.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-3">{p.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{p.features}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Feature deep-dives */}
      {FEATURES_DETAIL.slice(0, 2).map((feature, i) => (
        <section key={feature.title} className={`py-16 lg:py-24 ${i % 2 === 1 ? 'bg-white' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <SmoothScrollReveal delay={0.1}>
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight mb-3">{feature.title}</h2>
                  <p className="text-base text-text-muted leading-relaxed mb-6">{feature.desc}</p>
                  <ul className="space-y-2.5">
                    {feature.benefits.map((b) => (
                      <li key={b} className="text-sm text-text-muted flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </SmoothScrollReveal>
              <SmoothScrollReveal delay={0.2}>
                <div className="relative">
                  <FeaturePreview
                    label={feature.title}
                    screenshotSrc={feature.title === 'Smart Invoicing' ? '/screenshots/features-invoicing.png' : feature.title === 'Expense Tracking' ? '/screenshots/features-expenses.png' : undefined}
                    screenshotAlt={`${feature.title} screenshot`}
                  />
                </div>
              </SmoothScrollReveal>
            </div>
          </div>
        </section>
      ))}

      {/* Break zigzag — Full width hero feature */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-brand-navy/5 to-brand-navy/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <SmoothScrollReveal>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center mx-auto mb-5 shadow-md">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-4">
              Smart Invoicing — your most-used feature
            </h2>
            <p className="text-base text-text-muted leading-relaxed max-w-2xl mx-auto mb-8">
              The heart of Cashaflux. Create, send, track, and get paid — all from one place.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-md active:scale-[0.98] text-sm"
            >
              Start for free <ArrowUpRight className="w-4 h-4" />
            </Link>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* Remaining features - 2-col grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES_DETAIL.slice(2).map((feature, i) => (
              <SmoothScrollReveal key={feature.title} delay={0.08 * i}>
                <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:border-brand-navy/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-sm`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-brand-navy">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.benefits.slice(0, 3).map((b) => (
                      <li key={b} className="text-xs text-text-muted flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-navy shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Roadmap */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-4">
              What's coming next
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              We're building the future of small business accounting — here's what's on our roadmap.
            </p>
          </SmoothScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMING_SOON.map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.08 * i}>
                <div className="p-5 rounded-2xl border border-dashed border-border/70 bg-white/50">
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium text-brand-navy bg-brand-blue-light rounded-full mb-3">
                    In development
                  </span>
                  <h3 className="text-sm font-bold text-brand-navy mb-1">{item.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Ready to get started?</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">Try Cashaflux free. No credit card required.</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 shadow-lg active:scale-[0.98] text-sm"
            >
              Start for free
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </SmoothScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}