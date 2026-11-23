/* ARABIC PRICING (USD). The Arabic site (UAE + Saudi Arabia, one shared website at /ar/) shows exactly the approved English USD prices: owner decision, Nov 2026.

   Unlike Spanish (its own EUR table), the amounts here are NOT typed a second time: they are read from the business data (src/seo/businessKnowledge.js) through the shared list of
   prices (PRICE_ITEMS in src/i18n/pricing.js), so the Arabic page can never disagree with the English one. No AED, no SAR, no exchange rate, no IP-based currency.

   Everything else (deliverables, usage rights, commitments, VAT wording) is the English commercial data, translated through the dictionary. */

import { formatMoneyAr } from './money.js'

export function buildArPricing(priceItems) {
  return {
    locale: 'ar',
    currency: 'USD',
    status: 'approved', // the same figures the owner approved for the English site
    approvedBy: 'CONVRT owner (Arabic site brief, 2026-11-23: existing approved English USD pricing)',
    approvedOn: '2026-11-23',
    placeholder: '[USD]',
    format: formatMoneyAr,
    amounts: Object.fromEntries(priceItems.map((i) => [i.key, i.usd.amount])),
  }
}

/* The Arabic pages that show a price. If the config were ever invalid these pages would be launch-blocked (noindex, no sitemap, no hreflang). The homepage shows no price. */
export const AR_PRICED_PAGES = ['/pricing', '/ugc-video-agency']
