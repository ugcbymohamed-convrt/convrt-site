// Run with: node --test tests/spanish-eur-pricing.test.mjs
// The Spanish site shows EUR prices that only the owner can approve (src/i18n/es/pricing.js). These tests prove:
//   1. the mechanism (config validation, formatting, tokens, per-variation, no USD fall-through, every business-data price has a key);
//   2. that the committed configuration is still PENDING (nothing invented) unless the owner approved every amount;
//   3. with a FAKE fully approved fixture (test-only amounts, never shipped) a real build switches every Spanish price, Offer and description to EUR, lifts the pricing gates and leaves no placeholder.
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
  assert.equal(priceOf('es', SPRINT.monthly).amount, null)
  assert.equal(formatPrice('es', priceOf('es', SPRINT.monthly)), ES_PRICING.placeholder)
  assert.throws(() => priceOf('es', { amount: 3000, currency: 'USD' }), /no key/)
  assert.throws(() => priceOf('fr', SPRINT.monthly), /No pricing configuration/)
  assert.equal(money(SPRINT.monthly, 'en'), '$3,000')
})

test('per-variation figures are derived only from the approved amount of that language, rounded to whole euros like the English figure', () => {
  const cfg = approvedFixture()
  assert.equal(perVariationOf('es', 'sprint.monthly', cfg).amount, 180) // 2701 / 15
  assert.equal(perVariationOf('es', 'sprint.oneOff', cfg).amount, 213) // 3201 / 15
  assert.equal(perVariationOf('es', 'sprintPlus.monthly', cfg).amount, 150) // 4501 / 30
  assert.equal(perVariationOf('es', 'sprintPlus.oneOff', cfg).amount, 180) // 5401 / 30
  assert.equal(perVariationText('es', SPRINT.monthly, cfg), `180${NB}€`)
  assert.equal(perVariationOf('es', 'sprint.monthly').amount, null, 'pending stays pending')
  assert.throws(() => perVariationOf('es', 'rawFootage', cfg))
})

test('dictionary sentences carry price tokens, never a typed amount; tokens resolve from the config', () => {
  const sentence = 'Creative Testing Sprint cuesta {{price:sprint.monthly}} ({{perVariation:sprint.monthly}} por variación)'
  assert.equal(resolvePriceTokens('es', sentence, approvedFixture()), `Creative Testing Sprint cuesta 2.701${NB}€ (180${NB}€ por variación)`)
  assert.equal(resolvePriceTokens('es', sentence), `Creative Testing Sprint cuesta ${ES_PRICING.placeholder} (${ES_PRICING.placeholder} por variación)`)
  assert.throws(() => resolvePriceTokens('es', '{{price:nope}}'))
  // the real dictionary: no Spanish sentence types a currency amount
  const dictDir = path.join(ROOT, 'src/i18n/es')
  for (const f of fs.readdirSync(dictDir).filter((x) => x.startsWith('dict-'))) {
    const t = fs.readFileSync(path.join(dictDir, f), 'utf8')
    for (const line of t.split('\n')) {
      if (/^\s*"(Under \$5,000|\$5,000–\$20,000|\$20,000\+)"/.test(line)) continue // the Roadmap's ad-spend answer brackets: qualification thresholds, deliberately unchanged
      const value = line.replace(/^\s*"(?:[^"\\]|\\.)*":\s*/, '')
      assert.ok(!/\d[\d.,]*\s?(USD|€|EUR|euros?)\b/i.test(value), `${f}: a Spanish value types an amount instead of a price token: ${value.slice(0, 90)}`)
    }
  }
  assert.equal(translate('es', 'Yes, one-off packages are available: Creative Testing Sprint is $3,500 and Creative Testing Sprint Plus is $6,000.'), `Sí, hay paquetes puntuales: Creative Testing Sprint cuesta ${ES_PRICING.placeholder} y Creative Testing Sprint Plus ${ES_PRICING.placeholder}.`)
})

test('future languages register their own pricing; English is never in the registry', () => {
  assert.deepEqual(Object.keys(PRICING), ['es'])
  assert.equal(pricingConfig('en'), null)
  assert.equal(pricingConfig('es').currency, 'EUR')
})

// ── 2. the committed configuration ───────────────────────────────────────────────────────────────────────────
test('the committed Spanish pricing is consistent: pending with no amount, or approved with every amount, who and when', () => {
  assert.deepEqual(pricingProblems(ES_PRICING), [])
  if (ES_PRICING.status === 'pending') assert.ok(Object.values(ES_PRICING.amounts).every((v) => v === null), 'no amount may be set before the owner approves the table')
  else assert.ok(PRICE_KEYS.every((k) => ES_PRICING.amounts[k] > 0))
  assert.ok(ES_PRICED_PAGES.every((p) => p.startsWith('/')))
})

// ── 3. a real build with a FAKE approved configuration ──────────────────────────────────────────────────────
let tmp
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })
const textOf = (h) => h.slice(h.indexOf('<body')).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map((s) => s.trim()).filter(Boolean).join('\n')
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))

