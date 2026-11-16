// Run with: node --test tests/pricing.test.mjs
// SEO/GEO phase 1: the business knowledge base, the pricing FAQ and the JSON-LD built from them.
// Pure checks (no build). The raw-HTML checks on the built /pricing page live in tests/prerender.test.mjs.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BRAND, SPRINT, SPRINT_PLUS, COMMITMENT, TAX, USAGE_RIGHTS, RAW_FOOTAGE, REVISIONS, RESHOOTS, FORMATS, TURNAROUND,
  ORGANIC, ORGANIC_PACKAGES, PRODUCTION_PROCESS, PRODUCT_REQUIREMENTS, SINGLE_VIDEOS, PRODUCTION_LANGUAGES, OWNER_REVIEW_FLAGS, formatMoney,
} from '../src/seo/businessKnowledge.js'
import { PRICING_FAQ, faqAnswerText } from '../src/seo/pricingFaq.js'
import {
  ORG_ID, WEBSITE_ID, homeGraph, pricingGraph, jsonLdFor, organizationRef, BREADCRUMB_TRAILS,
} from '../src/seo/structuredData.js'
import { SITE_SEO, pageHead } from '../src/seo/siteSeo.js'
import { articleJsonLd, blogIndexJsonLd } from '../src/lib/blog/seo.js'
import { SITE_URL } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const faq = (id) => faqAnswerText(PRICING_FAQ.find((f) => f.id === id))
const graph = () => pricingGraph({ title: SITE_SEO['/pricing'].title, description: SITE_SEO['/pricing'].description })['@graph']

// ── confirmed commercial policy ─────────────────────────────────────────────────────────
test('Sprint: $2,500/month, 5 concepts x 2 variations = 10, 10 business days, 2 revision rounds, 6 months usage', () => {
  assert.deepEqual(SPRINT.monthly, { amount: 2500, currency: 'USD' })
  assert.equal(SPRINT.concepts, 5)
  assert.equal(SPRINT.variationsPerConcept, 2)
  assert.equal(SPRINT.variations, SPRINT.concepts * SPRINT.variationsPerConcept)
  assert.equal(SPRINT.variations, 10)
  assert.equal(SPRINT.turnaroundBusinessDays, 10)
  assert.equal(SPRINT.revisionRoundsPerConcept, 2)
  assert.equal(SPRINT.usageMonthsIncluded, 6)
})

test('Sprint Plus: $4,500/month, 20 variations, 15 business days, 2 revision rounds, 6 months usage', () => {
  assert.deepEqual(SPRINT_PLUS.monthly, { amount: 4500, currency: 'USD' })
  assert.equal(SPRINT_PLUS.variations, 20)
  assert.equal(SPRINT_PLUS.turnaroundBusinessDays, 15)
  assert.equal(SPRINT_PLUS.revisionRoundsPerConcept, 2)
  assert.equal(SPRINT_PLUS.usageMonthsIncluded, 6)
})

test('Sprint Plus: 8 concepts / 8 scripts / 20 variations, distributed (not evenly) across concepts', () => {
  assert.equal(SPRINT_PLUS.concepts.value, 8)
  assert.equal(SPRINT_PLUS.concepts.status, 'confirmed')
  assert.equal(SPRINT_PLUS.variations, 20)
  assert.match(SPRINT_PLUS.variationsDistribution, /distributed across the concepts according to the creative testing strategy/)
  assert.match(SPRINT_PLUS.variationsDistribution, /not necessarily have the same number of variations/)
  const offer = read('src/components/pricing/PricingCards.jsx')
  assert.match(offer, /SPRINT_PLUS\.concepts\.value\} distinct creative concepts/)
  assert.match(offer, /SPRINT_PLUS\.concepts\.value\} complete scripts/)
  assert.match(faq('whats-included'), /8 distinct concepts and 20 ad variations in total, distributed across the concepts/)
  const svc = graph().find((n) => n.name === 'Creative Testing Sprint Plus')
  assert.match(svc.description, /8 distinct creative concepts and 20 ad variations in total, distributed across the concepts/)
  // Never implies an even split or a different concept count.
  const everyClaim = JSON.stringify(graph()) + PRICING_FAQ.map(faqAnswerText).join(' ') + offer
  assert.ok(!/\b10 (distinct )?(creative )?concepts/i.test(everyClaim), 'no invented 10-concept Sprint Plus')
  assert.ok(!/(two and a half|2\.5 variations|same number of variations|equal(ly)? (split|distributed)|each concept (has|gets|includes) \d+ variations)/i.test(everyClaim.replace(/not necessarily have the same number of variations/gi, '')), 'no even-split claim')
  // The 5 x 2 concept diagram stays about the standard Sprint only.
  assert.match(read('src/components/pricing/ConceptExplainer.jsx'), /SPRINT\.concepts/)
  assert.ok(!/SPRINT_PLUS/.test(read('src/components/pricing/ConceptExplainer.jsx')))
})

