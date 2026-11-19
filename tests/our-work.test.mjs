// Run with: node --test tests/our-work.test.mjs
// /our-work (the Creator Showcase: examples from independent creators) and the shared portfolio data (src/content/portfolio.js) that also feeds /ugc-video-agency and the homepage.
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
import { SITE_URL, OUR_WORK_PATH } from '../src/config.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { ourWorkGraph, videoObjectNode, jsonLdFor, BREADCRUMB_TRAILS } from '../src/seo/structuredData.js'
import {
  PORTFOLIO, portfolioProblems, isDisplayable, isShowcaseable, selectOurWork, selectHero, selectGallery, selectShowcase, selectDisplayable,
  availableCategories, categoryOf, countIn, filterByCategory, CATEGORIES, ALL_CATEGORY, titleOf, typeLabel, posterUrl,
  isClassified, industryLabel, productionLabel, brandLabel, creditLabel, buildFacets, matchesFilters,
} from '../src/content/portfolio.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const PATH = PATHS.ourWork
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
test('route: /our-work is a public path, and OUR_WORK_PATH (used by every link to it) is that path', () => {
  assert.equal(PATH, '/our-work')
  assert.equal(OUR_WORK_PATH, '/our-work')
  assert.ok(KNOWN_PATHS.includes('/our-work'))
  assert.ok(fs.existsSync(path.join(dist, 'our-work', 'index.html')), 'a real static file is written for the route')
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
  assert.ok(t.includes('Featuring examples from independent creators. Not all videos were produced by CONVRT.'), 'the transparency note')
  assert.ok(t.indexOf('Explore real creator videos') < t.indexOf('Featuring examples from independent creators'), 'the note sits beneath the description')
  assert.equal((html.match(/<section[\s>]/g) || []).length, 2, 'only two principal sections: the hero and the library')
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
  assert.ok(selectDisplayable(PORTFOLIO).every((i) => !/adscale|elyon|graspo/i.test(JSON.stringify(i))), 'the client case-study clips are not portfolio material, so they never reach /our-work')
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
  // one new entry reaches /our-work and the UGC gallery with no other change
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

test('data: validation rejects bad entries; language is optional only for videos not approved for the portfolio', () => {
  assert.deepEqual(portfolioProblems(sample()), [])
  assert.ok(portfolioProblems(sample({ id: 'Bad Id' })).length)
  assert.ok(portfolioProblems(sample({ type: 'Bad Type' })).length)
  assert.ok(portfolioProblems(sample({ uploadDate: '3 Feb 2026' })).length)
  assert.ok(portfolioProblems(sample({ languages: undefined })).length, 'portfolio videos need a language')
  assert.deepEqual(portfolioProblems(sample({ languages: undefined, approval: { status: 'approved', portfolioUse: false, creatorConsent: false } })), [])
  assert.equal(titleOf(sample({ title: undefined })), 'A sample caption.', 'title falls back to the caption')
  assert.equal(typeLabel(sample({ type: 'spokesperson' })), 'Spokesperson')
  assert.equal(typeLabel(sample({ type: undefined })), '', 'an unset type is unknown, not UGC')
  assert.equal(posterUrl(sample({ source: { cloudflareId: 'zz' }, poster: undefined })).includes('videodelivery.net/zz/thumbnails'), true)
})

// ── categories ──────────────────────────────────────────────────────────────────────────
test('categories: All Work + E-commerce, SaaS, Services, Other with the proposed colours; a category with no videos has no tab', () => {
  assert.deepEqual([ALL_CATEGORY, ...CATEGORIES].map((c) => c.label), ['All Work', 'E-commerce', 'SaaS', 'Services', 'Other'])
  assert.deepEqual([ALL_CATEGORY, ...CATEGORIES].map((c) => c.color), ['#d5ff40', '#ec4899', '#9a7aff', '#34c9c0', '#ffb547'])
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
  assert.match(html, /role="group" aria-label="Filter videos by industry"/)
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
test('links: nav, footer, homepage CTA and the UGC page all lead to /our-work, once each, without duplicates', () => {
  const home = rootOf(page('/'))
  assert.equal((home.match(/href="\/our-work"/g) || []).length, 3, 'desktop nav (the mobile menu is closed), footer and the hero button')
  assert.match(home, /<a href="\/our-work"[^>]*>\s*Explore Videos/, 'the homepage "Explore Videos" button')
  assert.equal((home.match(/>Creator Showcase</g) || []).length, 2, 'one nav link and one footer link')
  assert.ok(!/>(See Our Work|Our Work)</.test(home), 'no "Our Work" label is left on the homepage')
  assert.ok(!/href="#showcase"/.test(home), 'the old in-page anchor is gone (the section itself stays on the page)')
  assert.ok(home.includes('id="showcase"'))
  const ugc = rootOf(page(PATHS.ugcVideoAgency))
  assert.match(ugc, /<a href="\/our-work"[^>]*>\s*Explore Videos/, 'UGC hero button')
  assert.match(ugc, /<a href="\/our-work"[^>]*>\s*Explore UGC Videos/, 'the button under the UGC gallery')
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

// ── Creator Showcase positioning: independent creators, not CONVRT productions ──────────────────────
const CLAIMS = /our productions?|client projects?|videos we (created|made|produced)|our campaign results?|CONVRT[- ]produced (ads|advertisements|videos)|produced by CONVRT for|our work\b/i

test('regression: the page and its metadata never present the creator videos as CONVRT productions', () => {
  const html = page(PATH)
  const e = SITE_SEO[PATH]
  const visible = textOf(html).replace('Not all videos were produced by CONVRT.', '')
  assert.ok(!CLAIMS.test(visible), `visible copy: ${visible.match(CLAIMS)?.[0]}`)
  assert.ok(!CLAIMS.test(`${e.title} ${e.description} ${e.ogTitle} ${e.ogDescription}`), 'SEO title and descriptions')
  assert.ok(!CLAIMS.test(JSON.stringify(pageHead(PATH).jsonLd)), 'structured data')
  assert.ok(/independent creators/.test(e.description) && /independent creators/.test(textOf(html)))
  for (const v of selectOurWork()) assert.ok(!CLAIMS.test(`${titleOf(v)} ${v.caption}`), `${v.id}: caption`)
  for (const f of ['VideoCard', 'VideoLightbox', 'PortfolioLibrary', 'OurWorkHero']) assert.ok(!CLAIMS.test(read(`src/components/ourwork/${f}.jsx`).replace(/Not all videos were produced by CONVRT\./, '')), `${f}: copy`)
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

test('regression: the nine homepage client videos stay homepage-only: not in /our-work, the UGC page or the sitemap data, permissions untouched', () => {
  const clients = PORTFOLIO.filter((v) => v.showcase)
  assert.equal(clients.length, 9)
  assert.deepEqual([...new Set(clients.map((v) => v.showcase))].sort(), ['adscale', 'elyon', 'graspo'])
  for (const v of clients) {
    assert.equal(v.approval.portfolioUse, false, `${v.id}: portfolioUse stays false`)
    assert.equal(v.approval.creatorConsent, false, `${v.id}: creatorConsent stays false`)
    assert.ok(!selectOurWork().includes(v) && !selectGallery().includes(v) && !selectHero().includes(v), `${v.id} is not on /our-work or the UGC page`)
  }
  const our = rootOf(page(PATH))
  for (const v of clients) assert.ok(!our.includes(v.source.cloudflareId ?? v.source.mp4), `${v.id} is not in the /our-work HTML`)
  assert.ok(!/adscale|elyon|graspo/i.test(our.replace(/<script[\s\S]*?<\/script>/g, '')), 'no client name on /our-work')
  const home = rootOf(page('/'))
  assert.ok(home.includes('id="showcase"') && home.includes('/showcase/adscale-creator-poster.webp'), 'the homepage client showcase is intact')
})

test('regression: the 11 existing portfolio entries are intact (ids, media, permissions) but their industry is unconfirmed, not "Other"', () => {
  const ids = ['ugc-hero-1', 'ugc-hero-2', 'ugc-hero-3', 'ugc-gal-1', 'ugc-gal-8', 'ugc-gal-4', 'ugc-gal-3', 'ugc-gal-5', 'ugc-gal-7', 'ugc-gal-2', 'ugc-gal-6']
  assert.deepEqual(PORTFOLIO.filter((v) => !v.showcase).map((v) => v.id), ids)
  assert.deepEqual(PORTFOLIO.filter((v) => !v.showcase).map((v) => v.source.cloudflareId), [
    '33a4063ee0e8dafe3379f0a97817036e', '63446474698139b4ac17c1f053212242', '1fc1374cdfe428d10bfc40ad4eff9693', 'c8914f7a0db3ac9f5ffd0721115dbe20',
    'b73842a409de5f4f6ae9d72733ea1152', '79b1cd5d22e9f13587ab547e438e29ef', '1188b4341860779830fa7365b1442959', '3a41e0f797a707576ff9af9fb9fb6a81',
    '749e2ad503f5db79d69086a47c59edd0', 'ff256a4643515d29b61c1f210c06476d', '8b15247d9a422614898b8bbb54591025'])
  for (const v of PORTFOLIO.filter((x) => !x.showcase)) {
    assert.deepEqual(v.approval, { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'CONVRT owner (confirmed in chat)', approvedOn: '2026-11-19' }, `${v.id}: permission record untouched`)
    assert.equal(v.industry, 'unclassified', `${v.id}: industry is unconfirmed`)
    assert.ok(!isClassified(v) && categoryOf(v) === null)
  }
  assert.equal(selectOurWork().length, 11)
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

test('Creator Showcase naming: nav, footer and homepage button use the approved labels while the route stays /our-work', () => {
  const nav = read('src/components/Nav.jsx')
  assert.match(nav, /label: 'Creator Showcase', href: OUR_WORK_PATH/)
  assert.match(read('src/components/Footer.jsx'), />Creator Showcase<\/a>/)
  assert.match(read('src/components/Hero.jsx'), /Explore Videos/)
  assert.equal(OUR_WORK_PATH, '/our-work')
  assert.ok(!KNOWN_PATHS.includes('/creator-showcase'), 'no second route')
  assert.ok(!fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8').includes('creator-showcase'), 'no redirect')
  assert.equal(BREADCRUMB_TRAILS[PATH][1].name, 'Creator Showcase')
})
