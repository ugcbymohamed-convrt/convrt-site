// Run with: node --test tests/spanish-eur-pricing.test.mjs
// The Spanish site shows EUR prices that only the owner can approve (src/i18n/es/pricing.js). These tests prove:
//   1. the mechanism (config validation, formatting, tokens, per-variation, no USD fall-through, every business-data price has a key);
//   2. that the committed configuration is the owner's approved table (2026-11-21), pinned amount by amount;
//   3. with a PENDING fixture (a throw-away copy of the site, never shipped) the safety net works: visible placeholder, no price Offers, no price in the description, the priced pages launch-blocked.
// (The approved state of the real configuration is built and checked in tests/i18n.test.mjs.)
import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import * as BK from '../src/seo/businessKnowledge.js'
import { SPRINT, SPRINT_PLUS, ORGANIC, RAW_FOOTAGE } from '../src/seo/businessKnowledge.js'
import { PRICE_ITEMS, PRICE_KEYS, PRICING, pricingConfig, pricingProblems, priceOf, perVariationOf, perVariationText, formatPrice, resolvePriceTokens, isPricingApproved } from '../src/i18n/pricing.js'
import { ES_PRICING, ES_PRICED_PAGES } from '../src/i18n/es/pricing.js'
import { money } from '../src/i18n/money.js'
import { translate } from '../src/i18n/tr.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const NB = ' '

// FAKE amounts, chosen to differ from every USD price so a leaked dollar figure cannot hide. They exist only in this test.
const FAKE = { 'sprint.monthly': 2701, 'sprint.oneOff': 3201, 'sprint.ext3': 801.5, 'sprint.ext6': 1301, 'sprint.ext12': 2401, 'sprintPlus.monthly': 4501, 'sprintPlus.oneOff': 5401, 'sprintPlus.ext3': 1501.5, 'sprintPlus.ext6': 2501, 'sprintPlus.ext12': 4301, rawFootage: 221, 'organicLight.monthly': 1201, 'organicGrowth.monthly': 2201 }
const pendingFixture = () => ({ ...ES_PRICING, status: 'pending', approvedBy: null, approvedOn: null, amounts: Object.fromEntries(Object.keys(ES_PRICING.amounts).map((k) => [k, null])) })
const approvedFixture = () => ({ ...ES_PRICING, status: 'approved', approvedBy: 'Test', approvedOn: '2026-11-21', amounts: { ...FAKE } })

// ── 1. the mechanism ─────────────────────────────────────────────────────────────────────────────────────────
test('every price in the business data has a key in the pricing list (a new USD price cannot reach a Spanish page without an approved EUR amount)', () => {
  const found = new Set()
  const walk = (v, depth = 0) => {
    if (!v || typeof v !== 'object' || depth > 6) return
    if (v.currency === 'USD' && typeof v.amount === 'number') return void found.add(v)
    for (const x of Array.isArray(v) ? v : Object.values(v)) walk(x, depth + 1)
  }
  for (const v of Object.values(BK)) walk(v)
  const keyed = new Set(PRICE_ITEMS.map((i) => i.usd))
  for (const m of found) assert.ok(keyed.has(m), `business-data price ${m.amount} ${m.currency} has no key in PRICE_ITEMS (src/i18n/pricing.js) and no EUR line in src/i18n/es/pricing.js`)
  assert.equal(PRICE_KEYS.length, new Set(PRICE_KEYS).size, 'unique keys')
  assert.deepEqual(Object.keys(ES_PRICING.amounts).sort(), [...PRICE_KEYS].sort(), 'the Spanish config has exactly one line per price')
  assert.equal(found.size, PRICE_ITEMS.length, 'no unlisted price')
})

