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
    '$2,500', '$4,500', '$3,000', '$5,400', '$1,500', '$2,500', '8 distinct creative concepts', '8 complete scripts',
    'Different concepts. Not just different hooks.', '5 original concepts → 10 ad variations',
    'A concept is a distinct advertising idea or angle.', 'A variation changes the hook or CTA within a concept.',
    'initial three-month commitment', "30 days' cancellation notice",
    'All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.',
    'Everything you need to know.', 'Clear deliverables. Flexible options. No surprises.', 'Usage rights & licensing', 'Extend your 6 months', 'How we work', 'Production details & extras', '6 months of worldwide usage rights', 'date each video is delivered',
    'Your creative partner.', 'What are you looking to achieve?', 'Scale my ads', 'Grow my socials', 'Consistency. Content. Real connections.', 'Strategy', 'Publishing & engagement', 'Not sure where to start?', 'Ready to create something that converts?',
    'Organic partnerships begin with an initial six-month commitment', 'Why is there a six-month minimum commitment for organic social media?', 'Terms after the initial six-month period are set out in the applicable agreement.', 'Custom project terms are agreed individually.',
    '$625', '$1,000', '$1,750', '$1,125', '$1,800', '$3,150', 'Perpetual usage',
    'Paid advertising use must stop', 'Existing organic social media posts may remain published',
    'TikTok Spark Ads', 'Meta partnership ads', 'separate from the standard usage rights',
    '$250 per creative concept', '10 business days', '15 business days',
    'not unlimited', 'charged in full', 'Horizontal 16:9 production counts as a separate video', 'Square 1:1 reframing',
    'Brand discovery, audience research and creative concepts.', 'Creator selection, scripts and your approval.', 'Filming, editing, captions and creative variations.', 'Finished videos, revisions and testing recommendations.', 'ship the product to the selected creator', 'dedicated demo or dummy account',
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
  assert.match(root.replace(/<!-- -->/g, ''), /<table[\s\S]*Additional 3 months[\s\S]*\$625[\s\S]*\$1,125[\s\S]*<\/table>/)
  assert.equal(count(root, /<th scope="col"/g), 3)
  assert.equal(count(root, /<table/g), 1)
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

// ── final pricing audit: every prerendered page and every JSON-LD block ────────────────────────────────────────────
test('sitewide audit: no euro prices and no old $2,000 Organic Growth price in any prerendered page, 404 shell or structured data', () => {
  const files = [...KNOWN_PATHS.map((p) => page(p)), fs.readFileSync(path.join(dist, '404.html'), 'utf8')]
  for (const [i, h] of files.entries()) {
    const label = KNOWN_PATHS[i] ?? '404'
    assert.ok(!/€|&euro;|\bEUR\b/.test(h), `${label}: euro pricing`)
    assert.ok(!/Organic Growth[^<]{0,300}\$2,000|\$2,000[^<]{0,300}Organic Growth/.test(h.replace(/<[^>]+>/g, ' ')), `${label}: old Organic Growth price`)
    assert.ok(!/"price":2000\b/.test(h), `${label}: old price in JSON-LD`)
  }
  const bundle = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
  assert.ok(!/€/.test(bundle), 'no € in the shipped JavaScript')
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
  const marks = ['UGC & video production pricing', 'Your creative partner. On your terms.', 'What are you looking to achieve?', 'Different concepts. Not just different hooks.', 'Everything you need to know.', 'Pricing questions, answered.', 'Ready to create something that converts?']
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
  for (const [b, a, hidden] of [['monthly', '$2,500', false], ['monthly', '$4,500', false], ['oneOff', '$3,000', true], ['oneOff', '$5,400', true]]) {
    const mm = paid.match(new RegExp(`<span ([^>]*)>\\${a}<span[^>]*>/${b === 'monthly' ? 'month' : 'project'}`))
    assert.ok(mm, `${a} ${b} present`); assert.equal(/hidden=""/.test(mm[1]), hidden); assert.match(mm[1], new RegExp(`data-billing="${b}"`))
  }
  assert.match(flat(`<div id="root">${organic}`), /Organic Social packages are ongoing content partnerships, billed monthly, with an initial 6-month commitment\./)
  assert.ok(!/One-off|\/project/.test(flat(`<div id="root">${organic}`).replace(/Initial 3-month[^.]*\./, '')), 'no one-off pricing in the Organic group')
})

