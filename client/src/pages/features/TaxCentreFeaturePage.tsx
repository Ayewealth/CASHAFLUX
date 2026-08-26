import { Link } from 'react-router'
import { ArrowUpRight, ArrowLeft, CheckCircle2, FileText, CalendarClock, FileSpreadsheet, MapPin, AlertTriangle, TrendingDown, Users } from 'lucide-react'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import SmoothScrollReveal from '../../components/shared/SmoothScrollReveal'
import FeaturePreview from '../../components/shared/FeaturePreview'
import { usePageMeta } from '@/lib/usePageMeta'
import TiltCard from '../../components/shared/TiltCard'

const BENEFITS = [
  { icon: CalendarClock, title: 'Quarterly estimated tax deadline reminders', desc: 'Cashaflux reminds you of upcoming IRS estimated tax deadlines — Apr 15, Jun 15, Sep 15, and Jan 15 — so you never miss a payment.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: FileText, title: '1099-NEC contractor data export', desc: 'Track payments to independent contractors throughout the year. Export 1099-NEC data ready for filing.', color: 'from-blue-500 to-blue-600' },
  { icon: MapPin, title: 'Mileage log with IRS rate ($0.70/mi)', desc: 'Log business trips with origin, destination, and purpose. The current IRS standard mileage rate is applied automatically.', color: 'from-amber-500 to-amber-600' },
  { icon: FileSpreadsheet, title: 'One-click tax-ready export package', desc: 'Generate a complete export package — P&L, expense breakdown, mileage log, 1099 data — in one click. Hand it straight to your CPA.', color: 'from-rose-500 to-rose-600' },
  { icon: TrendingDown, title: 'IRS Schedule C category breakdown', desc: 'Every expense mapped to the correct Schedule C line item. See totals per category for the tax year at a glance.', color: 'from-blue-500 to-blue-600' },
  { icon: AlertTriangle, title: 'Sales tax tracking by state', desc: 'Track sales tax collected on invoices, broken down by state. Export totals for state-level filing.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: Users, title: 'Accountant hand-off (read-only access on Business)', desc: 'Invite your accountant as a read-only user. They can view reports, export data, and prepare your return — without accessing settings.', color: 'from-brand-blue to-brand-navy' },
]

const RELATED = [
  { to: '/features/invoicing', title: 'Smart Invoicing', desc: 'Professional invoices in 30 seconds.' },
  { to: '/features/expenses', title: 'Expense Tracking', desc: 'Log deductions with IRS Schedule C categories.' },
  { to: '/features/bank-reconciliation', title: 'Bank Reconciliation', desc: 'Match bank transactions in minutes.' },
  { to: '/features/reports', title: 'Financial Reports', desc: 'P&L, Balance Sheet, Cash Flow, and more.' },
]

export default function TaxCentreFeaturePage() {
  usePageMeta({ title: 'Tax Centre', description: 'Quarterly estimated tax deadline reminders, 1099-NEC contractor data export, mileage log with IRS rate, and one-click tax-ready export package.' })
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
                Tax-ready <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">all year</span>, not just in April.
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                Quarterly estimated tax reminders, 1099 contractor tracking, mileage log with IRS rate, and one-click accountant hand-off.
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
              <FeaturePreview label="Tax centre" screenshotSrc="/screenshots/features-tax-card.png" screenshotAlt="Cashaflux tax centre" />
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Tax season prep, automated</h2>
              <p className="text-base text-text-muted leading-relaxed">Quarterly reminders, IRS-standard mileage tracking, 1099 contractor data, and a one-click export package — everything your accountant needs.</p>
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-3">From daily data to tax-ready package</h2>
                <p className="text-base text-text-muted leading-relaxed mb-6">Everything you log throughout the year — expenses, mileage, invoices, contractor payments — flows into the Tax Centre automatically. When tax season arrives, you're already ready.</p>
                <ul className="space-y-2.5">
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Quarterly estimated tax deadline dashboard</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />1099-NEC contractor payment tracking and export</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Mileage log with automatic IRS rate calculation</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />One-click package: P&L, expenses, mileage, 1099s</li>
                </ul>
              </div>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-navy/5 via-brand-navy/[0.02] to-transparent rounded-3xl" />
                <FeaturePreview label="Tax centre overview" screenshotSrc="/screenshots/features-tax-card.png" screenshotAlt="Tax centre overview" />
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