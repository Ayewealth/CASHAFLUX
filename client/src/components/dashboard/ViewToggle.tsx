import { LayoutGrid, List } from 'lucide-react'

interface ViewToggleProps {
  view: 'table' | 'grid'
  onChange: (v: 'table' | 'grid') => void
  className?: string
}

export default function ViewToggle({ view, onChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex gap-0.5 bg-surface border border-border/50 rounded-lg p-0.5 ${className}`}>
      <button
        onClick={() => onChange('table')}
        className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-muted hover:text-text'}`}
        aria-label="Table view"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-muted hover:text-text'}`}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  )
}