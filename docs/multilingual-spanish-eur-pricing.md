# Spanish pricing in EUR: approved table and how it works

**Decision (owner, Nov 2026, final):** the Spanish site (`/es/`) shows prices in **euros**, replacing the earlier "USD for Spain" decision. The English site keeps USD, unchanged.
**Status: APPROVED (2026-11-21).** The 13 amounts below are the owner's fixed Spanish-market prices: no exchange rate, no conversion, no USD number reused. They live in `src/i18n/es/pricing.js`.
The pricing gates are lifted (the four priced pages are indexable with hreflang and sitemap entries); the other Spanish launch gates (Showcase videos, legal pages, OG image) are untouched.

## 1. Approved table
The CSV with the same rows and the "what it covers / where it appears" columns is `docs/multilingual-spanish-eur-pricing-approval.csv`; regenerate either with `node scripts/es-eur-approval-table.mjs [--write]`.
Package deliverables, usage rights, commitments, turnaround, creator limits and VAT wording are the English data translated and are not changed by this table.

| # | Item | Type | Current USD (English site) | Approved EUR (Spanish site) |
|---|---|---|---|---|
| 1 | Creative Testing Sprint: monthly | Paid package | $3,000 | 2.750 € |
| 2 | Creative Testing Sprint: one-off | Paid package | $3,500 | 3.250 € |
| 3 | Creative Testing Sprint: usage-rights extension, 3 months (whole creative batch) | Usage-rights extension | $937.50 | 850 € |
| 4 | Creative Testing Sprint: usage-rights extension, 6 months (whole creative batch) | Usage-rights extension | $1,500 | 1.375 € |
| 5 | Creative Testing Sprint: usage-rights extension, 12 months (whole creative batch) | Usage-rights extension | $2,625 | 2.400 € |
| 6 | Creative Testing Sprint Plus: monthly | Paid package | $5,000 | 4.600 € |
| 7 | Creative Testing Sprint Plus: one-off | Paid package | $6,000 | 5.500 € |
| 8 | Creative Testing Sprint Plus: usage-rights extension, 3 months (whole creative batch) | Usage-rights extension | $1,687.50 | 1.550 € |
| 9 | Creative Testing Sprint Plus: usage-rights extension, 6 months (whole creative batch) | Usage-rights extension | $2,700 | 2.500 € |
| 10 | Creative Testing Sprint Plus: usage-rights extension, 12 months (whole creative batch) | Usage-rights extension | $4,725 | 4.350 € |
| 11 | Raw footage add-on: per creative concept | Add-on | $250 | 225 € |
| 12 | Organic Light: monthly | Organic package | $1,500 | 1.400 € |
| 13 | Organic Growth: monthly | Organic package | $2,500 | 2.300 € |

Derived per-variation figures (approved EUR total ÷ finished ad versions, rounded to whole euros; informational only, never a purchasable product):
- sprint.monthly: $200 per variation in USD today → 183 € (EUR total ÷ 15, rounded)
- sprint.oneOff: $233 per variation in USD today → 217 € (EUR total ÷ 15, rounded)
- sprintPlus.monthly: $167 per variation in USD today → 153 € (EUR total ÷ 30, rounded)
- sprintPlus.oneOff: $200 per variation in USD today → 183 € (EUR total ÷ 30, rounded)

Notes:
- Extension prices cover the **entire** creative batch (as in English) and exclude VAT. Spanish keeps "sin IVA" / "no incluyen IVA".
- **Per-variation figures** are not products: they are the approved EUR total divided by the finished ad versions (15 or 30), rounded to whole euros, shown on the pricing cards and in two FAQs.
- **Custom** packages have no price in any language ("Hablemos").
- Format: `2.750 €` and `937,50 €` (dot for thousands, comma for decimals, euro sign after the amount, joined by a non-breaking space).

## 2. Not converted, on purpose
| Item | Why it stays as it is |
|---|---|
| Roadmap ad-spend answers ("Menos de 5.000 USD", "Entre 5.000 y 20.000 USD", "Más de 20.000 USD") | The visitor's ad-spend brackets, tied to the qualification logic and the backend values (owner decision: unchanged for now). |
| Elyon "3.421,25 USD" revenue on the UGC page | A client's real, reported result earned in dollars: never converted or rewritten. |
| Referral rewards ($150, 10% capped at $500) | The referral program is English-only and not linked from Spanish. |
| English Terms: "Prices shown on the website are in US dollars" | English legal text, untouched. A Spanish Terms of Service (still unpublished) must say that the Spanish site shows euros: for the lawyer. |

## 3. How it is built (and how another language adds its own)
- `src/i18n/pricing.js`: the list of every price (`PRICE_ITEMS`, taken from the business data), the per-language registry (`PRICING`), validation, the `{{price:key}}` / `{{perVariation:key}}` tokens used in dictionary sentences, and `money()` lookups. `priceOf()` **throws** for a USD price that has no key, so a new price added to the business data can never appear in dollars on a Spanish page (a test enforces that every business-data price has a key).
- `src/i18n/es/pricing.js`: the Spanish configuration: currency, `status`, `approvedBy`/`approvedOn`, placeholder text and one `amounts` line per price. `ES_PRICED_PAGES` lists the pages that carry a price.
- Spanish sentences hold tokens, never numbers (cards, extensions table, FAQ answers, metadata, JSON-LD descriptions and Offers all read the same configuration).
- Safety net: if the config were set back to `pending` (or an amount removed), the priced pages show a placeholder, price Offers disappear and the pages are launch-blocked again (`src/i18n/release.js`); the validator refuses an "approved" status with a missing amount.
- Tests: `tests/i18n.test.mjs` pins the 13 approved amounts and checks every Spanish page, Offer and description in the real build; `tests/spanish-eur-pricing.test.mjs` proves the mechanism and builds a throw-away copy with a pending configuration to prove the safety net.
- **A new language:** copy `src/i18n/es/pricing.js` (its own currency, notation function and amounts, each explicitly approved), register it in `PRICING`, list its priced pages and gate them in `release.js`. No page component changes.
