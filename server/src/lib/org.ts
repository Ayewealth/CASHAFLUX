import { db } from '../db/client'
import { orgMembers } from '@shared/schema'

export async function getUserOrg(userId: string, orgId?: string): Promise<{ orgId: string; role: string } | null> {
  const member = orgId
    ? await db.query.orgMembers.findFirst({
        where: (om, { and, eq }) => and(eq(om.userId, userId), eq(om.orgId, orgId)),
        columns: { orgId: true, role: true },
      })
    : await db.query.orgMembers.findFirst({
        where: (om, { eq }) => eq(om.userId, userId),
        columns: { orgId: true, role: true },
      })
  return member ?? null
}

export async function getUserOrgs(userId: string): Promise<{ orgId: string; role: string; orgName: string }[]> {
  const members = await db.query.orgMembers.findMany({
    where: (om, { eq }) => eq(om.userId, userId),
    columns: { orgId: true, role: true },
  })
  if (members.length === 0) return []
  const orgIds = members.map(m => m.orgId)
  const orgs = await db.query.organizations.findMany({
    where: (o, { inArray }) => inArray(o.id, orgIds),
    columns: { id: true, name: true },
  })
  const orgMap = new Map(orgs.map(o => [o.id, o.name]))
  return members.map(m => ({ orgId: m.orgId, role: m.role, orgName: orgMap.get(m.orgId) ?? '' }))
}