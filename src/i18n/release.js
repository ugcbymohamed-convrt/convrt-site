/* RELEASE GATES: a translated page can be BUILT (reachable by URL, for review) yet not RELEASED. A blocked page is noindex, out of the sitemap, out of hreflang (the English page then
   carries no hreflang to it) and the language selector falls back to the language home. A gate lifts by itself when its condition is met; nothing else needs to change.

   /es/creator-showcase: the Spanish Showcase has its OWN creators and videos (owner decision, Nov 2026), never the English library. Until at least one approved video with a confirmed
   Spanish spoken language exists in src/content/portfolio.js, the page is launch-blocked and shows a plain "new examples are on the way" state instead of an irrelevant gallery. */

import { hasTranslation } from './registry.js'
import { displayableFor } from '../content/portfolio.js'
import { isPricingApproved } from './pricing.js'
import { ES_PRICED_PAGES } from './es/pricing.js'
import { AR_PRICED_PAGES } from './ar/pricing.js'
import { AR_ARTICLES } from '../content/blogAr.js'
import { FR_PRICED_PAGES } from './fr/pricing.js'

/* Spanish pages that carry a price are blocked until the owner has approved every EUR amount (src/i18n/es/pricing.js); a gate lifts by itself when its condition is met. */
const BLOCKS = {
  es: {
    '/creator-showcase': () => displayableFor('es').length === 0,
    '/risk-free-trial': () => !ES_FREE_VIDEO_REVIEWED,
    ...Object.fromEntries(ES_PRICED_PAGES.map((p) => [p, () => !isPricingApproved('es')])),
  },
  // Arabic: the Showcase needs approved Arabic-language videos (its own creators, never the English library); the free-video application is built and linked but held for owner/legal review
  // (its consent wording and eligibility copy); priced pages need the Arabic (USD) pricing config to be valid, which it is by construction (src/i18n/ar/pricing.js).
  ar: {
    '/creator-showcase': () => displayableFor('ar').length === 0,
    '/risk-free-trial': () => !AR_FREE_VIDEO_REVIEWED,
    '/blog': () => AR_ARTICLES.length === 0, // the Arabic blog index is reachable (the menu links to it) but noindex / out of the sitemap and hreflang until it lists an Arabic article
    ...Object.fromEntries(AR_PRICED_PAGES.map((p) => [p, () => !isPricingApproved('ar')])),
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
/* Same for the Arabic free-video application (src/i18n/ar/dict-riskfree.js): reachable and linked, but noindex / out of the sitemap and hreflang until the owner and the lawyer have reviewed it. */
export const AR_FREE_VIDEO_REVIEWED = false
/* French twin: the French free-video application is built and reachable, but stays out of indexing, the sitemap and hreflang until the owner and the lawyer have reviewed its consent wording. */
export const FR_FREE_VIDEO_REVIEWED = false
const REASONS = {
  es: { '/creator-showcase': 'no approved Spanish-language videos yet', '/risk-free-trial': 'Spanish free-video page awaiting owner/legal review' },
  fr: { '/creator-showcase': 'no approved French-language videos yet', '/risk-free-trial': 'French free-video page awaiting owner/legal review' },
  ar: { '/creator-showcase': 'no approved Arabic-language videos yet', '/risk-free-trial': 'Arabic free-video page awaiting owner/legal review', '/blog': 'no published Arabic blog articles yet' },
}
const PRICING_REASON = { es: 'Spanish EUR prices not approved yet', fr: 'EUR prices not approved yet', ar: 'Arabic USD pricing configuration invalid' }

export const releaseBlocker = (locale, basePath) => (BLOCKS[locale]?.[basePath]?.() ? { path: basePath, reason: REASONS[locale]?.[basePath] ?? PRICING_REASON[locale] } : null)
export const isReleased = (locale, basePath) => hasTranslation(locale, basePath) && !releaseBlocker(locale, basePath)
export const blockedPages = (locale) => Object.keys(BLOCKS[locale] ?? {}).map((p) => releaseBlocker(locale, p)).filter(Boolean)
