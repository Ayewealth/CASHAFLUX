import { useState } from 'react'
import { MoreHorizontal, UserMinus, History, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { useOrgMembers } from '../../features/members/hooks'
import { useActivityLog } from '../../features/team/hooks'
import { toast } from '../../components/ui/toast'
import DataTable from '../../components/dashboard/DataTable'
import EmptyState from '../../components/dashboard/EmptyState'

const ROLE_COLORS: Record<string, string> = {
  owner: 'text-warning bg-warning/10',
  admin: 'text-brand-navy bg-brand-navy/5',
  accountant: 'text-success bg-success/10',
  member: 'text-text-muted bg-muted',
}

export default function TeamPage() {
  const [emails, setEmails] = useState('')
  const [inviting, setInviting] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const { data: members, isLoading } = useOrgMembers()
  const { data: activity } = useActivityLog()

  async function handleInvite() {
    if (!emails.trim()) return
    setInviting(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emails.split(',').map(e => e.trim()).filter(Boolean) }),
      })
      const result = await res.json()
      toast.add({ title: `${result.invited} invitations sent`, type: 'success' })
      setEmails('')
    } catch { toast.add({ title: 'Failed to send invitations', type: 'error' }) }
    setInviting(false)
  }

  async function handleRemove(userId: string) {
    try {
      await fetch(`/api/team/${userId}`, { method: 'DELETE' })
      toast.add({ title: 'Member removed', type: 'success' })
      setRemoveId(null)
    } catch { toast.add({ title: 'Failed to remove member', type: 'error' }) }
  }

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: ({ row }: any) => <span className="font-medium text-text">{row.original.name ?? '—'}</span> },
    { header: 'Email', accessorKey: 'email', cell: ({ row }: any) => <span className="text-text-muted">{row.original.email ?? row.original.userId}</span> },
    {
      header: 'Role', accessorKey: 'role',
      cell: ({ getValue }: any) => {
        const role = getValue() as string
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? 'text-text-muted bg-muted'}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        )
      },
    },
    {
      header: 'Status', accessorKey: 'joinedAt',
      cell: ({ getValue }: any) => getValue()
        ? <span className="text-xs text-success font-medium">Active</span>
        : <span className="text-xs text-warning font-medium">Invited</span>,
    },
    {
      header: '', accessorKey: 'userId',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-text-muted hover:text-text"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem className="text-danger" onClick={() => setRemoveId(row.original.userId)}>Remove</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-text tracking-tight">Team</h1><p className="text-sm text-text-muted mt-1">Manage team members and permissions</p></div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold text-text">Invite Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="email1@example.com, email2@example.com" value={emails} onChange={(e) => setEmails(e.target.value)} className="h-10 flex-1" />
            <Button onClick={handleInvite} disabled={!emails.trim() || inviting} className="h-10">{inviting ? 'Sending...' : 'Send Invite'}</Button>
          </div>
          <p className="text-xs text-text-muted mt-2">Separate multiple emails with commas. Invites are sent via email.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-text">Members ({members?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><Skeleton className="h-20 w-full" /></div>
          ) : (members ?? []).length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Users} title="No team members yet" description="Invite someone above to get started." />
            </div>
          ) : (
            <DataTable columns={columns} data={members ?? []} emptyMessage="No team members" />
          )}
        </CardContent>
      </Card>

      <Card>
        <button onClick={() => setShowActivity(!showActivity)} className="flex items-center justify-between w-full px-6 py-4 text-sm font-semibold text-text">
          <span className="flex items-center gap-2"><History className="h-4 w-4 text-text-muted" /> Activity Log</span>
          {showActivity ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showActivity && (
          <CardContent className="p-0 border-t border-border">
            {(activity ?? []).length === 0 ? (
              <p className="px-6 py-4 text-sm text-text-muted">No activity recorded yet.</p>
            ) : (
              activity?.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 px-6 py-2.5 text-sm border-b border-border last:border-0">
                  <span className="text-xs text-text-muted">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-text capitalize">{entry.action}</span>
                  <span className="text-text-muted">{entry.entityType}</span>
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>

      <ConfirmDialog open={!!removeId} onClose={() => setRemoveId(null)} onConfirm={() => handleRemove(removeId!)} title="Remove member?" description="They will lose access to this organization." confirmLabel="Remove" />
    </div>
  )
}