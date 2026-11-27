// Owner decision (27 Nov 2026): NO unrestricted public Calendly booking link anywhere on the site, in any language. The one exception is the Roadmap's qualification-first booking
// (CalendlyGate inside the Roadmap flow, runtime only, shown to qualified visitors), which never appears in the static HTML. The Privacy Policy and Legal Notice are revised on a separate branch
// (their operator list still links the booking page until that revision is activated), so those documents are the only static pages allowed to contain a Calendly URL here.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hrefFor } from '../src/i18n/tr.js'
import { OFFER_PATHS } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(ROOT, 'dist')
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const pages = walk(dist).filter((f) => f.endsWith('index.html')).map((f) => ({ route: '/' + path.relative(dist, path.dirname(f)).replace(/\\/g, '/'), html: fs.readFileSync(f, 'utf8') }))
const LEGAL_DOCS = /^\/(?:(?:es|fr|ar)\/)?(?:privacy|terms|legal-notice)$/

test('no static page links a Calendly URL, except the legal documents revised on their own branch', () => {
  assert.ok(pages.length > 40)
  const offenders = pages.filter((p) => !LEGAL_DOCS.test(p.route) && /calendly\.com/i.test(p.html)).map((p) => p.route)
  assert.deepEqual(offenders, [], 'no public Calendly URL in any page')
})

test('/scale: every CTA is the free Creative Growth Roadmap (qualification first), with no booking modal', () => {
  const h = pages.find((p) => p.route === '/scale').html
  const body = h.slice(h.indexOf('<body'))
  assert.ok(!/calendly|Book a Discovery Call|Book a discovery call/i.test(body))
  const ctas = [...body.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]*Get 5 Free Ad Concepts[^<]*)/g)]
  assert.ok(ctas.length >= 4 && ctas.every((m) => m[1] === OFFER_PATHS.roadmap), 'hero, system, FAQ, final CTA and the header all open the Roadmap')
  assert.ok(!fs.existsSync(path.join(ROOT, 'src/components/scale/BookingModal.jsx')))
})

test('organic CTAs on /pricing and the Organic page open the organic project application in every language', () => {
  const base = { en: '', es: '/es', fr: '/fr', ar: '/ar' }
  for (const [l, pre] of Object.entries(base)) {
    for (const [page, from] of [['pricing', 'pricing'], ['social-media-video-production', 'organic-social']]) {
      const h = pages.find((p) => p.route === `${pre}/${page}`).html
      const want = `href="${pre}/project-application?package=custom-organic&amp;from=${from}"`
      assert.ok(h.includes(want), `${l} /${page}: ${want}`)
      assert.ok(!/calendly/i.test(h), `${l} /${page}: no Calendly`)
    }
  }
})

test('hrefFor keeps a query string while localizing the path', () => {
  assert.equal(hrefFor('/project-application?package=custom-organic&from=pricing', 'es'), '/es/project-application?package=custom-organic&from=pricing')
  assert.equal(hrefFor('/pricing?x=1#packages', 'fr'), '/fr/pricing?x=1#packages')
  assert.equal(hrefFor('/project-application?package=custom-organic', 'en'), '/project-application?package=custom-organic')
})
