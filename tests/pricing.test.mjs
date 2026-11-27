// Run with: node --test tests/pricing.test.mjs
// SEO/GEO phase 1: the business knowledge base, the pricing FAQ and the JSON-LD built from them.
// Pure checks (no build). The raw-HTML checks on the built /pricing page live in tests/prerender.test.mjs.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { readSource } from './helpers/i18nSource.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BRAND, SPRINT, SPRINT_PLUS, COMMITMENT, TAX, USAGE_RIGHTS, RAW_FOOTAGE, REVISIONS, RESHOOTS, FORMATS, TURNAROUND,
  ORGANIC, ORGANIC_PACKAGES, PRODUCTION_PROCESS, PRODUCT_REQUIREMENTS, SINGLE_VIDEOS, PRODUCTION_LANGUAGES, OWNER_REVIEW_FLAGS, formatMoney,
} from '../src/seo/businessKnowledge.js'
import { PRICING_FAQ, faqAnswerText } from '../src/seo/pricingFaq.js'
import {
  ORG_ID, WEBSITE_ID, homeGraph, pricingGraph, jsonLdFor, organizationRef, BREADCRUMB_TRAILS, serviceId,
} from '../src/seo/structuredData.js'
import { SITE_SEO, pageHead } from '../src/seo/siteSeo.js'
import { articleJsonLd, blogIndexJsonLd } from '../src/lib/blog/seo.js'
import { SITE_URL, BOOKING_URL } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readSource(path.join(ROOT, p))
const faq = (id) => faqAnswerText(PRICING_FAQ.find((f) => f.id === id))
const graph = () => pricingGraph({ title: SITE_SEO['/pricing'].title, description: SITE_SEO['/pricing'].description })['@graph']

// ── confirmed commercial policy ─────────────────────────────────────────────────────────
test('Sprint: $3,000/month, 5 concepts x 3 variations = 15, 10 business days, 2 revision rounds, 6 months usage', () => {
  assert.deepEqual(SPRINT.monthly, { amount: 3000, currency: 'USD' })
  assert.equal(SPRINT.concepts, 5)
  assert.equal(SPRINT.variationsPerConcept, 3)
  assert.equal(SPRINT.variations, SPRINT.concepts * SPRINT.variationsPerConcept)
  assert.equal(SPRINT.variations, 15)
  assert.equal(SPRINT.turnaroundBusinessDays, 10)
  assert.equal(SPRINT.revisionRoundsPerConcept, 2)
  assert.equal(SPRINT.usageMonthsIncluded, 6)
})

test('Sprint Plus: $5,000/month, 30 variations, 15 business days, 2 revision rounds, 6 months usage', () => {
  assert.deepEqual(SPRINT_PLUS.monthly, { amount: 5000, currency: 'USD' })
  assert.equal(SPRINT_PLUS.variations, 30)
  assert.equal(SPRINT_PLUS.turnaroundBusinessDays, 15)
  assert.equal(SPRINT_PLUS.revisionRoundsPerConcept, 2)
  assert.equal(SPRINT_PLUS.usageMonthsIncluded, 6)
})

test('Sprint 5/5/3/15 and Sprint Plus 10/10/3/30 (approved offer): config, cards, FAQ, JSON-LD and diagram text agree', () => {
  assert.deepEqual([SPRINT.concepts, SPRINT.scripts, SPRINT.variationsPerConcept, SPRINT.variations], [5, 5, 3, 15])
  assert.deepEqual([SPRINT_PLUS.concepts, SPRINT_PLUS.scripts, SPRINT_PLUS.variationsPerConcept, SPRINT_PLUS.variations], [10, 10, 3, 30])
  assert.equal(SPRINT_PLUS.variations, SPRINT_PLUS.concepts * SPRINT_PLUS.variationsPerConcept)
  assert.equal(SPRINT.variations, SPRINT.concepts * SPRINT.variationsPerConcept)
  assert.equal(SPRINT_PLUS.valueLine, 'Twice the creative concepts. Twice the finished ad versions.')
  assert.equal(SPRINT_PLUS.turnaroundBusinessDays, 15); assert.equal(SPRINT_PLUS.revisionRoundsPerConcept, 2); assert.equal(SPRINT_PLUS.usageMonthsIncluded, 6)
  assert.ok(!('variationsDistribution' in SPRINT_PLUS) && typeof SPRINT_PLUS.concepts === 'number', 'the uneven-distribution structure is gone')
  const offer = read('src/components/pricing/PricingCards.jsx')
  assert.match(offer, /\$\{SPRINT_PLUS\.concepts\} distinct creative concepts/)
  assert.match(offer, /\$\{SPRINT_PLUS\.scripts\} complete scripts/)
  assert.match(offer, /\$\{SPRINT_PLUS\.variationsPerConcept\} versions per concept, changing the hook or CTA/)
  assert.match(offer, /conceptLine\(SPRINT_PLUS\)/) // both cards share one concept line; the Plus value line is no longer shown on the card
  assert.match(faq('whats-included'), /Creative Testing Sprint Plus is \$5,000\/month for 10 concepts and 30 finished ad versions/)
  assert.match(faq('concept-vs-variation'), /Creative Testing Sprint Plus includes 10 concepts with 3 versions each, 30 finished ad versions in total/)
  const svc = graph().find((n) => n.name === 'Creative Testing Sprint Plus')
  assert.match(svc.description, /^10 distinct creative concepts with 3 versions each \(30 finished ad versions\)/)
  const std = graph().find((n) => n.name === 'Creative Testing Sprint')
  assert.match(std.description, /^5 distinct creative concepts with 3 versions each \(15 finished ad versions\)/)
  // the visible package copy and the structured data say the same thing
  for (const n of [svc, std]) assert.ok(n.offers.length === 2)
  const philoSrc = read('src/components/pricing/PhilosophySection.jsx')
  assert.match(philoSrc, /SPRINT\.concepts/)
  assert.ok(!/SPRINT_PLUS/.test(philoSrc.slice(philoSrc.indexOf('function ConceptColumn'), philoSrc.indexOf('const SEQ_ICONS'))), 'the diagram columns are the standard Sprint only')
  assert.match(philoSrc, /Standard Sprint shown\. Sprint Plus includes \$?\{SPRINT_PLUS\.concepts\} concepts and \$?\{SPRINT_PLUS\.variations\} finished ad versions\./)
})

