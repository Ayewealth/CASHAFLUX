import { useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Receipt,
  Banknote,
  BarChart3,
  PieChart,
  FileText,
  Users,
  Quote,
  Star,
  ArrowRight,
} from "lucide-react";
import Header from "../components/public/Header";
import Footer from "../components/public/Footer";
import Marquee from "../components/shared/Marquee";
import SmoothScrollReveal from "../components/shared/SmoothScrollReveal";
import FeaturePreview from "../components/shared/FeaturePreview";
import Screenshot from "../components/shared/Screenshot";
import AnimatedCounter from "../components/shared/AnimatedCounter";
import TiltCard from "../components/shared/TiltCard";
import StickyStack from "../components/shared/StickyStack";
import ComparisonTable from "../components/shared/ComparisonTable";
import { usePageMeta } from "@/lib/usePageMeta";

const FEATURES = [
  {
    icon: Receipt, title: "Smart Invoicing",
    desc: "Create professional invoices in seconds. Auto-numbering, recurring schedules, and instant sending via email with PDF attachments.",
    tint: "from-brand-navy to-brand-navy-light",
    screenshotFallback: "Invoice creation interface",
    screenshotSrc: "/screenshots/features-invoicing-card.png",
    href: "/features/invoicing",
    large: true,
  },
  {
    icon: Banknote, title: "Expense Tracking",
    desc: "Log expenses with IRS Schedule C categories. Drag-and-drop receipt upload with automatic thumbnail generation.",
    tint: "from-blue-500 to-blue-600",
    screenshotFallback: "Expense log interface",
    screenshotSrc: "/screenshots/features-expenses-card.png",
    href: "/features/expenses",
    large: false,
  },
  {
    icon: BarChart3, title: "Bank Reconciliation",
    desc: "Import bank CSV files, auto-match transactions to invoices and expenses, and reconcile with one click.",
    tint: "from-amber-500 to-amber-600",
    screenshotFallback: "Bank reconciliation view",
    screenshotSrc: "/screenshots/features-bank-card.png",
    href: "/features/bank-reconciliation",
    large: false,
  },
  {
    icon: PieChart, title: "Financial Reports",
    desc: "Profit & Loss, Balance Sheet, Cash Flow, A/R Aging, and more — all exportable as PDF or CSV.",
    tint: "from-rose-500 to-rose-600",
    screenshotFallback: "Reports dashboard",
    screenshotSrc: "/screenshots/features-reports-card.png",
    href: "/features/reports",
    large: true,
  },
  {
    icon: FileText, title: "Tax-Ready Exports",
    desc: "Quarterly estimated tax reminders, 1099 contractor tracker, mileage log with IRS rate, and one-click accountant hand-off.",
    tint: "from-orange-500 to-orange-600",
    screenshotFallback: "Tax centre overview",
    screenshotSrc: "/screenshots/features-tax-card.png",
    href: "/features/tax-centre",
    large: false,
  },
  {
    icon: Users, title: "Team Collaboration",
    desc: "Invite team members with role-based access. Owner, Admin, Accountant, and Member roles with granular permissions.",
    tint: "from-brand-blue to-brand-navy",
    screenshotFallback: "Team management panel",
    screenshotSrc: "/screenshots/features-team-card.png",
    href: "/features",
    large: false,
  },
];

const HOW_IT_WORKS = [
  {
    step: 1, title: "Connect your business",
    desc: "Set up your profile, add your clients, and link your bank accounts — takes less than 5 minutes.",
    screenshotSrc: "/screenshots/onboarding-setup.png",
  },
  {
    step: 2, title: "Manage your finances",
    desc: "Create invoices, log expenses, reconcile transactions, and track mileage — all from one dashboard.",
    screenshotSrc: "/screenshots/dashboard-overview.png",
  },
  {
    step: 3, title: "Stay tax-ready",
    desc: "Generate reports, track quarterly deadlines, and export tax-ready packages for your accountant.",
    screenshotSrc: "/screenshots/tax-centre.png",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    company: "Chen Creative",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    quote: "Cashaflux saved me hours every month. Invoicing used to be a chore, now it takes me 30 seconds.",
  },
  {
    name: "Marcus Johnson",
    role: "Owner",
    company: "Johnson & Co. Landscaping",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    quote: "The bank reconciliation feature alone is worth it. Matches everything automatically.",
  },
  {
    name: "Emily Rodriguez",
    role: "CPA",
    company: "Rodriguez Tax Services",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    quote: "I recommend Cashaflux to all my small business clients. The tax-ready export package makes my job so much easier.",
  },
  {
    name: "David Kim",
    role: "Sole Trader",
    company: "Kim Consulting",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    quote: "I was using spreadsheets for years. Cashaflux made the switch painless. I wish I'd done it sooner.",
  },
];

