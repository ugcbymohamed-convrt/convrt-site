# Spanish pricing in EUR: approval table and how it works

**Decision (owner, Nov 2026):** the Spanish site (`/es/`) shows prices in **euros**, replacing the earlier "USD for Spain" decision. The English site keeps USD, unchanged.
**Status: PENDING.** Every euro amount is blank, on purpose: no live exchange rate, no conversion, and the USD number is never reused. Until you approve the table below,
the Spanish pages show a visible placeholder (`[€ pendiente]`) instead of a price, the Spanish price Offers are left out of the JSON-LD, and the four Spanish pages that carry a price are
launch-blocked (`noindex`, no sitemap, no hreflang). The work stays on `multilingual-foundation-es`; nothing is merged or deployed.

## 1. Approval table (fill the right-hand column)
The CSV with the same rows and the "what it covers / where it appears" columns is `docs/multilingual-spanish-eur-pricing-approval.csv`; regenerate either with `node scripts/es-eur-approval-table.mjs [--write]`.
Package deliverables, usage rights, commitments, turnaround, creator limits and VAT wording are the English data translated and are **not** changed by this table.

| # | Item | Type | Current USD (English site) | Approved EUR (owner) |
|---|---|---|---|---|
| 1 | Creative Testing Sprint: monthly | Paid package | $3,000 |  |
| 2 | Creative Testing Sprint: one-off | Paid package | $3,500 |  |
| 3 | Creative Testing Sprint: usage-rights extension, 3 months (whole creative batch) | Usage-rights extension | $937.50 |  |
| 4 | Creative Testing Sprint: usage-rights extension, 6 months (whole creative batch) | Usage-rights extension | $1,500 |  |
| 5 | Creative Testing Sprint: usage-rights extension, 12 months (whole creative batch) | Usage-rights extension | $2,625 |  |
| 6 | Creative Testing Sprint Plus: monthly | Paid package | $5,000 |  |
| 7 | Creative Testing Sprint Plus: one-off | Paid package | $6,000 |  |
| 8 | Creative Testing Sprint Plus: usage-rights extension, 3 months (whole creative batch) | Usage-rights extension | $1,687.50 |  |
| 9 | Creative Testing Sprint Plus: usage-rights extension, 6 months (whole creative batch) | Usage-rights extension | $2,700 |  |
| 10 | Creative Testing Sprint Plus: usage-rights extension, 12 months (whole creative batch) | Usage-rights extension | $4,725 |  |
| 11 | Raw footage add-on: per creative concept | Add-on | $250 |  |
| 12 | Organic Light: monthly | Organic package | $1,500 |  |
| 13 | Organic Growth: monthly | Organic package | $2,500 |  |

Derived (computed from the approved EUR amount ÷ finished ad versions, rounded to whole euros; shown for confirmation, not separately priced):
- sprint.monthly: today $200 per variation in USD → EUR amount ÷ 15
- sprint.oneOff: today $233 per variation in USD → EUR amount ÷ 15
- sprintPlus.monthly: today $167 per variation in USD → EUR amount ÷ 30
- sprintPlus.oneOff: today $200 per variation in USD → EUR amount ÷ 30

Notes for the table:
- Extension prices cover the **entire** creative batch (as in English), and exclude VAT. Spanish keeps "sin IVA" / "no incluyen IVA".
- **Per-variation figures** are not separate prices: they are the approved EUR amount divided by the number of finished ad versions (15 or 30), rounded to whole euros, shown on the pricing cards and in two FAQs. Tell me if you would rather approve them explicitly.
- **Custom** packages have no price in any language ("Hablemos").
- Format shown: `3.000 €` (dot for thousands, comma for decimals, euro sign after the amount, with a non-breaking space), e.g. `937,50 €`.

## 2. Not converted, on purpose (please confirm)
| Item | Why it stays as it is |
|---|---|
| Roadmap ad-spend answers ("Menos de 5.000 USD", "Entre 5.000 y 20.000 USD", "Más de 20.000 USD") | They are the **visitor's** ad-spend brackets, tied to the qualification logic. Restating them in euros would change the thresholds. Say if you want them shown in EUR (it would be a qualification decision). |
| Elyon "3.421,25 USD" revenue on the UGC page | A client's real, reported result earned in dollars: converting it would falsify it. |
| Referral rewards ($150, 10% capped at $500) | The referral program is English-only and not linked from Spanish. |
| English Terms: "Prices shown on the website are in US dollars" | English legal text, untouched. A Spanish Terms of Service (still unpublished) must say that the Spanish site shows euros: for the lawyer. |

## 3. How it is built (and how another language adds its own)
- `src/i18n/pricing.js`: the list of every price (`PRICE_ITEMS`, taken from the business data), the per-language registry (`PRICING`), validation, the `{{price:key}}` / `{{perVariation:key}}` tokens used in dictionary sentences, and `money()` lookups. `priceOf()` **throws** for a USD price that has no key, so a new price added to the business data can never appear in dollars on a Spanish page (a test enforces that every business-data price has a key).
- `src/i18n/es/pricing.js`: the Spanish configuration: currency, `status`, `approvedBy`/`approvedOn`, placeholder text and one `amounts` line per price (all `null` today). `ES_PRICED_PAGES` lists the pages that carry a price.
- Spanish sentences hold tokens, never numbers (cards, extensions table, 12 FAQ answers, metadata, JSON-LD descriptions and Offers all read the same configuration).
- `src/i18n/release.js`: while pricing is not approved the priced pages are blocked; the gate lifts by itself.
- Tests: `tests/spanish-eur-pricing.test.mjs` proves the mechanism and builds a throw-away copy of the site with a **fake** approved configuration to show that, once approved, every Spanish price, Offer and description switches to EUR, no placeholder or USD price remains and the gates lift. The fake amounts exist only in that test.
- **A new language:** copy `src/i18n/es/pricing.js` (its own currency, notation function and amounts), register it in `PRICING`, add its priced pages to a list and its gate in `release.js`. No page component changes.

## 4. After you approve
Send the 13 amounts. I type them into `src/i18n/es/pricing.js`, set `status: 'approved'`, `approvedBy` and `approvedOn`, rebuild, re-run the tests and the checks (every Spanish page: no placeholder, no USD price, EUR Offers, UGC description "desde X €/mes", priced pages indexable with hreflang). The config validator refuses an "approved" status with a missing amount.
