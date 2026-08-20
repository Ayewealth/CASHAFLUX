# Phase 1: Auth & Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Backend tasks (1-3):** Execute on GLM-5.2. **Frontend tasks (4-7):** Execute on Gemini 2.5.

**Goal:** Implement full authentication (signup, login, email verification, password reset) and a 4-step onboarding wizard for new users.

**Architecture:** Better Auth handles auth server-side with email/password, Resend for transactional emails, express-rate-limit on auth endpoints. Client uses Better Auth's `createAuthClient()` SDK for all auth operations. Onboarding wizard is client-side state until final submit.

**Tech Stack:** Better Auth 1.2.7, Resend, express-rate-limit, React Router v7, TanStack Query, shadcn/ui, Zod

## Global Constraints

- No `any` type — never use TypeScript `any`
- No `undefined` as a type — model absence with `null`, optional fields, or discriminated unions
- WCAG 2.1 AA: color contrast ≥ 4.5:1, all inputs have `<label>`, error messages via `aria-live`
- Never reveal whether an email exists in the system (login and forgot-password errors are generic)
- Brand palette: navy `#1E3A5F`, blue `#2563EB`, success `#16A34A`, warning `#D97706`, danger `#DC2626`
- Password validation: minimum 8 characters, at least one number
- Daily rate limit: 10 signups per IP, 20 login attempts per IP, 5 forgot-password per IP
- `.env` is gitignored — never commit secrets

---

## File Structure

```
server/src/
  auth.ts                        # MODIFY: Full Better Auth config with plugins, hooks, email
  index.ts                       # MODIFY: Add rate limiting middleware on auth routes
  emails/
    send.ts                      # CREATE: Email sending utility using Resend SDK
    templates/
      verify-email.html          # CREATE: Email verification HTML template
      reset-password.html        # CREATE: Password reset HTML template
      welcome.html               # CREATE: Welcome email HTML template

client/src/
  lib/
    auth-client.ts               # CREATE: Better Auth client SDK initialization
    router.tsx                   # MODIFY: Add AuthGuard to dashboard, add onboarding routes
  components/
    AuthGuard.tsx                # CREATE: Protected route wrapper
  pages/
    LoginPage.tsx                # MODIFY: Full login form with validation
    SignupPage.tsx               # MODIFY: Full signup form with validation
    ForgotPasswordPage.tsx       # MODIFY: Full forgot-password form
    ResetPasswordPage.tsx        # MODIFY: Full reset-password form with token
    onboarding/
      OnboardingLayout.tsx       # CREATE: Wizard layout with progress bar
      Step1BusinessProfile.tsx   # CREATE: Business profile form
      Step2CurrencyLocale.tsx    # CREATE: Currency/locale confirm step
      Step3InviteTeam.tsx        # CREATE: Optional invite team step
      Step4ChoosePlan.tsx        # CREATE: Plan picker step
```

---

### Task 1: Better Auth Server Config — Plugins, Hooks, Rate Limiting

**Files:**
- Modify: `server/src/auth.ts`
- Modify: `server/src/index.ts`
- Modify: `package.json` (deps added)

**Interfaces:**
- Consumes: `env.ts` (RESEND_API_KEY, EMAIL_FROM, BETTER_AUTH_URL)
- Produces: `auth` instance with full email verification, password reset, rate limiting, and database hooks

- [ ] **Step 1: Install packages**

```bash
pnpm add resend express-rate-limit
pnpm add -D @types/express-rate-limit
```

- [ ] **Step 2: Rewrite `server/src/auth.ts`**

Replace the skeleton with the full config:

```ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { resend } from 'better-auth/plugins/resend'
import { db } from './db/client'
import { env } from './env'
import { users } from '@shared/schema'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  basePath: '/api/auth',
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  emailVerification: {
    sendVerificationEmail: {
      async send(data) {
        const { sendEmail } = await import('./emails/send')
        await sendEmail({
          to: data.user.email,
          subject: 'Verify your Cashaflux email',
          html: `<a href="${data.url}">Verify email</a>`,
        })
      },
    },
  },
  forgotPassword: {
    sendResetPassword: {
      async send(data) {
        const { sendEmail } = await import('./emails/send')
        await sendEmail({
          to: data.user.email,
          subject: 'Reset your Cashaflux password',
          html: `<a href="${data.url}">Reset password</a>`,
        })
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(users).values({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: false,
            hashedPassword: '',
            plan: 'free',
          })
        },
      },
    },
  },
})
```

- [ ] **Step 3: Add rate limiting middleware to `server/src/index.ts`**

Add before the auth handler:

```ts
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

app.use('/api/auth', authLimiter)
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add server/src/auth.ts server/src/index.ts package.json
git commit -m "feat(phase-1): configure Better Auth with Resend plugin, email verification, password reset, database hooks, rate limiting"
```

---

### Task 2: Email Service & Templates

**Files:**
- Create: `server/src/emails/send.ts`
- Create: `server/src/emails/templates/verify-email.html`
- Create: `server/src/emails/templates/reset-password.html`
- Create: `server/src/emails/templates/welcome.html`
- Delete: `server/src/emails/.gitkeep`

- [ ] **Step 1: Create `server/src/emails/send.ts`**

```ts
import { Resend } from 'resend'
import { env } from '../env'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY)
  }
  return resendClient
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ id: string } | { error: Error }> {
  try {
    const result = await getResend().emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    return result
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }
}
```

- [ ] **Step 2: Create `server/src/emails/templates/verify-email.html`**

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Poppins, system-ui, sans-serif; background: #F9FAFB; padding: 40px;">
  <table width="100%"><tr><td align="center">
    <table style="max-width: 480px; background: white; border-radius: 12px; padding: 32px;">
      <tr><td style="text-align: center; padding-bottom: 24px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Cashaflux</h1>
      </td></tr>
      <tr><td style="text-align: center; padding-bottom: 16px;">
        <h2 style="color: #1E3A5F; font-size: 18px; margin: 0;">Welcome to Cashaflux</h2>
        <p style="color: #6B7280; font-size: 14px; margin-top: 8px;">Click the button below to verify your email address.</p>
      </td></tr>
      <tr><td style="text-align: center; padding: 24px 0;">
        <a href="{{VERIFY_URL}}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Verify Email</a>
      </td></tr>
      <tr><td style="text-align: center; padding-top: 16px;">
        <p style="color: #9CA3AF; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>
```

- [ ] **Step 3: Create `server/src/emails/templates/reset-password.html`**

Same structure as verify-email but with reset content and `{{RESET_URL}}`.

- [ ] **Step 4: Create `server/src/emails/templates/welcome.html`**

Same structure but with "You're all set" content and a link to `/onboarding`.

- [ ] **Step 5: Delete `.gitkeep`**

```bash
Remove-Item server/src/emails/.gitkeep
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add server/src/emails/
git commit -m "feat(phase-1): create email service and auth email templates"
```

---

### Task 3: Server-Side Auth Middleware for API Routes

**Files:**
- Create: `server/src/middleware/auth.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Create `server/src/middleware/auth.ts`**

```ts
import { type Request, type Response, type NextFunction } from 'express'
import { auth } from '../auth'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  req.user = session.user
  req.session = session.session
  next()
}
```

- [ ] **Step 2: Add type declaration for req.user / req.session**

Add to `server/src/index.ts` or a `server/src/types.ts`:

```ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string; plan: string }
      session?: { id: string; expiresAt: Date }
    }
  }
}
```

- [ ] **Step 3: Mount the middleware on protected routes in `server/src/index.ts`**

```ts
import { requireAuth } from './middleware/auth'

// Protected API routes
app.use('/api/invoices', requireAuth)
app.use('/api/expenses', requireAuth)
app.use('/api/clients', requireAuth)
app.use('/api/bank-accounts', requireAuth)
app.use('/api/bank-transactions', requireAuth)
app.use('/api/reports', requireAuth)
app.use('/api/tax', requireAuth)
app.use('/api/mileage', requireAuth)
app.use('/api/team', requireAuth)
app.use('/api/settings', requireAuth)
app.use('/api/subscription', requireAuth)
app.use('/api/dashboard', requireAuth)
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add server/src/middleware/ server/src/index.ts
git commit -m "feat(phase-1): add requireAuth middleware for protected API routes"
```

