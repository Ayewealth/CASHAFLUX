import { type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; to: string }
  className?: string
}

export default function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="w-14 h-14 rounded-xl bg-brand-navy/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-brand-navy/30" />
      </div>
      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs mb-5">{description}</p>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}