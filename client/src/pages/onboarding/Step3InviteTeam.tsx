import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, X } from 'lucide-react'

export default function Step3InviteTeam() {
  const navigate = useNavigate()
  const [emails, setEmails] = useState<string[]>([''])

  function addEmail() {
    setEmails([...emails, ''])
  }

  function removeEmail(index: number) {
    setEmails(emails.filter((_, i) => i !== index))
  }

  function updateEmail(index: number, value: string) {
    const next = [...emails]
    next[index] = value
    setEmails(next)
  }

  return (
    <div className="space-y-4">
      {emails.map((email, index) => (
        <div key={index} className="flex gap-2">
          <input type="email" placeholder={`Colleague's email`} value={email} onChange={e => updateEmail(index, e.target.value)} aria-label={`Email ${index + 1}`} className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          {emails.length > 1 && (
            <button type="button" onClick={() => removeEmail(index)} aria-label={`Remove email ${index + 1}`} className="text-text-muted hover:text-danger">
              <X size={20} />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addEmail} className="flex items-center gap-1 text-sm text-accent hover:underline">
        <Plus size={16} /> Add another
      </button>
      <div className="pt-2 flex gap-3">
        <button onClick={() => navigate('?step=4')} className="px-4 py-2 border border-border rounded-lg hover:bg-neutral-100">Back</button>
        <button onClick={() => navigate('?step=4')} className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue">Next</button>
        <span className="ml-auto"><a href="#" onClick={e => { e.preventDefault(); navigate('/dashboard') }} className="text-sm text-text-muted hover:text-text">Skip this step</a></span>
      </div>
    </div>
  )
}