test('monthly commitment: 3 months, then month-to-month, 30 days notice; no guaranteed results', () => {
  assert.equal(COMMITMENT.initialMonths, 3)
  assert.equal(COMMITMENT.cancellationNoticeDays, 30)
  assert.match(COMMITMENT.summary, /initial three-month commitment.*month-to-month.*30 days' cancellation notice/)
  assert.match(COMMITMENT.rationale, /never guarantee/)
  assert.match(faq('minimum-commitment'), /three-month commitment/)
})

test('one-off prices are $3,000 and $5,400 in USD, monthly in EUR: currencies preserved, never converted', () => {
  assert.deepEqual(SPRINT.oneOff, { amount: 3000, currency: 'USD' })
  assert.deepEqual(SPRINT_PLUS.oneOff, { amount: 5400, currency: 'USD' })
  assert.equal(formatMoney(SPRINT.oneOff), '$3,000')
  assert.equal(formatMoney(SPRINT_PLUS.oneOff), '$5,400')
  assert.equal(formatMoney(SPRINT.monthly), '$2,500')
  assert.ok(!OWNER_REVIEW_FLAGS.some((f) => /currency/i.test(f)), 'currency question is closed')
  assert.match(faq('one-off-and-single-video'), /\$3,000.*\$5,400/)
  assert.ok(!/euro|EUR|€/i.test(faq('one-off-and-single-video')), 'no currency mix-up text')
  assert.ok(SINGLE_VIDEOS.sold === false && /does not sell individual paid videos/.test(SINGLE_VIDEOS.statement))
})

test('VAT: every price excludes VAT, with the confirmed sentence', () => {
  assert.equal(TAX.pricesExcludeVat, true)
  assert.equal(TAX.statement, 'All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.')
  assert.equal(faq('vat'), TAX.statement)
  assert.ok(!/reverse.?charge|VAT (registration )?number/i.test(TAX.statement + read('src/components/pricing/PartnershipTerms.jsx')), 'no invented tax treatment')
})

test('usage rights: 6 months worldwide from delivery; expiry rules; not a copyright transfer', () => {
  assert.equal(USAGE_RIGHTS.includedMonths, 6)
  assert.equal(USAGE_RIGHTS.scope, 'Worldwide')
  assert.match(USAGE_RIGHTS.startsOn, /date each video is delivered/)
  assert.deepEqual(USAGE_RIGHTS.includedUses.slice(0, 3), ['Paid advertising', 'Organic social media publishing', 'Website usage'])
  assert.ok(USAGE_RIGHTS.afterExpiry.mayRemain.some((t) => /organic social media posts may remain published/.test(t)))
  assert.ok(USAGE_RIGHTS.afterExpiry.mayRemain.some((t) => /website video placements may remain online/.test(t)))
  assert.ok(USAGE_RIGHTS.afterExpiry.mustStop.some((t) => /Paid advertising use must stop/.test(t)))
  assert.ok(USAGE_RIGHTS.afterExpiry.mustStop.some((t) => /cannot be reshared or republished/.test(t)))
  assert.match(USAGE_RIGHTS.notOwnership, /not a transfer of copyright ownership/)
  assert.ok(!/(copyright|ownership) (is|will be) transferred|you (own|will own) the (copyright|videos)/i.test(JSON.stringify(USAGE_RIGHTS) + PRICING_FAQ.map(faqAnswerText).join(' ')))
})

test('usage-rights extensions (entire batch, excl. VAT): exact prices for both packages; perpetual is custom', () => {
  const table = (p) => p.usageExtensions.map((e) => [e.months, e.price.amount, e.price.currency])
  assert.deepEqual(table(SPRINT), [[3, 625, 'USD'], [6, 1000, 'USD'], [12, 1750, 'USD']])
  assert.deepEqual(table(SPRINT_PLUS), [[3, 1125, 'USD'], [6, 1800, 'USD'], [12, 3150, 'USD']])
  const a = faq('usage-rights-expiry-extension')
  for (const p of ['$625', '$1,000', '$1,750', '$1,125', '$1,800', '$3,150']) assert.ok(a.includes(p), p)
  assert.match(a, /entire creative batch/)
  assert.match(a, /exclude VAT/)
  assert.match(faq('perpetual-usage'), /subject to agreement with the featured creator or creators/)
  assert.ok(!/$\s?[\d,]+.{0,40}perpetual/i.test(faq('perpetual-usage')), 'perpetual has no fixed price')
})

test('creator-account advertising (Spark Ads / partnership ads): separate, not automatic, not indefinite', () => {
  const a = faq('spark-ads')
  assert.match(a, /TikTok Spark Ads/)
  assert.match(a, /Meta partnership ads/)
  assert.match(a, /separate from the standard usage rights/)
  assert.match(a, /not included automatically in every package/)
  assert.match(a, /not granted indefinitely/)
  assert.match(a, /confirmed individually/)
})

test('raw footage: ONLY an optional $250-per-concept add-on; every video is edited; no raw-only package or selector', () => {
  assert.deepEqual(RAW_FOOTAGE.price, { amount: 250, currency: 'USD' })
  assert.equal(RAW_FOOTAGE.per, 'creative concept')
  assert.equal(RAW_FOOTAGE.addOnOnly, true)
  assert.match(RAW_FOOTAGE.policy, /professionally edited, finished video/)
  assert.match(RAW_FOOTAGE.policy, /do not offer raw-only production packages or raw footage in place of edited deliverables/)
  const a = faq('raw-footage')
  assert.ok(a.startsWith('We offer raw footage exclusively as an optional add-on at $250 per creative concept.'))
  assert.match(a, /never as a replacement/)
  assert.match(a, /does not by itself transfer copyright ownership, unlimited editing rights or perpetual usage rights/)
  // Same policy on the page, in JSON-LD, with the same price; no selector UI and no second raw price.
  const svc = graph().find((n) => n.name === 'Raw footage add-on')
  assert.equal(svc.offers.length, 1)
  assert.equal(svc.offers[0].priceSpecification.price, 250)
  assert.equal(svc.offers[0].priceSpecification.priceCurrency, 'USD')
  assert.equal(svc.offers[0].priceSpecification.referenceQuantity.unitText, 'creative concept')
  assert.match(svc.description, /do not offer raw-only production packages/)
  assert.deepEqual(svc.isRelatedTo.map((r) => r['@id'].split('#service-')[1]), ['creative-testing-sprint', 'creative-testing-sprint-plus'])
  const ui = read('src/components/pricing/ProductionTerms.jsx') + read('src/components/CreativeTestingOffer.jsx')
  assert.ok(!/type="(radio|checkbox)"|<select|raw-only|rawOnly|raw footage only/i.test(ui), 'no raw-vs-edited selector')
  assert.match(read('src/components/pricing/ProductionTerms.jsx'), /RAW_FOOTAGE\.policy/)
  const everything = JSON.stringify(graph()) + PRICING_FAQ.map(faqAnswerText).join(' ')
  const rawPrices = [...everything.matchAll(/raw footage[^.]{0,60}?\$([\d,]+)/gi)].map((m) => m[1])
  assert.ok(rawPrices.length >= 3 && rawPrices.every((p) => p === '250'), `raw footage prices found: ${rawPrices}`)
})

test('turnaround starts at concept/script approval, never at payment', () => {
  assert.match(TURNAROUND.startsAt, /approved the creative concepts and scripts/)
  assert.match(faq('turnaround-start'), /not when payment is made/)
  assert.ok(!/(begins|starts?) (immediately )?(on|upon|after) payment/i.test(PRICING_FAQ.map(faqAnswerText).join(' ')))
})

test('revisions: 2 rounds per concept, explicitly not unlimited and not per variation', () => {
  assert.equal(REVISIONS.roundsPerConcept, 2)
  assert.match(faq('revisions'), /Two rounds of revisions are included per creative concept/)
  assert.match(faq('revisions'), /not unlimited/)
  assert.match(faq('revisions'), /not two separate rounds for every individual variation/)
})

test('reshoots: CONVRT covers its own failures; client-driven reshoots are charged; never "all free"', () => {
  assert.match(RESHOOTS.weCover, /examples of each creator.s work before production/)
  assert.match(RESHOOTS.weCover, /CONVRT covers the corrective production or reshoot/)
  assert.match(RESHOOTS.clientPays, /charged in full/)
  assert.match(RESHOOTS.clientPays, /consistent with the approved examples and the agreed brief/)
  assert.match(RESHOOTS.clientPays, /separately paid production/)
  assert.ok(!/free reshoots?|unlimited reshoots?/i.test(faq('reshoots')))
})

test('formats: up to 60s, 1:1 and 4:5 included, 16:9 separate, long-form custom, native-format approach, nothing "unlimited"', () => {
  assert.equal(FORMATS.standardMaxSeconds, 60)
  assert.deepEqual(FORMATS.included, ['Square 1:1 reframing', 'Portrait 4:5 reframing'])
  assert.match(FORMATS.separateDeliverable, /16:9.*separate video/)
  assert.match(FORMATS.longForm, /one to three minutes.*custom prices/)
  assert.match(FORMATS.nativeApproach, /rather than shooting horizontal footage and cropping/)
  assert.deepEqual(FORMATS.fullProductionIncludes, ['Filming', 'Editing', 'Captions', 'B-roll', 'Motion graphics', 'Agreed creative variations'])
  const all = PRICING_FAQ.map(faqAnswerText).join(' ') + JSON.stringify(graph())
  assert.ok(!/unlimited (formats|variations|reshoots)/i.test(all))
})

test('production process: the 8 confirmed steps, in order; physical and SaaS product requirements', () => {
  assert.equal(PRODUCTION_PROCESS.length, 8)
  const keys = [/discovery/i, /research/i, /concepts and hooks/i, /creator selection/i, /script/i, /approval/i, /filming and editing/i, /delivery and revisions/i]
  keys.forEach((re, i) => assert.match(PRODUCTION_PROCESS[i].title, re, `step ${i + 1}`))
  assert.match(PRODUCT_REQUIREMENTS.physical, /ship the product to the selected creator and cover the shipping costs/)
  assert.match(PRODUCT_REQUIREMENTS.saas, /dedicated demo or dummy account/)
  assert.match(PRODUCT_REQUIREMENTS.saas, /test data/)
})

test('Organic Growth is $2,500/month (Light $1,500): old $2,000 price gone from data, FAQ and JSON-LD', () => {
  assert.equal(ORGANIC.growth.monthly.amount, 2500)
  assert.equal(ORGANIC.light.monthly.amount, 1500)
  const all = JSON.stringify(ORGANIC) + PRICING_FAQ.map(faqAnswerText).join(' ') + JSON.stringify(graph())
  assert.ok(!/\$2,000|2000/.test(all), 'previous Organic Growth price must not remain')
  assert.match(faq('organic-included'), /Organic Growth is \$2,500\/month/)
  assert.match(faq('organic-included'), /Organic Light is \$1,500\/month/)
  const growth = graph().find((n) => n.name === 'Organic Growth')
  assert.equal(growth.offers[0].priceSpecification.price, 2500)
  assert.equal(growth.offers[0].priceSpecification.priceCurrency, 'USD')
  assert.match(growth.offers[0].description, /^\$2,500 per month, excluding VAT/)
})

test('both organic packages include content scheduling and posting + organic community management, with no invented commitments', () => {
  assert.deepEqual(ORGANIC.includedInBoth, ['Content scheduling and posting', 'Organic community management'])
  assert.match(ORGANIC.communityManagement, /social media engagement and brand relationship management/)
  assert.match(ORGANIC.communityManagement, /subject to the applicable agreement/)
  const cards = read('src/components/pricing/PricingCards.jsx')
  // One shared() builder feeds BOTH the Light and Growth cards, so neither can drop them.
  assert.match(cards, /const shared = \(extra\) => \[[\s\S]*ORGANIC\.includedInBoth\[0\][\s\S]*ORGANIC\.includedInBoth\[1\]/)
  assert.equal((cards.match(/features=\{shared\(/g) || []).length, 2, 'Light and Growth both use it')
  for (const n of graph().filter((x) => /^Organic (Light|Growth)$/.test(x.name))) {
    assert.match(n.description, /content scheduling and posting and organic community management/)
  }
  assert.match(faq('organic-included'), /Both packages include content scheduling and posting and organic community management/)
  assert.match(faq('organic-included'), /Customer support is not part of the service/)
  const copy = JSON.stringify(ORGANIC) + faq('organic-included') + read('src/components/pricing/OrganicScope.jsx').replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!/response[- ]time|within \d+ hours?|monitoring hours|24\/7|replies? within|guarantee/i.test(copy), 'no response-time / monitoring-hours commitments')
})

test('organic: existing prices and post counts preserved; confirmed scope, platforms and exclusions', () => {
  assert.deepEqual(ORGANIC_PACKAGES.map((p) => [p.name, p.monthly.amount, p.monthly.currency]), [['Organic Light', 1500, 'USD'], ['Organic Growth', 2500, 'USD']])
  assert.match(ORGANIC.light.cadence, /2 posts per week, approximately 9 original posts per month/)
  assert.match(ORGANIC.growth.cadence, /3 posts per week, 13 original posts per month/)
  assert.deepEqual(ORGANIC.platforms, ['Facebook', 'Instagram', 'TikTok'])
  assert.equal(ORGANIC.scope.length, 9)
  assert.ok(ORGANIC.excluded.some((t) => /Customer support is not part of the service/.test(t)))
  assert.ok(ORGANIC.excluded.some((t) => /Paid advertising management is outside/.test(t)))
  assert.ok(!/LinkedIn/.test(read('src/components/CreativeTestingOffer.jsx')), 'LinkedIn is not a confirmed platform')
})

test('brand + talent + languages: verbatim confirmed information, nothing invented', () => {
  assert.equal(BRAND.name, 'CONVRT Studio')
  assert.equal(BRAND.url, 'https://www.convrt.studio')
  assert.equal(BRAND.motto, 'Real creators. Authentic delivery. Performance-driven creative.')
  assert.match(BRAND.description, /^CONVRT is a creative video marketing studio specializing in human-led UGC advertising, spokesperson videos and organic social media content for brands\./)
  assert.deepEqual(PRODUCTION_LANGUAGES.core, ['English', 'Spanish', 'French', 'Arabic'])
  assert.ok(!/\b\d+\s*(creators|offices|countries)\b/i.test(JSON.stringify(BRAND)), 'no invented counts')
})

test('pricing page copy is data-driven: package prices are not typed into the components', () => {
  const offer = read('src/components/CreativeTestingOffer.jsx') + read('src/components/pricing/PricingCards.jsx')
  for (const literal of ['2,500', '4,500', '1,500', '3,000', '5,400', '2,000', '250']) assert.ok(!offer.includes(literal), `hard-coded ${literal}`)
  for (const f of ['UsageRights', 'PartnershipTerms', 'SharedBenefits', 'ProductionTerms']) {
    assert.ok(!/[$$]\s?\d/.test(read(`src/components/pricing/${f}.jsx`)), `${f} hard-codes a price`)
  }
})

// ── FAQ ─────────────────────────────────────────────────────────────────────────────────
test('FAQ: 12-15 unique, answered questions covering the commercially important topics', () => {
  assert.ok(PRICING_FAQ.length >= 12 && PRICING_FAQ.length <= 15, `${PRICING_FAQ.length} questions`)
  assert.equal(new Set(PRICING_FAQ.map((f) => f.id)).size, PRICING_FAQ.length)
  assert.equal(new Set(PRICING_FAQ.map((f) => f.q)).size, PRICING_FAQ.length)
  for (const f of PRICING_FAQ) assert.ok(f.q.endsWith('?') && f.a.length >= 1 && f.a.every((p) => p.length > 20), f.id)
  for (const id of ['concept-vs-variation', 'whats-included', 'minimum-commitment', 'one-off-and-single-video', 'turnaround-start', 'revisions', 'usage-rights-included', 'usage-rights-expiry-extension', 'perpetual-usage', 'spark-ads', 'raw-footage', 'reshoots', 'formats-and-length', 'vat']) {
    assert.ok(PRICING_FAQ.some((f) => f.id === id), id)
  }
  assert.match(faq('concept-vs-variation'), /distinct advertising angle or idea/)
  assert.match(faq('concept-vs-variation'), /different hook or call to action/)
})

test('FAQ: no answer promises results or rankings', () => {
  const all = PRICING_FAQ.map(faqAnswerText).join(' ')
  assert.ok(!/guarantee(s|d)? (results|roas|sales|rankings?)/i.test(all.replace(/never guarantee specific results/i, '')))
})

// ── JSON-LD ─────────────────────────────────────────────────────────────────────────────
test('pricing JSON-LD: serialises to valid JSON; one @graph; expected node types', () => {
  const doc = pricingGraph({ title: 't', description: 'd' })
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(doc)))
  assert.equal(doc['@context'], 'https://schema.org')
  const types = graph().map((n) => n['@type'])
  for (const t of ['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage']) assert.ok(types.includes(t), t)
  assert.equal(types.filter((t) => t === 'Service').length, 10, '3 core + 2 creative testing + 2 organic + raw footage add-on + 2 custom (no price)')
  assert.ok(!types.includes('Product'), 'services must not be marked up as Product')
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed/.test(JSON.stringify(graph())), 'nothing invented')
})

