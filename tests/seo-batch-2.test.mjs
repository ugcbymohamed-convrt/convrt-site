// Run with: node --test tests/seo-batch-2.test.mjs
// SEO/GEO Batch 2 (2026-11-21): commercial FAQs, Organic positioning and CTA route, case-study structure and schema, Creator Showcase guide, internal links, the stable service
// entity graph, and the public-claims register. Builds the site once into a temp dir (no network, no lead, email or booking is ever created: the only CTA targets are plain links).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { allLocalizedPaths } from '../src/i18n/paths.js'
import { localizedSitemapPaths } from '../src/lib/seo/sitemap.js'
import { PATHS, KNOWN_PATHS } from '../src/routes.js'
import { SITE_URL, BOOKING_URL, OFFER_PATHS } from '../src/config.js'
import { SITE_SEO, sitemapRoutes } from '../src/seo/siteSeo.js'
import { jsonLdFor, ORG_ID, WEBSITE_ID, serviceId, SERVICE_PATHS } from '../src/seo/structuredData.js'
import { UGC_FAQ, ugcFaqText } from '../src/seo/ugcFaq.js'
import { ORGANIC_SOCIAL_FAQ } from '../src/seo/organicSocialFaq.js'
import { HOME_FAQ, homeFaqText } from '../src/seo/homeFaq.js'
import { SPOKESPERSON_FAQ } from '../src/seo/spokespersonFaq.js'
import { PUBLIC_CLAIMS, PRODUCTION_LANGUAGES, ORGANIC_CTA, SERVICE_LABELS, CORE_SERVICES, REVISIONS, USAGE_RIGHTS } from '../src/seo/businessKnowledge.js'
import { CONVRT_STATS } from '../src/lib/siteStats.js'
import { CASE_STUDIES } from '../src/caseStudies/registry.js'
import { ORGANIC_HERO, ORGANIC_PAGE_CTA } from '../src/content/organicSocialPage.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
let tmp, dist
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')
const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;|&#x2019;/g, '’')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
const ldBlocks = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1].replace(/\\u003c/g, '<')))

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-b2-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

const INDEXABLE = ['/', '/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/creator-showcase', '/case-studies/graspo', '/case-studies/elyon']

