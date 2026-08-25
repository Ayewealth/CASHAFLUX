import { useState } from 'react'
import { Search, MoreHorizontal, Mail, Phone, MapPin, Archive, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useClients, useArchiveClient } from '../../features/clients/hooks'
import { AddClientDialog } from '../../features/clients/AddClientDialog'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { Skeleton } from '../../components/ui/skeleton'
import DataTable from '../../components/dashboard/DataTable'
import ViewToggle from '../../components/dashboard/ViewToggle'
import EmptyState from '../../components/dashboard/EmptyState'
import PageSkeleton from '../../components/dashboard/PageSkeleton'
import { useSubscriptionStatus } from '../../features/subscription/hooks'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table' | 'grid'>('grid')
  const [showAdd, setShowAdd] = useState(false)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const { data: clients, isLoading } = useClients()
  const archiveClient = useArchiveClient()
  const { data: subscription } = useSubscriptionStatus()
  const isFree = (subscription?.plan ?? 'free') === 'free'

  const filtered = (clients ?? []).filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: ({ row }: any) => <span className="font-medium text-text">{row.original.name}</span> },
    { header: 'Email', accessorKey: 'email', cell: ({ getValue }: any) => <span className="text-text-muted">{getValue() || '—'}</span> },
    { header: 'Phone', accessorKey: 'phone', cell: ({ getValue }: any) => <span className="text-text-muted">{getValue() || '—'}</span> },
    { header: 'Location', accessorKey: 'city', cell: ({ row }: any) => <span className="text-text-muted">{row.original.city ? `${row.original.city}${row.original.state ? `, ${row.original.state}` : ''}` : '—'}</span> },
    {
      header: '', accessorKey: 'id',
      cell: ({ row }: any) => (
        <button onClick={() => setArchiveId(row.original.id)} className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-danger">
          <Archive className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Clients</h1>
          <p className="text-sm text-text-muted mt-1">Manage your client roster</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          {isFree && (
            <span className="text-xs text-text-muted bg-muted rounded-full px-2.5 py-1 font-medium">Free: 5 client limit</span>
          )}
          <Button className="gap-1.5 bg-brand-navy hover:bg-brand-navy-light" onClick={() => setShowAdd(true)}>
            <Mail className="h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>

      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        <Input
          type="search" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No clients found" description="Add your first client to get started." action={{ label: 'Add Client', to: '#' }} />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="rounded-xl border border-border/50 bg-white p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy/5 text-brand-navy font-semibold text-sm">
                  {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <button onClick={() => setArchiveId(client.id)} className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-danger">
                  <Archive className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-semibold text-text mb-1">{client.name}</h3>
              <div className="space-y-1.5 text-xs text-text-muted">
                {client.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {client.email}</span>}
                {client.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {client.phone}</span>}
                {client.city && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {client.city}{client.state ? `, ${client.state}` : ''}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} emptyMessage="No clients found" />
      )}

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