test('JSON-LD entity ids are stable and every @id reference resolves inside the graph', () => {
  assert.equal(ORG_ID, `${SITE_URL}/#organization`)
  assert.equal(WEBSITE_ID, `${SITE_URL}/#website`)
  const nodes = graph()
  const defined = new Set(nodes.map((n) => n['@id']).filter(Boolean))
  defined.add(WEBSITE_ID) // WebPage.isPartOf points at the site entity, defined on the homepage
  const refs = []
  const walk = (v, isNode) => {
    if (Array.isArray(v)) return v.forEach((x) => walk(x))
    if (v && typeof v === 'object') {
      const keys = Object.keys(v)
      if (keys.length === 1 && keys[0] === '@id') refs.push(v['@id'])
      Object.values(v).forEach((x) => walk(x))
    }
  }
  walk(nodes)
  assert.ok(refs.length > 10)
  for (const r of refs) assert.ok(defined.has(r), `dangling reference ${r}`)
  // Ids are unique.
  const ids = nodes.map((n) => n['@id']).filter(Boolean)
  assert.equal(new Set(ids).size, ids.length)
  // Same ids produced on every call (stability across builds).
  assert.deepEqual(graph().map((n) => n['@id']), nodes.map((n) => n['@id']))
})

test('USD everywhere: no € / EUR / euro in pricing data, components, FAQ or JSON-LD; every priceCurrency is USD', () => {
  const data = JSON.stringify({ SPRINT, SPRINT_PLUS, RAW_FOOTAGE, ORGANIC_PACKAGES }) + PRICING_FAQ.map(faqAnswerText).join(' ') + JSON.stringify(graph())
  assert.ok(!/€|\bEUR\b|euros?\b/i.test(data))
  const currencies = [...JSON.stringify(graph()).matchAll(/"priceCurrency":"([A-Z]+)"/g)].map((m) => m[1])
  assert.equal(currencies.length, 7, '2 Sprint packages x (monthly + one-off) + 2 organic monthly + raw footage add-on')
  assert.ok(currencies.every((c) => c === 'USD'))
  // Whole site: no € in any source file (the only "European" hits are a case-study description of Graspo).
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  for (const f of [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'api')), path.join(ROOT, 'index.html')].filter((x) => /\.(jsx?|html|md)$/.test(x))) {
    const t = fs.readFileSync(f, 'utf8')
    assert.ok(!/€/.test(t), `${path.relative(ROOT, f)} contains €`)
    assert.ok(!/\bEUR\b|\beuros?\b/i.test(t.replace(/priceCurrency/g, '')), `${path.relative(ROOT, f)} mentions euros`)
  }
})

