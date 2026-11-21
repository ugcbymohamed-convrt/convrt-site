// Run with: node --test tests/creator-showcase.test.mjs
// /creator-showcase (the Creator Showcase: examples from independent creators; it was /our-work until Nov 2026) and the shared portfolio data (src/content/portfolio.js) that also feeds /ugc-video-agency, /spokesperson-video-production and the homepage.
// Checks the route, head, sitemap, structured data, the prerendered HTML, the permission gates, the per-page selectors, the category
// tabs (an empty category has no tab), the grid structure, the empty state, the player's accessibility contract and the internal links.
// Builds the site once into a temp dir and starts a Vite SSR loader to render components with sample data.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PATHS, KNOWN_PATHS } from '../src/routes.js'
import { SITE_URL, CREATOR_SHOWCASE_PATH } from '../src/config.js'
import { CREATOR_EXAMPLES_NOTE } from '../src/content/attribution.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { ourWorkGraph, videoObjectNode, jsonLdFor, BREADCRUMB_TRAILS } from '../src/seo/structuredData.js'
import {
  PORTFOLIO, portfolioProblems, isDisplayable, isShowcaseable, selectOurWork, selectHero, selectGallery, selectShowcase, selectDisplayable,
  availableCategories, categoryOf, inCategory, countIn, filterByCategory, CATEGORIES, ALL_CATEGORY, titleOf, typeLabel, posterUrl,
  isClassified, industryLabel, productionLabel, brandLabel, creditLabel, buildFacets, matchesFilters,
} from '../src/content/portfolio.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const PATH = PATHS.showcase
const URL_ = `${SITE_URL}${PATH}`

const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
const headOf = (h) => h.slice(0, h.indexOf('</head>'))

