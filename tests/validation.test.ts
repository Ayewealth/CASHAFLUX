import { describe, it, expect } from 'vitest'
import { insertOrganizationSchema, insertClientSchema, insertInvoiceSchema, insertExpenseSchema, insertBankAccountSchema, insertOrgMemberSchema } from '@shared/schema'

describe('Zod validation schemas', () => {
  it('insertOrganizationSchema rejects empty name', () => {
    const result = insertOrganizationSchema.safeParse({ ownerUserId: 'u1', name: '' })
    expect(result.success).toBe(false)
  })

  it('insertOrganizationSchema accepts valid data with id', () => {
    const result = insertOrganizationSchema.safeParse({ id: crypto.randomUUID(), ownerUserId: 'u1', name: 'My Business' })
    expect(result.success).toBe(true)
  })

  it('insertOrganizationSchema rejects missing ownerUserId', () => {
    const result = insertOrganizationSchema.safeParse({ name: 'My Business' })
    expect(result.success).toBe(false)
  })

  it('insertOrganizationSchema accepts partial for updates', () => {
    const result = insertOrganizationSchema.partial().safeParse({ name: 'Updated Name' })
    expect(result.success).toBe(true)
  })

  it('insertClientSchema requires name', () => {
    const result = insertClientSchema.safeParse({ id: 'c1', orgId: 'o1' })
    expect(result.success).toBe(false)
  })

  it('insertClientSchema requires id, orgId, name', () => {
    const result = insertClientSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Client A' })
    expect(result.success).toBe(true)
  })

  it('insertClientSchema allows optional fields as null', () => {
    const result = insertClientSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Client A', email: null, phone: null, company: null, addressLine1: null, city: null, state: null, zip: null })
    expect(result.success).toBe(true)
  })

  it('insertInvoiceSchema requires all required fields', () => {
    const result = insertInvoiceSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', clientId: 'c1', invoiceNumber: 'INV-001', issueDate: new Date('2026-01-01'), dueDate: new Date('2026-01-31'), subtotal: '100', total: '100', createdBy: 'u1' })
    expect(result.success).toBe(true)
  })

  it('insertInvoiceSchema missing required fields fails', () => {
    const result = insertInvoiceSchema.safeParse({ orgId: 'o1' })
    expect(result.success).toBe(false)
  })

  it('insertExpenseSchema requires merchant, amount, category', () => {
    const result = insertExpenseSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', date: new Date('2026-01-01'), merchant: 'Store', amount: '50', category: 'Supplies', createdBy: 'u1' })
    expect(result.success).toBe(true)
  })

  it('insertExpenseSchema missing merchant fails', () => {
    const result = insertExpenseSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', date: new Date('2026-01-01'), amount: '50', category: 'Supplies', createdBy: 'u1' })
    expect(result.success).toBe(false)
  })

  it('insertBankAccountSchema requires id, orgId, name', () => {
    const result = insertBankAccountSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Chase Checking' })
    expect(result.success).toBe(true)
  })

  it('insertOrgMemberSchema requires id, orgId, userId', () => {
    const result = insertOrgMemberSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', userId: 'u1' })
    expect(result.success).toBe(true)
  })

  it('insertOrgMemberSchema rejects invalid role', () => {
    const result = insertOrgMemberSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', userId: 'u1', role: 'superadmin' })
    expect(result.success).toBe(false)
  })

  it('partial schemas allow omitting required fields', () => {
    const result = insertOrganizationSchema.partial().safeParse({})
    expect(result.success).toBe(true)
  })
})