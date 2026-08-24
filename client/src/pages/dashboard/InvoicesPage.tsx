import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Plus, Download, MoreHorizontal, FileText, Send, CheckCircle2, Clock, AlertCircle, DraftingCompass } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/utils'
import { useInvoices, useUpdateInvoice, useDeleteInvoice, useMarkPaid, useSendInvoice } from '../../features/invoices/hooks'
import { SendInvoiceDialog } from '../../features/invoices/SendInvoiceDialog'
import { useClients } from '../../features/clients/hooks'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { Skeleton } from '../../components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { DatePicker } from '../../components/ui/date-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DataTable from '../../components/dashboard/DataTable'
import FilterBar from '../../components/dashboard/FilterBar'
import ViewToggle from '../../components/dashboard/ViewToggle'
import EmptyState from '../../components/dashboard/EmptyState'
import PageSkeleton from '../../components/dashboard/PageSkeleton'

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  sent: 'bg-brand-navy/5 text-brand-navy border-brand-navy/20',
  draft: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-danger/10 text-danger border-danger/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  paid: CheckCircle2,
  sent: Send,
  draft: DraftingCompass,
  overdue: AlertCircle,
  cancelled: Clock,
}

const KANBAN_COLUMNS = ['draft', 'sent', 'paid', 'overdue']

