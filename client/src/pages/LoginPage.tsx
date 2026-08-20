import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'

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
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1">Password</label>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          {error && <p className="text-sm text-danger" aria-live="polite">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2 text-sm">
          <Link to="/forgot-password" className="text-accent hover:underline block">Forgot password?</Link>
          <Link to="/signup" className="text-text-muted hover:text-text block">Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  )
}
