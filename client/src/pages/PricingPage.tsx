import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, ArrowUpRight, ChevronDown, Users, Sparkles } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import ComparisonTable from '../components/shared/ComparisonTable'
import { usePageMeta } from '@/lib/usePageMeta'

const PLANS = [
  {
    id: 'free', name: 'Free', monthly: 0, annual: null,
    features: ['Up to 5 clients', 'Core invoicing', 'Expense tracking', 'Basic reports', 'Mileage tracking', 'Bank account management'],
    popular: false,
    cta: 'Start Free',
  },
  {
    id: 'pro', name: 'Pro', monthly: 19, annual: 180,
    features: ['Unlimited clients', 'Bank sync & reconciliation', 'Recurring invoices', 'Advanced reports', 'Tax-ready exports', 'Priority email support', 'Custom invoice templates', 'CSV import/export'],
    popular: true,
    cta: 'Choose Pro',
  },
  {
    id: 'business', name: 'Business', monthly: 39, annual: 360,
    features: ['Everything in Pro', 'Team members (up to 5)', 'Payroll-ready exports', 'Dedicated account manager', 'Priority phone support', 'Activity audit log', 'Custom reporting'],
    popular: false,
    cta: 'Choose Business',
  },
]

const ALL_FEATURES = [
  { name: 'Clients', free: 'Up to 5', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Invoicing', free: true, pro: true, business: true },
  { name: 'Recurring invoices', free: false, pro: true, business: true },
  { name: 'Expense tracking', free: true, pro: true, business: true },
  { name: 'Receipt upload (R2)', free: true, pro: true, business: true },
  { name: 'Bank accounts', free: true, pro: true, business: true },
  { name: 'Bank reconciliation', free: false, pro: true, business: true },
  { name: 'CSV import', free: true, pro: true, business: true },
  { name: 'Mileage tracking', free: true, pro: true, business: true },
  { name: 'Financial reports', free: 'Basic', pro: 'Advanced', business: 'Advanced' },
  { name: 'Tax centre', free: true, pro: true, business: true },
  { name: 'Tax-ready export', free: false, pro: true, business: true },
  { name: 'Payroll export', free: false, pro: false, business: true },
  { name: 'Team members', free: false, pro: false, business: 'Up to 5' },
  { name: 'Activity audit log', free: false, pro: false, business: true },
  { name: 'Priority support', free: false, pro: 'Email', business: 'Phone & Email' },
]

const FAQS = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the end of your billing period.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and debit cards through Stripe. Annual plans are billed upfront.' },
  { q: 'Is there a discount for annual billing?', a: 'Yes! Annual billing saves you roughly 20% compared to monthly billing. Pro annual is $180/yr ($15/mo). Business annual is $360/yr ($30/mo).' },
  { q: 'Can I cancel my subscription?', a: 'Absolutely. You can cancel anytime from the Stripe Customer Portal. Your data stays accessible on the Free plan.' },
  { q: 'Do you offer refunds?', a: "We don't offer refunds for partial months, but you can cancel at any time. Paid features remain accessible until the end of your billing period." },
  { q: 'Is there an enterprise plan?', a: 'Need more than 5 team members or custom features? Contact us and we will tailor a plan for your business.' },
]

const USE_CASES = [
  { icon: Users, title: 'Solo freelancer', plan: 'Free', reason: 'Perfect if you have up to 5 clients and need core invoicing and expense tracking.' },
  { icon: Sparkles, title: 'Growing business', plan: 'Pro', reason: 'Unlimited clients, bank reconciliation, recurring invoices, and tax-ready exports for scaling teams.' },
  { icon: Users, title: 'Team & agency', plan: 'Business', reason: 'Everything in Pro plus team members, payroll exports, and priority phone support.' },
]

export default function PricingPage() {
  usePageMeta({ title: 'Pricing', description: 'Simple, transparent pricing for small businesses. Free, Pro, and Business plans. Start for free, no credit card required.' })
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 text-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy tracking-tight mb-4">
              Simple pricing. <span className="text-brand-navy">Powerful features.</span>
            </h1>
            <p className="text-base text-text-muted leading-relaxed max-w-lg mx-auto mb-8">
              Start free. Upgrade when you grow. No hidden fees, no surprises.
            </p>
            <div className="flex justify-center">
              <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-border/50">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === 'monthly' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-muted hover:text-text'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('annual')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === 'annual' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-muted hover:text-text'}`}
                >
                  Annual{' '}
                  <span className="text-[10px] text-brand-navy-light">Save 20%</span>
                </button>
              </div>
            </div>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 2. Pricing Cards */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const price = plan.monthly === 0
                ? '$0'
                : (billingInterval === 'annual' && plan.annual ? `$${plan.annual}` : `$${plan.monthly}`)
              const period = plan.monthly === 0 ? '' : (billingInterval === 'annual' ? '/yr' : '/mo')
              return (
                <SmoothScrollReveal key={plan.id} delay={0.1 * i}>
                  <div
                    className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:shadow-brand-navy/5 ${
                      plan.popular ? 'border-brand-navy bg-white shadow-md' : 'border-border/50 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-6 inline-flex px-3 py-0.5 text-xs font-semibold text-white bg-brand-navy rounded-full">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-brand-navy mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-brand-navy tracking-tight">{price}</span>
                      <span className="text-sm text-text-muted">{period}</span>
                    </div>
                    {plan.monthly > 0 && billingInterval === 'annual' && (
                      <p className="text-xs text-text-muted mb-3">${plan.monthly}/mo billed monthly</p>
                    )}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="text-sm text-text-muted flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
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

      {/* 3. Plan Comparison Table */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-12">
              Full feature comparison
            </h2>
          </SmoothScrollReveal>
          <SmoothScrollReveal>
            <ComparisonTable
              rows={ALL_FEATURES.map((f) => ({
                feature: f.name,
                values: [
                  { label: 'Free', included: f.free },
                  { label: 'Pro', included: f.pro },
                  { label: 'Business', included: f.business },
                ],
              }))}
              highlightCol={1}
            />
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 4. By Use Case */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-4">
              Which plan is right for you?
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              Not sure which plan fits? Here's a quick guide.
            </p>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map((uc, i) => (
              <SmoothScrollReveal key={uc.title} delay={0.1 * i}>
                <div className="p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md hover:border-brand-navy/20 transition-all duration-300">
                  <uc.icon className="w-8 h-8 text-brand-navy mb-3" />
                  <h3 className="text-lg font-bold text-brand-navy mb-1">{uc.title}</h3>
                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold text-brand-navy bg-brand-blue-light rounded-full mb-3">
                    {uc.plan}
                  </span>
                  <p className="text-sm text-text-muted leading-relaxed">{uc.reason}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-12">
              Billing FAQ
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
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
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

      {/* 6. CTA */}
      <section className="py-16 lg:py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
              Still not sure?
            </h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
              Try Cashaflux free. No credit card required. Upgrade only when you're ready.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-brand-navy font-semibold rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 shadow-lg active:scale-[0.98] text-sm"
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