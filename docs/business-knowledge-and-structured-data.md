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

## Package prices, per-variation prices and the audit (Nov 2026)

- Creative Testing Sprint: $3,000/month ($3,500 one-off), 5 concepts × 3 versions = 15 finished ad versions. Sprint Plus: $5,000/month ($6,000 one-off), 10 × 3 = 30. Usage extensions are re-based to the 15- and 30-version batches (1.5× the earlier figures; $937.50 and $1,687.50 are exact).
- `pricePerVariation(pkg, billing)` derives the "Just $X per variation" figure (rounded to whole dollars for marketing: $200 for the Sprint, $167 for Sprint Plus) from the same constants; never type it in a component. `formatMoney` shows cents only for non-integer amounts.
- Everything that shows or encodes a price reads these constants: cards, details tables, FAQ answers, meta descriptions and JSON-LD. `tests/prerender.test.mjs` and `tests/pricing.test.mjs` fail if a retired price reappears, if a diagram contradicts the version count, or if the built JSON-LD stops matching the constants.

## Creator limits (Nov 2026)

- Sprint includes up to 3 creators or spokespeople, Sprint Plus up to 5 (`SPRINT.maxCreators`, `SPRINT_PLUS.maxCreators`). They are maximums, not a guaranteed allocation, and never change the agreed concepts or finished ad versions; requests beyond the limit need a custom quote.
- `CREATOR_ALLOCATION` in `businessKnowledge.js` is the single source for the pricing FAQ "How are creators selected and allocated?" (visible accordion and FAQPage JSON-LD), the "Creators" row in the Production & extras panel, the sentence in the UGC FAQ, and (via `maxCreators`) the card lines and the package Service descriptions in JSON-LD.
