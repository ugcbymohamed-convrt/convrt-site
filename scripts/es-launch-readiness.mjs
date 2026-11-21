/* Spanish launch-readiness report: prints what still blocks publishing Spanish, from the live configuration (nothing is hard-coded here).
       node scripts/es-launch-readiness.mjs        (exit code 1 while any blocker remains) */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOCALES } from '../src/i18n/locales.js'
import { LOCALIZED_FLOWS } from '../src/i18n/cta.js'
import { blockedPages } from '../src/i18n/release.js'
import { displayableFor } from '../src/content/portfolio.js'
import { ES_OG_IMAGE_READY } from '../src/i18n/es/seo.js'
import { TRANSLATED_PATHS } from '../src/i18n/registry.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const blockers = []
for (const b of blockedPages('es')) blockers.push(`Page ${b.path} is launch-blocked: ${b.reason} (${displayableFor('es').length} approved Spanish-language videos; add entries with languages: ['es'] to src/content/portfolio.js)`)
for (const [flow, ok] of Object.entries(LOCALIZED_FLOWS.es)) if (!ok) blockers.push(`Conversion flow "${flow}" is English-only: Spanish CTAs use the booking call instead (src/i18n/cta.js)`)
if (!ES_OG_IMAGE_READY) blockers.push('Spanish OG image missing: Spanish pages share the English-text image (public/og/convrt-og-es.png)')
for (const bp of ['/privacy', '/terms', '/legal-notice']) if (!TRANSLATED_PATHS.es.includes(bp)) blockers.push(`Legal page ${bp} is English-only (linked from Spanish pages, marked lang="en")`)
console.log(`Spanish status: ${LOCALES.es.status}`)
console.log(blockers.length ? `Launch blockers (${blockers.length}):` : 'No blockers.')
for (const b of blockers) console.log(` - ${b}`)
console.log('Owner decisions: see docs/multilingual-spanish-release.md')
process.exit(blockers.length ? 1 : 0)
