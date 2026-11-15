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
test('Sprint: €2,500/month, 5 concepts x 2 variations = 10, 10 business days, 2 revision rounds, 6 months usage', () => {
  assert.deepEqual(SPRINT.monthly, { amount: 2500, currency: 'EUR' })
  assert.equal(SPRINT.concepts, 5)
  assert.equal(SPRINT.variationsPerConcept, 2)
  assert.equal(SPRINT.variations, SPRINT.concepts * SPRINT.variationsPerConcept)
  assert.equal(SPRINT.variations, 10)
  assert.equal(SPRINT.turnaroundBusinessDays, 10)
  assert.equal(SPRINT.revisionRoundsPerConcept, 2)
  assert.equal(SPRINT.usageMonthsIncluded, 6)
})

test('Sprint Plus: €4,500/month, 20 variations, 15 business days, 2 revision rounds, 6 months usage', () => {
  assert.deepEqual(SPRINT_PLUS.monthly, { amount: 4500, currency: 'EUR' })
  assert.equal(SPRINT_PLUS.variations, 20)
  assert.equal(SPRINT_PLUS.turnaroundBusinessDays, 15)
  assert.equal(SPRINT_PLUS.revisionRoundsPerConcept, 2)
  assert.equal(SPRINT_PLUS.usageMonthsIncluded, 6)
})

test('Sprint Plus concept count is flagged as unconfirmed and no new claim is built on it', () => {
  assert.equal(SPRINT_PLUS.concepts.status, 'pending-owner-confirmation')
  assert.ok(OWNER_REVIEW_FLAGS.some((f) => /Sprint Plus concept count/.test(f)))
  const everyNewClaim = JSON.stringify(graph()) + PRICING_FAQ.map(faqAnswerText).join(' ')
  assert.ok(!new RegExp(`\\b${SPRINT_PLUS.concepts.value} (distinct )?(creative )?concepts`, 'i').test(everyNewClaim), 'FAQ/JSON-LD must not state the unconfirmed concept count')
  assert.ok(!/\b10 (distinct )?(creative )?concepts/i.test(everyNewClaim), 'must not invent a 10-concept Sprint Plus')
  // The concept diagram is drawn for the standard Sprint only.
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
  assert.equal(formatMoney(SPRINT.monthly), '€2,500')
  assert.ok(OWNER_REVIEW_FLAGS.some((f) => /Currency/.test(f)))
  assert.match(faq('one-off-and-single-video'), /\$3,000.*\$5,400/)
  assert.ok(SINGLE_VIDEOS.sold === false && /does not sell individual paid videos/.test(SINGLE_VIDEOS.statement))
})

test('VAT: every price excludes VAT, with the confirmed sentence', () => {
  assert.equal(TAX.pricesExcludeVat, true)
  assert.equal(TAX.statement, 'All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.')
  assert.equal(faq('vat'), TAX.statement)
  assert.ok(!/reverse.?charge|VAT (registration )?number/i.test(TAX.statement + read('src/components/pricing/CommercialTerms.jsx')), 'no invented tax treatment')
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
  assert.deepEqual(table(SPRINT), [[3, 625, 'EUR'], [6, 1000, 'EUR'], [12, 1750, 'EUR']])
  assert.deepEqual(table(SPRINT_PLUS), [[3, 1125, 'EUR'], [6, 1800, 'EUR'], [12, 3150, 'EUR']])
  const a = faq('usage-rights-expiry-extension')
  for (const p of ['€625', '€1,000', '€1,750', '€1,125', '€1,800', '€3,150']) assert.ok(a.includes(p), p)
  assert.match(a, /entire creative batch/)
  assert.match(a, /exclude VAT/)
  assert.match(faq('perpetual-usage'), /subject to agreement with the featured creator or creators/)
  assert.ok(!/€\s?[\d,]+.{0,40}perpetual/i.test(faq('perpetual-usage')), 'perpetual has no fixed price')
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

test('raw footage: €250 per creative concept, add-on only, no ownership or perpetual-rights implication', () => {
  assert.deepEqual(RAW_FOOTAGE.price, { amount: 250, currency: 'EUR' })
  assert.equal(RAW_FOOTAGE.per, 'creative concept')
  assert.equal(RAW_FOOTAGE.addOnOnly, true)
  assert.equal(faq('raw-footage').split('\n')[0].startsWith('We offer raw footage as an additional service for €250 per creative concept.'), true)
  assert.match(faq('raw-footage'), /rather than as a replacement/)
  assert.match(faq('raw-footage'), /does not by itself transfer copyright ownership, unlimited editing rights or perpetual usage rights/)
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

test('organic: existing prices and post counts preserved; confirmed scope, platforms and exclusions', () => {
  assert.deepEqual(ORGANIC_PACKAGES.map((p) => [p.name, p.monthly.amount, p.monthly.currency]), [['Organic Light', 1500, 'EUR'], ['Organic Growth', 2000, 'EUR']])
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
  const offer = read('src/components/CreativeTestingOffer.jsx')
  for (const literal of ['2,500', '4,500', '1,500', '2,000', '3,000', '5,400']) assert.ok(!offer.includes(literal), `hard-coded ${literal}`)
  for (const f of ['UsageRights', 'CommercialTerms', 'ProductionTerms']) {
    assert.ok(!/[€$]\s?\d/.test(read(`src/components/pricing/${f}.jsx`)), `${f} hard-codes a price`)
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
  assert.equal(types.filter((t) => t === 'Service').length, 7, '3 core services + 2 creative testing + 2 organic packages')
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
  assert.equal(spec(sprint, 0).price, 2500); assert.equal(spec(sprint, 0).priceCurrency, 'EUR'); assert.equal(spec(sprint, 0).unitCode, 'MON')
  assert.equal(spec(sprint, 0)['@type'], 'UnitPriceSpecification')
  assert.equal(spec(sprint, 1).price, 3000); assert.equal(spec(sprint, 1).priceCurrency, 'USD'); assert.equal(spec(sprint, 1).unitCode, undefined)
  assert.equal(spec(plus, 0).price, 4500); assert.equal(spec(plus, 0).priceCurrency, 'EUR')
  assert.equal(spec(plus, 1).price, 5400); assert.equal(spec(plus, 1).priceCurrency, 'USD')
  for (const id of ['organic-light', 'organic-growth']) assert.equal(spec(svc(id), 0).unitCode, 'MON')
  assert.equal(spec(svc('organic-light'), 0).price, 1500)
  assert.equal(spec(svc('organic-growth'), 0).price, 2000)
  for (const n of graph().filter((x) => x.offers)) {
    for (const o of n.offers) {
      assert.equal(typeof o.priceSpecification.price, 'number')
      assert.equal(o.priceSpecification.valueAddedTaxIncluded, false)
      // The visible string for the same price uses the same currency symbol.
      const sym = o.priceSpecification.priceCurrency === 'EUR' ? '€' : '$'
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
