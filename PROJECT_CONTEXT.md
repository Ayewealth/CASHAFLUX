# CASHAFLUX — PROJECT_CONTEXT

> Single source of truth for any AI agent or developer working on this project. Read this file in full before writing any code. Do not deviate from these rules.
>
> **This file is aligned with the Cashaflux Development Plan v1.0 (August 2026).** Where this file adds conventions beyond that plan (TanStack Query, the multi-palette theming engine, the detailed Stripe status-refresh behavior), it says so explicitly. **AI features are explicitly out of scope for v1** — they appear only in the Post-Launch Roadmap (Section 21) and must not be built now.

---

## 0. What This Is

**Cashaflux** is a cloud-based accounting platform purpose-built for US small businesses and sole traders. It combines core financial management — invoicing, expense tracking, bank reconciliation, and tax-ready reporting — with a modern, intuitive interface, positioned against incumbents like QuickBooks and Xero.

**Product shape:** a single-domain web application. The public marketing site lives at `cashaflux.com`, and all authenticated app routes sit under `cashaflux.com/dashboard`. There is **no separate subdomain or deployment** for the private app — everything runs from one Express process, one Railway service, one domain.

**Target audience:**

- US-based freelancers, sole traders, and micro-businesses (1–15 employees).
- Business owners currently managing finances in spreadsheets, or underserved by complex enterprise tools.
- Users who need US-centric tax categories (federal and state), USD as the default currency, and US date/number formatting throughout.

**Core value proposition:** _Simple. Fast. Built for America._ Cashaflux gives small business owners a real-time view of their cash flow, outstanding invoices, and upcoming tax obligations — all in one place, without the learning curve of legacy software.

**Revenue model:** Stripe subscriptions, three tiers — Free, Pro, Business (Section 5). Subscription state is stored in the database and gates feature access at the API layer.

**Explicitly out of scope for v1:** AI/ML features of any kind (categorization, assistants, receipt extraction), bank feed integrations (Plaid), mobile apps, multi-currency accounting, direct Stripe payment links on invoices, a document vault, budgeting, an accountant portal, QuickBooks/Xero data import, and white-label mode. All of these are Post-Launch Roadmap items (Section 21) — do not implement them now, and do not scaffold placeholder UI for them beyond a simple "Coming soon" note where the plan already calls for one.

---

## 1. Technology Stack (Fixed — Do Not Deviate)

The stack is defined by the project template and must not deviate.

| Layer                        | Technology                       | Notes                                                                                                                                                                               |
| ---------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                     | Vite + React + TypeScript        | In `client/src/`                                                                                                                                                                    |
| Server state / data fetching | **TanStack Query (react-query)** | _Added convention, not in the source plan._ All client-side server-state — API calls, caching, invalidation, background refetch — goes through it. No ad-hoc `useEffect` + `fetch`. |
| Backend                      | Express + TypeScript             | In `server/src/`                                                                                                                                                                    |
| Shared types / validation    | Drizzle ORM + drizzle-zod        | In `shared/`                                                                                                                                                                        |
| Database                     | PostgreSQL                       | Railway managed Postgres service                                                                                                                                                    |
| Auth                         | Better Auth (email/password)     | Mounted at `/api/auth/*`                                                                                                                                                            |
| Object Storage               | Cloudflare R2                    | Receipt images, document uploads                                                                                                                                                    |
| Email                        | Resend                           | Transactional emails                                                                                                                                                                |
| Styling                      | Tailwind CSS + shadcn/ui (Radix) | Import components as needed, don't install the whole library                                                                                                                        |
| Icons                        | Lucide React                     | Already available in the template                                                                                                                                                   |
| Charts                       | Recharts                         | All data visualizations                                                                                                                                                             |
| Package manager              | **pnpm**                         | Single lockfile at repo root                                                                                                                                                        |
| Deploy                       | **Railway (CLI)**                | `railway up` from local machine — no GitHub repo, no CI/CD                                                                                                                          |

---

## 2. Repository Conventions (Non-Negotiable)

This is a **single repo, not a monorepo**. Strictly follow this layout:

```
.
├── client/src/                 # React frontend (pages, components, hooks, styles)
│   └── lib/queryClient.ts      # Single shared TanStack QueryClient instance + defaults
├── server/src/
│   ├── index.ts                # Entry point; branches on NODE_ENV
│   ├── vite.ts                 # Dev: Vite middleware setup
│   ├── static.ts                # Prod: serves dist/client/ with SPA fallback
│   ├── auth.ts                 # Better Auth config
│   ├── env.ts                  # Typed env with required()/optional() helpers
│   ├── db/client.ts            # Drizzle client
│   └── emails/                 # Resend / React Email templates
├── shared/
│   └── schema.ts                # All Drizzle tables, Zod insert schemas, inferred types
├── index.html                   # Root HTML; script points to /client/src/main.tsx
├── vite.config.ts               # @vitejs/plugin-react, @shared alias, outDir: dist/client
├── tsconfig.json                 # Single config covering client/src, server/src, shared
├── drizzle.config.ts             # Points at shared/schema.ts
├── docker-compose.yml             # Local Postgres only (no app service)
├── .env.example                   # ALL env vars documented here
└── package.json                   # Single root package.json
```

### Routing convention