test('Organization: verified facts only (name, url, description, logo, Instagram, email, languages)', () => {
  const org = graph().find((n) => n['@type'] === 'Organization')
  assert.equal(org.name, 'CONVRT Studio')
  assert.equal(org.url, SITE_URL)
  assert.equal(org['@id'], ORG_ID)
  assert.equal(org.slogan, BRAND.motto)
  assert.equal(org.logo.url, `${SITE_URL}/convrt-logo.svg`)
  assert.ok(fs.existsSync(path.join(ROOT, 'public', 'convrt-logo.svg')), 'logo file exists')
  assert.deepEqual(org.sameAs, ['https://www.instagram.com/convrtcreativestudio/'])
  assert.deepEqual(org.knowsLanguage, ['en', 'es', 'fr', 'ar'])
  assert.ok(!org.sameAs.some((u) => /linkedin\.com\/in\//.test(u)), "a founder's personal profile is not the organisation's profile")
})

test('Offers: numeric prices, correct currencies, monthly vs one-off kept apart, never a contract total', () => {
  const svc = (id) => graph().find((n) => n['@id'].endsWith(`#service-${id}`))
  const spec = (s, i) => s.offers[i].priceSpecification
  const sprint = svc('creative-testing-sprint')
  const plus = svc('creative-testing-sprint-plus')
  assert.equal(spec(sprint, 0).price, 2500); assert.equal(spec(sprint, 0).priceCurrency, 'USD'); assert.equal(spec(sprint, 0).unitCode, 'MON')
  assert.equal(spec(sprint, 0)['@type'], 'UnitPriceSpecification')
  assert.equal(spec(sprint, 1).price, 3000); assert.equal(spec(sprint, 1).priceCurrency, 'USD'); assert.equal(spec(sprint, 1).unitCode, undefined)
  assert.equal(spec(plus, 0).price, 4500); assert.equal(spec(plus, 0).priceCurrency, 'USD')
  assert.equal(spec(plus, 1).price, 5400); assert.equal(spec(plus, 1).priceCurrency, 'USD')
  for (const id of ['organic-light', 'organic-growth']) assert.equal(spec(svc(id), 0).unitCode, 'MON')
  assert.equal(spec(svc('organic-light'), 0).price, 1500)
  assert.equal(spec(svc('organic-growth'), 0).price, 2500)
  for (const n of graph().filter((x) => x.offers)) {
    for (const o of n.offers) {
      assert.equal(typeof o.priceSpecification.price, 'number')
      assert.equal(o.priceSpecification.valueAddedTaxIncluded, false)
      // The visible string for the same price uses the same currency symbol.
      assert.equal(o.priceSpecification.priceCurrency, 'USD', o.name)
      const sym = '$'
      assert.ok(o.description.startsWith(`${sym}${String(o.priceSpecification.price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`), o.name)
    }
  }
  assert.ok(!JSON.stringify(graph().map((n) => n.offers)).match(/totalPrice|"price":(7500|13500|7[,.]?500)/), 'monthly price is never presented as the contract total')
})

test('Service nodes relate to the Organization and to the right core service', () => {
  for (const n of graph().filter((x) => x['@type'] === 'Service')) assert.equal(n.provider['@id'], ORG_ID, n.name)
  const sprint = graph().find((n) => n.name === 'Creative Testing Sprint')
  assert.deepEqual(sprint.isRelatedTo.map((r) => r['@id'].split('#service-')[1]), ['ugc', 'spokesperson'])
  const light = graph().find((n) => n.name === 'Organic Light')
  assert.deepEqual(light.isRelatedTo.map((r) => r['@id'].split('#service-')[1]), ['organic'])
})

test('FAQPage JSON-LD is generated from exactly the visible Q&A', () => {
  const node = graph().find((n) => n['@type'] === 'FAQPage')
  assert.equal(node.mainEntity.length, PRICING_FAQ.length)
  node.mainEntity.forEach((q, i) => {
    assert.equal(q.name, PRICING_FAQ[i].q)
    assert.equal(q.acceptedAnswer.text, PRICING_FAQ[i].a.join(' '))
  })
  assert.match(read('src/components/pricing/PricingFAQ.jsx'), /PRICING_FAQ/)
})

test('BreadcrumbList: real hierarchy with canonical absolute URLs', () => {
  const bc = graph().find((n) => n['@type'] === 'BreadcrumbList')
  assert.deepEqual(bc.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'Pricing', `${SITE_URL}/pricing`]])
  assert.deepEqual(Object.keys(BREADCRUMB_TRAILS), ['/pricing'])
})

