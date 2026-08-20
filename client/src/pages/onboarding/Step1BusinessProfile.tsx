import { useState } from 'react'
import { useNavigate } from 'react-router'

export default function Step1BusinessProfile() {
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('sole_proprietor')
  const [industry, setIndustry] = useState('')
  const [fiscalYearStart, setFiscalYearStart] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!businessName.trim()) {
      setError('Business name is required.')
      return
    }
    setError('')
    setLoading(true)
    // Store step data in sessionStorage for later submission
    sessionStorage.setItem('onboarding-step1', JSON.stringify({ businessName, businessType, industry, fiscalYearStart }))
    setLoading(false)
    navigate('?step=2')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-text mb-1">Business Name <span className="text-danger">*</span></label>
        <input id="businessName" type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Acme Corp" className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-text mb-1">Business Type</label>
        <select id="businessType" value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="sole_proprietor">Sole Proprietor</option>
          <option value="llc">LLC</option>
          <option value="s_corp">S-Corp</option>
          <option value="c_corp">C-Corp</option>
          <option value="partnership">Partnership</option>
        </select>
      </div>
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-text mb-1">Industry</label>
        <input id="industry" type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Retail, Consulting" className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label htmlFor="fiscalYearStart" className="block text-sm font-medium text-text mb-1">Tax Year Start Month</label>
        <select id="fiscalYearStart" value={fiscalYearStart} onChange={e => setFiscalYearStart(parseInt(e.target.value))} className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-danger" aria-live="polite">{error}</p>}
      <button type="submit" disabled={loading} className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">Next</button>
    </form>
  )
}
