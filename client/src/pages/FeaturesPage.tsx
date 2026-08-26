import { Link } from 'react-router'
import { CheckCircle2, ArrowUpRight, Receipt, Banknote, BarChart3, PieChart, FileText, Users, Wallet, Calculator, Sparkles, Quote } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import FeaturePreview from '../components/shared/FeaturePreview'
import TiltCard from '../components/shared/TiltCard'
import StickyStack from '../components/shared/StickyStack'
import { usePageMeta } from '@/lib/usePageMeta'

const PERSONAS = [
  { icon: Users, title: 'Freelancers & Sole Traders', color: 'from-brand-navy to-brand-navy-light', features: 'Simple invoicing, expense tracking, mileage log, tax-ready exports' },
  { icon: Wallet, title: 'Small Business Teams', color: 'from-blue-500 to-blue-600', features: 'Unlimited clients, bank reconciliation, recurring invoices, advanced reports' },
  { icon: Calculator, title: 'Accountants & Bookkeepers', color: 'from-brand-navy to-brand-navy-light', features: 'Read-only access, tax-ready packages, 1099 tracking, multi-client management' },
]

const FEATURE_SUBPAGES = [
  { icon: Receipt, title: 'Smart Invoicing', color: 'from-brand-navy to-brand-navy-light', desc: 'Create professional invoices in seconds. Auto-numbering, dynamic line items, tax rates, PDF generation, and email delivery.', href: '/features/invoicing', screenshotSrc: '/screenshots/features-invoicing-card.png', benefits: ['Auto-numbered invoices', 'Dynamic line items', 'PDF generation', 'Email delivery'] },
  { icon: Banknote, title: 'Expense Tracking', color: 'from-blue-500 to-blue-600', desc: 'Log expenses with IRS Schedule C categories. Receipt upload, split expenses, and bulk CSV export.', href: '/features/expenses', screenshotSrc: '/screenshots/features-expenses-card.png', benefits: ['IRS Schedule C categories', 'Receipt upload', 'Split expenses', 'CSV export'] },
  { icon: BarChart3, title: 'Bank Reconciliation', color: 'from-amber-500 to-amber-600', desc: 'Import bank CSV files, auto-match transactions, and reconcile with one click. Supports major US banks.', href: '/features/bank-reconciliation', screenshotSrc: '/screenshots/features-bank-card.png', benefits: ['CSV import', 'Auto-match', 'One-click reconcile', 'Duplicate detection'] },
  { icon: PieChart, title: 'Financial Reports', color: 'from-rose-500 to-rose-600', desc: 'Profit & Loss, Balance Sheet, Cash Flow, A/R Aging — all exportable as PDF or CSV.', href: '/features/reports', screenshotSrc: '/screenshots/features-reports-card.png', benefits: ['P&L Statement', 'Balance Sheet', 'Cash Flow', 'A/R Aging'] },
  { icon: FileText, title: 'Tax Centre', color: 'from-brand-navy to-brand-navy-light', desc: 'Quarterly deadlines, 1099 tracking, mileage log with IRS rate, and one-click tax-ready export.', href: '/features/tax-centre', screenshotSrc: '/screenshots/features-tax-card.png', benefits: ['Quarterly reminders', '1099 export', 'Mileage log', 'Tax-ready export'] },
  { icon: Users, title: 'Team Collaboration', color: 'from-brand-blue to-brand-navy', desc: 'Invite team members with role-based access. Owner, Admin, Accountant, and Member roles.', href: '/features', benefits: ['Role-based access', 'Audit log', 'Invite by email', 'Read-only accountant'] },
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
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/[0.03] via-accent-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <h1 className="text-4xl sm:text-5xl font-bold font-heading tracking-tight mb-4">
                <span className="text-brand-navy">Everything you need. </span>
                <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">Nothing you don't.</span>
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                From invoicing to tax-ready exports, Cashaflux gives you the tools to stay on top of your finances — all in one beautifully designed platform.
              </p>
              <Link to="/signup" className="group relative inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/10 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Start for free</span>
                <ArrowUpRight className="relative w-4 h-4" />
              </Link>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.2}>
              <TiltCard tiltDegree={4}>
                <FeaturePreview label="Feature Overview" screenshotSrc="/screenshots/hero-dashboard.png" screenshotAlt="Cashaflux feature overview" />
              </TiltCard>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Feature deep-dive — Sticky Stack */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-24 pb-8 text-center">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight mb-4">
              Explore every feature in depth
            </h2>
            <p className="text-base text-text-muted leading-relaxed max-w-lg mx-auto">
              Click any feature to see how it works, with screenshots and detailed benefits.
            </p>
          </SmoothScrollReveal>
        </div>

        <StickyStack
          cards={FEATURE_SUBPAGES.map((feature) => ({
            id: feature.title,
            content: (
              <div className="relative rounded-3xl overflow-hidden min-h-[70dvh] w-full max-w-5xl mx-auto flex items-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-navy/60 to-accent-gold/30" />
                <div className="relative z-10 p-10 lg:p-16 max-w-2xl">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">{feature.title}</h2>
                  <p className="text-base text-white/80 leading-relaxed mb-6">{feature.desc}</p>
                  {feature.benefits && (
                    <ul className="space-y-2 mb-6">
                      {feature.benefits.map((b) => (
                        <li key={b} className="text-sm text-white/70 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link to={feature.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold hover:text-accent-gold-light transition-colors">
                    Explore feature <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ),
          }))}
          className="pb-16"
        />
      </section>

      {/* 3. Role-based breakdown */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight text-center mb-4">
              Built for how you work
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              Whether you're a solo freelancer or running a growing team, Cashaflux adapts to your needs.
            </p>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((p, i) => (
              <SmoothScrollReveal key={p.title} delay={0.1 * i}>
                <TiltCard tiltDegree={3}>
                  <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:shadow-accent-gold/5 hover:border-accent-gold/20 hover:-translate-y-0.5 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-sm`}>
                      <p.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-navy mb-3">{p.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{p.features}</p>
                  </div>
                </TiltCard>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visual break — testimonial */}
      <section className="py-16 lg:py-20 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-dark to-accent-gold-dark/20 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <Quote className="w-8 h-8 text-accent-gold/30 mx-auto mb-4" />
            <p className="text-xl lg:text-2xl font-medium text-white/90 leading-relaxed mb-6 max-w-2xl mx-auto">
              "I went from spreadsheets to Cashaflux in one afternoon. Best decision I've made for my business."
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/50">
              <span className="font-semibold text-white/80">Sarah Chen</span>
              <span className="w-px h-4 bg-white/20" />
              <span>Freelance Designer, Chen Creative</span>
            </div>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 5. Roadmap */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight text-center mb-4">
              What's coming next
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              We're building the future of small business accounting — here's what's on our roadmap.
            </p>
          </SmoothScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMING_SOON.map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.08 * i}>
                <div className="p-5 rounded-2xl border border-dashed border-border/70 bg-white/50 hover:border-accent-gold/30 hover:bg-white transition-all duration-300">
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium text-accent-gold-dark bg-accent-gold-light rounded-full mb-3">
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
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Ready to get started?</h2>
            <p className="text-base text-white/50 leading-relaxed mb-8 max-w-lg mx-auto">Try Cashaflux free. No credit card required.</p>
            <Link to="/signup" className="group relative inline-flex items-center gap-1.5 px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-xl hover:bg-accent-gold-light hover:text-accent-gold-dark transition-all duration-200 shadow-lg active:scale-[0.98] text-sm overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/20 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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