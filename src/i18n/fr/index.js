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
import runtime from './dict-runtime.js'
import spokesperson from './dict-spokesperson.js'
import saas from './dict-saas.js'
import organic from './dict-organic.js'

export default { ...shell, ...home, ...services, ...pricing, ...showcase, ...roadmap, ...riskfree, ...scenes, ...geo, ...trust, ...runtime, ...spokesperson, ...saas, ...organic }
export const PARTS = { shell, home, services, pricing, showcase, roadmap, riskfree, scenes, geo, trust, runtime, spokesperson, saas, organic }