const FAQS = [
  { q: "Is Cashaflux really free?", a: "Yes! Our Free plan includes core invoicing, expense tracking, and basic reports for up to 5 clients. No credit card required." },
  { q: "Can I switch plans later?", a: "Absolutely. You can upgrade or downgrade at any time. If you upgrade, you get immediate access to all Pro or Business features." },
  { q: "Is my data secure?", a: "Yes. We encrypt all data at rest and in transit. EIN/SSN information is stored with AES-256-GCM encryption. We use Stripe for payment processing." },
  { q: "Do you support annual billing?", a: "Yes, both Pro and Business plans are available with annual billing, saving you roughly 20% compared to monthly billing." },
  { q: "Can I invite my accountant?", a: "Yes, on the Business plan you can invite an Accountant with read-only access to financial data. They can view reports and export data." },
  { q: "What kind of reports do you offer?", a: "Profit & Loss, Balance Sheet, Cash Flow Statement, A/R Aging, A/P Aging, Tax Summary, Sales by Client, Expense by Category, and more." },
  { q: "Do you handle payroll?", a: "We don't process payroll directly, but we provide payroll-ready CSV exports compatible with Gusto, ADP, and Paychex." },
  { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription from the Stripe Customer Portal at any time. Your data remains accessible on the Free plan." },
];

const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["Up to 5 clients", "Core invoicing", "Expense tracking", "Basic reports", "Mileage tracking"], popular: false, cta: "Start Free" },
  { id: "pro", name: "Pro", monthly: 19, annual: 180, features: ["Unlimited clients", "Bank sync & reconciliation", "Recurring invoices", "Advanced reports", "Tax-ready exports", "Priority email support"], popular: true, cta: "Choose Pro" },
  { id: "business", name: "Business", monthly: 39, annual: 360, features: ["Everything in Pro", "Team members (up to 5)", "Payroll-ready exports", "Dedicated account manager", "Priority phone support"], popular: false, cta: "Choose Business" },
];

const COMPARISON_ROWS = [
  { feature: "Client management", values: [{ label: "QuickBooks", included: true }, { label: "Xero", included: true }, { label: "Spreadsheets", included: true }, { label: "Cashaflux", included: true }] },
  { feature: "Invoicing", values: [{ label: "QuickBooks", included: true }, { label: "Xero", included: true }, { label: "Spreadsheets", included: "Manual" }, { label: "Cashaflux", included: true }] },
  { feature: "Expense tracking", values: [{ label: "QuickBooks", included: true }, { label: "Xero", included: true }, { label: "Spreadsheets", included: "Manual" }, { label: "Cashaflux", included: true }] },
  { feature: "Receipt upload", values: [{ label: "QuickBooks", included: true }, { label: "Xero", included: false }, { label: "Spreadsheets", included: false }, { label: "Cashaflux", included: true }] },
  { feature: "Bank reconciliation", values: [{ label: "QuickBooks", included: true }, { label: "Xero", included: true }, { label: "Spreadsheets", included: false }, { label: "Cashaflux", included: true }] },
  { feature: "Mileage with IRS rate", values: [{ label: "QuickBooks", included: false }, { label: "Xero", included: false }, { label: "Spreadsheets", included: "Manual" }, { label: "Cashaflux", included: true }] },
  { feature: "IRS Schedule C categories", values: [{ label: "QuickBooks", included: false }, { label: "Xero", included: false }, { label: "Spreadsheets", included: false }, { label: "Cashaflux", included: true }] },
  { feature: "Tax-ready export", values: [{ label: "QuickBooks", included: "Add-on" }, { label: "Xero", included: false }, { label: "Spreadsheets", included: false }, { label: "Cashaflux", included: true }] },
  { feature: "Free plan", values: [{ label: "QuickBooks", included: false }, { label: "Xero", included: false }, { label: "Spreadsheets", included: true }, { label: "Cashaflux", included: true }] },
];

