# Phase 0: Scaffolding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the single-repo structure with Vite + Express + Drizzle + Better Auth, define all domain tables in the shared schema, wire up Tailwind v4 with brand tokens, set up React Router v7 + TanStack Query, and verify everything works end-to-end.

**Architecture:** Single Express process serves both the API (`/api/*`) and the Vite-built React client (SPA fallback). Drizzle ORM + PostgreSQL for data. Better Auth mounted at `/api/auth/*`. Tailwind v4 via `@tailwindcss/vite` plugin. React Router v7 handles client-side routing with public and dashboard route groups. TanStack Query wraps all server-state fetching.

**Tech Stack:** Vite 6 + React 19, Express 4 + TypeScript, Drizzle ORM + drizzle-zod + PostgreSQL, Better Auth, Tailwind v4, shadcn/ui, React Router v7, TanStack Query, Lucide React, Recharts.

## Global Constraints

- **No `any` type** — never use TypeScript `any`.
- **No `undefined` as a type** — model absence with `null`, optional fields, or discriminated unions.
- **Every table in `shared/schema.ts`** — define with Drizzle `pgTable`, derive Zod insert schema with `createInsertSchema`, export inferred types.
- **Brand palette** — navy `#1E3A5F`, blue `#2563EB`, blue-light `#DBEAFE`, success `#16A34A`, warning `#D97706`, danger `#DC2626`, neutral-50 `#F9FAFB`, neutral-100 `#F3F4F6`.
- **Typography** — Poppins (Google Fonts) or system-ui fallback.
- **Tailwind v4 only** — use `@tailwindcss/vite` plugin, `@import "tailwindcss"` entry, `@theme` block for tokens.
- **Dark/light mode** via `data-mode` attribute on `<html>`.
- **No placeholder-only labels** — floating labels or above-field labels.
- **WCAG 2.1 AA** — color contrast ≥ 4.5:1, keyboard accessible, labeled inputs, `aria-live` for errors.
- **Per-phase quality gate:** tests → run tests → lint fix → typecheck — in order, all must pass.

---

## File Structure

```
shared/
  schema.ts                     # ALL Drizzle tables + Zod schemas + inferred types

server/src/
  env.ts                        # Typed env with all vars from PROJECT_CONTEXT §14
  auth.ts                       # Better Auth config (unchanged from template)
  db/client.ts                  # Drizzle client (unchanged)
  index.ts                      # Express entry (unchanged)
  emails/                       # Directory for future React Email templates

client/src/
  main.tsx                      # React entry (StrictMode -> App)
  App.tsx                       # RouterProvider + QueryClientProvider wrapper
  index.css                     # Tailwind v4 entry + @theme brand tokens + dark/light vars
  lib/
    router.tsx                  # React Router v7 createBrowserRouter with all routes
    queryClient.ts              # Single TanStack QueryClient instance with defaults
```

---

### Task 1: Install Dependencies, Tailwind v4, & shadcn Init

**Files:**
- Modify: `package.json` (dependencies added via install)
- Create: `client/src/index.css`
- Modify: `vite.config.ts` (add @tailwindcss/vite plugin)
- Modify: `index.html` (update title, add Poppins preload)

- [ ] **Step 1: Install all runtime dependencies**

```bash
pnpm add tailwindcss @tailwindcss/vite react-router @tanstack/react-query \
  lucide-react recharts clsx tailwind-merge class-variance-authority \
  @radix-ui/react-slot
```

- [ ] **Step 2: Install dev dependencies**

*(No additional type packages needed — React Router v7 ships its own types.)*

- [ ] **Step 3: Run shadcn init**

```bash
pnpm dlx shadcn@latest init
```

Select: default style (New York), base color (Slate), CSS variables mode, `@shared` alias (use `./shared` path). This creates `components.json` and installs `tailwindcss-animate` + `cva`.

- [ ] **Step 4: Install initial shadcn components**

```bash
npx shadcn@latest add button card input label badge table dialog select skeleton toast
```

- [ ] **Step 5: Add @tailwindcss/vite to vite.config.ts**

Replace the `plugins: [react()]` line with:

```ts
import tailwindcss from '@tailwindcss/vite'
// ...
plugins: [tailwindcss(), react()],
```

