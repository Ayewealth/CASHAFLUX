import { useQuery } from '@tanstack/react-query'

export interface KpiMetric {
  value: number
  change: number
  up: boolean
}

export interface DashboardSummary {
  kpis: {
    revenue: KpiMetric
    outstanding: KpiMetric
    expenses: KpiMetric
    netCashFlow: KpiMetric
  }
  cashFlow: {
    income: { month: string; year: string; total: string }[]
    expenses: { month: string; year: string; total: string }[]
  }
  recentInvoices: {
    id: string
    invoiceNumber: string
    clientName: string
    clientCompany: string | null
    amount: string
    dueDate: string
    status: string
  }[]
  recentExpenses: {
    id: string
    date: string
    merchant: string
    category: string
    amount: string
  }[]
  upcomingDue: {
    id: string
    invoiceNumber: string
    clientName: string
    amount: string
    dueDate: string
  }[]
  clientCount: number
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch('/api/dashboard/summary')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch dashboard summary')
  }
  return res.json()
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 1000 * 60 * 2,
  })
}