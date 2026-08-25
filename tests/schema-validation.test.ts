import { describe, it, expect } from 'vitest'
import {
  insertOrganizationSchema, insertClientSchema, insertInvoiceSchema,
  insertExpenseSchema, insertBankAccountSchema, insertOrgMemberSchema,
  insertInvitationSchema, insertBlogPostSchema, insertPayrollEntrySchema,
  insertMileageLogSchema, insertRecurringInvoiceSchema, insertExpenseCategorySchema,
  insertActivityLogSchema,
} from '@shared/schema'

describe('Schema validation - required fields', () => {
  it('insertOrganizationSchema rejects empty name', () => {
    expect(insertOrganizationSchema.safeParse({ ownerUserId: 'u1', name: '' }).success).toBe(false)
  })
  it('insertOrganizationSchema accepts valid', () => {
    expect(insertOrganizationSchema.safeParse({ id: crypto.randomUUID(), ownerUserId: 'u1', name: 'My Biz' }).success).toBe(true)
  })
  it('insertOrganizationSchema rejects missing ownerUserId', () => {
    expect(insertOrganizationSchema.safeParse({ name: 'Biz' }).success).toBe(false)
  })
  it('insertOrganizationSchema partial allows update', () => {
    expect(insertOrganizationSchema.partial().safeParse({ name: 'New' }).success).toBe(true)
  })

  it('insertClientSchema requires name', () => {
    expect(insertClientSchema.safeParse({ id: 'c1', orgId: 'o1' }).success).toBe(false)
  })
  it('insertClientSchema accepts valid', () => {
    expect(insertClientSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Client' }).success).toBe(true)
  })
  it('insertClientSchema allows null optionals', () => {
    expect(insertClientSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'C', email: null, phone: null, company: null }).success).toBe(true)
  })
  it('insertClientSchema partial allows update', () => {
    expect(insertClientSchema.partial().safeParse({ name: 'New' }).success).toBe(true)
  })

  it('insertInvoiceSchema requires all required', () => {
    expect(insertInvoiceSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', clientId: 'c1', invoiceNumber: 'INV-001',
      issueDate: new Date(), dueDate: new Date(), subtotal: '100', total: '100', createdBy: 'u1',
    }).success).toBe(true)
  })
  it('insertInvoiceSchema missing total fails', () => {
    expect(insertInvoiceSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', clientId: 'c1', invoiceNumber: 'INV-001',
      issueDate: new Date(), dueDate: new Date(), subtotal: '100', createdBy: 'u1',
    }).success).toBe(false)
  })
  it('insertInvoiceSchema partial allows update', () => {
    expect(insertInvoiceSchema.partial().safeParse({ total: '200' }).success).toBe(true)
  })

  it('insertExpenseSchema requires all required', () => {
    expect(insertExpenseSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', date: new Date(), merchant: 'Store',
      amount: '50', category: 'Supplies', createdBy: 'u1',
    }).success).toBe(true)
  })
  it('insertExpenseSchema missing merchant fails', () => {
    expect(insertExpenseSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', date: new Date(), amount: '50', category: 'S', createdBy: 'u1',
    }).success).toBe(false)
  })
  it('insertExpenseSchema partial allows update', () => {
    expect(insertExpenseSchema.partial().safeParse({ amount: '100' }).success).toBe(true)
  })

  it('insertBankAccountSchema requires name', () => {
    expect(insertBankAccountSchema.safeParse({ id: 'b1', orgId: 'o1' }).success).toBe(false)
  })
  it('insertBankAccountSchema accepts valid', () => {
    expect(insertBankAccountSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Checking' }).success).toBe(true)
  })
  it('insertBankAccountSchema accepts valid with type', () => {
    expect(insertBankAccountSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Savings', type: 'savings' }).success).toBe(true)
  })
  it('insertBankAccountSchema rejects invalid type', () => {
    const result = insertBankAccountSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Bad', type: 'investment' })
    expect(result.success).toBe(false)
  })

  it('insertOrgMemberSchema requires id, orgId, userId', () => {
    expect(insertOrgMemberSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', userId: 'u1' }).success).toBe(true)
  })
  it('insertOrgMemberSchema rejects invalid role', () => {
    expect(insertOrgMemberSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', userId: 'u1', role: 'superadmin' }).success).toBe(false)
  })
  it('insertOrgMemberSchema accepts valid role', () => {
    expect(insertOrgMemberSchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', userId: 'u1', role: 'admin' }).success).toBe(true)
  })

  it('insertInvitationSchema requires email and orgId', () => {
    expect(insertInvitationSchema.safeParse({ orgId: 'o1', email: 'test@test.com', expiresAt: new Date() }).success).toBe(true)
  })
  it('insertInvitationSchema missing email fails', () => {
    expect(insertInvitationSchema.safeParse({ orgId: 'o1', expiresAt: new Date() }).success).toBe(false)
  })
  it('insertInvitationSchema accepts valid with role', () => {
    expect(insertInvitationSchema.safeParse({ orgId: 'o1', email: 'a@b.com', role: 'admin', expiresAt: new Date() }).success).toBe(true)
  })

  it('insertBlogPostSchema requires title, slug, contentMd', () => {
    expect(insertBlogPostSchema.safeParse({ id: crypto.randomUUID(), title: 'Post', slug: 'post', contentMd: '# Hello' }).success).toBe(true)
  })
  it('insertBlogPostSchema missing contentMd fails', () => {
    expect(insertBlogPostSchema.safeParse({ id: crypto.randomUUID(), title: 'Post', slug: 'post' }).success).toBe(false)
  })
  it('insertBlogPostSchema partial allows update', () => {
    expect(insertBlogPostSchema.partial().safeParse({ title: 'New' }).success).toBe(true)
  })

  it('insertPayrollEntrySchema requires all required', () => {
    expect(insertPayrollEntrySchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', name: 'John', type: 'w2',
      payDate: new Date(), grossAmount: '5000', createdBy: 'u1',
    }).success).toBe(true)
  })
  it('insertPayrollEntrySchema missing name fails', () => {
    expect(insertPayrollEntrySchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', type: 'w2', payDate: new Date(), grossAmount: '5000', createdBy: 'u1',
    }).success).toBe(false)
  })

  it('insertMileageLogSchema requires all required', () => {
    expect(insertMileageLogSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', date: new Date(), origin: 'A', destination: 'B', miles: '10', createdBy: 'u1',
    }).success).toBe(true)
  })
  it('insertMileageLogSchema missing origin fails', () => {
    expect(insertMileageLogSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', date: new Date(), destination: 'B', miles: '10', createdBy: 'u1',
    }).success).toBe(false)
  })

  it('insertRecurringInvoiceSchema requires all required', () => {
    expect(insertRecurringInvoiceSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', templateInvoiceId: 't1',
      frequency: 'monthly', nextDate: new Date(),
    }).success).toBe(true)
  })
  it('insertRecurringInvoiceSchema rejects invalid frequency', () => {
    expect(insertRecurringInvoiceSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', templateInvoiceId: 't1',
      frequency: 'biennially', nextDate: new Date(),
    }).success).toBe(false)
  })

  it('insertExpenseCategorySchema requires name', () => {
    expect(insertExpenseCategorySchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1', name: 'Office' }).success).toBe(true)
  })
  it('insertExpenseCategorySchema missing name fails', () => {
    expect(insertExpenseCategorySchema.safeParse({ id: crypto.randomUUID(), orgId: 'o1' }).success).toBe(false)
  })

  it('insertActivityLogSchema requires all required', () => {
    expect(insertActivityLogSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', userId: 'u1', action: 'created', entityType: 'invoice',
    }).success).toBe(true)
  })
  it('insertActivityLogSchema missing action fails', () => {
    expect(insertActivityLogSchema.safeParse({
      id: crypto.randomUUID(), orgId: 'o1', userId: 'u1', entityType: 'invoice',
    }).success).toBe(false)
  })
})

describe('Schema validation - partial updates', () => {
  it('all schemas allow partial', () => {
    const schemas = [
      insertOrganizationSchema, insertClientSchema, insertInvoiceSchema,
      insertExpenseSchema, insertBankAccountSchema, insertOrgMemberSchema,
      insertInvitationSchema, insertBlogPostSchema, insertPayrollEntrySchema,
      insertMileageLogSchema, insertRecurringInvoiceSchema, insertExpenseCategorySchema,
      insertActivityLogSchema,
    ]
    for (const schema of schemas) {
      expect(schema.partial().safeParse({}).success).toBe(true)
    }
  })
})