// ── the nine indexable URLs are unchanged ────────────────────────────────────────────────
test('the nine indexable URLs stay indexable, self-canonical and in the sitemap; /case-studies still canonicalises to Graspo', () => {
  // The trust pages were published on main (5bf3b50) after Batch 2 began, so the sitemap also lists them; Batch 2 adds no URL of its own.
  const trust = [PATHS.about, PATHS.contact, PATHS.privacy, PATHS.terms, PATHS.legalNotice].filter((p) => p && sitemapRoutes().includes(p))
  assert.deepEqual(sitemapRoutes().sort(), [...INDEXABLE, ...trust].sort())
  for (const p of INDEXABLE) {
    const h = page(p)
    assert.ok(h.includes(`<link rel="canonical" href="${SITE_URL}${p === '/' ? '/' : p}" />`), `${p} canonical`)
    assert.ok(!/<meta name="robots"[^>]*noindex/.test(h), `${p} stays indexable`)
  }
  assert.ok(page('/case-studies').includes(`<link rel="canonical" href="${SITE_URL}/case-studies/graspo" />`))
  // plus the released Spanish translations (src/i18n/release.js): English entries are unchanged
  assert.equal(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').split('<loc>').length - 1, INDEXABLE.length + trust.length + localizedSitemapPaths().length)
})

// ── UGC FAQs ─────────────────────────────────────────────────────────────────────────────
test('UGC page: the two new buyer-decision FAQs are visible, identical to the FAQPage JSON-LD, concise and free of performance promises', () => {
  const ids = UGC_FAQ.map((f) => f.id)
  assert.ok(ids.includes('agency-vs-hiring-creators') && ids.includes('how-to-evaluate-a-ugc-agency'))
  const h = page(PATHS.ugcVideoAgency)
  const t = textOf(h)
  const faq = ldBlocks(h)[0]['@graph'].find((n) => n['@type'] === 'FAQPage')
  assert.equal(faq.mainEntity.length, UGC_FAQ.length)
  UGC_FAQ.forEach((f, i) => {
    assert.equal(faq.mainEntity[i].name, f.q)
    assert.equal(faq.mainEntity[i].acceptedAnswer.text, ugcFaqText(f), `JSON-LD answer equals the data for ${f.id}`)
    assert.ok(t.includes(decode(f.q)), `visible question ${f.id}`)
    for (const para of f.a) assert.ok(t.includes(para), `visible answer ${f.id}`)
  })
  for (const id of ['agency-vs-hiring-creators', 'how-to-evaluate-a-ugc-agency']) {
    const f = UGC_FAQ.find((x) => x.id === id)
    const words = ugcFaqText(f).split(/\s+/).length
    assert.ok(words < 170, `${id} is concise (${words} words)`)
    assert.ok(!/\b(guarantee|best|top|#1|leading|proven|always|never fails)\b/i.test(ugcFaqText(f)), `${id}: no superlative or guarantee`)
    assert.ok(!/employ|our (own )?staff|in-house team of creators/i.test(ugcFaqText(f)), `${id}: does not imply CONVRT employs every creator`)
  }
  const evaluate = ugcFaqText(UGC_FAQ.find((f) => f.id === 'how-to-evaluate-a-ugc-agency'))
  assert.ok(evaluate.includes(`${REVISIONS.roundsPerConcept} rounds of revisions`) && evaluate.includes(`${USAGE_RIGHTS.includedMonths} months of worldwide usage rights`), 'the figures come from the business data')
  const direct = ugcFaqText(UGC_FAQ.find((f) => f.id === 'agency-vs-hiring-creators'))
  assert.match(direct, /Hiring a creator directly can make sense/, 'does not dismiss freelancers')
  assert.match(direct, /in-house talent and freelance creators/, 'the owner-approved talent model')
  // faceless / hands-only is NOT published: no source evidence that CONVRT offers it (owner approval needed)
  assert.ok(!/faceless|hands-only|hands only/i.test(t), 'the faceless / hands-only answer stays a draft for the owner')
})

test('UGC page: contextual links to Spokesperson, SaaS, Elyon and Pricing sit in the FAQ and resolve', () => {
  const root = rootOf(page(PATHS.ugcVideoAgency))
  for (const href of [PATHS.spokespersonVideoProduction, PATHS.saasVideoProduction, PATHS.caseStudyElyon, '/pricing#packages']) assert.ok(root.includes(`href="${href}"`), href)
})

// ── Organic page ─────────────────────────────────────────────────────────────────────────
test('Organic page: one route for every organic CTA (the strategy call), the Roadmap stays only in the global header, scope boundaries are visible', () => {
  assert.equal(ORGANIC_CTA.href, BOOKING_URL)
  assert.equal(ORGANIC_HERO.primary.href, BOOKING_URL)
  assert.equal(ORGANIC_PAGE_CTA.primary.href, BOOKING_URL)
  assert.equal(ORGANIC_HERO.primary.label, ORGANIC_CTA.label)
  const h = rootOf(page(PATHS.socialMediaVideoProduction))
  const main = h.slice(h.indexOf('<main'), h.indexOf('</main>'))
  assert.equal(main.includes(`href="${OFFER_PATHS.roadmap}"`), false, 'no Roadmap link inside the organic page content (it was under the proof result)')
  assert.ok(h.includes(`href="${OFFER_PATHS.roadmap}"`), 'the global header still offers the Roadmap')
  assert.ok((main.match(new RegExp(BOOKING_URL.replace(/[.?]/g, '\\$&'), 'g')) || []).length >= 3, 'hero, proof and final CTA share the strategy call')
  const t = textOf(page(PATHS.socialMediaVideoProduction))
  assert.ok(t.includes('Customer support is not part of the service.') && t.includes('Paid advertising management is outside the organic service scope.'), 'organic management stays distinct from support and paid media')
  assert.ok(/short-form social media video production/.test(t))
  assert.ok(!/content creation agency|social media marketing agency/i.test(t), 'no keyword stuffing of the terms the SERP check rejected')
  const faqLinks = ORGANIC_SOCIAL_FAQ.flatMap((f) => f.links ?? []).map((l) => l.href)
  assert.ok(faqLinks.includes(PATHS.caseStudyGraspo) && faqLinks.includes(BOOKING_URL))
})

test('service label: one short label for service #4 on the homepage card and the footer; the descriptive name stays in the title, H1 and schema', () => {
  assert.equal(SERVICE_LABELS.organic, 'Organic Social Video')
  assert.match(rootOf(page('/')), /<h3[^>]*>Organic Social Video<\/h3>/)
  for (const p of INDEXABLE) assert.match(rootOf(page(p)), /href="\/social-media-video-production"[^>]*>Organic Social Video<\/a>/, `footer on ${p}`)
  assert.ok(SITE_SEO[PATHS.socialMediaVideoProduction].title.includes('Organic Social Media Video Production'))
  assert.ok(!/Social Media Management<\/h3>/.test(rootOf(page('/'))))
})

// ── case studies ─────────────────────────────────────────────────────────────────────────
test('case studies: exactly one H1 per page, one breadcrumb, a related-service line, concise metadata', () => {
  for (const p of ['/case-studies', '/case-studies/graspo', '/case-studies/elyon']) {
    const h = rootOf(page(p))
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, `${p}: one H1`)
    assert.ok(!/<h1[^>]*>\s*Case Studies\s*<\/h1>/.test(h), `${p}: the generic "Case Studies" label is no longer an H1`)
    assert.equal((h.match(/aria-label="Breadcrumb"/g) || []).length, 1, p)
    const levels = [...h.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, `${p}: heading levels never skip (${levels.join(',')})`)
  }
  assert.match(textOf(page('/case-studies/graspo')), /10\.7M views\. 75 inbound leads\./)
  assert.match(textOf(page('/case-studies/elyon')), /Taking a luxury perfume brand from launch into profitable paid-social creative\./)
  for (const p of ['/case-studies/graspo', '/case-studies/elyon']) {
    const e = SITE_SEO[p]
    assert.ok(e.title.length <= 70, `${p} title ${e.title.length}`)
    assert.ok(e.description.length >= 120 && e.description.length <= 160, `${p} description ${e.description.length}`)
  }
  assert.ok(SITE_SEO['/case-studies/graspo'].title.startsWith('Graspo') && SITE_SEO['/case-studies/elyon'].title.startsWith('Elyon Dubai'), 'client names kept')
  assert.ok(SITE_SEO['/case-studies/elyon'].description.includes('client-reported 5.28x ROAS') && SITE_SEO['/case-studies/elyon'].description.includes('one video'), 'the 5.28x qualifier is in the snippet')
  const g = rootOf(page('/case-studies/graspo'))
  const e = rootOf(page('/case-studies/elyon'))
  for (const href of [PATHS.socialMediaVideoProduction, '/pricing#organic']) assert.ok(g.includes(`href="${href}"`), `Graspo → ${href}`)
  for (const href of [PATHS.ugcVideoAgency, '/pricing#packages']) assert.ok(e.includes(`href="${href}"`), `Elyon → ${href}`)
  assert.ok(g.includes(`href="${OFFER_PATHS.roadmap}"`) && e.includes(`href="${OFFER_PATHS.roadmap}"`), 'the existing case-study CTAs are untouched')
  for (const c of CASE_STUDIES) assert.ok(c.related.service.href && c.related.pricing.href)
})

test('case-study structured data: WebPage + BreadcrumbList + the service it exemplifies, an Organization reference, and nothing unsupported', () => {
  for (const [p, svc] of [['/case-studies/graspo', 'organic'], ['/case-studies/elyon', 'ugc']]) {
    const blocks = ldBlocks(page(p))
    assert.equal(blocks.length, 1, p)
    const g = blocks[0]['@graph']
    assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'WebPage', 'BreadcrumbList', 'Service'])
    assert.deepEqual(blocks[0], JSON.parse(JSON.stringify(jsonLdFor(p, SITE_SEO[p]))), 'static HTML equals the manifest graph')
    const web = g[1]
    assert.equal(web.publisher['@id'], ORG_ID)
    assert.equal(web.isPartOf['@id'], WEBSITE_ID)
    assert.equal(web.mentions['@id'], serviceId(svc))
    assert.equal(web.name, SITE_SEO[p].title)
    assert.equal(web.description, SITE_SEO[p].description)
    assert.deepEqual(g[2].itemListElement.map((i) => [i.position, i.item]), [[1, `${SITE_URL}/`], [2, `${SITE_URL}${p}`]], 'two levels: /case-studies is a duplicate and is not a breadcrumb parent')
    assert.ok(!/Article|Review|Rating|"award"|VideoObject|datePublished|dateModified|"author"|"price"/.test(JSON.stringify(g.slice(1))), `${p}: no dates, authors, ratings or prices invented`)
    assert.ok(!/ROAS|views|leads|purchases/.test(JSON.stringify([g[2], g[3]])), `${p}: no result figure outside the page title and description`)
  }
  assert.deepEqual(ldBlocks(page('/case-studies'))[0], ldBlocks(page('/case-studies/graspo'))[0], '/case-studies carries its canonical target (Graspo) markup')
})

