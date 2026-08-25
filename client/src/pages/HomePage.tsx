import { useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
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
  Sparkles,
} from "lucide-react";
import Header from "../components/public/Header";
import Footer from "../components/public/Footer";
import Marquee from "../components/shared/Marquee";
import SmoothScrollReveal from "../components/shared/SmoothScrollReveal";
import FeaturePreview from "../components/shared/FeaturePreview";
import Screenshot from "../components/shared/Screenshot";
import StatCounter from "../components/shared/StatCounter";
import ComparisonTable from "../components/shared/ComparisonTable";
import { usePageMeta } from "@/lib/usePageMeta";

const FEATURES = [
  {
    icon: Receipt,
    title: "Smart Invoicing",
    desc: "Create professional invoices in seconds. Auto-numbering, recurring schedules, and instant sending via email with PDF attachments.",
    tint: "bg-blue-50/50",
    screenshotFallback: "Invoice creation interface",
    screenshotSrc: "/screenshots/features-invoicing-card.png",
  },
  {
    icon: Banknote,
    title: "Expense Tracking",
    desc: "Log expenses with IRS Schedule C categories. Drag-and-drop receipt upload with automatic thumbnail generation.",
    tint: "bg-blue-50/50",
    screenshotFallback: "Expense log interface",
    screenshotSrc: "/screenshots/features-expenses-card.png",
  },
  {
    icon: BarChart3,
    title: "Bank Reconciliation",
    desc: "Import bank CSV files, auto-match transactions to invoices and expenses, and reconcile with one click.",
    tint: "bg-amber-50/50",
    screenshotFallback: "Bank reconciliation view",
    screenshotSrc: "/screenshots/features-bank-card.png",
  },
  {
    icon: PieChart,
    title: "Financial Reports",
    desc: "Profit & Loss, Balance Sheet, Cash Flow, A/R Aging, and more — all exportable as PDF or CSV with Recharts visualizations.",
    tint: "bg-rose-50/50",
    screenshotFallback: "Reports dashboard",
    screenshotSrc: "/screenshots/features-reports-card.png",
  },
  {
    icon: FileText,
    title: "Tax-Ready Exports",
    desc: "Quarterly estimated tax reminders, 1099 contractor tracker, mileage log with IRS rate, and one-click accountant hand-off.",
    tint: "bg-violet-50/50",
    screenshotFallback: "Tax centre overview",
    screenshotSrc: "/screenshots/features-tax-card.png",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Invite team members with role-based access. Owner, Admin, Accountant, and Member roles with granular permissions.",
    tint: "bg-cyan-50/50",
    screenshotFallback: "Team management panel",
    screenshotSrc: "/screenshots/features-team-card.png",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Connect your business",
    desc: "Set up your profile, add your clients, and link your bank accounts — takes less than 5 minutes.",
  },
  {
    step: 2,
    title: "Manage your finances",
    desc: "Create invoices, log expenses, reconcile transactions, and track mileage — all from one dashboard.",
  },
  {
    step: 3,
    title: "Stay tax-ready",
    desc: "Generate reports, track quarterly deadlines, and export tax-ready packages for your accountant.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    company: "Chen Creative",
    quote:
      "Cashaflux saved me hours every month. Invoicing used to be a chore, now it takes me 30 seconds.",
  },
  {
    name: "Marcus Johnson",
    role: "Owner",
    company: "Johnson & Co. Landscaping",
    quote:
      "The bank reconciliation feature alone is worth it. Matches everything automatically — no more manual spreadsheet work.",
  },
  {
    name: "Emily Rodriguez",
    role: "CPA",
    company: "Rodriguez Tax Services",
    quote:
      "I recommend Cashaflux to all my small business clients. The tax-ready export package makes my job so much easier.",
  },
  {
    name: "David Kim",
    role: "Sole Trader",
    company: "Kim Consulting",
    quote:
      "I was using spreadsheets for years. Cashaflux made the switch painless. I wish I'd done it sooner.",
  },
];

