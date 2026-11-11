// Run with: node --test tests/seo.test.mjs
// SEO phase 1: robots.txt, sitemap.xml and the static head in index.html.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITEMAP_ENTRIES, sitemapPaths, buildSitemap } from '../src/lib/seo/sitemap.js'
import {
  SITE_URL, OFFER_PATHS, REFERRALS_PATH,
  ROADMAP_INDEXABLE, FREE_HOOKS_INDEXABLE, RISK_FREE_INDEXABLE, REFERRALS_INDEXABLE,
} from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

test('sitemap: lists the always-indexable pages, absolute https URLs on www', () => {
  const xml = buildSitemap()
  for (const p of ['/', '/pricing', '/case-studies/graspo', '/case-studies/elyon']) {
    assert.ok(xml.includes(`<loc>${SITE_URL}${p}</loc>`), `missing ${p}`)
  }
  assert.ok(xml.startsWith('<?xml'))
  assert.ok(!/lastmod/.test(xml), 'no invented lastmod dates')
})

test('sitemap: never lists a noindex page or the duplicate /case-studies', () => {
  const paths = sitemapPaths()
  const gated = [
    [OFFER_PATHS.roadmap, ROADMAP_INDEXABLE],
    [OFFER_PATHS.hooks, FREE_HOOKS_INDEXABLE],
    [OFFER_PATHS.riskFree, RISK_FREE_INDEXABLE],
    [REFERRALS_PATH, REFERRALS_INDEXABLE],
  ]
  for (const [p, on] of gated) assert.equal(paths.includes(p), on, `${p} must follow its *_INDEXABLE flag`)
  assert.ok(!paths.includes('/scale'), '/scale is noindex')
  assert.ok(!paths.includes('/blog') && !paths.some((p) => p.startsWith('/blog/')), 'blog lives in sitemap-blog.xml')
  assert.ok(!paths.includes('/case-studies'), '/case-studies duplicates /case-studies/graspo')
})

test('sitemap: a flag flipped to true adds its page', () => {
  const entries = SITEMAP_ENTRIES.map((e) => (e.path === OFFER_PATHS.hooks ? { ...e, indexable: true } : e))
  assert.ok(sitemapPaths(entries).includes(OFFER_PATHS.hooks))
})

test('robots.txt: allows crawling (so noindex is visible), blocks only /api/, lists both sitemaps', () => {
  const txt = read('public/robots.txt')
  assert.match(txt, /^User-agent: \*$/m)
  assert.match(txt, /^Allow: \/$/m)
  const disallows = [...txt.matchAll(/^Disallow:\s*(.*)$/gm)].map((m) => m[1].trim())
  assert.deepEqual(disallows, ['/api/'])
  assert.match(txt, new RegExp(`^Sitemap: ${SITE_URL}/sitemap\\.xml$`, 'm'))
  assert.match(txt, new RegExp(`^Sitemap: ${SITE_URL}/sitemap-blog\\.xml$`, 'm'))
})

test('index.html: no static canonical / og:url / robots (the shell is served for every route)', () => {
  const html = read('index.html')
  // The homepage canonical is injected by the inline script, guarded to pathname "/".
  assert.ok(!/<link[^>]+rel="canonical"/i.test(html), 'static canonical would point every route at the homepage')
  assert.ok(!/property="og:url"/.test(html), 'static og:url would be wrong on every other route')
  assert.ok(!/name="robots"/.test(html), 'static robots would apply to every route')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  assert.match(script, /location\.pathname === '\/'/)
  assert.match(script, /rel = 'canonical'/)
  assert.match(script, new RegExp(`href = '${SITE_URL}/'`))
})

test('index.html: route-agnostic social defaults present', () => {
  const html = read('index.html')
  assert.match(html, /property="og:type" content="website"/)
  assert.match(html, /property="og:site_name" content="CONVRT"/)
  assert.match(html, /name="twitter:card" content="summary"/)
})