- [ ] **Step 6: Create `client/src/index.css` with brand tokens + dark/light modes**

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Poppins', system-ui, sans-serif;

  --color-brand-navy: #1E3A5F;
  --color-brand-blue: #2563EB;
  --color-brand-blue-light: #DBEAFE;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;

  --color-primary: var(--color-brand-navy);
  --color-accent: var(--color-brand-blue);
  --color-bg: var(--color-neutral-50);
  --color-surface: white;
  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;

  --chart-1: var(--color-brand-blue);
  --chart-2: var(--color-success);
  --chart-3: var(--color-warning);
  --chart-4: var(--color-danger);
  --chart-5: #8B5CF6;
  --chart-6: #EC4899;
}

:root {
  color-scheme: light;
  --color-bg: var(--color-neutral-50);
  --color-surface: white;
  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
}

[data-mode="dark"] {
  color-scheme: dark;
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-text: #F1F5F9;
  --color-text-muted: #94A3B8;
  --color-border: #334155;
}
```

- [ ] **Step 7: Update `index.html`**

Replace title and add Poppins preload:

```html
<title>Cashaflux</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 8: Verify Tailwind compiles**

Run: `pnpm build` — should compile without errors. Verify `dist/client/` contains the built CSS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(phase-0): install deps, configure Tailwind v4 with brand tokens, shadcn init"
```

---

### Task 2: Define Domain Tables in shared/schema.ts

**Files:**
- Modify: `shared/schema.ts` (replace `posts` with all 14 domain tables)

**Interfaces:**
- Consumes: nothing (schema is the foundation)
- Produces: All table definitions, Zod insert schemas, inferred TypeScript types

- [ ] **Step 1: Rewrite `shared/schema.ts` with all domain tables**

The complete file replaces the placeholder `posts` table with:

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit` — should pass (schema tables may reference each other via foreign keys, but no runtime code uses them yet so there's nothing to fail).

- [ ] **Step 3: Commit**

```bash
git add shared/schema.ts
git commit -m "feat(phase-0): define all 14 domain tables in shared schema"
```

---

### Task 3: Integrate Better Auth Generated Schema

**Files:**
- Modify: `shared/schema.ts` (add auth tables from `npx better-auth generate`)

- [ ] **Step 1: Generate Better Auth schema**

```bash
npx better-auth generate
```

This outputs a schema snippet with `user`, `session`, `account`, `verification` tables. Copy the output.

- [ ] **Step 2: Merge auth tables into `shared/schema.ts`**

Add the four auth tables (`user`, `session`, `account`, `verification`) from the generated output. These are managed by Better Auth — do NOT modify them. Ensure our domain `users` table uses the same `id` column and key as the auth `user` table (they share the same primary key — Better Auth creates the `user` record, our `users` record is an extension).

Place them before the domain tables with a clear comment:

```ts
// ─── Better Auth Tables (managed by Better Auth — do not modify) ───
export const user = pgTable('user', { /* from generate output */ })
export const session = pgTable('session', { /* from generate output */ })
export const account = pgTable('account', { /* from generate output */ })
export const verification = pgTable('verification', { /* from generate output */ })
```

**Important:** Better Auth's `user` table and our `users` table will coexist. They share the same `id` field. Better Auth creates the auth record; our app creates the corresponding `users` record. The `sessions` table in our domain schema references our `users.id`; Better Auth's `session` table references Better Auth's `user.id` — these are separate concerns. Keep both.

- [ ] **Step 3: Update `server/src/auth.ts` to pass the full schema**

The `drizzleAdapter` needs the auth tables in the DB schema. The `db` client already imports `* as schema from '@shared/schema'` which now includes both auth + domain tables. No changes needed to `auth.ts` — it already works.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add shared/schema.ts server/src/auth.ts
git commit -m "feat(phase-0): integrate Better Auth generated schema tables"
```

---

### Task 4: Server Env Variables & Emails Directory

**Files:**
- Modify: `server/src/env.ts`
- Modify: `.env.example`
- Create: `server/src/emails/.gitkeep`

- [ ] **Step 1: Add all env vars to `server/src/env.ts`**

Replace the current file with:

```ts
import 'dotenv/config'

function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: Number(optional('PORT', '3000')),

  DATABASE_URL: required('DATABASE_URL'),

  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: optional('BETTER_AUTH_URL', ''),

  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  EMAIL_FROM: optional('EMAIL_FROM', ''),

  STRIPE_SECRET_KEY: optional('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: optional('STRIPE_WEBHOOK_SECRET', ''),
  STRIPE_PRO_PRICE_ID: optional('STRIPE_PRO_PRICE_ID', ''),
  STRIPE_BUSINESS_PRICE_ID: optional('STRIPE_BUSINESS_PRICE_ID', ''),

  R2_ACCOUNT_ID: optional('R2_ACCOUNT_ID', ''),
  R2_ACCESS_KEY_ID: optional('R2_ACCESS_KEY_ID', ''),
  R2_SECRET_ACCESS_KEY: optional('R2_SECRET_ACCESS_KEY', ''),
  R2_BUCKET_NAME: optional('R2_BUCKET_NAME', ''),

  SUPPORT_EMAIL: optional('SUPPORT_EMAIL', ''),
} as const
```

- [ ] **Step 2: Update `.env.example` with all vars**

Replace `.env.example` with the full list from PROJECT_CONTEXT §14 (exact content shown there).

- [ ] **Step 3: Create `server/src/emails/` directory**

```bash
mkdir server\src\emails
New-Item server\src\emails\.gitkeep -ItemType File
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit` — should pass.

- [ ] **Step 5: Commit**

```bash
git add server/src/env.ts .env.example server/src/emails/
git commit -m "feat(phase-0): add all env vars per PROJECT_CONTEXT §14, create emails directory"
```

---

### Task 5: Client Router, QueryClient, and App Shell

**Files:**
- Create: `client/src/lib/router.tsx`
- Create: `client/src/lib/queryClient.ts`
- Modify: `client/src/App.tsx`
- Keep: `client/src/main.tsx` (modify import path only)

- [ ] **Step 1: Create `client/src/lib/queryClient.ts`**

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

- [ ] **Step 2: Create `client/src/lib/router.tsx`**

```tsx
import { createBrowserRouter } from 'react-router'

// Placeholder pages — real content built in later phases
import HomePage from '../pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  // Public routes
  { path: '/pricing', lazy: () => import('../pages/PricingPage') },
  { path: '/features', lazy: () => import('../pages/FeaturesPage') },
  { path: '/blog', lazy: () => import('../pages/BlogIndexPage') },
  { path: '/blog/:slug', lazy: () => import('../pages/BlogPostPage') },
  { path: '/about', lazy: () => import('../pages/AboutPage') },
  { path: '/contact', lazy: () => import('../pages/ContactPage') },
  { path: '/privacy', lazy: () => import('../pages/PrivacyPage') },
  { path: '/terms', lazy: () => import('../pages/TermsPage') },
  { path: '/login', lazy: () => import('../pages/LoginPage') },
  { path: '/signup', lazy: () => import('../pages/SignupPage') },
  { path: '/forgot-password', lazy: () => import('../pages/ForgotPasswordPage') },
  { path: '/reset-password', lazy: () => import('../pages/ResetPasswordPage') },
  // Dashboard routes (auth required)
  {
    path: '/dashboard',
    lazy: () => import('../pages/dashboard/Layout'),
    children: [
      { index: true, lazy: () => import('../pages/dashboard/DashboardPage') },
      { path: 'invoices', lazy: () => import('../pages/dashboard/InvoicesPage') },
      { path: 'invoices/new', lazy: () => import('../pages/dashboard/InvoiceFormPage') },
      { path: 'invoices/:id/edit', lazy: () => import('../pages/dashboard/InvoiceFormPage') },
      { path: 'expenses', lazy: () => import('../pages/dashboard/ExpensesPage') },
      { path: 'expenses/new', lazy: () => import('../pages/dashboard/ExpenseFormPage') },
      { path: 'clients', lazy: () => import('../pages/dashboard/ClientsPage') },
      { path: 'bank', lazy: () => import('../pages/dashboard/BankPage') },
      { path: 'reports', lazy: () => import('../pages/dashboard/ReportsPage') },
      { path: 'tax', lazy: () => import('../pages/dashboard/TaxCentrePage') },
      { path: 'payroll', lazy: () => import('../pages/dashboard/PayrollPage') },
      { path: 'team', lazy: () => import('../pages/dashboard/TeamPage') },
      { path: 'settings', lazy: () => import('../pages/dashboard/SettingsPage') },
    ],
  },
])
```

- [ ] **Step 3: Create placeholder `client/src/pages/HomePage.tsx`**

```tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="py-6 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Cashaflux</h1>
        <nav className="flex gap-4">
          <a href="/login" className="text-text-muted hover:text-text">Log in</a>
          <a href="/signup" className="px-4 py-2 bg-accent text-white rounded-lg">Start free</a>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-5xl font-bold text-primary mb-6">
          Simple accounting for American small businesses
        </h2>
        <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
          Invoicing, expense tracking, bank reconciliation, and tax-ready reports — all in one place.
        </p>
        <a
          href="/signup"
          className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-xl text-lg"
        >
          Start for free — no credit card required
        </a>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create minimal placeholder for `client/src/pages/LoginPage.tsx`**

```tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-primary mb-6">Log in</h1>
        <p className="text-text-muted">Login form coming in Phase 1.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `client/src/pages/dashboard/Layout.tsx` placeholder**

```tsx
import { Outlet } from 'react-router'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-64 bg-primary text-white p-4">
        <h2 className="text-xl font-bold mb-8">Cashaflux</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-white/10">Dashboard</a>
          <a href="/dashboard/invoices" className="block px-3 py-2 rounded hover:bg-white/10">Invoices</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Create placeholder `client/src/pages/dashboard/DashboardPage.tsx`**

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-4">Dashboard</h1>
      <p className="text-text-muted">Dashboard content coming in Phase 2.</p>
    </div>
  )
}
```

- [ ] **Step 7: Rewrite `client/src/App.tsx`**

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { queryClient } from './lib/queryClient'
import { router } from './lib/router'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 8: Import CSS in `client/src/main.tsx`**

Add the import at the top of the file (before `import App`):
```tsx
import './index.css'
```

The final `main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit` — should pass with no errors.

- [ ] **Step 10: Commit**

```bash
git add client/src/lib/ client/src/App.tsx client/src/pages/
git commit -m "feat(phase-0): set up React Router v7, TanStack Query, app shell with public + dashboard routes"
```

---

### Task 6: Infrastructure & Quality Gate

**Files:**
- Create: `.env` (from `.env.example` with generated secret)

- [ ] **Step 1: Create `.env` from `.env.example` with generated BETTER_AUTH_SECRET**

```bash
Copy-Item .env.example .env
$secret = openssl rand -base64 32
(Get-Content .env) -replace 'change-me-to-a-random-secret', $secret | Set-Content .env
```

- [ ] **Step 2: Start local Postgres**

```bash
docker compose up -d
```

Verify Postgres is accepting connections:
```bash
docker compose ps
# Should show: postgres   Up (healthy)
```

- [ ] **Step 3: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 4: Push schema to local database**

```bash
pnpm db:push
```

Should output a list of created tables matching all 14 domain tables + 4 auth tables.

- [ ] **Step 5: Quality gate — TypeScript check**

```bash
pnpm tsc --noEmit
```
Expected: exits with code 0, no errors.

- [ ] **Step 6: Quality gate — dev server check**

Start in background:
```bash
Start-Process -NoNewWindow powershell { pnpm dev }
```

Wait 5 seconds, then:
```bash
curl http://localhost:3000/api/health
```
Expected: `{"ok":true}`

```bash
curl http://localhost:3000/
```
Expected: HTML page (SPA serves index.html)

- [ ] **Step 7: Quality gate — Drizzle Studio confirms tables**

```bash
pnpm db:studio
```
Open `http://localhost:4983` in browser. Verify all 18 tables (14 domain + 4 auth) appear.

- [ ] **Step 8: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(phase-0): infrastructure setup and quality gate verification"
```

---

## Spec Coverage Check

| PROJECT_CONTEXT § | Covered By |
|---|---|
| §1 (Tech stack) | Tasks 1, 5 |
| §2 (Repo conventions) | Task 5 (router convention, queryClient) |
| §3 (Code standards) | Global constraints, Tasks 2, 3, 4 |
| §4 (Design tokens) | Task 1 (brand tokens CSS) |
| §10 (Schema) | Tasks 2, 3 |
| §11 (API design) | Task 4 (env), health endpoint in existing index.ts |
| §14 (Env vars) | Task 4 |
| §15 (Phases) | This whole plan = Phase 0 |
| §17 (Local dev) | Task 6 |