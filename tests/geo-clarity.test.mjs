// Run with: node --test tests/geo-clarity.test.mjs
// GEO Work Package 1 (2026-11-21): About "at a glance", markets/production/languages, scope section, shared language and shipping wording, Home FAQ production answer,
// country-only Organization address, claims register. Pure data and rendered-content checks; no network, no lead, email or booking.
import test from 'node:test'
import assert from 'node:assert/strict'
import { TRUST_CONTENT } from '../src/content/trustPages.js'
import { HOME_FAQ, homeFaqText } from '../src/seo/homeFaq.js'
import { UGC_FAQ, ugcFaqText } from '../src/seo/ugcFaq.js'
import { SPOKESPERSON_FAQ } from '../src/seo/spokespersonFaq.js'
import { SAAS_FAQ } from '../src/seo/saasFaq.js'
import { ORGANIC_SOCIAL_FAQ } from '../src/seo/organicSocialFaq.js'
import { PRICING_FAQ, faqAnswerText } from '../src/seo/pricingFaq.js'
import { organizationNode, homeGraph, faqNode } from '../src/seo/structuredData.js'
import { TRUST_PAGES_PUBLISHED } from '../src/config.js'
import {
  PRODUCTION_MODEL, INTERNATIONAL_CLIENTS, PRODUCTION_LANGUAGES, PRODUCT_REQUIREMENTS, PUBLIC_CLAIMS, BRAND, SPRINT, SPRINT_PLUS, ORGANIC,
} from '../src/seo/businessKnowledge.js'

const plain = (page) => page.sections.map((s) => [s.heading, ...s.body.flatMap((b) => (typeof b === 'string' ? [b] : b.list))].join(' ')).join('\n').replace(/\[\[([^\]|]+)\|[^\]]+\]\]/g, '$1')
const about = TRUST_CONTENT.about
const aboutText = plain(about)
const section = (h) => about.sections.find((s) => s.heading === h)
const sectionText = (h) => plain({ sections: [section(h)] })

test('About: the approved sections exist, the at-a-glance block comes first, the old headings are replaced', () => {
  const headings = about.sections.map((s) => s.heading)
  assert.equal(headings[0], 'CONVRT Studio at a glance')
  assert.ok(headings.includes('Markets, production and languages') && headings.includes('What we provide, and what we do not'))
  assert.ok(!headings.includes('Languages and markets') && !headings.includes('What we do not do'))
  assert.ok(headings.includes('What we do') && headings.includes('A founder-led studio') && headings.includes('How we work with creators'), 'existing sections kept')
})

test('About at a glance: services, who we serve, production model, founder, languages, client work, a link to Pricing and the identity line; short and without package terms', () => {
  const g = sectionText('CONVRT Studio at a glance')
  for (const label of ['What we do:', 'Who we serve:', 'How we produce:', 'Where we produce:', 'Founder:', 'Languages:', 'Client work:', 'Packages and terms:', 'Find us:']) assert.ok(g.includes(label), label)
  assert.ok(g.includes(INTERNATIONAL_CLIENTS.text))
  assert.ok(g.includes(PRODUCTION_MODEL.short))
  assert.ok(g.includes(BRAND.founder.name) && g.includes('convrt.studio'))
  const links = JSON.stringify(section('CONVRT Studio at a glance'))
  for (const href of ['/ugc-video-agency', '/saas-video-production', '/spokesperson-video-production', '/social-media-video-production', '/pricing', '/case-studies/graspo', '/case-studies/elyon']) assert.ok(links.includes(`|${href}]]`), href)
  assert.ok(links.includes('linkedin.com/company/123164137') && links.includes('instagram.com/convrtcreativestudio') && links.includes('linkedin.com/in/'), 'the three existing public profiles')
  // not a second Pricing page: no prices, quantities, revisions, turnaround or commitments
  assert.ok(!/\$\s?\d|business days|rounds of revisions|month commitment|six-month|finished ad versions|per month|a month/i.test(g), 'no package terms in the glance')
  assert.ok(g.length < 2200, `concise (${g.length} characters)`)
})

test('About client work keeps the published figures and qualifiers exactly (10.7M organic views Jan-Jun 2026; 160+ creatives; one video, client-reported 5.28x)', () => {
  const g = sectionText('CONVRT Studio at a glance')
  assert.match(g, /Graspo, 10\.7M organic views on Facebook and Instagram, January to June 2026/)
  assert.match(g, /Elyon Dubai, 160\+ creatives produced, including one creator-led video with a client-reported 5\.28x ROAS/)
  assert.match(g, /Results are specific to each client and period; they are not typical and not guaranteed\./)
  assert.ok(!/Prague|Almería|Almeria|Granada|Marbella/.test(aboutText), "Elyon's individual filming locations stay in the case study")
})

