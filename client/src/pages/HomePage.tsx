export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="py-6 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Cashaflux</h1>
        <nav className="flex gap-4">
          <a href="/login" className="text-text-muted hover:text-text">Log in</a>
          <a href="/signup" className="px-4 py-2 bg-accent text-white rounded-lg">Start free</a>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-5xl font-bold text-primary mb-6">
          Simple accounting for American small businesses
        </h2>
        <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
          Invoicing, expense tracking, bank reconciliation, and tax-ready reports — all in one place.
        </p>
        <a
          href="/signup"
          className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-xl text-lg"
        >
          Start for free — no credit card required
        </a>
      </main>
    </div>
  )
}