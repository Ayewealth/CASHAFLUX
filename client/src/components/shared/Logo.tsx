import { Link, useLocation } from 'react-router'
import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  light?: boolean
  iconBg?: boolean
}

export default function Logo({ className, showWordmark = true, light, iconBg }: LogoProps) {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const href = isDashboard ? '/dashboard' : '/'

  const icon = (
    <svg viewBox="0 0 78 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-5 h-6">
      <rect x="10" y="45" width="14" height="35" rx="7" fill="#1E3A5F" />
      <rect x="32" y="25" width="14" height="55" rx="7" fill="#1E3A5F" />
      <rect x="54" y="5" width="14" height="75" rx="7" fill="#2563EB" fillOpacity="0.15" />
      <circle cx="61" cy="12" r="7" fill="#2563EB" />
    </svg>
  )

  return (
    <Link to={href} className={cn('flex items-center gap-2.5 group', className)}>
      {iconBg ? (
        <div className="flex items-center justify-center rounded-lg bg-white shrink-0 p-1">
          {icon}
        </div>
      ) : (
        icon
      )}
      {showWordmark && (
        <span
          className={cn('text-lg font-bold tracking-tight', light ? 'text-white' : 'text-brand-navy dark:text-white')}
          style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
        >
          Cashaflux
        </span>
      )}
    </Link>
  )
}