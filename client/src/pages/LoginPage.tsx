import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    navigate('/onboarding', { replace: true })
  }

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to manage your invoices and finances."
      brandContent={{
        headline: 'Invoicing that keeps your cash flowing',
        body: 'Send professional invoices, track expenses, and manage finances. Built for freelancers and small teams who need to get paid faster.',
        badges: ['SOC 2 compliant', 'Bank-level encryption'],
      }}
    >
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
        <Link to="/signup" className="text-accent font-medium hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  )
}