let tmp, dist, vite, Library, Tabs
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-ourwork-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
  vite = await createServer({ root: ROOT, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  Library = await vite.ssrLoadModule('/src/components/ourwork/PortfolioLibrary.jsx')
  Tabs = await vite.ssrLoadModule('/src/components/ourwork/CategoryTabs.jsx')
})
after(async () => {
  if (vite) await vite.close()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

const APPROVED = { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'test', approvedOn: '2026-01-01' }
const sample = (over = {}) => ({
  id: 'sample-a', title: 'Sample title', caption: 'A sample caption.', type: 'ugc', industry: 'saas', languages: ['en'],
  source: { mp4: '/videos/sample.mp4' }, poster: '/portfolio/sample.webp', creatorId: 'c-test-1', approval: APPROVED, ...over,
})
const many = (n, industry = 'saas') => Array.from({ length: n }, (_, i) => sample({ id: `s-${industry}-${i}`, title: `Video ${i}`, industry }))

// ── route, head, sitemap ─────────────────────────────────────────────────────────────────
test('route: /creator-showcase is a public path, and CREATOR_SHOWCASE_PATH (used by every link to it) is that path', () => {
  assert.equal(PATH, '/creator-showcase')
  assert.equal(CREATOR_SHOWCASE_PATH, '/creator-showcase')
  assert.ok(KNOWN_PATHS.includes('/creator-showcase'))
  assert.ok(fs.existsSync(path.join(dist, 'creator-showcase', 'index.html')), 'a real static file is written for the route')
})

test('head: approved title, description from the actual portfolio, self-canonical, indexable only with approved videos, in the sitemap accordingly', () => {
  const e = SITE_SEO[PATH]
  assert.equal(e.title, 'Creator Showcase | UGC Video Examples | CONVRT')
  assert.ok(e.title.length <= 62)
  assert.ok(e.description.length >= 120 && e.description.length <= 160, `description length ${e.description.length}`)
  assert.ok(!/\d/.test(e.description), 'no counts or figures in the description')
  assert.equal(e.indexable, selectOurWork().length > 0, 'an empty library is never promoted to search')
  assert.equal(pageHead(PATH).url, URL_)
  assert.equal(sitemapRoutes().includes(PATH), e.indexable)
  const titles = Object.entries(SITE_SEO).filter(([p]) => p !== PATH).map(([, v]) => v.title)
  assert.ok(!titles.includes(e.title), 'unique title')
  const html = page(PATH)
  const head = headOf(html)
  assert.ok(head.includes('<title>Creator Showcase | UGC Video Examples | CONVRT</title>'))
  assert.ok(head.includes(`<link rel="canonical" href="${URL_}" />`))
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.equal(/name="robots"/.test(head), !e.indexable)
  assert.equal(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${URL_}</loc>`), e.indexable)
})

// ── prerendered HTML: useful without JavaScript ──────────────────────────────────────────
test('static HTML: breadcrumb, one H1, the approved intro, two sections, the first page of cards, no stream and no video element', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.match(html, /<nav aria-label="Breadcrumb"[\s\S]*?Home[\s\S]*?Creator Showcase/)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  assert.ok(t.includes("See what's possible."))
  assert.ok(t.includes('Explore real creator videos across e-commerce, SaaS, services and more.'))
  assert.ok(t.includes(CREATOR_EXAMPLES_NOTE), 'the independent-creators attribution line is visible (SEO/GEO Batch 1)')
  assert.ok(!/produced by CONVRT|CONVRT produced|our work|we produced/i.test(t.replace(CREATOR_EXAMPLES_NOTE, '')), 'no CONVRT-production claim beyond the disclaimer')
  assert.equal((html.match(/<section[\s>]/g) || []).length, 3, 'three sections: the hero, the library and the "what you will find" guide (Batch 2)')
  const shown = Math.min(selectOurWork().length, 12)
  assert.equal((html.match(/Play video:/g) || []).length, shown, 'the first page of approved videos is in the HTML (crawlable without the filter script)')
  for (const v of selectOurWork().slice(0, shown)) assert.ok(html.includes(decode(titleOf(v)).replace(/&/g, '&amp;')) || html.includes(titleOf(v)), `${v.id} title in the HTML`)
  assert.ok(!/<video/.test(html), 'no video element until a visitor opens a card')
  assert.ok(!/\.m3u8|<source/.test(html), 'no stream is requested by the static HTML')
  assert.ok(!/Sample card|coming soon|placeholder/i.test(t), 'no placeholder content')
})

test('static HTML: structured data is a CollectionPage + BreadcrumbList; VideoObject only for verified videos (none have an upload date yet)', () => {
  const html = page(PATH)
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
  assert.equal(blocks.length, 1)
  const nodes = blocks[0]['@graph']
  const types = nodes.map((n) => n['@type'])
  assert.ok(types.includes('CollectionPage') && types.includes('BreadcrumbList') && types.includes('Organization'))
  const crumb = nodes.find((n) => n['@type'] === 'BreadcrumbList')
  assert.deepEqual(crumb.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'Creator Showcase', URL_]])
  assert.deepEqual(BREADCRUMB_TRAILS[PATH].map((t) => t.path), ['/', PATH])
  const withDate = PORTFOLIO.filter((v) => v.uploadDate && isDisplayable(v)).length
  assert.equal(types.filter((x) => x === 'VideoObject').length, withDate, 'a VideoObject exists exactly for each displayable video that has a verified uploadDate')
  assert.deepEqual(blocks[0], JSON.parse(JSON.stringify(pageHead(PATH).jsonLd)), 'static JSON-LD equals the client head')
})

test('structured data: VideoObject needs approval AND a real uploadDate; nothing is ever invented', () => {
  assert.equal(videoObjectNode(sample()), undefined, 'no uploadDate: no VideoObject')
  assert.equal(videoObjectNode(sample({ uploadDate: '2026-02-03', approval: { ...APPROVED, portfolioUse: false } })), undefined, 'not displayable: no VideoObject')
  const v = videoObjectNode(sample({ uploadDate: '2026-02-03', source: { cloudflareId: 'abc123' }, poster: '/portfolio/x.webp', description: 'Longer text.' }))
  assert.equal(v['@type'], 'VideoObject')
  assert.equal(v.name, 'Sample title')
  assert.equal(v.description, 'Longer text.')
  assert.equal(v.uploadDate, '2026-02-03')
  assert.deepEqual(v.thumbnailUrl, [`${SITE_URL}/portfolio/x.webp`])
  assert.equal(v.contentUrl, 'https://videodelivery.net/abc123/manifest/video.m3u8')
  assert.equal(v.embedUrl, 'https://iframe.videodelivery.net/abc123')
  assert.equal(Object.keys(v).filter((k) => /rating|review|interaction|duration|view/i.test(k)).length, 0, 'no ratings, reviews, view counts or durations')
  assert.equal(jsonLdFor(PATH, { title: 't', description: 'd' })['@graph'].find((n) => n['@type'] === 'CollectionPage').name, 't')
  assert.equal(typeof ourWorkGraph, 'function')
})

// ── the shared data: one file, three pages ──────────────────────────────────────────────
test('data: the shipped list is valid with unique ids, every showcase video is recorded once, and the owner\'s Adscale / Elyon / Graspo decision holds', () => {
  const ids = PORTFOLIO.map((i) => i.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const i of PORTFOLIO) assert.deepEqual(portfolioProblems(i), [], i.id)
  const media = PORTFOLIO.map((i) => i.source.cloudflareId ?? i.source.mp4)
  assert.equal(new Set(media).size, media.length, 'no video is listed twice')
  assert.ok(selectDisplayable(PORTFOLIO).every((i) => !/adscale|elyon|graspo/i.test(JSON.stringify(i))), 'the client case-study clips are not portfolio material, so they never reach /creator-showcase')
  assert.ok(PORTFOLIO.filter((i) => i.showcase).every((i) => i.approval.portfolioUse === false && i.approval.creatorConsent === false))
})

test('data: each page is a view of the same list: our-work = all approved, UGC page = approved UGC, homepage panels = tagged videos', () => {
  const list = [
    sample({ id: 'saas-1', industry: 'saas' }),
    sample({ id: 'shop-1', industry: 'ecommerce', placement: 'hero' }),
    sample({ id: 'talk-1', industry: 'saas', type: 'spokesperson' }),
    sample({ id: 'pending-1', approval: { ...APPROVED, status: 'pending' } }),
    sample({ id: 'noconsent-1', approval: { ...APPROVED, creatorConsent: false } }),
    sample({ id: 'panel-1', showcase: 'elyon', approval: { ...APPROVED, portfolioUse: false, creatorConsent: false } }),
    sample({ id: 'panel-2', showcase: 'elyon' }),
    sample({ id: 'panel-pending', showcase: 'elyon', approval: { status: 'pending' } }),
  ]
  assert.deepEqual(selectOurWork(list).map((i) => i.id), ['saas-1', 'shop-1', 'talk-1', 'panel-2'], 'every fully approved video, in file order; none that is pending, without consent or portfolio permission')
  assert.deepEqual(selectHero(list).map((i) => i.id), ['shop-1'])
  assert.deepEqual(selectGallery(list).map((i) => i.id), ['saas-1', 'panel-2'], 'the UGC gallery skips the spokesperson video and the hero video')
  assert.deepEqual(selectShowcase('elyon', list).map((i) => i.id), ['panel-1', 'panel-2'], 'homepage panel: approved + tagged; portfolio permission is not needed there')
  assert.equal(isShowcaseable(sample()), false, 'untagged')
  assert.equal(isDisplayable(sample({ id: 'panel-1', showcase: 'elyon', approval: { ...APPROVED, portfolioUse: false } })), false)
  // one new entry reaches /creator-showcase and the UGC gallery with no other change
  const added = [sample({ id: 'brand-new', industry: 'ecommerce' }), ...list]
  assert.ok(selectOurWork(added).some((i) => i.id === 'brand-new') && selectGallery(added).some((i) => i.id === 'brand-new'))
})

test('data: the homepage client panels still show exactly the same videos, in the same order, as before the data was centralised', () => {
  const key = (v) => v.source.cloudflareId ?? v.source.mp4
  assert.deepEqual(selectShowcase('adscale').map(key), ['8d4dbbeabac272bddb23068c91037af8', '08abef50c734085f25f345cdde4b1e33', '/showcase/adscale-creator.mp4'])
  assert.deepEqual(selectShowcase('elyon').map(key), ['fa02007b36fae2b3bb68c97cdd00e9fc', '0905b814e2ba3950197b5bfe1cefae38', '9e6cb8438c9b0c1ab8b55953718eddde'])
  assert.deepEqual(selectShowcase('graspo').map(key), ['15dd5505109f6821ccdcb13fc3cdc1fd', '3616606e3ca6d1a85c8a57d7cc2f656f', 'c1379ace38f2fa19ef2a45de1bb5d4b1'])
  assert.deepEqual(selectShowcase('adscale').map((v) => v.poster), [undefined, '/showcase/adscale-agentic-poster.webp', '/showcase/adscale-creator-poster.webp'])
  const home = rootOf(page('/'))
  for (const id of ['8d4dbbeabac272bddb23068c91037af8']) assert.ok(home.includes(`videodelivery.net/${id}/thumbnails`), 'homepage poster for the first Adscale video')
  assert.ok(home.includes('/showcase/adscale-agentic-poster.webp') && home.includes('/showcase/adscale-creator-poster.webp'))
})

test('data: validation rejects bad entries; language is optional until confirmed', () => {
  assert.deepEqual(portfolioProblems(sample()), [])
  assert.ok(portfolioProblems(sample({ id: 'Bad Id' })).length)
  assert.ok(portfolioProblems(sample({ type: 'Bad Type' })).length)
  assert.ok(portfolioProblems(sample({ uploadDate: '3 Feb 2026' })).length)
  assert.deepEqual(portfolioProblems(sample({ languages: undefined })), [], 'language is optional until confirmed')
  assert.ok(portfolioProblems(sample({ languages: ['English'] })).length, 'but a given language must be a valid code')
  assert.equal(titleOf(sample({ title: undefined })), 'A sample caption.', 'title falls back to the caption')
  assert.equal(typeLabel(sample({ type: 'spokesperson' })), 'Spokesperson')
  assert.equal(typeLabel(sample({ type: undefined })), '', 'an unset type is unknown, not UGC')
  assert.equal(posterUrl(sample({ source: { cloudflareId: 'zz' }, poster: undefined })).includes('videodelivery.net/zz/thumbnails'), true)
})

// ── categories ──────────────────────────────────────────────────────────────────────────
test('categories: All Work + the four approved industry filters (E-commerce, SaaS, Services, Other) + the Spokesperson type filter; a category with no videos has no tab', () => {
  assert.deepEqual([ALL_CATEGORY, ...CATEGORIES].map((c) => c.label), ['All Work', 'E-commerce', 'SaaS', 'Services', 'Other', 'Spokesperson'])
  assert.deepEqual([ALL_CATEGORY, ...CATEGORIES].map((c) => c.color), ['#d5ff40', '#ec4899', '#9a7aff', '#34c9c0', '#ffb547', '#ff6a4d'])
  assert.ok(CATEGORIES.every((c) => /^#[0-9a-f]{6}$/.test(c.color)))
  const tailwind = read('tailwind.config.js')
  for (const token of ['lime: \'#d5ff40\'', 'magenta: \'#ec4899\'', 'amber: \'#ffb547\'']) assert.ok(tailwind.includes(token), `reuses the existing token ${token}`)
  const items = [sample({ id: 'a', industry: 'saas' }), sample({ id: 'b', industry: 'ecommerce' }), sample({ id: 'c', industry: 'ecommerce' })]
  assert.deepEqual(availableCategories(items).map((c) => c.id), ['all', 'ecommerce', 'saas'], 'no Services, no Other')
  assert.deepEqual(availableCategories([]).map((c) => c.id), ['all'])
  assert.deepEqual(availableCategories([sample({ industry: 'beauty' })]).map((c) => c.id), ['all', 'other'], 'any other industry groups under Other')
  assert.equal(categoryOf(sample({ industry: 'technology' })), 'saas')
  assert.equal(categoryOf(sample({ industry: 'app' })), 'other')
  assert.equal(countIn(items, 'all'), 3)
  assert.equal(countIn(items, 'ecommerce'), 2)
  assert.deepEqual(filterByCategory(items, 'saas').map((i) => i.id), ['a'])
  assert.equal(filterByCategory(items, 'all'), items)
})

test('tabs render: one row, icons, labels, counts, All Work pressed; arrows and edge fades are scroll helpers, not extra tabs', () => {
  const items = [...many(2, 'saas'), ...many(3, 'ecommerce'), ...many(1, 'services')]
  const tabs = availableCategories(items)
  const html = renderToStaticMarkup(createElement(Tabs.default, { tabs, activeId: 'all', counts: Object.fromEntries(tabs.map((t) => [t.id, countIn(items, t.id)])), onSelect() {} }))
  const buttons = [...html.matchAll(/<button type="button" aria-pressed="(true|false)"[^>]*>([\s\S]*?)<\/button>/g)]
  assert.equal(buttons.length, 4)
  assert.deepEqual(buttons.map((b) => b[1]), ['true', 'false', 'false', 'false'])
  assert.deepEqual(buttons.map((b) => b[2].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()), ['All Work 6', 'E-commerce 3', 'SaaS 2', 'Services 1'])
  assert.ok(buttons.every((b) => /<svg[^>]*aria-hidden="true"/.test(b[2])), 'every tab has an icon')
  assert.match(html, /role="group" aria-label="Filter videos by industry or type"/)
  assert.ok(/overflow-x-auto/.test(html) && !/flex-wrap/.test(html), 'one scrolling row, never wrapping onto several lines')
  assert.ok(/focus-visible:outline/.test(html) && /hover:border-\[var\(--c\)\]/.test(html) && /transition-/.test(html), 'hover, keyboard focus and transitions')
  assert.ok(/Show previous categories/.test(html) && /Show next categories/.test(html) && /md:flex/.test(html))
})

// ── the grid ────────────────────────────────────────────────────────────────────────────
test('grid: 2 columns on phones, 3 on tablets, 4 on desktop; portrait 9:16 cards with sized thumbnails; first row eager, the rest lazy; no video elements', () => {
  const items = many(14)
  const html = renderToStaticMarkup(createElement(Library.default, { items }))
  assert.match(html, /<ul[^>]*class="[^"]*grid-cols-2[^"]*md:grid-cols-3[^"]*lg:grid-cols-4/)
  assert.equal((html.match(/aria-label="Play video: /g) || []).length, 12, 'one page of 12, not all 14')
  assert.ok(/aspect-\[9\/16\]/.test(html))
  const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0])
  assert.equal(imgs.length, 12)
  assert.ok(imgs.every((i) => /width="405"/.test(i) && /height="720"/.test(i) && /decoding="async"/.test(i)), 'dimensions reserved: no layout shift')
  assert.equal(imgs.filter((i) => /fetchpriority="high"/.test(i)).length, 4, 'the first row is prioritised')
  assert.equal(imgs.filter((i) => /loading="lazy"/.test(i)).length, 8, 'everything below the first row lazy-loads')
  assert.ok(!/<video/.test(html) && !/role="dialog"/.test(html), 'no player exists until a card is opened')
  assert.match(html, /Show more <span[^>]*>\(2 more\)<\/span>/, 'a Load more control once the library is larger than a page')
  const exact = renderToStaticMarkup(createElement(Library.default, { items: many(12) }))
  assert.ok(!/Show more/.test(exact), 'no Load more when everything fits')
})

test('card: title, industry, language and brand shown; creator name only with permission; the internal creator id never', () => {
  const html = renderToStaticMarkup(createElement(Library.default, { items: [
    sample({ id: 'x', title: 'Skincare routine', industry: 'ecommerce', languages: ['en', 'es'], brand: 'Acme', creator: { displayName: 'Ana', showName: false }, creatorId: 'c-secret-42', approval: { ...APPROVED, brandDisplay: true } }),
  ] }))
  assert.ok(html.includes('Skincare routine') && html.includes('E-commerce') && html.includes('EN · ES') && html.includes('Acme'))
  assert.ok(!html.includes('Ana') && !html.includes('c-secret-42'))
  const named = renderToStaticMarkup(createElement(Library.default, { items: [sample({ creator: { displayName: 'Ana', showName: true } })] }))
  assert.ok(named.includes('Ana'))
  const noLang = renderToStaticMarkup(createElement(Library.default, { items: [sample({ languages: undefined, approval: { ...APPROVED } })] }))
  assert.ok(/Play video: Sample title/.test(noLang))
})

test('library: only categories with videos get a tab, the default view is All Work, and the active accent is a CSS variable (the page never recolours)', () => {
  const html = renderToStaticMarkup(createElement(Library.default, { items: [...many(2, 'saas'), ...many(1, 'ecommerce')] }))
  assert.ok(/All Work/.test(html) && /SaaS/.test(html) && /E-commerce/.test(html))
  assert.ok(!/Services/.test(html) && !/>Other</.test(html), 'empty categories are hidden')
  assert.match(html, /aria-pressed="true"[^>]*>[\s\S]*?All Work/)
  assert.match(html, /style="--cat:#d5ff40"/, 'All Work accent')
  assert.match(html, /Showing 3 videos/, 'screen-reader count')
})

test('empty state: no cards, no counts, no tabs and no portfolio claim; a compact message with the usual paths', () => {
  const html = renderToStaticMarkup(createElement(Library.default, { items: [] }))
  const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  assert.ok(t.includes('New work is on its way.'))
  assert.ok(!/Play video/.test(html) && !/aria-pressed/.test(html) && !/<img/.test(html) && !/<video/.test(html))
  assert.ok(!/\d/.test(t.replace(/5 Free Ad Concepts/, '')), 'no numbers (no portfolio count)')
  assert.ok(html.includes('href="/creative-growth-roadmap"') && html.includes('href="/case-studies"'))
})

// ── the player ──────────────────────────────────────────────────────────────────────────
test('player: a modal dialog with Escape and a close button, focus trap and return, one video at a time, pause on close, vertical, Safari-safe', () => {
  const src = read('src/components/ourwork/VideoLightbox.jsx')
  assert.ok(/role="dialog"/.test(src) && /aria-modal="true"/.test(src) && /aria-label=\{title\}/.test(src))
  assert.ok(/e\.key === 'Escape'/.test(src) && /aria-label="Close video"/.test(src))
  assert.ok(/e\.key === 'Tab'/.test(src) && /closeBtn\.current\?\.focus\(\)/.test(src) && /el\.focus\(/.test(src), 'focus moves in, is trapped and returns to the opener')
  assert.ok(/document\.body\.style\.overflow = 'hidden'/.test(src), 'the page behind does not scroll')
  assert.ok(/v\.pause\(\)/.test(src), 'closing pauses')
  assert.ok(/playsInline/.test(src) && /aspect-\[9\/16\]/.test(src) && /createPortal/.test(src), 'inline playback on iOS, vertical, portal')
  assert.ok(/useAttachSource/.test(src), 'reuses the site\'s Cloudflare / HLS plumbing (hls.js only off Safari)')
  assert.ok(/aria-label=\{playing \? 'Pause' : 'Play'\}/.test(src) && /'Unmute' : 'Mute'/.test(src) && /aria-label="Volume"/.test(src) && /aria-label="Seek"/.test(src), 'play / pause, mute, volume, seek')
  assert.ok(/NotAllowedError/.test(src), 'a browser that refuses sound falls back to muted playback')
  const lib = read('src/components/ourwork/PortfolioLibrary.jsx')
  assert.equal((lib.match(/<VideoLightbox/g) || []).length, 1, 'one player for the whole library')
  assert.ok(/\{open && \(/.test(lib), 'mounted only while a card is open: no other video can be playing')
  const hls = read('src/lib/hls.js')
  assert.ok(/canPlayType\(NATIVE_HLS\)/.test(hls), 'Safari / iOS use native HLS')
})

test('motion: every animation honours prefers-reduced-motion', () => {
  const css = read('src/index.css')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.ow-fade \{ animation: none; \}/)
  for (const f of ['VideoCard', 'CategoryTabs']) assert.ok(/motion-reduce:/.test(read(`src/components/ourwork/${f}.jsx`)), `${f} has reduced-motion variants`)
  assert.ok(/prefers-reduced-motion/.test(read('src/components/ourwork/CategoryTabs.jsx')), 'the tab row scrolls without smoothing for reduced motion')
})

// ── internal links ──────────────────────────────────────────────────────────────────────
test('links: nav, footer, homepage CTA and the UGC page all lead to /creator-showcase, once each, without duplicates', () => {
  const home = rootOf(page('/'))
  assert.equal((home.match(/href="\/creator-showcase"/g) || []).length, 3, 'desktop nav (the mobile menu is closed), footer and the hero button')
  assert.match(home, /<a href="\/creator-showcase"[^>]*>\s*Explore Videos/, 'the homepage "Explore Videos" button')
  assert.equal((home.match(/>Creator Showcase</g) || []).length, 2, 'one nav link and one footer link')
  assert.ok(!/>(See Our Work|Our Work)</.test(home), 'no "Our Work" label is left on the homepage')
  assert.ok(!/href="#showcase"/.test(home), 'the old in-page anchor is gone (the section itself stays on the page)')
  assert.ok(home.includes('id="showcase"'))
  const ugc = rootOf(page(PATHS.ugcVideoAgency))
  assert.match(ugc, /<a href="\/creator-showcase"[^>]*>\s*Explore Videos/, 'UGC hero button')
  assert.match(ugc, /<a href="\/creator-showcase"[^>]*>\s*Explore UGC Videos/, 'the button under the UGC gallery')
  assert.ok(!/See all UGC videos|See Our Work|>Our Work</.test(ugc))
  const our = rootOf(page(PATH))
  assert.equal((our.match(/>Creator Showcase</g) || []).length, 3, 'nav, breadcrumb and footer')
  assert.ok(home.includes('/creative-growth-roadmap') && ugc.includes('/creative-growth-roadmap'), 'the conversion paths are untouched')
})

test('docs: the data file header documents the one-file workflow and the new fields', () => {
  const header = read('src/content/portfolio.js').slice(0, 9000)
  for (const k of ['title', 'type', 'industry', 'languages', 'source', 'poster', 'creatorId', 'brand', 'production', 'productionCredit', 'brandDisplay', 'placement', 'showcase', 'uploadDate', 'approval', 'unclassified']) assert.ok(header.includes(k), `documents ${k}`)
  assert.ok(/ONE file/.test(header) && /selectOurWork/.test(header) && /selectGallery/.test(header) && /selectShowcase/.test(header))
})

// ── the rename: /our-work → /creator-showcase ────────────────────────────────────────────
test('rename: /our-work is a permanent redirect to /creator-showcase, with no loop, no page, no sitemap entry and no link left in the app', () => {
  const vercel = JSON.parse(read('vercel.json'))
  const r = vercel.redirects.find((x) => x.source === '/our-work')
  assert.deepEqual(r, { source: '/our-work', destination: '/creator-showcase', permanent: true }, 'permanent (Vercel sends a 308)')
  // no loop: no redirect's destination is the source of another redirect, and the destination is a real static page
  const sources = new Set(vercel.redirects.map((x) => x.source))
  for (const x of vercel.redirects) assert.ok(!sources.has(x.destination), `redirect chain or loop at ${x.source} → ${x.destination}`)
  assert.ok(KNOWN_PATHS.includes(r.destination) && fs.existsSync(path.join(dist, 'creator-showcase', 'index.html')))
  assert.ok(!KNOWN_PATHS.includes('/our-work') && !fs.existsSync(path.join(dist, 'our-work')), 'no page is built at the old URL, so the redirect is the only thing that answers it')
  assert.ok(!/\/our-work/.test(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')), 'the old URL is not in the sitemap')
  for (const p of KNOWN_PATHS) assert.ok(!/href="\/our-work"/.test(page(p)) && !/\/our-work/.test(headOf(page(p))), `${p} still points at /our-work`)
  // source: the only remaining mentions are the redirect's own documentation
  for (const f of ['src/config.js', 'src/routes.js', 'src/seo/siteSeo.js', 'src/seo/structuredData.js', 'src/components/Nav.jsx', 'src/components/Footer.jsx']) assert.ok(!/['"`]\/our-work/.test(read(f)), `${f} hard-codes the old URL`)
})

test('rename: every link to the showcase (header, footer, homepage hero, UGC hero and gallery, Spokesperson hero and gallery) goes to /creator-showcase', () => {
  const link = (h) => rootOf(h).includes('href="/creator-showcase"')
  for (const p of ['/', '/ugc-video-agency', '/spokesperson-video-production', '/pricing', '/case-studies']) assert.ok(link(page(p)), `${p} links to /creator-showcase (header and footer at least)`)
  assert.match(rootOf(page('/')), /<a [^>]*href="\/creator-showcase"[^>]*>[\s\S]*?Explore Videos/)
  assert.match(rootOf(page('/spokesperson-video-production')), /<a [^>]*href="\/creator-showcase"[^>]*>\s*Explore Videos/)
  assert.match(rootOf(page('/ugc-video-agency')), /<a [^>]*href="\/creator-showcase"[^>]*>\s*Explore Videos/)
})

test('rename: canonical, og:url, sitemap and structured data all use /creator-showcase; the approved copy and filters are unchanged', () => {
  const html = page(PATH)
  const head = headOf(html)
  assert.ok(head.includes(`<link rel="canonical" href="${SITE_URL}/creator-showcase" />`))
  assert.ok(!/our-work/.test(head + html.match(/<script type="application\/ld\+json"[\s\S]*?<\/script>/)?.[0]))
  const ld = JSON.stringify(jsonLdFor(PATH, SITE_SEO[PATH]))
  assert.ok(ld.includes(`${SITE_URL}/creator-showcase`) && !ld.includes('our-work'))
  assert.equal(SITE_SEO[PATH].title, 'Creator Showcase | UGC Video Examples | CONVRT', 'the approved title is unchanged')
  assert.deepEqual(CATEGORIES.map((c) => c.label).slice(0, 4), ['E-commerce', 'SaaS', 'Services', 'Other'], 'the four approved filters, unchanged and in order (the Spokesperson filter follows them)')
  assert.ok(textOf(html).includes("See what's possible."))
})

test('independence: the Showcase and the Spokesperson page each have their own URL, head, JSON-LD and sitemap entry; neither renders the other', () => {
  const sp = '/spokesperson-video-production'
  assert.notEqual(PATH, sp)
  assert.notEqual(SITE_SEO[PATH].title, SITE_SEO[sp].title)
  assert.notEqual(SITE_SEO[PATH].description, SITE_SEO[sp].description)
  assert.ok(!sitemapRoutes().includes('/our-work'))
  const showcase = rootOf(page(PATH))
  const spokes = rootOf(page(sp))
  assert.ok(!showcase.includes('id="spokesperson-h1"') && !showcase.includes('One message. Different ways'), 'the Showcase is not part of the Spokesperson page')
  assert.ok(!spokes.includes('id="our-work-heading"') && !spokes.includes("See what's possible."), 'the Spokesperson page does not embed the Showcase')
  assert.ok(spokes.includes('href="/creator-showcase"') && showcase.includes('href="/spokesperson-video-production"'), 'they link to each other only through ordinary links (footer, buttons)')
  const g = (p) => JSON.parse(page(p).match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1].replace(/\\u003c/g, '<'))['@graph']
  assert.ok(g(PATH).some((n) => n['@type'] === 'CollectionPage') && !g(sp).some((n) => n['@type'] === 'CollectionPage'))
  assert.ok(g(sp).some((n) => n['@type'] === 'FAQPage') && !g(PATH).some((n) => n['@type'] === 'FAQPage'))
})

