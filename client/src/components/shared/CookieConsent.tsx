import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'cashaflux-cookie-consent'

type ConsentChoice = 'accepted' | 'rejected' | null

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [choice, setChoice] = useState<ConsentChoice>(null)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentChoice
    if (stored === 'accepted' || stored === 'rejected') {
      setChoice(stored)
    } else {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setChoice('accepted')
    setVisible(false)
  }

  function handleReject() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setChoice('rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface/95 backdrop-blur-md shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text mb-1">This site uses cookies</p>
          <p className="text-xs text-text-muted">
            We use essential cookies for authentication and security. No tracking or analytics cookies are used.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text rounded-lg hover:bg-muted transition-colors"
          >
            Reject all
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
          >
            Accept all
          </button>
          <button
            onClick={handleReject}
            className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-muted transition-colors"
            aria-label="Close cookie consent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}