test('no obsolete 8-concept / uneven-distribution Sprint Plus wording anywhere in active source', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  const files = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'docs')), path.join(ROOT, 'CLAUDE.md')].filter((f) => /\.(jsx?|md|html)$/.test(f) && !/case-studies|graspo|elyon|referral|blog/i.test(f))
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8')
    assert.ok(!/\b8 (distinct )?(creative )?concepts|\b8 (complete )?scripts|eight (distinct )?(creative )?concepts/i.test(t), `${path.relative(ROOT, f)}: obsolete 8-concept reference`)
    assert.ok(!/strategically distributed|variationsDistribution|distributed across (the|its) concepts|not necessarily have the same number/i.test(t), `${path.relative(ROOT, f)}: obsolete uneven-distribution wording`)
  }
})

test('monthly commitment: 3 months, then month-to-month, 30 days notice; no guaranteed results', () => {
  assert.equal(COMMITMENT.initialMonths, 3)
  assert.equal(COMMITMENT.cancellationNoticeDays, 30)
  assert.match(COMMITMENT.summary, /initial three-month commitment.*month-to-month.*30 days' cancellation notice/)
  assert.match(COMMITMENT.rationale, /never guarantee/)
  assert.match(faq('minimum-commitment'), /three-month commitment/)
})

test('one-off prices are $3,500 and $6,000 in USD, monthly in EUR: currencies preserved, never converted', () => {
  assert.deepEqual(SPRINT.oneOff, { amount: 3500, currency: 'USD' })
  assert.deepEqual(SPRINT_PLUS.oneOff, { amount: 6000, currency: 'USD' })
  assert.equal(formatMoney(SPRINT.oneOff), '$3,500')
  assert.equal(formatMoney(SPRINT_PLUS.oneOff), '$6,000')
  assert.equal(formatMoney(SPRINT.monthly), '$3,000')
  assert.ok(!OWNER_REVIEW_FLAGS.some((f) => /currency/i.test(f)), 'currency question is closed')
  assert.match(faq('one-off-and-single-video'), /\$3,500.*\$6,000/)
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
  assert.deepEqual(table(SPRINT), [[3, 937.5, 'USD'], [6, 1500, 'USD'], [12, 2625, 'USD']])
  assert.deepEqual(table(SPRINT_PLUS), [[3, 1687.5, 'USD'], [6, 2700, 'USD'], [12, 4725, 'USD']])
  const a = faq('usage-rights-expiry-extension')
  for (const p of ['$937.50', '$1,500', '$2,625', '$1,687.50', '$2,700', '$4,725']) assert.ok(a.includes(p), p)
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
  const ui = read('src/components/pricing/InfoPanels.jsx') + read('src/components/pricing/PricingStage.jsx') + read('src/components/pricing/PricingCards.jsx')
  assert.ok(!/type="(radio|checkbox)"|<select|raw-only|rawOnly|raw footage only/i.test(ui), 'no raw-vs-edited selector')
  assert.match(RAW_FOOTAGE.summary, /only available alongside finished, professionally edited videos\. It cannot replace them\./)
  assert.match(RAW_FOOTAGE.shortNote, /Optional add-on to finished videos\./)
  assert.match(read('src/components/pricing/InfoPanels.jsx'), /RAW_FOOTAGE\.shortNote/)
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
  const copy = JSON.stringify(ORGANIC) + faq('organic-included') + read('src/components/pricing/InfoPanels.jsx').replace(/\/\*[\s\S]*?\*\//g, '')
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
  assert.ok(!/LinkedIn/.test(read('src/components/pricing/PricingCards.jsx') + read('src/components/pricing/InfoPanels.jsx')), 'LinkedIn is not a confirmed platform')
})

test('brand + talent + languages: verbatim confirmed information, nothing invented', () => {
  assert.equal(BRAND.name, 'CONVRT Studio')
  assert.equal(BRAND.url, 'https://www.convrt.studio')
  assert.equal(BRAND.motto, 'Real creators. Authentic delivery. Performance-driven creative.')
  assert.match(BRAND.description, /^CONVRT is a creative video marketing studio specializing in human-led UGC advertising, SaaS video production, spokesperson videos and organic social media content for brands\./)
  assert.deepEqual(PRODUCTION_LANGUAGES.core, ['English', 'Spanish', 'French', 'Arabic'])
  assert.ok(!/\b\d+\s*(creators|offices|countries)\b/i.test(JSON.stringify(BRAND)), 'no invented counts')
})

test('pricing page copy is data-driven: package prices are not typed into the components', () => {
  const offer = read('src/components/pricing/PricingStage.jsx') + read('src/components/pricing/PricingCards.jsx')
  for (const literal of ['2,500', '4,500', '5,000', '1,500', '3,000', '3,500', '5,400', '6,000', '2,000', '250']) assert.ok(!offer.includes(literal), `hard-coded ${literal}`)
  for (const f of ['InfoPanels', 'PartnershipTerms', 'PhilosophySection']) {
    assert.ok(!/[$$]\s?\d/.test(read(`src/components/pricing/${f}.jsx`)), `${f} hard-codes a price`)
  }
})

// ── FAQ ─────────────────────────────────────────────────────────────────────────────────
test('FAQ: 12-18 unique, answered questions covering the commercially important topics', () => {
  assert.ok(PRICING_FAQ.length >= 12 && PRICING_FAQ.length <= 18, `${PRICING_FAQ.length} questions`)
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
  assert.equal(types.filter((t) => t === 'Service').length, 11, '4 core (UGC, SaaS, Spokesperson, Organic) + 2 creative testing + 2 organic + raw footage add-on + 2 custom (no price)')
  assert.ok(!types.includes('Product'), 'services must not be marked up as Product')
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed/.test(JSON.stringify(graph()).replace('"address":{"@type":"PostalAddress","addressCountry":"ES"}', '')), 'nothing invented (the Organization carries only the country of registration)')
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
  // The Spanish site has its own EUR pricing (src/i18n/es/*): the USD rule is about the English business data, components, FAQ, JSON-LD and API.
  for (const f of [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'api')), path.join(ROOT, 'index.html')].filter((x) => /\.(jsx?|html|md)$/.test(x) && !x.includes(`${path.sep}i18n${path.sep}`) && !x.endsWith(`${path.sep}contactCopy.js`) && !x.endsWith(`${path.sep}contactInquiry.js`) && !/projectApplication\.js$/.test(x) && !x.includes(`${path.sep}content${path.sep}legal${path.sep}`))) { // content/legal/*: the Spanish and French Legal Notice states that prices are in euros (owner, 27 Nov 2026: everything in EUR on es/fr); // contactCopy.js: the Spanish and French contact form shows its budget bands in EUR (owner, 26 Nov 2026); proposed bands flagged for approval
    // (the project-application model and its server twin look prices up in each language's own currency: they hold the EUR code and symbol by design; tests/project-application.test.mjs pins the amounts)
    const t = fs.readFileSync(f, 'utf8').replace('US dollars (USD) or euros (EUR)', '') // the Legal Notice's general currency statement names both currencies (owner, 27 Nov 2026)
    assert.ok(!/€/.test(t), `${path.relative(ROOT, f)} contains €`)
    assert.ok(!/\bEUR\b|\beuros?\b/i.test(t.replace(/priceCurrency/g, '')), `${path.relative(ROOT, f)} mentions euros`)
  }
})