// ── Creator Showcase ─────────────────────────────────────────────────────────────────────
test('Creator Showcase: a factual guide below the library, links to the four services, no CONVRT-production claim, no client name, no VideoObject', () => {
  const h = page(PATHS.showcase)
  const t = textOf(h)
  assert.ok(t.includes('What you’ll find in the Creator Showcase'))
  assert.ok(h.indexOf('id="showcase-guide"') > h.indexOf('id="library"') || h.indexOf('id="showcase-guide"') > h.indexOf('Play video:'), 'the guide sits after the library')
  for (const href of [PATHS.ugcVideoAgency, PATHS.spokespersonVideoProduction, PATHS.saasVideoProduction, PATHS.socialMediaVideoProduction, PATHS.caseStudyGraspo, PATHS.caseStudyElyon]) assert.ok(rootOf(h).includes(`href="${href}"`), href)
  assert.ok(t.includes('independent creators') && t.includes('For documented CONVRT projects, read our'), 'the guide keeps the factual intro and the case-study links; the repeated disclaimer is gone')
  assert.ok(!/we produced|produced by CONVRT|our productions/i.test(t.replace(/not necessarily (productions by )?CONVRT productions/g, '')))
  assert.ok(!/VideoObject/.test(h))
  assert.equal((rootOf(h).match(/<h1[\s>]/g) || []).length, 1)
})

