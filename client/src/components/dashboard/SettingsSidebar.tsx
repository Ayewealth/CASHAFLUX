import { Settings, Building2, FileText, Bell, CreditCard, Shield, Database, Monitor, FlaskConical } from 'lucide-react'

export interface SettingsTab {
  id: string
  label: string
  icon: typeof Settings
}

export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'invoice-defaults', label: 'Invoice Defaults', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data & Privacy', icon: Database },
  { id: 'demo', label: 'Demo Mode', icon: FlaskConical },
  { id: 'display', label: 'Display', icon: Monitor },
]

interface SettingsSidebarProps {
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export default function SettingsSidebar({ activeTab, onTabChange, className = '' }: SettingsSidebarProps) {
  return (
    <nav className={`w-56 shrink-0 space-y-1 sticky top-20 self-start ${className}`}>
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-150 ${
              isActive
                ? 'bg-brand-navy/5 border-l-2 border-brand-navy text-brand-navy'
                : 'border-l-2 border-transparent text-text-muted hover:text-text hover:bg-brand-navy/[0.02]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}