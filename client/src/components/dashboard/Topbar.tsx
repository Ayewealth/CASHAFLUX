import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { authClient } from '../../lib/auth-client'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Plus, Search, Bell, FileText, Wallet, UserPlus, LogOut, User, Settings, ChevronRight, Menu,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface TopbarProps {
  mobileOpen: boolean
  onMobileToggle: () => void
}

const BREADCRUMB_LABELS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'invoices': 'Invoices',
  'expenses': 'Expenses',
  'clients': 'Clients',
  'bank': 'Bank',
  'reports': 'Reports',
  'tax': 'Tax Centre',
  'payroll': 'Payroll',
  'team': 'Team',
  'settings': 'Settings',
}

function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0 || segments[0] !== 'dashboard') return null

  const crumbs: { label: string; path: string }[] = []
  let path = ''
  // Skip 'dashboard' segment for breadcrumbs, it's the root
  for (const segment of segments.slice(1)) {
    path += `/${segment}`
    const label = BREADCRUMB_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    crumbs.push({ label, path: '/dashboard' + path })
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <a href="/dashboard" className="text-text-muted hover:text-text transition-colors">Dashboard</a>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-text">{crumb.label}</span>
          ) : (
            <a href={crumb.path} className="text-text-muted hover:text-text transition-colors">{crumb.label}</a>
          )}
        </span>
      ))}
    </nav>
  )
}

function QuickActions() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const actions = [
    { label: 'New Invoice', icon: FileText, href: '/dashboard/invoices/new' },
    { label: 'Log Expense', icon: Wallet, href: '/dashboard/expenses/new' },
    { label: 'Add Client', icon: UserPlus, href: '/dashboard/clients' },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Quick Actions</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        {actions.map((action) => (
          <button
            key={action.href}
            onClick={() => { navigate(action.href); setOpen(false) }}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-text hover:bg-muted transition-colors"
          >
            <action.icon className="h-4 w-4 text-text-muted" />
            {action.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { data: session } = authClient.useSession()

  const user = session?.user
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  async function handleSignOut() {
    await authClient.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
          {initials}
        </div>
        <span className="hidden md:block text-sm font-medium text-text max-w-[120px] truncate">
          {user?.name || 'User'}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <div className="px-3 py-2 border-b border-border mb-1">
          <p className="text-sm font-medium text-text">{user?.name}</p>
          <p className="text-xs text-text-muted truncate">{user?.email}</p>
        </div>
        <button
          onClick={() => { navigate('/dashboard/settings'); setOpen(false) }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-text hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4 text-text-muted" />
          Settings
        </button>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  )
}

export default function Topbar({ mobileOpen, onMobileToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface px-4 lg:px-6">
      <button
        onClick={onMobileToggle}
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted transition-colors text-text-muted"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Breadcrumbs />

      <div className="flex-1" />

      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search..."
          className="h-9 w-56 rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
        />
      </div>

      <QuickActions />

      <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
        <Bell className="h-5 w-5 text-text-muted" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
      </button>

      <UserMenu />
    </header>
  )
}