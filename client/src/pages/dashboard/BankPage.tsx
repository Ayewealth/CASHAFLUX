import { useState } from 'react'
import { Search, MoreHorizontal, Building2, CreditCard, PiggyBank, ArrowDownRight, ArrowUpRight, Plus, Upload, RefreshCw, Link2, Unlink, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { useBankAccounts } from '../../features/bank-accounts/hooks'
import {
  useBankTransactions,
  useDeleteBankTransaction,
  useReconcileTransaction,
  useUnreconcileTransaction,
  useUnmatchTransaction,
  useMatchInvoice,
  useMatchExpense,
  useReconciliationSummary,
} from '../../features/bank-transactions/hooks'
import { AddBankAccountDialog } from '../../features/bank-accounts/AddBankAccountDialog'
import { AddBankTransactionDialog } from '../../features/bank-transactions/AddBankTransactionDialog'
import { ImportCSVDialog } from '../../features/bank-accounts/ImportCSVDialog'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import MatchPanel from '../../components/dashboard/MatchPanel'
import { Skeleton } from '../../components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { DatePicker } from '../../components/ui/date-picker'
import { cn } from '../../lib/utils'
import { toast } from '../../components/ui/toast'
import { useInvoices } from '../../features/invoices/hooks'
import { useExpenses } from '../../features/expenses/hooks'

const ACCOUNT_ICONS: Record<string, typeof Building2> = {
  checking: Building2,
  savings: PiggyBank,
  credit_card: CreditCard,
}

const TABS = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'reconciliation', label: 'Reconciliation' },
] as const

type TabId = (typeof TABS)[number]['id']

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDefaultMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start, end: now }
}

