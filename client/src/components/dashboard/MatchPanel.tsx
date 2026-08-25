import { X, CheckCircle, FileText, DollarSign, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface MatchOption {
  id: string
  label: string
  amount: string
  type: 'invoice' | 'expense'
  confidence: number
}

interface MatchPanelProps {
  open: boolean
  onClose: () => void
  transactionAmount: string
  transactionDescription: string
  candidates: MatchOption[]
  onMatchInvoice: (txnId: string, invoiceId: string) => void
  onMatchExpense: (txnId: string, expenseId: string) => void
  txnId: string
}

export default function MatchPanel({ open, onClose, transactionAmount, transactionDescription, candidates, onMatchInvoice, onMatchExpense, txnId }: MatchPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Match Transaction</h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-surface transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-border bg-surface">
              <p className="text-xs text-text-muted mb-1">Transaction</p>
              <p className="text-sm font-medium text-text">{transactionDescription}</p>
              <p className="text-sm font-semibold text-brand-navy mt-0.5">{transactionAmount}</p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-4">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                Suggested matches ({candidates.length})
              </p>

              {candidates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-brand-navy/30" />
                  </div>
                  <p className="text-sm text-text-muted">No exact matches found</p>
                  <p className="text-xs text-text-muted mt-1">Reconcile manually or adjust the amount range</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {candidates.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border p-4 hover:border-brand-navy/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', c.type === 'invoice' ? 'bg-brand-navy/10' : 'bg-rose-50')}>
                            {c.type === 'invoice' ? <FileText className="w-3.5 h-3.5 text-brand-navy" /> : <DollarSign className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                          <span className="text-sm font-medium text-text">{c.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-text font-mono">{c.amount}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', c.confidence >= 0.9 ? 'bg-success' : c.confidence >= 0.7 ? 'bg-warning' : 'bg-brand-navy/30')}
                            style={{ width: `${c.confidence * 100}%` }}
                          />
                        </div>
                        <span className={cn('text-[10px] font-medium', c.confidence >= 0.9 ? 'text-success' : c.confidence >= 0.7 ? 'text-warning' : 'text-text-muted')}>
                          {Math.round(c.confidence * 100)}%
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full h-8 text-xs gap-1"
                        onClick={() => {
                          if (c.type === 'invoice') onMatchInvoice(txnId, c.id)
                          else onMatchExpense(txnId, c.id)
                          onClose()
                        }}
                      >
                        <CheckCircle className="w-3 h-3" /> Match & Reconcile
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}