import { useQuery } from '@tanstack/react-query'

export interface ActivityLogEntry {
  id: string
  orgId: string
  userId: string
  action: string
  entityType: string
  entityId: string | null
  createdAt: string
}

async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
  const res = await fetch('/api/activity-log')
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? 'Failed to fetch activity log') }
  return res.json()
}

export function useActivityLog() {
  return useQuery({ queryKey: ['activity-log'], queryFn: fetchActivityLog })
}