const INTEGRATIONS = [
  { name: "Stripe", desc: "Payment processing & subscriptions" },
  { name: "Resend", desc: "Transactional emails" },
  { name: "Cloudflare R2", desc: "Receipt & document storage" },
  { name: "CSV Bank Imports", desc: "Chase, BoA, Wells Fargo & more" },
  { name: "Gusto", desc: "Payroll-ready exports" },
  { name: "ADP", desc: "Payroll-ready exports" },
];

const FAQS = [
  {
    q: "Is Cashaflux really free?",
    a: "Yes! Our Free plan includes core invoicing, expense tracking, and basic reports for up to 5 clients. No credit card required.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. If you upgrade, you get immediate access to all Pro or Business features.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We encrypt all data at rest and in transit. EIN/SSN information is stored with AES-256-GCM encryption. We use Stripe for payment processing.",
  },
  {
    q: "Do you support annual billing?",
    a: "Yes, both Pro and Business plans are available with annual billing, saving you roughly 20% compared to monthly billing.",
  },
  {
    q: "Can I invite my accountant?",
    a: "Yes, on the Business plan you can invite an Accountant with read-only access to financial data. They can view reports and export data.",
  },
  {
    q: "What kind of reports do you offer?",
    a: "Profit & Loss, Balance Sheet, Cash Flow Statement, A/R Aging, A/P Aging, Tax Summary, Sales by Client, Expense by Category, and more.",
  },
  {
    q: "Do you handle payroll?",
    a: "We don't process payroll directly, but we provide payroll-ready CSV exports compatible with Gusto, ADP, and Paychex.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription from the Stripe Customer Portal at any time. Your data remains accessible on the Free plan.",
  },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "Up to 5 clients",
      "Core invoicing",
      "Expense tracking",
      "Basic reports",
      "Mileage tracking",
    ],
    popular: false,
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 19,
    annual: 180,
    features: [
      "Unlimited clients",
      "Bank sync & reconciliation",
      "Recurring invoices",
      "Advanced reports",
      "Tax-ready exports",
      "Priority email support",
    ],
    popular: true,
    cta: "Choose Pro",
  },
  {
    id: "business",
    name: "Business",
    monthly: 39,
    annual: 360,
    features: [
      "Everything in Pro",
      "Team members (up to 5)",
      "Payroll-ready exports",
      "Dedicated account manager",
      "Priority phone support",
    ],
    popular: false,
    cta: "Choose Business",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Client management",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: true },
      { label: "Spreadsheets", included: true },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Invoicing",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: true },
      { label: "Spreadsheets", included: "Manual" },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Expense tracking",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: true },
      { label: "Spreadsheets", included: "Manual" },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Receipt upload",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: false },
      { label: "Spreadsheets", included: false },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Bank reconciliation",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: true },
      { label: "Spreadsheets", included: false },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Tax-ready exports",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: false },
      { label: "Spreadsheets", included: false },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Mileage tracking",
    values: [
      { label: "QuickBooks", included: true },
      { label: "Xero", included: false },
      { label: "Spreadsheets", included: "Manual" },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Modern UI",
    values: [
      { label: "QuickBooks", included: false },
      { label: "Xero", included: true },
      { label: "Spreadsheets", included: false },
      { label: "Cashaflux", included: true },
    ],
  },
  {
    feature: "Free plan",
    values: [
      { label: "QuickBooks", included: false },
      { label: "Xero", included: false },
      { label: "Spreadsheets", included: true },
      { label: "Cashaflux", included: true },
    ],
  },
];

