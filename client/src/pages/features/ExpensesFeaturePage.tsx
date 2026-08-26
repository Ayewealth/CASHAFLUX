import { Link } from 'react-router'
import { ArrowUpRight, ArrowLeft, CheckCircle2, Receipt, Banknote, UploadCloud, Tags, Split, Download, Camera } from 'lucide-react'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import SmoothScrollReveal from '../../components/shared/SmoothScrollReveal'
import FeaturePreview from '../../components/shared/FeaturePreview'
import { usePageMeta } from '@/lib/usePageMeta'
import TiltCard from '../../components/shared/TiltCard'

const BENEFITS = [
  { icon: Tags, title: 'IRS Schedule C categories pre-loaded', desc: 'All expense categories match IRS Schedule C line items. No guessing — every deduction maps to the right tax field.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: UploadCloud, title: 'Drag-and-drop receipt upload', desc: 'Drop receipt images or PDFs directly into any expense. Files upload to Cloudflare R2 with automatic thumbnail generation.', color: 'from-blue-500 to-blue-600' },
  { icon: Split, title: 'Split expenses across categories', desc: 'One receipt covering multiple categories? Split the total across Schedule C items with precise dollar amounts.', color: 'from-amber-500 to-amber-600' },
  { icon: Banknote, title: 'Custom categories', desc: 'Create your own expense categories alongside IRS defaults. Perfect for industry-specific costs not covered by Schedule C.', color: 'from-rose-500 to-rose-600' },
  { icon: Download, title: 'Bulk CSV export', desc: 'Export all expenses — or filtered subsets — as CSV. Compatible with Excel, QuickBooks, and your accountant\'s spreadsheet.', color: 'from-blue-500 to-blue-600' },
  { icon: CheckCircle2, title: 'Reconciled status tracking', desc: 'Mark expenses as reconciled once matched to bank transactions. Know exactly which expenses are verified at a glance.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: Camera, title: 'Mileage tracking integration', desc: 'Log business trips with origin, destination, and purpose. IRS rate applied automatically. Total deduction calculated per trip.', color: 'from-brand-blue to-brand-navy' },
]

const RELATED = [
  { to: '/features/invoicing', title: 'Smart Invoicing', desc: 'Professional invoices in 30 seconds.' },
  { to: '/features/bank-reconciliation', title: 'Bank Reconciliation', desc: 'Match bank transactions in minutes.' },
  { to: '/features/reports', title: 'Financial Reports', desc: 'P&L, Balance Sheet, Cash Flow, and more.' },
  { to: '/features/tax-centre', title: 'Tax Centre', desc: 'Quarterly reminders, 1099 exports, mileage log.' },
]

export default function ExpensesFeaturePage() {
  usePageMeta({ title: 'Expense Tracking', description: 'Log expenses with IRS Schedule C categories, drag-and-drop receipt upload, split across categories, and CSV export.' })
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/[0.03] via-accent-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link to="/features" className="inline-flex items-center gap-1.5 text-sm text-accent-gold-dark hover:text-accent-gold transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to all features
          </Link>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">Every deduction logged.</span> Nothing missed at tax time.
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                Log expenses with IRS Schedule C categories, upload receipts, split costs across categories, and export for your accountant — all in one place.
              </p>
              <Link
                to="/signup"
                className="group relative inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/10 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Start for free</span>
                <ArrowUpRight className="relative w-4 h-4" />
              </Link>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <FeaturePreview label="Expense log" screenshotSrc="/screenshots/features-expenses.png" screenshotAlt="Cashaflux expense log" />
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Expense tracking built for tax season</h2>
              <p className="text-base text-text-muted leading-relaxed">Every expense logged correctly means more deductions and less stress when your accountant asks for receipts.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <SmoothScrollReveal key={b.title} delay={0.08 * i}>
                <TiltCard tiltDegree={3}>
                  <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:border-accent-gold/30 hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-4`}>
                      <b.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-brand-navy mb-2">{b.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{b.desc}</p>
                  </div>
                </TiltCard>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center mb-4 shadow-sm">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-3">From receipt to deduction, in seconds</h2>
                <p className="text-base text-text-muted leading-relaxed mb-6">Add an expense, attach a receipt photo, pick your Schedule C category, and move on. Cashaflux handles the categorization, totals, and tax mapping behind the scenes.</p>
                <ul className="space-y-2.5">
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Date, amount, vendor, and category on every expense</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Receipt upload with auto-generated thumbnail</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Split single receipts across multiple categories</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Bulk delete, filter by date range, and CSV export</li>
                </ul>
              </div>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-navy/5 via-brand-navy/[0.02] to-transparent rounded-3xl" />
                <FeaturePreview label="Expense details" screenshotSrc="/screenshots/features-expenses.png" screenshotAlt="Expense entry detail" />
              </div>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-16 lg:py-24 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-4">Explore more features</h2>
              <p className="text-base text-text-muted leading-relaxed">Cashaflux is a complete accounting platform. See what else you can do.</p>
            </div>
          </SmoothScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RELATED.map((r, i) => (
              <SmoothScrollReveal key={r.title} delay={0.08 * i}>
                <Link to={r.to} className="block p-5 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:border-accent-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-brand-navy hover:text-brand-navy-light transition-colors mb-1">{r.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{r.desc}</p>
                </Link>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Ready to get started?</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">Try Cashaflux free. No credit card required.</p>
            <Link to="/signup" className="group relative inline-flex items-center gap-1.5 px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 shadow-lg active:scale-[0.98] text-sm overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/10 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">Start for free</span>
              <ArrowUpRight className="relative w-4 h-4" />
            </Link>
          </SmoothScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}