// ── Creator Showcase positioning: independent creators, not CONVRT productions ──────────────────────
const CLAIMS = /our productions?|client projects?|videos we (created|made|produced)|our campaign results?|CONVRT[- ]produced (ads|advertisements|videos)|produced by CONVRT for|our work\b/i

test('regression: the page and its metadata never present the creator videos as CONVRT productions', () => {
  const html = page(PATH)
  const e = SITE_SEO[PATH]
  const visible = textOf(html)
  assert.ok(!CLAIMS.test(visible), `visible copy: ${visible.match(CLAIMS)?.[0]}`)
  assert.ok(!CLAIMS.test(`${e.title} ${e.description} ${e.ogTitle} ${e.ogDescription}`), 'SEO title and descriptions')
  assert.ok(!CLAIMS.test(JSON.stringify(pageHead(PATH).jsonLd)), 'structured data')
  assert.ok(/independent creators/.test(e.description))
  for (const v of selectOurWork()) assert.ok(!CLAIMS.test(`${titleOf(v)} ${v.caption}`), `${v.id}: caption`)
  for (const f of ['VideoCard', 'VideoLightbox', 'PortfolioLibrary', 'OurWorkHero']) assert.ok(!CLAIMS.test(read(`src/components/ourwork/${f}.jsx`)), `${f}: copy`)
})