export default function HomePage() {
  usePageMeta({
    title: "Accounting for Small Businesses",
    description:
      "Simple, fast accounting for American small businesses. Invoicing, expense tracking, bank reconciliation, and tax-ready reports.",
    ogType: "website",
    canonical: "https://cashaflux.com/",
  });
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const LOGO_ITEMS = [
    { label: "Stripe", icon: null },
    { label: "Linear", icon: null },
    { label: "Vercel", icon: null },
    { label: "Notion", icon: null },
    { label: "Loom", icon: null },
    { label: "Raycast", icon: null },
  ];

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Cashaflux",
            description:
              "Simple, fast accounting for American small businesses. Invoicing, expense tracking, bank reconciliation, and tax-ready reports.",
            url: "https://cashaflux.com",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: 0,
                priceCurrency: "USD",
              },
              {
                "@type": "Offer",
                name: "Pro",
                price: 19,
                priceCurrency: "USD",
                billingDuration: "P1M",
              },
              {
                "@type": "Offer",
                name: "Business",
                price: 39,
                priceCurrency: "USD",
                billingDuration: "P1M",
              },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: 4.8,
              ratingCount: 256,
            },
          }),
        }}
      />
      <Header />

      {/* 1. Hero — Split Screen */}
      <section className="min-h-[100dvh] pt-20 lg:pt-0 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/[0.03] via-transparent to-brand-navy/[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-24">
            <div>
              <SmoothScrollReveal delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading text-brand-navy tracking-tighter leading-[1.08] mb-6">
                  Simple accounting.{" "}
                  <span className="text-brand-navy-light">
                    Built for America.
                  </span>
                </h1>
              </SmoothScrollReveal>
              <SmoothScrollReveal delay={0.2}>
                <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-lg mb-8">
                  Invoicing, expense tracking, bank reconciliation, and
                  tax-ready reports — all in one place. No learning curve, no
                  jargon.
                </p>
              </SmoothScrollReveal>
              <SmoothScrollReveal delay={0.3}>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98] text-sm"
                  >
                    Start for free
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/features"
                    className="inline-flex items-center gap-1.5 px-6 py-3 border border-border text-text-muted font-medium rounded-xl hover:border-brand-navy hover:text-brand-navy transition-all duration-200 text-sm"
                  >
                    See features
                  </Link>
                </div>
              </SmoothScrollReveal>
              <SmoothScrollReveal delay={0.4}>
                <p className="flex items-center gap-1.5 text-xs text-text-muted mt-4">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  No credit card required &middot; Free plan included
                </p>
              </SmoothScrollReveal>
            </div>
            <SmoothScrollReveal delay={0.2}>
              <FeaturePreview
                label="Dashboard Preview"
                screenshotSrc="/screenshots/hero-dashboard.png"
                screenshotAlt="Cashaflux dashboard overview"
              />
            </SmoothScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Social Proof — Marquee + Stats */}
      <section className="py-16 lg:py-20 border-y border-border/50 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <p className="text-xs text-text-muted uppercase tracking-widest text-center mb-8 font-medium font-mono">
              Trusted by growing businesses everywhere
            </p>
          </SmoothScrollReveal>
          <Marquee items={LOGO_ITEMS} className="mb-12" />
          <div className="grid grid-cols-3 gap-8 border-t border-border/50 pt-8 max-w-3xl mx-auto">
            <StatCounter value={10000} suffix="+" label="Active businesses" />
            <StatCounter value={50} suffix="%" label="Reduced admin time" />
            <StatCounter value={500} suffix="K+" label="Invoices processed" />
          </div>
        </div>
      </section>

      {/* 3. Features — Uniform 3-Column Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Everything you need to run your business
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                From invoicing to tax-ready exports, Cashaflux gives you the
                tools to stay on top of your finances.
              </p>
            </div>
          </SmoothScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <SmoothScrollReveal key={feature.title} delay={0.08 * i}>
                <div
                  className={`p-5 rounded-2xl border border-border/50 hover:border-brand-navy/20 hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300 ${feature.tint}`}
                >
                  <div className="h-28 rounded-xl overflow-hidden border border-border/50 mb-4">
                    <Screenshot
                      fallback={feature.screenshotFallback}
                      src={feature.screenshotSrc}
                      alt={feature.title}
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center border border-border/50">
                      <feature.icon className="w-4 h-4 text-brand-navy" />
                    </div>
                    <h3 className="text-base font-bold text-brand-navy">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works — Vertical Timeline */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Get started in minutes
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                No complicated setup. No training required.
              </p>
            </div>
          </SmoothScrollReveal>

          <div className="max-w-3xl mx-auto space-y-12 lg:space-y-16">
            {HOW_IT_WORKS.map((step, i) => (
              <SmoothScrollReveal key={step.step} delay={0.15 * i}>
                <div className="flex gap-6 lg:gap-10">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-brand-navy text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                      {step.step}
                    </div>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-brand-navy/40 to-transparent mt-2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-brand-navy mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Comparison — Cashaflux vs alternatives */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy tracking-tight mb-4">
                Why businesses switch to Cashaflux
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                See how we compare to the alternatives — no fluff, just features
                that matter.
              </p>
            </div>
          </SmoothScrollReveal>
          <SmoothScrollReveal>
            <ComparisonTable
              rows={COMPARISON_ROWS}
              highlightCol={3}
              className="max-w-5xl mx-auto"
            />
          </SmoothScrollReveal>
        </div>
      </section>

      {/* 6. Testimonials — Infinite Scroll */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-brand-navy bg-brand-blue-light rounded-full mb-4">
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
                <div
                  key={t.name}
                  className="p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300"
                >
                  <Quote className="w-8 h-8 text-brand-navy/20 mb-3" />
                  <p className="text-sm text-text leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue-light text-brand-navy font-bold text-sm flex items-center justify-center">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">
                        {t.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {t.role}, {t.company}
                      </p>
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
                transition={{
                  x: { repeat: Infinity, duration: 40, ease: "linear" },
                }}
              >
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className="shrink-0 w-[340px] lg:w-[380px] p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md hover:shadow-brand-navy/5 transition-all duration-300"
                  >
                    <Quote className="w-8 h-8 text-brand-navy/20 mb-3" />
                    <p className="text-sm text-text leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue-light text-brand-navy font-bold text-sm flex items-center justify-center">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-navy">
                          {t.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {t.role}, {t.company}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* 7. Integrations */}
      <section className="py-20 lg:py-28">
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
            {INTEGRATIONS.map((integration, i) => (
              <SmoothScrollReveal key={integration.name} delay={0.08 * i}>
                <div className="p-4 rounded-2xl bg-white border border-border/50 text-center hover:border-brand-navy/20 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3 border border-border/50">
                    <span className="text-lg font-bold text-brand-navy font-mono">
                      {integration.name[0]}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-brand-navy mb-1">
                    {integration.name}
                  </h3>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    {integration.desc}
                  </p>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-brand-navy bg-brand-blue-light rounded-full mb-4">
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
                  <button
                    onClick={() => setBillingInterval("monthly")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === "monthly" ? "bg-brand-navy text-white shadow-sm" : "text-text-muted hover:text-text"}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval("annual")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === "annual" ? "bg-brand-navy text-white shadow-sm" : "text-text-muted hover:text-text"}`}
                  >
                    Annual{" "}
                    <span className="text-[10px] text-brand-navy-light ml-0.5">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const price =
                "monthly" in plan
                  ? billingInterval === "annual"
                    ? `$${plan.annual}`
                    : `$${plan.monthly}`
                  : "$0";
              const period =
                "monthly" in plan
                  ? billingInterval === "annual"
                    ? "/yr"
                    : "/mo"
                  : "";
              return (
                <SmoothScrollReveal key={plan.id} delay={0.1 * i}>
                  <div
                    className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:shadow-brand-navy/5 ${
                      plan.popular
                        ? "border-brand-navy bg-white shadow-md"
                        : "border-border/50 bg-white"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-6 inline-flex px-3 py-0.5 text-xs font-semibold text-white bg-brand-navy rounded-full">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-brand-navy mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-brand-navy tracking-tight">
                        {price}
                      </span>
                      <span className="text-sm text-text-muted">{period}</span>
                    </div>
                    {"monthly" in plan && billingInterval === "annual" && (
                      <p className="text-xs text-text-muted mb-3">
                        ${plan.monthly}/mo billed monthly
                      </p>
                    )}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="text-sm text-text-muted flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                        plan.popular
                          ? "bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm"
                          : "border border-border text-text-muted hover:border-brand-navy hover:text-brand-navy"
                      }`}
                    >
                      {plan.cta}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </SmoothScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-20 lg:py-28">
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
                <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-brand-navy hover:bg-surface transition-colors"
                  >
                    {faq.q}
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
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

      {/* 10. CTA */}
      <section className="py-20 lg:py-28 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">
              Ready to simplify your finances?
            </h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
              Join thousands of small business owners who trust Cashaflux. Start
              free — no credit card required.
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
  );
}
