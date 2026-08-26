import { Link } from 'react-router'
import { ArrowUpRight, ArrowLeft, CheckCircle2, BarChart3, Landmark, FileSpreadsheet, RefreshCw, Search, TrendingUp, ArrowLeftRight } from 'lucide-react'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import SmoothScrollReveal from '../../components/shared/SmoothScrollReveal'
import FeaturePreview from '../../components/shared/FeaturePreview'
import { usePageMeta } from '@/lib/usePageMeta'
import TiltCard from '../../components/shared/TiltCard'

const BENEFITS = [
  { icon: FileSpreadsheet, title: 'CSV import with column mapping', desc: 'Upload any bank CSV and map columns to Cashaflux fields. Supported formats include Chase, Bank of America, and Wells Fargo.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: Landmark, title: 'Bank account management', desc: 'Add multiple bank accounts — checking, savings, credit cards. Track balances and transactions per account.', color: 'from-blue-500 to-blue-600' },
  { icon: ArrowLeftRight, title: 'Auto-match transactions to invoices & expenses', desc: 'Cashaflux matches bank debits to expenses and credits to invoice payments automatically, flagging unmatched items.', color: 'from-amber-500 to-amber-600' },
  { icon: CheckCircle2, title: 'One-click reconciliation', desc: 'Review matched transactions and reconcile with a single click. Reconciled items are locked from further edits.', color: 'from-rose-500 to-rose-600' },
  { icon: TrendingUp, title: 'Reconciliation summary report', desc: 'After each reconciliation session, view a summary: total matched, total reconciled, and any remaining discrepancies.', color: 'from-blue-500 to-blue-600' },
  { icon: RefreshCw, title: 'Duplicate detection', desc: 'Already imported a transaction? Cashaflux flags duplicates based on date, amount, and description before you reconcile.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: Search, title: 'Support for Chase, BoA, Wells Fargo', desc: 'Pre-configured CSV parsing for major US banks. Upload Chase, Bank of America, or Wells Fargo CSVs with zero configuration.', color: 'from-brand-blue to-brand-navy' },
]

const RELATED = [
  { to: '/features/invoicing', title: 'Smart Invoicing', desc: 'Professional invoices in 30 seconds.' },
  { to: '/features/expenses', title: 'Expense Tracking', desc: 'Log deductions with IRS Schedule C categories.' },
  { to: '/features/reports', title: 'Financial Reports', desc: 'P&L, Balance Sheet, Cash Flow, and more.' },
  { to: '/features/tax-centre', title: 'Tax Centre', desc: 'Quarterly reminders, 1099 exports, mileage log.' },
]

export default function BankFeaturePage() {
  usePageMeta({ title: 'Bank Reconciliation', description: 'Import bank CSV files, auto-match transactions to invoices and expenses, and reconcile with one click. Supports Chase, BoA, and Wells Fargo.' })
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
                Your bank, balanced in <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">minutes</span>, not weekends.
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                Import bank CSVs, auto-match transactions to invoices and expenses, and reconcile with one click. Supports major US bank formats.
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
              <FeaturePreview label="Bank reconciliation" screenshotSrc="/screenshots/features-bank-card.png" screenshotAlt="Cashaflux bank reconciliation" />
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Reconciliation without the spreadsheet headache</h2>
              <p className="text-base text-text-muted leading-relaxed">Stop manually matching bank statements to your books. Cashaflux does the matching — you just review and click reconcile.</p>
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
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-3">Import. Match. Reconcile. Done.</h2>
                <p className="text-base text-text-muted leading-relaxed mb-6">Bank reconciliation doesn't have to mean a Saturday afternoon with a highlighter and a printed statement. Cashaflux compares your bank data to your invoices and expenses and surfaces matches instantly.</p>
                <ul className="space-y-2.5">
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Column mapping wizard handles any CSV layout</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Auto-suggest matches based on amount + date proximity</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Reconciliation reports show what's been verified</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Duplicate transaction detection prevents double-counting</li>
                </ul>
              </div>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-navy/5 via-brand-navy/[0.02] to-transparent rounded-3xl" />
                <FeaturePreview label="Reconciliation workflow" screenshotSrc="/screenshots/features-bank-card.png" screenshotAlt="Reconciliation workflow" />
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