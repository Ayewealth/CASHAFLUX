import { Link } from 'react-router'
import { ArrowUpRight, ArrowLeft, Receipt, Zap, FileText, Send, RefreshCw, CheckCircle2, Sparkles, CreditCard } from 'lucide-react'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import SmoothScrollReveal from '../../components/shared/SmoothScrollReveal'
import FeaturePreview from '../../components/shared/FeaturePreview'
import { usePageMeta } from '@/lib/usePageMeta'
import TiltCard from '../../components/shared/TiltCard'

const BENEFITS = [
  { icon: Sparkles, title: 'Auto-numbered invoices', desc: 'Every invoice gets a unique, sequential number (INV-0042) automatically — no manual tracking needed.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: Zap, title: 'Dynamic line items with tax rates', desc: 'Add unlimited line items with individual tax rates, discounts, and descriptions. Subtotal and total calculated instantly.', color: 'from-blue-500 to-blue-600' },
  { icon: FileText, title: 'Custom branding & logo', desc: 'Upload your business logo and set your brand colors. Every invoice reflects your brand from day one.', color: 'from-amber-500 to-amber-600' },
  { icon: Receipt, title: 'Professional PDF generation', desc: 'Invoices render as polished PDFs using @react-pdf/renderer. Print-ready, email-ready, accountant-approved.', color: 'from-rose-500 to-rose-600' },
  { icon: Send, title: 'Send by email with PDF attached', desc: 'Send invoices directly to clients with the PDF automatically attached. Delivery status tracked.', color: 'from-blue-500 to-blue-600' },
  { icon: CheckCircle2, title: 'Mark paid / overdue / sent statuses', desc: 'Track every invoice through its lifecycle: draft, sent, overdue, or paid. Know exactly where each one stands.', color: 'from-brand-navy to-brand-navy-light' },
  { icon: RefreshCw, title: 'Recurring invoice schedules', desc: 'Set up daily, weekly, monthly, or custom recurring schedules. Cashaflux generates and sends them automatically.', color: 'from-amber-500 to-amber-600' },
  { icon: CreditCard, title: 'Sales tax tracking', desc: 'Configure per-line-item or per-invoice tax rates. Track tax collected by rate for quarterly reporting.', color: 'from-brand-blue to-brand-navy' },
]

const RELATED = [
  { to: '/features/expenses', title: 'Expense Tracking', desc: 'Log deductions with IRS Schedule C categories.' },
  { to: '/features/bank-reconciliation', title: 'Bank Reconciliation', desc: 'Match bank transactions in minutes.' },
  { to: '/features/reports', title: 'Financial Reports', desc: 'P&L, Balance Sheet, Cash Flow, and more.' },
  { to: '/features/tax-centre', title: 'Tax Centre', desc: 'Quarterly reminders, 1099 exports, mileage log.' },
]

export default function InvoicingFeaturePage() {
  usePageMeta({ title: 'Smart Invoicing for Small Businesses', description: 'Create professional, on-brand invoices in seconds with auto-numbering, dynamic line items, tax rates, PDF generation, and email delivery.' })
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
                Invoicing that takes <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">30 seconds</span>, not 30 minutes.
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                Create professional, on-brand invoices in seconds. Auto-numbering, dynamic line items, tax rates, PDFs, and email delivery — all built in.
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
              <FeaturePreview label="Invoice editor" screenshotSrc="/screenshots/features-invoicing.png" screenshotAlt="Cashaflux invoice editor" />
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Everything you need to invoice like a pro</h2>
              <p className="text-base text-text-muted leading-relaxed">From auto-numbering to email delivery, Cashaflux handles the grunt work so you can focus on your clients.</p>
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
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-3">From draft to payment, in one place</h2>
                <p className="text-base text-text-muted leading-relaxed mb-6">Stop juggling templates, spreadsheets, and PDF tools. Cashaflux's invoicing workflow keeps everything — creation, branding, delivery, and status tracking — inside a single, fast interface.</p>
                <ul className="space-y-2.5">
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Client selector with inline creation — add clients on the fly</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Item library with saved products and services</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Discount support per line item or invoice total</li>
                  <li className="text-sm text-text-muted flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />Email delivery via Resend with auto-attached PDF</li>
                </ul>
              </div>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-navy/5 via-brand-navy/[0.02] to-transparent rounded-3xl" />
                <FeaturePreview label="Invoice workflow" screenshotSrc="/screenshots/features-invoicing.png" screenshotAlt="Invoicing workflow" />
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