import { Outlet } from 'react-router'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-64 bg-primary text-white p-4">
        <h2 className="text-xl font-bold mb-8">Cashaflux</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-white/10">Dashboard</a>
          <a href="/dashboard/invoices" className="block px-3 py-2 rounded hover:bg-white/10">Invoices</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}