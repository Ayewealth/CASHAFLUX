import { useQuery } from '@tanstack/react-query'

export interface ReportResult {
  type: string
  generatedAt: string
  dateFrom: string
  dateTo: string
  data: unknown[]
  csv: string
}

async function fetchReport(type: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<ReportResult> {
  const params = new URLSearchParams()
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  const query = params.toString()
  const res = await fetch(`/api/reports/${type}${query ? `?${query}` : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch report')
  }
  return res.json()
}

export function useReport(type: string, filters?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['reports', type, filters],
    queryFn: () => fetchReport(type, filters),
    enabled: !!type,
    staleTime: 30_000,
  })
}

export interface TaxSummary {
  year: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  quarterlyDeadlines: Array<{ quarter: string; deadline: string; deadlineDate: string; status: 'past' | 'upcoming' | 'future' }>
  categories: Array<{ category: string; amount: number }>
}

export interface TaxExport {
  year: number
  totalIncome: number
  totalExpenses: number
  expensesByCategory: Array<{ category: string; amount: number }>
  csv: string
}

async function fetchTaxSummary(year?: number): Promise<TaxSummary> {
  const params = year ? `?year=${year}` : ''
  const res = await fetch(`/api/tax/summary${params}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch tax summary')
  }
  return res.json()
}

async function fetchTaxExport(year?: number): Promise<TaxExport> {
  const params = year ? `?year=${year}` : ''
  const res = await fetch(`/api/tax/export${params}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch tax export')
  }
  return res.json()
}

export function useTaxSummary(year?: number) {
  return useQuery({
    queryKey: ['tax', 'summary', year],
    queryFn: () => fetchTaxSummary(year),
  })
}

export function useTaxExport(year?: number) {
  return useQuery({
    queryKey: ['tax', 'export', year],
    queryFn: () => fetchTaxExport(year),
    enabled: false,
  })
}