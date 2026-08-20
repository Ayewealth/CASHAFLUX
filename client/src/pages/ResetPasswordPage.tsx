import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    const paramToken = new URLSearchParams(window.location.search).get('token')
    if (!paramToken) {
      setTokenError('No reset token found. Please request a new password reset.')
    } else {
      setToken(paramToken)
    }
  }, [])

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
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">Reset password</h1>
          <p className="text-sm text-danger" aria-live="polite">{tokenError}</p>
          <footer className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="text-accent hover:underline block text-sm">Request a new reset link</Link>
            <Link to="/login" className="text-text-muted hover:text-text block text-sm">Back to log in</Link>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Reset password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1">New password</label>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">Confirm password</label>
            <input id="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          {(error || tokenError) && <p className="text-sm text-danger" aria-live="polite">{error || tokenError}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <footer className="mt-4 text-center space-y-2">
          <Link to="/forgot-password" className="text-accent hover:underline block text-sm">Request a new reset link</Link>
          <Link to="/login" className="text-text-muted hover:text-text block text-sm">Back to log in</Link>
        </footer>
      </div>
    </div>
  )
}
