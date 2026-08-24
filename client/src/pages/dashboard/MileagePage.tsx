import { useState } from 'react'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useMileageLogs, useDeleteMileageLog } from '../../features/mileage/hooks'
import { LogTripDialog } from '../../features/mileage/LogTripDialog'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { Skeleton } from '../../components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

export default function MileagePage() {
  const [showLogTrip, setShowLogTrip] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useMileageLogs()
  const deleteMileage = useDeleteMileageLog()

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const logs = data?.logs ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Mileage Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Log business trips at the IRS standard mileage rate</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowLogTrip(true)}>
          <Plus className="h-4 w-4" /> Log Trip
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Miles</p>
            <p className="text-2xl font-bold text-text mt-1">{data.totalMiles.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estimated Deduction</p>
            <p className="text-2xl font-bold text-success mt-1">${data.totalDeduction.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">IRS Rate</p>
            <p className="text-2xl font-bold text-text mt-1">$0.70/mi</p>
            <p className="text-xs text-muted-foreground mt-0.5">2025 standard mileage rate</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Origin</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Destination</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Miles</TableHead>
              <TableHead className="text-xs uppercase tracking-wider hidden md:table-cell">Purpose</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6} className="py-3"><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No trips logged yet</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="text-text">{formatDate(log.date)}</TableCell>
                  <TableCell className="font-medium text-text">{log.origin}</TableCell>
                  <TableCell className="font-medium text-text">{log.destination}</TableCell>
                  <TableCell className="text-right font-medium text-text">{log.miles}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell text-sm">{log.purpose || '—'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-text">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="text-danger focus:text-danger" onClick={() => setDeleteId(log.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {logs.length} trips</p>
        </div>
      </div>

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