test('JSON-LD is attached only to the homepage and /pricing; the manifest supplies it with the head', () => {
  assert.equal(jsonLdFor('/scale'), undefined)
  assert.equal(jsonLdFor('/free-hooks'), undefined)
  assert.equal(pageHead('/scale').jsonLd, undefined)
  assert.equal(pageHead('/pricing').jsonLd['@graph'].find((n) => n['@type'] === 'WebPage').url, `${SITE_URL}/pricing`)
  const home = homeGraph()['@graph']
  assert.deepEqual(home.map((n) => n['@type']), ['Organization', 'WebSite'])
  assert.equal(home[1].publisher['@id'], ORG_ID)
  assert.ok(!home[1].potentialAction, 'no SearchAction: the site has no search')
})

test('blog JSON-LD references the shared Organization; drafts/placeholders produce no article markup', () => {
  assert.equal(organizationRef()['@id'], ORG_ID)
  assert.equal(blogIndexJsonLd([]).publisher['@id'], ORG_ID)
  assert.equal(blogIndexJsonLd([]).mainEntity, undefined, 'no ItemList without published articles')
  const meta = { slug: 'x', title: 'X', excerpt: 'E', category: 'creative-strategy', categoryLabel: 'Creative Strategy', status: 'published', author: 'A', publishedAt: '2026-01-10', related: [], faq: [], toc: 'auto', noindex: false }
  const ld = articleJsonLd(meta)
  assert.equal(ld.find((n) => n['@type'] === 'BlogPosting').publisher['@id'], ORG_ID)
  assert.match(read('src/lib/routes/headFor.js'), /articleHead\(meta\)/)
})

