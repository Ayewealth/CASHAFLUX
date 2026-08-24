import { useNavigate, Outlet, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { Skeleton } from './ui/skeleton'

export default function AuthGuard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  const { data: onboardingStatus, isPending: statusPending } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding/status')
      if (!res.ok) throw new Error('Failed to check onboarding status')
      return res.json() as Promise<{ onboarded: boolean; orgId: string | null }>
    },
    enabled: !!session,
    retry: 1,
    staleTime: 1000 * 60 * 2,
  })

  if (isPending || (session && statusPending)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="h-6 w-32" />
      </div>
    )
  }

  if (!session) {
    navigate('/login', { replace: true })
    return null
  }

  if (!onboardingStatus?.onboarded && location.pathname !== '/onboarding') {
    navigate('/onboarding', { replace: true })
    return null
  }

  return <Outlet />
}