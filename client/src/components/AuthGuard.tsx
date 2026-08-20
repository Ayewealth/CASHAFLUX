import { useNavigate, Outlet } from 'react-router'
import { authClient } from '../lib/auth-client'
import { Skeleton } from './ui/skeleton'

export default function AuthGuard() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="h-6 w-32" />
      </div>
    )
  }

  if (!session) {
    void navigate('/login', { replace: true })
    return null
  }

  return <Outlet />
}