// ── metadata ────────────────────────────────────────────────────────────────────────────
test('pricing metadata: new title/description, canonical, indexable', () => {
  const h = pageHead('/pricing')
  assert.equal(h.title, 'UGC & Video Production Pricing | CONVRT Studio')
  assert.equal(h.description, "Explore CONVRT's UGC, video ad and social media production packages, with clear pricing, creative deliverables, usage rights and revision policies.")
  assert.equal(h.url, `${SITE_URL}/pricing`)
  assert.equal(h.noindex, false)
  assert.ok(h.description.length <= 160 && h.title.length <= 60)
})

test('crawler policy is unchanged: everything crawlable, only /api/ blocked, no model-training bots touched', () => {
  const txt = read('public/robots.txt')
  assert.deepEqual([...txt.matchAll(/^Disallow:\s*(.*)$/gm)].map((m) => m[1].trim()), ['/api/'])
  assert.ok(!/GPTBot|CCBot|Google-Extended|ClaudeBot|anthropic|OAI-SearchBot|PerplexityBot/i.test(txt))
})

// ── three-card redesign ─────────────────────────────────────────────────────────────────
import { BILLING_OPTIONS, PARTNERSHIP_TERMS, CUSTOM_PACKAGES, SHARED_SPRINT_BENEFITS, SHARED_SPRINT_NOTE } from '../src/seo/businessKnowledge.js'
import { OFFER_PATHS } from '../src/config.js'

