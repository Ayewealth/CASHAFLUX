import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface MileageLog {
  id: string
  orgId: string
  date: string
  origin: string
  destination: string
  miles: string
  purpose: string | null
  createdBy: string
  createdAt: string
}

interface MileageResponse {
  logs: MileageLog[]
  totalMiles: number
  totalDeduction: number
}

async function fetchMileageLogs(filters?: { dateFrom?: string; dateTo?: string }): Promise<MileageResponse> {
  const params = new URLSearchParams()
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  const query = params.toString()
  const res = await fetch(`/api/mileage${query ? `?${query}` : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch mileage logs')
  }
  return res.json()
}

async function createMileageLog(data: Record<string, unknown>): Promise<MileageLog> {
  const res = await fetch('/api/mileage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create mileage log')
  }
  return res.json()
}

async function deleteMileageLog(id: string): Promise<void> {
  const res = await fetch(`/api/mileage/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to delete mileage log')
  }
}

export function useMileageLogs(filters?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['mileage', filters],
    queryFn: () => fetchMileageLogs(filters),
  })
}

export function useCreateMileageLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMileageLog,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mileage'] }) },
  })
}

export function useDeleteMileageLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMileageLog,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mileage'] }) },
  })
}