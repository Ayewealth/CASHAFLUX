import { isNull, eq, and, type SQL } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

export function demoFilter(col: AnyPgColumn, demoSessionId: string | null): SQL | undefined {
  if (demoSessionId) {
    return eq(col, demoSessionId)
  }
  return isNull(col)
}

export function andDemoFilter(conditions: SQL[], col: AnyPgColumn, demoSessionId: string | null): void {
  const filter = demoFilter(col, demoSessionId)
  if (filter) {
    conditions.push(filter)
  }
}