import { useState } from 'react'
import { AlertTriangle, Calendar, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Skeleton } from '../../components/ui/skeleton'
import { useTaxSummary, useTaxExport } from '../../features/reports/hooks'
import { toast } from '../../components/ui/toast'

const CURRENT_YEAR = new Date().getFullYear()

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export default function TaxCentrePage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [showCategories, setShowCategories] = useState(false)
  const { data, isLoading } = useTaxSummary(year)
  const { data: exportData, refetch: fetchExport } = useTaxExport(year)

  async function handleExport() {
    const result = await fetchExport()
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `tax-export-${year}.csv`; a.click()
      URL.revokeObjectURL(url)
      toast.add({ title: 'Tax export downloaded', type: 'success' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Tax Centre</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay on top of your tax obligations</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(year)} onValueChange={(v) => v && setYear(parseInt(v))}>
            <SelectTrigger className="h-9 w-28 text-sm">
              <span>{year}</span>
            </SelectTrigger>
            <SelectContent>
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-1.5" onClick={handleExport} disabled={isLoading}>
            <Download className="h-4 w-4" /> Tax-Ready Export
          </Button>
        </div>
      </div>

      {/* Summary KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-12 w-full" /></CardContent></Card>)}
        </div>
      ) : data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Income</p>
              <p className="text-2xl font-bold text-success mt-1">{fmt(data.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Expenses</p>
              <p className="text-2xl font-bold text-danger mt-1">{fmt(data.totalExpenses)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Net Income</p>
              <p className={`text-2xl font-bold mt-1 ${data.netIncome >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(data.netIncome)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quarterly deadlines + 1099 section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-text">Quarterly Estimated Tax Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data?.quarterlyDeadlines.map((q) => (
                  <div key={q.quarter} className={`rounded-xl border p-4 text-center ${
                    q.status === 'past' ? 'border-border bg-surface opacity-60' :
                    q.status === 'upcoming' ? 'border-warning bg-warning/5' :
                    'border-border bg-surface'
                  }`}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{q.quarter}</p>
                    <p className="text-sm font-semibold text-text">{q.deadline}{q.status === 'past' ? '' : `, ${q.deadlineDate}`}</p>
                    <span className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      q.status === 'past' ? 'text-muted-foreground bg-muted' :
                      q.status === 'upcoming' ? 'text-warning bg-warning/10' :
                      'text-muted-foreground bg-muted'
                    }`}>
                      {q.status === 'past' ? 'Past due' : q.status === 'upcoming' ? 'Due soon' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-text">Tax Year Summary</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                  <span className="text-sm text-text">Filing year</span>
                  <span className="text-sm font-semibold text-text">{year}</span>
                </div>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-surface border border-border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-text">{data?.categories.length ?? 0} expense categories</span>
                  {showCategories ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showCategories && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {data?.categories.map((c) => (
                      <div key={c.category} className="flex items-center justify-between px-3 py-1.5 text-sm">
                        <span className="text-muted-foreground">{c.category}</span>
                        <span className="font-medium text-text">{fmt(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleExport}>
                  <Download className="h-3.5 w-3.5" /> Export {year} Data
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* IRS Category breakdown table */}
      {data && data.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-text">Income & Expenses by IRS Category</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase">Category</TableHead>
                  <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                  <TableHead className="text-xs uppercase text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-success/5">
                  <TableCell className="font-medium text-success">Income</TableCell>
                  <TableCell className="text-right font-medium text-success">{fmt(data.totalIncome)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">—</TableCell>
                </TableRow>
                {data.categories.map((cat) => (
                  <TableRow key={cat.category}>
                    <TableCell>{cat.category}</TableCell>
                    <TableCell className="text-right">{fmt(cat.amount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {data.totalIncome > 0 ? `${((cat.amount / data.totalIncome) * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Net Income</TableCell>
                  <TableCell className="text-right">{fmt(data.netIncome)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}