// ── structured data: stable entities across the whole site ───────────────────────────────
test('entity graph: four core services with ONE stable @id each, defined identically wherever they appear; every reference resolves; every provider is the Organization', () => {
  assert.deepEqual(Object.keys(SERVICE_PATHS), ['ugc', 'saas', 'spokesperson', 'organic'])
  assert.deepEqual(CORE_SERVICES.map((s) => s.id), ['ugc', 'saas', 'spokesperson', 'organic'])
  const defs = new Map() // @id -> [{ page, node }]
  // ids defined anywhere on the nine pages (a service page may point at a package defined on /pricing, as before)
  const allIds = new Set(INDEXABLE.flatMap((p) => ldBlocks(page(p)).flatMap((b) => b['@graph'].map((n) => n['@id']).filter(Boolean))))
  for (const p of INDEXABLE) {
    for (const block of ldBlocks(page(p))) {
      const nodes = block['@graph']
      const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean))
      for (const n of nodes) {
        if (n['@id']) defs.set(n['@id'], [...(defs.get(n['@id']) ?? []), { p, n }])
        if (n['@type'] === 'Service') assert.equal(n.provider['@id'], ORG_ID, `${p}: ${n.name} provider`)
      }
      const refs = []
      const walk = (v, top) => {
        if (Array.isArray(v)) return v.forEach((x) => walk(x))
        if (v && typeof v === 'object') {
          const keys = Object.keys(v)
          if (keys.length === 1 && keys[0] === '@id') refs.push(v['@id'])
          else Object.entries(v).forEach(([k, x]) => (k === '@id' ? null : walk(x)))
        }
      }
      walk(nodes)
      for (const r of refs) {
        assert.ok(allIds.has(r) || r === WEBSITE_ID || r === ORG_ID, `${p}: reference ${r} resolves to an entity defined on the site`)
        // a page that is ABOUT a service, and the homepage and /pricing (which list them all), define it in their own graph
        if (/#service$/.test(r) && (p === '/' || p === '/pricing' || r.startsWith(`${SITE_URL}${p}#`))) assert.ok(ids.has(r), `${p}: core service ${r} is defined in the same graph that refers to it`)
      }
    }
  }
  for (const slug of Object.keys(SERVICE_PATHS)) {
    const id = serviceId(slug)
    assert.equal(id, `${SITE_URL}${SERVICE_PATHS[slug]}#service`)
    const where = defs.get(id).map((d) => d.p)
    assert.ok(where.includes('/') && where.includes('/pricing') && where.includes(SERVICE_PATHS[slug]), `${slug} defined on the homepage, /pricing and its own page`)
    const core = CORE_SERVICES.find((s) => s.id === slug)
    for (const { p, n } of defs.get(id)) {
      assert.equal(n.name, core.name, `${p}: ${slug} name`)
      assert.equal(n.serviceType, core.serviceType, `${p}: ${slug} serviceType`)
      assert.equal(n.description, core.description, `${p}: ${slug} description is the same everywhere`)
      assert.equal(n.url, `${SITE_URL}${SERVICE_PATHS[slug]}`, `${p}: ${slug} url`)
    }
  }
  // no leftover pricing-page ids for the core services
  for (const p of INDEXABLE) assert.ok(!/pricing#service-(ugc|spokesperson|organic|saas)"/.test(page(p)), `${p}: no pricing#service-<core> id`)
  // Offers stay on /pricing (packages) and on the UGC and Organic pages (the same Offers, built by the same functions); the core nodes on the homepage carry none
  const homeSvc = ldBlocks(page('/'))[0]['@graph'].filter((n) => n['@type'] === 'Service')
  assert.equal(homeSvc.length, 4)
  assert.ok(homeSvc.every((n) => !n.offers))
})