test('/pricing HTML: commitments: Paid 3 months (+ one-off), Organic 6 months with later terms per agreement; Custom agreed individually', () => {
  const h = page('/pricing')
  const paid = flat(`<div id="root">${group(h, 'paid')}`); const organic = flat(`<div id="root">${group(h, 'organic')}`)
  assert.match(paid, /Monthly: Initial 3-month commitment, followed by a flexible month-to-month agreement with 30 days' cancellation notice\. One-off: One creative production batch, without a recurring commitment\./)
  assert.match(organic, /Organic partnerships: Organic partnerships begin with an initial six-month commitment, giving us time to build a consistent social media presence, learn what resonates with your audience and assess performance\. Terms after the initial six-month period are set out in the applicable agreement\./)
  assert.ok(!/three-month|3-month commitment|month-to-month|30 days/.test(organic.replace('with an initial 6-month commitment', '')), 'Paid terms are never shown on Organic')
  assert.ok(paid.includes('Custom project terms are agreed individually.') && organic.includes('Custom project terms are agreed individually.'))
  assert.ok(paid.includes('All prices exclude VAT.') && organic.includes('All prices exclude VAT.'))
})

test('/pricing HTML: Custom cards say "Let\'s talk." with no number; every card CTA is the Roadmap flow', () => {
  const h = page('/pricing')
  const arts = [...group(h, 'paid').matchAll(/<article[\s\S]*?<\/article>/g), ...group(h, 'organic').matchAll(/<article[\s\S]*?<\/article>/g)].map((x) => x[0])
  assert.equal(arts.length, 6)
  for (const a of arts) assert.match(a, new RegExp(`<a href="${OFFER_PATHS.roadmap}"`))
  const customs = arts.filter((a) => /<h2 id="card-(organic-)?custom-label"/.test(a))
  assert.equal(customs.length, 2)
  for (const c of customs) {
    const t = unescape(c.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' '))
    assert.match(t, /Let(’|')s talk\./); assert.match(t, /Tailored to your needs/); assert.match(t, /Discuss your project/); assert.ok(!/\$\s?\d/.test(t))
  }
  assert.equal(count(arts.join(''), /Get started/g), 4)
})

test('/pricing HTML: Section 2 holds the philosophy (both variants), the Roadmap offer and the stats, below the cards', () => {
  const h = page('/pricing')
  const m = main(h)
  const sec = m.slice(m.indexOf('id="philosophy"'), m.indexOf('id="package-info"'))
  const t = flat(`<div id="root">${sec}`)
  for (const n of ['Different concepts. Not just different hooks.', 'We develop genuinely different creative angles, then create variations designed for structured testing.', '5 original concepts → 10 ad variations', 'Standard Sprint shown.', 'Sprint Plus distributes its variations across its concepts according to the creative testing strategy.', 'Consistency. Content. Real connections.', 'A consistent, video-first approach to organic social growth.', 'Publishing & engagement', 'Optimization', 'Not sure where to start?', 'Get 5 personalized ad concepts for your brand, completely free.', 'Get 5 Free Ad Concepts', '40M+', '1,200+', '500+', 'Core production languages']) assert.ok(t.includes(n), n)
  assert.equal(count(sec, /<li class="flex flex-col items-center"/g), 5, 'five concept columns')
  assert.ok(sec.includes(`href="${OFFER_PATHS.roadmap}"`))
  assert.match(sec, /<div hidden=""><div><h2[^>]*>Consistency\./, 'the organic variant is in the HTML, hidden by default')
})

test('/pricing HTML: Section 3 panels: four buttons, first open, all content (both services) in the markup', () => {
  const h = page('/pricing')
  const m = main(h)
  const sec = m.slice(m.indexOf('id="package-info"'), m.indexOf('id="pricing-faq"'))
  assert.equal(count(sec, /<button id="info-q-/g), 4)
  assert.equal(count(sec, /role="region" aria-labelledby="info-q-/g), 4)
  assert.match(sec, /id="info-q-included"[^>]*aria-expanded="true"/)
  for (const id of ['usage', 'how', 'details']) assert.match(sec, new RegExp(`id="info-q-${id}"[^>]*aria-expanded="false"`))
  const t = flat(`<div id="root">${sec}`)
  for (const n of [
    'Full production, from strategy to finished videos.', '6 months worldwide, with flexible extensions.', 'Four simple stages. One accountable team.', 'Turnaround, formats, revisions and add-ons.',
    'Creative research and strategy', 'Concepts, scripts and client approval', 'Creator selection', 'Filming and professional editing', 'Captions, B-roll and motion graphics as agreed', 'Square and 4:5 reframing', 'Agreed creative variations and testing recommendations',
    'Production in one selected core language: English, Spanish, French or Arabic', 'Additional languages available on request, subject to availability', 'Custom packages have separately agreed production scopes',
    'Strategy and planning', 'Concepts and scripts', 'Post copywriting and captions', 'Scheduling and publishing', 'Organic community engagement and brand relationship management', 'Supported platforms: Facebook, Instagram and TikTok.', 'Customer support is not part of the service.',
    '6 months of worldwide usage rights from the date each video is delivered', 'Paid advertising', 'Organic social media publishing', 'Website usage',
    '$625', '$1,000', '$1,750', '$1,125', '$1,800', '$3,150', '9 months in total', '12 months in total', '18 months in total', 'Custom quote, subject to agreement with the featured creators',
    'apply to the entire relevant creative batch', 'All prices exclude VAT',
    'Existing organic social media posts may remain published.', 'Existing website video placements may remain online.', 'Paid advertising use must stop unless the usage rights are extended.', 'cannot be reshared or republished without extending the usage rights', 'not a transfer of copyright ownership', 'TikTok Spark Ads', 'Meta partnership ads', 'separate from the standard usage rights',
    'Content usage terms for Organic Social partnerships are set out in the applicable agreement.',
    'Brand discovery, audience research and creative concepts.', 'Creator selection, scripts and your approval.', 'Filming, editing, captions and creative variations.', 'Finished videos, revisions and testing recommendations.',
    'Content planning and brand objectives.', 'Concepts, scripts, filming and editing.', 'Scheduling, distribution and organic engagement.', 'Monitoring performance and refining the content approach.',
    'Sprint: 10 business days. Sprint Plus: 15 business days. Production turnaround starts after concepts and scripts are approved.', 'Two rounds per creative concept.', 'Standard performance videos up to 60 seconds.', 'Long-form creatives of 1–3 minutes are available at custom pricing.',
    'Vertical production, with square 1:1 and portrait 4:5 reframing included.', 'Horizontal 16:9 production counts as a separate video', 'Available at $250 extra per creative concept.', 'Raw footage is only available alongside finished, professionally edited videos. It cannot replace them.',
    'you ship the product to the selected creator and cover the shipping costs', 'dedicated demo or dummy account',
    'The Paid Social Sprint terms do not automatically apply.',
  ]) assert.ok(t.includes(n), `panel content missing: ${n}`)
  assert.equal(count(sec, /<table/g), 1)
  assert.ok(!/<details/.test(sec) && !/Separate from usage rights/.test(t), 'no leftover collapsed-details or standalone creator-account card')
})

test('/pricing HTML: organic panel variants never carry Sprint licensing, extension prices, raw footage or paid turnaround', () => {
  const h = page('/pricing')
  const m = main(h); const sec = m.slice(m.indexOf('id="package-info"'), m.indexOf('id="pricing-faq"'))
  // The Usage panel's organic variant is just the agreement reference.
  const usage = sec.slice(sec.indexOf('id="info-a-usage"'), sec.indexOf('id="info-q-how"'))
  const orgPart = usage.slice(usage.lastIndexOf('<div hidden="">'))
  const t = flat(`<div id="root">${orgPart}`)
  assert.match(t, /set out in the applicable agreement/)
  assert.ok(!/\$\d|Spark|extension prices.*Sprint Plus/.test(t.replace('The usage rights and extension prices listed for the Paid Social Creative Testing packages do not automatically apply to Organic Social.', '')))
})

test('/pricing HTML: FAQ section is four categories, all 17 answers in the markup, organic six-month answer included', () => {
  const h = page('/pricing')
  const faqHtml = rootOf(h).slice(rootOf(h).indexOf('id="pricing-faq"'))
  assert.equal(count(faqHtml, /role="tab"/g), 4); assert.equal(count(faqHtml, /role="tabpanel"/g), 4)
  assert.equal(PRICING_FAQ.length, 17)
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
  for (const p of ['$2,500 per month', '$4,500 per month', '$3,000 one-off', '$5,400 one-off', '$1,500 per month', '$250 per creative concept']) assert.ok(ld.includes(p), p)
  assert.match(ld, /Initial six-month commitment\. Terms after the initial six-month period/)
  assert.ok(!/OWNER_REVIEW|deferred to the applicable agreement/.test(t))
})
