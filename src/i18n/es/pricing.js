/* SPANISH PRICING (EUR). The Spanish site shows euros (owner decision, Nov 2026, replacing the earlier "USD for Spain" decision). English stays in USD, untouched.

   The 13 amounts below are the owner's FINAL approved Spanish-market prices (approved 2026-11-21, table in docs/multilingual-spanish-eur-pricing.md). They are fixed prices, not conversions:
   no exchange rate, no formula, no USD number reused. To change one, the owner approves the new figure and it is typed here as a plain number (the validator in src/i18n/pricing.js
   refuses an 'approved' config with a missing amount). Per-variation figures are derived from these totals (rounded to whole euros) and are informational only.

   Nothing else changes: package deliverables, usage rights, commitments, VAT wording ("sin IVA") and every other commercial term are the English data, translated. */

import { formatMoneyEs } from './money.js'

export const ES_PRICING = {
  locale: 'es',
  currency: 'EUR',
  status: 'approved', // owner-approved EUR table (final commercial approval, 2026-11-21)
  approvedBy: 'CONVRT owner', // confirmed in chat on the owner's final EUR pricing approval
  approvedOn: '2026-11-21',
  placeholder: '[€ pendiente]',
  format: formatMoneyEs,
  amounts: {
    'sprint.monthly': 2750,
    'sprint.oneOff': 3250,
    'sprint.ext3': 850,
    'sprint.ext6': 1375,
    'sprint.ext12': 2400,
    'sprintPlus.monthly': 4600,
    'sprintPlus.oneOff': 5500,
    'sprintPlus.ext3': 1550,
    'sprintPlus.ext6': 2500,
    'sprintPlus.ext12': 4350,
    rawFootage: 225,
    'organicLight.monthly': 1400,
    'organicGrowth.monthly': 2300,
  },
}

/* The Spanish pages that show a price. If the config were ever set back to 'pending' these pages would be launch-blocked again. (A test builds every Spanish page and fails if one outside this list renders the placeholder.) */
export const ES_PRICED_PAGES = ['/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production']
