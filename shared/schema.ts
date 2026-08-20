import { pgTable, text, timestamp, integer, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// ─── Enums ───

export const planEnum = pgEnum('plan', ['free', 'pro', 'business'])
export const orgTypeEnum = pgEnum('org_type', ['sole_proprietor', 'llc', 's_corp', 'c_corp', 'partnership'])
export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'accountant', 'member'])
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])
export const bankAccountTypeEnum = pgEnum('bank_account_type', ['checking', 'savings', 'credit_card'])
export const transactionTypeEnum = pgEnum('transaction_type', ['debit', 'credit'])
export const frequencyEnum = pgEnum('frequency', ['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually'])

// ─── Tables ───

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  hashedPassword: text('hashed_password').notNull(),
  plan: planEnum('plan').default('free').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  ownerUserId: text('owner_user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: orgTypeEnum('type'),
  address: text('address'),
  ein: text('ein'),
  logoR2Key: text('logo_r2_key'),
  fiscalYearStart: integer('fiscal_year_start').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const orgMembers = pgTable('org_members', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: memberRoleEnum('role').default('member').notNull(),
  invitedAt: timestamp('invited_at'),
  joinedAt: timestamp('joined_at'),
})

export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email'),
  phone: text('phone'),
  addressLine1: text('address_line1'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  currency: text('currency').default('USD').notNull(),
  archived: boolean('archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  invoiceNumber: text('invoice_number').notNull(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  currency: text('currency').default('USD').notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxTotal: decimal('tax_total', { precision: 12, scale: 2 }).default('0').notNull(),
  discount: decimal('discount', { precision: 12, scale: 2 }),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
  logoR2Key: text('logo_r2_key'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
})

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  date: timestamp('date').notNull(),
  merchant: text('merchant').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  description: text('description'),
  receiptR2Key: text('receipt_r2_key'),
  reconciled: boolean('reconciled').default(false).notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bankAccounts = pgTable('bank_accounts', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  bankName: text('bank_name'),
  type: bankAccountTypeEnum('type').default('checking').notNull(),
  currency: text('currency').default('USD').notNull(),
  currentBalance: decimal('current_balance', { precision: 14, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bankTransactions = pgTable('bank_transactions', {
  id: text('id').primaryKey(),
  bankAccountId: text('bank_account_id').notNull().references(() => bankAccounts.id),
  orgId: text('org_id').notNull().references(() => organizations.id),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: text('category'),
  reconciled: boolean('reconciled').default(false).notNull(),
  matchedInvoiceId: text('matched_invoice_id').references(() => invoices.id),
  matchedExpenseId: text('matched_expense_id').references(() => expenses.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const recurringInvoices = pgTable('recurring_invoices', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  templateInvoiceId: text('template_invoice_id').notNull().references(() => invoices.id),
  frequency: frequencyEnum('frequency').notNull(),
  nextDate: timestamp('next_date').notNull(),
  endDate: timestamp('end_date'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const mileageLogs = pgTable('mileage_logs', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  date: timestamp('date').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  miles: decimal('miles', { precision: 8, scale: 1 }).notNull(),
  purpose: text('purpose'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  contentMd: text('content_md').notNull(),
  excerpt: text('excerpt'),
  publishedAt: timestamp('published_at'),
  author: text('author'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const contactSubmissions = pgTable('contact_submissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const activityLog = pgTable('activity_log', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Zod Schemas ───

export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true })
export const insertSessionSchema = createInsertSchema(sessions)
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ createdAt: true })
export const insertOrgMemberSchema = createInsertSchema(orgMembers)
export const insertClientSchema = createInsertSchema(clients).omit({ createdAt: true })
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ createdAt: true, updatedAt: true })
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems)
export const insertExpenseSchema = createInsertSchema(expenses).omit({ createdAt: true })
export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ createdAt: true })
export const insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({ createdAt: true })
export const insertRecurringInvoiceSchema = createInsertSchema(recurringInvoices).omit({ createdAt: true })
export const insertMileageLogSchema = createInsertSchema(mileageLogs).omit({ createdAt: true })
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ createdAt: true })
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ createdAt: true })
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ createdAt: true })

// ─── Inferred Types ───

export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>
export type Session = typeof sessions.$inferSelect
export type Organization = typeof organizations.$inferSelect
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>
export type OrgMember = typeof orgMembers.$inferSelect
export type Client = typeof clients.$inferSelect
export type InsertClient = z.infer<typeof insertClientSchema>
export type Invoice = typeof invoices.$inferSelect
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect
export type Expense = typeof expenses.$inferSelect
export type InsertExpense = z.infer<typeof insertExpenseSchema>
export type BankAccount = typeof bankAccounts.$inferSelect
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>
export type BankTransaction = typeof bankTransactions.$inferSelect
export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>
export type RecurringInvoice = typeof recurringInvoices.$inferSelect
export type MileageLog = typeof mileageLogs.$inferSelect
export type BlogPost = typeof blogPosts.$inferSelect
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>
export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type ActivityLog = typeof activityLog.$inferSelect