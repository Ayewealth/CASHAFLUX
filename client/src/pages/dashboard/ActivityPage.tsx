import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, FileText, Receipt, Users, DollarSign, Settings, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { usePageMeta } from '@/lib/usePageMeta'

const ACTION_ICONS: Record<string, typeof FileText> = {
  create: FileText,
  update: Settings,
  delete: Users,
  invite: UserPlus,
  remove: Users,
  paid: DollarSign,
  sent: FileText,
  reconciled: Activity,
  default: Activity,
}

function getActionIcon(action: string) {
  return ACTION_ICONS[action] ?? ACTION_ICONS.default
}

function getEntityColor(entityType: string) {
  const colors: Record<string, string> = {
    invoice: 'bg-brand-navy/10 text-brand-navy',
    expense: 'bg-rose-50 text-rose-600',
    client: 'bg-brand-blue/10 text-brand-blue',
    team: 'bg-violet-50 text-violet-600',
    organization: 'bg-success/10 text-success',
  }
  return colors[entityType] ?? 'bg-surface text-text-muted'
}

export default function ActivityPage() {
  usePageMeta({ title: 'Activity Log', description: 'View all activity across your organization.' })
  const [filter, setFilter] = useState('')

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await fetch('/api/activity-log')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ id: string; action: string; entityType: string; entityId: string | null; createdAt: string | null }[]>
    },
    staleTime: 1000 * 60 * 2,
  })

  const filtered = activity
    ? filter
      ? activity.filter(a => a.action.toLowerCase().includes(filter.toLowerCase()) || a.entityType.toLowerCase().includes(filter.toLowerCase()))
      : activity
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Activity Log</h1>
          <p className="text-sm text-text-muted mt-1">Every action across your organization, in chronological order</p>
        </div>
        <div className="flex gap-2">
          {['', 'create', 'update', 'invite', 'paid'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f === filter ? '' : f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filter === f ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-text-muted border-border hover:border-brand-navy/30'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-brand-navy" />
            </div>
            <CardTitle className="text-sm font-semibold text-text">Timeline</CardTitle>
          </div>
          <span className="text-xs text-text-muted">{filtered.length} events</span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-brand-navy/30" />
              </div>
              <p className="text-sm text-text-muted">No activity found</p>
            </div>
          ) : (
            <div className="relative px-4 py-3">
              <div className="absolute left-[2.1rem] top-8 bottom-8 w-px bg-border/60" />
              {filtered.map((item, i) => {
                const Icon = getActionIcon(item.action)
                const colorClass = getEntityColor(item.entityType)
                return (
                  <div key={item.id} className="flex items-start gap-3 pb-5 last:pb-0 relative">
                    <div className={`w-7 h-7 rounded-full ${colorClass} flex items-center justify-center shrink-0 relative z-10`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm text-text font-medium">{item.action.charAt(0).toUpperCase() + item.action.slice(1)}</p>
                      <p className="text-xs text-text-muted capitalize">{item.entityType.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap mt-1 shrink-0">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}