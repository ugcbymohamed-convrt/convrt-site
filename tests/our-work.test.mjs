// Run with: node --test tests/our-work.test.mjs
// /our-work (the video portfolio) and the shared portfolio data (src/content/portfolio.js) that also feeds /ugc-video-agency and the homepage.
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
} from '../src/content/portfolio.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const PATH = PATHS.ourWork
const URL_ = `${SITE_URL}${PATH}`

const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
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
  assert.equal(e.title, 'Our Work | UGC Ads & Video Production Portfolio | CONVRT')
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
  assert.ok(head.includes('<title>Our Work | UGC Ads &amp; Video Production Portfolio | CONVRT</title>'))
  assert.ok(head.includes(`<link rel="canonical" href="${URL_}" />`))
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.equal(/name="robots"/.test(head), !e.indexable)
  assert.equal(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${URL_}</loc>`), e.indexable)
})

// ── prerendered HTML: useful without JavaScript ──────────────────────────────────────────
test('static HTML: breadcrumb, one H1, the approved intro, two sections, the first page of cards, no stream and no video element', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.match(html, /<nav aria-label="Breadcrumb"[\s\S]*?Home[\s\S]*?Our Work/)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  assert.ok(t.includes('Creative that speaks for itself.'))
  assert.ok(t.includes('Explore human-led UGC ads, spokesperson videos and performance creatives produced by CONVRT.'))
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
  assert.deepEqual(crumb.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'Our Work', URL_]])
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
  assert.equal(typeLabel(sample({ type: undefined })), 'UGC', 'legacy entries are UGC')
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
    sample({ id: 'x', title: 'Skincare routine', industry: 'ecommerce', languages: ['en', 'es'], brand: 'Acme', creator: { displayName: 'Ana', showName: false }, creatorId: 'c-secret-42' }),
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
  assert.match(home, /<a href="\/our-work"[^>]*>\s*See Our Work/, 'the homepage "See Our Work" button')
  assert.equal((home.match(/>Our Work</g) || []).length, 2, 'one nav link and one footer link')
  assert.ok(!/href="#showcase"/.test(home), 'the old in-page anchor is gone (the section itself stays on the page)')
  assert.ok(home.includes('id="showcase"'))
  const ugc = rootOf(page(PATHS.ugcVideoAgency))
  assert.match(ugc, /<a href="\/our-work"[^>]*>\s*See Our Work/, 'UGC hero button')
  assert.match(ugc, /<a href="\/our-work"[^>]*>\s*See all UGC videos/, 'the button under the UGC gallery')
  assert.ok(!/href="\/case-studies"[^>]*>\s*See (all UGC videos|Our Work)/.test(ugc))
  const our = rootOf(page(PATH))
  assert.equal((our.match(/>Our Work</g) || []).length, 3, 'nav, breadcrumb and footer')
  assert.ok(home.includes('/creative-growth-roadmap') && ugc.includes('/creative-growth-roadmap'), 'the conversion paths are untouched')
})

test('docs: the data file header documents the one-file workflow and the new fields', () => {
  const header = read('src/content/portfolio.js').slice(0, 5500)
  for (const k of ['title', 'type', 'industry', 'languages', 'source', 'poster', 'creatorId', 'brand', 'placement', 'showcase', 'uploadDate', 'approval']) assert.ok(header.includes(k), `documents ${k}`)
  assert.ok(/ONE file/.test(header) && /selectOurWork/.test(header) && /selectGallery/.test(header) && /selectShowcase/.test(header))
})
