import { useQuery } from '@tanstack/react-query'
import { useSubscriptionStatus } from '@/features/subscription/hooks'
import { cn } from '@/lib/utils'

function ProgressRing({ used, total, size = 36, strokeWidth = 3 }: { used: number; total: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(used / total, 1)
  const offset = circumference - progress * circumference
  const color = progress >= 1 ? 'stroke-danger' : progress >= 0.8 ? 'stroke-warning' : 'stroke-brand-blue'

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-white/10" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={color} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  )
}

export default function PlanUsage({ collapsed }: { collapsed: boolean }) {
  const { data: subscription, isLoading } = useSubscriptionStatus()
  const { data: usage } = useQuery({
    queryKey: ['plan-usage'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/summary')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ clientCount: number; memberCount: number }>
    },
    enabled: !!subscription && subscription.plan === 'free',
    staleTime: 1000 * 60 * 2,
  })

  if (isLoading || !subscription || subscription.plan !== 'free') return null

  const clientCount = usage?.clientCount ?? 0
  const memberCount = usage?.memberCount ?? 0

  if (collapsed) {
    return (
      <div className="px-2 py-2 space-y-2">
        <div className="relative group" title={`${clientCount}/5 clients`}>
          <ProgressRing used={clientCount} total={5} size={28} strokeWidth={2.5} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-white text-xs text-brand-navy shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {clientCount}/5 clients
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-2 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <ProgressRing used={clientCount} total={5} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/80">Clients</p>
          <p className="text-[10px] text-white/40">{clientCount}/5 used</p>
        </div>
      </div>
      {memberCount > 0 && (
        <div className="flex items-center gap-2.5">
          <ProgressRing used={memberCount} total={5} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80">Team</p>
            <p className="text-[10px] text-white/40">{memberCount}/5 used</p>
          </div>
        </div>
      )}
    </div>
  )
}