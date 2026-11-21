/* RELEASE GATES: a translated page can be BUILT (reachable by URL, for review) yet not RELEASED. A blocked page is noindex, out of the sitemap, out of hreflang (the English page then
   carries no hreflang to it) and the language selector falls back to the language home. A gate lifts by itself when its condition is met; nothing else needs to change.

   /es/creator-showcase: the Spanish Showcase has its OWN creators and videos (owner decision, Nov 2026), never the English library. Until at least one approved video with a confirmed
   Spanish spoken language exists in src/content/portfolio.js, the page is launch-blocked and shows a plain "new examples are on the way" state instead of an irrelevant gallery. */

import { hasTranslation } from './registry.js'
import { displayableFor } from '../content/portfolio.js'
import { isPricingApproved } from './pricing.js'
import { ES_PRICED_PAGES } from './es/pricing.js'

/* Spanish pages that carry a price are blocked until the owner has approved every EUR amount (src/i18n/es/pricing.js); a gate lifts by itself when its condition is met. */
const BLOCKS = {
  es: {
    '/creator-showcase': () => displayableFor('es').length === 0,
    ...Object.fromEntries(ES_PRICED_PAGES.map((p) => [p, () => !isPricingApproved('es')])),
  },
}
const REASONS = { '/creator-showcase': 'no approved Spanish-language videos yet' }
const PRICING_REASON = 'Spanish EUR prices not approved yet'

export const releaseBlocker = (locale, basePath) => (BLOCKS[locale]?.[basePath]?.() ? { path: basePath, reason: REASONS[basePath] ?? PRICING_REASON } : null)
export const isReleased = (locale, basePath) => hasTranslation(locale, basePath) && !releaseBlocker(locale, basePath)
export const blockedPages = (locale) => Object.keys(BLOCKS[locale] ?? {}).map((p) => releaseBlocker(locale, p)).filter(Boolean)
