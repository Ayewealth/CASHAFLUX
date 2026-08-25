import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { useAuthRedirect } from '@/lib/useAuthRedirect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, CheckSquare } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { usePageMeta } from '@/lib/usePageMeta'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')
  const { isPending, hasSession } = useAuthRedirect()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<{ orgName: string } | null>(null)

  usePageMeta({ title: 'Sign In', description: 'Sign in to your Cashaflux account to manage invoices, expenses, and financial reports.' })

  useEffect(() => {
    if (inviteToken) {
      fetch(`/api/invitations/info?token=${inviteToken}`)
        .then(r => r.json())
        .then(data => {
          if (data.orgName) setInviteInfo({ orgName: data.orgName })
        })
        .catch(() => {})
    }
  }, [inviteToken])

  if (isPending) {
    return (
      <div className="min-h-[100dvh] flex bg-bg items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  if (hasSession) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) {
      setError('Invalid email or password')
      return
    }
    if (inviteToken) {
      navigate(`/dashboard?invite=${inviteToken}`, { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  }

  return (
    <AuthLayout
      heading="Welcome back"
      subheading={inviteToken ? 'Sign in to join the organization' : 'Sign in to manage your invoices and finances.'}
      brandContent={{
        headline: 'Invoicing that keeps your cash flowing',
        body: 'Send professional invoices, track expenses, and manage finances. Built for freelancers and small teams who need to get paid faster.',
        badges: ['SOC 2 compliant', 'Bank-level encryption'],
      }}
    >
      {inviteInfo && (
        <div className="mb-4 p-3 rounded-xl bg-brand-blue-light border border-brand-blue/20 text-sm text-brand-navy font-medium">
          You've been invited to join <strong>{inviteInfo.orgName}</strong>. Sign in to accept.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pl-10 h-10"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={rememberMe} onChange={(e) => { setRememberMe(e.target.checked); localStorage.setItem('rememberMe', String(e.target.checked)) }}
            className="w-4 h-4 rounded border-border text-brand-navy focus:ring-brand-navy/20" />
          <span className="text-sm text-text-muted">Remember me</span>
        </label>

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
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link to={inviteToken ? `/signup?invite=${inviteToken}` : '/signup'} className="text-accent font-medium hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  )
}
