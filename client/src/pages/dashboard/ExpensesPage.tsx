import { useState } from 'react'
import { Plus, Search, Download, MoreHorizontal, Receipt, X, ArrowUpDown, Trash2, CheckSquare, Square } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { useExpenses, useDeleteExpense, useBulkDeleteExpenses, useExpenseCategories } from '../../features/expenses/hooks'
import { LogExpenseDialog } from '../../features/expenses/LogExpenseDialog'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { Skeleton } from '../../components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { DatePicker } from '../../components/ui/date-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import FilterBar from '../../components/dashboard/FilterBar'
import EmptyState from '../../components/dashboard/EmptyState'
import PageSkeleton from '../../components/dashboard/PageSkeleton'
import type { Expense } from '@shared/schema'

type SortField = 'date' | 'merchant' | 'category' | 'amount'
type SortDir = 'asc' | 'desc'

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500',
  'bg-cyan-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500',
  'bg-lime-500', 'bg-red-500', 'bg-purple-500', 'bg-sky-500',
]

function categoryColor(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

export default function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [showLogExpense, setShowLogExpense] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  const filters = {
    ...(categoryFilter && { category: categoryFilter }),
    ...(statusFilter && { reconciled: statusFilter }),
    ...(dateFrom && { dateFrom: dateFrom.toISOString() }),
    ...(dateTo && { dateTo: dateTo.toISOString() }),
    ...(amountMin && { amountMin }),
    ...(amountMax && { amountMax }),
    ...(search && { search }),
  }
  const { data: expenses, isLoading } = useExpenses(filters)
  const deleteExpense = useDeleteExpense()
  const bulkDeleteExpenses = useBulkDeleteExpenses()
  const { data: categories } = useExpenseCategories()

  const sorted = [...(expenses ?? [])].sort((a, b) => {
    let cmp = 0
    if (sortField === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
    else if (sortField === 'merchant') cmp = a.merchant.localeCompare(b.merchant)
    else if (sortField === 'category') cmp = a.category.localeCompare(b.category)
    else if (sortField === 'amount') cmp = parseFloat(a.amount) - parseFloat(b.amount)
    return sortDir === 'asc' ? cmp : -cmp
  })

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function toggleSelectAll() {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sorted.map((e) => e.id)))
    }
  }

  function formatCurrency(amount: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount))
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function SortHeader({ field, label, className }: { field: SortField; label: string; className?: string }) {
    const active = sortField === field
    return (
      <TableHead
        className={cn('text-xs uppercase tracking-wider cursor-pointer select-none hover:text-text', className)}
        onClick={() => toggleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown className={cn('h-3 w-3', active ? 'text-accent' : 'text-muted-foreground/50')} />
        </span>
      </TableHead>
    )
  }

  const catOpts = categories ?? []
  const showDateFilter = !!dateFrom || !!dateTo
  const showAmountFilter = !!amountMin || !!amountMax
  const activeFilterCount = (categoryFilter ? 1 : 0) + (statusFilter ? 1 : 0) + (showDateFilter ? 1 : 0) + (showAmountFilter ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and categorize your business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setShowBulkDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete {selectedIds.size}
            </Button>
          )}
          <Button className="gap-1.5" onClick={() => setShowLogExpense(true)}>
            <Plus className="h-4 w-4" /> Log Expense
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input type="search" placeholder="Search merchant or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v ?? ''); setStatusFilter('') }}>
          <SelectTrigger className="h-10 w-36">
            <span className="flex-1 text-left truncate text-sm">{categoryFilter || 'Category'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {catOpts.map((cat: { name: string }) => (<SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? ''); setCategoryFilter('') }}>
          <SelectTrigger className="h-10 w-32">
            <span className="flex-1 text-left truncate text-sm">{statusFilter === 'true' ? 'Reconciled' : statusFilter === 'false' ? 'Unreconciled' : 'Status'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="true">Reconciled</SelectItem>
            <SelectItem value="false">Unreconciled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className={`gap-1.5 h-10 ${showFilters ? 'bg-accent/10' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 h-10" onClick={() => {
          if (expenses?.length) {
            const headers = 'Date,Merchant,Category,Amount,Reconciled,Description'
            const rows = sorted.map((exp) =>
              `${formatDate(exp.date)},"${exp.merchant}","${exp.category}",${exp.amount},${exp.reconciled ? 'Yes' : 'No'},"${(exp.description ?? '').replace(/"/g, '""')}"`
            ).join('\n')
            const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'expenses.csv'; a.click()
            URL.revokeObjectURL(url)
          }
        }}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date from</Label>
              <DatePicker value={dateFrom} onChange={(d) => setDateFrom(d)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date to</Label>
              <DatePicker value={dateTo} onChange={(d) => setDateTo(d)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min amount</Label>
              <Input type="number" min="0" step="0.01" placeholder="$0" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Max amount</Label>
              <Input type="number" min="0" step="0.01" placeholder="$9999" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(undefined); setDateTo(undefined); setAmountMin(''); setAmountMax('') }}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          {categoryFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
              {statusFilter === 'true' ? 'Reconciled' : 'Unreconciled'}
              <button onClick={() => setStatusFilter('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {showDateFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
              Date range
              <button onClick={() => { setDateFrom(undefined); setDateTo(undefined) }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {showAmountFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1">
              Amount range
              <button onClick={() => { setAmountMin(''); setAmountMax('') }}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-8">
                <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-muted transition-colors">
                  {selectedIds.size === sorted.length && sorted.length > 0 ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                </button>
              </TableHead>
              <SortHeader field="date" label="Date" />
              <SortHeader field="merchant" label="Merchant" />
              <SortHeader field="category" label="Category" className="hidden sm:table-cell" />
              <SortHeader field="amount" label="Amount" className="text-right" />
              <TableHead className="text-xs uppercase tracking-wider text-center hidden md:table-cell">Receipt</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-center hidden md:table-cell">Reconciled</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={8} className="py-3"><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="p-0 border-0">
                <EmptyState icon={Receipt} title="No expenses found" description="Log your first expense to start tracking." action={{ label: 'Log Expense', to: '/dashboard/expenses/new' }} />
              </TableCell></TableRow>
            ) : (
              sorted.map((exp) => (
                <TableRow key={exp.id} className="hover:bg-muted/30">
                  <TableCell className="py-2">
                    <button onClick={() => toggleSelect(exp.id)} className="p-0.5 rounded hover:bg-muted transition-colors">
                      {selectedIds.has(exp.id) ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-text">{formatDate(exp.date)}</TableCell>
                  <TableCell className="font-medium text-text">{exp.merchant}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${categoryColor(exp.category)}`} />
                      <span className="rounded-md bg-brand-blue-light/40 px-2 py-0.5 text-xs font-medium text-brand-navy">{exp.category}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-text">{formatCurrency(exp.amount)}</TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {exp.receiptR2Key ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent"><Receipt className="h-3.5 w-3.5" /> Attached</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {exp.reconciled ? (
                      <span className="text-xs text-success font-medium">Yes</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-text">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditExpense(exp)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-danger focus:text-danger" onClick={() => setDeleteId(exp.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {sorted.length} expenses</p>
          {selectedIds.size > 0 && (
            <p className="text-xs text-accent font-medium">{selectedIds.size} selected</p>
          )}
        </div>
      </div>

      <LogExpenseDialog open={showLogExpense} onClose={() => setShowLogExpense(false)} />
      <LogExpenseDialog open={!!editExpense} onClose={() => setEditExpense(null)} expense={editExpense} />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteExpense.mutate(deleteId!); setDeleteId(null) }}
        title="Delete expense?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={() => { bulkDeleteExpenses.mutate(Array.from(selectedIds)); setSelectedIds(new Set()); setShowBulkDelete(false) }}
        title={`Delete ${selectedIds.size} expenses?`}
        description="This action cannot be undone."
        confirmLabel={`Delete ${selectedIds.size}`}
      />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn('text-sm font-medium text-text', className)}>{children}</label>
}