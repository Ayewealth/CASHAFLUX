import { Link } from 'react-router'
import { CheckCircle2, ArrowUpRight, Shield, Lock, Key, Eye, Server, UserCheck, FileText, AlertTriangle, RefreshCw, Download, Trash2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import TiltCard from '../components/shared/TiltCard'
import { usePageMeta } from '@/lib/usePageMeta'

const FAQS = [
  { q: 'How is my EIN/SSN stored?', a: 'Your EIN and any SSN information is encrypted with AES-256-GCM before being stored in our database. Only authorized team members (Owner/Admin roles) can access this data. It is never shared with third parties.' },
  { q: 'Do you sell my data?', a: 'Never. We do not sell your personal information or financial data to anyone. Your data is used solely to provide the Cashaflux service. See our Privacy Policy for details.' },
  { q: 'What happens when I delete my account?', a: 'When you delete your account, your personal data is anonymized within 30 days. Your email is replaced with a deleted-user identifier, and your hashed password is cleared. Financial records may be retained longer for legal compliance.' },
  { q: 'Who has access to my data?', a: 'Only you and the team members you explicitly invite. You control roles and permissions. Accountants on your Business plan have read-only access. We do not access your data except for support requests you initiate.' },
  { q: 'Is my connection secure?', a: 'Yes. We enforce HTTPS/TLS 1.3 across the entire site. Our Content Security Policy (CSP) restricts which scripts and resources can load, preventing injection attacks.' },
]

export default function SecurityPage() {
  usePageMeta({ title: 'Security', description: 'Enterprise-grade security built for every business. Bank-level encryption, access controls, and compliance for your financial data.' })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/[0.03] via-accent-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-light mb-6 mx-auto shadow-lg shadow-brand-navy/10">
              <Shield className="w-8 h-8 text-accent-gold" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-brand-navy tracking-tight mb-4">
              Enterprise-grade security. <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">Built for every business.</span>
            </h1>
            <p className="text-base text-text-muted leading-relaxed max-w-2xl mx-auto mb-6">
              Your financial data is protected with bank-level encryption, strict access controls, and industry-standard compliance. We never sell your data.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm"
            >
              Start for free
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 2. Encryption & Data Protection */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Encryption &amp; Data Protection</h2>
              <p className="text-base text-text-muted leading-relaxed">Your data is encrypted at every layer — at rest, in transit, and in how we manage the keys that protect it.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Encryption at Rest', text: 'Sensitive data including EIN and SSN is encrypted using AES-256-GCM authenticated encryption before it is stored. Your data is never stored in plaintext.' },
              { icon: Server, title: 'Encryption in Transit', text: 'All traffic between your browser and our servers is encrypted with TLS 1.3. We enforce HTTPS across every page and API endpoint.' },
              { icon: Key, title: 'Encryption Key Management', text: 'Encryption keys are derived from hardware-backed secrets and never exposed to the client. We use industry-standard key derivation (SHA-256) for all cryptographic operations.' },
            ].map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * i}>
                <TiltCard tiltDegree={3}>
                  <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:shadow-accent-gold/5 hover:border-accent-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mb-4 border border-accent-gold/20">
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

      {/* 3. Access Control */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Access Control</h2>
              <p className="text-base text-text-muted leading-relaxed">Granular permissions and full visibility into who does what — so you always stay in control.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: UserCheck, title: 'Role-Based Access Control', text: 'Granular permissions for every team member. Owner, Admin, Accountant (read-only), and Member roles — each with clearly defined access boundaries. Invite your accountant with read-only access to financial data.' },
              { icon: Eye, title: 'Activity Audit Log', text: 'Every action — invoice creation, expense logging, team invite — is logged with timestamp, user, and action details. Full audit trail for compliance and team accountability.' },
            ].map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * i}>
                <TiltCard tiltDegree={3}>
                  <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:shadow-accent-gold/5 hover:border-accent-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mb-4 border border-accent-gold/20">
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

      {/* 4. Compliance & Certifications */}
      <section className="py-16 lg:py-20 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-dark to-accent-gold-dark/20 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Compliance &amp; Certifications</h2>
              <p className="text-base text-white/60 leading-relaxed">We follow industry standards so you can focus on your business, not compliance paperwork.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'SOC 2 Compliant', text: 'We follow SOC 2 security and availability principles. Our infrastructure and processes are designed to meet the highest standards of data protection.' },
              { icon: FileText, title: 'GDPR Ready', text: 'Data export and deletion tools are built into your account settings. You maintain full control over your personal information.' },
              { icon: CheckCircle2, title: 'Stripe Processing', text: 'All payment processing is handled by Stripe, a PCI-DSS Level 1 compliant payment processor. We never store your credit card information.' },
            ].map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * i}>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-accent-gold" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.text}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Security Features */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">Security Features</h2>
              <p className="text-base text-text-muted leading-relaxed">Built-in protections that work quietly in the background to keep your account and data safe.</p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: RefreshCw, title: 'Session Management', text: 'View and manage all active sessions from your account settings. Revoke access to any session instantly. Password changes invalidate all existing sessions.' },
              { icon: AlertTriangle, title: 'Rate Limiting', text: 'Authentication endpoints are rate-limited to prevent brute force attacks. Global API rate limiting protects against abuse while maintaining performance for legitimate users.' },
              { icon: Download, title: 'Data Export & Deletion', text: 'Export all your data — clients, invoices, expenses, and reports — as a single JSON file at any time. Delete your account permanently when you\'re done.' },
            ].map((item, i) => (
              <SmoothScrollReveal key={item.title} delay={0.1 * i}>
                <TiltCard tiltDegree={3}>
                  <div className="p-6 rounded-2xl border border-border/50 bg-white hover:shadow-md hover:shadow-accent-gold/5 hover:border-accent-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mb-4 border border-accent-gold/20">
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

      {/* 6. Security FAQ */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight text-center mb-4">
              Security FAQ
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              Common questions about how we protect your data.
            </p>
          </SmoothScrollReveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <SmoothScrollReveal key={i} delay={0.05 * i}>
                <div className="bg-white rounded-xl border border-border/50 overflow-hidden hover:border-accent-gold/20 transition-colors duration-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-brand-navy hover:bg-white transition-colors"
                  >
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-l-2 border-accent-gold ml-5 pl-3">
                      {faq.a}
                    </div>
                  )}
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
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">Your data is safe with us.</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">Start using Cashaflux with confidence. Security isn't an add-on — it's built into everything we do.</p>
            <Link
              to="/signup"
              className="group relative inline-flex items-center gap-1.5 px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 shadow-lg active:scale-[0.98] text-sm overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/20 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">Start for free</span>
              <ArrowUpRight className="w-4 h-4 relative z-10" />
            </Link>
          </SmoothScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}