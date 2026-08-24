import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organization } from '@shared/schema'

async function fetchOrganization(): Promise<Organization> {
  const res = await fetch('/api/organizations')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch organization')
  }
  return res.json()
}

async function updateOrganization(data: Partial<Organization>): Promise<Organization> {
  const res = await fetch('/api/organizations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to update organization')
  }
  return res.json()
}

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: fetchOrganization,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}