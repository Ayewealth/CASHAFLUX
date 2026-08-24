import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BankTransaction } from '@shared/schema'

export interface BankTransactionFilters {
  bankAccountId?: string
  type?: string
  reconciled?: string
  dateFrom?: string
  dateTo?: string
  unmatched?: string
}

export interface ImportColumnMap {
  date: number
  description: number
  amount: number
  type?: number
  category?: number
}

export interface ImportTransactionsPayload {
  bankAccountId: string
  columnMap: ImportColumnMap
  rows: string[][]
  hasHeader: boolean
}

export interface ImportResult {
  imported: number
  skipped: number
  duplicates: number
  duplicateDetails: Array<{ date: string; description: string; amount: string }>
  transactions: BankTransaction[]
}

interface ReconcileSummary {
  totalTransactions: number
  totalAmount: number
  reconciledTransactions: number
  reconciledAmount: number
  unreconciledTransactions: number
  unreconciledAmount: number
  matchedToInvoiceAmount: number
  matchedToExpenseAmount: number
}

async function fetchBankTransactions(filters?: BankTransactionFilters): Promise<BankTransaction[]> {
  const params = new URLSearchParams()
  if (filters?.bankAccountId) params.set('bankAccountId', filters.bankAccountId)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.reconciled !== undefined) params.set('reconciled', filters.reconciled)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.unmatched) params.set('unmatched', filters.unmatched)
  const query = params.toString()
  const res = await fetch(`/api/bank-transactions${query ? `?${query}` : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch bank transactions')
  }
  return res.json()
}

async function fetchBankTransaction(id: string): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch bank transaction')
  }
  return res.json()
}

async function createBankTransaction(data: {
  bankAccountId?: string
  date: string
  description: string
  amount: string
  type: 'debit' | 'credit'
  category?: string | null
  reconciled?: boolean
}): Promise<BankTransaction> {
  const res = await fetch('/api/bank-transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create bank transaction')
  }
  return res.json()
}

async function importBankTransactions(data: ImportTransactionsPayload): Promise<ImportResult> {
  const res = await fetch('/api/bank-transactions/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to import bank transactions')
  }
  return res.json()
}

async function updateBankTransaction({ id, ...data }: Partial<BankTransaction> & { id: string }): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to update bank transaction')
  }
  return res.json()
}

async function deleteBankTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/bank-transactions/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to delete bank transaction')
  }
}

async function matchInvoice({ transactionId, invoiceId }: { transactionId: string; invoiceId: string }): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${transactionId}/match-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to match invoice')
  }
  return res.json()
}

async function matchExpense({ transactionId, expenseId }: { transactionId: string; expenseId: string }): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${transactionId}/match-expense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expenseId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to match expense')
  }
  return res.json()
}

async function unmatchTransaction(id: string): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${id}/unmatch`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to unmatch transaction')
  }
  return res.json()
}

async function reconcileTransaction(id: string): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${id}/reconcile`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to reconcile transaction')
  }
  return res.json()
}

async function unreconcileTransaction(id: string): Promise<BankTransaction> {
  const res = await fetch(`/api/bank-transactions/${id}/unreconcile`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to unreconcile transaction')
  }
  return res.json()
}

async function fetchReconciliationSummary(filters?: { bankAccountId?: string; dateFrom?: string; dateTo?: string }): Promise<ReconcileSummary> {
  const params = new URLSearchParams()
  if (filters?.bankAccountId) params.set('bankAccountId', filters.bankAccountId)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  const query = params.toString()
  const res = await fetch(`/api/bank-transactions/reconciliation-summary${query ? `?${query}` : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch reconciliation summary')
  }
  return res.json()
}

export function useBankTransactions(filters?: BankTransactionFilters) {
  return useQuery({
    queryKey: ['bank-transactions', filters],
    queryFn: () => fetchBankTransactions(filters),
  })
}

export function useBankTransaction(id: string) {
  return useQuery({
    queryKey: ['bank-transactions', id],
    queryFn: () => fetchBankTransaction(id),
    enabled: !!id,
  })
}

export function useCreateBankTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBankTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useImportBankTransactions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: importBankTransactions,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useUpdateBankTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBankTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bank-transactions', variables.id] })
    },
  })
}

export function useDeleteBankTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBankTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useMatchInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: matchInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useMatchExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: matchExpense,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useUnmatchTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unmatchTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useReconcileTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reconcileTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useUnreconcileTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unreconcileTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-transactions'] }) },
  })
}

export function useReconciliationSummary(filters?: { bankAccountId?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['bank-transactions', 'reconciliation-summary', filters],
    queryFn: () => fetchReconciliationSummary(filters),
    enabled: !!filters?.bankAccountId,
  })
}