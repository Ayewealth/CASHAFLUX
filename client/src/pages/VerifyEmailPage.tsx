import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { AuthLayout } from '../components/AuthLayout'
import { usePageMeta } from '@/lib/usePageMeta'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email')
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [error, setError] = useState('')
  usePageMeta({ title: 'Verify Email', description: 'Verify your email address to activate your Cashaflux account.' })

  const email = emailParam || session?.user?.email || ''

  // Auto-redirect if email is already verified
  useEffect(() => {
    if (session?.user?.emailVerified) {
      navigate('/onboarding', { replace: true })
    }
  }, [session, navigate])

  async function handleResend() {
    setResending(true)
    setError('')
    setResendSent(false)
    const result = await authClient.sendVerificationEmail({ email, callbackURL: '/onboarding' }) as { error?: { message: string } | string } | null
    setResending(false)
    if (result?.error) {
      const message = typeof result.error === 'string'
        ? result.error
        : result.error.message || 'Failed to send verification email. Please try again.'
      setError(message)
    } else {
      setResendSent(true)
    }
  }

  async function handleVerified() {
    setChecking(true)
    setError('')
    // Fetch the latest session to check verification status
    const sessionResult = await authClient.getSession()
    setChecking(false)
    if (sessionResult?.data?.user?.emailVerified) {
      navigate('/onboarding', { replace: true })
    } else {
      setError('You have not verified your email yet. Click the link in the email we sent, then try again.')
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-[100dvh] flex bg-bg items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <AuthLayout
      heading="Check your inbox"
      subheading="We just need to confirm this is really you."
      brandContent={{
        headline: 'Almost ready to go',
        body: 'We sent a verification link to your email. Once verified, you will be all set to start managing your business finances.',
        badges: ['Email verification', 'Secure signup', 'Free to start'],
      }}
    >
      <div className="space-y-6">
        {/* Email display card */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-accent">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Verification sent to</p>
              <p className="text-sm text-text-muted break-all">{email || 'your email address'}</p>
            </div>
          </div>
        </div>

        {resendSent && (
          <div className="rounded-xl border border-success/20 bg-success/5 p-4">
            <p className="text-sm text-success flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Email resent. Check your inbox.
            </p>
          </div>
        )}

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

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleVerified}
            disabled={checking}
          >
            {checking ? 'Checking...' : 'I have verified my email'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend email'}
          </Button>
        </div>

        <p className="text-xs text-text-muted text-center">
          Did not receive it? Check your spam folder or{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-accent font-medium hover:underline"
          >
            try again
          </button>.
        </p>
      </div>
    </AuthLayout>
  )
}
