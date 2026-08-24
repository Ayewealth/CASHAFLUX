import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organization } from '@shared/schema'

async function fetchSettings(): Promise<Organization> {
  const res = await fetch('/api/settings')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch settings')
  }
  return res.json()
}

async function updateSettings(data: Partial<Organization>): Promise<Organization> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to update settings')
  }
  return res.json()
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}