---

### Task 4: Auth Client, AuthGuard, and Protected Routes

**Files:**
- Create: `client/src/lib/auth-client.ts`
- Create: `client/src/components/AuthGuard.tsx`
- Modify: `client/src/lib/router.tsx`

- [ ] **Step 1: Create `client/src/lib/auth-client.ts`**

```ts
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: window.location.origin,
})
```

- [ ] **Step 2: Create `client/src/components/AuthGuard.tsx`**

```tsx
import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router'
import { authClient } from '../lib/auth-client'

export default function AuthGuard() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session) {
      navigate('/login', { replace: true })
    }
  }, [session, isPending, navigate])

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return <Outlet />
}
```

- [ ] **Step 3: Update `client/src/lib/router.tsx`**

Add onboarding routes (lazy) and wrap dashboard in AuthGuard:

```tsx
import AuthGuard from '../components/AuthGuard'

// Add to router array, before dashboard:
{ path: '/onboarding', lazy: () => import('../pages/onboarding/OnboardingLayout').then(m => ({ Component: m.default })), children: [
  { index: true, lazy: () => import('../pages/onboarding/Step1BusinessProfile').then(m => ({ Component: m.default })) },
  { path: 'step-2', lazy: () => import('../pages/onboarding/Step2CurrencyLocale').then(m => ({ Component: m.default })) },
  { path: 'step-3', lazy: () => import('../pages/onboarding/Step3InviteTeam').then(m => ({ Component: m.default })) },
  { path: 'step-4', lazy: () => import('../pages/onboarding/Step4ChoosePlan').then(m => ({ Component: m.default })) },
] },
// Wrap dashboard in AuthGuard:
{
  path: '/dashboard',
  element: <AuthGuard />,
  children: [ ...existing dashboard children ],
},
```

- [ ] **Step 4: Verify TypeScript compiles + build**

```bash
pnpm tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/auth-client.ts client/src/components/ client/src/lib/router.tsx
git commit -m "feat(phase-1): add auth client, AuthGuard, protect dashboard routes"
```

---

### Task 5: LoginPage + SignupPage

**Files:**
- Modify: `client/src/pages/LoginPage.tsx`
- Modify: `client/src/pages/SignupPage.tsx`

