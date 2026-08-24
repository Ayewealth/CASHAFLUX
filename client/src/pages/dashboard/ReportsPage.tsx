import { useState } from 'react'
import { Download, FileText, BarChart3, PieChart, TrendingUp, DollarSign, Receipt, Clock, AlertTriangle, Users, Car, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { DatePicker } from '../../components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Label } from '../../components/ui/label'
import { useReport } from '../../features/reports/hooks'
import { cn } from '../../lib/utils'
import {
  PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'

const REPORT_TYPES = [
  { id: 'profit-and-loss', name: 'Profit & Loss', icon: DollarSign, desc: 'Revenue, expenses, and net income over a period', color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'balance-sheet', name: 'Balance Sheet', icon: BarChart3, desc: 'Assets, liabilities, and equity snapshot', color: 'text-success', bg: 'bg-success/10' },
  { id: 'cash-flow', name: 'Cash Flow Statement', icon: TrendingUp, desc: 'Income and expenses by month', color: 'text-brand-navy', bg: 'bg-brand-blue-light/40' },
  { id: 'receivable-aging', name: 'A/R Aging', icon: Clock, desc: 'Outstanding invoices by age bracket', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'payable-aging', name: 'A/P Aging', icon: AlertTriangle, desc: 'Unpaid expenses by due date', color: 'text-danger', bg: 'bg-danger/10' },
  { id: 'tax-summary', name: 'Tax Summary', icon: Receipt, desc: 'Income and expenses by IRS category', color: 'text-text', bg: 'bg-muted' },
  { id: 'sales-by-client', name: 'Sales by Client', icon: Users, desc: 'Revenue breakdown per client', color: 'text-accent', bg: 'bg-accent/5' },
  { id: 'expense-by-category', name: 'Expense by Category', icon: PieChart, desc: 'Expenses grouped by category with chart', color: 'text-success', bg: 'bg-success/5' },
  { id: 'invoice-report', name: 'Invoice Report', icon: FileText, desc: 'All invoices with status breakdown', color: 'text-brand-navy', bg: 'bg-brand-blue-light/30' },
  { id: 'mileage-log', name: 'Mileage Log', icon: Car, desc: 'Business mileage tracked for deductions', color: 'text-text', bg: 'bg-muted' },
]

const CHART_COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

function getDefaultRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return { start: start.toISOString(), end: now.toISOString() }
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(getDefaultRange().start))
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(getDefaultRange().end))
  const { data, isLoading } = useReport(selectedReport ?? '', {
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
  })

  function downloadCSV() {
    if (!data?.csv) return
    const blob = new Blob([data.csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${selectedReport}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Detail views per report type ───
  function renderDetail() {
    if (isLoading) return <Skeleton className="h-64 w-full" />
    if (!data) return <p className="text-sm text-muted-foreground">Select filters and view the report.</p>

    switch (selectedReport) {
      case 'profit-and-loss': {
        const d = data.data[0] as any
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Revenue</p><p className="text-xl font-bold text-success mt-1">{fmt(d.revenue)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total Expenses</p><p className="text-xl font-bold text-danger mt-1">{fmt(d.totalExpenses)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Net Income</p><p className={cn("text-xl font-bold mt-1", d.netIncome >= 0 ? 'text-success' : 'text-danger')}>{fmt(d.netIncome)}</p></CardContent></Card>
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">Category</TableHead><TableHead className="text-xs uppercase text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {d.expensesByCategory.map((r: any) => (
                  <TableRow key={r.category}><TableCell>{r.category}</TableCell><TableCell className="text-right">{fmt(r.amount)}</TableCell></TableRow>
                ))}
              </TableBody></Table>
            </div>
          </div>
        )
      }

      case 'balance-sheet': {
        const d = data.data[0] as any
        return (
          <div className="grid grid-cols-2 gap-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Cash & Bank</p><p className="text-xl font-bold mt-1">{fmt(d.bankBalances)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Receivables</p><p className="text-xl font-bold mt-1">{fmt(d.outstandingReceivables)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total Assets</p><p className="text-xl font-bold text-success mt-1">{fmt(d.totalAssets)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Liabilities</p><p className="text-xl font-bold text-danger mt-1">{fmt(d.liabilities)}</p></CardContent></Card>
          </div>
        )
      }

      case 'cash-flow': {
        const d = data.data[0] as any
        const chartData = d.income.map((i: any, idx: number) => ({
          month: i.month,
          Income: parseFloat(i.total),
          Expenses: parseFloat(d.outflow[idx]?.total ?? '0'),
        }))
        return (
          <div className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="Income" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      }

      case 'expense-by-category': {
        const d = data.data as any[]
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsTooltip />
                  <Pie data={d} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}>
                    {d.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">Category</TableHead><TableHead className="text-xs uppercase text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {d.map((r: any) => (
                  <TableRow key={r.category}><TableCell>{r.category}</TableCell><TableCell className="text-right">{fmt(r.amount)}</TableCell></TableRow>
                ))}
              </TableBody></Table>
            </div>
          </div>
        )
      }

      case 'receivable-aging':
      case 'payable-aging': {
        const d = data.data[0] as Record<string, number>
        return (
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(d).map(([bucket, amount]) => (
              <Card key={bucket}><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">{bucket} days</p><p className="text-lg font-bold mt-1">{fmt(amount)}</p></CardContent></Card>
            ))}
          </div>
        )
      }

      case 'tax-summary': {
        const d = data.data[0] as any
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total Income</p><p className="text-xl font-bold text-success mt-1">{fmt(d.totalIncome)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total Expenses</p><p className="text-xl font-bold text-danger mt-1">{fmt(d.categories.reduce((s: number, c: any) => s + c.amount, 0))}</p></CardContent></Card>
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">IRS Category</TableHead><TableHead className="text-xs uppercase text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {d.categories.map((r: any) => (
                  <TableRow key={r.category}><TableCell>{r.category}</TableCell><TableCell className="text-right">{fmt(r.amount)}</TableCell></TableRow>
                ))}
              </TableBody></Table>
            </div>
          </div>
        )
      }

      case 'sales-by-client': {
        const d = data.data as any[]
        return (
          <div className="rounded-xl border border-border bg-surface">
            <Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">Client</TableHead><TableHead className="text-xs uppercase">Company</TableHead><TableHead className="text-xs uppercase text-right">Total</TableHead><TableHead className="text-xs uppercase text-right">Invoices</TableHead></TableRow></TableHeader>
            <TableBody>
              {d.map((r: any, i: number) => (
                <TableRow key={i}><TableCell className="font-medium">{r.clientName}</TableCell><TableCell className="text-muted-foreground">{r.company ?? '—'}</TableCell><TableCell className="text-right font-medium">{fmt(r.total)}</TableCell><TableCell className="text-right text-muted-foreground">{r.invoiceCount}</TableCell></TableRow>
              ))}
            </TableBody></Table>
          </div>
        )
      }

      case 'invoice-report': {
        const d = data.data[0] as Record<string, { count: number; total: number }>
        return (
          <div className="rounded-xl border border-border bg-surface">
            <Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">Status</TableHead><TableHead className="text-xs uppercase text-right">Count</TableHead><TableHead className="text-xs uppercase text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {Object.entries(d).map(([status, v]) => (
                <TableRow key={status}><TableCell className="capitalize">{status}</TableCell><TableCell className="text-right">{v.count}</TableCell><TableCell className="text-right font-medium">{fmt(v.total)}</TableCell></TableRow>
              ))}
            </TableBody></Table>
          </div>
        )
      }

      case 'mileage-log': {
        const d = data.data[0] as any
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total Miles</p><p className="text-xl font-bold mt-1">{d.totalMiles.toFixed(1)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Estimated Deduction</p><p className="text-xl font-bold text-success mt-1">{fmt(d.totalDeduction)}</p></CardContent></Card>
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">Date</TableHead><TableHead className="text-xs uppercase">Origin</TableHead><TableHead className="text-xs uppercase">Destination</TableHead><TableHead className="text-xs uppercase text-right">Miles</TableHead><TableHead className="text-xs uppercase">Purpose</TableHead></TableRow></TableHeader>
              <TableBody>
                {d.logs.map((r: any) => (
                  <TableRow key={r.id}><TableCell>{fmtDate(r.date)}</TableCell><TableCell>{r.origin}</TableCell><TableCell>{r.destination}</TableCell><TableCell className="text-right">{r.miles}</TableCell><TableCell className="text-muted-foreground">{r.purpose ?? '—'}</TableCell></TableRow>
                ))}
              </TableBody></Table>
            </div>
          </div>
        )
      }

      default:
        return <p className="text-sm text-muted-foreground">Select a report to view.</p>
    }
  }

  if (!selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-text tracking-tight">Reports</h1><p className="text-sm text-muted-foreground mt-1">Financial reports and analytics</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((report) => (
            <button key={report.id} onClick={() => setSelectedReport(report.id)} className="text-left rounded-xl border border-border bg-surface p-5 hover:shadow-sm hover:border-accent/30 transition-all">
              <div className="flex items-start gap-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg shrink-0', report.bg)}>
                  <report.icon className={cn('h-5 w-5', report.color)} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-text text-sm">{report.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{report.desc}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-accent font-medium">
                <FileText className="h-3.5 w-3.5" /> View Report
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const reportMeta = REPORT_TYPES.find(r => r.id === selectedReport)
  const Icon = reportMeta?.icon ?? FileText

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedReport(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">{reportMeta?.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{reportMeta?.desc}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {data?.csv && (
            <Button variant="outline" className="gap-1.5" onClick={downloadCSV}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <DatePicker value={dateFrom} onChange={(d) => setDateFrom(d)} placeholder="From" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <DatePicker value={dateTo} onChange={(d) => setDateTo(d)} placeholder="To" />
        </div>
      </div>

      {renderDetail()}
    </div>
  )
}