// ── SEO phase 2: the manifest is the single source of truth ─────────────────────────────
import { SITE_SEO, pageHead, canonicalPathFor, urlFor, sitemapRoutes } from '../src/seo/siteSeo.js'

test('manifest: "/" copy matches the static <head> in index.html (no drift)', () => {
  const html = read('index.html')
  assert.ok(html.includes(`<title>${SITE_SEO['/'].title}</title>`))
  assert.ok(html.replace(/\s+/g, ' ').includes(`content="${SITE_SEO['/'].description}"`))
})

test('manifest: Referrals keeps its own in-page head code (its tests pin that file) — copy must match the manifest', () => {
  const page = read('src/ReferralsPage.jsx')
  assert.ok(page.includes(`'${SITE_SEO[REFERRALS_PATH].title}'`), 'title drifted')
  assert.ok(page.includes(`'${SITE_SEO[REFERRALS_PATH].description}'`), 'description drifted')
  assert.match(page, /noindex: !REFERRALS_INDEXABLE/)
})

test('manifest: every page with a head has a unique title and description, absolute canonical on www', () => {
  const titles = new Set(), descs = new Set()
  for (const [path, e] of Object.entries(SITE_SEO)) {
    if (e.canonicalPath) continue
    assert.ok(e.title && e.description, path)
    assert.ok(!titles.has(e.title) && !descs.has(e.description), `duplicate title/description on ${path}`)
    titles.add(e.title); descs.add(e.description)
    assert.match(urlFor(path), /^https:\/\/www\.convrt\.studio(\/|\/[a-z0-9\-/]+)$/)
  }
})

test('manifest: every distinct case study has its OWN canonical; the duplicate points at the default', () => {
  assert.equal(canonicalPathFor('/case-studies/graspo'), '/case-studies/graspo')
  assert.equal(canonicalPathFor('/case-studies/elyon'), '/case-studies/elyon')
  assert.equal(canonicalPathFor('/case-studies'), '/case-studies/graspo')
  assert.equal(pageHead('/case-studies/graspo').url, `${SITE_URL}/case-studies/graspo`)
  assert.equal(pageHead('/case-studies/elyon').url, `${SITE_URL}/case-studies/elyon`)
})

test('manifest: noindex is preserved — flagged pages follow their flag, /scale stays "noindex, follow"', () => {
  assert.equal(pageHead('/scale').robots, 'noindex, follow')
  assert.equal(pageHead(OFFER_PATHS.roadmap).noindex, !ROADMAP_INDEXABLE)
  assert.equal(pageHead(OFFER_PATHS.hooks).noindex, !FREE_HOOKS_INDEXABLE)
  assert.equal(pageHead(OFFER_PATHS.riskFree).noindex, !RISK_FREE_INDEXABLE)
  assert.equal(SITE_SEO[REFERRALS_PATH].indexable, REFERRALS_INDEXABLE)
  assert.equal(pageHead('/pricing').noindex, false)
  // And the sitemap can never contradict it.
  for (const p of sitemapRoutes()) assert.ok(SITE_SEO[p].indexable && !SITE_SEO[p].robots, p)
})

test('manifest: case-study social copy is kept separate from the search title', () => {
  assert.match(pageHead('/case-studies/graspo').ogTitle, /^Graspo × CONVRT/)
  assert.match(pageHead('/case-studies/elyon').ogTitle, /^Elyon Dubai × CONVRT/)
})

test('pages use the shared head: no page re-implements title/meta handling', () => {
  for (const f of ['CreativeTestingSprintPage', 'GraspoCaseStudyPage', 'ElyonCaseStudyPage', 'ScalePage', 'RoadmapPage', 'FreeHooksPage', 'RiskFreePage']) {
    const src = read(`src/${f}.jsx`)
    assert.match(src, /useDocumentHead\(pageHead\(/, f)
    assert.ok(!/document\.title\s*=/.test(src), `${f} still sets document.title itself`)
  }
})
