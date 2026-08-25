---
target: marketing pages (HomePage, FeaturesPage, PricingPage, HowItWorksPage, BlogIndexPage, ContactPage)
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 3
timestamp: 2026-08-25T14-11-08Z
slug: client-src-pages
---
# Design Critique — Cashaflux Marketing Pages

## Method: Dual-agent (A: design-review sub-agent · B: detector)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Scroll progress bar, form states present. No skeleton on initial blog load. |
| 2 | Match System / Real World | 2 | Accounting terms used correctly. But visual language says "startup" not "financial trust." |
| 3 | User Control and Freedom | 3 | Nav always accessible. No "skip to content" link. |
| 4 | Consistency and Standards | 3 | Uniform section rhythm. Font conflicts with spec; HowItWorks step 2 breaks own pattern. |
| 5 | Error Prevention | 2 | HTML5 validation only. No inline validation on contact form. |
| 6 | Recognition Rather Than Recall | 2 | FAQ helps. Pricing comparison too dense; testimonials are faceless initials. |
| 7 | Flexibility and Efficiency | n/a | Marketing site, not a tool. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean whitespace, good type. But section fatigue from 7+ uniform card grids. |
| 9 | Error Recovery | 2 | Contact form shows "Failed to send" with no recovery. Blog "Not found" has no alternatives. |
| 10 | Help and Documentation | n/a | Marketing site, not a tool. |
| **Total** | | **23/32** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**Not specific enough.** The visual language — navy palette, bar-chart logo, dev-tool logo marquee, Inter/Sora typography — is indistinguishable from a project management tool or analytics platform. Nothing communicates "accounting," "tax," or "trust with financial data." The copy says "Built for America" but the visuals say "startup."

## Detector Findings

5 issues found:
- 1x side-tab accent border (BlogIndexPage.tsx:82 — `border-l-2`)
- 4x AI color palette (FeaturesPage.tsx:12,41,59 — `from-violet-500`/`from-indigo-500`; HowItWorksPage.tsx:47 — `from-violet-500`)

The detector caught the violet/indigo gradients as AI-tell color choices. This confirms the design review's finding that the palette lacks category specificity.

## What's Working

1. **Typography system** — Sora (headings) + Inter (body) + Geist Mono (accents) is a sophisticated tri-type system.
2. **Motion fluency** — SmoothScrollReveal, marquee, blog progress bar, backdrop-blur transitions show real craft.
3. **Structural consistency** — Every page: hero → content → FAQ → CTA → footer. Predictable, learnable.

## Priority Issues

**P0 — Logo marquee signals wrong category.** HomePage shows Stripe, Linear, Vercel, Notion, Loom, Raycast — developer tools, not accounting. A sole trader wants to see QuickBooks, Xero, FreshBooks, Wave. This signals "startup" not "trustworthy financial platform."

**P0 — Comparison table is self-defeating.** Cashaflux never uniquely wins. No row communicates the core differentiator (IRS Schedule C, US tax specificity). Fix: add a row where Cashaflux uniquely wins, or remove the table.

**P1 — Section fatigue from uniform structure.** 7 of 10 sections use the identical pattern (centered heading + subtext + card grid). Only the CTA sections (all with the same dotted overlay) break the pattern. Inject variety: full-bleed image, customer story, stat wall, visual testimonial with photo.

**P1 — Testimonials are faceless.** Every testimonial uses auto-generated initials in colored circles. No photos. For a product handling finances, testimonial credibility is paramount. Use consistent headshots or real photos.

**P1 — Violet/indigo gradients flagged as AI palette.** 4 instances across FeaturesPage and HowItWorksPage. These are the most recognizable AI-tell colors. Replace with brand-navy, brand-blue, or brand-appropriate accent colors.

**P2 — Brand icon is a generic bar chart.** Three vertical bars with a dot — could represent sales, traffic, or gym progress. Consider a "C" monogram with a financial motif to signal the category.

**P2 — Help Center = "Coming soon" on Contact/Footer.** Visible to every visitor. Signals incompleteness. Either hide the link or build the content.

## Persona Red Flags

**Jordan (Freelancer):** Logo marquee means nothing. Free plan's 5-client cap creates a ceiling without a clear path. No testimonial photo to identify with.

**Riley (Small business owner):** Team collaboration is the 6th feature card — must scroll past 5 others. No onboarding walkthrough for team setup. Comparison table doesn't show why Cashaflux beats QuickBooks for a 5-person company.

**Casey (CPA):** Accountant role is in feature position 8 and one FAQ. No dedicated "For Accountants" section. Needs to know: "How do I manage 10 clients?" — no answer on the site.

## Minor Observations

- JSON-LD aggregateRating (4.8★, 256 reviews) is fabricated — remove before launch
- Blog alt text is generic, not descriptive
- Contact page social links are `#` placeholders
- Pricing toggle uses different patterns on HomePage vs PricingPage
- Plus Jakarta Sans is imported but unused (~200KB+ in bundle)
- BlogPostPage markdown parser is hand-written, no bold/italic/link support

## Questions to Consider

1. What is the one thing Cashaflux does that QuickBooks, Xero, and FreshBooks don't? (IRS Schedule C integration) — should be hero headline, not feature card #2.
2. Would conversion rate change if the Comparison Table and Integrations sections were removed? If not, they're decorative content adding scroll distance.
3. How does this visual language communicate "trustworthy with my financial data" when the brand icon is a generic bar chart and the logo wall is developer tools?