- **Public routes** (no auth required): `/`, `/pricing`, `/features`, `/blog`, `/about`, `/contact`, `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- **App routes** (auth required): `/dashboard` and all sub-paths below it.
- React Router handles client-side routing. Express serves `index.html` for all non-`/api` routes (SPA fallback), so both public and app URLs are deep-linkable.
- A middleware check on every `/api/*` protected route, and a client-side auth guard on every `/dashboard/*` route, redirect unauthenticated users to `/login`.

---

## 3. Code Standards (Strict)

### TypeScript

- **NEVER use `any`.**
- **NEVER use `undefined` as a type** — model absence explicitly (`null`, optional fields, discriminated unions).
- **Always define an explicit `type` or `interface`** for function inputs/outputs, component props, and API responses.
- Strict mode on in `tsconfig.json`.

### Validation & shared types

- Define every database table in `shared/schema.ts` using Drizzle.
- For every table, generate the Zod insert schema with `createInsertSchema(table)` from `drizzle-zod`, and export both the Zod schema and the inferred TypeScript types (`z.infer<...>` for inserts, `$inferSelect` for rows).
- Server validates every request body with the Zod schema. Client imports the TypeScript types only.

### Data fetching (TanStack Query — added convention)

- Every GET-style read of server state goes through a `useQuery` hook. Every create/update/delete goes through a `useMutation` hook.
- Domain-specific hooks live near the feature (e.g. `client/src/features/invoices/hooks.ts`) and wrap the raw fetch call + Zod-typed response — components never call `fetch` directly.
- Query keys are structured arrays (e.g. `['invoices', orgId, filters]`), never ad-hoc strings.
- Mutations invalidate the relevant query keys on success rather than manually patching cache.

### Styling & UI

- **Tailwind CSS** for all styling; no custom CSS unless absolutely necessary.
- **shadcn/ui** components as the base, imported as needed rather than installing the entire library.
- **Never use native browser dialogs:** no `window.alert`, `window.confirm`, `window.prompt`.
- WCAG 2.1 AA minimum: color contrast ≥ 4.5:1 for body text, all interactive elements keyboard accessible, all form inputs have associated `<label>` elements, error messages announced via `aria-live` regions.

### Per-phase quality gate (do every phase, in order)

After completing each phase from Section 15:

1. **Write tests** for the new behavior (unit + integration where relevant).
2. **Run tests** — all must pass.
3. **Run lint fix** (`pnpm lint --fix` or equivalent).
4. **Run typecheck** (`pnpm tsc --noEmit` or equivalent) — must be clean.

A phase is not complete until all four steps pass.

---

## 4. Design System & Theming

_The source plan specifies a simple, fixed brand palette with a dark/light toggle. This section implements that as the default of a small, user-selectable theming engine — an added convention, not a plan requirement. If you want to strip it back to a single fixed palette, say so and this section shrinks to just the token table below plus a dark/light class toggle._

### 4.1 Brand tokens (Palette A — default)

| Token              | Hex       | Usage                                        |
| ------------------ | --------- | -------------------------------------------- |
| `brand-navy`       | `#1E3A5F` | Primary brand, headings, sidebar background  |
| `brand-blue`       | `#2563EB` | CTA buttons, links, active states            |
| `brand-blue-light` | `#DBEAFE` | Highlighted rows, badges, info backgrounds   |
| `success`          | `#16A34A` | Paid status, positive KPI arrows             |
| `warning`          | `#D97706` | Due-soon status, warning alerts              |
| `danger`           | `#DC2626` | Overdue status, error states, delete actions |
| `neutral-50`       | `#F9FAFB` | Page backgrounds                             |
| `neutral-100`      | `#F3F4F6` | Table alternating rows, card backgrounds     |

All values are exposed as CSS custom properties on `:root`, consumed by the Tailwind config so utilities like `bg-primary`, `text-muted`, `border-border` swap live. No raw hex/rgb values in components.

### 4.2 Mode toggle

- Dark mode / light mode toggle, preference persisted in user settings (mirrored to `localStorage` for first-paint).
- `data-mode="light" | "dark"` on `<html>`.

### 4.3 Typography

- Font family: **Poppins** (Google Fonts) or system-ui fallback.
- Display (hero headings): 48–64px, bold.
- H1 (page titles): 32px, bold.
- H2 (section headings): 24px, semibold.
- H3 (card headings): 18px, semibold.
- Body: 14–16px, regular.
- Caption / label: 12px, regular or medium.

### 4.4 Component conventions

- **Status badges** use color-coded pills: Paid (green), Sent (blue), Draft (grey), Overdue (red), Due Soon (amber).
- **Data tables:** sticky header, alternating row shading, row hover highlight, sortable columns show sort arrows.
- **Forms:** floating labels or above-field labels — never placeholder-only labels; inline validation messages below each field.
- **Modals:** confirmations and quick actions only; never a modal for a form longer than 5 fields.
- **Toasts:** success / error / info, top-right, auto-dismiss after 4 seconds.
- **Loading states:** skeleton loaders on data tables and KPI cards; spinner on button after click.
- **Empty states:** custom illustration + helpful message + primary action button on every empty list.

### 4.5 Optional extension — selectable palettes (beyond the plan)

If a broader theming engine is wanted later, the token contract (`--color-primary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, plus `--chart-1`–`--chart-6`) and a `data-palette` attribute support swapping Palette A for alternate palettes without touching components — but **do not build this for v1**; ship the single fixed brand palette above (4.1) with the dark/light toggle (4.2) only.

---

## 5. Pricing & Plans

| Plan     | Monthly | Annual (per mo) | Notes                                                                                         |
| -------- | ------- | --------------- | --------------------------------------------------------------------------------------------- |
| Free     | $0      | —               | Core invoicing and expense tracking, up to 5 clients                                          |
| Pro      | $19     | $15             | Unlimited clients, bank sync, recurring invoices, advanced reports                            |
| Business | $39     | —               | Everything in Pro, plus team members (up to 5 seats), payroll-ready exports, priority support |

- Pricing page repeats the homepage table in expanded form, with a full feature comparison table, a billing FAQ, and a "Talk to us" CTA for enterprise/custom needs linking to `/contact`.
- Monthly/annual toggle on both the homepage and `/pricing`; annual shows the per-month savings.
- No feature is currently gated behind a "Scale" or fourth tier — there are exactly three plans.

---

## 6. Stripe Billing — Required Behavior

Build Stripe subscriptions with **normal webhook support**, but also add an **on-demand Stripe status check as a failsafe** for environments where webhooks are not set up. _(This section is a more defensive version of the source plan's Section 13 — added by explicit request, not a plan requirement, but does not conflict with it.)_

### Setup

- Create two products in Stripe: **Pro** and **Business**, each with a monthly price and an annual price (Pro only has an annual price per Section 5; Business is monthly-only unless later extended).
- Copy the Price IDs into `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_BUSINESS_MONTHLY`, and `STRIPE_PRICE_BUSINESS_ANNUAL` (Section 14).
- Register the `/api/stripe/webhook` endpoint in the Stripe dashboard.

### Source of truth

- Webhooks update local subscription state when configured.
- The app must still treat **Stripe as the source of truth**, and refresh the user's subscription status **directly from Stripe** on: app load/login, after Checkout success, when opening billing/settings, and after returning from the Customer Portal.
- On the client, this refresh is a TanStack Query query (e.g. `['stripe', 'status', userId]`) with a `staleTime` aligned to the 15-minute cache window below, manually invalidated/refetched at the four trigger points above.

### Caching

- Cache direct Stripe checks locally for **no longer than 15 minutes**. Do **not** call Stripe on every request.

### Checkout verification (critical)

- **Never** mark a user as paid just because they reached the success page.
- After Checkout, **verify the Checkout Session server-side** and confirm it belongs to the logged-in user **before** storing `stripe_customer_id` / plan on the user record.
- Flow: client calls `/api/subscription/checkout` → server creates a Stripe Checkout Session and returns the URL → client redirects. On success, Stripe fires `checkout.session.completed` → server verifies and updates `users.plan` + `users.stripe_customer_id`.

### Access gating

- Access to Pro/Business-only routes is granted only for `active` or `trialing` subscriptions.
- Server middleware reads `user.plan` from the session on each request; Pro-only and Business-only API routes return HTTP 403 with a JSON error if the plan is insufficient. Client reads the plan from the auth context and shows upgrade prompts on locked features.
- **Fail closed** on Stripe API failures: if Stripe is unreachable and there is no fresh valid cached status, deny access to paid features (the user still sees their Free-tier data).

### Webhooks (`POST /api/stripe/webhook`)

- No session auth. **Always verify the `Stripe-Signature` header** with `STRIPE_WEBHOOK_SECRET` before processing.
- Listen for: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`.
- On `checkout.session.completed` → update `user.plan`, `user.stripe_customer_id`.
- On `customer.subscription.deleted` or `invoice.payment_failed` → downgrade `user.plan` to `"free"`.

### Customer Portal

- Cancellation and plan changes happen in the Stripe Customer Portal. `POST /api/subscription/portal` creates a portal session for the authenticated user; linked from `/dashboard/settings` (Subscription & Billing).

---

## 7. Auth & Onboarding

### Sign-up (`/signup`)

- Fields: full name, email, password, confirm password.
- Password validation: minimum 8 characters, at least one number.
- On submit: create account via Better Auth, send welcome email via Resend.
- Redirect to `/onboarding` after successful registration.

### Login (`/login`)

- Fields: email, password, "Remember me" checkbox, "Forgot password?" link.
- On success: redirect to `/dashboard`.
- On failure: clear, friendly error message — never reveal whether the email exists.

### Forgot / reset password

- `/forgot-password`: enter email → receive reset link via Resend.
- `/reset-password?token=...`: enter new password → redirect to `/login` on success.
- Reset tokens expire after 1 hour.

### Onboarding wizard (`/onboarding`)

4 steps, with a progress bar; user can skip the whole wizard and go straight to `/dashboard`:

1. **Business profile** — business name, business type (Sole Proprietor / LLC / S-Corp / C-Corp / Partnership), industry, tax year start month.
2. **Currency & locale** — pre-filled to USD / US; user can confirm.
3. **Invite team** (optional) — enter email addresses to invite colleagues.
4. **Choose plan** — inline plan picker; user can skip to stay on Free.

---

## 8. Public Marketing Website

The public site is the primary acquisition and conversion engine — every design and copy decision should optimize for converting visitors into free-tier sign-ups.

**Design direction:** clean, minimal, professional financial feel (think Stripe meets Pilot.com). Deep navy (`#1E3A5F`) as the primary brand color, electric blue (`#2563EB`) for CTAs and accents, white/light-grey backgrounds. Inter or Geist for body, a heavier weight for headings. Generous whitespace, large section padding, subtle gradient hero backgrounds. **A single CTA per section** — "Start for free" — never two competing CTAs. Mobile-first, thumb-friendly. Page load under 2 seconds; Lighthouse score ≥ 90 on all pages.

| Path           | Page             | Key elements                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | Homepage         | Full-viewport hero, single "Start for free — no credit card required" CTA, social proof bar (logo strip + 3 stats), 3-column features grid (Smart Invoicing, Expense Tracking, Bank Reconciliation, Financial Reports, Tax-Ready Exports, Team Collaboration), "How it works" 3-step flow, product screenshot with annotated callouts, 3 testimonial cards, pricing table (3 columns, "Most popular" on Pro, monthly/annual toggle), FAQ accordion (8+ questions), 4-column footer |
| `/features`    | Features         | Deep dive per feature: name → what it does → why it matters → screenshot. Sections: Invoicing, Expenses, Bank Sync, Reports, Tax, Payroll Exports, Team Access                                                                                                                                                                                                                                                                                                                     |
| `/pricing`     | Pricing          | Expanded pricing table, full feature comparison table, billing FAQ, "Talk to us" CTA → `/contact`                                                                                                                                                                                                                                                                                                                                                                                  |
| `/blog`        | Blog index       | Card grid: thumbnail, title, date, 2-line excerpt, "Read more". Seed 3–5 launch articles (cash flow tips, US quarterly tax deadlines, tracking business expenses)                                                                                                                                                                                                                                                                                                                  |
| `/blog/[slug]` | Blog post        | Post stored in DB (title, slug, markdown content, published_at, author)                                                                                                                                                                                                                                                                                                                                                                                                            |
| `/about`       | About            | Mission statement, company values, team section (placeholder cards if no real team yet)                                                                                                                                                                                                                                                                                                                                                                                            |
| `/contact`     | Contact          | Form: name, email, subject, message. On submit → email via Resend to `SUPPORT_EMAIL`. Success/error states                                                                                                                                                                                                                                                                                                                                                                         |
| `/privacy`     | Privacy Policy   | Linked from footer and required by the pre-launch checklist                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/terms`       | Terms of Service | Linked from footer and required by the pre-launch checklist                                                                                                                                                                                                                                                                                                                                                                                                                        |

---

## 9. Private Application (`/dashboard/*`)

### 9.1 App shell & navigation

- Persistent left sidebar (collapsible to icon-only on smaller screens).
- Sidebar items: **Dashboard, Invoices, Expenses, Clients, Bank Accounts, Reports, Tax Centre, Payroll Export, Team, Settings.**
- Top header bar: company name/logo, notification bell, quick-actions dropdown, user avatar dropdown (Profile, Settings, Logout).
- Breadcrumb trail beneath the header on all inner pages.
- Dark/light mode toggle, preference persisted in user settings.

### 9.2 Dashboard (`/dashboard`)

- **Key metrics row:** 4 KPI cards — Total Revenue (MTD), Outstanding Invoices (total $), Total Expenses (MTD), Net Cash Flow (MTD) — each with value, % change vs. previous month, trend arrow.
- **Cash flow chart:** line/area chart, income vs. expenses over the last 12 months, hover tooltip with exact amounts. Built with Recharts.
- **Recent invoices widget:** 5 most recent — client, invoice #, amount, due date, status badge. "View all" → `/dashboard/invoices`.
- **Recent expenses widget:** 5 most recent — date, category, description, amount. "View all" → `/dashboard/expenses`.
- **Upcoming due dates:** invoices due within 14 days, with days-remaining indicator.
- **Quick actions:** "New Invoice", "Log Expense", "Add Client".

### 9.3 Invoices (`/dashboard/invoices`)

- **List:** sortable/filterable table — Invoice #, Client, Issue Date, Due Date, Amount, Status. Filters: status, date range, client. Bulk actions: mark as paid, delete, download PDF. Search bar.
- **Create/edit** (`/dashboard/invoices/new`, `/dashboard/invoices/:id/edit`): auto-generated invoice number (e.g. `INV-0042`), issue/due date, client selector (search or create inline), dynamic line items (description, quantity, unit price, tax rate, line total), totals (subtotal, tax — possibly multiple rates, optional discount, total), notes/payment terms, logo upload (R2), currency defaults to USD with per-invoice override, footer actions: save as draft / preview / send.
- **PDF:** pixel-perfect A4/US Letter, generated server-side (e.g. `@react-pdf/renderer` or server-side Puppeteer). Includes logo, business info, itemized line items, totals, payment terms. Downloadable and auto-attached to the send email.
- **Send modal:** pre-filled recipient/subject/body (editable), PDF auto-attached, sent via Resend, status → "Sent" on dispatch.
- **Recurring invoices (Pro+):** toggle "Make this recurring" with frequency (weekly/fortnightly/monthly/quarterly/annually) and end date or "never"; a cron-style job or manual-trigger endpoint generates and emails the next invoice when due.

### 9.4 Expenses (`/dashboard/expenses`)

- **List:** sortable table — Date, Merchant, Category, Amount, Receipt, Notes. Filters: date range, category, amount range. Bulk delete, bulk CSV export.
- **Log expense** (`/dashboard/expenses/new`): date, merchant, amount (USD), category (US IRS Schedule C categories — see below), description/notes, receipt upload (drag-and-drop → Cloudflare R2, thumbnail shown), repeat-expense toggle, split-expense (allocate across multiple categories).
- **Categories:** pre-loaded with IRS Schedule C categories — Advertising, Car & Truck, Commissions, Insurance, Legal & Professional, Office Expenses, Rent, Repairs, Supplies, Travel, Meals (50% deductible), Utilities, Wages, Other. Users can add custom categories.

### 9.5 Clients (`/dashboard/clients`)

- List: name, email, phone, city, outstanding balance, total invoiced.
- Add/edit: name, company, email, phone, US-format billing address (street, city, state, ZIP), currency override.
- Detail page: full invoice/payment history for that client.
- Archive (soft delete) — historical data retained.

### 9.6 Bank Accounts (`/dashboard/bank`)

- **Manual accounts:** name, bank name, account type (checking/savings/credit card), starting balance. Manual transaction entry (date, description, amount, debit/credit, category, match to invoice/expense).
- **Reconciliation:** view unreconciled transactions for a period, match against invoices/expenses, mark reconciled, reconciliation summary report.
- **CSV import:** common US bank CSV formats, column-mapping UI, duplicate detection (same date + amount + description flagged).

### 9.7 Reports (`/dashboard/reports`)

All filterable by date range, exportable as PDF and CSV: Profit & Loss Statement, Balance Sheet, Cash Flow Statement, Accounts Receivable Aging (0–30/31–60/61–90/90+ days), Accounts Payable Aging, Tax Summary Report (by IRS category, by tax year), Sales by Client, Expense by Category (with pie chart), Invoice Report, Mileage Log Report.

### 9.8 Tax Centre (`/dashboard/tax`)

- Federal tax year defaults Jan 1–Dec 31 (configurable for fiscal-year businesses).
- Quarterly estimated tax reminder widget: IRS deadlines (Apr 15, Jun 15, Sep 15, Jan 15).
- 1099 contractor tracker: flags contractor expenses, exports 1099-NEC data as CSV.
- Sales tax tracking: records tax collected per invoice, reports total collected by state.
- Tax-ready export: one-click P&L + expense report + 1099 data package for accountant hand-off.
- Mileage tracker: date, start, end, purpose, miles — IRS standard mileage rate applied automatically.

### 9.9 Payroll Export (`/dashboard/payroll`)

Cashaflux does **not** process payroll directly — it produces payroll-ready exports for Gusto/ADP/Paychex.

- Record employee/contractor payments: name, type (W-2/1099), pay date, gross amount, hours worked (optional).
- Export payroll register as CSV in a format compatible with common payroll providers.
- Payroll expense automatically posted to the Wages category.

### 9.10 Team (`/dashboard/team`) — Business plan

- Invite by email (Resend invite link). Roles: Owner, Admin, Accountant (read-only on financials, can export), Member (limited access). Role-based access enforced at the API layer.
- Revoke access / remove member. Activity log of who created/edited/deleted what and when.

### 9.11 Settings (`/dashboard/settings`)

- **Business Profile** — name, type, address, phone, website, logo (R2), tax ID (EIN/SSN, encrypted), fiscal year start month.
- **Invoice Defaults** — payment terms (Net 7/15/30/60, Due on Receipt, Custom), default tax rate(s), invoice number prefix/starting number, default footer/notes text.
- **Notifications** — email me when: invoice paid, invoice overdue, new team member joins, trial expiring. Overdue reminder schedule: 1 day before, on due date, 7 days after, 14 days after.
- **Subscription & Billing** — current plan, upgrade/downgrade via Stripe Customer Portal link, invoice history, cancel subscription (Section 6).
- **Security** — change password, active sessions list with revoke, two-factor auth (plan for future release if Better Auth doesn't support it yet).
- **Data & Privacy** — export all data as JSON, delete account (soft delete, 30-day recovery window, then hard delete).

---

## 10. Database Schema (`shared/schema.ts`)

All tables defined with Drizzle ORM + PostgreSQL. `drizzle-zod` derives Zod validation schemas and TypeScript types from each table. Every org-scoped table carries `org_id`; every server query is scoped to the authenticated user's `org_id` — never trust a client-supplied org ID.

| Table                 | Key columns                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`               | id, name, email, email_verified, hashed_password, plan (free/pro/business), stripe_customer_id, created_at                                                                  |
| `sessions`            | id, user_id, expires_at, created_at (managed by Better Auth)                                                                                                                |
| `organizations`       | id, owner_user_id, name, type, address, ein, logo_r2_key, fiscal_year_start, created_at                                                                                     |
| `org_members`         | id, org_id, user_id, role (owner/admin/accountant/member), invited_at, joined_at                                                                                            |
| `clients`             | id, org_id, name, company, email, phone, address_line1, city, state, zip, currency, archived, created_at                                                                    |
| `invoices`            | id, org_id, client_id, invoice_number, status, issue_date, due_date, currency, subtotal, tax_total, discount, total, notes, logo_r2_key, created_by, created_at, updated_at |
| `invoice_line_items`  | id, invoice_id, description, quantity, unit_price, tax_rate, total                                                                                                          |
| `expenses`            | id, org_id, date, merchant, amount, category, description, receipt_r2_key, reconciled, created_by, created_at                                                               |
| `bank_accounts`       | id, org_id, name, bank_name, type, currency, current_balance, created_at                                                                                                    |
| `bank_transactions`   | id, bank_account_id, org_id, date, description, amount, type, category, reconciled, matched_invoice_id, matched_expense_id, created_at                                      |
| `recurring_invoices`  | id, org_id, template_invoice_id, frequency, next_date, end_date, active, created_at                                                                                         |
| `mileage_logs`        | id, org_id, date, origin, destination, miles, purpose, created_by, created_at                                                                                               |
| `blog_posts`          | id, title, slug, content_md, excerpt, published_at, author, created_at                                                                                                      |
| `contact_submissions` | id, name, email, subject, message, created_at                                                                                                                               |
| `activity_log`        | id, org_id, user_id, action, entity_type, entity_id, created_at                                                                                                             |

Better Auth creates its own tables (`user`, `session`, `account`, `verification`) automatically on first request. Run `npx better-auth generate` and add the output to `shared/schema.ts` before running `pnpm db:push`.

---

## 11. API Design

All routes are under `/api`. Auth is checked via Better Auth session middleware on every protected route. The contact form and blog routes are unauthenticated.

### Auth

- `/api/auth/*` — handled entirely by Better Auth.

### Protected (require session)

| Method             | Endpoint                        | Description                                    |
| ------------------ | ------------------------------- | ---------------------------------------------- |
| GET                | `/api/dashboard/summary`        | KPI metrics for the dashboard                  |
| GET / POST         | `/api/invoices`                 | List / create invoices                         |
| GET / PUT / DELETE | `/api/invoices/:id`             | Get / update / delete invoice                  |
| POST               | `/api/invoices/:id/send`        | Send invoice via email (Resend)                |
| POST               | `/api/invoices/:id/mark-paid`   | Mark invoice as paid                           |
| GET                | `/api/invoices/:id/pdf`         | Stream PDF of invoice                          |
| GET / POST         | `/api/expenses`                 | List / create expenses                         |
| GET / PUT / DELETE | `/api/expenses/:id`             | Get / update / delete expense                  |
| POST               | `/api/expenses/:id/receipt`     | Upload receipt to R2                           |
| GET / POST         | `/api/clients`                  | List / create clients                          |
| GET / PUT / DELETE | `/api/clients/:id`              | Get / update / archive client                  |
| GET / POST         | `/api/bank-accounts`            | List / create bank accounts                    |
| GET / POST         | `/api/bank-transactions`        | List / create transactions                     |
| POST               | `/api/bank-transactions/import` | Import CSV transactions                        |
| GET                | `/api/reports/:type`            | Generate report (p-and-l, balance-sheet, etc.) |
| GET                | `/api/tax/summary`              | Tax summary for a given year                   |
| GET / POST         | `/api/mileage`                  | List / log mileage entries                     |
| GET / POST         | `/api/team`                     | List members / invite member                   |
| DELETE             | `/api/team/:userId`             | Remove team member                             |
| GET / PUT          | `/api/settings`                 | Get / update org settings                      |
| POST               | `/api/settings/logo`            | Upload org logo to R2                          |
| GET                | `/api/subscription`             | Current plan info                              |
| POST               | `/api/subscription/checkout`    | Create Stripe Checkout session                 |
| POST               | `/api/subscription/portal`      | Create Stripe Customer Portal session          |

### Public

| Method | Endpoint          | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/api/blog`       | List published blog posts                    |
| GET    | `/api/blog/:slug` | Get single blog post                         |
| POST   | `/api/contact`    | Submit contact form (sends email via Resend) |

---

## 12. Email Templates (via Resend)

Use React Email or plain HTML templates styled inline. Sender address is configured via `EMAIL_FROM`.

| Email                        | Trigger                                  | Content                                     |
| ---------------------------- | ---------------------------------------- | ------------------------------------------- |
| Welcome                      | New sign-up                              | Welcome message, CTA to complete onboarding |
| Email verification           | After sign-up                            | Verify-your-email button (Better Auth)      |
| Password reset               | Forgot password flow                     | Reset link, expires in 1 hour               |
| Invoice sent                 | User sends invoice to client             | Invoice PDF attached, payment instructions  |
| Invoice paid confirmation    | Invoice marked paid                      | Thank-you to client, receipt summary        |
| Invoice overdue reminder     | Scheduled, per overdue reminder settings | Friendly reminder, invoice link             |
| Team invite                  | User invites team member                 | Invite link, expiry info                    |
| Trial expiring               | 3 days before trial ends                 | Upgrade CTA, feature summary                |
| Contact form acknowledgement | Contact form submitted                   | Confirmation to the submitter               |

---

## 13. File Storage (Cloudflare R2)

- All uploads (receipts, logos, invoice attachments) stored in a single R2 bucket.
- Key naming convention: `{orgId}/{type}/{uuid}.{ext}` — e.g. `org_abc123/receipts/550e8400.jpg`.
- Server generates a pre-signed **PUT** URL; client uploads directly to R2 (avoids proxying large files through Express).
- Server stores only the R2 key in the database, never a public URL.
- For display, server generates a short-lived pre-signed **GET** URL on demand.

---

## 14. Environment Variables

All variables declared in `server/src/env.ts` via `required()` / `optional()` helpers. Document every variable in `.env.example` with a comment explaining its purpose.

```
# Core
NODE_ENV=                        # development or production

# Database
DATABASE_URL=                    # Postgres connection string (Railway injects automatically)

# Better Auth
BETTER_AUTH_SECRET=              # Random 32-byte secret — openssl rand -base64 32
BETTER_AUTH_URL=                 # Full base URL, e.g. https://cashaflux.com

# Resend
RESEND_API_KEY=
EMAIL_FROM=                      # e.g. hello@cashaflux.com

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_ANNUAL=
STRIPE_PRICE_BUSINESS_MONTHLY=
STRIPE_PRICE_BUSINESS_ANNUAL=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Optional
SUPPORT_EMAIL=                   # Receives contact form submissions
```

---

## 15. Development Phases

Work proceeds in ordered phases. Each phase ends with the **per-phase quality gate** in Section 3 (tests → run tests → lint fix → typecheck) before moving on.

1. **Phase 0 — Scaffolding:** repo structure, tsconfig/vite config, Drizzle + Postgres, Better Auth wired at `/api/auth/*`, brand tokens + dark/light toggle (Section 4).
2. **Phase 1 — Auth & Onboarding:** signup, email verification, login, forgot/reset password, 4-step onboarding wizard.
3. **Phase 2 — Core Data Model:** organizations, org_members, clients, invoices, invoice_line_items, expenses, bank_accounts, bank_transactions tables + CRUD APIs + TanStack Query hooks.
4. **Phase 3 — Invoicing:** full invoice editor, server-side PDF generation, Resend send flow, recurring invoices.
5. **Phase 4 — Expenses & Mileage:** receipt upload to R2, category rules, split expenses, mileage tracker.
6. **Phase 5 — Bank & Reconciliation:** manual accounts, CSV import with column mapping, matching/reconciliation UI.
7. **Phase 6 — Reports & Tax Centre:** all report types, PDF/CSV export, quarterly tax reminders, 1099 tracker, tax-ready export package.
8. **Phase 7 — Payroll Export, Team, Settings:** payroll register CSV export, team invites/roles, full settings surface.
9. **Phase 8 — Billing:** Stripe products/prices, checkout, webhook handler, on-demand status refresh, Customer Portal (Section 6).
10. **Phase 9 — Public Marketing Site:** all pages in Section 8, blog seed content, SEO/Open Graph, sitemap.
11. **Phase 10 — Hardening & Launch:** Section 18 security pass, Section 19 performance/SEO, Section 20 test coverage, pre-launch checklist (Section 22).

---

## 16. Deployment — Railway CLI

The developer deploys directly from their local machine using the Railway CLI. There is **no GitHub repository or CI/CD pipeline** involved.

### One-time setup

- Install the Railway CLI: `npm install -g @railway/cli`.
- Log in: `railway login` (opens browser for OAuth).
- Create a new project on the Railway dashboard or via `railway init`.
- Add a PostgreSQL database service: `railway add --database postgres` (Railway injects `DATABASE_URL` automatically).
- Add all other environment variables in the Railway dashboard under the service's Variables tab.
- Link the local project directory: `railway link`.
- Configure the service start command: `tsx server/src/index.ts`.
- Configure the service build command: `pnpm install && pnpm build`.

### Deploying

- From the project root: `railway up`. The CLI scans, compresses, and uploads local files.
- Railway builds using Railpack (auto-detects pnpm + Node.js). Build step: `pnpm install && pnpm build` (compiles the Vite client to `dist/client/`). Start step: `tsx server/src/index.ts` (`NODE_ENV=production` → Express serves static files).
- Deployment logs stream to the terminal in real time. Use `railway up --detach` to return immediately; check logs later with `railway logs`.

### Custom domain

- Railway dashboard → service → Settings → Domains → add `cashaflux.com`.
- Configure the provided CNAME/A records at the DNS provider. Railway provisions a free TLS cert via Let's Encrypt.
- Update `BETTER_AUTH_URL` to `https://cashaflux.com`.

### Database migrations

- After any schema change in `shared/schema.ts`, run `pnpm db:push` against the Railway `DATABASE_URL`.
- Always back up before destructive schema changes: `railway connect` → `pg_dump`.

### Useful Railway CLI commands

| Command                | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `railway up`           | Deploy current local directory to Railway               |
| `railway up --detach`  | Deploy without waiting for logs                         |
| `railway logs`         | Stream live deployment logs                             |
| `railway logs --build` | View the most recent build logs                         |
| `railway variables`    | List all environment variables for the linked service   |
| `railway connect`      | Open a shell connected to the Railway Postgres database |
| `railway open`         | Open the Railway project dashboard in a browser         |
| `railway status`       | Show current deployment status                          |
| `railway redeploy`     | Redeploy the latest build without uploading new code    |

---

## 17. Local Development Workflow

- Install dependencies: `pnpm install`.
- Copy environment file: `cp .env.example .env` — fill in all required values.
- Generate `BETTER_AUTH_SECRET`: `openssl rand -base64 32`.
- Start local Postgres: `docker compose up -d`.
- Push schema to local DB: `pnpm db:push`.
- Start dev server: `pnpm dev` — app runs at `http://localhost:3000` (Vite HMR works without a separate port).
- Use `pnpm db:studio` to inspect the database via Drizzle Studio.
- For testing emails locally, use a Resend test API key or an email preview tool.

---

## 18. Security Requirements

- All passwords hashed by Better Auth (bcrypt); never store plaintext passwords.
- Session tokens stored as HTTP-only cookies; `sameSite: lax`.
- EIN / SSN stored encrypted at rest (server-side AES-256-GCM encryption helper; never plaintext).
- All API routes validate request bodies against Zod schemas imported from `shared/schema.ts`.
- **Organization isolation:** every database query scoped to the authenticated user's `org_id` — never trust client-supplied org IDs.
- R2 files accessed via short-lived pre-signed URLs only; no public bucket access.
- Stripe webhook signature verified using `STRIPE_WEBHOOK_SECRET` on every incoming webhook.
- Rate limiting on auth endpoints (`/api/auth/sign-in`, `/api/auth/sign-up`, forgot-password) — use `express-rate-limit`.
- CORS restricted to `cashaflux.com` in production.
- Helmet.js middleware for HTTP security headers.
- Input sanitization on all user-supplied text stored in the database.
- HTTPS enforced in production (Railway handles TLS termination).

---

## 19. Performance & SEO

**Frontend performance**

- Code-split by route using `React.lazy` and `Suspense` — the app bundle should not load on the public marketing pages.
- Public marketing pages must achieve a Lighthouse Performance score ≥ 90.
- All images served as WebP; explicit width/height attributes to prevent layout shift.
- Fonts preloaded in `index.html` via `<link rel="preload">`.
- Vite build produces hashed asset filenames for long-term caching.

**SEO**

- Each public page has a unique `<title>` and `<meta name="description">`.
- Open Graph tags on homepage and key pages.
- Canonical URL tags on all pages.
- `robots.txt`: allow public pages, disallow `/dashboard` and `/api`.
- `sitemap.xml` generated at `/sitemap.xml` (all public routes + published blog posts).
- Structured data (JSON-LD) on the homepage: `SoftwareApplication` schema with name, description, price, rating.

---

## 20. Testing Recommendations

A full automated test suite is out of scope for the initial build, but the following should be implemented before launch:

- API integration tests for critical paths: sign-up, login, create invoice, send invoice, mark paid, create expense.
- Use Vitest (compatible with Vite) for both unit and integration tests.
- Test the Stripe webhook handler with test events from the Stripe CLI.
- Cross-browser smoke test: Chrome, Firefox, Safari, Edge on the public homepage and dashboard.
- Mobile responsiveness test on iOS Safari and Android Chrome.

---

## 21. Pre-Launch Checklist

**Infrastructure & Config**

- Railway service running with all environment variables set.
- Custom domain `cashaflux.com` pointing to the Railway service with TLS active.
- Stripe products and prices created; Price IDs set in env.
- Stripe webhook endpoint registered and secret set in env.
- Resend API key active; sender domain verified.
- Cloudflare R2 bucket created; credentials set in env.
- Better Auth tables created (`npx better-auth generate` then `pnpm db:push`).
- Seed initial blog posts.

**Application**

- All auth flows tested end-to-end: sign-up, login, forgot/reset password.
- Invoice creation, send, and PDF download verified.
- Expense logging with receipt upload verified.
- Stripe upgrade and cancellation flows tested in test mode, including the on-demand status-refresh trigger points (Section 6).
- All report types render without errors.
- Contact form sends email to support address.
- All email templates render correctly in major email clients.
- Mobile layout verified on real devices.
- Lighthouse scores ≥ 90 on homepage.

**Legal & Content**

- Privacy Policy page written (data collection, cookies, third-party services).
- Terms of Service page written.
- Cookie consent banner implemented if using analytics.
- All placeholder content (testimonials, team bios, stats) replaced with real or credible content.

---

## 22. Post-Launch Feature Roadmap

Out of scope for the initial build, but a natural growth path. **This is the only section where AI/ML is mentioned — it is not part of v1.**

- Bank feed integration via Plaid — automatically import and categorize bank transactions.
- **AI-powered expense categorization** — an ML model suggests categories from merchant names. _(First and only AI feature on the roadmap — post-launch, not v1.)_
- Mobile apps — React Native or PWA with offline support.
- Multi-currency support — record and report in currencies other than USD.
- Direct Stripe payment links — embed a "Pay Now" button in invoices.
- Document storage — attach contracts and other documents to client records.
- Budgeting module — set budgets by category and track actuals vs. budget.
- Accountant portal — invite a CPA with read-only access across multiple clients.
- QuickBooks / Xero data import — one-click migration for switchers.
- White-label / agency mode — allow accountants to manage multiple business accounts.

End of Document
