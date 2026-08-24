import { useState } from 'react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Lock } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSent(false)
    setLoading(true)
    const result = await authClient.requestPasswordReset({ email })
    setLoading(false)
    if (result?.error) {
      setError('An error occurred. Please try again.')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        heading="Check your inbox"
        subheading="We sent a password reset link to your email."
        brandContent={{
          headline: 'We will help you back in',
          body: 'Enter your email and we will send a secure reset link. No phone calls, no extra steps.',
          badges: ['Account recovery', 'Email verification'],
        }}
      >
        <div className="space-y-6">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <p className="text-sm text-text-muted">
            We sent a reset link to <strong className="text-text">{email}</strong>. It expires in one hour.
          </p>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">
              Didn't receive it? Check your spam folder or try another email address.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="lg" onClick={() => setSent(false)} className="w-full">
              Try another email
            </Button>
            <Link to="/login" className="block">
              <Button variant="ghost" size="lg" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heading="Forgot your password?"
      subheading="No worries. Tell us your email and we will send a reset link."
      brandContent={{
        headline: 'We will help you back in',
        body: 'Enter your email and we will send a secure reset link. No phone calls, no extra steps.',
        badges: ['Account recovery', 'Email verification'],
      }}
      backLink={{ to: '/login', label: 'Back to log in' }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="pl-10 h-10"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-danger flex items-center gap-1.5" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-text-muted">
        Remember your password?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">Sign in here</Link>
      </p>
    </AuthLayout>
  )
}