import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  change?: { value: string; positive: boolean }
  accentColor?: string
  sparkline?: React.ReactNode
  loading?: boolean
  className?: string
}

export default function KpiCard({
  icon: Icon, label, value, change, accentColor = 'border-brand-navy/20',
  sparkline, loading, className = '',
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-white p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-xl border border-border/50 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${className}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentColor}`} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-brand-navy" />
        </div>
        {sparkline && <div className="w-20 h-10">{sparkline}</div>}
      </div>
      <p className="text-xs text-text-muted font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-text tracking-tight">{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-1.5">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            change.positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {change.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change.value}
          </span>
          <span className="text-[11px] text-text-muted">vs last month</span>
        </div>
      )}
    </div>
  )
}