test('billing selector: Monthly partnership (default) and One-off project; prices come from the central config', () => {
  assert.deepEqual(BILLING_OPTIONS.map((o) => [o.id, o.label, o.unit]), [['monthly', 'Monthly partnership', '/month'], ['oneOff', 'One-off project', '/project']])
  assert.match(read('src/components/CreativeTestingOffer.jsx'), /useState\('monthly'\)/)
  const cards = read('src/components/pricing/PricingCards.jsx')
  assert.match(cards, /formatMoney\(pkg\[o\.id\]\)/, 'price = config[billing]')
  assert.equal(SPRINT[BILLING_OPTIONS[0].id].amount, 2500); assert.equal(SPRINT[BILLING_OPTIONS[1].id].amount, 3000)
  assert.equal(SPRINT_PLUS[BILLING_OPTIONS[0].id].amount, 4500); assert.equal(SPRINT_PLUS[BILLING_OPTIONS[1].id].amount, 5400)
  assert.ok(!/BillingSwitch/.test(read('src/components/CreativeTestingOffer.jsx').split('service-panel-organic')[1]), 'no billing selector on Organic')
  assert.ok(!/oneOff|one-off/i.test(cards.slice(cards.indexOf('export function OrganicCards'), cards.indexOf('export function BillingSwitch'))), 'no organic one-off prices')
  assert.ok(!/discount|save \d|% off|savings?/i.test(cards + JSON.stringify(PARTNERSHIP_TERMS)), 'no discount or savings claims')
})

