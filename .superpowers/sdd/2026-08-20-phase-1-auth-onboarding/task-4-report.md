### Task 4 Report: Auth Client, AuthGuard, and Protected Routes

**Date:** 2026-08-20
**Status:** Complete

---

#### Files Created

1. **`client/src/lib/auth-client.ts`**
   - Creates Better Auth client via `createAuthClient` from `better-auth/react`
   - Configured with `window.location.origin` as baseURL
   - Uses `better-auth/react` (not `better-auth/client`) for React hook support (`useSession`)

2. **`client/src/components/AuthGuard.tsx`**
   - Reusable auth guard component that can wrap any route group
   - Uses `authClient.useSession()` as a top-level React hook (correct pattern per instructions)
   - Returns `{ data: session | null, isPending: boolean }`
   - Shows Skeleton loading state while session is being fetched
   - Redirects unauthenticated users to `/login` with `replace: true`
   - Renders `<Outlet />` for authenticated users

#### Files Modified

3. **`client/src/lib/router.tsx`**
   - Added `/onboarding` route with lazy-loaded children:
     - `OnboardingLayout` (layout wrapper)
     - `Step1BusinessProfile` (index)
     - `Step2CurrencyLocale` (`step-2`)
     - `Step3InviteTeam` (`step-3`)
     - `Step4ChoosePlan` (`step-4`)
   - Dashboard routes preserved under `/dashboard` → `Layout` with all child routes intact

4. **`client/src/pages/dashboard/Layout.tsx`**
   - Combined layout chrome (sidebar, main content area) with authentication check
   - Integrated `authClient.useSession()` hook directly into Layout
   - Shows inline loading placeholder during session fetch
   - Redirects to `/login` when no session exists
   - This approach avoids nesting Outlets between separate AuthGuard and Layout components

#### Stub Files Created (for lazy route resolution)

5. **`client/src/pages/onboarding/OnboardingLayout.tsx`** — stub export (Task 7 replaces)
6. **`client/src/pages/onboarding/Step1BusinessProfile.tsx`** — stub export (Task 7 replaces)
7. **`client/src/pages/onboarding/Step2CurrencyLocale.tsx`** — stub export (Task 7 replaces)
8. **`client/src/pages/onboarding/Step3InviteTeam.tsx`** — stub export (Task 7 replaces)
9. **`client/src/pages/onboarding/Step4ChoosePlan.tsx`** — stub export (Task 7 replaces)

---

#### Deviations from Brief

- **Step 2 — AuthGuard hook pattern:** Brief's code used `useEffect` + `navigate` inside a `useAuthQuery` result. Corrected to use `authClient.useSession()` as a top-level hook per React rules of hooks. No `useEffect` needed — redirect happens synchronously in render when `!session`.

- **Dashboard AuthGuard placement:** The brief's suggested approach of wrapping dashboard children with `element: <AuthGuard />` alongside a separate `lazy: () => import(Layout)` would create nested Outlet issues (both Layout and AuthGuard render `<Outlet />`). Instead, merged auth logic into Layout.tsx so there is a single layer of `<Outlet />` rendering dashboard pages. `AuthGuard.tsx` remains available as a standalone reusable component for other route groups.

#### Fixes Applied (Review Findings)

The following fixes address review findings on Task 4:

1. **AuthGuard not integrated into router.tsx** — Updated `router.tsx` to wrap dashboard routes with `{ path: '/dashboard', element: <AuthGuard />, children: [...] }`. Layout is now a nested child under AuthGuard, giving three-level nesting: AuthGuard → Layout → page components. Each level renders its own `<Outlet />`.

2. **Duplicate auth patterns removed from Layout.tsx** — Removed `authClient`, `useNavigate`, session check, loading state, and redirect logic from `Layout.tsx`. Layout is now a pure chrome/layout component (sidebar + header + `<Outlet />`).

3. **Plain `<a href>` replaced with React Router `<Link>`** — Changed `<a href="/dashboard">` to `<Link to="/dashboard">` and `<a href="/dashboard/invoices">` to `<Link to="/dashboard/invoices">` in `Layout.tsx` sidebar navigation.

4. **void suppressor removed from AuthGuard** — Changed `void navigate('/login', { replace: true })` to `navigate('/login', { replace: true }); return` in `AuthGuard.tsx` to properly surface navigation errors instead of suppressing them with `void`.

```
pnpm tsc --noEmit
→ 0 errors (clean compile)
```

- **Import source:** Used `better-auth/react` instead of `better-auth/client` because the vanilla client export doesn't include React hooks (`useSession`), only the React subpath does.

#### TypeScript Verification

```
pnpm tsc --noEmit
→ 0 errors (clean compile)
```

#### Next Steps

- **Task 7** will replace the onboarding stub files with actual page implementations
- **Task 7** will also update the OnboardingLayout to provide navigation between steps
- After Task 7, `Layout.tsx` may be refactored by Task 7 to separate auth concern back into `AuthGuard` if desired
