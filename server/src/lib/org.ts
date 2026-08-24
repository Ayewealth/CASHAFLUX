import { db } from '../db/client'
import { orgMembers } from '@shared/schema'
import { eq } from 'drizzle-orm'

export async function getUserOrg(userId: string): Promise<{ orgId: string; role: string } | null> {
  const member = await db.query.orgMembers.findFirst({
    where: (om, { eq }) => eq(om.userId, userId),
    columns: { orgId: true, role: true },
  })
  return member ?? null
}