test('partnership terms: exact approved compact wording', () => {
  assert.equal(PARTNERSHIP_TERMS.monthly, "Initial 3-month commitment, followed by a flexible month-to-month agreement with 30 days' cancellation notice.")
  assert.equal(PARTNERSHIP_TERMS.oneOff, 'One creative production batch, without a recurring commitment.')
})

test('Custom packages: no numerical price anywhere, scope agreed individually, existing Roadmap CTA', () => {
  for (const pkg of Object.values(CUSTOM_PACKAGES)) {
    assert.equal(pkg.priceLabel, "Let's talk.")
    assert.equal(pkg.supportingLabel, 'Tailored to your needs')
    assert.equal(pkg.cta, 'Discuss your project')
    assert.ok(!/[$€]|\d/.test(JSON.stringify(pkg)), 'no number in a custom package')
    assert.match(pkg.note, /agreed individually/)
  }
  assert.deepEqual(CUSTOM_PACKAGES.paid.features, ['Custom creative strategy', 'Flexible production volume', 'Tailored creator selection', 'Multilingual campaigns', 'SaaS demos and explainers', 'Long-form video production', 'Custom licensing options'])
  assert.match(CUSTOM_PACKAGES.paid.note, /not deliverables included in every project/)
  assert.match(CUSTOM_PACKAGES.organic.features.join(' '), /Facebook, Instagram and TikTok/)
  const nodes = graph().filter((n) => /^Custom /.test(n.name))
  assert.equal(nodes.length, 2)
  for (const n of nodes) {
    assert.equal(n.offers, undefined, 'a Custom service carries no Offer')
    assert.ok(!/\$\d/.test(JSON.stringify(n)), 'no price in a Custom service')
    assert.match(n.description, /agreed individually/)
    assert.equal(n.provider['@id'], ORG_ID)
  }
  const cards = read('src/components/pricing/PricingCards.jsx')
  assert.match(cards, /OFFER_PATHS\.roadmap/)
  assert.ok(!/calendly|mailto:|<form|BOOKING_URL/i.test(cards), 'no new booking integration or contact funnel')
  assert.equal(OFFER_PATHS.roadmap, '/creative-growth-roadmap')
})

test('cards: Sprint 7 + Sprint Plus 8 approved features from the config; no identical-variations implication', () => {
  const cards = read('src/components/pricing/PricingCards.jsx')
  for (const needle of ['distinct creative concepts', 'complete scripts', 'variations per concept, changing the hook or CTA', '1 creator or spokesperson', 'Expanded creative variations', 'Up to 2 creators or spokespeople', 'Priority production scheduling', 'SPRINT_PLUS.extraDetail']) {
    assert.ok(cards.includes(needle), needle)
  }
  assert.match(SPRINT.cardDescription, /^For brands ready to discover new creative angles and find what resonates\.$/)
  assert.match(SPRINT_PLUS.cardDescription, /^For brands looking for greater creative diversity and deeper testing\.$/)
  assert.match(SPRINT_PLUS.extraDetail, /expanded creative research and expanded testing recommendations/)
  const plusBlock = cards.slice(cards.indexOf('const plusFeatures'), cards.indexOf('const custom = CUSTOM_PACKAGES.paid'))
  assert.ok(!/per concept.*variation|variations? (per|for each|every) concept/i.test(plusBlock.replace(/revision rounds per creative concept/g, '')), 'Sprint Plus must not state a per-concept variation count')
})

test('shared benefits: the 7 approved items, for standard Sprints only', () => {
  assert.deepEqual(SHARED_SPRINT_BENEFITS.map((b) => b.label), ['Creative research and strategy', 'Concepts, scripts and client approval', 'Creator selection', 'Filming and professional editing', 'Captions, B-roll and motion graphics as agreed', 'Square and 4:5 reframing', 'Agreed creative variations and testing recommendations'])
  assert.match(SHARED_SPRINT_NOTE, /Custom packages have separately agreed production scopes/)
  assert.match(read('src/components/pricing/SharedBenefits.jsx'), /Every Sprint includes/)
})

test('internal owner-review flags are never rendered', () => {
  const ui = ['CreativeTestingOffer', 'pricing/PricingCards', 'pricing/UsageRights', 'pricing/ProductionTerms', 'pricing/OrganicScope', 'pricing/PartnershipTerms', 'pricing/SharedBenefits'].map((f) => read(`src/components/${f}.jsx`)).join('\n')
  assert.ok(!/OWNER_REVIEW_FLAGS/.test(ui))
})