test('About production wording: the approved sentence appears ONCE in full (markets section); the glance carries only the short form; on-location is not presented as part of packages', () => {
  assert.equal(aboutText.split(PRODUCTION_MODEL.text).length - 1, 1, 'the full production description is not repeated')
  assert.ok(sectionText('Markets, production and languages').includes(PRODUCTION_MODEL.text))
  assert.ok(sectionText('Markets, production and languages').includes(PRODUCTION_MODEL.scope))
  assert.match(PRODUCTION_MODEL.text, /^CONVRT offers remote video production through its creator network, as well as on-location filming in Spain\. On-location shoots in other countries may be arranged subject to project requirements, availability and approval\.$/)
  assert.match(PRODUCTION_MODEL.scope, /subject to project scope, availability and quotation where applicable/)
  assert.ok(!/included in (the )?(standard )?packages|part of (the )?standard packages/i.test(aboutText.replace(/not part of the service/g, '')), 'no suggestion that on-location filming is included in packages')
  assert.ok(!/remote[- ]only|only remote|exclusively remote|cannot film|can.?t film|do not film at your premises|offices?\b|local (production )?teams?|branch|subsidiar/i.test(aboutText), 'never remote-only, never an office or local-team claim')
})

test('About markets and languages: English, Spanish, French and Arabic; other languages subject to creator availability; international clients; registered in Spain; no samples or native-speaker claims', () => {
  const m = sectionText('Markets, production and languages')
  assert.match(m, /We produce in English, Spanish, French and Arabic\. Other languages are available on request, subject to creator availability\./)
  assert.ok(m.includes('registered in Spain') && !m.includes(INTERNATIONAL_CLIENTS.text), 'the international-clients sentence is said once, in the at-a-glance block (27 Nov 2026: repetition removed)')
  assert.ok(sectionText('CONVRT Studio at a glance').includes(INTERNATIONAL_CLIENTS.text), 'international clients stay in the at-a-glance block')
  assert.equal(INTERNATIONAL_CLIENTS.text, 'We work with international clients, including in Europe, the UK, the Middle East and the United States.')
  assert.ok(sectionText('CONVRT Studio at a glance').includes('the Middle East and the United States'), 'the glance names the same markets')
  assert.ok(!/offices? in|local (offices?|teams?|entit)/i.test(aboutText), 'markets served, never offices or local entities')
  assert.ok(!/native[- ]speaker|native creators|sample videos? in|verified (language )?samples/i.test(aboutText), 'no invented language evidence')
  assert.ok(!/Darija|Gulf|Khaleeji|dialect/i.test(aboutText), 'no dialect expansion on About (dialect depth is for the Arabic site)')
})

test('About scope section: the four distinctions, the existing sentences kept verbatim, a link to Pricing and no figures', () => {
  const s = sectionText('What we provide, and what we do not')
  assert.match(s, /Creative production, not media buying\./)
  assert.match(s, /We do not buy media or manage your advertising accounts, so you keep control of distribution and spend\. We never guarantee specific results: performance depends on your offer, audience and budget\./)
  assert.match(s, /Community management, not customer support\.[\s\S]*Customer support is not part of the service\./)
  assert.match(s, /Finished videos, with optional raw footage\.[\s\S]*never instead of them\./)
  assert.match(s, /Licensed usage rights\.[\s\S]*not a transfer of copyright ownership\./)
  assert.ok(JSON.stringify(TRUST_CONTENT.about).includes('|/pricing]]'), 'the About page links to Pricing (at-a-glance and What we do; not repeated in this section)')
  assert.ok(!/\$\s?\d|business days|rounds/i.test(s), 'package figures stay on Pricing')
  assert.ok(!/\b(he|she|his|her|him)\b/i.test(aboutText), 'no pronouns assumed for the founder')
})

test('Pricing figures are not duplicated on About and still equal the approved data on the Pricing source', () => {
  assert.ok(!/\$3,000|\$3,500|\$5,000|\$6,000|\$1,500|\$2,500|\$250/.test(aboutText))
  assert.deepEqual([SPRINT.monthly.amount, SPRINT.oneOff.amount, SPRINT_PLUS.monthly.amount, SPRINT_PLUS.oneOff.amount, ORGANIC.light.monthly.amount, ORGANIC.growth.monthly.amount], [3000, 3500, 5000, 6000, 1500, 2500])
  assert.equal(SPRINT.variations, 15); assert.equal(SPRINT_PLUS.variations, 30)
  assert.equal(SPRINT.turnaroundBusinessDays, 10); assert.equal(SPRINT_PLUS.turnaroundBusinessDays, 15)
})

