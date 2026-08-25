import { Link } from 'react-router'
import { ArrowUpRight, CheckCircle2, ChevronDown, Sparkles, Quote } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import Screenshot from '../components/shared/Screenshot'
import { usePageMeta } from '@/lib/usePageMeta'

const STEPS = [
  {
    step: 1,
    title: 'Connect your business',
    desc: 'Set up your business profile, add your first clients, and connect your bank accounts. It takes less than 5 minutes — no technical skills needed.',
    benefits: [
      'Business profile setup — name, type, industry',
      'Add clients with billing details',
      'Manual bank account creation',
      'Choose your plan (Free or paid)',
    ],
    color: 'from-brand-navy to-brand-navy-light',
    image: 'onboarding',
  },
  {
    step: 2,
    title: 'Run your finances daily',
    desc: 'Create invoices, log expenses, reconcile bank transactions, and track mileage — all from one unified dashboard. Everything updates in real time.',
    benefits: [
      'Create invoices with auto-numbering',
      'Log expenses with IRS Schedule C categories',
      'Import bank CSV files and reconcile',
      'Track mileage with IRS rate applied',
    ],
    color: 'from-blue-500 to-blue-600',
    image: 'dashboard',
  },
  {
    step: 3,
    title: 'Stay tax-ready year-round',
    desc: 'Generate financial reports, export tax-ready packages, track 1099 contractors, and get quarterly deadline reminders — so tax season is a breeze.',
    benefits: [
      'Profit & Loss and Balance Sheet reports',
      'Tax-ready export for your accountant',
      '1099-NEC contractor data export',
      'Quarterly estimated tax deadline reminders',
    ],
    color: 'from-brand-navy to-brand-navy-light',
    image: 'tax',
  },
]

const INTEGRATIONS = [
  { name: 'Stripe', desc: 'Payment processing' },
  { name: 'Resend', desc: 'Email delivery' },
  { name: 'Cloudflare R2', desc: 'File storage' },
  { name: 'CSV Bank Imports', desc: 'Chase, BoA & more' },
  { name: 'Gusto / ADP', desc: 'Payroll export' },
]

const FAQS = [
  { q: 'How long does it take to set up?', a: 'Most users are up and running in under 5 minutes. Create your account, set your business profile, and you\'re ready to go.' },
  { q: 'Can I import data from QuickBooks or Xero?', a: 'Direct import is on our roadmap. For now, you can export your data as CSV from your current tool and import it into Cashaflux.' },
  { q: 'Do I need to be an accountant to use Cashaflux?', a: 'Not at all! Cashaflux is designed for business owners, not accountants. If you can use a spreadsheet, you can use Cashaflux.' },
  { q: 'What if I get stuck?', a: 'We offer email support on all plans, and priority phone support on the Business plan. Our help center and documentation are also available.' },
  { q: 'Can I switch from Free to Pro later?', a: 'Absolutely. You can upgrade at any time and get immediate access to all Pro features. Your data carries over seamlessly.' },
]

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Freelance Designer', company: 'Chen Creative', quote: 'I went from spreadsheets to Cashaflux in one afternoon. Best decision I\'ve made for my business.' },
  { name: 'Marcus Johnson', role: 'Owner', company: 'Johnson & Co. Landscaping', quote: 'The onboarding was incredibly smooth. My accountant loves the tax-ready export feature.' },
  { name: 'Emily Rodriguez', role: 'CPA', company: 'Rodriguez Tax Services', quote: 'I recommend Cashaflux to all my clients. The setup is intuitive, and the reports are exactly what I need.' },
  { name: 'David Kim', role: 'Consultant', company: 'Kim Consulting', quote: 'Three months in and I\'ve already saved dozens of hours. The recurring invoices feature alone is worth it.' },
]

