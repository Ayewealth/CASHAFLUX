import { Link, useParams, Navigate } from 'react-router'
import TiltCard from '../components/shared/TiltCard'
import { ArrowUpRight, CheckCircle2, Star, ArrowRight, TrendingUp, DollarSign, Users, Zap, Shield, BarChart3 } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import ComparisonTable from '../components/shared/ComparisonTable'
import { COMPETITOR_COMPARISON, COMPETITOR_META, PLANS } from '@shared/plans'
import type { PlanDef } from '@shared/plans'
import { usePageMeta } from '@/lib/usePageMeta'

export default function ComparePage() {
  const { competitor } = useParams<{ competitor: string }>()

  const validCompetitors = ['quickbooks', 'xero', 'freshbooks']

  if (!competitor || !validCompetitors.includes(competitor)) {
    return <Navigate to="/features" replace />
  }

  const meta = COMPETITOR_META[competitor]
  const rows = COMPETITOR_COMPARISON[competitor]

  usePageMeta({
    title: `Cashaflux vs ${meta.name}`,
    description: `Compare Cashaflux vs ${meta.name}. See why thousands of small businesses are switching.`,
  })

  const stats = [
    { value: 'Free', label: 'Plan available' },
    { value: '$19/mo', label: 'Pro plan' },
    { value: 'Minutes', label: 'Setup time' },
    { value: 'IRS', label: 'Schedule C ready' },
  ]

  const WHY_SWITCH = [
    {
      icon: TrendingUp,
      title: 'Modern & intuitive',
      text: 'Built for how you work today — not for the 1990s. Clean interface, no learning curve, and a setup that takes minutes, not hours.',
    },
    {
      icon: DollarSign,
      title: 'Transparent pricing',
      text: 'No hidden fees, no surprise charges. Our Free plan is genuinely free. Pro is $19/mo. Business is $39/mo. You can upgrade or downgrade anytime.',
    },
    {
      icon: Star,
      title: 'Built for US businesses',
      text: 'IRS Schedule C categories, quarterly estimated tax deadlines, mileage tracking with IRS rate, and tax-ready exports — we\'re built for America.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero — Cashaflux vs {competitor} */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Cashaflux vs <span className="text-brand-navy-light">{meta.name}</span>
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                {meta.description}
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
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.value} className="p-4 rounded-2xl bg-white border border-border/50 text-center shadow-sm">
                    <p className="text-2xl font-bold text-brand-navy">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Feature comparison */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Feature comparison</h2>
              <p className="text-base text-text-muted leading-relaxed">See how Cashaflux stacks up feature by feature against {meta.name}.</p>
            </div>
          </SmoothScrollReveal>
          <SmoothScrollReveal>
            <ComparisonTable rows={rows} highlightCol={1} className="max-w-5xl mx-auto" />
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 3. Why switch */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Why switch to Cashaflux?</h2>
              <p className="text-base text-text-muted leading-relaxed">Three reasons thousands of businesses are making the move.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_SWITCH.map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * (i + 1)}>
                <TiltCard tiltDegree={3}>
                <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-accent-gold/5 hover:border-accent-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{item.text}</p>
                </div>
                </TiltCard>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Pricing comparison */}
      <section className="py-16 lg:py-20 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Simple, transparent pricing</h2>
              <p className="text-base text-white/60 leading-relaxed">Start free. Upgrade when you grow.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const price = plan.monthly === 0 ? '$0' : `$${plan.monthly}`
              const period = plan.monthly === 0 ? '' : '/mo'
              return (
                <SmoothScrollReveal key={plan.id} delay={0.1 * i}>
                  <div
                    className={`max-w-sm mx-auto p-6 rounded-2xl border-2 bg-white transition-all duration-300 hover:shadow-lg ${
                      plan.popular ? 'border-brand-navy shadow-md' : 'border-border/50'
                    }`}
                  >
                    {plan.popular && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-semibold text-white bg-brand-navy rounded-full mb-3">
                        <Star className="w-3 h-3 fill-white" />
                        Most popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-brand-navy mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-brand-navy tracking-tight">{price}</span>
                      <span className="text-sm text-text-muted">{period}</span>
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f} className="text-sm text-text-muted flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] w-full ${
                        plan.popular
                          ? 'bg-brand-navy text-white hover:bg-brand-navy-dark shadow-sm'
                          : 'border border-border text-text-muted hover:border-brand-navy hover:text-brand-navy'
                      }`}
                    >
                      {plan.cta}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </SmoothScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Ready to make the switch?</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">Switching is easy. Start with a free account and import your data. No credit card required.</p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-8 py-3.5 bg-gradient-to-r from-accent-gold to-accent-gold-dark text-white font-semibold rounded-xl hover:brightness-110 transition-all duration-200 shadow-lg shadow-accent-gold/20 active:scale-[0.98] text-sm relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                Start for free
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm text-accent-gold/70 hover:text-accent-gold transition-colors"
              >
                See how it works &rarr;
              </Link>
            </div>
          </SmoothScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}