test('pricing config validation: pending holds no amount; approved needs every amount, who approved it and when', () => {
  assert.deepEqual(pricingProblems(approvedFixture()), [])
  assert.ok(pricingProblems({ ...approvedFixture(), amounts: { ...FAKE, rawFootage: null } }).length, 'approved with a missing amount')
  assert.ok(pricingProblems({ ...approvedFixture(), amounts: { ...FAKE, rawFootage: 0 } }).length, 'zero is not a price')
  assert.ok(pricingProblems({ ...approvedFixture(), approvedBy: null }).length)
  assert.ok(pricingProblems({ ...approvedFixture(), approvedOn: 'yesterday' }).length)
  assert.ok(pricingProblems({ ...approvedFixture(), amounts: { ...FAKE, bogus: 1 } }).length, 'unknown key')
  assert.ok(pricingProblems({ ...ES_PRICING, status: 'pending', amounts: { ...ES_PRICING.amounts, rawFootage: 250 } }).length, 'a pending config must not carry a (possibly unapproved or USD-copied) number')
  assert.ok(pricingProblems({ ...approvedFixture(), currency: 'euro' }).length)
  assert.ok(!isPricingApproved('es', { ...approvedFixture(), approvedBy: null }), 'an incomplete "approved" config is not treated as approved')
  assert.equal(isPricingApproved('en'), true, 'English pricing is the business data')
})

test('EUR amounts format naturally and come from the Spanish config, never from the USD data', () => {
  const cfg = approvedFixture()
  assert.deepEqual(priceOf('es', SPRINT.monthly, cfg), { key: 'sprint.monthly', amount: 2701, currency: 'EUR' })
  assert.equal(formatPrice('es', priceOf('es', SPRINT.monthly, cfg), cfg), `2.701${NB}€`)
  assert.equal(formatPrice('es', priceOf('es', SPRINT.usageExtensions[0].price, cfg), cfg), `801,50${NB}€`)
  assert.equal(formatPrice('es', priceOf('es', SPRINT_PLUS.usageExtensions[0].price, cfg), cfg), `1.501,50${NB}€`)
  assert.equal(priceOf('es', RAW_FOOTAGE.price, cfg).amount, 221)
  assert.equal(priceOf('es', ORGANIC.growth.monthly, cfg).amount, 2201)
  assert.notEqual(priceOf('es', SPRINT.monthly, cfg).amount, SPRINT.monthly.amount, 'not the USD number')
  // pending: placeholder, never a number
  assert.equal(priceOf('es', SPRINT.monthly, pendingFixture()).amount, null)
  assert.equal(formatPrice('es', priceOf('es', SPRINT.monthly, pendingFixture()), pendingFixture()), ES_PRICING.placeholder)
  // the committed (approved) configuration
  assert.equal(money(SPRINT.monthly, 'es'), `2.750${NB}€`)
  assert.throws(() => priceOf('es', { amount: 3000, currency: 'USD' }), /no key/)
  assert.throws(() => priceOf('de', SPRINT.monthly), /No pricing configuration/)
  assert.equal(money(SPRINT.monthly, 'en'), '$3,000')
})

test('per-variation figures are derived only from the approved amount of that language, rounded to whole euros like the English figure', () => {
  const cfg = approvedFixture()
  assert.equal(perVariationOf('es', 'sprint.monthly', cfg).amount, 180) // 2701 / 15
  assert.equal(perVariationOf('es', 'sprint.oneOff', cfg).amount, 213) // 3201 / 15
  assert.equal(perVariationOf('es', 'sprintPlus.monthly', cfg).amount, 150) // 4501 / 30
  assert.equal(perVariationOf('es', 'sprintPlus.oneOff', cfg).amount, 180) // 5401 / 30
  assert.equal(perVariationText('es', SPRINT.monthly, cfg), `180${NB}€`)
  assert.equal(perVariationOf('es', 'sprint.monthly', pendingFixture()).amount, null, 'pending stays pending')
  // the committed table: 2750/15 = 183.3, 3250/15 = 216.7, 4600/30 = 153.3, 5500/30 = 183.3 (rounded to whole euros)
  assert.deepEqual(['sprint.monthly', 'sprint.oneOff', 'sprintPlus.monthly', 'sprintPlus.oneOff'].map((k) => perVariationOf('es', k).amount), [183, 217, 153, 183])
  assert.equal(perVariationText('es', SPRINT_PLUS.oneOff), `183${NB}€`)
  assert.throws(() => perVariationOf('es', 'rawFootage', cfg))
})

