import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface FilterDef {
  id: string
  label: string
  render: (value: string, onChange: (v: string) => void) => React.ReactNode
}

interface FilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  filters?: FilterDef[]
  activeFilters: Record<string, string>
  onFilterChange: (id: string, value: string) => void
  onClearFilters: () => void
  className?: string
}

export default function FilterBar({
  search, onSearchChange, searchPlaceholder = 'Search...',
  filters = [], activeFilters, onFilterChange, onClearFilters, className = '',
}: FilterBarProps) {
  const [open, setOpen] = useState(false)
  const activeCount = Object.keys(activeFilters).filter((k) => activeFilters[k]).length

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-10 rounded-xl border-border/50"
        />
      </div>

      {filters.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-border/50 text-sm font-medium text-text-muted hover:text-text hover:bg-muted transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-brand-navy text-white text-[10px] font-medium px-1">
                {activeCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Filters</span>
              {activeCount > 0 && (
                <button onClick={onClearFilters} className="text-xs text-text-muted hover:text-text transition-colors">
                  Clear all
                </button>
              )}
            </div>
            {filters.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">{f.label}</label>
                {f.render(activeFilters[f.id] || '', (v) => onFilterChange(f.id, v))}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 w-full">
          {Object.entries(activeFilters).map(([id, value]) =>
            value ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-brand-navy/5 text-brand-navy text-xs font-medium px-3 py-1"
              >
                {filters.find((f) => f.id === id)?.label || id}: {value}
                <button onClick={() => onFilterChange(id, '')} className="hover:text-text transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null
          )}
          <button onClick={onClearFilters} className="text-xs text-text-muted hover:text-text ml-1 transition-colors">
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}