test('structured data on every page: valid JSON, no ratings, reviews, awards, addresses, dates or VideoObject invented; nothing claims a rich result or an AI citation', () => {
  for (const p of INDEXABLE) {
    const blocks = ldBlocks(page(p))
    assert.equal(blocks.length, 1, `${p}: one JSON-LD block`)
    const s = JSON.stringify(blocks)
    assert.ok(!/aggregateRating|"Review"|"review"|"award"|"address"|"datePublished"|"foundingDate"|"Article"/.test(s.replace('"address":{"@type":"PostalAddress","addressCountry":"ES"}', '')), `${p}: nothing invented (only the country of registration is an address)`)
    assert.ok(!/rich result|citation|guarantee/i.test(s.replace(/We can[’']t guarantee ad performance/g, '').replace(/guarantee/gi, (m) => (/never guarantee|not guarantee|can't guarantee|can’t guarantee/i.test(s) ? '' : m))), `${p}: no claim about rich results or citations`)
  }
  assert.ok(!/VideoObject/.test(ldBlocks(page(PATHS.showcase)).map((b) => JSON.stringify(b)).join('')), 'VideoObject stays off until real upload dates exist')
})

// ── claims ───────────────────────────────────────────────────────────────────────────────
test('public claims register: every claim has a source and a status; the figures on the pages are the register\'s, from one place; nothing was silently changed', () => {
  assert.ok(PUBLIC_CLAIMS.length >= 12)
  for (const c of PUBLIC_CLAIMS) {
    assert.ok(c.id && c.claim && c.appears && c.source, c.id)
    assert.ok(['owner-confirmed', 'published-client-reported', 'needs-confirmation'].includes(c.status), `${c.id}: status`)
    if (c.proposed) assert.notEqual(c.proposed, c.claim, `${c.id}: a proposal is never applied`)
  }
  // unchanged figures
  assert.deepEqual(CONVRT_STATS, { videos: '1,200+', views: '40M+', clients: '500+', returningClients: '50%+' })
  assert.equal(PRODUCTION_LANGUAGES.arabicDialects, 'Gulf and Moroccan Arabic dialects')
  const h = textOf(page('/'))
  assert.ok(h.includes('500+ clients') && !h.includes('500+ brands') && h.includes('1,200+') && h.includes('40M+') && h.includes('50%+'))
  assert.ok(!/50%\+/.test(read('src/components/FinalCTA.jsx')) || /CONVRT_STATS\.returningClients/.test(read('src/components/FinalCTA.jsx')), 'the 50%+ figure is read from the stats file, not typed')
  // the dialect clause is exactly the same sentence on the three pages that carry it, and absent from the Organic FAQ (kept concise: the dialect story is for the future Arabic site)
  for (const f of [HOME_FAQ.find((x) => /other languages/.test(x.q)), UGC_FAQ.find((x) => x.id === 'languages-and-international'), SPOKESPERSON_FAQ.find((x) => /languages/i.test(x.q))]) {
    assert.ok([].concat(f.a).join(' ').includes(`including ${PRODUCTION_LANGUAGES.arabicDialects}`), f.q)
  }
  assert.ok(!ORGANIC_SOCIAL_FAQ.some((f) => /dialect|Darija/i.test(f.a.join(' '))))
  assert.ok(!/Darija/.test(textOf(page('/'))), 'no expanded dialect messaging on the English homepage')
  // the homepage FAQ text and JSON-LD still match after centralising the wording
  const faq = ldBlocks(page('/'))[0]['@graph'].find((n) => n['@type'] === 'FAQPage')
  HOME_FAQ.forEach((f, i) => assert.equal(faq.mainEntity[i].acceptedAnswer.text, homeFaqText(f)))
  // after the owner's review (2026-11-21) no claim is left unconfirmed, and the ambiguous Graspo teaser is replaced by the documented metric
  assert.deepEqual(PUBLIC_CLAIMS.filter((c) => c.status === 'needs-confirmation'), [])
  assert.ok(!PUBLIC_CLAIMS.some((c) => c.id === 'graspo-from-zero'))
  for (const c of CASE_STUDIES.filter((x) => x.id === 'graspo')) {
    assert.equal(c.blurb, '10.7M organic views generated through our work with Graspo.')
    assert.equal(c.descriptor, '10.7M Organic Views')
  }
  for (const h of [rootOf(page('/case-studies/elyon')), rootOf(page('/case-studies/graspo'))]) assert.ok(!/10M\+|From zero/.test(h), 'no ambiguous Graspo wording anywhere in the rendered case-study pages')
  assert.ok(!/10M\+|From zero/.test(rootOf(page('/')) + rootOf(page('/scale'))), 'nor on the homepage or /scale')
  const g = SITE_SEO['/case-studies/graspo']
  assert.ok(g.title.includes('10.7M') && g.description.includes('10.7M') && g.description.includes('January to June 2026'), 'metadata states the documented figure and period')
})