function SortableInvoiceCard({ invoice, onEdit, onMarkPaid, onSend, onDelete }: {
  invoice: any; onEdit: () => void; onMarkPaid: () => void; onSend: () => void; onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: invoice.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`rounded-xl border border-border/50 bg-white p-4 space-y-2 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm ${isDragging ? 'opacity-50 shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/invoices/${invoice.id}/edit`} className="text-sm font-semibold text-text hover:text-brand-navy transition-colors" onClick={(e) => e.stopPropagation()}>
          {invoice.invoiceNumber}
        </Link>
        <Badge className={cn('text-[10px] px-1.5 py-0.5', STATUS_STYLES[invoice.status])}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </div>
      <p className="text-xs text-text-muted">{invoice.clientName}</p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-bold text-text font-mono tabular-nums">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(invoice.total))}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-text" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <DropdownMenuItem onClick={onMarkPaid}>Mark as Paid</DropdownMenuItem>
            )}
            {(invoice.status === 'draft' || invoice.status === 'sent') && (
              <DropdownMenuItem onClick={onSend}><Send className="h-3.5 w-3.5" /> Send</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-danger focus:text-danger focus:bg-danger/5">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sendId, setSendId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const { data: invoices, isLoading } = useInvoices(
    activeFilters.status ? { status: activeFilters.status } : undefined
  )
  const { data: clients } = useClients()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()
  const markPaid = useMarkPaid()
  const sendInvoice = useSendInvoice()

  const filtered = (invoices ?? []).filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  )

  const filterDefs = [
    {
      id: 'status', label: 'Status',
      render: (value: string, onChange: (v: string) => void) => (
        <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
          <SelectTrigger className="h-9 w-full">
            <span className="flex-1 text-left truncate text-sm">{value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All statuses'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: 'clientId', label: 'Client',
      render: (value: string, onChange: (v: string) => void) => (
        <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
          <SelectTrigger className="h-9 w-full">
            <span className="flex-1 text-left truncate text-sm">
              {value ? clients?.find((c) => c.id === value)?.name ?? 'Select...' : 'All clients'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All clients</SelectItem>
            {clients?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ]

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatCurrency(amount: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
  }

  async function handleExportCSV() {
    if (!invoices?.length) return
    const headers = 'Invoice,Client,Issue Date,Due Date,Amount,Status'
    const rows = invoices.map((inv) =>
      `${inv.invoiceNumber},${inv.clientName},${formatDate(inv.issueDate as any)},${formatDate(inv.dueDate as any)},${inv.total},${inv.status}`
    ).join('\n')
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'invoices.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleMarkPaid(id: string) {
    await markPaid.mutateAsync(id)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return
    const invId = active.id as string
    const invoice = invoices?.find((i) => i.id === invId)
    if (!invoice) return
    const targetStatus = over.id as string
    if (KANBAN_COLUMNS.includes(targetStatus) && targetStatus !== invoice.status) {
      updateInvoice.mutate({ id: invId, status: targetStatus } as any)
    }
  }

  const columns = [
    {
      header: 'Invoice', accessorKey: 'invoiceNumber',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-muted shrink-0" />
          <Link to={`/dashboard/invoices/${row.original.id}/edit`} className="font-medium text-text hover:text-brand-navy transition-colors">{row.original.invoiceNumber}</Link>
        </div>
      ),
    },
    { header: 'Client', accessorKey: 'clientName' },
    { header: 'Issue Date', accessorKey: 'issueDate', cell: ({ getValue }: any) => <span className="text-text-muted">{formatDate(getValue())}</span> },
    { header: 'Due Date', accessorKey: 'dueDate', cell: ({ getValue }: any) => <span className="text-text-muted">{formatDate(getValue())}</span> },
    { header: 'Amount', accessorKey: 'total', cell: ({ getValue }: any) => <span className="font-mono tabular-nums font-medium">{formatCurrency(getValue())}</span> },
    {
      header: 'Status', accessorKey: 'status',
      cell: ({ getValue }: any) => {
        const status = getValue() as string
        const Icon = STATUS_ICONS[status]
        return (
          <div className="flex justify-center">
            <Badge className={cn('text-[10px] px-2 py-0.5 gap-1', STATUS_STYLES[status])}>
              {Icon && <Icon className="w-3 h-3" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        )
      },
    },
    {
      header: '', accessorKey: 'id',
      cell: ({ row }: any) => {
        const inv = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-text">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => handleMarkPaid(inv.id)}>Mark as Paid</DropdownMenuItem>
              )}
              {(inv.status === 'draft' || inv.status === 'sent') && (
                <DropdownMenuItem onClick={() => setSendId(inv.id)}><Send className="h-3.5 w-3.5" /> Send</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate(`/dashboard/invoices/${inv.id}/edit`)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDeleteId(inv.id)} className="text-danger focus:text-danger focus:bg-danger/5">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Invoices</h1>
          <p className="text-sm text-text-muted mt-1">Manage and send invoices to your clients</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <Link to="/dashboard/invoices/new">
            <Button className="gap-1.5 bg-brand-navy hover:bg-brand-navy-light">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoices..."
        filters={filterDefs}
        activeFilters={activeFilters}
        onFilterChange={(id, value) => setActiveFilters((prev) => ({ ...prev, [id]: value }))}
        onClearFilters={() => setActiveFilters({})}
      />

      {isLoading ? (
        <PageSkeleton />
      ) : view === 'table' ? (
        <DataTable columns={columns} data={filtered} emptyMessage="No invoices found" />
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={(e: DragStartEvent) => setActiveDragId(e.active.id as string)} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {KANBAN_COLUMNS.map((status) => {
              const items = filtered.filter((i) => i.status === status)
              const Icon = STATUS_ICONS[status]
              return (
                <div key={status} className="shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    {Icon && <Icon className="w-4 h-4 text-text-muted" />}
                    <h3 className="text-sm font-semibold text-text capitalize">{status}</h3>
                    <span className="text-xs text-text-muted ml-auto font-mono">{items.length}</span>
                  </div>
                  <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-[200px] rounded-xl bg-surface/50 border border-border/50 p-3">
                      {items.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-6">No {status} invoices</p>
                      ) : (
                        items.map((inv) => (
                          <SortableInvoiceCard
                            key={inv.id}
                            invoice={inv}
                            onEdit={() => navigate(`/dashboard/invoices/${inv.id}/edit`)}
                            onMarkPaid={() => handleMarkPaid(inv.id)}
                            onSend={() => setSendId(inv.id)}
                            onDelete={() => setDeleteId(inv.id)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>
          <DragOverlay>
            {activeDragId && invoices?.find((i) => i.id === activeDragId) ? (
              <div className="rounded-xl border border-brand-navy/30 bg-white p-4 shadow-lg opacity-90">
                <p className="text-sm font-semibold text-text">{invoices.find((i) => i.id === activeDragId)?.invoiceNumber}</p>
                <p className="text-xs text-text-muted">{invoices.find((i) => i.id === activeDragId)?.clientName}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteInvoice.mutate(deleteId)}
        title="Delete invoice?"
        description="This action cannot be undone. All line items will also be deleted."
        confirmLabel="Delete"
      />

      {sendId && (
        <SendInvoiceDialog
          open={!!sendId}
          onClose={() => setSendId(null)}
          invoiceId={sendId}
          invoiceNumber={invoices?.find((i) => i.id === sendId)?.invoiceNumber ?? ''}
          clientEmail={invoices?.find((i) => i.id === sendId)?.clientEmail ?? null}
          clientName={invoices?.find((i) => i.id === sendId)?.clientName ?? ''}
        />
      )}
    </div>
  )
}