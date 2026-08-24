import { type LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  icon?: LucideIcon
  className?: string
}

const STYLES: Record<string, string> = {
  default: 'bg-muted text-text-muted border-border',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-brand-navy/5 text-brand-navy border-brand-navy/20',
}

export default function StatusBadge({ label, variant = 'default', icon: Icon, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium border ${STYLES[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  )
}