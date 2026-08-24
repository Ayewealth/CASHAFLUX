import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

function getPasswordStrength(password: string): PasswordStrength {
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

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const paramToken = new URLSearchParams(window.location.search).get('token')
    if (!paramToken) {
      setTokenError('No reset token found. Please request a new password reset.')
    } else {
      setToken(paramToken)
    }
  }, [])

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!token) {
      setTokenError('Missing reset token.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const result = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (result?.error) {
      setError('Link expired or invalid. Please request a new one.')
    } else {
      navigate('/login', { replace: true })
    }
  }

  if (tokenError) {
    return (
      <AuthLayout
        heading="Reset your password"
        subheading={tokenError}
        brandContent={{
          headline: 'One strong password is all it takes',
          body: 'Your account security matters. Use a unique password you do not share with any other service.',
          badges: ['Encrypted at rest', 'AES-256 encryption'],
        }}
      >
        <div className="space-y-3">
          <Link to="/forgot-password" className="block">
            <Button size="lg" className="w-full">Request new reset link</Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="ghost" size="lg" className="w-full">Back to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      heading="Set a new password"
      subheading="Create a strong password that you do not use elsewhere."
      brandContent={{
        headline: 'One strong password is all it takes',
        body: 'Your account security matters. Use a unique password you do not share with any other service.',
        badges: ['Encrypted at rest', 'AES-256 encryption'],
      }}
      backLink={{ to: '/forgot-password', label: 'Back to forgot password' }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">New password</Label>
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
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <Input
              id="confirmPassword"
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
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-text-muted">
        Need help? <Link to="/contact" className="text-accent font-medium hover:underline">Contact support</Link>
      </p>
    </AuthLayout>
  )
}