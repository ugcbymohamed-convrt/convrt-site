// Run with: node --test tests/homepage.test.mjs
// Homepage SEO/GEO phase 1: metadata, FAQ data, services copy, structured data (pure checks). The raw-HTML checks on the built
// homepage live in tests/prerender.test.mjs.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_SEO, pageHead } from '../src/seo/siteSeo.js'
import { HOME_FAQ, homeFaqText } from '../src/seo/homeFaq.js'
import { homeGraph, jsonLdFor, ORG_ID, WEBSITE_ID } from '../src/seo/structuredData.js'
import { SITE_URL } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const faq = (frag) => HOME_FAQ.find((f) => f.q.includes(frag))
const graph = () => homeGraph(SITE_SEO['/'])['@graph']

test('homepage title and description: approved wording, within search-result lengths, unique among pages', () => {
  const e = SITE_SEO['/']
  assert.equal(e.title, 'Video Marketing Agency | UGC Ads & Organic Social | CONVRT')
  assert.equal(e.description, 'Human-led UGC ads, spokesperson videos and organic social video for SaaS, e-commerce and app brands, produced in English, Spanish, French and Arabic.')
  assert.ok(e.title.length <= 60 && e.description.length <= 160)
  for (const [p, o] of Object.entries(SITE_SEO)) if (p !== '/' && o.title) assert.ok(o.title !== e.title && o.description !== e.description, p)
  assert.equal(pageHead('/').url, `${SITE_URL}/`)
  assert.equal(pageHead('/').noindex, false)
  const html = read('index.html')
  assert.ok(html.includes('<title>Video Marketing Agency | UGC Ads &amp; Organic Social | CONVRT</title>'))
  assert.ok(!/Performance Creative Studio for Paid Social/.test(html + read('src/seo/siteSeo.js')))
})