// ── links ────────────────────────────────────────────────────────────────────────────────
test('every internal link on every prerendered page resolves to a real page, section or file', () => {
  const known = new Set([...KNOWN_PATHS, '/blog', '/es', ...allLocalizedPaths(['es', 'fr', 'ar'])])
  const bad = []
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  const files = walk(dist).filter((f) => f.endsWith('index.html'))
  for (const f of files) {
    const rel = path.relative(dist, f)
    const route = rel === 'index.html' ? '/' : `/${path.dirname(rel)}`
    const html = rootOf(fs.readFileSync(f, 'utf8'))
    for (const m of html.matchAll(/<a [^>]*href="(\/[^"#?]*)(#[^"]*)?"/g)) {
      const p = m[1] === '/' ? '/' : m[1].replace(/\/$/, '')
      if (known.has(p) || /\.(?:png|svg|webp|jpg|pdf|xml|txt)$/.test(p) || p.startsWith('/blog/')) continue
      if (['/creator-onboarding', '/creator-admin'].some((x) => p.startsWith(x))) continue
      bad.push(`${route} → ${m[1]}`)
    }
  }
  assert.deepEqual(bad, [])
  // anchors used by the new links exist on their pages
  assert.ok(rootOf(page('/pricing')).includes('id="packages"'), '/pricing#packages target exists')
  assert.match(read('src/CreativeTestingSprintPage.jsx'), /window\.location\.hash !== '#organic'/, '/pricing#organic is handled by the pricing page (opens the Organic packages after mount)')
})

// ── what Batch 2 must not touch ──────────────────────────────────────────────────────────
test('exclusions: no change to forms, lead APIs, analytics config, legal pages, package prices or the trust-page gate', () => {
  const cfg = read('src/config.js')
  assert.match(cfg, /export const BOOKING_URL = 'https:\/\/calendly\.com\/mohamed-convrt\/30min'/)
  for (const f of ['api/_lib/subscribe.js', 'api/_lib/notify.js', 'src/lib/analytics.js', 'src/content/trustPages.js']) assert.ok(fs.existsSync(path.join(ROOT, f)), f)
  assert.ok(!/VITE_GTM_ID\s*=\s*\S/.test(read('.env.example') || ''), 'no analytics ID is set by this batch')
})
