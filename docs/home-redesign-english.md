# English website premium design review #1 (Nov 2026)

Branch `english-design-review-1`, cut from Production `main` (afc0da4). One pass, one Preview. English pages only: the Spanish homepage HTML is byte-identical to Production (modulo hashed asset names), and the unmerged Spanish review branch is not included.

## What changed (English only)

| Area | Where | Notes |
|---|---|---|
| Founder statement | `src/components/Credibility.jsx`, `FOUNDER_EXPERIENCE.captionShort` in `src/lib/siteStats.js` | Two-line headline ("…across ecommerce, SaaS, apps and consumer markets."), one-line disclosure ("Founder experience across CONVRT Studio and other creative production work."), CTAs removed, no bottom rule. The long caption stays for Spanish and the claims register. |
| Industry showcase | `src/components/home/IndustryShowcase.jsx`, `src/content/homeShowcase.js` | Replaces the old "Case Studies / Work that speaks" intro and tabs on the English homepage. The old `CaseStudies.jsx` is still used by the Spanish homepage. |
| Closing CTAs | `ShowcaseCtas` in `IndustryShowcase.jsx` | Same destinations as before (`primaryAction('en')` → Roadmap, creator Google Form), larger. |
| Creator carousel | `src/components/home/HomeCreators.jsx` (lazy), reuses `components/ugc/UgcGallery.jsx` | Eight videos tagged `homeCreator` in `src/content/portfolio.js` (`selectHomeCreators()`). |
| Reviews | `src/components/home/ClientReviews.jsx`, `src/content/reviews.js` | Verbatim excerpts + the full originals behind "Read full review". `Testimonials.jsx` (Spanish) reads the same source. |
| SaaS hero | `src/content/saasPage.js` (`SAAS_VIDEO_ORDER`), `portfolio.js` (`spokesperson-gal-1` → `alsoOn.saas: 'hero'`, `saas-creator-1` → `placement: 'gallery'`) | |
| Spokesperson hero | `src/content/spokespersonPage.js` (`SPOKESPERSON_VIDEO_ORDER`) | |

## Homepage order (English)
Hero → founder statement + logo marquee → industry showcase + CTAs → Services → How It Works → creator carousel → client reviews → final CTA → FAQ.

## Industry showcase: how it works and what is verified
- Fixed order SaaS · E-commerce · Printing; a vertical tab list from `lg` (active industry large with a lime bar), three equal tabs on mobile. Arrow keys / Home / End move between tabs.
- **SaaS = Adscale** (verified: the previous homepage SaaS tab, the `portfolio.js` note and Adscale's own review all file it under SaaS). No Adscale case study or measured result exists, so the entry has none and links to `/saas-video-production`. **E-commerce = Elyon Dubai** (`/case-studies/elyon`), **Printing = Graspo** (`/case-studies/graspo`). All wording already existed on the live site.
- Videos are the `showcase: 'adscale' | 'elyon' | 'graspo'` portfolio entries (first three). Nothing plays until a tap, one video at a time (shared `Player`).
- Crawlable: all three clients' text and links are in the prerendered HTML (inactive panels are `hidden`), and both case-study links are always visible under the navigation.

## Creator carousel
Rule: approved with full consent (`portfolioUse` and `creatorConsent` true), spoken language **confirmed** English, tagged `homeCreator: 1..8`. Order: spokesperson-hero-2, ugc-gal-1, ugc-gal-7, spokesperson-hero-1, ugc-gal-3, ugc-gal-2, ugc-hero-3, spokesperson-gal-2. Left out on purpose: `creator-05` (on hold), `ugc-gal-5` (language to verify), `ugc-hero-1` (same footage as `saas-creator-2`), and every video with no recorded language (the `creator-xx` set: confirm the language in `portfolio.js` to make them eligible). The standing "independent creators, not CONVRT productions" note stays under the heading.

## Reviews
No star graphics (no rating source is on record; CLAUDE.md forbids invented ratings), no counts, platforms, links or badges. "Repeat Client" is kept because each review documents a repeat order ("ordered again", "second order", "third order").

## Video order
SaaS hero (front-centre first): spokesperson-gal-1 (founder presenter, Lusion screen) · saas-creator-2 · creator-04. SaaS gallery: spokesperson-gal-3 · spokesperson-hero-1 · **saas-creator-1 (third)** · creator-15 · creator-10. Spokesperson hero: spokesperson-hero-2 (front) · spokesperson-hero-1 · spokesperson-hero-3; gallery unchanged. Orders are page-level (`orderedBy` in `portfolio.js`), so `/creator-showcase` and the UGC page keep the shared file order. No Cloudflare asset was uploaded or duplicated.

## Tests
`tests/home-redesign.test.mjs` (14 tests) plus updated assertions in `founder-experience`, `creator-showcase` and `ugc-page` tests.
