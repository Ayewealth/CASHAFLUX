import { useState } from 'react'
import { MoreHorizontal, UserMinus, History, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useOrgMembers } from '../../features/members/hooks'
import { useActivityLog } from '../../features/team/hooks'
import { toast } from '../../components/ui/toast'

const ROLE_ICONS: Record<string, string> = { owner: '👑', admin: '⚙️', accountant: '📊', member: '👤' }
const ROLE_COLORS: Record<string, string> = { owner: 'text-warning', admin: 'text-accent', accountant: 'text-success', member: 'text-muted-foreground' }

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

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-text tracking-tight">Team</h1><p className="text-sm text-muted-foreground mt-1">Manage team members and permissions</p></div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold text-text">Invite Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="email1@example.com, email2@example.com" value={emails} onChange={(e) => setEmails(e.target.value)} className="h-10 flex-1" />
            <Button onClick={handleInvite} disabled={!emails.trim() || inviting} className="h-10">{inviting ? 'Sending...' : 'Send Invite'}</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Separate multiple emails with commas. Invites are sent via email.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-text">Members ({members?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><Skeleton className="h-20 w-full" /></div> : (
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead className="text-xs uppercase">Name</TableHead><TableHead className="text-xs uppercase hidden sm:table-cell">Email</TableHead><TableHead className="text-xs uppercase">Role</TableHead><TableHead className="text-xs uppercase">Status</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {(members ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No team members yet. Invite someone above.</TableCell></TableRow>
                ) : (members ?? []).map((m: any) => (
                  <TableRow key={m.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-text flex items-center gap-2">
                      <span className="text-sm">{m.name ?? '—'}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell text-sm">{m.email ?? m.userId}</TableCell>
                    <TableCell><span className={`inline-flex items-center gap-1 text-xs font-medium ${ROLE_COLORS[m.role] ?? 'text-muted-foreground'}`}><span>{ROLE_ICONS[m.role] ?? '👤'}</span> {m.role.charAt(0).toUpperCase() + m.role.slice(1)}</span></TableCell>
                    <TableCell>{m.joinedAt ? <span className="text-xs text-success font-medium">Active</span> : <span className="text-xs text-warning font-medium">Invited</span>}</TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-text"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent><DropdownMenuItem className="text-danger" onClick={() => setRemoveId(m.userId)}>Remove</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <button onClick={() => setShowActivity(!showActivity)} className="flex items-center justify-between w-full px-6 py-4 text-sm font-semibold text-text">
          <span className="flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" /> Activity Log</span>
          {showActivity ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showActivity && (
          <CardContent className="p-0 border-t border-border">
            {(activity ?? []).length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              activity?.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 px-6 py-2.5 text-sm border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-text capitalize">{entry.action}</span>
                  <span className="text-muted-foreground">{entry.entityType}</span>
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