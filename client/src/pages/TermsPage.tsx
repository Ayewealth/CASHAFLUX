import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import { usePageMeta } from '@/lib/usePageMeta'

export default function TermsPage() {
  usePageMeta({ title: 'Terms of Service', description: 'Cashaflux Terms of Service. Understand the terms governing your use of our platform.' })
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-navy transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-2">Terms of Service</h1>
            <p className="text-sm text-text-muted mb-8">Last updated: August 2026</p>
          </SmoothScrollReveal>

          <div className="space-y-6 text-sm text-text-muted leading-relaxed">
            <SmoothScrollReveal delay={0.1}><h2 className="text-lg font-bold text-brand-navy">1. Acceptance of Terms</h2>
            <p>By accessing or using Cashaflux, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.15}><h2 className="text-lg font-bold text-brand-navy">2. Description of Service</h2>
            <p>Cashaflux provides cloud-based accounting software for small businesses, including invoicing, expense tracking, bank reconciliation, reporting, and related features.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.2}><h2 className="text-lg font-bold text-brand-navy">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information during registration.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.25}><h2 className="text-lg font-bold text-brand-navy">4. Subscriptions and Billing</h2>
            <p>Paid plans are billed in advance on a monthly or annual basis. You can upgrade, downgrade, or cancel your subscription at any time. Refunds are provided only as required by law.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.3}><h2 className="text-lg font-bold text-brand-navy">5. Acceptable Use</h2>
            <p>You agree not to use Cashaflux for any unlawful purpose or in violation of any applicable laws. You may not attempt to access, modify, or disrupt the service in any unauthorized manner.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.35}><h2 className="text-lg font-bold text-brand-navy">6. Data Ownership</h2>
            <p>You retain full ownership of all data you enter into Cashaflux. We do not claim any intellectual property rights over your data. You can export your data at any time via the Settings page.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.4}><h2 className="text-lg font-bold text-brand-navy">7. Limitation of Liability</h2>
            <p>Cashaflux is provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p></SmoothScrollReveal>

            <SmoothScrollReveal delay={0.45}><h2 className="text-lg font-bold text-brand-navy">8. Changes to Terms</h2>
            <p>We may modify these terms at any time. We will notify users of material changes via email. Continued use of the service after changes constitutes acceptance of the new terms.</p></SmoothScrollReveal>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}