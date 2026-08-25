import { useSubscriptionStatus } from '@/features/subscription/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Lock } from 'lucide-react'
import { useNavigate } from 'react-router'

interface PlanGateProps {
  feature: string
  requiredPlans: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PlanGate({ feature, requiredPlans, children, fallback }: PlanGateProps) {
  const { data: subscription, isLoading } = useSubscriptionStatus()
  const navigate = useNavigate()

  if (isLoading) return null

  const plan = subscription?.plan ?? 'free'
  const allowed = requiredPlans.includes(plan) && subscription?.status !== 'past_due'

  if (allowed) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-brand-navy" />
      </div>
      <h2 className="text-lg font-heading font-bold text-brand-navy mb-2">Upgrade to access {feature}</h2>
      <p className="text-sm text-text-muted mb-6 max-w-sm">
        This feature requires the {requiredPlans.join(' or ')} plan. Upgrade now to unlock it.
      </p>
      <Button onClick={() => navigate('/dashboard/settings?tab=billing')}>
        Upgrade plan <ArrowUpRight className="w-4 h-4" />
      </Button>
    </div>
  )
}