test('homepage FAQ: the approved questions and wording; no unverified claims; no promised results', () => {
  assert.equal(HOME_FAQ.length, 12)
  assert.equal(new Set(HOME_FAQ.map((f) => f.q)).size, HOME_FAQ.length)
  for (const f of HOME_FAQ) assert.ok(f.q.endsWith('?') && homeFaqText(f).length > 40, f.q)
  assert.match(homeFaqText(faq('What is a video marketing agency')), /creative production and strategy partner/)
  assert.match(homeFaqText(faq('What is a video marketing agency')), /We don't buy media or manage your advertising accounts/)
  assert.match(homeFaqText(faq('UGC video and a spokesperson video')), /We don't present paid creators as genuine customers\./)
  const saas = homeFaqText(faq('SaaS explainer'))
  assert.match(saas, /we work with you to obtain suitable product access, demonstrations or reference materials when needed/)
  assert.ok(!/(must|need to|require[sd]?|have to) (provide|supply)|dedicated demo account/i.test(saas), 'no implied mandatory demo account')
  const lang = homeFaqText(faq('other languages'))
  assert.match(lang, /English, Spanish, French and Arabic/); assert.match(lang, /subject to availability/)
  const all = HOME_FAQ.map(homeFaqText).join(' ')
  assert.ok(!/significantly better results/i.test(all), 'unsubstantiated retainer claim removed')
  assert.ok(!/personally approved by the founder/i.test(all), 'founder-approval claim removed')
  const diff = homeFaqText(faq('What makes CONVRT different'))
  assert.match(diff, /Every project goes through our internal creative quality review\./)
  assert.match(diff, /CONVRT is a founder-led creative studio/)
  assert.ok(!/prolific|personally produced|deeply understands/i.test(all), 'unsubstantiated founder claim replaced by a neutral, published description')
  assert.ok(!/guarantee|rich result|AI citation|rank/i.test(all))
})

test('homepage FAQ matches /pricing: delivery, retainers and process', () => {
  const d = faq('How fast is delivery'); const r = faq('monthly retainers'); const p = faq('process of working')
  assert.match(homeFaqText(d), /10 business days for the Creative Testing Sprint and 15 business days for Sprint Plus, starting once you have approved the creative concepts and scripts/)
  assert.match(homeFaqText(r), /3-month commitment, then run month-to-month with 30 days’ cancellation notice/)
  assert.match(homeFaqText(r), /Organic Social partnerships start with an initial 6-month commitment/)
  assert.match(homeFaqText(r), /One-off projects are also available/)
  for (const f of [d, r]) assert.deepEqual(f.link, { label: 'See packages and pricing', href: '/pricing' })
  const t = homeFaqText(p)
  for (const stage of ['Strategy: brand discovery, audience research and creative concepts', 'Preparation: creator selection, scripts and your approval', 'Production: filming, editing, captions and creative variations', 'Delivery: finished videos, revisions and testing recommendations']) assert.ok(t.includes(stage), stage)
})

test('FAQ component renders the shared data (and its links); services/hero/footer copy as approved', () => {
  assert.match(read('src/components/FAQ.jsx'), /import \{ HOME_FAQ \} from '\.\.\/seo\/homeFaq\.js'/)
  assert.match(read('src/components/FAQ.jsx'), /const FAQS = HOME_FAQ/)
  const svc = read('src/components/Services.jsx')
  for (const t of ['Human-led UGC video ads for Meta, TikTok and YouTube: concepts, creator casting, scripts, filming and editing.', 'Presenter-led video ads that explain your offer clearly and build trust, from casting to finished edit.', 'Organic short-form video for Instagram, TikTok and Facebook: strategy, production, publishing and community engagement.', 'Concepts, hooks, scripts and structured testing plans that show you what to make next.', 'Video creative for<br />', 'paid and organic social.', 'Creative strategy and full video production,{\' \'}<br', 'from concept and creator casting to finished, platform-ready videos.', 'Explore packages and pricing']) assert.ok(svc.includes(t), t)
  assert.ok(!/Built for modern|Explore the Creative Testing Sprint|Compare packages and pricing/.test(svc))
  assert.match(svc, /<a href="\/pricing"[^>]*>\s*Explore packages and pricing\s*<\/a>/, 'link keeps its /pricing destination')
  assert.ok(read('src/components/Hero.jsx').includes('Human-led UGC ads, spokesperson videos, and organic social content designed to capture attention, build trust, and drive conversions.'))
  assert.match(read('src/components/Footer.jsx'), /href="\/pricing">Pricing<\/a>/)
  const cs = read('src/components/CaseStudies.jsx')
  assert.ok(cs.includes('href="/case-studies/graspo"') && cs.includes('href="/case-studies/elyon"') && !cs.includes('case=elyon'), 'case-study links point at the canonical study pages')
  assert.ok(!/activeId === 'graspo' && \(/.test(cs.slice(cs.indexOf('Always-present'))), 'the links are no longer conditional on the selected tab')
})

test('H1: the animated heading is unchanged visually; its text is clean (no duplicate sizing word, spaces between lines)', () => {
  const hero = read('src/components/Hero.jsx')
  assert.match(hero, /<span className="block">Performance creatives<\/span>\{' '\}/)
  assert.match(hero, /data-word=\{widest\} className="invisible whitespace-pre after:content-\[attr\(data-word\)\]"/)
  assert.match(hero, /aria-hidden="true" data-word/)
  assert.ok(hero.includes("const ROTATING_WORDS = ['convert', 'resonate', 'sell', 'connect']"), 'same rotating words')
  assert.match(hero, /animate-word-in/)
})

test('homepage JSON-LD: WebPage + 3 Services (same ids as /pricing) + FAQPage from the visible FAQ; nothing invented', () => {
  const g = graph()
  assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'WebSite', 'WebPage', 'Service', 'Service', 'Service', 'FAQPage'])
  const page = g.find((n) => n['@type'] === 'WebPage')
  assert.equal(page['@id'], `${SITE_URL}/#webpage`); assert.equal(page.url, `${SITE_URL}/`)
  assert.equal(page.name, SITE_SEO['/'].title); assert.equal(page.description, SITE_SEO['/'].description)
  assert.equal(page.isPartOf['@id'], WEBSITE_ID); assert.equal(page.about['@id'], ORG_ID)
  const services = g.filter((n) => n['@type'] === 'Service')
  assert.deepEqual(services.map((s) => s['@id']), [`${SITE_URL}/pricing#service-ugc`, `${SITE_URL}/pricing#service-spokesperson`, `${SITE_URL}/pricing#service-organic`])
  for (const s of services) { assert.equal(s.provider['@id'], ORG_ID); assert.ok(!s.offers, 'no prices on the homepage services') }
  const f = g.find((n) => n['@type'] === 'FAQPage')
  assert.deepEqual(f.mainEntity.map((q) => q.name), HOME_FAQ.map((x) => x.q))
  f.mainEntity.forEach((q, i) => assert.equal(q.acceptedAnswer.text, HOME_FAQ[i].a instanceof Array ? HOME_FAQ[i].a.join(' ') : HOME_FAQ[i].a))
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed|potentialAction/.test(JSON.stringify(g)))
  // every @id reference resolves inside this graph
  const ids = new Set(g.map((n) => n['@id']).filter(Boolean))
  const refs = []; const walk = (v) => { if (Array.isArray(v)) return v.forEach(walk); if (v && typeof v === 'object') { if (Object.keys(v).length === 1 && v['@id']) refs.push(v['@id']); Object.values(v).forEach(walk) } }
  walk(g); for (const r of refs) assert.ok(ids.has(r), `dangling ${r}`)
  assert.equal(JSON.stringify(jsonLdFor('/', SITE_SEO['/'])), JSON.stringify(homeGraph(SITE_SEO['/'])))
})

test('research stays private: research/ is git-ignored and nothing from it is in public/ or the repo tree', () => {
  assert.match(read('.gitignore'), /^research\/$/m)
  assert.ok(!fs.existsSync(path.join(ROOT, 'public', 'research')))
  const tracked = fs.readdirSync(ROOT).filter((n) => /keyword|reddit|research/i.test(n) && n !== 'research')
  assert.deepEqual(tracked, [])
})

test('hero subtitle: general positioning only; industries and language lists live in the FAQ and case studies, not the hero', () => {
  const hero = read('src/components/Hero.jsx')
  assert.ok(hero.includes('Human-led UGC ads, spokesperson videos, and organic social content designed to capture attention, build trust, and drive conversions.'))
  const sub = hero.slice(hero.indexOf('Human-led UGC ads'), hero.indexOf('</p>', hero.indexOf('Human-led UGC ads')))
  assert.ok(!/SaaS|e-commerce|ecommerce|app brands|English|Spanish|French|Arabic|languages?/i.test(sub), 'no industry or language restriction in the hero')
  // the specific capabilities are still published where they belong
  assert.match(homeFaqText(HOME_FAQ.find((f) => f.q.includes('other languages'))), /English, Spanish, French and Arabic/)
  // metadata is a separate decision and is unchanged
  assert.equal(SITE_SEO['/'].description, 'Human-led UGC ads, spokesperson videos and organic social video for SaaS, e-commerce and app brands, produced in English, Spanish, French and Arabic.')
})