export default function HowItWorksPage() {
  usePageMeta({ title: 'How It Works', description: 'Get started with Cashaflux in minutes. Set up your business, manage finances, and stay tax-ready.' })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/[0.02] via-transparent to-brand-navy/[0.02] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Get your business <span className="text-brand-navy">financial-ready</span> in 3 steps
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                No complicated setup. No training required. Just simple tools that work the way you do.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm"
              >
                Start for free
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-6 mt-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-navy" />
                  5-minute setup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-navy" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-navy" />
                  Free plan included
                </span>
              </div>
            </SmoothScrollReveal>

            <SmoothScrollReveal delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-border/50 text-center shadow-sm">
                  <p className="text-2xl font-bold text-brand-navy">5 min</p>
                  <p className="text-xs text-text-muted mt-1">setup time</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-border/50 text-center shadow-sm">
                  <p className="text-2xl font-bold text-brand-navy">10K+</p>
                  <p className="text-xs text-text-muted mt-1">active users</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-border/50 text-center shadow-sm">
                  <p className="text-2xl font-bold text-brand-navy">4.8★</p>
                  <p className="text-xs text-text-muted mt-1">rating</p>
                </div>
              </div>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2-4. Steps */}
      {STEPS.map((step, i) => (
        <section key={step.step} className={`py-20 lg:py-28 ${i % 2 === 1 ? 'bg-white' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {i === 1 ? (
              <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center">
                <div className="absolute inset-0">
                  <img
                    src={step.image === 'onboarding' ? '/screenshots/onboarding-setup.png' : step.image === 'dashboard' ? '/screenshots/dashboard-overview.png' : '/screenshots/tax-centre.png'}
                    alt={`${step.title} screenshot`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/85 to-brand-navy/40" />
                <div className="relative z-10 p-12 lg:p-16 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 text-white font-bold text-sm flex items-center justify-center border border-white/20">
                      {step.step}
                    </div>
                    <span className="text-xs font-mono font-medium text-white/70 uppercase tracking-wider">
                      Step {step.step}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">{step.title}</h2>
                  <p className="text-base text-white/80 leading-relaxed mb-6">{step.desc}</p>
                  <ul className="space-y-3">
                    {step.benefits.map((b) => (
                      <li key={b} className="text-sm text-white/80 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <SmoothScrollReveal delay={0.1}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-sm flex items-center justify-center`}>
                      {step.step}
                    </div>
                    <span className="text-xs font-mono font-medium text-text-muted uppercase tracking-wider">
                      Step {step.step}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">{step.title}</h2>
                  <p className="text-base text-text-muted leading-relaxed mb-6">{step.desc}</p>
                  <ul className="space-y-3">
                    {step.benefits.map((b) => (
                      <li key={b} className="text-sm text-text-muted flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </SmoothScrollReveal>

                <SmoothScrollReveal delay={0.2}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-brand-navy/5 via-brand-navy/[0.02] to-transparent rounded-3xl" />
                    <div className="relative bg-white rounded-2xl border border-border/50 shadow-xl overflow-hidden p-6">
                      <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border/50">
                        <Screenshot
                          fallback={`${step.title} interface`}
                          src={step.image === 'onboarding' ? '/screenshots/onboarding-setup.png' : step.image === 'dashboard' ? '/screenshots/dashboard-overview.png' : step.image === 'tax' ? '/screenshots/tax-centre.png' : undefined}
                          alt={`${step.title} screenshot`}
                        />
                      </div>
                    </div>
                  </div>
                </SmoothScrollReveal>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* 5. Testimonials */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white via-brand-navy/[0.02] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight text-center mb-4">
              What our users say
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              Thousands of business owners trust Cashaflux to manage their finances.
            </p>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <SmoothScrollReveal key={t.name} delay={0.08 * i}>
                <div className="p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md transition-all duration-300">
                  <Quote className="w-6 h-6 text-brand-navy/20 mb-2" />
                  <p className="text-sm text-text leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-navy-light text-brand-navy font-bold text-xs flex items-center justify-center">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Integrations */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight text-center mb-4">
              Connects with everything you use
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              Cashaflux integrates with the tools you already rely on.
            </p>
          </SmoothScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {INTEGRATIONS.map((item, i) => (
              <SmoothScrollReveal key={item.name} delay={0.08 * i}>
                <div className="p-4 rounded-2xl bg-white border border-border/50 text-center hover:border-brand-navy/20 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 border border-border/50">
                    <span className="text-lg font-bold text-brand-navy font-mono">{item.name[0]}</span>
                  </div>
                  <h3 className="text-xs font-bold text-brand-navy mb-1">{item.name}</h3>
                  <p className="text-[10px] text-text-muted">{item.desc}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-navy tracking-tight text-center mb-4">
              Common questions about getting started
            </h2>
          </SmoothScrollReveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <SmoothScrollReveal key={i} delay={0.05 * i}>
                <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-brand-navy hover:bg-white transition-colors"
                  >
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-l-2 border-brand-navy ml-5 pl-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">
              Start your 3-step journey today
            </h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
              No credit card required. Set up in minutes. Join thousands of business owners who trust Cashaflux.
            </p>
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