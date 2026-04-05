import { useEffect, useState } from 'react'
import type { Post } from '@shared/schema'

export default function App() {
  const [health, setHealth] = useState<{ ok: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<{ ok: boolean }>)
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

// Example: Post type imported from shared schema (no runtime value needed here,
// but demonstrates that @shared/* resolves in client code)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _PostExample = Post
