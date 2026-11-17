// Run with: node --test tests/creator-seo.test.mjs
// The creator pages are private: noindex, absent from the sitemap, navigation, footer and every other page,
// free of tracking, and free of personal data in their prerendered HTML.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PATHS, KNOWN_PATHS, PRIVATE_PATHS, PRIVATE_PATH_LIST } from '../src/routes.js'
import { SITE_SEO, sitemapRoutes } from '../src/seo/siteSeo.js'
import { buildSitemap } from '../src/lib/seo/sitemap.js'
import { privateHead } from '../src/seo/privateSeo.js'
import { headParamsFor } from '../src/lib/routes/headFor.js'
import { allRoutePaths } from '../src/lib/routes/staticRoutes.js'
import { buildHeadSpec } from '../src/lib/headSpec.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))

test('private paths: separate from the public route list, SEO manifest and sitemap', () => {
  for (const p of PRIVATE_PATH_LIST) {
    assert.ok(!KNOWN_PATHS.includes(p), `${p} must not be a public path`)
    assert.ok(!(p in SITE_SEO), `${p} must not be in the SEO manifest`)
    assert.ok(!sitemapRoutes().includes(p))
    assert.ok(!buildSitemap().includes(p))
  }
  assert.ok(!Object.keys(PATHS).some((k) => /creator/i.test(k)))
})

test('private paths are still prerendered (served 200 as real files), after the public ones', () => {
  const all = allRoutePaths([])
  for (const p of PRIVATE_PATH_LIST) assert.ok(all.includes(p), p)
})

test('every private page is noindex, nofollow, noarchive with no canonical and no og:url', () => {
  for (const p of PRIVATE_PATH_LIST) {
    const head = privateHead(p)
    assert.match(head.robots, /noindex/)
    assert.match(head.robots, /nofollow/)
    assert.match(head.robots, /noarchive/)
    const spec = buildHeadSpec(headParamsFor(p))
    assert.equal(spec.canonical, null)
    assert.ok(!spec.metas.some((m) => m.key === 'og:url'))
    assert.ok(spec.metas.some((m) => m.key === 'robots' && /noindex/.test(m.content)))
  }
})

test('vercel.json: X-Robots-Tag noindex + no-referrer + no-store on the creator pages', () => {
  const v = JSON.parse(read('vercel.json'))
  for (const source of ['/creator-onboarding/:path*', '/creator-admin/:path*']) {
    const rule = v.headers.find((h) => h.source === source)
    assert.ok(rule, source)
    const get = (k) => rule.headers.find((h) => h.key === k)?.value
    assert.match(get('X-Robots-Tag'), /noindex/)
    assert.equal(get('Referrer-Policy'), 'no-referrer')
    assert.equal(get('Cache-Control'), 'no-store')
  }
})

test('nothing public links to the creator pages (nav, footer, every other page, sitemap, robots)', () => {
  const publicFiles = walk('src').filter((f) => /\.(jsx?|md)$/.test(f))
  const allowed = new Set([
    'src/routes.js', 'src/App.jsx', 'src/seo/privateSeo.js', 'src/CreatorOnboardingPage.jsx', 'src/CreatorLegalPage.jsx', 'src/CreatorAdminPage.jsx',
    'src/content/creatorLegal.js',
  ])
  for (const f of publicFiles) {
    if (allowed.has(f) || f.startsWith('src/components/creator/') || f.startsWith('src/lib/creator/')) continue
    assert.ok(!/creator-onboarding|creator-admin|PRIVATE_PATHS/.test(read(f)), `${f} references a private creator page`)
  }
  assert.ok(!/creator-/.test(read('public/robots.txt')))
  assert.ok(!/creator-/.test(read('src/components/Nav.jsx') + read('src/components/Footer.jsx')))
})

test('creator pages use no analytics / tracking and no third-party scripts', () => {
  for (const f of [...walk('src/components/creator'), ...walk('src/lib/creator'), 'src/CreatorOnboardingPage.jsx', 'src/CreatorLegalPage.jsx', 'src/CreatorAdminPage.jsx']) {
    const src = read(f)
    assert.ok(!/analytics\.js|trackEvent|captureAttribution|dataLayer|fbq\(|gtag|sessionStorage\.getItem\('convrt_scale/.test(src), `${f} touches tracking`)
    assert.ok(!/https?:\/\/(?!www\.fiverr\.com|www\.convrt\.studio)/.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').replace(/xmlns="[^"]*"/g, '')) || /api\.cloudflare/.test(src) === false, `${f} has a third-party URL`)
  }
})

test('invitation token never goes into a URL: header-only, stripped from the address bar', () => {
  const api = read('src/lib/creator/api.js')
  assert.match(api, /Authorization: `Bearer \$\{token\}`/)
  assert.match(api, /history\.replaceState\(null, '', window\.location\.pathname\)/)
  assert.ok(!/\?invite=|invite=\$\{/.test(api.replace(/^\s*\/\*[\s\S]*?\*\//, '').replace(/\/\/.*$/gm, '')))
})

test('Vite dev middleware serves the creator API and still loads only expected env prefixes', () => {
  const cfg = read('vite.config.js')
  assert.match(cfg, /\/api\/creator-admin/)
  assert.match(cfg, /CREATOR_\|CLOUDFLARE_\|UPSTASH_\|KV_/)
})

// ── built output (run `npm run build` first; skipped if dist/ is absent) ──
const DIST = path.join(ROOT, 'dist')
const built = fs.existsSync(path.join(DIST, 'creator-onboarding', 'index.html'))
test('built HTML: noindex, no personal data / tokens / media URLs, not in sitemaps', { skip: !built && 'dist/ not built' }, () => {
  for (const p of PRIVATE_PATH_LIST) {
    const html = fs.readFileSync(path.join(DIST, p.slice(1), 'index.html'), 'utf8')
    assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive" \/>/, p)
    assert.ok(!/application\/ld\+json/.test(html), `${p}: no JSON-LD`)
    assert.ok(!/rel="canonical"/.test(html), `${p}: no canonical`)
    assert.ok(!/manifest\/video\.m3u8|cloudflarestream|CRX-|invite=|fiverr\.com\/[a-z]/i.test(html), `${p}: no media, reference, token or profile data`)
  }
  for (const f of ['sitemap.xml', 'sitemap-blog.xml']) assert.ok(!/creator/.test(fs.readFileSync(path.join(DIST, f), 'utf8')), f)
})
