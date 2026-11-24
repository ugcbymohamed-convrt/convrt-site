/* RELEASE GATES: a translated page can be BUILT (reachable by URL, for review) yet not RELEASED. A blocked page is noindex, out of the sitemap, out of hreflang (the English page then
   carries no hreflang to it) and the language selector falls back to the language home. A gate lifts by itself when its condition is met; nothing else needs to change.

   /es/creator-showcase: the Spanish Showcase has its OWN creators and videos (owner decision, Nov 2026), never the English library. Until at least one approved video with a confirmed
   Spanish spoken language exists in src/content/portfolio.js, the page is launch-blocked and shows a plain "new examples are on the way" state instead of an irrelevant gallery. */

import { hasTranslation } from './registry.js'
import { displayableFor } from '../content/portfolio.js'
import { isPricingApproved } from './pricing.js'
import { ES_PRICED_PAGES } from './es/pricing.js'
import { FR_PRICED_PAGES } from './fr/pricing.js'

/* Spanish pages that carry a price are blocked until the owner has approved every EUR amount (src/i18n/es/pricing.js); a gate lifts by itself when its condition is met. */
const BLOCKS = {
  es: {
    '/creator-showcase': () => displayableFor('es').length === 0,
    '/risk-free-trial': () => !ES_FREE_VIDEO_REVIEWED,
    ...Object.fromEntries(ES_PRICED_PAGES.map((p) => [p, () => !isPricingApproved('es')])),
  },
  /* French: the showcase waits for approved French-spoken videos (never the English library), the free-video page waits for the owner's/lawyer's review of its consent wording (same as
     Spanish), and the two pages that show a price wait for approved EUR pricing (which reuses the Spanish table, src/i18n/fr/pricing.js). */
  fr: {
    '/creator-showcase': () => displayableFor('fr').length === 0,
    '/risk-free-trial': () => !FR_FREE_VIDEO_REVIEWED,
    ...Object.fromEntries(FR_PRICED_PAGES.map((p) => [p, () => !isPricingApproved('fr')])),
  },
}
/* The Spanish free-video application is built and reachable (the homepage links to it), but stays out of indexing, the sitemap and hreflang until the owner and the lawyer have reviewed it
   (its consent wording, the omitted marketing checkbox and the eligibility copy). Flip to true after that review. */
export const ES_FREE_VIDEO_REVIEWED = false
/* French twin: the French free-video application is built and reachable, but stays out of indexing, the sitemap and hreflang until the owner and the lawyer have reviewed its consent wording. */
export const FR_FREE_VIDEO_REVIEWED = false
const REASONS = { '/creator-showcase': 'no approved videos in this language yet', '/risk-free-trial': 'free-video page awaiting owner/legal review' }
const PRICING_REASON = 'EUR prices not approved yet'

export const releaseBlocker = (locale, basePath) => (BLOCKS[locale]?.[basePath]?.() ? { path: basePath, reason: REASONS[basePath] ?? PRICING_REASON } : null)
export const isReleased = (locale, basePath) => hasTranslation(locale, basePath) && !releaseBlocker(locale, basePath)
export const blockedPages = (locale) => Object.keys(BLOCKS[locale] ?? {}).map((p) => releaseBlocker(locale, p)).filter(Boolean)