test('regression: structured data names CONVRT as producer only for a video explicitly marked production "convrt"', () => {
  const base = { uploadDate: '2026-02-03', source: { cloudflareId: 'abc123' } }
  const independent = videoObjectNode(sample({ ...base, production: 'independent' }))
  const unknown = videoObjectNode(sample({ ...base }))
  const convrt = videoObjectNode(sample({ ...base, production: 'convrt' }))
  for (const v of [independent, unknown]) {
    assert.ok(!('producer' in v) && !('publisher' in v) && !('creator' in v) && !('author' in v), 'no producer, publisher, creator or author is invented')
    assert.ok(!JSON.stringify(v).includes('#organization'), 'CONVRT is not referenced')
  }
  assert.deepEqual(convrt.producer, { '@id': `${SITE_URL}/#organization` })
  // the page graph: CONVRT is the page's publisher (it runs the page), and no other video relationship exists
  const g = ourWorkGraph({ title: 't', description: 'd' })['@graph']
  assert.deepEqual(g.find((n) => n['@type'] === 'CollectionPage').publisher, { '@id': `${SITE_URL}/#organization` })
  assert.ok(!g.some((n) => n['@type'] === 'VideoObject' && n.producer), 'no shipped video is declared as produced by CONVRT')
})

test('regression: production attribution is unknown unless confirmed, and a label appears only for a confirmed value', () => {
  assert.ok(PORTFOLIO.every((v) => v.production === undefined), 'no entry claims who produced it yet')
  assert.ok(portfolioProblems(sample({ production: 'agency' })).length, 'only independent | convrt')
  assert.equal(productionLabel(sample()), '')
  assert.equal(productionLabel(sample({ production: 'independent' })), 'Independent creator')
  assert.equal(productionLabel(sample({ production: 'convrt' })), 'Produced by CONVRT')
  const lb = read('src/components/ourwork/VideoLightbox.jsx')
  assert.ok(/productionLabel\(item\)/.test(lb) && /\.filter\(Boolean\)/.test(lb), 'the player mentions production only when known')
})

