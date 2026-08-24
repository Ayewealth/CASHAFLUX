import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { authClient } from './auth-client'

export function useAuthRedirect() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [isPending, session, navigate])

  return { isPending, hasSession: !!session }
}