import { useNavigate, Outlet, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { Skeleton } from './ui/skeleton'
import { useEffect } from 'react'

export default function AuthGuard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  const params = new URLSearchParams(location.search)
  const inviteToken = params.get('invite')

  const { data: onboardingStatus, isPending: statusPending } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding/status')
      if (!res.ok) throw new Error('Failed to check onboarding status')
      return res.json() as Promise<{ onboarded: boolean; hasOwnOrg: boolean; orgCount: number }>
    },
    enabled: !!session && !inviteToken,
    retry: 0,
    staleTime: 0,
  })

  // Handle invite acceptance when logged in
  useEffect(() => {
    if (!session || !inviteToken) return
    fetch(`/api/invitations/accept?token=${inviteToken}`)
      .then(r => r.json())
      .then(data => {
        if (data.requiresSignup) {
          navigate(`/signup?invite=${inviteToken}`, { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => {
        navigate('/dashboard', { replace: true })
      })
  }, [session, inviteToken, navigate])

  // Redirect to onboarding if not onboarded
  useEffect(() => {
    if (!session || inviteToken || statusPending || !onboardingStatus) return
    if (!onboardingStatus.onboarded && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true })
    }
  }, [session, inviteToken, statusPending, onboardingStatus, navigate, location.pathname])

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="h-6 w-32" />
      </div>
    )
  }

  if (!session) {
    navigate(inviteToken ? `/login?invite=${inviteToken}` : '/login', { replace: true })
    return null
  }

  if (inviteToken || statusPending) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="h-6 w-48" />
      </div>
    )
  }

  return <Outlet />
}