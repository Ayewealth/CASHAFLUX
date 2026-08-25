import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Circle, FileText, Receipt, Users, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'

const ITEMS = [
  { key: 'clients', label: 'Add a client', icon: Users, href: '/dashboard/clients', query: 'clientCount' },
  { key: 'invoice', label: 'Create an invoice', icon: FileText, href: '/dashboard/invoices/new', query: 'openInvoiceCount' },
  { key: 'expense', label: 'Log an expense', icon: Receipt, href: '/dashboard/expenses/new', query: 'expenseCount' },
  { key: 'profile', label: 'Complete business profile', icon: Building2, href: '/dashboard/settings', query: 'orgName' },
]

export default function OnboardingChecklist({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate()
  const { data: summary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/summary')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ clientCount: number; openInvoiceCount: number; recentExpenses: any[] }>
    },
    staleTime: 1000 * 60 * 2,
  })

  const checkDone = (item: typeof ITEMS[0]) => {
    if (item.key === 'clients') return (summary?.clientCount ?? 0) > 0
    if (item.key === 'invoice') return (summary?.openInvoiceCount ?? 0) > 0
    if (item.key === 'expense') return (summary?.recentExpenses?.length ?? 0) > 0
    if (item.key === 'profile') return false
    return false
  }

  const doneCount = ITEMS.filter(checkDone).length
  const allDone = doneCount >= ITEMS.length

  if (allDone) return null

  if (collapsed) {
    return (
      <div className="px-2 py-2">
        <div className="relative group" title={`${doneCount}/${ITEMS.length} setup steps done`}>
          <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/60">{doneCount}</span>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-white text-xs text-brand-navy shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {doneCount}/{ITEMS.length} setup steps done
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-2 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-white/30">Setup</p>
        <span className="text-[10px] text-white/30">{doneCount}/{ITEMS.length}</span>
      </div>
      <div className="space-y-1">
        {ITEMS.map((item) => {
          const done = checkDone(item)
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.href)}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors text-left',
                done ? 'text-white/40' : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-white/20 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}