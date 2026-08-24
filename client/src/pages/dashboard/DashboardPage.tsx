import { Link } from 'react-router'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, ArrowUpRight, ArrowDownRight, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/utils'
import { useDashboardSummary } from '../../features/dashboard/hooks'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '../../components/ui/skeleton'

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  sent: 'bg-accent/10 text-accent border-accent/20',
  draft: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-danger/10 text-danger border-danger/20',
}

function KpiCard({ label, metric, icon: Icon }: { label: string; metric: { value: number; change: number; up: boolean } | undefined; icon: typeof DollarSign }) {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-4 w-4 text-accent" />
        </div>
      </CardHeader>
      <CardContent>
        {metric ? (
          <>
            <div className="text-2xl font-bold text-text tracking-tight">{fmt.format(metric.value)}</div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {metric.up ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              )}
              <span className={metric.up ? 'text-success' : 'text-danger'}>
                {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
              <span className="text-text-muted">vs last month</span>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary()

  const chartData = summary?.cashFlow.income.map((inc) => {
    const exp = summary.cashFlow.expenses.find((e) => e.month === inc.month)
    return {
      month: inc.month,
      income: parseFloat(inc.total),
      expenses: exp ? parseFloat(exp.total) : 0,
    }
  }) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your business at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue (MTD)" metric={summary?.kpis.revenue} icon={DollarSign} />
        <KpiCard label="Outstanding Invoices" metric={summary?.kpis.outstanding} icon={Receipt} />
        <KpiCard label="Total Expenses (MTD)" metric={summary?.kpis.expenses} icon={Wallet} />
        <KpiCard label="Net Cash Flow" metric={summary?.kpis.netCashFlow} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-text">Cash Flow</CardTitle>
            <p className="text-xs text-text-muted">Income vs Expenses over the last 12 months</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.08} />
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} dy={8} />
                      <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} formatter={(value: any) => [formatCurrency(Number(value)), undefined]} />
                      <Area type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, stroke: '#2563EB', strokeWidth: 2, fill: 'white' }} />
                      <Area type="monotone" dataKey="expenses" stroke="#DC2626" strokeWidth={2} strokeDasharray="4 3" fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, stroke: '#DC2626', strokeWidth: 2, fill: 'white' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent" /><span className="text-text-muted">Income</span></span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" /><span className="text-text-muted">Expenses</span></span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-text">Recent Invoices</CardTitle>
            <Link to="/dashboard/invoices" className="text-xs text-accent hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(summary?.recentInvoices ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">No invoices yet</p>
                ) : (
                  summary?.recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{inv.clientName}</p>
                        <p className="text-xs text-text-muted">{inv.invoiceNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text">{formatCurrency(parseFloat(inv.amount))}</span>
                        <Badge className={cn('text-[10px] px-1.5 py-0.5', STATUS_STYLES[inv.status])}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-text">Recent Expenses</CardTitle>
            <Link to="/dashboard/expenses" className="text-xs text-accent hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(summary?.recentExpenses ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">No expenses yet</p>
                ) : (
                  summary?.recentExpenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{exp.merchant}</p>
                        <p className="text-xs text-text-muted">{exp.category}</p>
                      </div>
                      <span className="text-sm font-medium text-text">{formatCurrency(parseFloat(exp.amount))}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-text">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/dashboard/invoices/new" className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-muted transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <ArrowUpRight className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">New Invoice</p>
                <p className="text-xs text-text-muted">Create and send an invoice</p>
              </div>
            </Link>
            <Link to="/dashboard/expenses/new" className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-muted transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                <ArrowDownRight className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Log Expense</p>
                <p className="text-xs text-text-muted">Record a business expense</p>
              </div>
            </Link>
            <Link to="/dashboard/clients" className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-muted transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Add Client</p>
                <p className="text-xs text-text-muted">Add a new client to your roster</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}