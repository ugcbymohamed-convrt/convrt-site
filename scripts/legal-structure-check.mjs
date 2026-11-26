// Usage: node scripts/legal-structure-check.mjs <es|fr|ar> [--analytics]
// Compares src/content/legal/<locale>.js with the English legal documents (src/content/trustPages.js): section counts, paragraph/list counts, link targets, numbers and identifiers.
import { TRUST_CONTENT } from '../src/content/trustPages.js'
import { legalContext } from '../src/content/legal/context.js'
import { compareStructure, DOCS } from '../src/content/legal/structure.js'

const locale = process.argv[2]
if (!['es', 'fr', 'ar'].includes(locale)) { console.error('usage: node scripts/legal-structure-check.mjs <es|fr|ar> [--analytics]'); process.exit(2) }
const mod = await import(`../src/content/legal/${locale}.js`)
const build = mod.default ?? mod.LEGAL
const ctx = legalContext()
let bad = 0
for (const analyticsActive of process.argv.includes('--analytics') ? [true] : [false, true]) {
  const c = { ...ctx, analyticsActive }
  // The English documents are built once for the build's own analytics state; the cookie/analytics paragraph is the only conditional text, so compare the shared structure for both states of the translation.
  const out = build(c)
  for (const d of DOCS) {
    const problems = compareStructure(TRUST_CONTENT[d], out[d], `${locale}/${d} (analyticsActive=${analyticsActive})`)
    for (const p of problems) { console.log(p); bad++ }
  }
}
console.log(bad ? `\n${bad} structural problem(s).` : `${locale}: structure matches the English documents.`)
process.exit(bad ? 1 : 0)
