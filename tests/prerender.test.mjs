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
  assert.throws(() => headParamsFor('/blog/missing', [meta]), /no published article/)
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
    assert.ok(!head.includes('Performance Creative Studio for Paid Social') || p === '/', `${p}: homepage title leaked into another route`)
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
    assert.ok(visibleText(h).length > 1200, `${p}: only ${visibleText(h).length} chars of text`)
    assert.ok(count(rootOf(h), /<a [^>]*href="\/[^"#]/g) >= 5, `${p}: too few internal links`)
    assert.ok(h.includes(`<div id="root" data-ssr-path="${p}">`), `${p}: ssr path stamp`)
    assert.ok(!/<!--\$!-->/.test(h), `${p}: contains a Suspense fallback (server render did not finish)`)
  }
})

test('homepage: headline, services copy, CTAs and links are in the initial HTML', () => {
  const h = page('/')
  const text = visibleText(h)
  assert.match(text, /Performance creatives engineered to/)
  assert.match(text, /Spokesperson Ads/, 'services copy')
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
  assert.ok(!fs.existsSync(path.join(ROOT, 'node_modules', '.convrt-ssr')) || fs.readdirSync(path.join(ROOT, 'node_modules', '.convrt-ssr')).length === 0, 'temporary SSR build output must be cleaned up')
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
  for (const t of ['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage']) assert.ok(types.includes(t), t)
  // Same data as the manifest hands to the client hook, so hydration cannot change it.
  assert.deepEqual(scripts[0], JSON.parse(JSON.stringify(pageHead('/pricing').jsonLd)))
})

test('/pricing HTML: every confirmed price, term and policy is in the visible markup', () => {
  const text = unescape(visibleText(page('/pricing')))
  for (const needle of [
    '€2,500', '€4,500', '$3,000', '$5,400', '€1,500', '€2,000',
    '5 creative concepts. 10 opportunities to test.',
    'initial three-month commitment', "30 days' cancellation notice",
    'All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.',
    'Your creative. Flexible usage rights.', '6 months of worldwide usage rights', 'date each video is delivered',
    '€625', '€1,000', '€1,750', '€1,125', '€1,800', '€3,150', 'Perpetual usage',
    'Paid advertising use must stop', 'Existing organic social media posts may remain published',
    'TikTok Spark Ads', 'Meta partnership ads', 'separate from the standard usage rights',
    '€250 per creative concept', '10 business days', '15 business days',
    'not unlimited', 'charged in full', 'Horizontal 16:9 production counts as a separate video', 'Square 1:1 reframing',
    'Brand and product discovery', 'Delivery and revisions', 'ship the product to the selected creator', 'dedicated demo or dummy account',
    'Customer support is not part of the service', 'Facebook, Instagram and TikTok',
  ]) assert.ok(text.includes(needle), `missing in raw HTML: ${needle}`)
  assert.ok(!/LinkedIn/.test(text), 'LinkedIn is not a confirmed platform')
})

test('/pricing HTML: both service panels are present (inactive one only `hidden`), organic prices included', () => {
  const root = rootOf(page('/pricing'))
  assert.match(root, /id="service-panel-paid" role="tabpanel"[^>]*>/)
  assert.match(root, /id="service-panel-organic" role="tabpanel"[^>]*hidden=""/)
  assert.ok(!/id="service-panel-paid"[^>]*hidden/.test(root), 'paid is the default, visible panel')
  assert.match(visibleText(page('/pricing')), /Organic Light[\s\S]*€1,500[\s\S]*Organic Growth[\s\S]*€2,000/)
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
  assert.ok(count(root, /<h2[\s>]/g) >= 6)
  const levels = [...root.matchAll(/<h([1-4])[\s>]/g)].map((m) => Number(m[1]))
  levels.forEach((l, i) => { if (i) assert.ok(l <= levels[i - 1] + 1, `heading level jumps from h${levels[i - 1]} to h${l}`) })
  assert.match(root.replace(/<!-- -->/g, ''), /<table[\s\S]*Additional 3 months[\s\S]*€625[\s\S]*€1,125[\s\S]*<\/table>/)
  assert.equal(count(root, /<th scope="col"/g), 3)
})

test('/pricing HTML: conversion funnel intact: Roadmap CTAs, Free Video Production and the other offers still linked', () => {
  const root = rootOf(page('/pricing'))
  assert.ok(count(root, new RegExp(`href="${OFFER_PATHS.roadmap}"`, 'g')) >= 5, 'package, hero, next-step and nav CTAs still go to the Roadmap')
  assert.ok(root.includes(`href="${OFFER_PATHS.riskFree}"`) || visibleText(page('/')).includes('Free'), 'the separate free-video promotion is untouched')
  for (const h of [`href="${PATHS.pricing}"`, 'href="/blog"', 'href="/referrals"']) assert.ok(root.includes(h), h)
  assert.ok(!/<form/.test(root.slice(root.indexOf('id="packages"'))), 'no form was added or moved into the pricing sections')
})

test('homepage HTML: Organization + WebSite JSON-LD once; no JSON-LD on noindex or offer pages', () => {
  const home = ldScripts(page('/'))
  assert.equal(home.length, 1)
  assert.deepEqual(home[0]['@graph'].map((n) => n['@type']), ['Organization', 'WebSite'])
  for (const p of [PATHS.roadmap, PATHS.hooks, PATHS.riskFree, PATHS.referrals, PATHS.scale]) {
    assert.equal(ldScripts(page(p)).length, 0, `${p} must not carry structured data`)
  }
  for (const p of ['/case-studies/graspo', '/case-studies/elyon']) assert.equal(ldScripts(page(p)).length, 0, p)
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
