import { useState } from 'react'
import { Link } from 'react-router'
import { authClient } from '../lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    const result = await authClient.requestPasswordReset({ email })
    setLoading(false)
    if (result?.error) {
      setError('An error occurred. Please try again.')
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Forgot password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          {error && <p className="text-sm text-danger" aria-live="polite">{error}</p>}
          {success && (
            <p className="text-sm text-success" aria-live="polite">Check your email for a reset link.</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <footer className="mt-4 text-center">
          <Link to="/login" className="text-accent hover:underline text-sm">Back to log in</Link>
        </footer>
      </div>
    </div>
  )
}
