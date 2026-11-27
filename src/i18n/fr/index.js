/* The French dictionary: English string → French, merged from the per-area files. Duplicate keys across files must agree (tests/i18n.test.mjs). */
import shell from './dict-shell.js'
import home from './dict-home.js'
import services from './dict-services.js'
import pricing from './dict-pricing.js'
import showcase from './dict-showcase.js'
import roadmap from './dict-roadmap.js'
import riskfree from './dict-riskfree.js'
import scenes from './dict-scenes.js'
import geo from './dict-geo.js'
import trust from './dict-trust.js'
import v2 from './dict-v2.js'
import runtime from './dict-runtime.js'
import spokesperson from './dict-spokesperson.js'
import saas from './dict-saas.js'
import organic from './dict-organic.js'
import casestudies from './dict-casestudies.js'
import referrals from './dict-referrals.js'
import consent from './dict-consent.js'
import release from './dict-release.js'

export default { ...shell, ...home, ...services, ...pricing, ...showcase, ...roadmap, ...riskfree, ...scenes, ...geo, ...trust, ...v2, ...runtime, ...spokesperson, ...saas, ...organic, ...casestudies, ...referrals, ...release, ...consent }
export const PARTS = { shell, home, services, pricing, showcase, roadmap, riskfree, scenes, geo, trust, runtime, v2, spokesperson, saas, organic, casestudies, referrals, release, consent }
