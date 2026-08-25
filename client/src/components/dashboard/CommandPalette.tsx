import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Search, FileText, Wallet, Users, LayoutDashboard, Landmark, BarChart3, Receipt, Settings, Command } from 'lucide-react'

interface CommandItem {
  label: string
  icon: typeof Search
  href: string
  keywords: string[]
}

const COMMANDS: CommandItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', keywords: ['home', 'overview'] },
  { label: 'Invoices', icon: FileText, href: '/dashboard/invoices', keywords: ['bill', 'invoice', 'receivable'] },
  { label: 'New Invoice', icon: FileText, href: '/dashboard/invoices/new', keywords: ['create invoice', 'new bill'] },
  { label: 'Expenses', icon: Wallet, href: '/dashboard/expenses', keywords: ['cost', 'spending', 'receipt'] },
  { label: 'Log Expense', icon: Wallet, href: '/dashboard/expenses/new', keywords: ['add expense', 'new expense'] },
  { label: 'Clients', icon: Users, href: '/dashboard/clients', keywords: ['customer', 'client', 'contact'] },
  { label: 'Bank', icon: Landmark, href: '/dashboard/bank', keywords: ['account', 'reconciliation', 'banking'] },
  { label: 'Reports', icon: BarChart3, href: '/dashboard/reports', keywords: ['p&l', 'profit', 'loss', 'financial'] },
  { label: 'Tax Centre', icon: Receipt, href: '/dashboard/tax', keywords: ['tax', 'irs', 'quarterly'] },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings', keywords: ['preferences', 'profile', 'billing'] },
  { label: 'Team', icon: Users, href: '/dashboard/team', keywords: ['members', 'invite', 'collaboration'] },
]

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.keywords.some(k => k.includes(query.toLowerCase())))
    : COMMANDS

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  function handleSelect(item: CommandItem) {
    navigate(item.href)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex]) }
    if (e.key === 'Escape') { onClose() }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-border/50 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
          />
          <kbd className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto scrollbar-none py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted text-center">No results for "{query}"</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.href}
                onClick={() => handleSelect(item)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors ${i === selectedIndex ? 'bg-brand-navy/5 text-brand-navy' : 'text-text hover:bg-surface'}`}
              >
                <item.icon className="w-4 h-4 text-text-muted shrink-0" />
                <span className="flex-1">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}