test('dictionary sentences carry price tokens, never a typed amount; tokens resolve from the config', () => {
  const sentence = 'Creative Testing Sprint cuesta {{price:sprint.monthly}} ({{perVariation:sprint.monthly}} por variación)'
  assert.equal(resolvePriceTokens('es', sentence, approvedFixture()), `Creative Testing Sprint cuesta 2.701${NB}€ (180${NB}€ por variación)`)
  assert.equal(resolvePriceTokens('es', sentence, pendingFixture()), `Creative Testing Sprint cuesta ${ES_PRICING.placeholder} (${ES_PRICING.placeholder} por variación)`)
  assert.equal(resolvePriceTokens('es', sentence), `Creative Testing Sprint cuesta 2.750${NB}€ (183${NB}€ por variación)`, 'the committed table')
  assert.throws(() => resolvePriceTokens('es', '{{price:nope}}'))
  // the real dictionary: no Spanish sentence types a currency amount
  const dictDir = path.join(ROOT, 'src/i18n/es')
  for (const f of fs.readdirSync(dictDir).filter((x) => x.startsWith('dict-'))) {
    const t = fs.readFileSync(path.join(dictDir, f), 'utf8')
    for (const line of t.split('\n')) {
      if (/^\s*"(Under \$5,000|\$5,000–\$20,000|\$20,000\+)"/.test(line)) continue // the Roadmap's ad-spend answer brackets: qualification thresholds, deliberately unchanged
      const value = line.replace(/^\s*"(?:[^"\\]|\\.)*":\s*/, '')
      // the Referral Partner Program rewards are the English page's own US-dollar amounts ($150, 10 % up to $500): shown as written, never converted and never a CONVRT package price
      if (f === 'dict-referrals.js') { assert.ok(!/\d[\d.,]*\s?(€|EUR|euros?)\b/i.test(value), `${f}: no euro amount in the referral dictionary`); continue }
      assert.ok(!/\d[\d.,]*\s?(USD|€|EUR|euros?)\b/i.test(value), `${f}: a Spanish value types an amount instead of a price token: ${value.slice(0, 90)}`)
    }
  }
  assert.equal(translate('es', 'Yes, one-off packages are available: Creative Testing Sprint is $3,500 and Creative Testing Sprint Plus is $6,000.'), `Sí, hay paquetes puntuales: Creative Testing Sprint cuesta 3.250${NB}€ y Creative Testing Sprint Plus 5.500${NB}€.`)
})

test('future languages register their own pricing; English is never in the registry', () => {
  assert.deepEqual(Object.keys(PRICING), ['es', 'fr', 'ar'])
  assert.equal(pricingConfig('en'), null)
  assert.equal(pricingConfig('es').currency, 'EUR')
})

// ── 2. the committed configuration ───────────────────────────────────────────────────────────────────────────
test('the committed Spanish pricing is the owner-approved table (2026-11-21), amount by amount, and is not derived from the USD data', () => {
  assert.deepEqual(pricingProblems(ES_PRICING), [])
  assert.equal(ES_PRICING.status, 'approved'); assert.equal(ES_PRICING.approvedOn, '2026-11-21'); assert.equal(ES_PRICING.currency, 'EUR')
  assert.deepEqual(ES_PRICING.amounts, { 'sprint.monthly': 2750, 'sprint.oneOff': 3250, 'sprint.ext3': 850, 'sprint.ext6': 1375, 'sprint.ext12': 2400, 'sprintPlus.monthly': 4600, 'sprintPlus.oneOff': 5500, 'sprintPlus.ext3': 1550, 'sprintPlus.ext6': 2500, 'sprintPlus.ext12': 4350, rawFootage: 225, 'organicLight.monthly': 1400, 'organicGrowth.monthly': 2300 })
  // no exchange-rate logic anywhere in the pricing code
  for (const f of ['src/i18n/pricing.js', 'src/i18n/es/pricing.js', 'src/i18n/es/money.js', 'src/i18n/money.js']) assert.ok(!/exchange|fx|rate|convert/i.test(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), `${f}: no conversion logic`)
  assert.ok(ES_PRICED_PAGES.every((p) => p.startsWith('/')))
  assert.ok(pricingProblems(pendingFixture()).length === 0, 'a pending config is also valid (it is the safety state)')
})

