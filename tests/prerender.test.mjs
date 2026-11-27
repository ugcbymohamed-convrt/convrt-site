// Run with: node --test tests/prerender.test.mjs
// SEO phase 4: every public page ships as real, server-rendered HTML (readable without JavaScript).
//
//  1. Pure checks: head spec → HTML, injection into the shell, which head a route gets, when the browser may hydrate.
//  2. A real production build into a temp dir, then raw-HTML assertions per route: exactly one title / canonical /
//     description, robots matching the indexing flags, real headings, body text and internal links, a canonical
//     that matches the sitemap, and no leftovers (suspense fallbacks, escaped <style>).
//  Hydration itself (React attaching to this markup without mismatches) is browser behaviour: it is verified in a
//  real browser in the phase 4 report, and `window.__hydrationErrors` (src/main.jsx) records any mismatch.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { buildHeadSpec } from '../src/lib/headSpec.js'
import { headSpecToHtml, injectPage, stripManagedHead } from '../src/lib/routes/headTags.js'
import { headParamsFor } from '../src/lib/routes/headFor.js'
import { canHydrate } from '../src/lib/routes/hydration.js'
import { KNOWN_PATHS, PATHS } from '../src/routes.js'
import { SITE_SEO, pageHead, canonicalPathFor, urlFor, sitemapRoutes } from '../src/seo/siteSeo.js'
import { SITE_URL } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

// ── pure checks ────────────────────────────────────────────────────────────────────────
test('head spec: same tags the client hook has always set, escaped for HTML', () => {
  const spec = buildHeadSpec({ title: 'A & B "quoted" <x>', description: "It's d", url: 'https://www.convrt.studio/x', noindex: true })
  const html = headSpecToHtml(spec)
  assert.match(html, /<title>A &amp; B &quot;quoted&quot; &lt;x&gt;<\/title>/)
  assert.match(html, /<meta name="description" content="It's d" \/>/)
  assert.match(html, /<meta property="og:url" content="https:\/\/www\.convrt\.studio\/x" \/>/)
  assert.match(html, /<meta name="robots" content="noindex" \/>/)
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.convrt\.studio\/x" \/>/)
  assert.match(html, /<meta name="twitter:card" content="summary" \/>/)
})

test('head spec: no url → no canonical and no og:url; robots string wins over noindex', () => {
  const html = headSpecToHtml(buildHeadSpec({ title: 't', description: 'd', robots: 'noindex, follow', noindex: false }))
  assert.ok(!/canonical|og:url/.test(html))
  assert.match(html, /content="noindex, follow"/)
})

test('head spec: JSON-LD is marked static and "<" can never close the script tag', () => {
  const html = headSpecToHtml(buildHeadSpec({ title: 't', description: 'd', url: 'https://x/', jsonLd: { '@type': 'Thing', name: '</script><b>' } }))
  assert.match(html, /<script type="application\/ld\+json" data-blog-jsonld="static">/)
  assert.ok(!/<\/script><b>/.test(html))
  assert.match(html, /\\u003c\/script>/)
})

