# CASHAFLUX — AGENT

> Instructions for any coding agent (Claude Code or otherwise) working in this repo. Read `PRODUCT.md or PROJECT_CONTEXT.md` in full first — it is the spec. This file is about **how** to work, not **what** to build.
>
> This file assumes the [Superpowers](https://github.com/obra/superpowers) skills framework (`obra/superpowers`) is installed, plus the `design-taste-frontend` ("taste") skill and the project-local skills listed in Section 6. Skills auto-trigger by context once installed — you generally don't need to invoke them by name, but this file tells you which ones matter for _this_ project and how they chain together.

---

## 0. Ground rules

1. **`using-superpowers` is the dispatcher.** It runs a skill check before any task — including before asking clarifying questions. If you catch yourself thinking "this is just a simple question" or "let me gather context first" without checking for a skill, stop and check. This file, `PRODUCT.md or PROJECT_CONTEXT.md`, and any direct request from the user always take precedence over a skill's default behavior — but skills override your own improvisation.
2. **AI features are out of scope for v1** (see `PRODUCT.md or PROJECT_CONTEXT.md` Section 0 and 22). If a skill or your own instincts push you toward adding AI-powered categorization, an assistant, or similar — don't. It's a Post-Launch Roadmap item.
3. **No GitHub, no CI/CD.** `PRODUCT.md or PROJECT_CONTEXT.md` Section 16 is explicit: deploy is `railway up` from the local machine. Skills that assume a GitHub PR workflow (`github-pr-review`) don't apply unless the project later adds a remote for collaboration — flag that decision to the user rather than assuming it.
4. **Not every skill in your list gets used.** Section 6 below is a deliberate pairing exercise, not a checklist to exhaust. Several skills in your directory don't fit this project at all (native mobile, Convex, brutalist/Material aesthetics) — Section 7 says why, explicitly, so you don't reach for them by accident.

---

## 0.5 Model Routing & Dispatch

OpenCode cannot switch models automatically. Before starting any task, analyze the domain of the work and check the currently active model. If the active model does not match the required domain, you MUST STOP execution entirely and explicitly instruct the user to switch models.

- **Frontend & UI Design:** Use **Gemini 2.5**.
- **Backend & Complex Logic:** Use **DeepSeek v4 Pro**.
- **Planning & Simple Tasks:** Use **DeepSeek v4 Flash**.

**Rule of Thumb:** Do not execute frontend tasks with DeepSeek, and do not execute backend tasks with Gemini. If a model switch is required, halt and output: "Please switch to [Model Name] for this task." Wait for the user to confirm the switch before proceeding with your skills.

---

## 1. The core development loop

This is the backbone workflow for any non-trivial task (a feature, a phase from `PRODUCT.md or PROJECT_CONTEXT.md` Section 15, a bug fix). Follow it in order; don't skip stages because the task "feels small" — `using-superpowers` exists specifically to stop that rationalization.

```
brainstorming  →  writing-plans (+ planning-with-files / planning-artifacts)
      →  using-git-worktrees (isolated branch)
      →  test-driven-development  →  subagent-driven-development
      →  requesting-code-review ⇄ receiving-code-review (+ review-steering)
      →  verification-before-completion
      →  finishing-a-development-branch / land-the-plane
```

- **`brainstorming`** — refuses to let you start coding until requirements are actually clear. Use it at the start of every phase in `PRODUCT.md or PROJECT_CONTEXT.md` Section 15, and any time the user's ask is a one-liner ("add the tax centre") that hides real design decisions (which reports, what date-range logic, PDF vs CSV first).
- **`writing-plans`** (with **`planning-with-files`** / **`planning-artifacts`** for anything spanning multiple sessions or files) — turns the brainstormed design into small, file-scoped tasks with tests named up front. For Cashaflux, a "plan" should already point at the right `shared/schema.ts` tables and `/api` routes from `PRODUCT.md or PROJECT_CONTEXT.md` Sections 10–11 — don't re-derive the schema, cite it.
- **`using-git-worktrees`** — start implementation work in an isolated worktree/branch, not on `main`. This matters more than usual here since there's no CI safety net catching a broken `main` before `railway up`.
- **`test-driven-development`** — red/green/refactor, enforced. Pair directly with `PRODUCT.md or PROJECT_CONTEXT.md` Section 20 (Vitest for unit + integration, Stripe CLI test events for the webhook, Playwright/Cypress for cross-browser). Write the failing test against the real schema and API shape before touching implementation.
- **`subagent-driven-development`** — once there's an approved plan and tests, dispatch the actual implementation to a fresh subagent scoped to just that plan + those tests, then have a second pass review it. Use **`dispatching-parallel-agents`** (and, for larger multi-track phases, **`swarm-plan` → `swarm-execute` → `swarm-review` / `swarm-research`**) when a phase has genuinely independent tracks — e.g. Phase 6 (Reports & Tax Centre) has ~10 report types that don't depend on each other and are a good fit for parallel dispatch; Phase 9 (Public Marketing Site) similarly has independent pages.
- **`requesting-code-review` / `receiving-code-review` / `review-steering`** — review happens between tasks, not just at the end. Critical issues block progress; use `review-steering` when a review surfaces disagreement about direction rather than a straightforward defect.
- **`verification-before-completion`** — before telling the user something is done, actually re-run it: `pnpm test`, `pnpm lint --fix`, `pnpm tsc --noEmit` (this is the same four-step gate `PRODUCT.md or PROJECT_CONTEXT.md` Section 3 already mandates — the skill enforces it rather than trusting memory of having done it).
- **`finishing-a-development-branch`** / **`land-the-plane`** — when a phase's tasks are done, verify tests pass, then present the merge/keep/discard options rather than silently assuming merge. Given there's no GitHub PR flow here, "merge" means merging the worktree branch locally before the next `railway up`.
- **`systematic-debugging`** (+ **`debugging-strategies`**) — for any bug report, root-cause first. Four-phase process, no fixing what you haven't understood. Trigger this instead of the main loop above when the task is "X is broken," not "build Y."
- **`postmortem`** — after a launch incident, a bad deploy, or a bug that took multiple attempts to fix, write one. Useful given Section 16's manual-deploy workflow has no rollback pipeline.
- **`writing-adrs`** — use for decisions that are expensive to reverse: the Stripe checkout-verification design in `PRODUCT.md or PROJECT_CONTEXT.md` Section 6, the `org_id` isolation model in Section 10, PDF generation approach (`@react-pdf/renderer` vs. server-side Puppeteer) in Section 9.3. Don't write an ADR for routine CRUD work.
- **`writing-skills`** — only if you find yourself repeating the same non-obvious project-specific procedure more than twice (e.g., "how we generate and verify the CSV bank-import column mapping"). Author it as a project-local skill rather than re-explaining it in every session.

---

## 2. Design & frontend

**Primary aesthetic skill: `design-taste-frontend`** (the "taste" skill). This is what stops the app from defaulting to generic AI-slop UI (Inter font, purple gradients, symmetric everything). For Cashaflux specifically:

- The brief is already opinionated (`PRODUCT.md or PROJECT_CONTEXT.md` Section 4 + Section 8): clean, minimal, professional-fintech — "Stripe meets Pilot.com" — navy `#1E3A5F` / blue `#2563EB`, Poppins, generous whitespace, one CTA per section. Feed that brief to `design-taste-frontend` directly rather than letting it pick a direction; this is an "audit-first, real design system" case, not a greenfield blank slate.
- Pair it with **`minimalist-ui`** as the layout/density direction — it matches the brief far better than `material-3` (Google's opinionated system, wrong feel for this brand) or `industrial-brutalist-ui` (wrong tone entirely for a trust-sensitive accounting product). Don't reach for either of those here.
- **`shadcn`** — the actual component library in the stack (`PRODUCT.md or PROJECT_CONTEXT.md` Section 1). Use it for implementation once `design-taste-frontend` has set direction; don't let the taste skill invent a component system that fights shadcn's primitives.
- **`dashboard-designer`** — purpose-built for exactly what `/dashboard` needs (Section 9.2: KPI cards, cash-flow chart, widgets). Use it specifically for the dashboard, reports (9.7), and tax centre (9.8) screens — the data-dense, chart-heavy surfaces — rather than the marketing site.
- **`ui-ux-designer`** — good for flow/IA decisions before visuals: the invoice editor (9.3), the CSV bank-import column-mapping UI (9.6), the 4-step onboarding wizard (Section 7). Use it to settle the interaction flow, then hand off to `design-taste-frontend` + `shadcn` for the actual UI.
- **`accessibility`** — non-negotiable per `PRODUCT.md or PROJECT_CONTEXT.md` Section 3 (WCAG 2.1 AA) and Section 4.4. Run it against every new screen, not just at the end.
- **`core-web-vitals`** / **`performance`** — pair with Section 19 (Lighthouse ≥ 90, code-splitting, WebP images). Apply mainly to the public marketing site, since that's what actually needs to load fast for cold, unauthenticated visitors.
- **`seo`** — Section 19.2 (meta tags, Open Graph, sitemap, JSON-LD). Public site only.
- **`gsap-core`** — optional, light-touch. Only reach for it if the marketing hero/testimonials need real motion beyond CSS transitions; `PRODUCT.md or PROJECT_CONTEXT.md` doesn't require animation, don't over-build it.
- Skip **`frontend-design`** (Anthropic's built-in skill) here — it does a similar job to `design-taste-frontend` and running both risks conflicting art direction. `design-taste-frontend` is the one you were explicitly asked to use; treat it as the source of truth for aesthetic decisions.

---

## 3. Testing & QA

- **`test-driven-development`** is the default for all new code (Section 1 above).
- **`testing`** — general-purpose testing discipline to lean on alongside TDD for things that aren't unit-test-shaped (data migrations, CSV import edge cases).
- **`webapp-testing`** — gives you a real browser to click through flows manually. Use it to sanity-check the invoice send flow, the Stripe checkout redirect, and the onboarding wizard end-to-end before writing automated coverage.
- **`playwright-test-generator`** + **`playwright-debugger`** + **`e2e-reviewer`** — this is the actual e2e stack for `PRODUCT.md or PROJECT_CONTEXT.md` Section 20's "critical paths" list (sign-up, login, create invoice, send invoice, mark paid, create expense) and the cross-browser smoke test. Use Playwright, not Cypress — the stack is Vite-based and Playwright is the better-integrated choice; don't run both.
- **`cypress-debugger`** — skip. Redundant with the Playwright trio above; the plan doesn't call for Cypress anywhere.
- **`qa-engineer`** — good as the owning persona for the whole Section 20 test plan and the Section 21 pre-launch checklist; use it to keep the various test skills coordinated rather than run ad hoc.

---

## 4. Security

- **`security-auditor`** — run this against `PRODUCT.md or PROJECT_CONTEXT.md` Section 18 point by point (bcrypt hashing, HTTP-only cookies, AES-256-GCM for EIN/SSN, org-scoped queries, pre-signed R2 URLs, webhook signature verification, rate limiting, CORS, Helmet, HTTPS) before every launch checkpoint, not just once at the end.
- **`threat-modeling`** — apply specifically to the Stripe webhook endpoint (unauthenticated by design, Section 6) and to the `org_id` isolation boundary (Section 10/18) — these are the two places a mistake is most damaging.
- **`auth-implementation-patterns`** — use during Phase 1 (Auth & Onboarding) while wiring up Better Auth; this is the phase most likely to have subtle session/cookie mistakes.
- **`snyk-fix`** + **`dependency-upgrade`** — ongoing maintenance, not phase-specific. Run periodically, especially before the pre-launch checklist.

---

## 5. Architecture & code quality

- **`architect`** / **`designing-systems`** — use during the brainstorming step for Phase 2 (Core Data Model) and Phase 8 (Billing) specifically — these are the two places where getting the shape wrong is expensive to unwind later.
- **`best-practices`** — general background discipline, applies throughout.
- **`code-check`** — treat as the mechanical enforcement of the per-phase quality gate already defined in `PRODUCT.md or PROJECT_CONTEXT.md` Section 3 (lint fix + typecheck).
- **`builder`** — use inside `subagent-driven-development` as the actual implementation step once a plan and tests exist; it's the "now write the code" skill, not a substitute for planning.
- **`git-workflow-and-versioning`** — commit hygiene and branch naming, even without a GitHub remote to push to.

---

## 6. Skills whose exact behavior I couldn't verify

Two names in your directory (`impeccable`, `tailor`) don't have enough public documentation for me to confidently say what they enforce — I don't want to guess and mis-describe them. Read their `SKILL.md` files directly before relying on them; if they turn out to be quality-bar / final-polish and project-customization skills respectively (my best guess from the names), they'd slot in near `verification-before-completion` and `using-superpowers` respectively. Update this section once you've confirmed.

---

## 7. Explicitly not used for this project (and why)

| Skill                                                      | Why it's skipped                                                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `expo-native-ui`, `swiftui-skills`, `mobile-app-ui-design` | v1 is a web app only (`PRODUCT.md or PROJECT_CONTEXT.md` Section 0). Native/mobile UI is Post-Launch Roadmap.   |
| `convex-performance-audit`                                 | Stack is Postgres + Drizzle, not Convex.                                                                        |
| `material-3`, `industrial-brutalist-ui`                    | Wrong aesthetic direction — the brief calls for clean fintech minimalism, not Material Design or brutalism.     |
| `cypress-debugger`                                         | Redundant with the Playwright trio in Section 3.                                                                |
| `github-pr-review`                                         | No GitHub repo in this workflow (`PRODUCT.md or PROJECT_CONTEXT.md` Section 16) — revisit only if that changes. |
| `frontend-design`                                          | Overlaps with `design-taste-frontend`; running both risks conflicting direction.                                |

---

End of Document