test('with approved EUR amounts a real build shows EUR everywhere: cards, FAQs, metadata, Offers; no placeholder, no USD price; the pricing gates lift', { timeout: 120000 }, async () => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-eur-')))
  // A throw-away COPY of the project whose Spanish pricing is the fake approved fixture: head metadata is built by Node-side build code, so a resolver swap cannot reach it.
  const proj = path.join(tmp, 'proj'), dist = path.join(proj, 'dist')
  fs.mkdirSync(path.join(proj, 'public'), { recursive: true })
  for (const f of ['src', 'index.html', 'package.json', 'vite.config.js', 'vite-plugin-blog.js', 'vite-plugin-sitemap.js', 'vite-plugin-static-routes.js', 'tailwind.config.js', 'postcss.config.js']) fs.cpSync(path.join(ROOT, f), path.join(proj, f), { recursive: true })
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(proj, 'public', 'fonts'), { recursive: true })
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(proj, 'node_modules'), 'dir')
  fs.writeFileSync(path.join(proj, 'src/i18n/es/pricing.js'), `import { formatMoneyEs } from './money.js'
export const ES_PRICING = { locale: 'es', currency: 'EUR', status: 'approved', approvedBy: 'Test', approvedOn: '2026-11-21', placeholder: ${JSON.stringify(ES_PRICING.placeholder)}, format: formatMoneyEs, amounts: ${JSON.stringify(FAKE)} }
export const ES_PRICED_PAGES = ${JSON.stringify(ES_PRICED_PAGES)}
`)
  await build({ root: proj, configFile: path.join(proj, 'vite.config.js'), logLevel: 'silent', build: { outDir: 'dist', emptyOutDir: true } })
  const page = (p) => fs.readFileSync(path.join(dist, p.replace(/^\/|\/$/g, ''), 'index.html'), 'utf8')
  const eur = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }) + NB + '€'

  const pricing = page('/es/pricing'), t = textOf(pricing)
  for (const k of ['sprint.monthly', 'sprint.oneOff', 'sprintPlus.monthly', 'sprintPlus.oneOff', 'sprint.ext3', 'sprint.ext6', 'sprint.ext12', 'sprintPlus.ext3', 'sprintPlus.ext6', 'sprintPlus.ext12', 'rawFootage', 'organicLight.monthly', 'organicGrowth.monthly']) assert.ok(t.includes(eur(FAKE[k])), `/es/pricing shows ${k} as ${eur(FAKE[k])}; sample: ${JSON.stringify((t.match(/.{12}€.{3}|.{20}precio en.{20}/g) ?? []).slice(0, 6))}`)
  assert.ok(t.includes(`180${NB}€`) && t.includes(`150${NB}€`), 'per-variation figures derive from the EUR amounts')
  // deliverables, terms and VAT wording are unchanged (translated English data)
  for (const s of ['15 versiones de anuncio finalizadas', '30 versiones de anuncio finalizadas', 'sin IVA'.replace('sin IVA', 'IVA')]) assert.ok(t.includes(s), s)

  for (const p of ['/es', '/es/pricing', '/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/social-media-video-production', '/es/saas-video-production', '/es/about', '/es/contact', '/es/creator-showcase', '/es/creative-growth-roadmap']) {
    const h = page(p), x = textOf(h)
    assert.ok(!x.includes(ES_PRICING.placeholder), `${p}: no placeholder once approved`)
    assert.ok(!/\$\s?\d/.test(x), `${p}: no $N`)
    assert.ok(!/"priceCurrency":"USD"/.test(h), `${p}: no USD price in JSON-LD`)
    // USD survives only as a client's real result (UGC) and the Roadmap's ad-spend brackets
    const usd = x.match(/[\d.,]+\s?USD/g) ?? []
    assert.ok(usd.every((u) => /3\.421,25|^(5|20)\.000/.test(u.replace(NB, ' ').trim())), `${p}: ${usd}`)
  }
  // metadata
  assert.ok(page('/es/ugc-video-agency').includes(`desde ${eur(2701)}/mes`), 'UGC description carries the EUR price: ' + (page('/es/ugc-video-agency').match(/<meta name="description" content="[^"]*"/) ?? [])[0])
  assert.match(page('/es/pricing'), /precios claros en euros/)
  // JSON-LD Offers: EUR amounts only
  const offers = JSON.stringify(jsonLd(pricing)[0]['@graph'])
  const prices = [...offers.matchAll(/"price":([\d.]+),"priceCurrency":"(\w+)"/g)].map((m) => [Number(m[1]), m[2]])
  assert.ok(prices.length >= 7 && prices.every(([, c]) => c === 'EUR'), 'every Offer is EUR')
  assert.deepEqual(prices.map(([n]) => n).sort((a, b) => a - b), [221, 1201, 2201, 2701, 3201, 4501, 5401].sort((a, b) => a - b), 'Offer amounts are the approved EUR amounts')
  assert.ok(jsonLd(page('/es/ugc-video-agency'))[0]['@graph'].some((n) => n.offers?.length === 4 && n.offers.every((o) => o.priceSpecification.priceCurrency === 'EUR')), 'UGC page Service offers')
  // gates lifted: indexable, hreflang, sitemap
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const bp of ES_PRICED_PAGES) {
    const es = page(`/es${bp}`)
    assert.ok(!/name="robots"/.test(es.slice(0, es.indexOf('</head>'))), `${bp}: indexable`)
    assert.ok(sm.includes(`/es${bp}`) && /hreflang="es"/.test(page(bp)), `${bp}: sitemap + hreflang`)
  }
  // English pages keep USD
  assert.match(textOf(page('/pricing')), /\$3,000/)
  assert.ok(!/€/.test(textOf(page('/pricing'))))
})
