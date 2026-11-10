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
