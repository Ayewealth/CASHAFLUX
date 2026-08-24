import { useQuery } from '@tanstack/react-query'

export interface OrgMemberWithUser {
  id: string
  orgId: string
  userId: string
  role: string
  invitedAt: string | null
  joinedAt: string | null
  name: string
  email: string
}

async function fetchOrgMembers(): Promise<OrgMemberWithUser[]> {
  const res = await fetch('/api/members')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch members')
  }
  return res.json()
}

export function useOrgMembers() {
  return useQuery({
    queryKey: ['org-members'],
    queryFn: fetchOrgMembers,
  })
}