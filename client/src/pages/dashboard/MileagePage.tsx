import { useState } from 'react'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useMileageLogs, useDeleteMileageLog } from '../../features/mileage/hooks'
import { LogTripDialog } from '../../features/mileage/LogTripDialog'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import DataTable from '../../components/dashboard/DataTable'
import EmptyState from '../../components/dashboard/EmptyState'
import PageSkeleton from '../../components/dashboard/PageSkeleton'

export default function MileagePage() {
  const [showLogTrip, setShowLogTrip] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useMileageLogs()
  const deleteMileage = useDeleteMileageLog()

  const logs = data?.logs ?? []

  const columns = [
    { header: 'Date', accessorKey: 'date', cell: ({ getValue }: any) => new Date(getValue()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { header: 'Origin', accessorKey: 'origin' },
    { header: 'Destination', accessorKey: 'destination' },
    { header: 'Miles', accessorKey: 'miles', cell: ({ getValue }: any) => <span className="font-mono tabular-nums font-medium">{getValue()}</span> },
    { header: 'Purpose', accessorKey: 'purpose', cell: ({ getValue }: any) => <span className="text-text-muted">{getValue() || '—'}</span> },
    {
      header: '', accessorKey: 'id',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-text"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="text-danger" onClick={() => setDeleteId(row.original.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Mileage Tracker</h1>
          <p className="text-sm text-text-muted mt-1">Log business trips at the IRS standard mileage rate</p>
        </div>
        <Button className="gap-1.5 bg-brand-navy hover:bg-brand-navy-light" onClick={() => setShowLogTrip(true)}>
          <Plus className="h-4 w-4" /> Log Trip
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/50 bg-white p-5 hover:shadow-sm transition-shadow">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-mono">Total Miles</p>
            <p className="text-2xl font-bold text-text mt-1 tabular-nums">{data.totalMiles.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-white p-5 hover:shadow-sm transition-shadow">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-mono">Estimated Deduction</p>
            <p className="text-2xl font-bold text-success mt-1 tabular-nums">${data.totalDeduction.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-white p-5 hover:shadow-sm transition-shadow">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-mono">IRS Rate</p>
            <p className="text-2xl font-bold text-text mt-1 tabular-nums">$0.70/mi</p>
            <p className="text-xs text-text-muted mt-0.5">2025 standard mileage rate</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <PageSkeleton rows={3} />
      ) : logs.length === 0 ? (
        <EmptyState icon={Trash2} title="No trips logged yet" description="Log your first business trip to track mileage deductions." action={{ label: 'Log Trip', to: '#' }} />
      ) : (
        <DataTable columns={columns} data={logs} emptyMessage="No trips logged yet" />
      )}

      <LogTripDialog open={showLogTrip} onClose={() => setShowLogTrip(false)} />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMileage.mutate(deleteId!); setDeleteId(null) }}
        title="Delete trip?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}