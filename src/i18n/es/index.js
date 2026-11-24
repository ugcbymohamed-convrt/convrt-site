/* The Spanish dictionary: English string → Spanish, merged from the per-area files. Duplicate keys across files must agree (tests/i18n.test.mjs). */
import shell from './dict-shell.js'
import home from './dict-home.js'
import services from './dict-services.js'
import pricing from './dict-pricing.js'
import showcase from './dict-showcase.js'
import trust from './dict-trust.js'
import v2 from './dict-v2.js'
import scenes from './dict-scenes.js'
import roadmap from './dict-roadmap.js'
import geo from './dict-geo.js'
import riskfree from './dict-riskfree.js'
import referrals from './dict-referrals.js'

export default { ...shell, ...home, ...services, ...pricing, ...showcase, ...trust, ...v2, ...scenes, ...roadmap, ...geo, ...riskfree, ...referrals }
export const PARTS = { shell, home, services, pricing, showcase, trust, scenes, roadmap, geo, riskfree, v2, referrals }