- [ ] **Step 1: Rewrite `LoginPage.tsx`**

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) {
      setError('Invalid email or password')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1">Password</label>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          {error && <p className="text-sm text-danger" aria-live="polite">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-accent text-white font-semibold rounded-lg hover:bg-brand-blue disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2 text-sm">
          <Link to="/forgot-password" className="text-accent hover:underline block">Forgot password?</Link>
          <Link to="/signup" className="text-text-muted hover:text-text block">Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `SignupPage.tsx`**

Similar structure with name, email, password, confirm-password fields. Zod validation inline. On submit, calls `authClient.signUp.email({ name, email, password })`. On success, show "Check your email to verify" message. Link to login.

- [ ] **Step 3: Verify TypeScript compiles + build**

```bash
pnpm tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/LoginPage.tsx client/src/pages/SignupPage.tsx
git commit -m "feat(phase-1): build login and signup pages with form validation"
```

---

### Task 6: ForgotPasswordPage + ResetPasswordPage

**Files:**
- Modify: `client/src/pages/ForgotPasswordPage.tsx`
- Modify: `client/src/pages/ResetPasswordPage.tsx`

- [ ] **Step 1: Rewrite `ForgotPasswordPage.tsx`**

Single email field, submit calls `authClient.forgotPassword({ email })`, success shows "Check your email for a reset link". Generic error. Link back to login.

- [ ] **Step 2: Rewrite `ResetPasswordPage.tsx`**

Read token from URL search params. New password + confirm password fields. Submit calls `authClient.resetPassword({ newPassword, token })`. On success redirect to `/login` with success message. On error show "Link expired or invalid" with link to `/forgot-password`.

- [ ] **Step 3: Verify TypeScript compiles + build**

```bash
pnpm tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/ForgotPasswordPage.tsx client/src/pages/ResetPasswordPage.tsx
git commit -m "feat(phase-1): build forgot and reset password pages"
```

---

### Task 7: Onboarding Wizard (4 Steps)

**Files:**
- Create: `client/src/pages/onboarding/OnboardingLayout.tsx`
- Create: `client/src/pages/onboarding/Step1BusinessProfile.tsx`
- Create: `client/src/pages/onboarding/Step2CurrencyLocale.tsx`
- Create: `client/src/pages/onboarding/Step3InviteTeam.tsx`
- Create: `client/src/pages/onboarding/Step4ChoosePlan.tsx`

- [ ] **Step 1: Create `OnboardingLayout.tsx`**

Wizard layout with progress bar (4 steps), "Skip to dashboard" link, and `<Outlet />` for step content. Manages wizard state via React context or URL search params (`?step=1`). The final submit in Step 4 calls a POST to `/api/onboarding` to create the organization and org_member records.

- [ ] **Step 2: Create `Step1BusinessProfile.tsx`**

Form with: business name (required), business type (select), industry (text), tax year start month (month picker, defaults to January). "Next" button.

- [ ] **Step 3: Create `Step2CurrencyLocale.tsx`**

Display-only confirm step: "USD / United States" with a "Confirm" button. "Back" to edit.

- [ ] **Step 4: Create `Step3InviteTeam.tsx`**

Dynamic list of email inputs. "Add another" button, remove button per row. "Skip this step" and "Next" buttons.

- [ ] **Step 5: Create `Step4ChoosePlan.tsx`**

Three plan cards: Free ($0), Pro ($19/mo), Business ($39/mo). "Most popular" badge on Pro. "Start Free" / "Choose Pro" / "Choose Business" buttons. On click, submit wizard data to `/api/onboarding` POST endpoint, then redirect to `/dashboard`.

- [ ] **Step 6: Create `POST /api/onboarding` server endpoint**

In `server/src/index.ts`:

```ts
app.post('/api/onboarding', requireAuth, async (req, res) => {
  const { businessName, businessType, industry, fiscalYearStart, inviteEmails, plan } = req.body
  const org = await db.insert(organizations).values({
    id: crypto.randomUUID(),
    ownerUserId: req.user!.id,
    name: businessName,
    type: businessType,
    fiscalYearStart,
  }).returning()
  await db.insert(orgMembers).values({
    id: crypto.randomUUID(),
    orgId: org[0].id,
    userId: req.user!.id,
    role: 'owner',
    joinedAt: new Date(),
  })
  // If plan is not free, redirect to Stripe checkout (Phase 8)
  res.json({ orgId: org[0].id })
})
```

- [ ] **Step 7: Verify TypeScript compiles + build**

```bash
pnpm tsc --noEmit
pnpm build
```

- [ ] **Step 8: Commit**

```bash
git add client/src/pages/onboarding/ server/src/index.ts
git commit -m "feat(phase-1): build 4-step onboarding wizard with API endpoint"
```

---

## Spec Coverage Check

| Design Section | Covered By |
|---|---|
| A — Auth Config (Resend plugin, email verification, password reset, database hooks, rate limiting) | Task 1 |
| B — Email Service & Templates | Task 2 |
| C — Auth Client, AuthGuard, Protected Routes | Task 4 |
| D — LoginPage + SignupPage | Task 5 |
| E — ForgotPasswordPage + ResetPasswordPage | Task 6 |
| F — Onboarding Wizard (4 steps) | Task 7 |
| G — Server-side auth middleware for API routes | Task 3 |
| H — Verification / Quality Gate | All tasks include tsc + build verification |