test('client hook and static head are built from the SAME spec (cannot drift)', () => {
  assert.match(read('src/lib/useDocumentHead.js'), /import \{ buildHeadSpec[^}]*\} from '\.\/headSpec\.js'/)
  assert.match(read('src/lib/useDocumentHead.js'), /buildHeadSpec\(/)
  assert.match(read('vite-plugin-static-routes.js'), /buildHeadSpec\(headParamsFor\(/)
})

test('injectPage: "$" in head text (prices like $1,500) is copied literally, never read as a replacement pattern', () => {
  const head = headSpecToHtml(buildHeadSpec({ title: 'From $1,500 & $2,000 $& $1', description: 'Costs $1,125 or $&', url: 'https://www.convrt.studio/p' }))
  const page = injectPage(read('index.html'), { headHtml: head, bodyHtml: '<p>$1 $&</p>', ssrPath: '/p' })
  assert.ok(page.includes('<title>From $1,500 &amp; $2,000 $&amp; $1</title>'))
  assert.ok(page.includes('content="Costs $1,125 or $&amp;"'))
  assert.ok(page.includes('<p>$1 $&</p>'))
})

test('injectPage: replaces the shell defaults (one of each tag), fills #root, stamps the path', () => {
  const shell = read('index.html')
  const head = headSpecToHtml(buildHeadSpec({ title: 'New', description: 'New desc', url: 'https://www.convrt.studio/new' }))
  const page = injectPage(shell, { headHtml: head, bodyHtml: '<p>hello</p>', ssrPath: '/new' })
  const h = page.slice(0, page.indexOf('</head>'))
  for (const [re, label] of [[/<title>/g, 'title'], [/name="description"/g, 'description'], [/property="og:title"/g, 'og:title'], [/rel="canonical"/g, 'canonical']]) {
    assert.equal((h.match(re) || []).length, 1, label)
  }
  assert.ok(page.includes('<div id="root" data-ssr-path="/new"><p>hello</p></div>'))
  assert.ok(!page.includes('Performance Creative Studio for Paid Social'), 'the shell default title must be gone')
  assert.ok(page.includes('rel="preload" href="/fonts/inter-latin.woff2"'), 'other head content is preserved')
  assert.throws(() => injectPage('<html></html>', { headHtml: '', bodyHtml: '', ssrPath: '/' }))
  assert.equal((stripManagedHead(shell).match(/<title>/g) || []).length, 0)
})

test('which head a route gets: manifest for pages, blog helpers for the blog, default study for /case-studies', () => {
  assert.equal(headParamsFor('/pricing').title, SITE_SEO['/pricing'].title)
  assert.equal(headParamsFor('/case-studies').url, `${SITE_URL}/case-studies/graspo`)
  assert.equal(headParamsFor('/case-studies/elyon').url, `${SITE_URL}/case-studies/elyon`)
  assert.equal(headParamsFor('/').url, `${SITE_URL}/`)
  const idx = headParamsFor('/blog', [])
  assert.equal(idx.url, `${SITE_URL}/blog`)
  assert.match(idx.robots, /noindex/)
  const meta = { slug: 'hello', title: 'Hello', excerpt: 'E', category: 'creative-strategy', categoryLabel: 'Creative Strategy', status: 'published', author: 'Me', publishedAt: '2026-01-10', related: [], faq: [], toc: 'auto', noindex: false }
  const art = headParamsFor('/blog/hello', [meta])
  assert.equal(art.url, `${SITE_URL}/blog/hello`)
  assert.ok(Array.isArray(art.jsonLd) && art.jsonLd.some((j) => j['@type'] === 'BlogPosting'), 'articles carry BlogPosting data')
  assert.throws(() => headParamsFor('/blog/missing', [meta]), /no published en article/)
})

test('hydration rule: only hydrate markup rendered for this exact URL; ?case= / #study URLs render fresh', () => {
  const ok = (o) => canHydrate({ ssrPath: o.pathname.replace(/\/$/, '') || '/', ...o })
  assert.equal(ok({ pathname: '/pricing' }), true)
  assert.equal(ok({ pathname: '/pricing/', search: '?utm_source=x', hash: '#top' }), true)
  assert.equal(canHydrate({ pathname: '/pricing', ssrPath: '/scale' }), false)
  assert.equal(canHydrate({ pathname: '/anything', ssrPath: undefined }), false, '404.html has no prerendered markup')
  assert.equal(ok({ pathname: '/case-studies' }), true)
  assert.equal(ok({ pathname: '/case-studies', search: '?case=graspo' }), true, 'the default study equals the static HTML')
  assert.equal(ok({ pathname: '/case-studies', search: '?case=elyon' }), false)
  assert.equal(ok({ pathname: '/case-studies', hash: '#elyon' }), false)
  assert.equal(ok({ pathname: '/case-studies', search: '?case=bogus' }), true)
  assert.equal(ok({ pathname: '/case-studies/elyon', search: '?case=graspo' }), true, 'the path wins over the query')
})

// ── real build, raw HTML ──────────────────────────────────────────────────────────────────
let tmp, dist
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const visibleText = (h) => rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
const count = (s, re) => (s.match(re) || []).length

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-prerender-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('every public route: its own title, ONE canonical equal to the manifest, description, robots per indexing flag', () => {
  for (const p of KNOWN_PATHS) {
    if (p === PATHS.blog) continue // the blog index has its own helpers; checked below
    const h = page(p)
    const head = headOf(h)
    const want = pageHead(canonicalPathFor(p))
    assert.equal(count(head, /<title>/g), 1, `${p}: title count`)
    assert.ok(head.includes(`<link rel="canonical" href="${want.url}" />`), `${p}: canonical`)
    assert.equal(count(head, /rel="canonical"/g), 1, `${p}: canonical count`)
    assert.equal(count(head, /name="description"/g), 1, `${p}: description count`)
    assert.equal(count(head, /property="og:title"/g), 1, `${p}: og:title count`)
    assert.equal(count(head, /name="robots"/g), want.robots || want.noindex ? 1 : 0, `${p}: robots count`)
    const robots = (head.match(/name="robots" content="([^"]*)"/) || [])[1]
    assert.equal(robots, want.robots ?? (want.noindex ? 'noindex' : undefined), `${p}: robots value`)
    assert.ok(!head.includes('<title>Performance Creative Agency | CONVRT</title>') || p === '/', `${p}: homepage title leaked into another route`)
  }
})

test('noindex is preserved in the HTML itself: indexable pages carry no robots tag, the others do', () => {
  for (const p of sitemapRoutes()) assert.ok(!/name="robots"/.test(headOf(page(p))), `${p} is in the sitemap and must not be noindex`)
  for (const p of [PATHS.roadmap, PATHS.hooks, PATHS.riskFree, PATHS.referrals]) assert.match(headOf(page(p)), /name="robots" content="noindex"/, p)
  assert.match(headOf(page(PATHS.scale)), /name="robots" content="noindex, follow"/)
  assert.match(headOf(page(PATHS.blog)), /name="robots" content="noindex, follow"/)
})

test('every route contains real content in the raw HTML: headings, body text, internal links', () => {
  for (const p of KNOWN_PATHS) {
    const h = page(p)
    assert.ok(count(rootOf(h), /<h1[\s>]/g) >= 1, `${p}: no <h1>`)
    // /creator-showcase is a video library by design (a short intro, then the cards): no padding text is added just for length.
    // /project-application is a conversion utility (a headline, the package chooser, a link back to pricing): no padding text either.
    const minText = p === PATHS.showcase || p === PATHS.projectApplication ? 800 : 1200
    assert.ok(visibleText(h).length > minText, `${p}: only ${visibleText(h).length} chars of text`)
    assert.ok(count(rootOf(h), /<a [^>]*href="\/[^"#]/g) >= 5, `${p}: too few internal links`)
    assert.ok(h.includes(`<div id="root" data-ssr-path="${p}">`), `${p}: ssr path stamp`)
    assert.ok(!/<!--\$!-->/.test(h), `${p}: contains a Suspense fallback (server render did not finish)`)
  }
})

test('homepage: headline, services copy, CTAs and links are in the initial HTML', () => {
  const h = page('/')
  const text = visibleText(h)
  assert.match(text, /Creatives designed to/)
  assert.match(text, /Spokesperson Videos/, 'services copy')
  assert.match(text, /Things brands usually ask\./, 'FAQ copy')
  assert.match(text, /Get 5 Free Ad Concepts/)
  for (const href of [PATHS.roadmap, PATHS.riskFree, PATHS.hooks, PATHS.caseStudies, PATHS.pricing]) assert.ok(rootOf(h).includes(`href="${href}"`), href)
  assert.equal(count(headOf(h), /rel="canonical" href="https:\/\/www\.convrt\.studio\/"/g), 1)
  assert.match(headOf(h), /property="og:title" content="CONVRT — Performance creatives that convert\."/)
})

test('case studies: each URL carries its own study in the HTML, with its own title and canonical', () => {
  const g = visibleText(page('/case-studies/graspo'))
  const e = visibleText(page('/case-studies/elyon'))
  assert.match(g, /10\.7M views\. 75 inbound leads\./)
  assert.ok(!/Taking a luxury perfume brand/.test(g))
  assert.match(e, /Taking a luxury perfume brand/)
  assert.ok(!/10\.7M views\. 75 inbound leads\./.test(e))
  assert.match(headOf(page('/case-studies/graspo')), /<title>Graspo Case Study/)
  assert.match(headOf(page('/case-studies/elyon')), /<title>Elyon Dubai Case Study/)
  // /case-studies is the default study, canonicalised to it.
  assert.equal(visibleText(page('/case-studies')), g)
  assert.ok(headOf(page('/case-studies')).includes(`<link rel="canonical" href="${SITE_URL}/case-studies/graspo" />`))
})

test('sitemap ↔ HTML: every sitemap URL has a prerendered page whose canonical is that exact URL', () => {
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  assert.ok(locs.length >= 4)
  for (const loc of locs) {
    const p = new URL(loc).pathname
    assert.ok(headOf(page(p)).includes(`<link rel="canonical" href="${loc}" />`), `${loc}`)
  }
})

test('blog index: noindex, CollectionPage data once, canonical, content', () => {
  const h = page(PATHS.blog)
  const head = headOf(h)
  assert.ok(head.includes(`<link rel="canonical" href="${SITE_URL}/blog" />`))
  assert.equal(count(head, /type="application\/ld\+json"/g), 1)
  assert.match(head, /"@type":"CollectionPage"/)
  assert.ok(visibleText(h).length > 800)
})

test('no escaped text inside <style> (browsers read it literally; React escapes it on the server)', () => {
  for (const p of KNOWN_PATHS) {
    for (const m of page(p).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      assert.ok(!/&(#x?[0-9a-f]+|amp|quot|lt|gt);/i.test(m[1]), `${p}: escaped entity inside <style>`)
    }
  }
})

test('404.html stays an empty, noindex shell; the shell template itself is not route-specific', () => {
  const nf = fs.readFileSync(path.join(dist, '404.html'), 'utf8')
  assert.ok(nf.includes('<div id="root"></div>'))
  assert.match(headOf(nf), /name="robots" content="noindex, follow"/)
  assert.match(headOf(nf), /<title>Page not found \| CONVRT<\/title>/)
  assert.ok(!/rel="canonical"/.test(headOf(nf)))
})

test('production bundle: hydration wiring present, nothing server-only shipped to the browser', () => {
  const assets = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js'))
  const all = assets.map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
  assert.ok(/data-ssr-path|ssrPath/.test(all) || /ssrPath/.test(all), 'main entry must read the ssr path')
  assert.ok(!/renderToPipeableStream/.test(all), 'react-dom/server must not reach the browser bundle')
  // Each build writes to node_modules/.convrt-ssr/<pid>-<time>. Other test files run in parallel processes and may have a build in flight,
  // so only THIS process's folders count as leftovers.
  const ssrRoot = path.join(ROOT, 'node_modules', '.convrt-ssr')
  const mine = fs.existsSync(ssrRoot) ? fs.readdirSync(ssrRoot).filter((d) => d.startsWith(`${process.pid}-`)) : []
  assert.deepEqual(mine, [], 'temporary SSR build output must be cleaned up')
})

// ── SEO/GEO phase 1: the pricing page and its structured data, read from the raw HTML (no JavaScript) ──────────────
import { PRICING_FAQ } from '../src/seo/pricingFaq.js'
import { OFFER_PATHS } from '../src/config.js'

const ldScripts = (h) => [...headOf(h).matchAll(/<script type="application\/ld\+json" data-blog-jsonld="static">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1].replace(/\\u003c/g, '<')))
const unescape = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

test('/pricing HTML: title, description, ONE canonical, indexable, and the pricing graph, all before any JavaScript', () => {
  const h = page('/pricing')
  const head = headOf(h)
  assert.match(head, /<title>UGC &amp; Video Production Pricing \| CONVRT Studio<\/title>/)
  assert.ok(head.includes(`<link rel="canonical" href="${SITE_URL}/pricing" />`))
  assert.equal(count(head, /rel="canonical"/g), 1)
  assert.ok(!/name="robots"/.test(head), 'pricing stays indexable')
  const scripts = ldScripts(h)
  assert.equal(scripts.length, 1, 'exactly one JSON-LD block (the client hook replaces, never adds)')
  const types = scripts[0]['@graph'].map((n) => n['@type'])
  for (const t of ['Organization', 'WebPage', 'Service', 'FAQPage']) assert.ok(types.includes(t), t)
  assert.ok(!types.includes('BreadcrumbList'), 'the pricing page shows no breadcrumb trail, so it carries no BreadcrumbList (Phase 5)')
  // Same data as the manifest hands to the client hook, so hydration cannot change it.
  assert.deepEqual(scripts[0], JSON.parse(JSON.stringify(pageHead('/pricing').jsonLd)))
})

test('/pricing HTML: every confirmed price, term and policy is in the visible markup', () => {
  const text = unescape(visibleText(page('/pricing')))
  for (const needle of [
    '$3,000', '$5,000', '$3,500', '$6,000', '$1,500', '$2,500', '10 distinct creative concepts', '10 complete scripts', '3 versions per concept, changing the hook or CTA', 'Filming, editing, captions & final delivery', 'Includes expanded research and testing recommendations.',
    'Different concepts. Not just different hooks.', '5 original concepts → 15 finished ad versions',
    'A concept is a unique ad idea.', 'A variation changes its hook or CTA.',
    'initial three-month commitment', "30 days' cancellation notice",
    'All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.',
    'The details.', 'Everything you need to know before getting started.', 'Usage rights', 'Extend your 6 months', 'How we work', 'Production & extras', '6 months of worldwide usage rights', 'date each video is delivered',
    'Your creative partner.', 'What are you looking to achieve?', 'Scale my ads', 'Grow my socials', 'Consistency. Content. Real connections.', 'Strategy', 'Publishing & engagement', 'Your next 5 winning ad concepts.', 'Ready to create something that converts?',
    'Organic partnerships begin with an initial six-month commitment', 'Why is there a six-month minimum commitment for organic social media?', 'Terms after the initial six-month period are set out in the applicable agreement.', 'Custom project terms are agreed individually.',
    '$937.50', '$1,500', '$2,625', '$1,687.50', '$2,700', '$4,725', 'Perpetual usage',
    'Paid advertising use must stop', 'Existing organic social media posts may remain published',
    'TikTok Spark Ads', 'Meta partnership ads', 'separate from the standard usage rights',
    '$250 per creative concept', '10 business days', '15 business days',
    'not unlimited', 'charged in full', 'Horizontal 16:9 production counts as a separate video', 'Square 1:1 reframing',
    'Research & creative concepts.', 'Creators, scripts & approval.', 'Filming, editing & variations.', 'Finished videos, revisions & recommendations.', 'ship the product to the selected creator', 'dedicated demo or dummy account',
    'Customer support is not part of the service', 'Content scheduling and posting', '6-month initial commitment', 'Organic community management', 'exclusively as an optional add-on at $250 per creative concept', 'do not offer raw-only production packages', 'Facebook, Instagram and TikTok',
  ]) assert.ok(text.includes(needle), `missing in raw HTML: ${needle}`)
  assert.ok(!/LinkedIn/.test(text), 'LinkedIn is not a confirmed platform')
  assert.ok(!/€|\bEUR\b|\beuros?\b/i.test(text), 'no euro pricing anywhere on the page')
})

test('/pricing HTML: both service groups are present (inactive one parked, inert, aria-hidden), organic prices included', () => {
  const root = rootOf(page('/pricing'))
  assert.match(root, /<div id="service-panel-paid" role="tabpanel" aria-labelledby="service-tab-paid" data-state="active" data-pos="left" class="pricing-slide">/)
  assert.match(root, /<div id="service-panel-organic" role="tabpanel" aria-labelledby="service-tab-organic" data-state="inactive" data-pos="right" aria-hidden="true" inert="" class="pricing-slide">/)
  assert.match(visibleText(page('/pricing')), /Organic Light[\s\S]*\$1,500[\s\S]*Organic Growth[\s\S]*\$2,500/)
})

test('/pricing HTML: the FAQ is visible content: every question and full answer is in the markup, and equals the JSON-LD', () => {
  const h = page('/pricing')
  const text = unescape(visibleText(h))
  for (const f of PRICING_FAQ) {
    assert.ok(text.includes(f.q), `question: ${f.q}`)
    for (const p of f.a) assert.ok(text.includes(p), `answer text for ${f.id}`)
  }
  const faqNode = ldScripts(h)[0]['@graph'].find((n) => n['@type'] === 'FAQPage')
  assert.deepEqual(faqNode.mainEntity.map((q) => q.name), PRICING_FAQ.map((f) => f.q))
  // Accessible accordion: a button per question wired to its answer region.
  assert.equal(count(rootOf(h), /aria-controls="faq-a-/g), PRICING_FAQ.length)
  assert.equal(count(rootOf(h), /role="region" aria-labelledby="faq-q-/g), PRICING_FAQ.length)
})

test('/pricing HTML: one h1, a logical heading order, extension prices in a real table', () => {
  const root = rootOf(page('/pricing'))
  assert.equal(count(root, /<h1[\s>]/g), 1)
  assert.ok(count(root, /<h2[\s>]/g) >= 8)
  const levels = [...root.matchAll(/<h([1-4])[\s>]/g)].map((m) => Number(m[1]))
  levels.forEach((l, i) => { if (i) assert.ok(l <= levels[i - 1] + 1, `heading level jumps from h${levels[i - 1]} to h${l}`) })
  assert.match(root.replace(/<!-- -->/g, ''), /<table[\s\S]*Additional 3 months[\s\S]*\$937\.50[\s\S]*\$1,687\.50[\s\S]*<\/table>/)
  assert.equal(count(root, /<th scope="col"/g), 3)
  assert.equal(count(root, /<table/g), 1)
})

test('/pricing HTML: conversion funnel intact: Roadmap CTAs, Free Video Production and the other offers still linked', () => {
  const root = rootOf(page('/pricing'))
  assert.ok(count(root, new RegExp(`href="${OFFER_PATHS.roadmap}"`, 'g')) >= 3, 'hero, next-step and nav CTAs still go to the Roadmap (the six package cards now open the project application)')
  assert.equal(count(root, /href="\/project-application\?package=/g), 6, 'every package card opens the project application')
  assert.ok(root.includes(`href="${OFFER_PATHS.riskFree}"`) || visibleText(page('/')).includes('Free'), 'the separate free-video promotion is untouched')
  for (const h of [`href="${PATHS.pricing}"`, 'href="/blog"', 'href="/referrals"']) assert.ok(root.includes(h), h)
  assert.ok(!/<form/.test(root.slice(root.indexOf('id="packages"'))), 'no form was added or moved into the pricing sections')
})

test('homepage HTML: ONE JSON-LD block (Organization, WebSite, WebPage, 4 Services, FAQPage); none on noindex or offer pages; the case studies carry their own small graph', () => {
  const home = ldScripts(page('/'))
  assert.equal(home.length, 1)
  assert.deepEqual(home[0]['@graph'].map((n) => n['@type']), ['Organization', 'WebSite', 'WebPage', 'Service', 'Service', 'Service', 'Service', 'FAQPage'])
  for (const p of [PATHS.roadmap, PATHS.hooks, PATHS.riskFree, PATHS.referrals, PATHS.scale]) {
    assert.equal(ldScripts(page(p)).length, 0, `${p} must not carry structured data`)
  }
  // Batch 2: a WebPage about the client work, its breadcrumb and the service it exemplifies. No Article, Review or rating.
  for (const p of ['/case-studies/graspo', '/case-studies/elyon']) {
    const ld = ldScripts(page(p))
    assert.equal(ld.length, 1, p)
    assert.deepEqual(ld[0]['@graph'].map((n) => n['@type']), ['Organization', 'WebPage', 'BreadcrumbList', 'Service'], p)
    assert.ok(!/Article|Review|aggregateRating|"award"|VideoObject|datePublished|"author"/.test(JSON.stringify(ld)), `${p}: nothing the page does not support`)
  }
})

test('homepage Services: four equal-card links in the approved order, each ONE anchor to its canonical page; no strategy card; head and JSON-LD untouched', () => {
  const html = page('/')
  const sec = html.slice(html.indexOf('id="services"'), html.indexOf('</section>', html.indexOf('id="services"')))
  const cards = [...sec.matchAll(/<a href="([^"]+)" class="svc-card"([^>]*)>([\s\S]*?)<\/a>/g)]
  const want = [
    ['01', 'UGC Video Ads', PATHS.ugcVideoAgency, '/ugc-video-agency', 'Human-led UGC ads built to capture attention and test creative angles.', ['UGC Ads', 'Creator-Led', 'Creative Testing']],
    ['02', 'SaaS &amp; App Videos', PATHS.saasVideoProduction, '/saas-video-production', 'Product demos, explainers and video ads that make your software or app easier to understand.', ['Product Demos', 'Explainers', 'Video Ads']],
    ['03', 'Spokesperson Videos', PATHS.spokespersonVideoProduction, '/spokesperson-video-production', 'Professional, multilingual presenters for ads, demonstrations and brand messages.', ['Human-Led', 'Multilingual', 'Product Demos']],
    ['04', 'Organic Social Video', PATHS.socialMediaVideoProduction, '/social-media-video-production', 'Organic social videos, content planning, publishing and community management.', ['Organic Video', 'Posting', 'Community']],
  ]
  assert.equal(cards.length, 4, 'exactly four service cards')
  cards.forEach((c, i) => {
    const [num, title, pathConst, literal, desc, pills] = want[i]
    assert.equal(pathConst, literal, `${title}: PATHS entry is the canonical URL`)
    assert.equal(c[1], literal, `${title}: href`)
    const body = c[3]
    assert.match(c[2], new RegExp(`aria-labelledby="service-[a-z]+-title" aria-describedby="service-[a-z]+-desc"`), `${title}: accessible name and description`)
    assert.ok(body.includes(`>${num}</span>`) && new RegExp(`<h3[^>]*>${title}</h3>`).test(body), `${title}: number and h3`)
    assert.ok(body.includes(`>${desc}</p>`), `${title}: description`)
    for (const pill of pills) assert.ok(body.includes(`>${pill}</li>`), `${title}: tag ${pill}`)
    assert.match(body, /Explore Service/, `${title}: visible action`)
    assert.ok(!/<(a|button|input|select|textarea)[\s>]|tabindex=|role="button"/.test(body), `${title}: no nested interactive element`)
  })
  assert.ok(!/Creative Strategy for Organic/.test(sec), 'the standalone strategy card is gone')
  assert.equal(count(sec, /class="svc-card"/g), 4)
  // the four destinations are linked once each (cards are the hub); the pricing link stays
  for (const [, , , href] of want) assert.equal(count(sec, new RegExp(`href="${href}"`, 'g')), 1, `${href} linked once in Services`)
  assert.match(sec, /<a href="\/pricing"[^>]*>\s*Explore packages and pricing\s*<\/a>/)
  // Batch 2: the homepage Service nodes now point at the four service pages (audit G-02), so the structured data names those URLs
  for (const [, , , href] of want) assert.ok(JSON.stringify(ldScripts(html)).includes(`${SITE_URL}${href}#service`), `${href}: the homepage Service node uses the service page's own id`)
  assert.equal(count(html, /<h1[\s>]/g), 1)
})

test('hydration safety: the client hook REPLACES the prerendered JSON-LD, and /pricing still hydrates its own HTML', () => {
  const hook = read('src/lib/useDocumentHead.js')
  assert.match(hook, /querySelectorAll\(`script\[\$\{STATIC_JSONLD_ATTR\}="\$\{STATIC_JSONLD_VALUE\}"\]`\)\.forEach\(\(n\) => n\.remove\(\)\)/)
  assert.equal(canHydrate({ pathname: '/pricing', ssrPath: '/pricing' }), true)
  // Both service panels render identically on server and client (default tab = paid), so there is no mismatch.
  assert.match(read('src/CreativeTestingSprintPage.jsx'), /useState\('paid'\)/)
})

test('sitemap + robots unchanged: /pricing listed once, blog/offer rules intact', () => {
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  assert.equal(count(xml, new RegExp(`<loc>${SITE_URL}/pricing</loc>`, 'g')), 1)
  assert.ok(!/convrt-logo|#/.test(xml))
  assert.deepEqual([...read('public/robots.txt').matchAll(/^Disallow:\s*(.*)$/gm)].map((m) => m[1].trim()), ['/api/'])
})

// ── final pricing audit: every prerendered page and every JSON-LD block ────────────────────────────────────────────
test('sitewide audit: no euro prices and no old $2,000 Organic Growth price in any prerendered page, 404 shell or structured data', () => {
  const files = [...KNOWN_PATHS.map((p) => page(p)), fs.readFileSync(path.join(dist, '404.html'), 'utf8')]
  for (const [i, h] of files.entries()) {
    const label = KNOWN_PATHS[i] ?? '404'
    // The Legal Notice's general currency statement (owner, 27 Nov 2026) names both currencies in every language: that one sentence is allowed, nothing else.
    assert.ok(!/€|&euro;|\bEUR\b/.test(h.replace('US dollars (USD) or euros (EUR)', '')), `${label}: euro pricing`)
    assert.ok(!/Organic Growth[^<]{0,300}\$2,000|\$2,000[^<]{0,300}Organic Growth/.test(h.replace(/<[^>]+>/g, ' ')), `${label}: old Organic Growth price`)
    assert.ok(!/"price":2000\b/.test(h), `${label}: old price in JSON-LD`)
  }
  // The € sign now exists in the shipped JavaScript, but only as the Spanish formatter's suffix (src/i18n/es/money.js); English pages never render it (asserted above for every English page).
})

test('Organic Growth/Light on the pricing page (there is no separate organic URL): USD cards, copy, FAQ and JSON-LD agree', () => {
  const h = page('/pricing')
  const text = unescape(visibleText(h))
  assert.match(text, /Organic Light[\s\S]*\$1,500 \/month/)
  assert.match(text, /Organic Growth[\s\S]*\$2,500 \/month/)
  assert.match(text, /Organic Growth is \$2,500\/month/, 'FAQ')
  const nodes = ldScripts(h)[0]['@graph'].filter((n) => /^Organic (Light|Growth)$/.test(n.name))
  assert.deepEqual(nodes.map((n) => [n.name, n.offers[0].priceSpecification.price, n.offers[0].priceSpecification.priceCurrency]), [['Organic Light', 1500, 'USD'], ['Organic Growth', 2500, 'USD']])
  assert.ok(count(rootOf(h), /Organic community management/g) >= 3, 'both cards + scope section')
  assert.ok(!KNOWN_PATHS.some((p) => /organic/i.test(p)), 'no separate organic route exists: update this test if one is added')
})

// ── final five-section page, from the raw HTML ───────────────────────────────────────────────────────────────────────
const flat = (h) => unescape(rootOf(h).replace(/<!-- -->/g, '').replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))
const main = (h) => { const r = rootOf(h).replace(/<!-- -->/g, ''); return r.slice(r.indexOf('<main'), r.indexOf('</main>')) }
const group = (h, id) => { const m = main(h); const i = m.indexOf(`<div id="service-panel-${id}"`); const next = id === 'paid' ? m.indexOf('<div id="service-panel-organic"') : m.indexOf('</section>', i); return m.slice(i, next) }

test('/pricing HTML: exactly five main sections, in order, with the unified opening', () => {
  const h = page('/pricing')
  const m = main(h)
  assert.equal(count(m, /<section\b/g), 5, 'five main content sections')
  const ids = [...m.matchAll(/<section\b[^>]*>/g)].map((x) => (x[0].match(/ id="([^"]+)"/) || [])[1])
  assert.deepEqual(ids, ['top', 'philosophy', 'package-info', 'pricing-faq', 'contact'])
  const t = flat(h)
  const marks = ['UGC & video production pricing', 'Your creative partner. On your terms.', 'What are you looking to achieve?', 'Different concepts. Not just different hooks.', 'The details.', 'Pricing questions, answered.', 'Ready to create something that converts?']
  const at = marks.map((x) => t.indexOf(x)); at.forEach((p, i) => assert.ok(p >= 0, marks[i]))
  assert.deepEqual([...at].sort((a, b) => a - b), at)
  assert.equal(count(m, /<h1[\s>]/g), 1)
  assert.ok(!/More concepts\. Better creative|Choose your creative partnership|Explore Packages/.test(t), 'the competing headlines and hero CTAs are gone')
  assert.match(t, /From performance-driven video ads to consistent organic content, find the right creative partnership for your brand\./)
  const opening = flat(`<div id="root">${m.slice(0, m.indexOf('id="philosophy"'))}`)
  assert.ok(!/40M\+|Free Creative Growth Roadmap/.test(opening), 'stats and the Roadmap offer sit below the pricing section')
  const hCount = count(m.slice(0, m.indexOf('id="philosophy"')), /<h[1-6][\s>]/g)
  assert.equal(hCount, 1 + 6, 'one h1 plus the six card labels: no other heading before the cards')
})

test('/pricing HTML: goal selector tabs (Scale my ads default) and the parked organic group', () => {
  const m = main(page('/pricing'))
  assert.equal(count(m, /role="tab"/g) >= 2, true)
  assert.match(m, /id="service-tab-paid" type="button" role="tab" aria-selected="true" aria-controls="service-panel-paid" tabindex="0"/)
  assert.match(m, /id="service-tab-organic" type="button" role="tab" aria-selected="false" aria-controls="service-panel-organic" tabindex="-1"/)
  for (const t of ['Scale my ads', 'UGC, spokesperson videos and creative testing.', 'Grow my socials', 'Content, publishing and organic community growth.']) assert.ok(m.includes(t), t)
})

test('/pricing HTML: three cards per group; Paid has the compact billing selector with BOTH price sets; Organic has none', () => {
  const h = page('/pricing')
  const paid = group(h, 'paid'); const organic = group(h, 'organic')
  assert.equal(count(paid, /<article/g), 3); assert.equal(count(organic, /<article/g), 3)
  const labels = (s) => [...s.matchAll(/<h2 id="card-[a-z-]+-label"[^>]*>([^<]+)</g)].map((x) => x[1])
  assert.deepEqual(labels(paid), ['Sprint', 'Sprint Plus', 'Custom']); assert.deepEqual(labels(organic), ['Organic Light', 'Organic Growth', 'Custom'])
  assert.equal(count(paid, /role="radio"/g), 2); assert.ok(!/role="radio"/.test(organic))
  assert.match(paid, /id="billing-monthly" type="button" role="radio" aria-checked="true"[^>]*>Monthly</)
  assert.match(paid, /id="billing-oneOff" type="button" role="radio" aria-checked="false"[^>]*>One-off</)
  for (const [b, a, hidden] of [['monthly', '$3,000', false], ['monthly', '$5,000', false], ['oneOff', '$3,500', true], ['oneOff', '$6,000', true]]) {
    const mm = paid.match(new RegExp(`<span ([^>]*)>\\${a}<span[^>]*>/${b === 'monthly' ? 'month' : 'project'}`))
    assert.ok(mm, `${a} ${b} present`); assert.equal(/hidden=""/.test(mm[1]), hidden); assert.match(mm[1], new RegExp(`data-billing="${b}"`))
  }
  const op = flat(`<div id="root">${organic}`)
  assert.ok(!/One-off|\/project/.test(op), 'no one-off pricing in the Organic group')
  assert.ok(!/Organic Social packages are ongoing content partnerships/.test(op), 'no introductory line above the Organic cards')
  assert.ok(!/Creative production packages\. Choose how/.test(flat(`<div id="root">${paid}`)), 'no introductory line above the Paid cards')
  // the billing control sits alone in a right-aligned row above the cards
  assert.match(paid, /<div class="mb-4 flex justify-center"><div role="radiogroup"/)
  assert.ok(organic.indexOf('<article') < 600, 'the Organic cards start immediately (no header row)')
})

test('/pricing HTML: concise notes under the cards; commitments: Paid 3 months, Organic 6 months, later terms per agreement', () => {
  const h = page('/pricing')
  const paid = flat(`<div id="root">${group(h, 'paid')}`); const organic = flat(`<div id="root">${group(h, 'organic')}`)
  assert.ok(paid.trim().includes('Monthly plans start with a 3-month commitment, then become month-to-month with 30 days’ notice. One-off projects are also available. All prices exclude VAT.'), 'paid note')
  // the note is still the last TERMS text; only a one-line pair of links to the UGC and Spokesperson service pages follows it
  assert.ok(paid.trim().endsWith('New to UGC? See how our UGC production works · Need a presenter? See spokesperson video production'), 'paid note is followed only by the two service-page links')
  // likewise the Organic note is still the last TERMS text; only a one-line link to the Organic Social service page follows it
  assert.ok(organic.trim().includes('A 6-month initial partnership to build a consistent social presence and assess results. All prices exclude VAT.'), 'organic note')
  assert.ok(organic.trim().endsWith('Curious how it works? See organic social video production'), 'organic note is followed only by the service-page link')
  assert.ok(!/three-month|3-month commitment|month-to-month|30 days/.test(organic), 'Paid terms are never shown on Organic')
  assert.ok(!/Turnaround begins once you have reviewed|Custom project terms are agreed individually/.test(paid + organic), 'the long paragraphs are gone from under the cards')
  const t = flat(h)
  // ...but the full policies are still on the page (FAQ + panels)
  for (const n of ['Our creative partnerships begin with an initial three-month commitment', 'Organic partnerships begin with an initial six-month commitment, giving us time to build a consistent social media presence, learn what resonates with your audience and assess performance.', 'Terms after the initial six-month period are set out in the applicable agreement.', 'Custom project terms are agreed individually.', 'One creative production batch, without a recurring commitment.' ].slice(0, 4)) assert.ok(t.includes(n), n)
  assert.ok(t.includes('Starts after concept and script approval.'))
  assert.ok(t.includes('All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.'))
})

test('/pricing HTML: Custom cards say "Let\'s talk." with no number; every card CTA is the project application', () => {
  const h = page('/pricing')
  const arts = [...group(h, 'paid').matchAll(/<article[\s\S]*?<\/article>/g), ...group(h, 'organic').matchAll(/<article[\s\S]*?<\/article>/g)].map((x) => x[0])
  assert.equal(arts.length, 6)
  for (const a of arts) assert.match(a, /<a href="\/project-application\?package=[a-z-]+(&amp;billing=(monthly|one-time))?&amp;from=pricing"/)
  const customs = arts.filter((a) => /<h2 id="card-(organic-)?custom-label"/.test(a))
  assert.equal(customs.length, 2)
  for (const c of customs) {
    const t = unescape(c.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' '))
    assert.match(t, /Let(’|')s talk\./); assert.match(t, /Tailored to your needs/); assert.match(t, /Request a Custom Proposal/); assert.match(t, /Scope, pricing and terms are tailored to your project\./); assert.ok(!/\$\s?\d/.test(t))
  }
  assert.equal(count(arts.join(''), /Request This Package/g), 4)
  const plus = flat(`<div id="root">${arts[1]}`)
  assert.ok(plus.includes('Includes expanded research and testing recommendations.'))
  const light = flat(`<div id="root">${arts[3]}`)
  for (const n of ['Content scheduling and posting', 'Organic community management', '6-month initial commitment', 'Facebook, Instagram & TikTok distribution']) assert.ok(light.includes(n), n)
})

test('/pricing HTML: Section 2 holds the philosophy (both variants), the new Roadmap card and the stats, below the cards', () => {
  const h = page('/pricing')
  const m = main(h)
  const sec = m.slice(m.indexOf('id="philosophy"'), m.indexOf('id="package-info"'))
  const t = flat(`<div id="root">${sec}`)
  for (const n of ['Different concepts. Not just different hooks.', 'We develop distinct creative angles, then create variations for structured testing.', '5 original concepts → 15 finished ad versions', 'A concept is a unique ad idea. A variation changes its hook or CTA.', 'Standard Sprint shown. Sprint Plus includes 10 concepts and 30 finished ad versions.', 'Consistency. Content. Real connections.', 'A video-first approach to building your organic presence.', 'Publishing & engagement', 'Optimization', 'See how we grew Graspo', 'YOUR FREE CREATIVE GROWTH ROADMAP'.toLowerCase().replace(/^./, (c) => c.toUpperCase()), 'Your next 5 winning ad concepts.', 'Five personalized creative ideas for your brand, built around your product and audience.', 'Completely free. No obligation.', 'Get 5 Free Ad Concepts', '40M+', '1,200+', '500+', 'Core production languages']) assert.ok(t.toLowerCase().includes(n.toLowerCase()), n)
  assert.equal(count(sec, /<li class="flex flex-col items-center"/g), 5, 'five concept columns')
  assert.ok(sec.includes(`href="${OFFER_PATHS.roadmap}"`))
  assert.ok(!t.includes('Illustrative concepts'), 'the caption under the mockups is removed')
  const svgText = [...sec.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((x) => x[1])
  for (const l of ['PRODUCT DEMO', 'CREATOR-LED', 'PRODUCT-LED', 'See it in action', 'It just works.', 'MADE', 'TO BE', 'SEEN.']) assert.ok(svgText.includes(l), `mockup text: ${l}`)
  assert.equal(count(sec, /<svg viewBox="0 0 360 214"/g), 1, 'one pitch-board illustration, hidden from assistive tech')
  assert.match(sec, /<svg viewBox="0 0 360 214"[^>]*aria-hidden="true"/)
  assert.ok(!/Problem|Offer<|roadmap-float/.test(sec.replace(/Problem-led/g, '')), 'old five-card moodboard is gone')
  for (const n of ['Concept 1', 'Concept 5']) assert.ok(t.includes(n), n)
  assert.ok(!/<img/.test(sec), 'no external imagery')
  assert.match(sec, /<div hidden=""><div><h2[^>]*>Consistency\./, 'the organic variant is in the HTML, hidden by default')
  assert.ok(!/Standard Sprint shown\. Your concepts are tailored/i.test(t) && (t.match(/illustrative/gi) || []).length === 0, 'repetitive qualifications and the old caption are gone')
})

test('/pricing HTML: Section 3 "The details.": four panels, ALL CLOSED on load, all content (both services) in the markup', () => {
  const h = page('/pricing')
  const m = main(h)
  const sec = m.slice(m.indexOf('id="package-info"'), m.indexOf('id="pricing-faq"'))
  assert.equal(count(sec, /<button id="info-q-/g), 4)
  assert.equal(count(sec, /role="region" aria-labelledby="info-q-/g), 4)
  assert.equal(count(sec, /aria-expanded="false"/g), 4, 'every panel closed on load')
  assert.ok(!/aria-expanded="true"/.test(sec))
  assert.equal(count(sec, /grid-template-rows:0fr;visibility:hidden/g), 4)
  const t = flat(`<div id="root">${sec}`)
  for (const n of [
    'The details.', 'Everything you need to know before getting started.',
    "What's included", 'Full creative production.', 'Usage rights', '6 months worldwide. Flexible extensions.', 'How we work', 'From strategy to delivery.', 'Production & extras', 'Revisions, formats and add-ons.',
    'Creative research & strategy', 'Concepts, scripts & approval', 'Creator selection', 'Filming & editing', 'Captions, B-roll & graphics', 'Square & 4:5 reframing', 'Creative variations', 'Testing recommendations', 'Multilingual production', 'One core language included: English, Spanish, French or Arabic.',
    'Additional languages are available on request and may incur extra charges.', 'Custom scopes are agreed individually.',
    'Content strategy & planning', 'Concepts & scripting', 'Captions & post copy', 'Scheduling & publishing', 'Cross-platform distribution', 'Performance optimization', 'Community engagement', 'Facebook, Instagram and TikTok. Community management excludes customer support.',
    '6 months of worldwide usage included.', 'From the date each video is delivered.', 'Paid ads', 'Organic social', 'Website use',
    '$937.50', '$1,500', '$2,625', '$1,687.50', '$2,700', '$4,725', '9 months in total', '12 months in total', '18 months in total', 'Custom quote, subject to agreement with the featured creators',
    'Extensions apply to the entire creative batch. Prices exclude VAT.',
    'Existing organic posts and website placements may stay live. Paid advertising, resharing and republishing require an extension.',
    'Creator-account advertising, including Spark Ads and Meta partnership ads, is arranged and priced separately.',
    'Content usage terms are set out in your agreement. Paid Social usage rights and extension prices do not automatically apply.',
    'Research & creative concepts.', 'Creators, scripts & approval.', 'Filming, editing & variations.', 'Finished videos, revisions & recommendations.',
    'Content planning & objectives.', 'Concepts, filming & editing.', 'Distribution & engagement.', 'Performance review & refinement.',
    '10 business days — Sprint. 15 business days — Sprint Plus.', 'Starts after concept and script approval.', '2 rounds per creative concept.', 'Up to 60 seconds. Custom 1–3 minute videos available.',
    'Vertical, square and 4:5.', '16:9 counts as a separate video.', '$250 per creative concept. Optional add-on to finished videos.',
    'Initial commitment', 'Customer support and paid advertising management.', 'Sprint terms do not automatically apply.',
  ]) assert.ok(t.includes(n), `panel content missing: ${n}`)
  assert.equal(count(sec, /<table/g), 1)
  assert.ok(!/<details/.test(sec))
})

test('/pricing HTML: the Organic usage panel is only the agreement reference: no Sprint licensing, prices or Spark Ads', () => {
  const h = page('/pricing')
  const m = main(h); const sec = m.slice(m.indexOf('id="package-info"'), m.indexOf('id="pricing-faq"'))
  const usage = sec.slice(sec.indexOf('id="info-a-usage"'), sec.indexOf('id="info-q-how"'))
  const orgPart = usage.slice(usage.lastIndexOf('<div hidden="">'))
  const t = flat(`<div id="root">${orgPart}`)
  assert.match(t, /Content usage terms are set out in your agreement\./)
  assert.ok(!/\$\d|Spark|months in total/.test(t))
  const details = sec.slice(sec.indexOf('id="info-a-details"'))
  const orgDetails = flat(`<div id="root">${details.slice(details.lastIndexOf('<div hidden="">'))}`)
  assert.ok(!/Raw footage|business days — Sprint|rounds per creative concept/.test(orgDetails), 'no paid-only production terms on Organic')
})

test('/pricing HTML: FAQ section is four categories, all 18 answers in the markup, organic six-month answer included', () => {
  const h = page('/pricing')
  const faqHtml = rootOf(h).slice(rootOf(h).indexOf('id="pricing-faq"'))
  assert.equal(count(faqHtml, /role="tab"/g), 4); assert.equal(count(faqHtml, /role="tabpanel"/g), 4)
  assert.equal(PRICING_FAQ.length, 18)
  for (const f of PRICING_FAQ) { assert.ok(faqHtml.includes(`id="faq-a-${f.id}"`), f.id); assert.ok(unescape(faqHtml).includes(f.q.replace(/&/g, '&'))) }
  assert.match(unescape(faqHtml.replace(/<!-- -->/g, '')), /Building a meaningful social media presence takes consistency\. Our organic partnerships begin with a six-month commitment/)
  assert.match(faqHtml, /id="faq-panel-organic"[^>]*hidden=""/)
})

test('/pricing HTML: Section 5 compact CTA; no stale JSON-LD; sections removed from the old layout are gone', () => {
  const h = page('/pricing')
  const t = flat(h)
  assert.match(t, /Ready to create something that converts\? Let’s find the right creative approach for your brand\. Get 5 Free Ad Concepts/)
  for (const gone of ['Every Sprint includes full creative production.', 'Your videos. Worldwide usage.', 'The important details.', 'From idea to ready-to-launch creative.', 'Start with a sprint. Scale what works.']) assert.ok(!t.includes(gone), `old section heading still present: ${gone}`)
  assert.equal(ldScripts(h).length, 1)
  const ld = JSON.stringify(ldScripts(h)[0])
  for (const p of ['$3,000 per month', '$5,000 per month', '$3,500 one-off', '$6,000 one-off', '$1,500 per month', '$250 per creative concept']) assert.ok(ld.includes(p), p)
  assert.match(ld, /Initial six-month commitment\. Terms after the initial six-month period/)
  assert.ok(!/OWNER_REVIEW|deferred to the applicable agreement/.test(t))
})

// ── End-to-end production message (Nov 2026) ────────────────────────────────────────────────────────────────────────
test('/pricing HTML: both Creative Testing cards carry the end-to-end production note before the checklist; per-version badge says "finished ad version"; prices unchanged', () => {
  const h = page('/pricing')
  const arts = [...group(h, 'paid').matchAll(/<article[\s\S]*?<\/article>/g)].map((x) => x[0])
  assert.equal(arts.length, 3)
  const [sprint, plus, custom] = arts.map((a) => flat(`<div id="root">${a}`))
  const note = 'End-to-end creative production Strategy, scripts, creator casting, filming and editing. All handled by CONVRT.'
  for (const [name, c] of [['Sprint', sprint], ['Sprint Plus', plus]]) {
    assert.equal(c.split('End-to-end creative production').length - 1, 1, `${name}: one note`)
    assert.ok(c.includes(note), `${name}: note text`)
    assert.ok(c.indexOf(note) < c.indexOf('distinct creative concepts'), `${name}: note sits before the checklist`)
    assert.ok(c.includes('Filming, editing, captions & final delivery'), `${name}: checklist line`)
    assert.ok(!c.includes('Priority production scheduling'), `${name}: retired line gone`)
    assert.ok(!/media buying|ad account|campaign optimi[sz]ation/i.test(c), `${name}: no media-buying claim`)
  }
  assert.ok(sprint.includes('$200 per variation') && sprint.includes('$233 per variation'), 'Sprint monthly and one-off')
  assert.ok(plus.includes('$167 per variation') && plus.includes('$200 per variation'), 'Sprint Plus monthly and one-off')
  assert.ok(!custom.includes('End-to-end creative production'), 'Custom card is unchanged')
  // price > testing creatives > per-version, in that order; the repeated concept line is gone
  for (const [name, c, count, per] of [['Sprint', sprint, '15 testing creatives', '$200 per variation'], ['Sprint Plus', plus, '30 testing creatives', '$167 per variation']]) {
    const iPrice = c.search(/\$[35],000/), iCount = c.indexOf(count), iPer = c.indexOf(per)
    assert.ok(iPrice > -1 && iPrice < iCount && iCount < iPer, `${name}: price, then the testing-creatives pill, then the price-per-variation pill`)
    assert.ok(/\d+ unique concepts with 3 hook or CTA variations per concept/.test(c), `${name}: the concept line is back under the pills`)
    assert.ok(c.includes('3 versions per concept, changing the hook or CTA'), `${name}: the explanation stays in the checklist`)
  }
  const ld = JSON.stringify(ldScripts(h)[0])
  assert.ok(!ld.includes('End-to-end creative production'), 'structured data is not touched by the card note')
})

// ── Sprint Plus 10/10/20 update, service-aware CTAs, 3 x 3 inclusions ────────────────────────────────────────────────
test('/pricing HTML: Sprint Plus card shows 10 concepts / 10 scripts / 3 variations per concept / 30 ads; Sprint is 5 / 5 / 15; no 8-concept leftovers', () => {
  const h = page('/pricing')
  const arts = [...group(h, 'paid').matchAll(/<article[\s\S]*?<\/article>/g)].map((x) => flat(`<div id="root">${x[0]}`))
  const [sprint, plus] = arts
  for (const n of ['5 distinct creative concepts', '5 complete scripts', '3 versions per concept, changing the hook or CTA', '15 testing creatives', 'Filming, editing, captions & final delivery', 'Includes expanded research and testing recommendations.', 'Up to 3 creators or spokespeople', '10 business days turnaround', '2 revision rounds per creative concept', '6 months of worldwide usage rights']) assert.ok(sprint.includes(n), `Sprint: ${n}`)
  for (const n of ['10 distinct creative concepts', '10 complete scripts', '3 versions per concept, changing the hook or CTA', '30 testing creatives', 'Up to 5 creators or spokespeople', '15 business days turnaround', '2 revision rounds per creative concept', '6 months of worldwide usage rights', 'Filming, editing, captions & final delivery', 'Includes expanded research and testing recommendations.']) assert.ok(plus.includes(n), `Sprint Plus: ${n}`)
  assert.ok(sprint.includes('$3,000') && sprint.includes('$3,500') && plus.includes('$5,000') && plus.includes('$6,000'), 'monthly and one-off prices remain')
  const t = flat(h)
  assert.ok(!/\b8 (distinct )?(creative )?concepts|8 complete scripts|strategically distributed|Expanded creative variations/.test(t), 'no obsolete Sprint Plus wording in the prerendered page')
  const ld = JSON.stringify(ldScripts(h)[0])
  assert.ok(!/8 distinct|distributed across the concepts/.test(ld))
  assert.match(ld, /10 distinct creative concepts with 3 versions each \(30 finished ad versions\)/)
  assert.match(ld, /5 distinct creative concepts with 3 versions each \(15 finished ad versions\)/)
})

test('/pricing HTML: service-aware CTAs: Paid = Roadmap, Organic = "Discuss Your Content Strategy" (the organic strategy call; hidden until Organic is selected)', () => {
  const h = page('/pricing')
  const m = main(h)
  const phil = m.slice(m.indexOf('id="philosophy"'), m.indexOf('id="package-info"'))
  const fin = m.slice(m.indexOf('id="contact"'))
  const call = '/contact?service=organic' // one organic route: the Contact inquiry with Organic Social Video chosen (27 Nov 2026; it was the public Calendly strategy call, before that a mailto)
  const orgAt = phil.indexOf('Your organic content partnership'); const paidAt = phil.indexOf('Your free Creative Growth Roadmap')
  assert.ok(orgAt > 0 && paidAt > 0)
  // the card wrapper right before each eyebrow: hidden="" for Organic, plain for Paid
  assert.ok(/<div hidden="">\s*<div class="rounded-/.test(phil.slice(Math.max(0, orgAt - 330), orgAt)), 'organic offer card hidden by default')
  assert.ok(/<div>\s*<div class="rounded-/.test(phil.slice(Math.max(0, paidAt - 330), paidAt)) && !/hidden=""/.test(phil.slice(paidAt - 120, paidAt)), 'Roadmap card visible by default')
  assert.match(flat(`<div id="root">${phil}`), /Let's build your brand's organic presence\. Facebook Instagram TikTok Strategy, consistent video production, publishing and engagement — managed together\. Discuss Your Content Strategy/)
  assert.equal(count(phil, new RegExp(call.replace(/[?.]/g, '\\$&'), 'g')), 1)
  assert.equal(count(fin, new RegExp(call.replace(/[?.]/g, '\\$&'), 'g')), 1)
  assert.ok(fin.includes(`<div hidden=""><a href="${call}"`) && fin.includes('Discuss Your Content Strategy') && !/calendly\.com/.test(m))
  assert.ok(fin.includes(`<div><a href="${OFFER_PATHS.roadmap}"`) && fin.includes('Get 5 Free Ad Concepts'), 'Paid CTA visible by default')
  assert.ok(phil.includes(`href="${OFFER_PATHS.roadmap}"`))
  assert.ok(rootOf(h).includes(`<a href="${OFFER_PATHS.roadmap}"`), 'the navigation CTA still goes to the Roadmap')
})

test('/pricing HTML: What\'s included: nine Paid items in the markup with the 3-column class, Organic list separate', () => {
  const h = page('/pricing')
  const m = main(h)
  const panel = m.slice(m.indexOf('id="info-a-included"'), m.indexOf('id="info-q-usage"'))
  const paidList = panel.match(/<ul class="grid grid-cols-1 gap-x-6 gap-y-3\.5 sm:grid-cols-2 lg:grid-cols-3">([\s\S]*?)<\/ul>/)
  assert.ok(paidList, 'paid grid uses grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-3')
  assert.equal(count(paidList[1], /<li /g), 9)
  const organicList = panel.match(/<ul class="grid grid-cols-2 gap-x-5 gap-y-2\.5 lg:grid-cols-4">([\s\S]*?)<\/ul>/)
  assert.ok(organicList); assert.equal(count(organicList[1], /<li /g), 8)
  assert.ok(flat(`<div id="root">${organicList[1]}`).includes('Community engagement'))
  assert.ok(!flat(`<div id="root">${organicList[1]}`).includes('Multilingual'))
})

// ── homepage SEO/GEO phase 1, from the raw HTML ──────────────────────────────────────────────────────────────────────
import { HOME_FAQ } from '../src/seo/homeFaq.js'

test('homepage HTML: approved title, description, ONE canonical, indexable, social tags intact', () => {
  const h = page('/')
  const head = headOf(h)
  assert.ok(head.includes('<title>Performance Creative Agency | CONVRT</title>'))
  assert.equal(count(head, /<title>/g), 1)
  assert.ok(head.includes('<meta name="description" content="CONVRT is a performance creative agency producing human-led UGC ads, spokesperson videos, SaaS videos and social content for brands ready to scale." />'))
  assert.equal(count(head, /name="description"/g), 1)
  assert.ok(head.includes(`<link rel="canonical" href="${SITE_URL}/" />`)); assert.equal(count(head, /rel="canonical"/g), 1)
  assert.ok(!/name="robots"/.test(head), 'homepage stays indexable')
  assert.match(head, /property="og:title" content="CONVRT — Performance creatives that convert\."/)
  assert.match(head, /property="og:url" content="https:\/\/www\.convrt\.studio\/"/)
  assert.equal(count(head, /application\/ld\+json/g), 1)
})

test('homepage HTML: the H1 reads cleanly (one word, spaces between lines) and the markup of the animation is intact', () => {
  const root = rootOf(page('/')).replace(/<!-- -->/g, '')
  const h1 = root.match(/<h1[\s\S]*?<\/h1>/)[0]
  const text = unescape(h1.replace(/<[^>]+>/g, '|')).replace(/\|+/g, ' ').replace(/\s+/g, ' ').trim()
  assert.equal(text, 'Creatives designed to convert')
  assert.match(h1, /<span class="block">Creatives designed<\/span> <span class="block">to /)
  assert.match(h1, /animate-word-in/); assert.match(h1, /data-word="resonate"/)
  assert.equal(count(root, /<h1[\s>]/g), 1)
})

test('homepage HTML: services heading and cards, hero line, internal links', () => {
  const h = page('/')
  const t = unescape(visibleText(h))
  for (const n of [
    'Video creative for paid and organic social.', 'Creative strategy and full video production, from concept and creator casting to finished, platform-ready videos.',
    'Human-led UGC ads built to capture attention and test creative angles.', 'Product demos, explainers and video ads that make your software or app easier to understand.',
    'Professional, multilingual presenters for ads, demonstrations and brand messages.', 'Organic social videos, content planning, publishing and community management.',
    'From creative strategy and scripting to creator casting, filming and editing. We produce human-led UGC ads, SaaS and app videos, spokesperson videos and organic social content, ready to perform.',
    'Explore packages and pricing',
  ]) assert.ok(t.includes(n), n)
  assert.ok(!/Built for modern|Explore the Creative Testing Sprint|Compare packages and pricing|significantly better results|personally approved by the founder|prolific creator/.test(t))
  const root = rootOf(h)
  for (const href of ['/pricing', '/case-studies/elyon', '/creative-growth-roadmap', '/free-hooks', '/risk-free-trial', '/blog']) assert.ok(root.includes(`href="${href}"`), href)
  assert.ok(count(root, /href="\/pricing"/g) >= 4, 'nav, services link, footer and two FAQ answers link to /pricing')
  assert.ok(!root.includes('case=elyon'))
  // conversion CTAs unchanged
  assert.ok(count(root, new RegExp(`href="${PATHS.roadmap}"`, 'g')) >= 6)
})

test('homepage HTML: every FAQ question and full answer is visible content, and equals the FAQPage JSON-LD', () => {
  const h = page('/')
  const t = unescape(visibleText(h))
  for (const f of HOME_FAQ) {
    assert.ok(t.includes(f.q), f.q)
    for (const p of [].concat(f.a)) assert.ok(t.includes(p), `answer: ${f.q}`)
    if (f.link) assert.ok(rootOf(h).includes(`href="${f.link.href}"`))
  }
  const ld = ldScripts(h)[0]['@graph']
  const faqNode = ld.find((n) => n['@type'] === 'FAQPage')
  assert.deepEqual(faqNode.mainEntity.map((q) => q.name), HOME_FAQ.map((f) => f.q))
  faqNode.mainEntity.forEach((q, i) => assert.equal(q.acceptedAnswer.text, [].concat(HOME_FAQ[i].a).join(' ')))
  assert.deepEqual(ld.map((n) => n['@type']), ['Organization', 'WebSite', 'WebPage', 'Service', 'Service', 'Service', 'Service', 'FAQPage'])
  assert.ok(JSON.stringify(ld).includes('"@id":"https://www.convrt.studio/#webpage"'))
  assert.ok(!/\\u003c|<\/script/.test(JSON.stringify(ld)))
})

test('research files never reach the build output', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  const files = walk(dist).map((f) => path.relative(dist, f))
  assert.ok(!files.some((f) => /research|keyword[ -_]?target|reddit|\.xlsx$/i.test(f)), 'no research artifact in dist')
})

// ── sitewide consistency audit guards (built HTML) ─────────────────────────────────────────
test('audit: /pricing draws SPRINT.variationsPerConcept (3) versions per concept, A B C, in every concept column', async () => {
  const { SPRINT } = await import('../src/seo/businessKnowledge.js')
  const cols = [...page('/pricing').matchAll(/<li class="flex flex-col items-center">[\s\S]*?<\/li>/g)].map((m) => m[0])
  assert.equal(cols.length, SPRINT.concepts)
  for (const col of cols) {
    assert.equal((col.match(/<rect /g) || []).length, SPRINT.variationsPerConcept, 'three version nodes under each concept')
    assert.match(col.replace(/<!-- -->/g, ''), /<span>A<\/span><span>B<\/span><span>C<\/span>/)
  }
})

test('audit: every published offer price is USD and equals the constants; one JSON-LD block, one FAQPage, no duplicate nodes, on /pricing and /ugc-video-agency', async () => {
  const { SPRINT, SPRINT_PLUS } = await import('../src/seo/businessKnowledge.js')
  for (const route of ['/pricing', '/ugc-video-agency']) {
    const blocks = ldScripts(page(route))
    assert.equal(blocks.length, 1, `${route}: one JSON-LD block`)
    const nodes = blocks[0]['@graph']
    assert.equal(nodes.filter((n) => n['@type'] === 'FAQPage').length, 1, `${route}: one FAQPage`)
    const keys = nodes.map((n) => JSON.stringify(n))
    assert.equal(new Set(keys).size, keys.length, `${route}: no duplicate nodes`)
    const ld = JSON.stringify(blocks[0])
    assert.ok(!/"priceCurrency":"(?!USD)/.test(ld), `${route}: USD only`)
    const prices = [...ld.matchAll(/"price":(\d+(?:\.\d+)?),"priceCurrency":"USD"/g)].map((m) => Number(m[1]))
    for (const n of [SPRINT.monthly.amount, SPRINT.oneOff.amount, SPRINT_PLUS.monthly.amount, SPRINT_PLUS.oneOff.amount]) assert.ok(prices.includes(n), `${route}: JSON-LD carries ${n}`)
  }
})
