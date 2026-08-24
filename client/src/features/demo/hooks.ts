import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DemoSession } from '@shared/schema'

interface DemoStatus {
  demoMode: boolean
  demoSessionId: string | null
}

export function useDemoStatus() {
  return useQuery<DemoStatus>({
    queryKey: ['demo', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/demo/status')
      if (!res.ok) throw new Error('Failed to fetch demo status')
      return res.json()
    },
    staleTime: 30 * 1000,
  })
}

export function useToggleDemo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch('/api/demo/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      if (!res.ok) throw new Error('Failed to toggle demo mode')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['mileage'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}