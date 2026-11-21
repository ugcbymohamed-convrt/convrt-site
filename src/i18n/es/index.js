/* The Spanish dictionary: English string → Spanish, merged from the per-area files. Duplicate keys across files must agree (tests/i18n.test.mjs). */
import shell from './dict-shell.js'
import home from './dict-home.js'
import services from './dict-services.js'
import pricing from './dict-pricing.js'
import showcase from './dict-showcase.js'
import trust from './dict-trust.js'
import scenes from './dict-scenes.js'
import roadmap from './dict-roadmap.js'
import geo from './dict-geo.js'

export default { ...shell, ...home, ...services, ...pricing, ...showcase, ...trust, ...scenes, ...roadmap, ...geo }
export const PARTS = { shell, home, services, pricing, showcase, trust, scenes, roadmap, geo }
