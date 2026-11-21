# SEO/GEO Batch 2 (2026-11-21): what changed and the rules it follows

Branch `seo-geo-batch-2`. Not merged, not in Production. Tests: `tests/seo-batch-2.test.mjs` (new) plus the existing suite.

## What changed
| Area | Change | Where |
|---|---|---|
| UGC page | Two FAQs: "Should I use a UGC agency or hire creators directly?" and "How should I evaluate a UGC agency?". Contextual links to Spokesperson, SaaS, the Elyon case study and Pricing. | `src/seo/ugcFaq.js` |
| Organic page | One strategy-call route for every organic CTA (hero, proof, final CTA, FAQ, Pricing promo). Scope note (no paid-media buying, no customer support). Short-form wording in the hero and meta description. | `ORGANIC_CTA` in `src/seo/businessKnowledge.js`, `src/content/organicSocialPage.js` |
| Service label | "Organic Social Video" on the homepage card and in the footer (`SERVICE_LABELS`). The title, H1 and schema keep the longer name. | `src/components/Services.jsx`, `Footer.jsx` |
| Case studies | One H1, a breadcrumb, shorter titles/descriptions, WebPage + BreadcrumbList + Service JSON-LD, a related-service line. | `src/CaseStudiesPage.jsx`, `src/components/caseStudies/RelatedService.jsx`, `src/caseStudies/registry.js`, `caseStudyGraph` in `src/seo/structuredData.js` |
| Creator Showcase | "What you'll find" guide below the library, with links to the four services and the two case studies. Gallery unchanged. | `src/components/ourwork/ShowcaseFormats.jsx` |
| Structured data | One stable `@id` per core service (the service page's `#service`), used by the homepage, `/pricing`, the service pages and the case studies. SaaS is a core service. Package Offers stay on `/pricing#service-<slug>` nodes. | `CORE_SERVICES`, `serviceId`, `coreServiceNode` |
| Claims | `PUBLIC_CLAIMS` register; the Arabic-dialect clause and the `50%+` figure now live in one place. No wording changed. | `src/seo/businessKnowledge.js`, `src/lib/siteStats.js` |

## Rules for later edits
- A core service's name, type and description are defined once in `CORE_SERVICES`. Do not retype them in a page graph.
- Case-study schema never gets `Article`, `Review`, ratings, dates or authors until real ones exist.
- The Creator Showcase guide only lists a format or industry while an approved video of that type exists. It never names a client or calls a creator video a CONVRT production.
- Faceless / hands-only UGC is **not** published anywhere: there is no source evidence that CONVRT offers it. The drafted answer waits for the owner.
- Anything marked `needs-confirmation` in `PUBLIC_CLAIMS` needs the owner before new copy builds on it.
