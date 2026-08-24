import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PayrollEntry } from '@shared/schema'

export interface PayrollResponse {
  entries: PayrollEntry[]
  totalEmployees: number
  mtdTotal: number
  ytdTotal: number
}

async function fetchPayroll(year?: number): Promise<PayrollResponse> {
  const params = year ? `?year=${year}` : ''
  const res = await fetch(`/api/payroll${params}`)
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? 'Failed to fetch payroll') }
  return res.json()
}

async function createPayrollEntry(data: Record<string, unknown>): Promise<PayrollEntry> {
  const res = await fetch('/api/payroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? 'Failed to create payroll entry') }
  return res.json()
}

async function deletePayrollEntry(id: string): Promise<void> {
  const res = await fetch(`/api/payroll/${id}`, { method: 'DELETE' })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? 'Failed to delete payroll entry') }
}

export function usePayroll(year?: number) {
  return useQuery({ queryKey: ['payroll', year], queryFn: () => fetchPayroll(year) })
}

export function useCreatePayrollEntry() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: createPayrollEntry, onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }) })
}

export function useDeletePayrollEntry() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: deletePayrollEntry, onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }) })
}