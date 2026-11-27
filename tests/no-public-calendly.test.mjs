// Run with: npm run build && node --test tests/no-public-calendly.test.mjs
// Owner decision, 27 Nov 2026: no unrestricted PUBLIC Calendly link on the website in any language. The calendar stays inside the qualification-first Creative Growth Roadmap booking (shown
// only after a visitor qualifies, so it is not in the static HTML), and private invitations. The paid-traffic landing page /scale opens the Roadmap too.
// Since 27 Nov 2026 the Roadmap booking is LINK-OUT ONLY (a new-tab link): Calendly is never embedded or loaded by any page or script of ours (see the second test).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ORGANIC_CTA } from '../src/seo/businessKnowledge.js'
import { resolveCta, primaryAction } from '../src/i18n/cta.js'
import { OFFER_PATHS } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const ALLOWED = [] // /scale no longer links Calendly either (owner decision, 27 Nov 2026: Scale pages included)

test('built HTML: no page in any language links to calendly.com (the /scale paid landing page opens the Roadmap)', { skip: !fs.existsSync(DIST) && 'dist/ not built' }, () => {
  const pages = walk(DIST).filter((f) => f.endsWith('.html'))
  assert.ok(pages.length > 60)
  const offenders = pages.map((f) => path.relative(DIST, f)).filter((rel) => !ALLOWED.some((re) => re.test(rel)) && /href="[^"]*calendly\.com/i.test(fs.readFileSync(path.join(DIST, rel), 'utf8')))
  assert.deepEqual(offenders, [])
})

test('nothing from Calendly is ever loaded: no iframe, script, link, preconnect or embed parameter in any built page or JavaScript bundle', { skip: !fs.existsSync(DIST) && 'dist/ not built' }, () => {
  const files = walk(DIST).filter((f) => /\.(html|js|css)$/.test(f))
  assert.ok(files.length > 60)
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8')
    const rel = path.relative(DIST, f)
    assert.ok(!/assets\.calendly\.com|embed_type=|embed_domain|calendly\.event_scheduled/.test(t), `${rel}: no Calendly widget, embed parameter or booking message listener`)
    if (rel.endsWith('.html')) assert.ok(!/<(iframe|script|link)[^>]+calendly/i.test(t), `${rel}: no Calendly iframe, script or link tag`)
  }
})

test('the organic route is the Contact inquiry with the service chosen; no CTA helper falls back to Calendly', () => {
  assert.equal(ORGANIC_CTA.href, '/contact?service=organic')
  assert.equal(ORGANIC_CTA.external, false)
  for (const locale of ['es', 'fr', 'ar']) {
    assert.ok(!/calendly/.test(JSON.stringify(resolveCta(locale, { href: OFFER_PATHS.roadmap }))), `resolveCta ${locale}`)
    assert.ok(!/calendly/.test(JSON.stringify(primaryAction(locale))), `primaryAction ${locale}`)
  }
})

test('the Contact form preselects only a known service from ?service=', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/contact/ContactForm.jsx'), 'utf8')
  assert.match(src, /new URLSearchParams\(window\.location\.search\)\.get\('service'\)/)
  assert.match(src, /SERVICE_KEYS\.includes\(wanted\)/)
})
