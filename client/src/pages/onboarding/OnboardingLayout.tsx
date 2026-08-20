import { Outlet, Link, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'

export default function OnboardingLayout() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const [step, setStep] = useState(() => {
    const s = parseInt(params.get('step') || '1')
    return s < 1 ? 1 : s > 4 ? 4 : s
  })

  useEffect(() => {
    if (step >= 1 && step <= 4) {
      navigate(`/onboarding${step === 1 ? '' : '?step=' + step}`, { replace: true })
    }
  }, [step, navigate])

  const steps = ['Business Profile', 'Currency & Locale', 'Invite Team', 'Choose Plan']

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-surface">
        <Link to="/dashboard" className="text-xl font-bold text-primary">Cashaflux</Link>
        <Link to="/dashboard" className="text-sm text-accent hover:underline">Skip to Dashboard</Link>
      </header>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-8 pt-8 pb-4">
        <nav aria-label="Onboarding progress">
          <ol className="flex items-center space-x-2">
            {steps.map((label, i) => {
              const n = i + 1
              const isActive = n === step
              const isCompleted = n < step
              return (
                <li key={label} className="flex items-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${isActive ? 'bg-accent text-white' : isCompleted ? 'bg-success text-white' : 'bg-neutral-100 text-text-muted border border-border'}`}>
                    {isCompleted ? '✓' : n}
                  </span>
                  <span className={`ml-2 text-sm hidden sm:block ${isActive ? 'text-text font-medium' : 'text-text-muted'}`}>{label}</span>
                  {i < steps.length - 1 && <span className="mx-3 text-text-muted">/</span>}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <main className="max-w-3xl mx-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}
