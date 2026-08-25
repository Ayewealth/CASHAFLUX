import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, FileText, Wallet, UserPlus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export default function MobileFAB() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const actions = [
    { label: 'New Invoice', icon: FileText, href: '/dashboard/invoices/new', color: 'bg-brand-navy' },
    { label: 'Log Expense', icon: Wallet, href: '/dashboard/expenses/new', color: 'bg-warning' },
    { label: 'Add Client', icon: UserPlus, href: '/dashboard/clients', color: 'bg-brand-blue' },
  ]

  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && actions.map((action, i) => (
          <motion.button
            key={action.href}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { navigate(action.href); setOpen(false) }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg ${action.color} active:scale-95 transition-transform`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </motion.button>
        ))}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-brand-navy text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  )
}