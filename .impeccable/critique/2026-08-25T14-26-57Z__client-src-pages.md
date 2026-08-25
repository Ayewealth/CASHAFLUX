---
target: marketing pages (HomePage, FeaturesPage, PricingPage, HowItWorksPage, BlogIndexPage, ContactPage)
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-25T14-26-57Z
slug: client-src-pages
---
# Design Critique — Cashaflux Marketing Pages (Post-Fix)

## Method: Single-context (re-assessment after fixes)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Still no skeleton on initial blog load |
| 2 | Match System / Real World | **3** ↑ | Logos now signal accounting-adjacent brands. Comparison table shows unique wins. |
| 3 | User Control and Freedom | 3 | Nav always accessible. |
| 4 | Consistency and Standards | 3 | Font spec drift remains; HowItWorks step 2 still breaks pattern. |
| 5 | Error Prevention | 2 | Still no inline validation on contact form. |
| 6 | Recognition Rather Than Recall | 2 | Pricing comparison still dense; testimonials still faceless. |
| 7 | Flexibility and Efficiency | n/a | Marketing site. |
| 8 | Aesthetic and Minimalist Design | 3 | Cleaner palette now. Section fatigue still present. |
| 9 | Error Recovery | 2 | "Failed to send" still generic. |
| 10 | Help and Documentation | n/a | Marketing site. |
| **Total** | | **24/32** ↑ | **Acceptable — improved from 23/32** |

## Detector Findings
**0 issues** — all 5 previously flagged violations resolved.

## What's Improved
1. **Logo marquee** now shows accounting-adjacent brands (Gusto, DocuSign, Shopify, Mailchimp, Square) instead of developer tools — better category signaling.
2. **Comparison table** now has two rows where Cashaflux uniquely wins (IRS Schedule C categories, Mileage with IRS rate) and accurately marks QuickBooks tax export as "Add-on."
3. **All violet/indigo/cyan gradients** replaced with brand-navy and brand-blue — no more AI-tell color palette.
4. **Side-tab accent border** removed from blog featured card.

## Remaining Priority Issues

**P1 — Section fatigue from uniform structure.** 7 of 10 sections still use the identical centered-heading + card-grid pattern. Injecting a full-bleed image, customer story, or stat wall would break the rhythm.

**P1 — Testimonials are faceless.** All still use auto-generated initials — no photos. For a financial product, testimonial credibility is paramount.

**P2 — JSON-LD aggregateRating (4.8★, 256 reviews) is fabricated.** Must be removed before launch — this is deceptive and a legal liability.

**P2 — Help Center = "Coming soon" on Contact/Footer.** Signals incompleteness to every visitor.

**P3 — Contact page social links are `#` placeholders.** Shipping these live makes the site feel incomplete.
