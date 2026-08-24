import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/\d/.test(password)) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const levels = [
    { label: 'Weak', color: 'bg-danger' },
    { label: 'Fair', color: 'bg-warning' },
    { label: 'Good', color: 'bg-[#2563EB]' },
    { label: 'Strong', color: 'bg-success' },
  ]

  return {
    score,
    label: password ? levels[score - 1]?.label || 'Too short' : '',
    color: password ? levels[score - 1]?.color || '' : '',
  }
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!getPasswordStrength(password).score || password.length < 8) {
      setError('Password must be at least 8 characters and contain a digit')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await authClient.signUp.email({ name, email, password })
    setLoading(false)
    if (result.error) {
      setError(result.error.message || 'Sign up failed')
      return
    }
    navigate(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Start with our free plan. Upgrade anytime."
      brandContent={{
        headline: 'Start managing your finances today',
        body: 'Create an account in under a minute. No credit card required for the free plan. Invoice clients, track expenses, and stay on top of your tax obligations.',
        badges: ['Send invoices', 'Track expenses', 'Manage team'],
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="pl-10 h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="signup-email"
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
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="pl-10 pr-10 h-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors pointer-events-auto"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-1.5 mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength.score ? strength.color : 'bg-neutral-200 dark:bg-input'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${
                strength.score <= 1 ? 'text-danger' : strength.score <= 2 ? 'text-warning' : strength.score <= 3 ? 'text-[#2563EB]' : 'text-success'
              }`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`pl-10 pr-10 h-10 ${
                confirmPassword && confirmPassword !== password
                  ? 'border-danger ring-1 ring-danger/20'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors pointer-events-auto"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && (
            <p className={`text-xs ${password === confirmPassword ? 'text-success' : 'text-danger'}`}>
              {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}
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
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}