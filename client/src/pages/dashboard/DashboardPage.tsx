import { Link } from 'react-router'
import { TrendingUp, DollarSign, Receipt, Wallet, Users, Clock, AlertTriangle, Landmark, Repeat, Route, Activity, ArrowUpRight, ShoppingCart, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/utils'
import { useDashboardSummary } from '../../features/dashboard/hooks'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '../../components/ui/skeleton'
import KpiCard from '../../components/dashboard/KpiCard'
import { authClient } from '../../lib/auth-client'

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

function StatCard({ icon: Icon, label, value, accentColor, loading }: { icon: any; label: string; value: string; accentColor: string; loading?: boolean }) {
  return (
    <div className="relative rounded-xl border border-border/50 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentColor}`} />
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${accentColor.replace('bg-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${accentColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-2xl font-bold text-text tracking-tight">{value}</p>
      )}
      <p className="text-xs text-text-muted font-medium mt-1">{label}</p>
    </div>
  )
}

function toAccentColor(color: string) {
  const map: Record<string, string> = {
    'brand-navy': 'bg-brand-navy',
    'brand-blue': 'bg-brand-blue',
    danger: 'bg-danger',
    success: 'bg-success',
  }
  return map[color] ?? `bg-${color}`
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: session } = authClient.useSession()

  function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  function getStatusMessage(): string {
    if (!summary) return ''
    if (summary.overdueCount > 0) return `You have ${summary.overdueCount} overdue invoice${summary.overdueCount > 1 ? 's' : ''} needing attention.`
    if (summary.openInvoiceCount > 0) return `You have ${summary.openInvoiceCount} open invoice${summary.openInvoiceCount > 1 ? 's' : ''} outstanding.`
    return 'Everything looks good — all caught up!'
  }

  const chartData = summary?.cashFlow.income.map((inc, i) => ({
    month: inc.month,
    income: parseFloat(inc.total),
    expenses: summary.cashFlow.expenses[i] ? parseFloat(summary.cashFlow.expenses[i].total) : 0,
  })) ?? []

  const sparklineIncome = summary?.cashFlow.income.map((i) => ({ value: parseFloat(i.total) })) ?? []
  const sparklineExpenses = summary?.cashFlow.expenses.map((e) => ({ value: parseFloat(e.total) })) ?? []
  const sparklineNet = summary?.cashFlow.income.map((inc, i) => ({
    value: parseFloat(inc.total) - (summary.cashFlow.expenses[i] ? parseFloat(summary.cashFlow.expenses[i].total) : 0),
  })) ?? []

  const totalIncome = chartData.reduce((a, c) => a + c.income, 0)
  const totalExpenses = chartData.reduce((a, c) => a + c.expenses, 0)

  function daysUntil(dateStr: string): number {
    const now = new Date()
    const due = new Date(dateStr)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your business at a glance</p>
      </div>

      {/* Greeting */}
      <div className="rounded-xl bg-gradient-to-r from-brand-navy/5 to-brand-navy/[0.02] border border-border/50 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand-navy" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text">{getGreeting()}, {session?.user?.name?.split(' ')[0] ?? 'there'}</p>
          <p className="text-xs text-text-muted">{isLoading ? 'Loading...' : getStatusMessage()}</p>
        </div>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Revenue (MTD)"
          value={summary?.kpis.revenue ? formatCurrency(summary.kpis.revenue.value) : '$0'}
          change={summary?.kpis.revenue ? { value: `${summary.kpis.revenue.change >= 0 ? '+' : ''}${summary.kpis.revenue.change.toFixed(1)}%`, positive: summary.kpis.revenue.up } : undefined}
          accentColor="bg-brand-navy"
          sparkline={<Sparkline data={sparklineIncome} color="#1E3A5F" />}
          loading={isLoading}
        />
        <KpiCard
          icon={Receipt}
          label="Outstanding Invoices"
          value={summary?.kpis.outstanding ? formatCurrency(summary.kpis.outstanding.value) : '$0'}
          change={summary?.kpis.outstanding ? { value: `${summary.kpis.outstanding.change >= 0 ? '+' : ''}${summary.kpis.outstanding.change.toFixed(1)}%`, positive: !summary.kpis.outstanding.up } : undefined}
          accentColor="bg-brand-blue"
          sparkline={<Sparkline data={sparklineIncome} color="#2563EB" />}
          loading={isLoading}
        />
        <KpiCard
          icon={Wallet}
          label="Total Expenses (MTD)"
          value={summary?.kpis.expenses ? formatCurrency(summary.kpis.expenses.value) : '$0'}
          change={summary?.kpis.expenses ? { value: `${summary.kpis.expenses.change >= 0 ? '+' : ''}${summary.kpis.expenses.change.toFixed(1)}%`, positive: !summary.kpis.expenses.up } : undefined}
          accentColor="bg-warning"
          sparkline={<Sparkline data={sparklineExpenses} color="#D97706" />}
          loading={isLoading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Net Cash Flow"
          value={summary?.kpis.netCashFlow ? formatCurrency(summary.kpis.netCashFlow.value) : '$0'}
          change={summary?.kpis.netCashFlow ? { value: `${summary.kpis.netCashFlow.change >= 0 ? '+' : ''}${summary.kpis.netCashFlow.change.toFixed(1)}%`, positive: summary.kpis.netCashFlow.up } : undefined}
          accentColor="bg-success"
          sparkline={<Sparkline data={sparklineNet} color="#16A34A" />}
          loading={isLoading}
        />
      </div>

      {/* 2. Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Clients" value={isLoading ? '-' : String(summary?.clientCount ?? 0)} accentColor="bg-brand-navy" loading={isLoading} />
        <StatCard icon={Receipt} label="Open Invoices" value={isLoading ? '-' : String(summary?.openInvoiceCount ?? 0)} accentColor="bg-brand-blue" loading={isLoading} />
        <StatCard icon={AlertTriangle} label="Overdue Invoices" value={isLoading ? '-' : String(summary?.overdueCount ?? 0)} accentColor="bg-danger" loading={isLoading} />
        <StatCard icon={Landmark} label="Bank Balance" value={isLoading ? '-' : formatCurrency(summary?.bankBalance ?? 0)} accentColor="bg-success" loading={isLoading} />
      </div>

      {/* 3. Three-column detail row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Payments */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-sm font-semibold text-text">Upcoming Payments</CardTitle>
            </div>
            <Link to="/dashboard/invoices" className="text-xs text-brand-navy hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {(summary?.upcomingDue ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">No upcoming payments</p>
                ) : (
                  summary?.upcomingDue.map((item) => {
                    const days = daysUntil(item.dueDate)
                    const isUrgent = days <= 3
                    const isOverdue = days < 0
                    return (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-brand-navy/[0.02] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn('w-2 h-2 rounded-full shrink-0 mt-0.5', isOverdue ? 'bg-danger' : isUrgent ? 'bg-warning' : 'bg-transparent border border-border')} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text truncate">{item.clientName}</p>
                            <p className="text-xs text-text-muted font-mono">{item.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-medium text-text font-mono tabular-nums">{formatCurrency(parseFloat(item.amount))}</span>
                          <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded', isOverdue ? 'bg-danger/10 text-danger' : isUrgent ? 'bg-warning/10 text-warning' : 'bg-muted text-text-muted')}>
                            {isOverdue ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center">
                <Activity className="w-4 h-4 text-brand-navy" />
              </div>
              <CardTitle className="text-sm font-semibold text-text">Recent Activity</CardTitle>
            </div>
            <span className="text-xs text-text-muted">Last 8</span>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="relative">
                {(summary?.recentActivity ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">No recent activity</p>
                ) : (
                  <div className="px-4 py-3">
                    <div className="absolute left-[2.1rem] top-8 bottom-8 w-px bg-border/60" />
                    {summary?.recentActivity.map((item, i) => (
                      <div key={item.id} className="flex items-start gap-3 pb-4 last:pb-0 relative">
                        <div className="w-2 h-2 rounded-full bg-brand-navy/30 mt-1.5 shrink-0 relative z-10" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text">{item.action}</p>
                          <p className="text-xs text-text-muted capitalize">{item.entityType.replace(/_/g, ' ')}</p>
                        </div>
                        <span className="text-xs text-text-muted whitespace-nowrap mt-0.5">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <CardTitle className="text-sm font-semibold text-text">Monthly Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: Users, label: 'Team Members', value: String(summary?.memberCount ?? 0), color: 'text-brand-navy' },
                  { icon: Repeat, label: 'Recurring Invoices', value: String(summary?.recurringInvoiceCount ?? 0), color: 'text-brand-blue' },
                  { icon: Route, label: 'Mileage Logged', value: `${(summary?.mileageTotal ?? 0).toFixed(1)} mi`, color: 'text-warning' },
                  { icon: DollarSign, label: 'Payroll YTD', value: formatCurrency(summary?.payrollYtd ?? 0), color: 'text-success' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm text-text-muted">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-text tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Cash Flow + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-text">Cash Flow</CardTitle>
              <p className="text-xs text-text-muted mt-0.5">Income vs Expenses over the last 12 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-navy" /><span className="text-text-muted">Income</span></span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" /><span className="text-text-muted">Expenses</span></span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <>
                <div className="h-64 w-full">
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
                <div className="mt-3 flex items-center gap-6 text-xs pt-3 border-t border-border/40">
                  <span className="text-text-muted">Total Income: <strong className="text-text font-semibold">{formatCurrency(totalIncome)}</strong></span>
                  <span className="text-text-muted">Total Expenses: <strong className="text-text font-semibold">{formatCurrency(totalExpenses)}</strong></span>
                  <span className="text-text-muted">Net: <strong className={cn('font-semibold', totalIncome - totalExpenses >= 0 ? 'text-success' : 'text-danger')}>{formatCurrency(totalIncome - totalExpenses)}</strong></span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-rose-600" />
              </div>
              <CardTitle className="text-sm font-semibold text-text">Recent Expenses</CardTitle>
            </div>
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
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-brand-navy/5 flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5 text-text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{exp.merchant}</p>
                          <p className="text-xs text-text-muted">{exp.category}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-text font-mono tabular-nums">{formatCurrency(parseFloat(exp.amount))}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Recent Invoices */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-brand-navy" />
            </div>
            <CardTitle className="text-sm font-semibold text-text">Recent Invoices</CardTitle>
          </div>
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
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-brand-navy/5 flex items-center justify-center shrink-0">
                        <Receipt className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{inv.clientName}</p>
                        <p className="text-xs text-text-muted font-mono">{inv.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
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
    </div>
  )
}