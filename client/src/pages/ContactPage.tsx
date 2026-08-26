import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, Mail, MessageSquare, Clock, CheckCircle2, Loader2, ChevronDown } from 'lucide-react'
import Header from '../components/public/Header'
import Footer from '../components/public/Footer'
import SmoothScrollReveal from '../components/shared/SmoothScrollReveal'
import { usePageMeta } from '@/lib/usePageMeta'

const FAQS_BEFORE_CONTACT = [
  { q: 'How do I reset my password?', a: 'Go to the login page and click "Forgot password." We\'ll send you a reset link via email.' },
  { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from the Stripe Customer Portal in your Settings page.' },
  { q: 'Can I export my data?', a: 'Yes. Go to Settings > Data & Privacy to export all your data as a JSON file.' },
  { q: 'How do I invite team members?', a: 'On the Business plan, go to Team in the sidebar and click "Invite member."' },
  { q: 'Is my data backed up?', a: 'Yes. We maintain automated daily backups and encrypt all data at rest and in transit.' },
]

const CHANNELS = [
  { icon: Mail, title: 'Email support', desc: 'We respond within 24 hours, usually faster.', action: 'hello@cashaflux.com' },
  { icon: MessageSquare, title: 'Help Center', desc: 'Guides, FAQs, and documentation.', action: 'Coming soon', disabled: true },
  { icon: Clock, title: 'Office hours', desc: 'Mon–Fri, 9am–6pm EST (business days).', action: 'Reach out anytime' },
]

export default function ContactPage() {
  usePageMeta({ title: 'Contact', description: 'Get in touch with the Cashaflux team. We are here to help with questions, feedback, or support.' })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address'
    if (!subject.trim()) errs.subject = 'Subject is required'
    if (!message.trim()) errs.message = 'Message is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function clearError(field: string) {
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Validation failed')
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) throw new Error('Failed to send')
    },
    onSuccess: () => {
      setName(''); setEmail(''); setSubject(''); setMessage(''); setErrors({})
    },
  })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero — Split layout */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/[0.02] via-accent-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Left: Form */}
            <SmoothScrollReveal delay={0.2}>
              <div className="bg-white rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-brand-navy mb-6">Send us a message</h2>

                {submitMutation.isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-navy/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-brand-navy" />
                    </div>
                    <p className="text-sm font-semibold text-brand-navy mb-1">Message sent!</p>
                    <p className="text-xs text-text-muted">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (validate()) submitMutation.mutate() }}
                    className="space-y-4"
                  >
<div>
  <label htmlFor="name" className="block text-sm font-medium text-brand-navy mb-1.5">Name</label>
  <input id="name" type="text" value={name} onChange={e => { setName(e.target.value); clearError('name') }}
    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 transition-all ${errors.name ? 'border-danger' : 'border-border focus:border-brand-navy'}`} placeholder="Your name" />
  {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
</div>
<div>
  <label htmlFor="email" className="block text-sm font-medium text-brand-navy mb-1.5">Email</label>
  <input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); clearError('email') }}
    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 transition-all ${errors.email ? 'border-danger' : 'border-border focus:border-brand-navy'}`} placeholder="you@example.com" />
  {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
</div>
<div>
  <label htmlFor="subject" className="block text-sm font-medium text-brand-navy mb-1.5">Subject</label>
  <input id="subject" type="text" value={subject} onChange={e => { setSubject(e.target.value); clearError('subject') }}
    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 transition-all ${errors.subject ? 'border-danger' : 'border-border focus:border-brand-navy'}`} placeholder="How can we help?" />
  {errors.subject && <p className="text-xs text-danger mt-1">{errors.subject}</p>}
</div>
<div>
  <label htmlFor="message" className="block text-sm font-medium text-brand-navy mb-1.5">Message</label>
  <textarea id="message" rows={5} value={message} onChange={e => { setMessage(e.target.value); clearError('message') }}
    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 transition-all resize-none ${errors.message ? 'border-danger' : 'border-border focus:border-brand-navy'}`} placeholder="Tell us more..." />
  {errors.message && <p className="text-xs text-danger mt-1">{errors.message}</p>}
</div>
                    <button type="submit" disabled={submitMutation.isPending}
                      className="inline-flex items-center justify-center gap-1.5 w-full px-5 py-2.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-sm active:scale-[0.98] text-sm disabled:opacity-60">
                      {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitMutation.isPending ? 'Sending...' : 'Send message'}
                    </button>
                    {submitMutation.isError && (
                      <div className="p-3 rounded-xl bg-danger/5 border border-danger/20 text-xs text-danger">
                        <p className="font-medium mb-0.5">Failed to send</p>
                        <p>This could be a temporary issue. Try again in a moment, or reach us directly at <strong>support@cashaflux.com</strong>.</p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </SmoothScrollReveal>

            {/* Right: Brand info panel — hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-between p-10 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 w-40 h-40 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="absolute bottom-4 left-4 w-32 h-32 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
              </div>
              <div className="relative">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                  We'd love to <br /><span className="bg-gradient-to-r from-accent-gold-light via-accent-gold to-accent-gold-dark bg-clip-text text-transparent">hear from you</span>
                </h1>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-white/80 mb-1">Email us</p>
                    <p className="text-base text-white">support@cashaflux.com</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80 mb-1">Response time</p>
                    <p className="text-base text-white">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <p className="text-sm font-medium text-white/60 mb-3">Follow us</p>
                <div className="flex gap-3">
                  <a href="https://twitter.com/cashaflux" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all text-xs font-medium">X</a>
                  <a href="https://linkedin.com/company/cashaflux" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all text-xs font-medium">in</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FAQ before contacting */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-4">
              Quick answers before you reach out
            </h2>
            <p className="text-base text-text-muted text-center mb-12 max-w-lg mx-auto">
              We've answered the most common questions to save you time.
            </p>
          </SmoothScrollReveal>

          <div className="space-y-3">
            {FAQS_BEFORE_CONTACT.map((faq, i) => (
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

      {/* 3. Support Channels */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight text-center mb-4">
              Other ways to reach us
            </h2>
          </SmoothScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CHANNELS.map((channel, i) => (
              <SmoothScrollReveal key={channel.title} delay={0.1 * i}>
                <div className={`p-6 rounded-2xl border border-border/50 text-center hover:shadow-md transition-all duration-300 ${channel.disabled ? 'bg-white/50 opacity-60' : 'bg-white'}`}>
                  <channel.icon className="w-8 h-8 text-brand-navy mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-brand-navy mb-1">{channel.title}</h3>
                  <p className="text-xs text-text-muted mb-3">{channel.desc}</p>
                  <span className={`text-xs font-medium font-mono ${channel.disabled ? 'text-text-muted/50' : 'text-brand-navy'}`}>
                    {channel.action}
                  </span>
                </div>
              </SmoothScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Social + CTA */}
      <section className="py-16 lg:py-24 bg-brand-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold-dark/10 via-brand-navy-dark to-brand-navy pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">Follow us on social</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
              Stay up to date with product updates, tips, and news.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <a href="https://twitter.com/cashaflux" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 border border-white/20 rounded-xl">Twitter</a>
              <a href="https://linkedin.com/company/cashaflux" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 border border-white/20 rounded-xl">LinkedIn</a>
            </div>
            <p className="text-sm text-white/40 mb-6">Or get started right away</p>
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-brand-navy font-semibold rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 shadow-lg active:scale-[0.98] text-sm"
            >
              Start for free
            </a>
          </SmoothScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}