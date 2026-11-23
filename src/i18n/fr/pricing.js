/* FRENCH PRICING (EUR). The French site shows euros (owner decision, Nov 2026) and REUSES the amounts the owner approved for the Spanish site on 2026-11-21
   (src/i18n/es/pricing.js; table in docs/multilingual-spanish-eur-pricing.md): "Pricing amounts: reuse approved Spanish EUR prices". They are fixed prices, not conversions: no exchange
   rate, no formula and no USD number is involved. To keep the two sites from drifting, the amounts are IMPORTED from the Spanish configuration, never retyped: a test pins that
   every French amount equals its Spanish counterpart. If the owner ever wants different French prices, replace the import with plain numbers and set a new approvedOn.

   Nothing else changes: package deliverables, usage rights, commitments and every other commercial term are the English data, translated. Tax wording: the amounts are shown
   "hors taxes" (excluding VAT), the same treatment as the Spanish "sin IVA"; no French VAT treatment, number or registration status is stated anywhere. */

import { formatMoneyFr } from './money.js'
import { ES_PRICING } from '../es/pricing.js'

export const FR_PRICING = {
  locale: 'fr',
  currency: 'EUR',
  status: 'approved', // the EUR amounts are the owner-approved Spanish-market table (2026-11-21), reused for France by the owner's decision (Nov 2026)
  approvedBy: 'CONVRT owner', // approved the EUR table on 2026-11-21 and confirmed in the French brief (2026-11-23) that France reuses it
  approvedOn: '2026-11-23',
  placeholder: '[€ à confirmer]',
  format: formatMoneyFr,
  amounts: { ...ES_PRICING.amounts },
}

/* The French pages that show a price. If the config were ever set back to 'pending' these pages would be launch-blocked. */
export const FR_PRICED_PAGES = ['/pricing', '/ugc-video-agency']
