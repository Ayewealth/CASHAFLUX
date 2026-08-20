import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'

function isValidPassword(p: string): boolean {
  return p.length >= 8 && /\d/.test(p)
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isValidPassword(password)) {
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
    setSuccess('Check your email to verify your account.')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">Check your email</h1>
          <p className="text-text-muted text-center">{success}</p>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-accent hover:underline block">Back to log in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Create an account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1">Full name</label>
            <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-text mb-1">Email</label>
            <input id="signup-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1">Password</label>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text mb-1">Confirm password</label>
            <input id="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          {error && <p className="text-sm text-danger" aria-live="polite">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-text-muted hover:text-text block">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  )
}
