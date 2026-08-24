import { useState } from 'react'
import { Plus, Download, MoreHorizontal, DollarSign, Users, Calendar } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { DatePicker } from '../../components/ui/date-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { usePayroll, useCreatePayrollEntry, useDeletePayrollEntry } from '../../features/payroll/hooks'
import { toast } from '../../components/ui/toast'
import DataTable from '../../components/dashboard/DataTable'
import EmptyState from '../../components/dashboard/EmptyState'
import PageSkeleton from '../../components/dashboard/PageSkeleton'

const CURRENT_YEAR = new Date().getFullYear()

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export default function PayrollPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = usePayroll(year)
  const createEntry = useCreatePayrollEntry()
  const deleteEntry = useDeletePayrollEntry()

  const [name, setName] = useState('')
  const [payType, setPayType] = useState<'w2' | '1099'>('w2')
  const [payDate, setPayDate] = useState<Date>(new Date())
  const [grossAmount, setGrossAmount] = useState('')
  const [hours, setHours] = useState('')

  function resetForm() { setName(''); setPayType('w2'); setPayDate(new Date()); setGrossAmount(''); setHours('') }

  async function handleAdd() {
    if (!name.trim() || !grossAmount) { toast.add({ title: 'Name and gross amount required', type: 'error' }); return }
    await createEntry.mutateAsync({
      name: name.trim(), type: payType, payDate: payDate.toISOString(),
      grossAmount: parseFloat(grossAmount).toFixed(2), hours: hours ? parseFloat(hours).toFixed(1) : null, status: 'paid',
    })
    toast.add({ title: 'Payment recorded', type: 'success' })
    resetForm(); setShowAdd(false)
  }

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: ({ getValue }: any) => <span className="font-medium text-text">{getValue()}</span> },
    { header: 'Type', accessorKey: 'type', cell: ({ getValue }: any) => <span className="inline-flex items-center rounded-md bg-brand-blue-light/40 px-2 py-0.5 text-xs font-medium text-brand-navy">{(getValue() as string).toUpperCase()}</span> },
    { header: 'Pay Date', accessorKey: 'payDate', cell: ({ getValue }: any) => <span className="text-text-muted">{new Date(getValue()).toLocaleDateString()}</span> },
    { header: 'Gross Pay', accessorKey: 'grossAmount', cell: ({ getValue }: any) => <span className="font-mono tabular-nums font-medium">{fmt(parseFloat(getValue()))}</span> },
    { header: 'Hours', accessorKey: 'hours', cell: ({ getValue }: any) => <span className="text-text-muted">{getValue() || '—'}</span> },
    {
      header: '', accessorKey: 'id',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-text"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem className="text-danger" onClick={() => setDeleteId(row.original.id)}>Delete</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text tracking-tight">Payroll Export</h1><p className="text-sm text-text-muted mt-1">Record payments and export payroll-ready data</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5 border-border/50" onClick={() => { if (data?.entries.length) { const h = 'Name,Type,Pay Date,Gross Pay,Hours\n'; const c = data.entries.map(r => `"${r.name}",${r.type},${new Date(r.payDate).toISOString().split('T')[0]},${r.grossAmount},${r.hours ?? ''}`).join('\n'); const b = new Blob([h + c], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `payroll-${year}.csv`; a.click(); URL.revokeObjectURL(u) }}}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-1.5 bg-brand-navy hover:bg-brand-navy-light" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Payment</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl border border-border/50 bg-white p-5"><div className="h-12 w-full rounded bg-muted animate-pulse" /></div>)}</div>
      ) : data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/50 bg-white p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider font-mono">Employees</p>
            <p className="text-2xl font-bold text-text mt-1">{data.totalEmployees}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-white p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider font-mono">This Month</p>
            <p className="text-2xl font-bold text-text mt-1 tabular-nums">{fmt(data.mtdTotal)}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-white p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider font-mono">Year to Date</p>
            <p className="text-2xl font-bold text-brand-navy mt-1 tabular-nums">{fmt(data.ytdTotal)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Select value={String(year)} onValueChange={(v) => { if (v) setYear(parseInt(v)) }}>
          <SelectTrigger className="h-9 w-28 text-sm"><span>{year}</span></SelectTrigger>
          <SelectContent>{[CURRENT_YEAR, CURRENT_YEAR - 1].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : (data?.entries ?? []).length === 0 ? (
        <EmptyState icon={DollarSign} title="No payments recorded" description="Add your first payroll payment to get started." action={{ label: 'Add Payment', to: '#' }} />
      ) : (
        <DataTable columns={columns} data={data?.entries ?? []} emptyMessage="No payments recorded" />
      )}

      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) { resetForm(); setShowAdd(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Payment</DialogTitle><DialogDescription>Record an employee or contractor payment</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Type</Label><Select value={payType} onValueChange={(v) => v && setPayType(v as 'w2' | '1099')}><SelectTrigger className="h-10"><span>{payType.toUpperCase()}</span></SelectTrigger><SelectContent><SelectItem value="w2">W-2</SelectItem><SelectItem value="1099">1099</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Pay Date</Label><DatePicker value={payDate} onChange={(d) => d && setPayDate(d)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Gross Amount</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span><Input type="number" min="0" step="0.01" placeholder="0.00" value={grossAmount} onChange={(e) => setGrossAmount(e.target.value)} className="h-10 pl-7" /></div></div>
              <div className="space-y-1.5"><Label>Hours <span className="text-text-muted font-normal">(optional)</span></Label><Input type="number" min="0" step="0.5" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} className="h-10" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { resetForm(); setShowAdd(false) }}>Cancel</Button><Button onClick={handleAdd} disabled={!name.trim() || !grossAmount || createEntry.isPending}>{createEntry.isPending ? 'Saving...' : 'Record Payment'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { deleteEntry.mutate(deleteId!); setDeleteId(null) }} title="Delete payment?" description="This cannot be undone." confirmLabel="Delete" />
    </div>
  )
}