export default function BankPage() {
  const [activeTab, setActiveTab] = useState<TabId>('accounts')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showAddTxn, setShowAddTxn] = useState(false)
  const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null)
  const [txnDateFrom, setTxnDateFrom] = useState<Date | undefined>()
  const [txnDateTo, setTxnDateTo] = useState<Date | undefined>()
  const [recDateFrom, setRecDateFrom] = useState<Date | undefined>(getDefaultMonthRange().start)
  const [recDateTo, setRecDateTo] = useState<Date | undefined>(getDefaultMonthRange().end)
  const [recAccountId, setRecAccountId] = useState<string | null>(null)
  const [matchPanel, setMatchPanel] = useState<{ txnId: string; txnAmount: string; txnDescription: string } | null>(null)

  const { data: accounts } = useBankAccounts()
  const { data: transactions } = useBankTransactions(selectedAccountId ? { bankAccountId: selectedAccountId, dateFrom: txnDateFrom?.toISOString(), dateTo: txnDateTo?.toISOString() } : undefined)
  const { data: recSummary } = useReconciliationSummary(recAccountId ? { bankAccountId: recAccountId, dateFrom: recDateFrom?.toISOString(), dateTo: recDateTo?.toISOString() } : undefined)
  const { data: recTxns } = useBankTransactions(recAccountId ? { bankAccountId: recAccountId, reconciled: 'false', dateFrom: recDateFrom?.toISOString(), dateTo: recDateTo?.toISOString(), unmatched: 'true' } : undefined)

  const deleteTransaction = useDeleteBankTransaction()
  const reconcileTransaction = useReconcileTransaction()
  const unreconcileTransaction = useUnreconcileTransaction()
  const unmatchTransaction = useUnmatchTransaction()
  const matchInvoice = useMatchInvoice()
  const matchExpense = useMatchExpense()

  const { data: invoices } = useInvoices()
  const { data: expenses } = useExpenses()

  const filtered = (transactions ?? []).filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  function handleReconcile(id: string) {
    reconcileTransaction.mutate(id, {
      onSuccess: () => toast.add({ title: 'Transaction reconciled', type: 'success' }),
    })
  }

  function handleUnreconcile(id: string) {
    unreconcileTransaction.mutate(id, {
      onSuccess: () => toast.add({ title: 'Transaction unreconciled', type: 'info' }),
    })
  }

  function handleUnmatch(id: string) {
    unmatchTransaction.mutate(id)
  }

  function handleMatchInvoice(txnId: string, invoiceId: string) {
    matchInvoice.mutate({ transactionId: txnId, invoiceId }, {
      onSuccess: () => toast.add({ title: 'Invoice matched and marked paid', type: 'success' }),
    })
  }

  function handleMatchExpense(txnId: string, expenseId: string) {
    matchExpense.mutate({ transactionId: txnId, expenseId }, {
      onSuccess: () => toast.add({ title: 'Expense matched', type: 'success' }),
    })
  }

  function renderMatchDropdown(txnId: string, txnAmount: string) {
    const amount = parseFloat(txnAmount)
    const candidates = (invoices ?? []).filter((inv) => {
      const invAmount = parseFloat(inv.total)
      return Math.abs(invAmount - amount) < 0.1
    })
    return (
      <Select onValueChange={(v) => { if (v) handleMatchInvoice(txnId, v as string) }}>
        <SelectTrigger className="h-8 text-xs w-40">
          <span className="truncate">Match to invoice...</span>
        </SelectTrigger>
        <SelectContent>
          {candidates.length === 0 ? (
            <SelectItem value="" disabled>No exact amount matches</SelectItem>
          ) : (
            candidates.map((inv) => (
              <SelectItem key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {formatCurrency(inv.total)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    )
  }

  function getMatchCandidates(txnId: string, txnAmount: string) {
    const amount = parseFloat(txnAmount)
    const invCandidates = (invoices ?? []).filter((inv) => Math.abs(parseFloat(inv.total) - amount) < 0.1).map((inv) => ({
      id: inv.id, label: inv.invoiceNumber, amount: formatCurrency(inv.total), type: 'invoice' as const, confidence: 0.95,
    }))
    const expCandidates = (expenses ?? []).filter((exp) => Math.abs(parseFloat(exp.amount) - amount) < 0.1).map((exp) => ({
      id: exp.id, label: exp.merchant, amount: formatCurrency(exp.amount), type: 'expense' as const, confidence: 0.85,
    }))
    return [...invCandidates, ...expCandidates]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Bank & Reconciliation</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage accounts, transactions, and reconcile your books</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button className="gap-1.5" onClick={() => setShowAddAccount(true)}>
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Accounts */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!accounts ? (
            Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>)
          ) : accounts.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No accounts yet. <button onClick={() => setShowAddAccount(true)} className="text-accent hover:underline">Add one.</button>
              </CardContent>
            </Card>
          ) : (
            accounts.map((acc) => {
              const Icon = ACCOUNT_ICONS[acc.type] ?? Building2
              return (
                <Card
                  key={acc.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedAccountId === acc.id ? 'ring-2 ring-accent' : 'hover:border-accent/30'
                  )}
                  onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? null : acc.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{acc.name}</CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold text-text tracking-tight">{formatCurrency(acc.currentBalance)}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{acc.bankName ?? '—'} · {acc.type.replace('_', ' ')} · {acc.currency}</p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Tab: Transactions */}
      {activeTab === 'transactions' && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedAccountId ?? ''} onValueChange={(v) => setSelectedAccountId(v || null)}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <span className="truncate">{selectedAccountId ? accounts?.find((a) => a.id === selectedAccountId)?.name ?? 'Select' : 'All accounts'}</span>
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePicker value={txnDateFrom} onChange={(d) => setTxnDateFrom(d)} placeholder="From" />
              <DatePicker value={txnDateTo} onChange={(d) => setTxnDateTo(d)} placeholder="To" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full sm:w-48 pl-8 text-xs" />
              </div>
              {selectedAccountId && (
                <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => setShowAddTxn(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              )}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs uppercase">Date</TableHead>
                <TableHead className="text-xs uppercase">Description</TableHead>
                <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                <TableHead className="text-xs uppercase text-center">Reconciled</TableHead>
                <TableHead className="text-xs uppercase text-center hidden md:table-cell">Matched</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedAccountId ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Select an account to view transactions</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No transactions found</TableCell></TableRow>
              ) : (
                filtered.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', tx.type === 'credit' ? 'bg-success/10' : 'bg-danger/10')}>
                          {tx.type === 'credit' ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-danger" />}
                        </div>
                        <span className="font-medium text-text text-sm">{tx.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className={cn('text-right font-semibold text-sm', tx.type === 'credit' ? 'text-success' : 'text-danger')}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {tx.reconciled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success font-medium"><CheckCircle className="h-3 w-3" /> Yes</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3 w-3" /> No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      {tx.matchedInvoiceId ? (
                        <span className="text-xs text-accent font-medium">Invoice</span>
                      ) : tx.matchedExpenseId ? (
                        <span className="text-xs text-accent font-medium">Expense</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-text">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!tx.reconciled ? (
                            <DropdownMenuItem onClick={() => handleReconcile(tx.id)}>Mark Reconciled</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUnreconcile(tx.id)}>Unreconcile</DropdownMenuItem>
                          )}
                          {tx.matchedInvoiceId || tx.matchedExpenseId ? (
                            <DropdownMenuItem onClick={() => handleUnmatch(tx.id)}>Unmatch</DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => setDeleteTxnId(tx.id)} className="text-danger">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="px-4 py-2 border-t border-border flex justify-between text-xs text-muted-foreground">
            <span>{filtered.length} transactions</span>
          </div>
        </div>
      )}

      {/* Tab: Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account</Label>
              <Select value={recAccountId ?? ''} onValueChange={(v) => setRecAccountId(v || null)}>
                <SelectTrigger className="h-9 w-48">
                  <span className="truncate text-sm">{recAccountId ? accounts?.find((a) => a.id === recAccountId)?.name ?? 'Select' : 'Select account...'}</span>
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <DatePicker value={recDateFrom} onChange={(d) => setRecDateFrom(d)} placeholder="From" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <DatePicker value={recDateTo} onChange={(d) => setRecDateTo(d)} placeholder="To" />
            </div>
          </div>

          {recSummary && recAccountId && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold text-text mt-1">{formatCurrency(recSummary.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">{recSummary.totalTransactions} txns</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reconciled</p>
                  <p className="text-lg font-bold text-success mt-1">{formatCurrency(recSummary.reconciledAmount)}</p>
                  <p className="text-xs text-muted-foreground">{recSummary.reconciledTransactions} txns</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unreconciled</p>
                  <p className="text-lg font-bold text-warning mt-1">{formatCurrency(recSummary.unreconciledAmount)}</p>
                  <p className="text-xs text-muted-foreground">{recSummary.unreconciledTransactions} txns</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Matched to invoices</p>
                  <p className="text-lg font-bold text-accent mt-1">{formatCurrency(recSummary.matchedToInvoiceAmount)}</p>
                  <p className="text-xs text-muted-foreground">+ {formatCurrency(recSummary.matchedToExpenseAmount)} expenses</p>
                </CardContent>
              </Card>
            </div>
          )}

          {!recAccountId ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Select an account above to view unreconciled transactions and match them to invoices or expenses.
              </CardContent>
            </Card>
          ) : (recTxns ?? []).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                All transactions are reconciled for this period.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text">
                  Unreconciled Transactions <span className="text-muted-foreground font-normal">({recTxns?.length})</span>
                </h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase">Date</TableHead>
                    <TableHead className="text-xs uppercase">Description</TableHead>
                    <TableHead className="text-xs uppercase text-right">Amount</TableHead>
                    <TableHead className="text-xs uppercase">Match</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(recTxns ?? []).map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30">
                      <TableCell className="text-muted-foreground text-sm">{formatDate(tx.date)}</TableCell>
                      <TableCell className="text-sm font-medium text-text">{tx.description}</TableCell>
                      <TableCell className={cn('text-right font-semibold text-sm', tx.type === 'credit' ? 'text-success' : 'text-danger')}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => setMatchPanel({ txnId: tx.id, txnAmount: tx.amount, txnDescription: tx.description })}
                        >
                          <Link2 className="h-3 w-3" /> Match
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs px-2"
                            onClick={() => handleReconcile(tx.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Reconcile
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddBankAccountDialog open={showAddAccount} onClose={() => setShowAddAccount(false)} />
      <AddBankTransactionDialog open={showAddTxn} onClose={() => setShowAddTxn(false)} bankAccountId={selectedAccountId ?? ''} />
      <ImportCSVDialog open={showImport} onClose={() => setShowImport(false)} />

      <ConfirmDialog
        open={!!deleteTxnId}
        onClose={() => setDeleteTxnId(null)}
        onConfirm={() => { deleteTransaction.mutate(deleteTxnId!); setDeleteTxnId(null) }}
        title="Delete transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />

      <MatchPanel
        open={!!matchPanel}
        onClose={() => setMatchPanel(null)}
        transactionAmount={matchPanel ? formatCurrency(matchPanel.txnAmount) : ''}
        transactionDescription={matchPanel?.txnDescription ?? ''}
        txnId={matchPanel?.txnId ?? ''}
        candidates={matchPanel ? getMatchCandidates(matchPanel.txnId, matchPanel.txnAmount) : []}
        onMatchInvoice={handleMatchInvoice}
        onMatchExpense={handleMatchExpense}
      />
    </div>
  )
}