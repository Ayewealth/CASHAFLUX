import { pgTable, text, timestamp, integer, decimal, boolean, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core'
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

// ─── Better Auth Tables (managed by Better Auth — do not modify) ───

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().$onUpdate(() => new Date()),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  issuer: text('issuer').notNull(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().$onUpdate(() => new Date()),
}, (t) => ({
  issuerAccountIdx: uniqueIndex('issuer_account_idx').on(t.issuer, t.accountId),
}))

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
})

// ─── Tables ───

export const users = pgTable('users', {
  id: text('id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  hashedPassword: text('hashed_password').notNull(),
  plan: planEnum('plan').default('free').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').default('active').notNull(),
  planInterval: text('plan_interval'),
  currentPeriodEnd: timestamp('current_period_end'),
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
  industry: text('industry'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  phone: text('phone'),
  website: text('website'),
  ein: text('ein'),
  logoR2Key: text('logo_r2_key'),
  invoiceDefaults: text('invoice_defaults'),
  notificationPreferences: text('notification_preferences'),
  currency: text('currency').default('USD').notNull(),
  fiscalYearStart: integer('fiscal_year_start').default(1).notNull(),
  demoMode: boolean('demo_mode').default(false).notNull(),
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
  demoSessionId: text('demo_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  orgIdx: index('clients_org_idx').on(t.orgId),
  demoIdx: index('clients_demo_idx').on(t.demoSessionId),
}))

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
  demoSessionId: text('demo_session_id'),
}, (t) => ({
  orgIdx: index('invoices_org_idx').on(t.orgId),
  demoIdx: index('invoices_demo_idx').on(t.demoSessionId),
}))

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  demoSessionId: text('demo_session_id'),
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
  demoSessionId: text('demo_session_id'),
})

export const bankAccounts = pgTable('bank_accounts', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  bankName: text('bank_name'),
  type: bankAccountTypeEnum('type').default('checking').notNull(),
  currency: text('currency').default('USD').notNull(),
  currentBalance: decimal('current_balance', { precision: 14, scale: 2 }).default('0').notNull(),
  demoSessionId: text('demo_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  orgIdx: index('bank_accounts_org_idx').on(t.orgId),
  demoIdx: index('bank_accounts_demo_idx').on(t.demoSessionId),
}))

export const bankTransactions = pgTable('bank_transactions', {
  id: text('id').primaryKey(),
  bankAccountId: text('bank_account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  orgId: text('org_id').notNull().references(() => organizations.id),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: text('category'),
  reconciled: boolean('reconciled').default(false).notNull(),
  matchedInvoiceId: text('matched_invoice_id').references(() => invoices.id),
  matchedExpenseId: text('matched_expense_id').references(() => expenses.id),
  demoSessionId: text('demo_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  orgAccountIdx: index('bank_transactions_org_account_idx').on(t.orgId, t.bankAccountId),
  accountReconciledIdx: index('bank_transactions_account_reconciled_idx').on(t.bankAccountId, t.reconciled),
  demoIdx: index('bank_transactions_demo_idx').on(t.demoSessionId),
}))

export const recurringInvoices = pgTable('recurring_invoices', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  templateInvoiceId: text('template_invoice_id').notNull().references(() => invoices.id),
  frequency: frequencyEnum('frequency').notNull(),
  nextDate: timestamp('next_date').notNull(),
  endDate: timestamp('end_date'),
  active: boolean('active').default(true).notNull(),
  demoSessionId: text('demo_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const expenseCategories = pgTable('expense_categories', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  irsDefault: boolean('irs_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const expenseAllocations = pgTable('expense_allocations', {
  id: text('id').primaryKey(),
  expenseId: text('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
})

export const mileageLogs = pgTable('mileage_logs', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  date: timestamp('date').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  miles: decimal('miles', { precision: 8, scale: 1 }).notNull(),
  purpose: text('purpose'),
  demoSessionId: text('demo_session_id'),
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

export const payrollEntries = pgTable('payroll_entries', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // w2 | 1099
  payDate: timestamp('pay_date').notNull(),
  grossAmount: decimal('gross_amount', { precision: 12, scale: 2 }).notNull(),
  hours: decimal('hours', { precision: 6, scale: 1 }),
  status: text('status').default('draft').notNull(), // draft | paid
  demoSessionId: text('demo_session_id'),
  createdBy: text('created_by').notNull().references(() => users.id),
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

export const industries = pgTable('industries', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const onboardingProgress = pgTable('onboarding_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  currentStep: integer('current_step').default(1).notNull(),
  formData: text('form_data').default('{}').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
})

export const demoSessions = pgTable('demo_sessions', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  cleanedUpAt: timestamp('cleaned_up_at'),
}, (t) => ({
  orgIdx: index('demo_sessions_org_idx').on(t.orgId),
}))

// ─── Zod Schemas ───

export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true })
export const insertSessionSchema = createInsertSchema(sessions)
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ createdAt: true })
export const insertOrgMemberSchema = createInsertSchema(orgMembers)
export const insertClientSchema = createInsertSchema(clients).omit({ createdAt: true })
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ createdAt: true, updatedAt: true })
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems)
export const insertExpenseSchema = createInsertSchema(expenses).omit({ createdAt: true })
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ createdAt: true })
export const insertExpenseAllocationSchema = createInsertSchema(expenseAllocations)
export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ createdAt: true })
export const insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({ createdAt: true })
export const insertRecurringInvoiceSchema = createInsertSchema(recurringInvoices).omit({ createdAt: true })
export const insertMileageLogSchema = createInsertSchema(mileageLogs).omit({ createdAt: true })
export const insertPayrollEntrySchema = createInsertSchema(payrollEntries).omit({ createdAt: true })
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ createdAt: true })
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ createdAt: true })
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ createdAt: true })
export const insertIndustrySchema = createInsertSchema(industries).omit({ createdAt: true })
export const insertOnboardingProgressSchema = createInsertSchema(onboardingProgress).omit({ createdAt: true, updatedAt: true })
export const insertDemoSessionSchema = createInsertSchema(demoSessions).omit({ createdAt: true, cleanedUpAt: true })

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
export type ExpenseCategory = typeof expenseCategories.$inferSelect
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>
export type ExpenseAllocation = typeof expenseAllocations.$inferSelect
export type InsertExpenseAllocation = z.infer<typeof insertExpenseAllocationSchema>
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
export type InsertSession = z.infer<typeof insertSessionSchema>
export type InsertOrgMember = z.infer<typeof insertOrgMemberSchema>
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>
export type InsertRecurringInvoice = z.infer<typeof insertRecurringInvoiceSchema>
export type InsertMileageLog = z.infer<typeof insertMileageLogSchema>
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>
export type Industry = typeof industries.$inferSelect
export type InsertIndustry = z.infer<typeof insertIndustrySchema>
export type PayrollEntry = typeof payrollEntries.$inferSelect
export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>
export type OnboardingProgress = typeof onboardingProgress.$inferSelect
export type InsertOnboardingProgress = z.infer<typeof insertOnboardingProgressSchema>
export type DemoSession = typeof demoSessions.$inferSelect
export type InsertDemoSession = z.infer<typeof insertDemoSessionSchema>