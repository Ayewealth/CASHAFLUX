import { Link } from 'react-router'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, ArrowUpRight, ArrowDownRight, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/utils'
import { useDashboardSummary } from '../../features/dashboard/hooks'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '../../components/ui/skeleton'
import KpiCard from '../../components/dashboard/KpiCard'

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  sent: 'bg-brand-navy/5 text-brand-navy border-brand-navy/20',
  draft: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-danger/10 text-danger border-danger/20',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

function Sparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sparkline-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#sparkline-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
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

  const mockSparklineData = Array.from({ length: 12 }, (_, i) => ({
    value: 50 + Math.sin(i * 0.8) * 20 + Math.random() * 10,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your business at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Revenue (MTD)"
          value={summary?.kpis.revenue ? formatCurrency(summary.kpis.revenue.value) : '$0'}
          change={summary?.kpis.revenue ? { value: `${summary.kpis.revenue.change >= 0 ? '+' : ''}${summary.kpis.revenue.change.toFixed(1)}%`, positive: summary.kpis.revenue.up } : undefined}
          accentColor="bg-brand-navy"
          sparkline={<Sparkline data={mockSparklineData} color="#1E3A5F" />}
          loading={isLoading}
        />
        <KpiCard
          icon={Receipt}
          label="Outstanding Invoices"
          value={summary?.kpis.outstanding ? formatCurrency(summary.kpis.outstanding.value) : '$0'}
          change={summary?.kpis.outstanding ? { value: `${summary.kpis.outstanding.change >= 0 ? '+' : ''}${summary.kpis.outstanding.change.toFixed(1)}%`, positive: !summary.kpis.outstanding.up } : undefined}
          accentColor="bg-brand-blue"
          sparkline={<Sparkline data={mockSparklineData.map((d) => ({ value: d.value * 0.6 }))} color="#2563EB" />}
          loading={isLoading}
        />
        <KpiCard
          icon={Wallet}
          label="Total Expenses (MTD)"
          value={summary?.kpis.expenses ? formatCurrency(summary.kpis.expenses.value) : '$0'}
          change={summary?.kpis.expenses ? { value: `${summary.kpis.expenses.change >= 0 ? '+' : ''}${summary.kpis.expenses.change.toFixed(1)}%`, positive: !summary.kpis.expenses.up } : undefined}
          accentColor="bg-warning"
          sparkline={<Sparkline data={mockSparklineData.map((d) => ({ value: d.value * 0.4 }))} color="#D97706" />}
          loading={isLoading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Net Cash Flow"
          value={summary?.kpis.netCashFlow ? formatCurrency(summary.kpis.netCashFlow.value) : '$0'}
          change={summary?.kpis.netCashFlow ? { value: `${summary.kpis.netCashFlow.change >= 0 ? '+' : ''}${summary.kpis.netCashFlow.change.toFixed(1)}%`, positive: summary.kpis.netCashFlow.up } : undefined}
          accentColor="bg-success"
          sparkline={<Sparkline data={mockSparklineData.map((d) => ({ value: d.value * 0.8 }))} color="#16A34A" />}
          loading={isLoading}
        />
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
                          <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
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
                      <Area type="monotone" dataKey="income" stroke="#1E3A5F" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, stroke: '#1E3A5F', strokeWidth: 2, fill: 'white' }} />
                      <Area type="monotone" dataKey="expenses" stroke="#DC2626" strokeWidth={2} strokeDasharray="4 3" fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, stroke: '#DC2626', strokeWidth: 2, fill: 'white' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-navy" /><span className="text-text-muted">Income</span></span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" /><span className="text-text-muted">Expenses</span></span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-text">Recent Invoices</CardTitle>
            <Link to="/dashboard/invoices" className="text-xs text-brand-navy hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {(summary?.recentInvoices ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">No invoices yet</p>
                ) : (
                  summary?.recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-brand-navy/[0.02] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{inv.clientName}</p>
                        <p className="text-xs text-text-muted font-mono">{inv.invoiceNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text font-mono tabular-nums">{formatCurrency(parseFloat(inv.amount))}</span>
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
            <Link to="/dashboard/expenses" className="text-xs text-brand-navy hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {(summary?.recentExpenses ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">No expenses yet</p>
                ) : (
                  summary?.recentExpenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between px-4 py-3 hover:bg-brand-navy/[0.02] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{exp.merchant}</p>
                        <p className="text-xs text-text-muted">{exp.category}</p>
                      </div>
                      <span className="text-sm font-medium text-text font-mono tabular-nums">{formatCurrency(parseFloat(exp.amount))}</span>
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
            <Link to="/dashboard/invoices/new" className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface p-3 hover:bg-brand-navy/[0.02] hover:border-brand-navy/20 transition-all duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/5">
                <ArrowUpRight className="h-4 w-4 text-brand-navy" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">New Invoice</p>
                <p className="text-xs text-text-muted">Create and send an invoice</p>
              </div>
            </Link>
            <Link to="/dashboard/expenses/new" className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface p-3 hover:bg-brand-navy/[0.02] hover:border-brand-navy/20 transition-all duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                <ArrowDownRight className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Log Expense</p>
                <p className="text-xs text-text-muted">Record a business expense</p>
              </div>
            </Link>
            <Link to="/dashboard/clients" className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface p-3 hover:bg-brand-navy/[0.02] hover:border-brand-navy/20 transition-all duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-4 h-4 text-success" />
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