function HeroParallax() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], [0, 120])
  const opacity = useTransform(scrollY, [0, 400], [1, 0.6])
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-brand-navy/[0.03] via-accent-gold/[0.02] to-transparent pointer-events-none"
      style={{ y: bgY, opacity }}
    />
  )
}

export default function HomePage() {
  usePageMeta({
    title: "Accounting for Small Businesses",
    description: "Simple, fast accounting for American small businesses. Invoicing, expense tracking, bank reconciliation, and tax-ready reports.",
    ogType: "website",
    canonical: "https://cashaflux.com/",
  })
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const LOGO_ITEMS = [
    { label: "Stripe", imgSrc: "https://cdn.simpleicons.org/stripe/1E3A5F" },
    { label: "Gusto", imgSrc: "https://cdn.simpleicons.org/gusto/1E3A5F" },
    { label: "DocuSign", imgSrc: "https://cdn.simpleicons.org/docusign/1E3A5F" },
    { label: "Shopify", imgSrc: "https://cdn.simpleicons.org/shopify/1E3A5F" },
    { label: "Mailchimp", imgSrc: "https://cdn.simpleicons.org/mailchimp/1E3A5F" },
    { label: "Square", imgSrc: "https://cdn.simpleicons.org/square/1E3A5F" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Cashaflux",
            description: "Simple, fast accounting for American small businesses. Invoicing, expense tracking, bank reconciliation, and tax-ready reports.",
            url: "https://cashaflux.com",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: [
              { "@type": "Offer", name: "Free", price: 0, priceCurrency: "USD" },
              { "@type": "Offer", name: "Pro", price: 19, priceCurrency: "USD", billingDuration: "P1M" },
              { "@type": "Offer", name: "Business", price: 39, priceCurrency: "USD", billingDuration: "P1M" },
            ],
          }),
        }}
      />
      <Header />
      <HeroParallax />

      {/* 1. Hero — Split Screen */}
      <section className="min-h-[100dvh] pt-20 lg:pt-0 flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-24">
            <div>
              <SmoothScrollReveal delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading tracking-tighter leading-[1.08] mb-6">
                  <span className="text-brand-navy">Simple accounting. </span>
                  <span className="bg-gradient-to-r from-brand-navy-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">
                    Built for America.
                  </span>
                </h1>
              </SmoothScrollReveal>
              <SmoothScrollReveal delay={0.2}>
                <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-lg mb-8">
                  Invoicing, expense tracking, bank reconciliation, and tax-ready reports — all in one place. No learning curve, no jargon.
                </p>
              </SmoothScrollReveal>
              <SmoothScrollReveal delay={0.3}>
                <div className="flex flex-wrap gap-3 items-center">
                  <Link to="/signup" className="group relative inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/10 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">Start for free</span>
                    <ArrowUpRight className="relative w-4 h-4" />
                  </Link>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-accent-gold-dark bg-accent-gold-light rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    No credit card required
                  </span>
                </div>
              </SmoothScrollReveal>
            </div>
            <SmoothScrollReveal delay={0.2}>
              <TiltCard tiltDegree={4}>
                <FeaturePreview label="Dashboard Preview" screenshotSrc="/screenshots/hero-dashboard.png" screenshotAlt="Cashaflux dashboard overview" />
              </TiltCard>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Social Proof — Marquee + Stats */}
      <section className="py-16 lg:py-20 border-y border-border/50 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <p className="text-xs text-text-muted uppercase tracking-widest text-center mb-8 font-medium font-mono">
              Trusted by growing businesses everywhere
            </p>
          </SmoothScrollReveal>
          <Marquee items={LOGO_ITEMS} className="mb-12" />
          <div className="grid grid-cols-3 gap-8 border-t border-accent-gold-light/50 pt-8 max-w-3xl mx-auto">
            <AnimatedCounter value={10000} suffix="+" label="Active businesses" className="text-center" />
            <AnimatedCounter value={50} suffix="%" label="Reduced admin time" className="text-center" />
            <AnimatedCounter value={500} suffix="K+" label="Invoices processed" className="text-center" />
          </div>
        </div>
      </section>

      {/* 3. Features — True Bento Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Everything you need to run your business
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                From invoicing to tax-ready exports, Cashaflux gives you the tools to stay on top of your finances.
              </p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Row 1 — Smart Invoicing (col-span-2, screenshot) + Expense Tracking (col-span-1) */}
            <SmoothScrollReveal className="md:col-span-2">
              <Link to="/features/invoicing" className="group relative block rounded-2xl overflow-hidden min-h-[280px] md:min-h-[340px]">
                <div className="absolute inset-0">
                  <img src="/screenshots/features-invoicing-card.png" alt="Smart Invoicing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/60 to-brand-navy/10" />
                <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-end h-full absolute bottom-0 left-0 right-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
                      <Receipt className="w-4 h-4 text-accent-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Smart Invoicing</h3>
                  </div>
                  <p className="text-sm text-white/85 leading-relaxed max-w-md mb-3">
                    Create professional invoices in seconds. Auto-numbering, recurring schedules, and instant sending via email with PDF attachments.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold group-hover:text-accent-gold-light transition-colors">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </SmoothScrollReveal>

            <SmoothScrollReveal delay={0.06} className="md:col-span-1">
              <TiltCard tiltDegree={3}>
                <Link to="/features/expenses" className="block h-full p-5 rounded-2xl border border-border/50 bg-white hover:border-accent-gold/30 hover:shadow-lg hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="h-24 rounded-xl overflow-hidden border border-border/50 mb-4">
                    <img src="/screenshots/features-expenses-card.png" alt="Expense Tracking" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center border border-accent-gold/20 shrink-0">
                      <Banknote className="w-4 h-4 text-accent-gold-dark" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy">Expense Tracking</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">Log expenses with IRS Schedule C categories. Drag-and-drop receipt upload with automatic thumbnail generation.</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold-dark group-hover:text-accent-gold transition-colors">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </TiltCard>
            </SmoothScrollReveal>

            {/* Row 2 — Three equal cards with thumbnails */}
            <SmoothScrollReveal delay={0.06} className="md:col-span-1">
              <TiltCard tiltDegree={3}>
                <Link to="/features/bank-reconciliation" className="block h-full p-5 rounded-2xl border border-border/50 bg-white hover:border-accent-gold/30 hover:shadow-lg hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="h-24 rounded-xl overflow-hidden border border-border/50 mb-4">
                    <img src="/screenshots/features-bank-card.png" alt="Bank Reconciliation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center border border-accent-gold/20 shrink-0">
                      <BarChart3 className="w-4 h-4 text-accent-gold-dark" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy">Bank Reconciliation</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">Import bank CSV files, auto-match transactions, and reconcile with one click.</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold-dark group-hover:text-accent-gold transition-colors">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </TiltCard>
            </SmoothScrollReveal>

            <SmoothScrollReveal delay={0.06} className="md:col-span-1">
              <TiltCard tiltDegree={3}>
                <Link to="/features/reports" className="block h-full p-5 rounded-2xl border border-border/50 bg-white hover:border-accent-gold/30 hover:shadow-lg hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="h-24 rounded-xl overflow-hidden border border-border/50 mb-4">
                    <img src="/screenshots/features-reports-card.png" alt="Financial Reports" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center border border-accent-gold/20 shrink-0">
                      <PieChart className="w-4 h-4 text-accent-gold-dark" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy">Financial Reports</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">Profit &amp; Loss, Balance Sheet, Cash Flow, A/R Aging, and more — all exportable as PDF or CSV.</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold-dark group-hover:text-accent-gold transition-colors">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </TiltCard>
            </SmoothScrollReveal>

            <SmoothScrollReveal delay={0.06} className="md:col-span-1">
              <TiltCard tiltDegree={3}>
                <Link to="/features/tax-centre" className="block h-full p-5 rounded-2xl border border-border/50 bg-white hover:border-accent-gold/30 hover:shadow-lg hover:shadow-accent-gold/5 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="h-24 rounded-xl overflow-hidden border border-border/50 mb-4">
                    <img src="/screenshots/features-tax-card.png" alt="Tax-Ready Exports" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center border border-accent-gold/20 shrink-0">
                      <FileText className="w-4 h-4 text-accent-gold-dark" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy">Tax-Ready Exports</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">Quarterly estimated tax reminders, 1099 tracker, mileage log with IRS rate, and one-click hand-off.</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold-dark group-hover:text-accent-gold transition-colors">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </TiltCard>
            </SmoothScrollReveal>

            {/* Row 3 — Team Collaboration (col-span-3, split layout with image on right) */}
            <SmoothScrollReveal delay={0.06} className="md:col-span-3">
              <Link to="/features" className="group relative block rounded-2xl overflow-hidden bg-white border border-border/50 p-6 md:p-8 shadow-md hover:shadow-lg hover:shadow-accent-gold/10 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center border border-accent-gold/20">
                        <Users className="w-5 h-5 text-accent-gold-dark" />
                      </div>
                      <h3 className="text-xl font-bold text-brand-navy">Team Collaboration</h3>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed mb-6 max-w-lg">
                      Invite team members with role-based access. Owner, Admin, Accountant, and Member roles with granular permissions. Activity audit logging keeps everyone accountable.
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-light transition-colors">
                      Explore all features <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/50">
                    <img src="/screenshots/features-team-card.png" alt="Team Collaboration" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </Link>
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 3.5 Visual break — Stat wall */}
      <section className="py-16 lg:py-20 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-dark to-accent-gold-dark/20 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: '10,000+', label: 'Active businesses' },
              { value: '500K+', label: 'Invoices processed' },
              { value: '50%', label: 'Avg. admin time saved' },
              { value: '4.8', label: 'User rating' },
            ].map((stat, i) => (
              <SmoothScrollReveal key={stat.label} delay={0.08 * i}>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold font-heading text-white tracking-tight mb-1">{stat.value}</p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works — Sticky Stack */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-28 pb-8 text-center">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-2">
              Get started in minutes
            </h2>
            <p className="text-base text-text-muted leading-relaxed max-w-lg mx-auto">
              No complicated setup. No training required.
            </p>
          </SmoothScrollReveal>
        </div>
        <StickyStack
          cards={HOW_IT_WORKS.map((step) => ({
            id: `step-${step.step}`,
            content: (
              <div className="relative rounded-3xl overflow-hidden min-h-[70dvh] w-full max-w-5xl mx-auto flex items-center group">
                <div className="absolute inset-0">
                  <img src={step.screenshotSrc} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-accent-gold/30" />
                <div className="relative z-10 p-10 lg:p-16 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-accent-gold font-bold text-sm flex items-center justify-center border border-accent-gold/30">
                      {step.step}
                    </div>
                    <span className="text-xs font-mono font-medium text-accent-gold/70 uppercase tracking-wider">
                      Step {step.step}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">{step.title}</h2>
                  <p className="text-base text-white/80 leading-relaxed max-w-md">{step.desc}</p>
                </div>
              </div>
            ),
          }))}
          className="py-8"
        />
      </section>

      {/* 5. Comparison — Cashaflux vs alternatives */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Why businesses switch to Cashaflux
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                See how we compare to the alternatives — no fluff, just features that matter.
              </p>
            </div>
          </SmoothScrollReveal>
          <SmoothScrollReveal>
            <ComparisonTable rows={COMPARISON_ROWS} highlightCol={3} className="max-w-5xl mx-auto" />
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 6. Testimonials — Tilt Cards */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-accent-gold-dark uppercase tracking-wider mb-4 block">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Loved by business owners
              </h2>
            </div>
          </SmoothScrollReveal>

          {reduce ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md hover:shadow-accent-gold/5 transition-all duration-300">
                  <Quote className="w-8 h-8 text-accent-gold/30 mb-3" />
                  <p className="text-sm text-text leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden relative">
              <motion.div
                className="flex gap-6 w-max"
                animate={{ x: [0, -(TESTIMONIALS.length * 388)] }}
                transition={{ x: { repeat: Infinity, duration: 40, ease: "linear" } }}
              >
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <TiltCard key={`${t.name}-${i}`} tiltDegree={3} className="shrink-0 w-[340px] lg:w-[380px]">
                    <div className="p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md hover:shadow-accent-gold/5 hover:border-accent-gold/20 transition-all duration-300">
                      <Quote className="w-8 h-8 text-accent-gold/30 mb-3" />
                      <p className="text-sm text-text leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-brand-navy">{t.name}</p>
                          <p className="text-xs text-text-muted">{t.role}, {t.company}</p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* 7. Integrations */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Works with your stack
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                Cashaflux integrates with the tools you already use.
              </p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[{ name: "Stripe", desc: "Payments" }, { name: "Resend", desc: "Email" }, { name: "Cloudflare R2", desc: "Storage" }, { name: "CSV Imports", desc: "Bank data" }, { name: "Gusto", desc: "Payroll" }, { name: "ADP", desc: "Payroll" }].map((integration, i) => (
              <SmoothScrollReveal key={integration.name} delay={0.08 * i}>
                <TiltCard tiltDegree={3}>
                  <div className="p-4 rounded-2xl bg-white border border-border/50 text-center hover:border-accent-gold/30 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold-light to-accent-gold/20 flex items-center justify-center mx-auto mb-3 border border-accent-gold/20">
                      <span className="text-lg font-bold text-accent-gold-dark font-mono">{integration.name[0]}</span>
                    </div>
                    <h3 className="text-xs font-bold text-brand-navy mb-0.5">{integration.name}</h3>
                    <p className="text-[10px] text-text-muted">{integration.desc}</p>
                  </div>
                </TiltCard>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-accent-gold-dark uppercase tracking-wider mb-4 block">
                Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-base text-text-muted leading-relaxed mb-6">
                Start free. Upgrade when you grow.
              </p>
              <div className="flex justify-center">
                <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-border/50">
                  <button onClick={() => setBillingInterval("monthly")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === "monthly" ? "bg-brand-navy text-white shadow-sm" : "text-text-muted hover:text-text"}`}>
                    Monthly
                  </button>
                  <button onClick={() => setBillingInterval("annual")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === "annual" ? "bg-brand-navy text-white shadow-sm" : "text-text-muted hover:text-text"}`}>
                    Annual <span className="text-[10px] text-accent-gold ml-0.5">Save 20%</span>
                  </button>
                </div>
              </div>
            </div>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const price = "monthly" in plan ? (billingInterval === "annual" ? `$${plan.annual}` : `$${plan.monthly}`) : "$0"
              const period = "monthly" in plan ? (billingInterval === "annual" ? "/yr" : "/mo") : ""
              return (
                <SmoothScrollReveal key={plan.id} delay={0.1 * i}>
                  <TiltCard tiltDegree={3}>
                    <div className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                      plan.popular ? "border-accent-gold bg-white shadow-md shadow-accent-gold/10" : "border-border/50 bg-white"
                    }`}>
                      {plan.popular && (
                        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-0.5 text-xs font-semibold text-white bg-gradient-to-r from-accent-gold-dark to-accent-gold rounded-full">
                          <Star className="w-3 h-3 fill-white" />
                          Most popular
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-brand-navy mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-brand-navy tracking-tight">{price}</span>
                        <span className="text-sm text-text-muted">{period}</span>
                      </div>
                      {"monthly" in plan && billingInterval === "annual" && (
                        <p className="text-xs text-text-muted mb-3">${plan.monthly}/mo billed monthly</p>
                      )}
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="text-sm text-text-muted flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent-gold-dark shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link to="/signup" className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                        plan.popular ? "bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm" : "border border-border text-text-muted hover:border-accent-gold hover:text-accent-gold-dark"
                      }`}>
                        {plan.cta}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </TiltCard>
                </SmoothScrollReveal>
              )}
            )}
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-20 lg:py-28 bg-surface-warm">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Frequently asked questions
              </h2>
            </div>
          </SmoothScrollReveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <SmoothScrollReveal key={i} delay={0.04 * i}>
                <div className="bg-white rounded-xl border border-border/50 overflow-hidden hover:border-accent-gold/20 transition-colors">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-brand-navy hover:bg-surface-warm transition-colors">
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
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

      {/* 10. CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">
              Ready to simplify your finances?
            </h2>
            <p className="text-base text-white/50 leading-relaxed mb-8 max-w-lg mx-auto">
              Join thousands of small business owners who trust Cashaflux. Start free — no credit card required.
            </p>
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