test('shared language wording: "subject to creator availability" in every language answer, and no leftover "subject to availability" in them', () => {
  assert.equal(PRODUCTION_LANGUAGES.other, 'Other languages are available on request, subject to creator availability.')
  const find = (list, re) => list.find((f) => re.test(f.q))
  const answers = [
    [UGC_FAQ, /other languages/i], [SPOKESPERSON_FAQ, /multiple languages/i], [SAAS_FAQ, /multiple languages/i], [ORGANIC_SOCIAL_FAQ, /multiple languages/i], [HOME_FAQ, /other languages/i],
  ].map(([list, re]) => [].concat(find(list, re).a).join(' '))
  for (const a of answers) {
    assert.match(a, /subject to creator availability/)
    assert.ok(!/languages? (on request|are available on request)[^.]*subject to availability/.test(a), 'old wording gone')
  }
})

test('Home FAQ production answer: concise, covers remote, on-location in Spain and other countries by approval; not remote-only; no new FAQ entry', () => {
  assert.equal(HOME_FAQ.length, 12, 'no FAQ entry was added')
  const f = HOME_FAQ.find((x) => /other languages and for other markets/.test(x.q))
  assert.equal(f.a.length, 3)
  assert.equal(f.a[1], `${PRODUCTION_MODEL.text} ${PRODUCTION_MODEL.scope}`)
  assert.ok(homeFaqText(f).split(/\s+/).length < 110, 'concise')
  assert.ok(!/remote[- ]only|cannot film|offices?\b/i.test(homeFaqText(f)))
  const node = homeGraph({})['@graph'].find((n) => n['@type'] === 'FAQPage')
  const q = node.mainEntity.find((x) => x.name === f.q)
  assert.equal(q.acceptedAnswer.text, homeFaqText(f), 'FAQPage JSON-LD equals the visible answer')
})

test('shipping clarification: the rule applies to remote creator production, in both the UGC and Pricing FAQ answers and their JSON-LD', () => {
  assert.equal(PRODUCT_REQUIREMENTS.physical, 'For physical products produced remotely by a creator, you ship the product to the selected creator and cover the shipping costs.')
  const ugc = ugcFaqText(UGC_FAQ.find((f) => f.id === 'scripts-and-strategy'))
  assert.ok(ugc.includes(PRODUCT_REQUIREMENTS.physical))
  const pricing = faqAnswerText(PRICING_FAQ.find((f) => f.id === 'production-requirements'))
  assert.ok(pricing.includes(PRODUCT_REQUIREMENTS.physical))
  const ld = JSON.stringify(faqNode(PRICING_FAQ))
  assert.ok(ld.includes('produced remotely by a creator'))
})

test('Organization JSON-LD: a country-only Spain address once the About page is published; nothing else about location; consistent with the visible About text', () => {
  assert.equal(TRUST_PAGES_PUBLISHED, true)
  const org = organizationNode()
  assert.deepEqual(org.address, { '@type': 'PostalAddress', addressCountry: 'ES' })
  assert.ok(!/streetAddress|addressLocality|postalCode|addressRegion|areaServed|location|foundingDate|numberOfEmployees|legalName|hasOfferCatalog|aggregateRating|review|award/i.test(JSON.stringify(org)), 'no other location or invented fact')
  assert.ok(aboutText.includes('registered in Spain'), 'the visible About text says the same')
  assert.deepEqual(org.sameAs, BRAND.socialProfiles, 'sameAs unchanged')
})

test('PUBLIC_CLAIMS records the two owner-confirmed statements and nothing is left unconfirmed', () => {
  const intl = PUBLIC_CLAIMS.find((c) => c.id === 'international-clients')
  const prod = PUBLIC_CLAIMS.find((c) => c.id === 'production-model')
  assert.equal(intl.claim, INTERNATIONAL_CLIENTS.text); assert.equal(intl.status, 'owner-confirmed')
  assert.equal(prod.claim, PRODUCTION_MODEL.text); assert.equal(prod.status, 'owner-confirmed')
  assert.match(prod.note, /not remote-only/i)
  assert.deepEqual(PUBLIC_CLAIMS.filter((c) => c.status === 'needs-confirmation'), [])
})
