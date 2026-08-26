import { Link } from 'react-router'
import TiltCard from '../components/shared/TiltCard'
import { ArrowUpRight, CheckCircle2, Zap, ExternalLink, Clock, BarChart3, Sparkles, RefreshCw, Download, CreditCard, Mail, FileText, Users, Building2, ArrowRight } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import Marquee from '../components/shared/Marquee'
import { usePageMeta } from '@/lib/usePageMeta'

const HERO_INTEGRATIONS = [
  { name: 'Stripe', desc: 'Payment processing' },
  { name: 'Resend', desc: 'Email delivery' },
  { name: 'Cloudflare R2', desc: 'File storage' },
  { name: 'Gusto', desc: 'Payroll export' },
  { name: 'ADP', desc: 'Payroll export' },
  { name: 'Square', desc: 'Payment processing' },
]

const LOGO_ITEMS = [
  { label: 'Stripe', imgSrc: 'https://cdn.simpleicons.org/stripe/1E3A5F' },
  { label: 'Gusto', imgSrc: 'https://cdn.simpleicons.org/gusto/1E3A5F' },
  { label: 'Shopify', imgSrc: 'https://cdn.simpleicons.org/shopify/1E3A5F' },
  { label: 'Square', imgSrc: 'https://cdn.simpleicons.org/square/1E3A5F' },
  { label: 'DocuSign', imgSrc: 'https://cdn.simpleicons.org/docusign/1E3A5F' },
  { label: 'Mailchimp', imgSrc: 'https://cdn.simpleicons.org/mailchimp/1E3A5F' },
]

const ACTIVE_INTEGRATIONS = [
  {
    icon: CreditCard,
    title: 'Stripe — Payment Processing',
    desc: 'Process subscription payments, manage billing, and handle checkouts through Stripe. All payment data is PCI-DSS compliant. Cashaflux uses Stripe for all subscription billing.',
    badge: 'Active',
  },
  {
    icon: Mail,
    title: 'Resend — Email Delivery',
    desc: 'Transactional emails including invoices, payment receipts, team invites, and password resets are sent through Resend. Reliable delivery with open and click tracking.',
    badge: 'Active',
  },
  {
    icon: RefreshCw,
    title: 'Cloudflare R2 — File Storage',
    desc: 'Receipt images, logos, and file attachments are stored securely on Cloudflare R2 with pre-signed URLs for access. No public bucket access, no data leaks.',
    badge: 'Active',
  },
]

const EXPORT_INTEGRATIONS = [
  {
    icon: Download,
    title: 'Gusto / ADP / Paychex — Payroll Export',
    desc: 'Record employee and contractor payments, then export payroll-ready CSV files compatible with Gusto, ADP, and Paychex. Cashaflux does not process payroll directly, but we make it easy to hand off.',
    badge: 'Export',
  },
  {
    icon: FileText,
    title: 'CSV Bank Imports',
    desc: 'Import bank transaction CSVs from any US bank — Chase, Bank of America, Wells Fargo, and more. Our column mapping UI automatically detects and matches your bank\'s format.',
    badge: 'Export',
  },
]

const COMING_SOON = [
  { title: 'Bank Feeds (Plaid)', desc: 'Automatic bank transaction syncing directly to your accounts' },
  { title: 'Stripe Payment Links', desc: 'Accept credit card payments directly from your invoices' },
  { title: 'Mobile Apps', desc: 'iOS and Android apps for on-the-go expense logging' },
  { title: 'Multi-Currency', desc: 'Support for international clients and multi-currency invoicing' },
]

export default function IntegrationsPage() {
  usePageMeta({ title: 'Integrations', description: 'Cashaflux integrates with Stripe, Resend, Cloudflare R2, and more. See what\'s connected and what\'s coming next.' })
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/[0.02] via-accent-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <SmoothScrollReveal>
              <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Your tools. <span className="text-brand-navy-light">All connected.</span>
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-lg mb-6">
                Cashaflux integrates with the services you already use — payment processing, email, file storage, and payroll. No manual data entry, no duplicate work.
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
              <div className="grid grid-cols-3 gap-3">
                {HERO_INTEGRATIONS.map((item) => (
                  <TiltCard key={item.name} tiltDegree={3}>
                  <div
                    className="p-4 rounded-2xl bg-white border border-border/50 text-center hover:border-accent-gold/30 hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mx-auto mb-3 border border-accent-gold/20">
                      <span className="text-xl font-bold text-accent-gold-dark font-mono">{item.name[0]}</span>
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy mb-1">{item.name}</h3>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                  </TiltCard>
                ))}
              </div>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Built-in integrations */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Built-in integrations</h2>
              <p className="text-base text-text-muted leading-relaxed">
                These services are deeply integrated into Cashaflux — no configuration needed.
              </p>
            </div>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ACTIVE_INTEGRATIONS.map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * i}>
                <TiltCard tiltDegree={3}>
                <div className="p-6 rounded-2xl bg-white border border-border/50 hover:border-accent-gold/30 hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mb-4 border border-accent-gold/20">
                    <item.icon className="w-6 h-6 text-accent-gold-dark" />
                  </div>
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium text-brand-navy bg-brand-blue-light rounded-full mb-3">
                    {item.badge}
                  </span>
                  <h3 className="text-sm font-bold text-brand-navy mb-1">{item.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </div>
                </TiltCard>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Export-ready integrations */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Export-ready integrations</h2>
              <p className="text-base text-text-muted leading-relaxed">
                Cashaflux exports data in formats these services can consume — no API key required.
              </p>
            </div>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {EXPORT_INTEGRATIONS.map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * i}>
                <TiltCard tiltDegree={3}>
                <div className="p-6 rounded-2xl bg-white border border-border/50 hover:border-accent-gold/30 hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mb-4 border border-accent-gold/20">
                    <item.icon className="w-6 h-6 text-accent-gold-dark" />
                  </div>
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium text-brand-blue bg-blue-50 rounded-full mb-3">
                    {item.badge}
                  </span>
                  <h3 className="text-sm font-bold text-brand-navy mb-1">{item.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </div>
                </TiltCard>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Coming soon (navy break) */}
      <section className="py-16 lg:py-20 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">We're building more connections</h2>
            <p className="text-base text-white/60 leading-relaxed mb-12 max-w-lg mx-auto">
              Our roadmap includes deeper integrations to make your workflow even smoother.
            </p>
          </SmoothScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {COMING_SOON.map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.08 * i}>
                <div className="p-5 rounded-2xl border border-dashed border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20 transition-all duration-300">
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium text-white/80 bg-white/10 rounded-full mb-3">
                    In development
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Logo marquee */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs text-text-muted uppercase tracking-widest text-center mb-8 font-medium font-mono">Works with the tools you already use</p>
          <Marquee items={LOGO_ITEMS} speed={25} />
        </div>
      </section>

      {/* 6. CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Ready to connect your stack?</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">Start with a free account. No credit card required.</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-8 py-3.5 bg-gradient-to-r from-accent-gold to-accent-gold-dark text-white font-semibold rounded-xl hover:brightness-110 transition-all duration-200 shadow-lg shadow-accent-gold/20 active:scale-[0.98] text-sm relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
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