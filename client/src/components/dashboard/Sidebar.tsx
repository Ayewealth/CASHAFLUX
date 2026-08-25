import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import { LayoutDashboard, FileText, Wallet, Users, Landmark, BarChart3,
  Receipt, Briefcase, UserPlus, Settings, PanelLeftClose, PanelLeft, Navigation, Lock, Activity } from 'lucide-react'
import Logo from '../../components/shared/Logo'
import OrgSwitcher from './OrgSwitcher'
import PlanUsage from './PlanUsage'
import OnboardingChecklist from './OnboardingChecklist'
import { cn } from '../../lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string
  locked?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Business',
    items: [
      { path: '/dashboard/invoices', label: 'Invoices', icon: FileText },
      { path: '/dashboard/expenses', label: 'Expenses', icon: Wallet },
      { path: '/dashboard/mileage', label: 'Mileage', icon: Navigation },
      { path: '/dashboard/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    label: 'Finances',
    items: [
      { path: '/dashboard/bank', label: 'Bank', icon: Landmark, locked: true },
      { path: '/dashboard/reports', label: 'Reports', icon: BarChart3, locked: true },
      { path: '/dashboard/tax', label: 'Tax Centre', icon: Receipt, locked: true },
      { path: '/dashboard/payroll', label: 'Payroll', icon: Briefcase, locked: true },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/dashboard/team', label: 'Team', icon: UserPlus },
      { path: '/dashboard/activity', label: 'Activity', icon: Activity },
      { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function NavLink({ item, collapsed, onHover, onLeave }: { item: NavItem; collapsed: boolean; onHover: (label: string) => void; onLeave: () => void }) {
  const location = useLocation()
  const isActive =
    item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path)

  return (
    <Link
      to={item.locked ? '/dashboard/settings?tab=billing' : item.path}
      onClick={() => {
        const main = document.getElementById('sidebar-mobile-overlay')
        if (main) main.click()
      }}
      onMouseEnter={() => collapsed && onHover(item.label)}
      onMouseLeave={onLeave}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center mx-2' : 'mx-3',
        isActive
          ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
          : 'text-white/60 hover:bg-white/5 hover:text-white/90',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-brand-blue shadow-[0_0_6px_rgba(37,99,235,0.5)]" />
      )}
      <item.icon className={cn('h-5 w-5 shrink-0', collapsed ? 'h-5 w-5' : 'h-4.5 w-4.5')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.locked && (
        <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-white/30" />
      )}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-brand-blue/20 px-2 py-0.5 text-[11px] font-semibold text-brand-blue-light">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)

  const handleHover = useCallback((label: string) => setHoveredLabel(label), [])
  const handleLeave = useCallback(() => setHoveredLabel(null), [])

  return (
    <>
      {mobileOpen && (
        <div
          id="sidebar-mobile-overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-brand-navy to-brand-navy-dark text-white transition-all duration-300 ease-in-out border-r border-white/5',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-14 items-center border-b border-white/10 shrink-0', collapsed ? 'justify-center' : 'px-4')}>
          {collapsed ? (
            <Logo showWordmark={false} iconBg />
          ) : (
            <Logo light iconBg />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-none py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-5 mb-1 text-[10px] font-mono font-medium uppercase tracking-widest text-white/30">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.path} item={item} collapsed={collapsed} onHover={handleHover} onLeave={handleLeave} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={onToggle}
          className={cn(
            'hidden lg:flex items-center justify-center h-8 w-8 rounded-full bg-surface border border-border shadow-md transition-colors hover:bg-muted z-10',
            collapsed ? 'absolute -right-3 top-5' : 'absolute -right-4 top-5',
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5 text-text-muted" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-text-muted" />
          )}
        </button>

        {/* Tooltip for collapsed nav items */}
        {collapsed && hoveredLabel && (
          <div className="fixed left-[4.5rem] top-1/2 -translate-y-1/2 z-[60] pointer-events-none">
            <div className="rounded-md bg-brand-navy/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10 whitespace-nowrap">
              {hoveredLabel}
            </div>
          </div>
        )}

        {/* Onboarding checklist */}
        <div className={collapsed ? 'px-1' : ''}>
          <OnboardingChecklist collapsed={collapsed} />
        </div>

        {/* Plan usage */}
        <div className={collapsed ? 'px-1' : ''}>
          <PlanUsage collapsed={collapsed} />
        </div>

        {/* Org switcher */}
        <div className={cn('border-t border-white/10 py-3', collapsed ? 'px-2' : 'px-3')}>
          <OrgSwitcher collapsed={collapsed} />
        </div>

      </aside>
    </>
  )
}