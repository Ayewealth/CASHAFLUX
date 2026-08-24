import { type ReactNode } from 'react'
import {
  flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  useReactTable, type ColumnDef, type SortingState, type ColumnSort,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

export default function DataTable<T>({
  columns, data, onRowClick, emptyMessage = 'No results found', className = '',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className={`rounded-xl border border-border/50 overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg: any) => (
            <TableRow key={hg.id} className="bg-surface border-b-2 border-brand-navy/10">
              {hg.headers.map((header: any) => (
                <TableHead
                  key={header.id}
                  className="text-[11px] uppercase tracking-widest font-mono text-text-muted py-3.5 px-4"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-text transition-colors">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <ArrowUpDown className="w-3 h-3 text-text-muted/40" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-12 text-center">
                <p className="text-sm text-text-muted">{emptyMessage}</p>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                className="hover:bg-brand-navy/[0.02] transition-colors duration-150 border-b border-border/40"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id} className="py-3.5 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}