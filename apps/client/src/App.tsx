import { useEffect, useState } from 'react'
import type { HealthResponse } from '@template/shared'

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<HealthResponse>)
      .then(setHealth)
      .catch((e: unknown) => setError(String(e)))
  }, [])

  return (
    <main>
      <h1>Fullstack Template</h1>
      {error !== null && <p>Error: {error}</p>}
      {health !== null && (
        <p>
          API health: <code>{JSON.stringify(health)}</code>
        </p>
      )}
      {health === null && error === null && <p>Checking API…</p>}
    </main>
  )
}
