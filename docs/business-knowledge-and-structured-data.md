# Business knowledge, pricing copy and structured data

**One source of truth:** `src/seo/businessKnowledge.js` holds CONVRT's brand facts, package prices, commitment terms,
usage-rights and extension prices, raw-footage price, production process, formats and organic scope. Money is stored
as `{ amount, currency }` and shown in exactly that currency (nothing is converted).

To change a price or policy, edit that file only. These all read from it:

| Consumer | File |
| --- | --- |
| Package cards, commercial terms, usage rights, production terms | `src/components/CreativeTestingOffer.jsx`, `src/components/pricing/*` |
| Pricing FAQ (visible accordion **and** FAQPage JSON-LD) | `src/seo/pricingFaq.js` |
| JSON-LD (Organization, WebSite, Service + Offer, BreadcrumbList, FAQPage) | `src/seo/structuredData.js` |
| Page title/description/canonical/robots + JSON-LD per route | `src/seo/siteSeo.js` (`pageHead(path)`) |

Rules
- JSON-LD is generated from the same data as the visible page and is written into the static HTML at build time. The client
  hook replaces (never duplicates) it. Do not hand-write JSON-LD inside components.
- No invented facts: no ratings, reviews, addresses, awards, creator counts or results. Do not add a Sprint Plus concept
  count until the owner confirms it (`SPRINT_PLUS.concepts.status`).
- Services use `Service` + `Offer`, never `Product`. A monthly fee is a per-month `UnitPriceSpecification`; one-off
  prices are separate Offers in their own currency.
- Blog articles keep `src/lib/blog/seo.js`; it points `publisher` at the Organization `@id` defined here.
- `OWNER_REVIEW_FLAGS` lists the open business questions. Resolve them with the owner, then update the data and tests.
