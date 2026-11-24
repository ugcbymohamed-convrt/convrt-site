/* The Arabic dictionary: English string → Arabic, merged from the per-area files (same layout as src/i18n/es/index.js). Duplicate keys across files must agree (tests/i18n.test.mjs).
   Style guide, terminology and the owner-review list: docs/multilingual-arabic.md. */
import shell from './dict-shell.js'
import home from './dict-home.js'
import services from './dict-services.js'
import pricing from './dict-pricing.js'
import showcase from './dict-showcase.js'
import roadmap from './dict-roadmap.js'
import geo from './dict-geo.js'
import riskfree from './dict-riskfree.js'
import extras from './dict-extras.js'
import pages from './dict-pages.js'
import revision from './dict-revision.js'
import graspo from './dict-graspo.js'
import referrals from './dict-referrals.js'

export default { ...shell, ...home, ...services, ...pricing, ...showcase, ...roadmap, ...geo, ...riskfree, ...extras, ...pages, ...revision, ...graspo, ...referrals }
export const PARTS = { shell, home, services, pricing, showcase, roadmap, geo, riskfree, extras, pages, revision, graspo, referrals }
