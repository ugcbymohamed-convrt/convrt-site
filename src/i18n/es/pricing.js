/* SPANISH PRICING (EUR). The Spanish site shows euros (owner decision, Nov 2026, replacing the earlier "USD for Spain" decision). English stays in USD, untouched.

   EVERY AMOUNT BELOW IS `null` ON PURPOSE. These are commercial prices that only the owner can set: no live exchange rate, no conversion, no reuse of the USD number. The owner fills the
   approval table (docs/multilingual-spanish-eur-pricing.md, with the CSV beside it), then each amount is typed here as a plain number and `status` becomes 'approved'. Until then
   the Spanish pages show a visible placeholder, price Offers are left out of the JSON-LD and the pages that carry a price are launch-blocked (src/i18n/release.js).

   Nothing else changes: package deliverables, usage rights, commitments, VAT wording ("sin IVA") and every other commercial term are the English data, translated. */

import { formatMoneyEs } from './money.js'

export const ES_PRICING = {
  locale: 'es',
  currency: 'EUR',
  status: 'pending', // 'approved' only when every amount below is the owner's approved figure
  approvedBy: null, // e.g. 'Mohamed' (the owner who confirmed the table)
  approvedOn: null, // 'YYYY-MM-DD'
  placeholder: '[€ pendiente]',
  format: formatMoneyEs,
  amounts: {
    'sprint.monthly': null,
    'sprint.oneOff': null,
    'sprint.ext3': null,
    'sprint.ext6': null,
    'sprint.ext12': null,
    'sprintPlus.monthly': null,
    'sprintPlus.oneOff': null,
    'sprintPlus.ext3': null,
    'sprintPlus.ext6': null,
    'sprintPlus.ext12': null,
    rawFootage: null,
    'organicLight.monthly': null,
    'organicGrowth.monthly': null,
  },
}

/* The Spanish pages that show a price. While pricing is pending they are launch-blocked. (A test builds every Spanish page and fails if one outside this list renders the placeholder.) */
export const ES_PRICED_PAGES = ['/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production']
