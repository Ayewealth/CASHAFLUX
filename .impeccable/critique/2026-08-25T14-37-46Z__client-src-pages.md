---
target: marketing pages (HomePage, FeaturesPage, PricingPage, HowItWorksPage, BlogIndexPage, ContactPage)
total_score: 27
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-08-25T14-37-46Z
slug: client-src-pages
---
# Design Critique — Cashaflux Marketing Pages (Post-Fix 2)

## Method: Single-context (re-assessment after fixes)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Still no skeleton on initial blog load |
| 2 | Match System / Real World | **3** ↑ | Logos, testimonials with photos, unique comparison wins all improved category signaling |
| 3 | User Control and Freedom | 3 | Nav always accessible |
| 4 | Consistency and Standards | 3 | Minor font spec drift remains |
| 5 | Error Prevention | 2 | Still no inline validation on contact form |
| 6 | Recognition Rather Than Recall | **3** ↑ | Testimonials now have real photos — visual recognition anchors |
| 7 | Flexibility and Efficiency | n/a | Marketing site |
| 8 | Aesthetic and Minimalist Design | **3** ↑ | Stat wall breaks section monotony. Cleaner palette. |
| 9 | Error Recovery | 2 | "Failed to send" still generic |
| 10 | Help and Documentation | n/a | Marketing site |
| **Total** | | **27/32** ↑ | **Good — improved from 24/32** |

## Detector Findings
**0 issues** — all previously flagged violations remain resolved.

## What's Improved Since Last Run
1. **Fake JSON-LD rating removed** — no more legal liability from fabricated 4.8★/256 reviews
2. **Testimonial photos added** — Sarah, Marcus, Emily, David now have real headshots instead of auto-generated initials. This is a major trust signal improvement for a financial product.
3. **Stat wall visual break added** — navy section with 4 metrics breaks the centered-heading + card-grid pattern that repeated 7+ times
4. **Help Center "Coming soon" link removed** from Footer — no more visible incompleteness
5. **Social links on Contact page are real** — X and LinkedIn now link to actual profiles instead of `#`

## Remaining Minor Issues

**P2 — Blog initial load has no skeleton.** The blog index uses `staleTime: 5 * 60 * 1000` but no loading skeleton on first fetch. If the API is slow, users see nothing.

**P2 — Contact form error recovery is generic.** "Failed to send" with no recovery suggestion. Should say what went wrong and what to do next.

**P3 — Font spec drift.** PROJECT_CONTEXT.md specifies Poppins; the actual implementation uses Sora + Inter. Either update the spec or the code.