// ── 3. a real build with a FAKE approved configuration ──────────────────────────────────────────────────────
let tmp
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })
const textOf = (h) => h.slice(h.indexOf('<body')).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map((s) => s.trim()).filter(Boolean).join('\n')
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))

test('safety net: with a PENDING configuration a real build shows placeholders, omits price Offers and the price claim, and launch-blocks exactly the priced pages', { timeout: 120000 }, async () => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-eur-')))
  // A throw-away COPY of the project whose Spanish pricing is pending: head metadata is built by Node-side build code, so a resolver swap cannot reach it.
  const proj = path.join(tmp, 'proj'), dist = path.join(proj, 'dist')
  fs.mkdirSync(path.join(proj, 'public'), { recursive: true })
  for (const f of ['src', 'scripts', 'index.html', 'package.json', 'vite.config.js', 'vite-plugin-blog.js', 'vite-plugin-sitemap.js', 'vite-plugin-static-routes.js', 'vite-plugin-withheld-videos.js', 'tailwind.config.js', 'postcss.config.js']) fs.cpSync(path.join(ROOT, f), path.join(proj, f), { recursive: true })
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(proj, 'public', 'fonts'), { recursive: true })
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(proj, 'node_modules'), 'dir')
  const pending = pendingFixture()
  fs.writeFileSync(path.join(proj, 'src/i18n/es/pricing.js'), `import { formatMoneyEs } from './money.js'
export const ES_PRICING = { locale: 'es', currency: 'EUR', status: 'pending', approvedBy: null, approvedOn: null, placeholder: ${JSON.stringify(ES_PRICING.placeholder)}, format: formatMoneyEs, amounts: ${JSON.stringify(pending.amounts)} }
export const ES_PRICED_PAGES = ${JSON.stringify(ES_PRICED_PAGES)}
`)
  await build({ root: proj, configFile: path.join(proj, 'vite.config.js'), logLevel: 'silent', build: { outDir: 'dist', emptyOutDir: true } })
  const page = (p) => fs.readFileSync(path.join(dist, p.replace(/^\/|\/$/g, ''), 'index.html'), 'utf8')
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  const withPlaceholder = []
  for (const p of ['/es', '/es/pricing', '/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/social-media-video-production', '/es/saas-video-production', '/es/about', '/es/contact', '/es/creative-growth-roadmap']) {
    const h = page(p)
    if (textOf(h).includes(ES_PRICING.placeholder)) withPlaceholder.push(p.replace('/es', '') || '/')
    assert.ok(!/"price":\d/.test(h), `${p}: no price Offer while pending`)
    assert.ok(!/\$\s?\d/.test(textOf(h)), `${p}: no USD amount substituted`)
  }
  assert.deepEqual(withPlaceholder.sort(), [...ES_PRICED_PAGES].sort(), 'exactly the priced pages show a placeholder')
  for (const bp of ES_PRICED_PAGES) {
    const es = page(`/es${bp}`)
    assert.match(es.slice(0, es.indexOf('</head>')), /name="robots" content="noindex, follow"/, `${bp}: launch-blocked`)
    assert.ok(!sm.includes(`/es${bp}`) && !/hreflang="es"/.test(page(bp)), `${bp}: no sitemap entry, no hreflang`)
  }
  assert.ok(!/desde/.test(page('/es/ugc-video-agency').match(/<meta name="description" content="[^"]*"/)[0]), 'no price claim in the description')
  assert.ok(sm.includes('/es/about'), 'unrelated pages stay released')
})