test('Organization: verified facts only (name, url, description, logo, Instagram, company LinkedIn, email, languages)', () => {
  const org = graph().find((n) => n['@type'] === 'Organization')
  assert.equal(org.name, 'CONVRT Studio')
  assert.equal(org.url, SITE_URL)
  assert.equal(org['@id'], ORG_ID)
  assert.equal(org.slogan, BRAND.motto)
  assert.equal(org.logo.url, `${SITE_URL}/convrt-logo.svg`)
  assert.ok(fs.existsSync(path.join(ROOT, 'public', 'convrt-logo.svg')), 'logo file exists')
  assert.deepEqual(org.sameAs, ['https://www.instagram.com/convrtcreativestudio/', 'https://www.linkedin.com/company/123164137/'])
  assert.deepEqual(org.knowsLanguage, ['en', 'es', 'fr', 'ar'])
  assert.ok(!org.sameAs.some((u) => /linkedin\.com\/in\//.test(u)), "a founder's personal profile is not the organisation's profile")
  assert.equal(org.sameAs.filter((u) => /linkedin\.com/.test(u)).length, 1, 'exactly one LinkedIn: the official company page')
})

test('Offers: numeric prices, correct currencies, monthly vs one-off kept apart, never a contract total', () => {
  const svc = (id) => graph().find((n) => n['@id'].endsWith(`#service-${id}`))
  const spec = (s, i) => s.offers[i].priceSpecification
  const sprint = svc('creative-testing-sprint')
  const plus = svc('creative-testing-sprint-plus')
  assert.equal(spec(sprint, 0).price, 3000); assert.equal(spec(sprint, 0).priceCurrency, 'USD'); assert.equal(spec(sprint, 0).unitCode, 'MON')
  assert.equal(spec(sprint, 0)['@type'], 'UnitPriceSpecification')
  assert.equal(spec(sprint, 1).price, 3500); assert.equal(spec(sprint, 1).priceCurrency, 'USD'); assert.equal(spec(sprint, 1).unitCode, undefined)
  assert.equal(spec(plus, 0).price, 5000); assert.equal(spec(plus, 0).priceCurrency, 'USD')
  assert.equal(spec(plus, 1).price, 6000); assert.equal(spec(plus, 1).priceCurrency, 'USD')
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
  // Batch 2 (audit G-02): a package relates to the core service by its stable id, the service page's own #service, which the same graph defines.
  const sprint = graph().find((n) => n.name === 'Creative Testing Sprint')
  assert.deepEqual(sprint.isRelatedTo.map((r) => r['@id']), [serviceId('ugc'), serviceId('spokesperson')])
  assert.deepEqual(sprint.isRelatedTo.map((r) => r['@id']), [`${SITE_URL}/ugc-video-agency#service`, `${SITE_URL}/spokesperson-video-production#service`])
  const light = graph().find((n) => n.name === 'Organic Light')
  assert.deepEqual(light.isRelatedTo.map((r) => r['@id']), [`${SITE_URL}/social-media-video-production#service`])
  const core = graph().filter((n) => n['@type'] === 'Service' && n['@id'].endsWith('#service'))
  assert.deepEqual(core.map((n) => n['@id']), [serviceId('ugc'), serviceId('saas'), serviceId('spokesperson'), serviceId('organic')], 'SaaS is a core service')
  assert.ok(core.every((n) => !n.offers), 'the core service descriptions carry no price: Offers stay on the package nodes')
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
  assert.deepEqual(Object.keys(BREADCRUMB_TRAILS), ['/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/creator-showcase'])
})

test('JSON-LD is attached only to the homepage, /pricing and /ugc-video-agency; the manifest supplies it with the head', () => {
  assert.equal(jsonLdFor('/scale'), undefined)
  assert.equal(jsonLdFor('/free-hooks'), undefined)
  assert.equal(pageHead('/scale').jsonLd, undefined)
  assert.equal(pageHead('/pricing').jsonLd['@graph'].find((n) => n['@type'] === 'WebPage').url, `${SITE_URL}/pricing`)
  const home = homeGraph()['@graph']
  assert.deepEqual(home.map((n) => n['@type']), ['Organization', 'WebSite', 'WebPage', 'Service', 'Service', 'Service', 'Service', 'FAQPage'])
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

// ── final five-section structure ──────────────────────────────────────────────────────────────────────────────────────
import {
  BILLING_OPTIONS, PARTNERSHIP_TERMS, CUSTOM_PACKAGES, SHARED_SPRINT_BENEFITS, SHARED_SPRINT_NOTE, PRODUCTION_STAGES, ORGANIC_STAGES,
  ORGANIC_COMMITMENT, CUSTOM_TERMS, GOALS, CARD_NOTES, SHARED_SPRINT_LANGUAGE_NOTE, ORGANIC_CTA,
} from '../src/seo/businessKnowledge.js'
import { CONTACT_EMAIL } from '../src/config.js'
import { FAQ_CATEGORIES } from '../src/seo/pricingFaq.js'
import { OFFER_PATHS } from '../src/config.js'

const stage = read('src/components/pricing/PricingStage.jsx')
const cardsSrc = read('src/components/pricing/PricingCards.jsx')
const philo = read('src/components/pricing/PhilosophySection.jsx')
const panels = read('src/components/pricing/InfoPanels.jsx')
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '')

test('goal selector: "Scale my ads" (default, Paid) and "Grow my socials" (Organic); tabs with keyboard navigation', () => {
  assert.deepEqual(GOALS.map((g) => [g.id, g.label, g.description]), [
    ['paid', 'Scale my ads', 'UGC, spokesperson videos and creative testing.'],
    ['organic', 'Grow my socials', 'Content, publishing and organic community growth.'],
  ])
  assert.match(stage, /What are you looking to achieve\?/)
  assert.match(stage, /role="tablist"/); assert.match(stage, /role="tab"/)
  assert.match(stage, /ArrowRight[\s\S]*ArrowLeft/)
  assert.match(read('src/CreativeTestingSprintPage.jsx'), /useState\('paid'\)/, 'defaults to Scale my ads')
  assert.ok(!/ServiceSwitch|Paid Social<|Organic Social</.test(strip(stage)), 'the old Paid/Organic toggle is gone')
})

test('hero: ONE headline and subtitle, no hero CTAs or stats, no second heading above the cards', () => {
  const s = strip(stage)
  assert.match(s.replace(/\s+/g, ' '), /Your creative partner\. <span className="text-lime">On your terms\.<\/span>/)
  assert.match(s.replace(/\s+/g, ' '), /From performance-driven video ads to consistent organic content, find the right creative partnership for your brand\./)
  assert.match(s, /UGC (&amp;|&) video production pricing/)
  assert.ok(!/More concepts\. Better creative|Choose your creative|Explore Packages|Get 5 Free Ad Concepts|CONVRT_STATS/.test(s), 'old headlines, hero CTAs and stats are out of the opening section')
  assert.equal((s.match(/<h1/g) || []).length, 1)
  assert.equal((s.match(/<h2/g) || []).length, 0, 'no other heading in the opening section')
})

test('horizontal transition: CSS transform slide (~420ms), inert inactive group, reduced-motion respected, no dependency', () => {
  const css = read('src/index.css')
  const block = css.slice(css.indexOf('.pricing-stage'))
  assert.match(block, /\.pricing-slide\[data-state="inactive"\]\[data-pos="left"\] \{ transform: translateX\(-104%\); \}/)
  assert.match(block, /\.pricing-slide\[data-state="inactive"\]\[data-pos="right"\] \{ transform: translateX\(104%\); \}/)
  assert.match(block, /transform 0\.42s/)
  assert.match(block, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.pricing-slide[\s\S]*transition: none/)
  assert.match(block, /overflow-x: clip/)
  assert.match(stage, /data-pos="left"[\s\S]*data-pos="right"|pos="left"[\s\S]*pos="right"/, 'Paid sits left, Organic right')
  assert.match(stage, /inert=\{active \? undefined : ''\}/)
  assert.match(stage, /aria-hidden=\{active \? undefined : 'true'\}/)
  assert.ok(!/framer-motion|react-spring|gsap|fetch\(/.test(stage + cardsSrc), 'presentation only: no animation library, no data fetching')
  const pkg = JSON.parse(read('package.json'))
  // The point of this guard is "no animation/transition library for the pricing slide". (Other features may add their own
  // runtime dependencies, e.g. the creator-onboarding PDF generator, so the list is not pinned exactly.)
  const deps = Object.keys(pkg.dependencies)
  for (const needed of ['hls.js', 'react', 'react-dom']) assert.ok(deps.includes(needed), needed)
  assert.deepEqual(deps.filter((d) => /framer-motion|react-spring|gsap|motion|animejs|react-transition-group|react-flip/i.test(d)), [], 'no animation library')
  assert.match(css, /visibility 0s linear 0\.42s/, 'the leaving group becomes invisible (and unfocusable) only after it has slid away')
})

test('billing: compact Monthly / One-off selector for Paid only; prices from config; Organic has none', () => {
  assert.deepEqual(BILLING_OPTIONS.map((o) => [o.id, o.label, o.unit]), [['monthly', 'Monthly', '/month'], ['oneOff', 'One-off', '/project']])
  assert.match(stage, /useState\('monthly'\)/)
  assert.match(cardsSrc, /(formatMoney|money)\(pkg\[o\.id\]\)/)
  assert.equal(SPRINT.monthly.amount, 3000); assert.equal(SPRINT.oneOff.amount, 3500)
  assert.equal(SPRINT_PLUS.monthly.amount, 5000); assert.equal(SPRINT_PLUS.oneOff.amount, 6000)
  const paidPanel = stage.slice(stage.indexOf('id="paid"'), stage.indexOf('id="organic"'))
  const organicPanel = stage.slice(stage.indexOf('id="organic"'))
  assert.match(paidPanel, /<BillingSwitch/)
  assert.ok(!/BillingSwitch/.test(organicPanel), 'no billing selector on Organic')
  assert.ok(!/ongoing content partnerships|Creative production packages/.test(stage), 'no introductory line above the cards')
  assert.match(paidPanel, /<div className="mb-4 flex justify-center">\s*<BillingSwitch/, 'billing control centred, no intro text')
  assert.ok(!/oneOff|one-off/i.test(cardsSrc.slice(cardsSrc.indexOf('export function OrganicCards'), cardsSrc.indexOf('export function BillingSwitch'))), 'no organic one-off prices')
  assert.ok(!/discount|save \d|% off|savings?/i.test(strip(cardsSrc) + JSON.stringify(PARTNERSHIP_TERMS)), 'no discount or savings claims')
  assert.match(cardsSrc, /<BillingPrice pkg=\{SPRINT\} billing=\{billing\} \/>/)
  assert.ok(!/BillingPrice[^\n]*CUSTOM|LetsTalk[^\n]*billing/.test(cardsSrc), 'Custom is independent of billing')
})

test('commitments: Paid = 3 months then month-to-month, 30 days notice; Organic = 6 months, later terms per agreement', () => {
  assert.equal(COMMITMENT.initialMonths, 3); assert.equal(COMMITMENT.cancellationNoticeDays, 30)
  assert.equal(PARTNERSHIP_TERMS.monthly, "Initial 3-month commitment, followed by a flexible month-to-month agreement with 30 days' cancellation notice.")
  assert.equal(ORGANIC_COMMITMENT.initialMonths, 6)
  assert.equal(ORGANIC_COMMITMENT.rationale, 'Organic partnerships begin with an initial six-month commitment, giving us time to build a consistent social media presence, learn what resonates with your audience and assess performance.')
  assert.match(ORGANIC_COMMITMENT.afterInitial, /set out in the applicable agreement/)
  // the Paid terms are never attached to Organic
  const organicText = JSON.stringify(ORGANIC_COMMITMENT) + faq('organic-commitment')
  assert.ok(!/three-month|3-month|month-to-month|30 days/i.test(organicText), 'no Paid terms on Organic')
  assert.ok(!/guarantee|will grow|increase your/i.test(organicText.replace(/never guarantee/g, '')), 'no growth guarantee')
  assert.equal(CUSTOM_TERMS, 'Custom project terms are agreed individually.')
})

test('organic six-month FAQ: exact approved answer; other FAQs distinguish Paid 3 months / one-off / Organic 6 months / Custom', () => {
  const q = PRICING_FAQ.find((f) => f.id === 'organic-commitment')
  assert.equal(q.q, 'Why is there a six-month minimum commitment for organic social media?')
  assert.equal(q.a[0], 'Building a meaningful social media presence takes consistency. Our organic partnerships begin with a six-month commitment, giving us time to develop your content strategy, publish consistently, learn what resonates with your audience and assess performance before making longer-term decisions.')
  assert.equal(q.category, 'organic')
  const m = faq('minimum-commitment')
  assert.match(m, /Paid Social monthly partnerships: .*three-month commitment/)
  assert.match(m, /One-off projects are available separately/)
  assert.match(m, /Organic Social partnerships: .*six-month commitment/)
  assert.match(m, /Custom project terms are agreed individually/)
})

test('organic JSON-LD offers carry the six-month commitment, never the paid terms; prices stay numeric USD', () => {
  for (const name of ['Organic Light', 'Organic Growth']) {
    const n = graph().find((x) => x.name === name)
    const d = n.offers[0].description
    assert.match(d, /Initial six-month commitment\. Terms after the initial six-month period are set out in the applicable agreement\./)
    assert.ok(!/three-month|month-to-month|30 days/i.test(d + n.description), name)
    assert.equal(n.offers[0].priceSpecification.priceCurrency, 'USD')
  }
  for (const name of ['Creative Testing Sprint', 'Creative Testing Sprint Plus']) {
    assert.match(graph().find((x) => x.name === name).offers[0].description, /three-month commitment/)
  }
})

test('cards keep the approved design: three per group, tones, Custom has no price; every card CTA opens the project application', () => {
  for (const t of ["tone=\"light\"", "tone=\"lime\"", "tone=\"dark\""]) assert.ok(cardsSrc.includes(t), t)
  assert.equal((cardsSrc.match(/<PricingCard\b/g) || []).length, 6)
  const cards = strip(cardsSrc)
  assert.match(cards, /applicationHref\(/)
  assert.ok(!/calendly|mailto:|<form|BOOKING_URL/i.test(cards), 'no new booking integration or contact funnel')
  assert.match(cards, /`\$\{ORGANIC_COMMITMENT\.initialMonths\}-month initial commitment`/)
  for (const pkg of Object.values(CUSTOM_PACKAGES)) {
    assert.equal(pkg.priceLabel, "Let's talk."); assert.equal(pkg.cta, 'Discuss your project')
    assert.ok(!/[$€]|\d/.test(JSON.stringify(pkg)), 'no number in a custom package')
  }
  const nodes = graph().filter((n) => /^Custom /.test(n.name))
  assert.equal(nodes.length, 2)
  for (const n of nodes) { assert.equal(n.offers, undefined); assert.ok(!/\$\d/.test(JSON.stringify(n))) }
})

test('Section 2: philosophy (standard Sprint diagram / organic sequence) + Roadmap offer + credibility stats in one block', () => {
  const s = strip(philo)
  assert.match(s, /Different concepts\. <span className="text-lime">Not just different hooks\.<\/span>/)
  assert.match(s, /We develop distinct creative angles, then create variations for structured testing\./)
  assert.match(s, /SPRINT\.concepts\} original concepts[\s\S]*SPRINT\.variations\} finished ad versions/)
  assert.match(s, /A concept<\/span> is a unique ad idea\./); assert.match(s, /A variation<\/span>(?:\s|\{' '\})*changes its hook or CTA\./)
  assert.match(s, /Standard Sprint shown\. Sprint Plus includes \$?\{SPRINT_PLUS\.concepts\} concepts and \$?\{SPRINT_PLUS\.variations\} finished ad versions\./)
  assert.match(s, /A video-first approach to building your organic presence\./)
  assert.match(s, /Consistency\. Content\. <span className="text-lime">Real connections\.<\/span>/)
  assert.match(s, /ORGANIC_STAGES\.map/)
  assert.deepEqual(ORGANIC_STAGES.map((x) => x.sequenceLabel), ['Strategy', 'Production', 'Publishing & engagement', 'Optimization'])
  for (const t of ['Your free Creative Growth Roadmap', 'Your next <span className="text-lime">5 winning ad concepts.</span>', 'Five personalized creative ideas for your brand, built around your product and audience.', 'Completely free. No obligation.', 'Get 5 Free Ad Concepts', 'OFFER_PATHS.roadmap', 'CONVRT_STATS.views', 'CONVRT_STATS.videos', 'CONVRT_STATS.clients', 'PRODUCTION_LANGUAGES.core.length']) assert.ok(s.includes(t), t)
  const css = read('src/index.css'); const b = css.slice(css.indexOf('.branch-draw') - 200)
  assert.match(b, /@media \(prefers-reduced-motion: no-preference\)[\s\S]*\.branch-draw/)
})

test('Section 3: four expandable panels; one open at a time; all content in the DOM; paid and organic variants', () => {
  const s = strip(panels)
  assert.match(s, /title="The details\."/); assert.match(s, /intro="Everything you need to know before getting started\."/)
  for (const t of ["title: \"What's included\"", "title: 'Usage rights'", "title: 'How we work'", "title: 'Production & extras'",
    "paid: 'Full creative production.'", "paid: '6 months worldwide. Flexible extensions.'", "paid: 'From strategy to delivery.'", "paid: 'Revisions, formats and add-ons.'"]) assert.ok(s.includes(t), t)
  assert.match(s, /aria-expanded=\{open\}/); assert.match(s, /aria-controls=\{bodyId\}/)
  assert.match(s, /setOpenId\(\(cur\) => \(cur === p\.id \? null : p\.id\)\)/, 'one open at a time')
  assert.match(s, /useState\(null\)/, 'every panel is closed on load, on desktop and mobile alike')
  assert.match(s, /useEffect\(\(\) => \{ setOpenId\(null\) \}, \[service\]\)/, 'switching goal returns to a clean, closed state')
  assert.ok(!/matchMedia/.test(s))
  assert.ok(!/fetch\(|import\(/.test(s))
  // separate standalone sections are gone
  for (const gone of ['ConceptExplainer', 'SharedBenefits', 'UsageRights', 'ProductionProcess', 'ProductionTerms', 'OrganicScope', 'CommercialTerms']) {
    assert.ok(!fs.existsSync(path.join(ROOT, 'src/components/pricing', `${gone}.jsx`)), `${gone}.jsx should be consolidated`)
  }
})

test('panel content: concise inclusions, usage rights + extension prices, stages, production rows; long-form policies live in the FAQ', () => {
  assert.deepEqual(SHARED_SPRINT_BENEFITS.map((b) => b.label), ['Creative research & strategy', 'Concepts, scripts & approval', 'Creator selection', 'Filming & editing', 'Captions, B-roll & graphics', 'Square & 4:5 reframing', 'Creative variations', 'Testing recommendations', 'Multilingual production'])
  assert.equal(SHARED_SPRINT_BENEFITS.length, 9)
  assert.equal(SHARED_SPRINT_BENEFITS[8].detail, 'One core language included: English, Spanish, French or Arabic.')
  assert.equal(SHARED_SPRINT_LANGUAGE_NOTE, 'Additional languages are available on request and may incur extra charges.')
  assert.ok(!/free of charge|at no (extra )?cost/i.test(SHARED_SPRINT_LANGUAGE_NOTE), 'additional languages are never implied to be free')
  assert.match(SHARED_SPRINT_NOTE, /Custom scopes are agreed individually/)
  assert.deepEqual(PRODUCTION_STAGES.map((x) => [x.title, x.description]), [
    ['Strategy', 'Research & creative concepts.'], ['Preparation', 'Creators, scripts & approval.'],
    ['Production', 'Filming, editing & variations.'], ['Delivery', 'Finished videos, revisions & recommendations.'],
  ])
  assert.deepEqual(PRODUCTION_STAGES.flatMap((x) => x.steps).sort(), PRODUCTION_PROCESS.map((_, i) => i), 'all eight original steps preserved')
  assert.deepEqual(ORGANIC_STAGES.map((x) => [x.title, x.description]), [
    ['Strategy', 'Content planning & objectives.'], ['Production', 'Concepts, filming & editing.'],
    ['Publishing', 'Distribution & engagement.'], ['Optimization', 'Performance review & refinement.'],
  ])
  assert.deepEqual(ORGANIC.panelInclusions, ['Content strategy & planning', 'Concepts & scripting', 'Filming & editing', 'Captions & post copy', 'Scheduling & publishing', 'Cross-platform distribution', 'Performance optimization', 'Community engagement'])
  assert.equal(ORGANIC.panelNote, 'Facebook, Instagram and TikTok. Community management excludes customer support.')
  const u = USAGE_RIGHTS.panel
  assert.equal(u.headline, '6 months of worldwide usage included.')
  assert.deepEqual(u.shortUses, ['Paid ads', 'Organic social', 'Website use'])
  assert.equal(u.expirySummary, 'Existing organic posts and website placements may stay live. Paid advertising, resharing and republishing require an extension.')
  assert.equal(u.creatorNote, 'Creator-account advertising, including Spark Ads and Meta partnership ads, is arranged and priced separately.')
  assert.match(u.batchNote, /entire creative batch.*exclude VAT/); assert.match(u.fromDelivery, /date each video is delivered/)
  assert.match(u.organic, /set out in your agreement/); assert.match(u.organic, /do not automatically apply/)
  const s = strip(panels)
  for (const t of ['u.headline', 'u.shortUses', 'u.expirySummary', 'u.creatorNote', 'u.batchNote', 'Custom quote, subject to agreement with the featured creators', 'money(e.price)', 'money(SPRINT_PLUS.usageExtensions[i].price)', 'USAGE_RIGHTS.includedMonths + e.months', 'RAW_FOOTAGE.shortNote', 'FORMATS.standardMaxSeconds', 'SHARED_SPRINT_LANGUAGE_NOTE']) assert.ok(s.includes(t), t)
  for (const t of ["'Vertical, square and 4:5.'", "'16:9 counts as a separate video.'", 'Custom 1–3 minute videos available.', "'Starts after concept and script approval.'", 'business days — Sprint.', 'business days — Sprint Plus.']) assert.ok(s.includes(t), t)
  // Long-form policies were moved out of the panels, not dropped: they are in the FAQ.
  assert.match(faq('usage-rights-expiry-extension'), /Existing organic social media posts may remain published/)
  assert.match(faq('usage-rights-expiry-extension'), /Paid advertising use must stop unless the usage rights are extended/)
  assert.match(faq('usage-rights-expiry-extension'), /cannot be reshared or republished without extending the usage rights/)
  assert.match(faq('usage-rights-included'), /not a transfer of copyright ownership/)
  assert.match(faq('spark-ads'), /separate from the standard usage rights/)
  assert.match(faq('perpetual-usage'), /subject to agreement with the featured creator or creators/)
  assert.match(faq('reshoots'), /charged in full/)
  assert.match(faq('production-requirements'), /ship the product to the selected creator and cover the shipping costs/)
  assert.match(faq('raw-footage'), /cannot|never as a replacement/)
  // Organic never inherits Sprint licensing / turnaround / revisions / raw footage
  const organicUsage = s.slice(s.indexOf('function UsageOrganic'), s.indexOf('const PAID_STAGE_ICONS'))
  assert.match(organicUsage, /USAGE_RIGHTS\.panel\.organic/)
  assert.ok(!/formatMoney|USAGE_RIGHTS\.included|extension/i.test(organicUsage))
  const organicDetails = s.slice(s.indexOf('function DetailsOrganic'), s.indexOf('const PANELS'))
  assert.match(organicDetails, /Sprint terms do not automatically apply/)
  assert.ok(!/SPRINT\.|SPRINT_PLUS\.|REVISIONS|FORMATS|RAW_FOOTAGE/.test(organicDetails), 'no Sprint turnaround/revisions/raw footage on Organic')
})

test('concise notes under the cards, from the central config; full policies stay available', () => {
  assert.equal(CARD_NOTES.paid, 'Monthly plans start with a 3-month commitment, then become month-to-month with 30 days’ notice. One-off projects are also available. All prices exclude VAT.')
  assert.equal(CARD_NOTES.organic, 'A 6-month initial partnership to build a consistent social presence and assess results. All prices exclude VAT.')
  assert.ok(!/three-month|month-to-month|30 days/.test(CARD_NOTES.organic), 'Paid terms never on the Organic note')
  const terms = read('src/components/pricing/PartnershipTerms.jsx')
  assert.match(terms, /CARD_NOTES\.paid/); assert.match(terms, /CARD_NOTES\.organic/)
  assert.ok(!/<p[\s\S]*<p[\s\S]*<p/.test(terms.slice(terms.indexOf('function Note'), terms.indexOf('/* Other languages'))), 'one paragraph per note')
  // the underlying approved policies are still in the knowledge base and the FAQ
  assert.equal(PARTNERSHIP_TERMS.oneOff, 'One creative production batch, without a recurring commitment.')
  assert.match(faq('minimum-commitment'), /Custom project terms are agreed individually/)
  assert.match(faq('vat'), /Applicable taxes will be calculated/)
  assert.match(faq('turnaround-start'), /not when payment is made/)
  assert.match(faq('organic-commitment'), /six-month commitment/)
  assert.match(ORGANIC_COMMITMENT.afterInitial, /applicable agreement/)
})

test('card copy is concise but complete: platform line, Custom note, Sprint Plus detail', () => {
  assert.match(cardsSrc, /& \$\{ORGANIC\.platforms\.at\(-1\)\} distribution/)
  assert.ok(!/Adapted and distributed across your selected platforms/.test(cardsSrc))
  for (const pkg of Object.values(CUSTOM_PACKAGES)) assert.equal(pkg.note, 'Scope, pricing and terms are tailored to your project.')
  assert.equal(SPRINT_PLUS.extraDetail, 'Includes expanded research and testing recommendations.')
  for (const t of ['ORGANIC.includedInBoth[0]', 'ORGANIC.includedInBoth[1]', 'ORGANIC_COMMITMENT.initialMonths']) assert.ok(cardsSrc.includes(t), t)
})

test('Roadmap card: approved copy and destination; right = three-mockup PITCH-BOARD, left = monochrome technical diagram (visibly different)', () => {
  const s = strip(philo)
  assert.match(s, /Your free Creative Growth Roadmap/)
  assert.match(s, /Your next <span className="text-lime">5 winning ad concepts\.<\/span>/)
  assert.match(s, /Five personalized creative ideas for your brand, built around your product and audience\./)
  assert.match(s, /Completely free\. No obligation\./)
  assert.match(s, /OFFER_PATHS\.roadmap/)
  // right: pitch-board
  const raw = philo
  const board = raw.slice(raw.indexOf('function PitchBoard'), raw.indexOf('function RoadmapCard'))
  for (const t of ['SaaS product demo', 'creator-led lifestyle ad', 'bold product-focused ad', 'PRODUCT DEMO', 'CREATOR-LED', 'PRODUCT-LED', 'See it in action', 'It just works.', 'MADE', 'SEEN.']) assert.ok(board.includes(t), t)
  assert.ok(!/Illustrative concepts/.test(board), 'no caption under the mockups; the on-mockup tags (CREATOR-LED, PRODUCT DEMO, PRODUCT-LED) mark them as examples')
  // layered composition: the demo (B) is drawn first, so it sits behind the two side mockups, which are pulled toward it
  assert.ok(board.indexOf('{/* B: ') < board.indexOf('{/* A: ') && board.indexOf('{/* A: ') < board.indexOf('{/* C: '), 'demo behind creator-led and product-led')
  assert.match(board, /translate\(20 0\) rotate\(-5 62 104\)/); assert.match(board, /translate\(-12 0\) rotate\(5 290 120\)/)
  assert.equal((board.match(/\{\/\* [ABC]: /g) || []).length, 3, 'exactly three mock ads')
  assert.ok(!/ConceptAccents|#8b5cf6|#ff6a4d|#ec4899|#ffb547/.test(board), 'no rainbow card palette on the pitch-board')
  assert.ok(!/<img|https?:\/\/|<animate|animation|branch-draw|ANGLE_ICONS|Problem|Offer/.test(board), 'no external assets, animation, branching or five-icon idea cards')
  assert.ok(!/client|testimonial|results?\b|ROAS|\d+%|\d+x/i.test(board.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')), 'no invented client names, results or testimonials in the mockups')
  const card = s.slice(s.indexOf('function RoadmapCard'), s.indexOf('function OrganicOfferCard'))
  assert.ok(!/justify-between|h-full|min-h-\[/.test(card), 'content flows naturally')
  assert.match(card, /<PitchBoard \/>/)
  // left: technical diagram
  const col = raw.slice(raw.indexOf('function ConceptColumn'), raw.indexOf('const SEQ_ICONS'))
  const colors = [...new Set((col.match(/#[0-9a-f]{6}/gi) || []).map((c) => c.toLowerCase()))].sort()
  assert.deepEqual(colors, ['#0a0a0b', '#a1a1aa', '#d5ff40', '#fafafa'], 'monochrome: white, grey, near-black and lime junction dots only')
  assert.ok(!/ConceptAccents|accent|<path d="M[^"]*l[^"]*z"/.test(col), 'no colour coding and no play-button shapes')
  assert.match(col, /branch-draw/); assert.match(raw, /GRID_BG = \{ backgroundImage: 'radial-gradient/); assert.match(raw, /style=\{GRID_BG\}/)
  assert.ok(!fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8').includes('roadmap-float'))
})

test('service-aware CTAs: Paid keeps the Roadmap offer; Organic uses the organic conversation starter via the strategy call', () => {
  assert.equal(ORGANIC_CTA.label, 'Discuss Your Content Strategy', 'one organic label, the same as the Organic Social page')
  assert.equal(ORGANIC_CTA.promo.eyebrow.toUpperCase(), 'YOUR ORGANIC CONTENT PARTNERSHIP')
  assert.equal(ORGANIC_CTA.promo.headline, "Let's build your brand's organic presence.")
  assert.equal(ORGANIC_CTA.promo.text, 'Strategy, consistent video production, publishing and engagement — managed together.')
  assert.equal(ORGANIC_CTA.href, '/contact?service=organic', 'one organic route: the Contact inquiry with Organic Social Video chosen (27 Nov 2026; it was the public Calendly call)')
  assert.equal(ORGANIC_CTA.external, false)
  const s = strip(philo)
  assert.match(s, /<div hidden=\{service !== 'paid'\}><RoadmapCard \/><\/div>/)
  assert.match(s, /<div hidden=\{service !== 'organic'\}><OrganicOfferCard \/><\/div>/)
  const organicCard = s.slice(s.indexOf('function OrganicOfferCard'), s.indexOf('const STATS'))
  assert.ok(!/Free Ad Concepts|ad concepts|OFFER_PATHS/.test(organicCard), 'the five free ad concepts are not presented as an organic deliverable')
  assert.match(organicCard, /ORGANIC_CTA\.href/)
  const fin = strip(read('src/components/pricing/PricingFinalCTA.jsx'))
  assert.match(fin, /<div hidden=\{service !== 'paid'\}>\s*<CtaLink href=\{rcta\.href\} external=\{rcta\.external\}>\{(?:ctaText|tr)\(rcta\.label\)\}<\/CtaLink>/)
  assert.match(fin, /<div hidden=\{service !== 'organic'\}>\s*<CtaLink href=\{hrefFor\(ORGANIC_CTA\.href\)\} external=\{ORGANIC_CTA\.external\}>\{currentLocale\(\) === 'en' \? tr\(ORGANIC_CTA\.label\) : 'Discuss your strategy'\}<\/CtaLink>/)
  assert.match(read('src/CreativeTestingSprintPage.jsx'), /<PricingFinalCTA service=\{service\} \/>/)
  // The global navigation CTA is untouched.
  assert.match(read('src/components/Nav.jsx'), /const ctaHref = onRoadmapPage \? '#apply' : action\.href/) // no public booking link on /scale any more (owner decision, 27 Nov 2026)
  assert.ok(!/mailto/.test(read('src/lib/routes/headFor.js')))
})

test('paid inclusions: nine items in a 3-column desktop grid (2 on tablet, 1 on phones); Organic keeps its own list', () => {
  const s = strip(panels)
  const paid = s.slice(s.indexOf('function IncludedPaid'), s.indexOf('function IncludedOrganic'))
  assert.match(paid, /grid-cols-1[^"]*sm:grid-cols-2[^"]*lg:grid-cols-3/)
  assert.ok(!/lg:grid-cols-4/.test(paid))
  assert.match(paid, /SHARED_SPRINT_BENEFITS\.map/); assert.match(paid, /b\.detail/)
  assert.match(paid, /SHARED_SPRINT_LANGUAGE_NOTE[\s\S]*SHARED_SPRINT_NOTE/)
  const organic = s.slice(s.indexOf('function IncludedOrganic'), s.indexOf('/* '))
  assert.match(organic, /ORGANIC\.panelInclusions\.map/)
  assert.ok(!/SHARED_SPRINT_BENEFITS/.test(organic), 'Organic is not given the nine-item Paid grid')
})

test('page: five sections in order; paid/organic content is switched by presentation only', () => {
  const page = read('src/CreativeTestingSprintPage.jsx')
  const order = ['<PricingStage', '<PhilosophySection', '<InfoPanels', '<PricingFAQ', '<PricingFinalCTA']
  const at = order.map((t) => page.indexOf(t, page.indexOf('return (')))
  at.forEach((p, i) => assert.ok(p > 0, order[i]))
  assert.deepEqual([...at].sort((a, b) => a - b), at)
  assert.match(page, /<PhilosophySection service=\{service\} \/>/); assert.match(page, /<InfoPanels service=\{service\} \/>/)
  assert.match(page, /useDocumentHead\(pageHead\('\/pricing'\)\)/)
  const final = strip(read('src/components/pricing/PricingFinalCTA.jsx')).replace(/\s+/g, ' ')
  assert.match(final, /Ready to create something <span className="text-lime">that converts\?<\/span>/)
  assert.match(final, /Let(&rsquo;|’)s find the right creative approach for your brand\./)
  assert.match(final, /Get 5 Free Ad Concepts/); assert.match(final, /OFFER_PATHS\.roadmap/)
})

test('FAQ categories: four, every question belongs to one, nothing dropped, structured data covers all of them', () => {
  assert.deepEqual(FAQ_CATEGORIES.map((c) => c.label), ['Packages & pricing', 'Production & delivery', 'Usage rights & add-ons', 'Organic social'])
  for (const f of PRICING_FAQ) assert.ok(FAQ_CATEGORIES.some((c) => c.id === f.category), `${f.id} has no category`)
  assert.equal(graph().find((n) => n['@type'] === 'FAQPage').mainEntity.length, PRICING_FAQ.length)
  const src = read('src/components/pricing/PricingFAQ.jsx')
  assert.match(src, /role="tablist"/); assert.match(src, /hidden=\{c\.id !== category\}/); assert.match(src, /ArrowRight[\s\S]*Home[\s\S]*End/)
  assert.match(src, /aria-expanded=\{open\}/); assert.ok(!/fetch\(|import\(/.test(src))
  assert.match(faq('production-requirements'), /dedicated demo or dummy account/)
  assert.match(faq('reshoots'), /CONVRT covers the corrective production or reshoot/)
})

test('internal owner-review flags are never rendered', () => {
  for (const f of ['pricing/PricingStage', 'pricing/PricingCards', 'pricing/InfoPanels', 'pricing/PhilosophySection', 'pricing/PartnershipTerms', 'pricing/PricingFAQ', 'pricing/PricingFinalCTA']) {
    assert.ok(!/OWNER_REVIEW_FLAGS/.test(read(`src/components/${f}.jsx`)), f)
  }
})

test('price per variation: Sprint $200 and Sprint Plus $167 (monthly, rounded to whole dollars), from the data; both billing variants rendered under each total', async () => {
  const { pricePerVariation } = await import('../src/seo/businessKnowledge.js')
  assert.equal(pricePerVariation(SPRINT).text, '$200')
  assert.equal(pricePerVariation(SPRINT_PLUS).text, '$167')
  assert.equal(pricePerVariation(SPRINT, 'oneOff').text, '$233')
  assert.equal(pricePerVariation(SPRINT_PLUS, 'oneOff').text, '$200')
  const src = fs.readFileSync(path.join(ROOT, 'src/components/pricing/PricingCards.jsx'), 'utf8')
  assert.ok(/pricePerVariation\(pkg, o\.id\)\.text/.test(src) && !/\$166|\$200\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'figures are computed, never typed in the component')
  assert.match(faq('whats-included'), /\$200 per variation for the Creative Testing Sprint and \$167 per variation for Creative Testing Sprint Plus.*not prices for buying individual videos/)
})

// ── sitewide consistency audit guard ──
test('audit: no retired package price is typed anywhere in src/ (only the data file may mention them, in comments)', () => {
  const stale = /\$(4,500|5,400|625|1,125|3,150|1,750)\b/
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === 'blog' && d.endsWith('content') ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]))
  for (const f of walk(path.join(ROOT, 'src')).filter((x) => /\.(jsx?|json|md)$/.test(x) && !x.endsWith('businessKnowledge.js'))) {
    assert.ok(!stale.test(fs.readFileSync(f, 'utf8')), `${path.relative(ROOT, f)} contains a retired package price`)
  }
  const data = fs.readFileSync(path.join(ROOT, 'src/seo/businessKnowledge.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  assert.ok(!stale.test(data), 'the data file only mentions retired prices in comments')
})

