import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BankAccount, InsertBankAccount } from '@shared/schema'

async function fetchBankAccounts(): Promise<BankAccount[]> {
  const res = await fetch('/api/bank-accounts')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch bank accounts')
  }
  return res.json()
}

async function fetchBankAccount(id: string): Promise<BankAccount> {
  const res = await fetch(`/api/bank-accounts/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch bank account')
  }
  return res.json()
}

async function createBankAccount(data: Omit<InsertBankAccount, 'id' | 'orgId'>): Promise<BankAccount> {
  const res = await fetch('/api/bank-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create bank account')
  }
  return res.json()
}

async function updateBankAccount({ id, ...data }: Partial<BankAccount> & { id: string }): Promise<BankAccount> {
  const res = await fetch(`/api/bank-accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to update bank account')
  }
  return res.json()
}

async function deleteBankAccount(id: string): Promise<void> {
  const res = await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to delete bank account')
  }
}

export function useBankAccounts() {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: fetchBankAccounts,
  })
}

export function useBankAccount(id: string) {
  return useQuery({
    queryKey: ['bank-accounts', id],
    queryFn: () => fetchBankAccount(id),
    enabled: !!id,
  })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
    },
  })
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBankAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', variables.id] })
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
    },
  })
}