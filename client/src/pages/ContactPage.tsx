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
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) throw new Error('Failed to send')
    },
    onSuccess: () => {
      setName(''); setEmail(''); setSubject(''); setMessage('')
    },
  })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 1. Hero — Split screen */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <SmoothScrollReveal>
                <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy tracking-tight mb-4">
                  We'd love to <span className="text-brand-navy">hear from you</span>
                </h1>
                <p className="text-base text-text-muted leading-relaxed mb-8">
                  Have a question, feedback, or want to learn more? Send us a message and we'll get back to you within 24 hours.
                </p>
              </SmoothScrollReveal>

              <SmoothScrollReveal delay={0.1}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                    <Mail className="w-5 h-5 text-brand-navy" />
                    <div>
                      <p className="text-sm font-medium text-brand-navy">Email us</p>
                      <p className="text-xs text-text-muted">hello@cashaflux.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                    <Clock className="w-5 h-5 text-brand-navy" />
                    <div>
                      <p className="text-sm font-medium text-brand-navy">Response time</p>
                      <p className="text-xs text-text-muted">Within 24 hours on business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                    <MessageSquare className="w-5 h-5 text-brand-navy" />
                    <div>
                      <p className="text-sm font-medium text-brand-navy">Based in</p>
                      <p className="text-xs text-text-muted">United States</p>
                    </div>
                  </div>
                </div>
              </SmoothScrollReveal>
            </div>

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
                    onSubmit={(e) => { e.preventDefault(); submitMutation.mutate() }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-brand-navy mb-1.5">Name</label>
                      <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-brand-navy mb-1.5">Email</label>
                      <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-brand-navy mb-1.5">Subject</label>
                      <input id="subject" type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all" placeholder="How can we help?" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-brand-navy mb-1.5">Message</label>
                      <textarea id="message" required rows={5} value={message} onChange={e => setMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all resize-none" placeholder="Tell us more..." />
                    </div>
                    <button type="submit" disabled={submitMutation.isPending}
                      className="inline-flex items-center justify-center gap-1.5 w-full px-5 py-2.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-dark transition-all duration-200 shadow-sm active:scale-[0.98] text-sm disabled:opacity-60">
                      {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitMutation.isPending ? 'Sending...' : 'Send message'}
                    </button>
                    {submitMutation.isError && (
                      <p className="text-xs text-danger">Failed to send. Please try again or email us directly.</p>
                    )}
                  </form>
                )}
              </div>
            </SmoothScrollReveal>
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
      <section className="py-16 lg:py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative">
          <SmoothScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">Follow us on social</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
              Stay up to date with product updates, tips, and news.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <a href="#" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 border border-white/20 rounded-xl">Twitter</a>
              <a href="#" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 border border-white/20 rounded-xl">LinkedIn</a>
              <a href="#" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 border border-white/20 rounded-xl">GitHub</a>
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