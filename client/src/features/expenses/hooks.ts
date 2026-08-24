import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Expense, ExpenseCategory } from '@shared/schema'

export interface ExpenseFilters {
  category?: string
  reconciled?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: string
  amountMax?: string
  search?: string
}

async function fetchExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.set('category', filters.category)
  if (filters?.reconciled !== undefined) params.set('reconciled', filters.reconciled)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.amountMin) params.set('amountMin', filters.amountMin)
  if (filters?.amountMax) params.set('amountMax', filters.amountMax)
  if (filters?.search) params.set('search', filters.search)
  const query = params.toString()
  const res = await fetch(`/api/expenses${query ? `?${query}` : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch expenses')
  }
  return res.json()
}

async function fetchExpense(id: string): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch expense')
  }
  return res.json()
}

async function createExpense(data: Record<string, unknown>): Promise<Expense> {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create expense')
  }
  return res.json()
}

async function updateExpense({ id, ...data }: Partial<Expense> & { id: string }): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to update expense')
  }
  return res.json()
}

async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to delete expense')
  }
}

async function uploadReceipt({ id, file }: { id: string; file: File }): Promise<{ key: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api/expenses/${id}/receipt`, { method: 'POST', body: formData })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to upload receipt')
  }
  return res.json()
}

async function bulkDeleteExpenses(ids: string[]): Promise<void> {
  const res = await fetch('/api/expenses/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to bulk delete expenses')
  }
}

async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await fetch('/api/expense-categories')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch categories')
  }
  return res.json()
}

async function createExpenseCategory(data: { name: string }): Promise<ExpenseCategory> {
  const res = await fetch('/api/expense-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create category')
  }
  return res.json()
}

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => fetchExpenses(filters),
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => fetchExpense(id),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }) },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }) },
  })
}

export function useUploadReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadReceipt,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }) },
  })
}

export function useBulkDeleteExpenses() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkDeleteExpenses,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }) },
  })
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expense-categories'] }) },
  })
}