test('regression: the nine homepage client videos stay homepage-only: not in /creator-showcase, the UGC page or the sitemap data, permissions untouched', () => {
  const clients = PORTFOLIO.filter((v) => v.showcase)
  assert.equal(clients.length, 9)
  assert.deepEqual([...new Set(clients.map((v) => v.showcase))].sort(), ['adscale', 'elyon', 'graspo'])
  for (const v of clients) {
    assert.equal(v.approval.portfolioUse, false, `${v.id}: portfolioUse stays false`)
    assert.equal(v.approval.creatorConsent, false, `${v.id}: creatorConsent stays false`)
    assert.ok(!selectOurWork().includes(v) && !selectGallery().includes(v) && !selectHero().includes(v), `${v.id} is not on /creator-showcase or the UGC page`)
  }
  const our = rootOf(page(PATH))
  for (const v of clients) assert.ok(!our.includes(v.source.cloudflareId ?? v.source.mp4), `${v.id} is not in the /creator-showcase HTML`)
  // Batch 2 added two descriptive links to the published case studies (their hrefs contain the slugs); the anchors name no client and no client video is shown.
  assert.ok(!/adscale|elyon|graspo/i.test(our.replace(/<script[\s\S]*?<\/script>/g, '').replace(/href="\/case-studies\/(graspo|elyon)"/g, '')), 'no client name on /creator-showcase')
  const home = rootOf(page('/'))
  assert.ok(home.includes('id="showcase"') && home.includes('/showcase/adscale-creator-poster.webp'), 'the homepage client showcase is intact')
})

