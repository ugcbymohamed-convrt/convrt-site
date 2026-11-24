/* French launch readiness: lists what still blocks publishing the French site. Run: node scripts/fr-launch-readiness.mjs
   (French is 'live' in src/i18n/locales.js on this branch: MERGING PUBLISHES IT; flip to 'review' to withhold.) */
import { blockedPages } from '../src/i18n/release.js'
import { displayableFor } from '../src/content/portfolio.js'
import { isPricingApproved } from '../src/i18n/pricing.js'
import { FR_OG_IMAGE_READY } from '../src/i18n/fr/seo.js'
import { TRUST_PAGES_PUBLISHED } from '../src/config.js'

const blockers = []
if (!isPricingApproved('fr')) blockers.push('French EUR pricing not approved: /fr/pricing and /fr/ugc-video-agency are launch-blocked')
for (const b of blockedPages('fr')) blockers.push(`Page ${b.path} is held: ${b.reason}${b.path === '/risk-free-trial' ? ' (built and linked from the French homepage; owner/legal review of its consent wording, then set FR_FREE_VIDEO_REVIEWED in src/i18n/release.js)' : ''}`)
if (displayableFor('fr').length === 0) blockers.push('No approved French-spoken videos')
if (!FR_OG_IMAGE_READY) blockers.push('French OG image not enabled (FR_OG_IMAGE_READY in src/i18n/fr/seo.js): French pages share the English-text image')
blockers.push('Legal pages (Privacy Policy, Terms, Legal Notice) exist in English only and are linked as « (en anglais) »: a reviewed French set is still to be approved' + (TRUST_PAGES_PUBLISHED ? '' : ' (trust pages unpublished)'))
blockers.push('Owner/native-French copy review of src/i18n/fr/* (see docs/multilingual-french-copy-guide.md)')
blockers.push('Confirm the signed Creator Portfolio Agreements and spoken language of the two French creators (private map: CONVRT/Claude/multilingual-fr)')
console.log(`French launch blockers (${blockers.length}):`)
for (const b of blockers) console.log(' - ' + b)
