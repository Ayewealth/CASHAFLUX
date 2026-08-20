import { useState } from 'react'
import { useNavigate } from 'react-router'

const plans = [
  { name: 'Free', monthly: '$0/mo', annual: null, features: ['5 clients', 'Invoicing', 'Expense tracking'], popular: false },
  { name: 'Pro', monthly: '$19/mo', annual: '$180/yr', features: ['Unlimited clients', 'Bank sync', 'Recurring invoices', 'Advanced reports'], popular: true },
  { name: 'Business', monthly: '$39/mo', annual: null, features: ['Everything in Pro', 'Team members (up to 5)', 'Payroll-ready exports', 'Priority support'], popular: false },
]

export default function Step4ChoosePlan() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(planName: string) {
    setLoading(true)
    setError('')
    try {
      const data = JSON.parse(sessionStorage.getItem('onboarding-step1') || '{}')
      const body = {
        businessName: data.businessName || '',
        businessType: data.businessType || 'sole_proprietor',
        industry: data.industry || '',
        fiscalYearStart: data.fiscalYearStart || 1,
        plan: planName.toLowerCase(),
      }
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to create organization')
      const json = await res.json()
      sessionStorage.removeItem('onboarding-step1')
      navigate(`/dashboard`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.name} onClick={() => setSelected(p.name.toLowerCase())} className={`cursor-pointer border rounded-xl p-6 text-center transition ${selected === p.name.toLowerCase() ? 'border-accent ring-2 ring-accent/20 bg-surface' : 'border-border hover:border-brand-blue'}`}>
            {p.popular && <span className="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-brand-blue rounded mb-2">Most Popular</span>}
            <h3 className="text-lg font-bold text-primary">{p.name}</h3>
            <p className="text-2xl font-bold text-text my-2">{p.monthly}</p>
            {p.annual && <p className="text-sm text-text-muted mb-3">{p.annual}</p>}
            <ul className="text-sm text-text-muted space-y-1 mt-4">
              {p.features.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-danger" aria-live="polite">{error}</p>}
      <div className="flex gap-3 justify-end">
        <button onClick={() => navigate('?step=3')} disabled={loading} className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-100 disabled:opacity-50">Back</button>
        <button onClick={() => handleSubmit(selected)} disabled={loading} className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">
          {loading ? 'Setting up...' : `Choose ${plans.find(p => p.name.toLowerCase() === selected)?.name}`}
        </button>
      </div>
    </div>
  )
}
