import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Plus, Search, Download, MoreHorizontal, FileText, X, SlidersHorizontal, Send } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { useInvoices, useUpdateInvoice, useDeleteInvoice, useMarkPaid, useSendInvoice } from '../../features/invoices/hooks'
import { SendInvoiceDialog } from '../../features/invoices/SendInvoiceDialog'
import { useClients } from '../../features/clients/hooks'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { Skeleton } from '../../components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { DatePicker } from '../../components/ui/date-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  sent: 'bg-accent/10 text-accent border-accent/20',
  draft: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-danger/10 text-danger border-danger/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<{ status: string; clientId: string; dateFrom: Date | undefined; dateTo: Date | undefined }>({
    status: '', clientId: '', dateFrom: undefined, dateTo: undefined,
  })
  const [activeFilters, setActiveFilters] = useState<typeof filters>({ status: '', clientId: '', dateFrom: undefined, dateTo: undefined })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data: invoices, isLoading } = useInvoices(
    activeFilters.status ? { status: activeFilters.status } :
    activeFilters.clientId ? { clientId: activeFilters.clientId } :
    activeFilters.dateFrom || activeFilters.dateTo ? { dateFrom: activeFilters.dateFrom?.toISOString().split('T')[0], dateTo: activeFilters.dateTo?.toISOString().split('T')[0] } :
    undefined
  )
  const { data: clients } = useClients()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()
  const markPaid = useMarkPaid()
  const sendInvoice = useSendInvoice()
  const [sendId, setSendId] = useState<string | null>(null)

  const filtered = (invoices ?? []).filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  )

  const activeFilterCount = [activeFilters.status, activeFilters.clientId, activeFilters.dateFrom, activeFilters.dateTo].filter(Boolean).length

  function formatCurrency(amount: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function applyFilters() {
    setActiveFilters({ ...filters })
    setShowFilter(false)
  }

  function clearFilters() {
    setFilters({ status: '', clientId: '', dateFrom: undefined, dateTo: undefined })
    setActiveFilters({ status: '', clientId: '', dateFrom: undefined, dateTo: undefined })
  }

  function removeFilter(key: keyof typeof activeFilters) {
    const updated = { ...activeFilters, [key]: key === 'dateFrom' || key === 'dateTo' ? undefined : '' }
    setActiveFilters(updated)
    setFilters(updated)
  }

  async function handleMarkPaid(id: string) {
    await markPaid.mutateAsync(id)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Invoices</h1>
          <p className="text-sm text-text-muted mt-1">Manage and send invoices to your clients</p>
        </div>
        <Link to="/dashboard/invoices/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5 h-10 relative"
            onClick={() => setShowFilter(!showFilter)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-white/20 text-[10px] font-bold px-1">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-10" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {showFilter && (
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-danger transition-colors">Clear all</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v ?? '' })}>
                  <SelectTrigger className="h-9 w-full">
                    <span className="flex-1 text-left truncate text-sm">{filters.status ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1) : 'All statuses'}</span>
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
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Client</label>
                <Select value={filters.clientId} onValueChange={(v) => setFilters({ ...filters, clientId: v ?? '' })}>
                  <SelectTrigger className="h-9 w-full">
                    <span className="flex-1 text-left truncate text-sm">
                      {filters.clientId ? clients?.find((c) => c.id === filters.clientId)?.name ?? 'Select...' : 'All clients'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All clients</SelectItem>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <DatePicker value={filters.dateFrom} onChange={(d) => setFilters({ ...filters, dateFrom: d })} placeholder="From date" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <DatePicker value={filters.dateTo} onChange={(d) => setFilters({ ...filters, dateTo: d })} placeholder="To date" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear</Button>
              <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.status && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
                Status: {activeFilters.status.charAt(0).toUpperCase() + activeFilters.status.slice(1)}
                <button onClick={() => removeFilter('status')} className="hover:text-accent/80"><X className="h-3 w-3" /></button>
              </span>
            )}
            {activeFilters.clientId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
                Client: {clients?.find((c) => c.id === activeFilters.clientId)?.name}
                <button onClick={() => removeFilter('clientId')} className="hover:text-accent/80"><X className="h-3 w-3" /></button>
              </span>
            )}
            {activeFilters.dateFrom && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
                From: {formatDate(activeFilters.dateFrom.toISOString())}
                <button onClick={() => removeFilter('dateFrom')} className="hover:text-accent/80"><X className="h-3 w-3" /></button>
              </span>
            )}
            {activeFilters.dateTo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
                To: {formatDate(activeFilters.dateTo.toISOString())}
                <button onClick={() => removeFilter('dateTo')} className="hover:text-accent/80"><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs uppercase tracking-wider">Invoice</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Client</TableHead>
              <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Issue Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Due Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Amount</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7} className="py-3"><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No invoices found</TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Link to={`/dashboard/invoices/${inv.id}/edit`} className="font-medium text-text hover:text-accent transition-colors">{inv.invoiceNumber}</Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-text">{inv.clientName}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{formatDate(inv.issueDate as any)}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(inv.dueDate as any)}</TableCell>
                  <TableCell className="text-right font-medium text-text">{formatCurrency(inv.total)}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn('text-[10px] px-2 py-0.5', STATUS_STYLES[inv.status])}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-text">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} invoices</p>
        </div>
      </div>

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