test('regression: the 11 original portfolio entries are intact (ids, media, permissions); only the five that sit in the E-commerce folder were classified', () => {
  const ids = ['ugc-hero-1', 'ugc-hero-2', 'ugc-hero-3', 'ugc-gal-1', 'ugc-gal-8', 'ugc-gal-4', 'ugc-gal-3', 'ugc-gal-5', 'ugc-gal-7', 'ugc-gal-2', 'ugc-gal-6']
  const original = PORTFOLIO.filter((v) => ids.includes(v.id))
  assert.deepEqual(original.map((v) => v.id).sort(), [...ids].sort(), 'same 11 entries (their order on the page is now mixed)')
  assert.deepEqual(ids.map((id) => PORTFOLIO.find((v) => v.id === id).source.cloudflareId), [
    '33a4063ee0e8dafe3379f0a97817036e', '63446474698139b4ac17c1f053212242', '1fc1374cdfe428d10bfc40ad4eff9693', 'c8914f7a0db3ac9f5ffd0721115dbe20',
    'b73842a409de5f4f6ae9d72733ea1152', '79b1cd5d22e9f13587ab547e438e29ef', '1188b4341860779830fa7365b1442959', '3a41e0f797a707576ff9af9fb9fb6a81',
    '749e2ad503f5db79d69086a47c59edd0', 'ff256a4643515d29b61c1f210c06476d', '8b15247d9a422614898b8bbb54591025'])
  for (const v of original) assert.deepEqual(v.approval, { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'CONVRT owner (confirmed in chat)', approvedOn: '2026-11-19' }, `${v.id}: permission record untouched`)
  const ecommerce = ['ugc-hero-3', 'ugc-gal-1', 'ugc-gal-8', 'ugc-gal-3', 'ugc-gal-7'] // byte-identical to files in the Creator Showcase "E-commerce" folder
  for (const v of original) {
    if (ecommerce.includes(v.id)) assert.equal(v.industry, 'ecommerce', `${v.id}: classified by its folder`)
    else { assert.equal(v.industry, 'unclassified', `${v.id}: industry still unconfirmed`); assert.equal(categoryOf(v), null) }
  }
  assert.deepEqual(selectHero().map((v) => v.id), ['ugc-hero-1', 'ugc-hero-2', 'ugc-hero-3'], 'the UGC hero is still the three selected videos, in order')
})

// creator-01, 03, 07, 13, 14 and 18 were the SAME footage as six spokesperson videos (same Cloudflare duration, identical frames), so they were removed and
// now exist only as spokesperson entries (carrying the folder industry): the Showcase shows each video once.
const DUPLICATES_REMOVED = ['creator-01', 'creator-03', 'creator-07', 'creator-13', 'creator-14', 'creator-18']
test('Creator Showcase folder: 12 creator videos (6 of the original 18 are now spokesperson entries), classified by folder, uploaded once, with their own local thumbnails; nothing guessed', () => {
  const added = PORTFOLIO.filter((v) => /^creator-\d\d$/.test(v.id))
  assert.equal(added.length, 12)
  assert.deepEqual(added.map((v) => v.id).sort(), Array.from({ length: 18 }, (_, i) => `creator-${String(i + 1).padStart(2, '0')}`).filter((id) => !DUPLICATES_REMOVED.includes(id)))
  assert.deepEqual(added.reduce((m, v) => ({ ...m, [v.industry]: (m[v.industry] || 0) + 1 }), {}), { saas: 3, services: 6, ecommerce: 3 }, 'SaaS 3, Service 6, E-commerce 3 here; the six moved to the spokesperson entries keep their folder industry, so the tabs still hold SaaS 6, Services 8, E-commerce 9')
  const media = PORTFOLIO.map((v) => v.source.cloudflareId ?? v.source.mp4)
  assert.equal(new Set(media).size, media.length, 'no duplicate upload')
  for (const v of added) {
    // creator-05 is ON HOLD (third-party regulated-brand slate; display authorization not recorded): its data stays, but it is not displayable
    if (v.id === 'creator-05') { assert.equal(v.approval.status, 'on-hold'); assert.ok(!isDisplayable(v)); assert.ok(v.approval.holdReason) } else assert.ok(isDisplayable(v))
    assert.equal(v.type, 'ugc')
    assert.ok(/^[0-9a-f]{32}$/.test(v.source.cloudflareId), `${v.id}: Cloudflare id`)
    assert.equal(v.poster, `/portfolio/${v.id}.webp`)
    assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), `${v.id}: thumbnail file exists`)
    assert.equal(v.languages, undefined, `${v.id}: language not guessed`)
    assert.equal(v.brand, undefined, `${v.id}: no brand`)
    assert.equal(v.production, undefined, `${v.id}: production unknown`)
    assert.ok(v.title && v.title.length <= 60 && !/example \d+/i.test(v.title), `${v.id}: a descriptive title (SEO showcase-titles pass), not a numbered placeholder`)
  }
  const ours = selectOurWork()
  assert.equal(ours.length, 38, '39 approved videos minus creator-05, which is on hold pending display authorization: 23 UGC videos + the 7 spokesperson videos (six of which were also uploaded as creator-NN and are now listed once) + the 2 SaaS-folder clips added for the SaaS page + the 7 organic social videos')
  assert.deepEqual(availableCategories(ours).map((c) => c.id), ['all', 'ecommerce', 'saas', 'services', 'other', 'spokesperson'], 'Other has the seven organic videos (industry "other", confirmed by the owner); Spokesperson has seven')
  assert.deepEqual(['ecommerce', 'saas', 'services', 'other', 'spokesperson'].map((c) => countIn(ours, c)), [9, 8, 7, 7, 7])
  assert.equal(ours.filter((v) => categoryOf(v) === null).length, 7, 'the six still-unclassified UGC videos and the one unclassified spokesperson video are in no industry tab')
  assert.ok(selectGallery().length > 10 && selectGallery().slice(0, 10).length === 10, 'the UGC gallery still caps at 10')
})

