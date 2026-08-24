import { useState } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'

interface NewsletterFormProps {
  placeholder?: string
  buttonText?: string
  className?: string
}

export default function NewsletterForm({
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  className = '',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    // Simulate — in production, wire to /api/newsletter
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    setEmail('')
  }

  if (status === 'success') {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm font-semibold text-brand-navy">Thanks for subscribing!</p>
        <p className="text-xs text-text-muted mt-1">We'll send you weekly tips and updates.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-sm active:scale-[0.98] text-sm shrink-0 disabled:opacity-60"
      >
        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
        {buttonText}
      </button>
    </form>
  )
}