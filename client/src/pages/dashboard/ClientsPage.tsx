import { useState } from 'react'
import { Search, MoreHorizontal, Mail, Phone, MapPin, Archive } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useClients, useArchiveClient } from '../../features/clients/hooks'
import { AddClientDialog } from '../../features/clients/AddClientDialog'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { Skeleton } from '../../components/ui/skeleton'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const { data: clients, isLoading } = useClients()
  const archiveClient = useArchiveClient()

  const filtered = (clients ?? []).filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Clients</h1>
          <p className="text-sm text-text-muted mt-1">Manage your client roster</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowAdd(true)}>
          <Mail className="h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        <input type="search" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5"><Skeleton className="h-32 w-full" /></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-text-muted text-sm">No clients found</p>
            <Button variant="outline" className="mt-3" onClick={() => setShowAdd(true)}>Add your first client</Button>
          </div>
        ) : (
          filtered.map((client) => (
            <div key={client.id} className="rounded-xl border border-border bg-surface p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm">
                  {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="relative group">
                  <button className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-text">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block w-36 rounded-xl border border-border bg-surface p-1 shadow-lg">
                    <button onClick={() => setArchiveId(client.id)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-danger hover:bg-danger/5 transition-colors">
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-text mb-1">{client.name}</h3>
              <div className="space-y-1.5 text-xs text-text-muted">
                {client.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {client.email}</span>}
                {client.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {client.phone}</span>}
                {client.city && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {client.city}{client.state ? `, ${client.state}` : ''}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <AddClientDialog open={showAdd} onClose={() => setShowAdd(false)} />

      <ConfirmDialog
        open={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={() => archiveId && archiveClient.mutate(archiveId)}
        title="Archive client?"
        description="The client will be hidden from active lists. Historical invoice data is retained."
        confirmLabel="Archive"
      />
    </div>
  )
}