test('regression: an unclassified video is in All Work only, never under Other or any industry tab, and shows no industry label', () => {
  const unknown = [sample({ id: 'u1', industry: 'unclassified' }), sample({ id: 'u2', industry: undefined }), sample({ id: 'u3', industry: 'unclassified' })]
  assert.deepEqual(availableCategories(unknown).map((c) => c.id), ['all'], 'no tab at all, and in particular no Other')
  assert.equal(categoryOf(unknown[0]), null)
  assert.equal(categoryOf(unknown[1]), null)
  assert.equal(filterByCategory(unknown, 'other').length, 0)
  assert.equal(filterByCategory(unknown, 'all').length, 3)
  // mixed: a confirmed 'other' gets the Other tab with only itself in it
  const mixed = [...unknown, sample({ id: 'c1', industry: 'other' }), sample({ id: 'c2', industry: 'saas' })]
  assert.deepEqual(availableCategories(mixed).map((c) => c.id), ['all', 'saas', 'other'])
  assert.deepEqual(filterByCategory(mixed, 'other').map((i) => i.id), ['c1'])
  assert.equal(countIn(mixed, 'all'), 5)
  assert.equal(countIn(mixed, 'other'), 1)
  assert.ok(isDisplayable(unknown[0]) && isDisplayable(unknown[1]), 'permissions alone make it public; the industry is optional')
  assert.equal(industryLabel('unclassified'), '')
  assert.equal(industryLabel(undefined), '')
  assert.equal(industryLabel('other'), 'Other')
  // rendering: All Work only, a card without an industry badge, no word "Unclassified" anywhere
  const html = renderToStaticMarkup(createElement(Library.default, { items: unknown }))
  assert.ok(!/Unclassified|>Other</i.test(html), 'never exposed')
  assert.equal((html.match(/aria-pressed=/g) || []).length, 1, 'only the All Work pill')
  assert.equal((html.match(/aria-label="Play video: /g) || []).length, 3)
  assert.ok(!/uppercase tracking-\[0\.08em\] text-ink backdrop-blur/.test(html), 'no industry badge on an unclassified card')
  // the facets of the UGC grid ignore unclassified videos too
  assert.deepEqual(buildFacets(unknown).category, [])
  assert.equal(matchesFilters(unknown[0], { category: 'other' }), false)
})

test('brand name and production credit appear only with the recorded permission', () => {
  const branded = sample({ brand: 'Acme', productionCredit: 'Edited by Jo' })
  assert.equal(brandLabel(branded), null)
  assert.equal(creditLabel(branded), null)
  const allowed = sample({ brand: 'Acme', productionCredit: 'Edited by Jo', approval: { ...APPROVED, brandDisplay: true, creditDisplay: true } })
  assert.equal(brandLabel(allowed), 'Acme')
  assert.equal(creditLabel(allowed), 'Edited by Jo')
  assert.ok(!renderToStaticMarkup(createElement(Library.default, { items: [branded] })).includes('Acme'))
  assert.ok(renderToStaticMarkup(createElement(Library.default, { items: [allowed] })).includes('Acme'))
  assert.ok(portfolioProblems(sample({ productionCredit: ' ' })).length)
})

// ── display order: the same creator never twice in a row ───────────────────────────────────────────
// Who appears in which video (best visual and file-name match, to be corrected by the owner). Videos of one creator share a letter.
const SAME_CREATOR = [
  ['ugc-gal-8', 'spokesperson-gal-3', 'creator-15', 'creator-16'], // spokesperson-gal-3 is the former creator-01
  ['ugc-hero-2', 'ugc-gal-2', 'creator-06', 'spokesperson-hero-3', 'spokesperson-gal-4'], // hero-3 = former creator-14; gal-4 looks like the same presenter
  ['ugc-gal-5', 'spokesperson-gal-2'], // former creator-18
  ['ugc-gal-1', 'ugc-hero-3', 'creator-04'],
  ['ugc-gal-3', 'creator-05'],
  ['ugc-hero-1', 'ugc-gal-7', 'spokesperson-hero-2', 'creator-11'], // hero-2 = former creator-03
  ['ugc-gal-4', 'ugc-gal-6', 'creator-02', 'spokesperson-gal-1', 'creator-08', 'creator-09', 'creator-10', 'creator-12', 'spokesperson-hero-1', 'creator-17'], // gal-1 = former creator-07, hero-1 = former creator-13
]
const creatorOf = (id) => SAME_CREATOR.findIndex((g) => g.includes(id))

test('order: no creator appears in two videos next to each other, in All Work or in any industry tab, or in the UGC gallery', () => {
  const ours = selectOurWork().filter((v) => v.type === 'ugc') // UGC-type showcase videos; service-page videos carry no creator grouping
  assert.ok(ours.every((v) => creatorOf(v.id) >= 0), 'every showcase video is assigned to a creator')
  const views = [['All Work', ours], ...['ecommerce', 'saas', 'services'].map((c) => [c, filterByCategory(ours, c)]), ['UGC gallery', selectGallery()]]
  for (const [name, list] of views) {
    for (let i = 1; i < list.length; i++) assert.notEqual(creatorOf(list[i].id), creatorOf(list[i - 1].id), `${name}: ${list[i - 1].id} and ${list[i].id} are the same creator and adjacent`)
  }
  assert.deepEqual(selectHero().map((v) => v.id), ['ugc-hero-1', 'ugc-hero-2', 'ugc-hero-3'], 'the UGC hero keeps its order')
})

test('UGC hero "Explore Videos" is a plain link to the Creator Showcase (it no longer scrolls to the page gallery)', () => {
  const src = read('src/components/ugc/UgcHero.jsx')
  assert.ok(!/scrollToElement|getElementById\('ugc-videos'\)|preventDefault/.test(src), 'no in-page scroll handler')
  assert.match(rootOf(page(PATHS.ugcVideoAgency)), /<a href="\/creator-showcase"[^>]*>\s*Explore Videos/)
})

// ── no duplicates, and the Spokesperson filter ───────────────────────────────────────────────────
test('no duplicates: every video in the Showcase is listed once (id, Cloudflare id, mp4, poster, title) and the six former duplicates are gone', () => {
  const list = selectOurWork()
  for (const key of [(v) => v.id, (v) => v.source.cloudflareId ?? v.source.mp4, (v) => v.poster, (v) => v.title ?? v.caption]) {
    const vals = list.map(key).filter(Boolean)
    assert.equal(new Set(vals).size, vals.length)
  }
  for (const id of DUPLICATES_REMOVED) assert.ok(!PORTFOLIO.some((v) => v.id === id) && !fs.existsSync(path.join(ROOT, 'public', 'portfolio', `${id}.webp`)), `${id} is gone`)
  const html = rootOf(page(PATH))
  const shown = html.match(/aria-label="Play video: [^"]*"/g) || []
  assert.equal(new Set(shown).size, shown.length, 'no two cards in the HTML share a label')
  assert.equal(PORTFOLIO.filter((v) => v.type === 'spokesperson').length, 7)
})

test('Spokesperson filter: a type filter after the four industry filters; it holds every spokesperson video (whatever its industry) and nothing else, and has no tab without one', () => {
  const items = [
    sample({ id: 'u-saas', industry: 'saas' }),
    sample({ id: 's-saas', industry: 'saas', type: 'spokesperson' }),
    sample({ id: 's-unknown', industry: 'unclassified', type: 'spokesperson' }),
    sample({ id: 'u-unknown', industry: 'unclassified' }),
  ]
  assert.deepEqual(availableCategories(items).map((c) => c.id), ['all', 'saas', 'spokesperson'])
  assert.deepEqual(filterByCategory(items, 'spokesperson').map((i) => i.id), ['s-saas', 's-unknown'])
  assert.deepEqual(filterByCategory(items, 'saas').map((i) => i.id), ['u-saas', 's-saas'], 'a classified spokesperson video is in its industry tab as well')
  assert.equal(countIn(items, 'spokesperson'), 2)
  assert.deepEqual(availableCategories([items[0], items[3]]).map((c) => c.id), ['all', 'saas'], 'no Spokesperson tab without a spokesperson video')
  assert.equal(inCategory(sample({ type: undefined }), 'spokesperson'), false)
  // the shipped page: a Spokesperson pill with seven videos, after the industry pills
  const html = rootOf(page(PATH))
  const pills = [...html.matchAll(/aria-pressed="(?:true|false)"[^>]*>[\s\S]*?<\/svg>([A-Za-z -]+)<span[^>]*>(\d+)<\/span>/g)].map((m) => [m[1].trim(), Number(m[2])])
  assert.deepEqual(pills, [['All Work', 38], ['E-commerce', 9], ['SaaS', 8], ['Services', 7], ['Other', 7], ['Spokesperson', 7]])
  assert.match(html, /aria-label="Filter videos by industry or type"/)
  const lib = renderToStaticMarkup(createElement(Library.default, { items: selectOurWork() }))
  assert.ok(lib.includes('Spokesperson'))
  assert.ok(/Other<span/.test(lib), 'Other has a tab now that the seven organic videos (industry "other") exist; it would vanish again with none')
})

// ── descriptive titles (SEO/GEO showcase-titles pass, 2026-11-21): evidence-based, short, unique, no invented names ───────────────────────────
test('showcase titles: every video has a short, unique, descriptive title and a matching caption; no placeholder, brand, creator name or testimonial wording', () => {
  const list = selectOurWork()
  assert.equal(list.length, 38, '39 titled videos; creator-05 is on hold and not displayed')
  const held = PORTFOLIO.find((v) => v.id === 'creator-05')
  assert.ok(held && held.title && !isDisplayable(held) && held.approval.status === 'on-hold', 'the held video keeps its data and title but is not shown')
  assert.ok(/TO VERIFY/.test(fs.readFileSync(path.join(ROOT, 'src/content/portfolio.js'), 'utf8')) && PORTFOLIO.find((v) => v.id === 'ugc-gal-5').languages[0] === 'en', 'ugc-gal-5 spoken language is flagged for verification, data unchanged')
  const titles = list.map((v) => v.title)
  assert.equal(new Set(titles).size, titles.length, 'unique titles')
  for (const v of list) {
    assert.ok(v.title.length >= 15 && v.title.length <= 60, `${v.id}: title length ${v.title.length}`)
    assert.ok(!/\b(example|sample|placeholder|video \d)\b ?\d*$/i.test(v.title), `${v.id}: no numbered placeholder`)
    assert.equal(v.caption, `${v.title}.`, `${v.id}: the caption restates the title (it is the accessible label on the UGC pages)`)
    assert.ok(!/testimonial|review(s|er)?\b|customer story|real customer|genuine/i.test(v.title), `${v.id}: scripted creator videos are never described as customer testimonials`)
  }
  // brand names that are visible inside the footage are NOT used: a brand appears next to a video only with the brand's recorded permission (approval.brandDisplay)
  const BRANDS_SEEN_IN_FOOTAGE = /move ?pl(a)?nn?r|tip ?green|cologuard|exact sciences|harroman|green chef|pdf expert|lusion|think in the dark|form\b/i
  for (const v of list) assert.ok(!BRANDS_SEEN_IN_FOOTAGE.test(v.title), `${v.id}: no unapproved brand name in the title`)
  // no creator first name taken from a file name (Aoife, Luis) and no unverified language in a title: the language badge is data-driven
  for (const v of list) assert.ok(!/\b(aoife|luis)\b/i.test(v.title) && !/\b(spanish|french|arabic|english)\b/i.test(v.title), `${v.id}: no creator name or language asserted in the title`)
  // the data fields that drive filters and badges are untouched by the titles pass
  assert.deepEqual(['ecommerce', 'saas', 'services', 'other', 'spokesperson'].map((c) => countIn(list, c)), [9, 8, 7, 7, 7])
  assert.ok(list.every((v) => v.approval.status === 'approved' && v.approval.portfolioUse === true && v.approval.creatorConsent === true))
  assert.ok(list.every((v) => v.production === undefined && v.brand === undefined), 'no production credit or brand was added')
})
