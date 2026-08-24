import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import { usePageMeta } from '@/lib/usePageMeta'

export default function PrivacyPage() {
  usePageMeta({ title: 'Privacy Policy', description: 'Cashaflux Privacy Policy. Learn how we collect, use, and protect your data.' })
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-navy transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-sm text-text-muted mb-8">Last updated: August 2026</p>
          </SmoothScrollReveal>

          <div className="space-y-6 text-sm text-text-muted leading-relaxed">
            <SmoothScrollReveal delay={0.1}><h2 className="text-lg font-bold text-brand-navy">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, business information, and financial data necessary to provide our services. We also collect usage data automatically, such as pages visited and features used.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.15}><h2 className="text-lg font-bold text-brand-navy">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve our services; to process transactions; to send you technical notices and support messages; and to communicate with you about our products.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.2}><h2 className="text-lg font-bold text-brand-navy">3. Data Security</h2>
            <p>We implement industry-standard security measures including encryption at rest (AES-256-GCM for sensitive data) and in transit (TLS). Your financial data is stored securely and never shared with unauthorized third parties.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.25}><h2 className="text-lg font-bold text-brand-navy">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with trusted service providers (Stripe for payments, Cloudflare R2 for file storage, Resend for email) who are bound by confidentiality agreements.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.3}><h2 className="text-lg font-bold text-brand-navy">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we anonymize your personal data within 30 days. Financial records may be retained longer for legal compliance.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.35}><h2 className="text-lg font-bold text-brand-navy">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You can export all your data from the Settings page at any time. You can also request account deletion, which will be processed within 30 days.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.4}><h2 className="text-lg font-bold text-brand-navy">7. Cookies</h2>
            <p>We use essential cookies for authentication and security. We do not use tracking cookies or third-party analytics that share data with advertising networks.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.45}><h2 className="text-lg font-bold text-brand-navy">8. Contact</h2>
            <p>If you have questions about this privacy policy, please contact us at <a href="mailto:hello@cashaflux.com" className="text-brand-navy hover:underline">hello@cashaflux.com</a>.</p></SmoothScrollReveal>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}