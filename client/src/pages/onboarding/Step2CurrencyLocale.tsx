import { useNavigate } from 'react-router'

export default function Step2CurrencyLocale() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <p className="text-text-muted mb-1">Currency</p>
        <p className="text-2xl font-bold text-primary">USD</p>
        <hr className="my-4" />
        <p className="text-text-muted mb-1">Locale</p>
        <p className="text-2xl font-bold text-primary">United States</p>
      </div>
      <p className="text-sm text-text-muted">These settings can be changed later in Settings.</p>
      <div className="flex gap-3">
        <button onClick={() => navigate('?step=1')} className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-100">Back</button>
        <button onClick={() => navigate('?step=3')} className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue">Confirm &amp; Continue</button>
      </div>
    </div>
  )
}
