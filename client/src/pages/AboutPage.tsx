import { Link } from 'react-router'
import { ArrowUpRight, CheckCircle2, Target, Heart, Shield, Quote, Mail, AtSign, Globe, BarChart3, Clock, Star } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import AnimatedCounter from '../components/shared/AnimatedCounter'
import { usePageMeta } from '@/lib/usePageMeta'

const VALUES = [
  { icon: Target, title: 'Simplicity First', text: 'Every feature we build should make your life easier, not harder. If it adds complexity without adding value, it doesn\'t belong in the product.' },
  { icon: Heart, title: 'Built for America', text: 'US tax categories, USD as default, IRS mileage rates, and quarterly estimated tax deadlines — we\'re built for the American small business, not a generic global audience.' },
  { icon: Shield, title: 'Trust & Transparency', text: 'Your financial data belongs to you. We encrypt it, protect it, and never sell it. Our pricing is transparent, our privacy policy is clear, and our support is human.' },
]

export default function AboutPage() {
  usePageMeta({ title: 'About', description: 'Learn about Cashaflux — our mission to simplify accounting for American small businesses, our story, and our values.' })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero — centered text, no image */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/[0.03] via-accent-gold/[0.02] to-brand-navy/[0.03] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
              We're on a mission to <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">simplify accounting</span> for American small businesses.
            </h1>
            <p className="text-base text-text-muted leading-relaxed max-w-2xl mx-auto mb-6">
              Millions of small business owners are stuck with overpriced, overcomplicated accounting software. Cashaflux was built to change that — one invoice at a time.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm">
              Start for free
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 2. Our Story — full-width text block with pull quote */}
      <section className="py-16 lg:py-24 bg-surface-warm">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-6">Built for the 99%</h2>
            <p className="text-base text-text-muted leading-relaxed mb-6">
              Cashaflux was founded on a simple observation: the tools small businesses use to manage their finances haven't kept pace with how they actually work. QuickBooks was built in the 90s. Xero was built for a different market. The spreadsheet was never meant to be accounting software.
            </p>
            <div className="border-l-2 border-accent-gold pl-6 mb-6">
              <p className="text-xl font-heading font-semibold text-brand-navy italic leading-relaxed">
                "The spreadsheet was never meant to be accounting software."
              </p>
            </div>
            <p className="text-base text-text-muted leading-relaxed">
              We set out to build something different: an accounting platform that's actually pleasant to use, priced fairly, and designed specifically for the American small business. No jargon. No learning curve. Just the tools you need to invoice, track expenses, reconcile bank accounts, and stay tax-ready — all in one place.
            </p>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 3. By the Numbers — horizontal stat row */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              <div className="text-center md:border-r border-accent-gold/20 px-4 pb-6 md:pb-0">
                <AnimatedCounter value={10000} suffix="+" className="text-4xl font-bold font-heading text-brand-navy tracking-tight" label="Active businesses" />
              </div>
              <div className="text-center md:border-r border-accent-gold/20 px-4 pb-6 md:pb-0">
                <AnimatedCounter value={500} suffix="K+" className="text-4xl font-bold font-heading text-brand-navy tracking-tight" label="Invoices processed" />
              </div>
              <div className="text-center md:border-r border-accent-gold/20 px-4 pb-6 md:pb-0">
                <AnimatedCounter value={50} suffix="%" className="text-4xl font-bold font-heading text-brand-navy tracking-tight" label="Admin time saved" />
              </div>
              <div className="text-center px-4">
                <AnimatedCounter value={48} prefix="4." suffix="" className="text-4xl font-bold font-heading text-brand-navy tracking-tight" label="User rating" />
              </div>
            </div>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 4. Our Values — vertical list with border separators */}
      <section className="py-16 lg:py-24 bg-surface-warm">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-12 text-center">Our Values</h2>
          </SmoothScrollReveal>
          <div className="space-y-0">
            {VALUES.map((v, i) => (
              <SmoothScrollReveal key={v.title}>
                <div className={`py-8 ${i > 0 ? 'border-t border-accent-gold/10' : ''}`}>
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-accent-gold-light flex items-center justify-center shrink-0 mt-0.5">
                      <v.icon className="w-5 h-5 text-accent-gold-dark" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy mb-1.5">{v.title}</h3>
                      <p className="text-base text-text-muted leading-relaxed">{v.text}</p>
                    </div>
                  </div>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. What Sets Us Apart — 3 columns of text, no cards */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4 text-center">What Sets Us Apart</h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">Three things that make Cashaflux different from the rest.</p>
          </SmoothScrollReveal>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: BarChart3, title: 'Built for US Businesses', text: 'US tax categories, USD as default, IRS mileage rates, and quarterly estimated tax deadlines. We are built for the American small business, not a generic global audience.' },
              { icon: Shield, title: 'Transparent Pricing', text: 'Our Free plan is genuinely free. Pro is $19/mo. Business is $39/mo. No hidden fees, no surprise charges, no annual contracts. Upgrade or downgrade anytime.' },
              { icon: Heart, title: 'Human Support', text: 'Email support on every plan. Priority phone support on Business. Real people, not chatbots. We answer questions, not canned responses.' },
            ].map((item) => (
              <SmoothScrollReveal key={item.title}>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="w-5 h-5 text-accent-gold-dark" />
                    <h3 className="text-lg font-bold text-brand-navy">{item.title}</h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{item.text}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Contact — simple inline list */}
      <section className="py-16 lg:py-24 bg-surface-warm">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4 text-center">Let's Talk</h2>
            <p className="text-base text-text-muted text-center mb-10 max-w-lg mx-auto">Have questions? We'd love to hear from you.</p>
          </SmoothScrollReveal>
          <div className="space-y-5">
            <SmoothScrollReveal>
              <a href="mailto:hello@cashaflux.com" className="flex items-center gap-4 text-base text-text-muted hover:text-brand-navy transition-colors">
                <Mail className="w-5 h-5 text-accent-gold-dark shrink-0" />
                <span className="font-medium">hello@cashaflux.com</span>
                <span className="text-sm">(general inquiries)</span>
              </a>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.05}>
              <a href="mailto:support@cashaflux.com" className="flex items-center gap-4 text-base text-text-muted hover:text-brand-navy transition-colors">
                <Mail className="w-5 h-5 text-accent-gold-dark shrink-0" />
                <span className="font-medium">support@cashaflux.com</span>
                <span className="text-sm">(support)</span>
              </a>
            </SmoothScrollReveal>
            <SmoothScrollReveal delay={0.1}>
              <div className="flex items-center gap-4 text-base text-text-muted">
                <AtSign className="w-5 h-5 text-accent-gold-dark shrink-0" />
                <span className="font-medium">@cashaflux</span>
                <span className="text-sm">on Twitter &amp; LinkedIn</span>
              </div>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. CTA — navy break */}
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">
              Join thousands of businesses that trust Cashaflux
            </h2>
            <p className="text-base text-white/50 leading-relaxed mb-8 max-w-lg mx-auto">
              No credit card required. Set up in minutes.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-1.5 px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-xl hover:bg-accent-gold-light hover:text-accent-gold-dark transition-all duration-200 shadow-lg active:scale-[0.98] text-sm">
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