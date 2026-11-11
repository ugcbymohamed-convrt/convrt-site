// Run with: node --test tests/routes.test.mjs
// SEO phase 3: unknown URLs get a real HTTP 404, known URLs keep working.
//
// Two layers:
//  1. Pure checks: route list vs App.jsx, helpers, vercel.json shape.
//  2. A real production build into a temp dir, served by a small HTTP server that resolves requests
//     the way Vercel does (redirects → /api functions → files and directory indexes → rewrites →
//     404.html with status 404). Real sockets, real status codes. It is a MODEL of Vercel, so the
//     deployed Preview is still checked separately (see the phase 3 report).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { PATHS, KNOWN_PATHS, normalizePath } from '../src/routes.js'
import { routeFile, allRoutePaths, notFoundHtml } from '../src/lib/routes/staticRoutes.js'
import { selectPublished } from '../src/lib/blog/schema.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const VERCEL = JSON.parse(read('vercel.json'))

// ── pure checks ────────────────────────────────────────────────────────────────────────
test('routes: every PATHS entry is routed in App.jsx (home and blog articles are handled separately)', () => {
  const app = read('src/App.jsx')
  const used = new Set([...app.matchAll(/\[PATHS\.(\w+)\]/g)].map((m) => m[1]))
  // The referral test-suite pins the literal `[REFERRALS_PATH]: ReferralsPage`, so that one route uses the config constant.
  if (/\[REFERRALS_PATH\]: ReferralsPage/.test(app)) used.add('referrals')
  for (const k of used) assert.ok(k in PATHS, `App.jsx routes PATHS.${k}, which is not in src/routes.js`)
  for (const k of Object.keys(PATHS)) {
    if (k === 'home') continue
    assert.ok(used.has(k), `PATHS.${k} (${PATHS[k]}) is not routed in App.jsx`)
  }
  assert.match(app, /path === PATHS\.home \? <HomePage \/>/, 'only "/" may render the homepage')
  assert.match(app, /<NotFoundPage \/>/, 'unknown paths must render NotFoundPage')
})

test('routes: paths are unique, absolute, lowercase, no trailing slash (except "/")', () => {
  assert.equal(new Set(KNOWN_PATHS).size, KNOWN_PATHS.length)
  for (const p of KNOWN_PATHS) assert.match(p, /^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/, p)
  assert.equal(normalizePath('/pricing/'), '/pricing')
  assert.equal(normalizePath('/'), '/')
})

test('routes: every page in the sitemap manifest is a known route', async () => {
  const { SITE_SEO } = await import('../src/seo/siteSeo.js')
  for (const p of Object.keys(SITE_SEO)) assert.ok(KNOWN_PATHS.includes(p), `${p} has SEO metadata but is not routed`)
})

test('routes: file layout and blog slugs', () => {
  assert.equal(routeFile('/'), 'index.html')
  assert.equal(routeFile('/pricing'), 'pricing/index.html')
  assert.equal(routeFile('/case-studies/elyon'), 'case-studies/elyon/index.html')
  const paths = allRoutePaths(['my-article'])
  assert.ok(paths.includes('/blog/my-article') && paths.includes('/blog') && paths.includes('/'))
})

test('blog: only PUBLISHED articles get a route (drafts and future-dated stay 404)', () => {
  const metas = [
    { slug: 'live', title: 'A', status: 'published', publishedAt: '2026-01-01' },
    { slug: 'draft', title: 'B', status: 'draft', publishedAt: '2026-01-01' },
    { slug: 'future', title: 'C', status: 'published', publishedAt: '2999-01-01' },
  ]
  const slugs = selectPublished(metas, '2026-06-01').map((m) => m.slug)
  assert.deepEqual(slugs, ['live'])
  assert.ok(!allRoutePaths(slugs).includes('/blog/draft') && !allRoutePaths(slugs).includes('/blog/future'))
})

test('404.html: noindex, own title, no canonical, throws if the shell changes shape', () => {
  const shell = read('index.html')
  const html = notFoundHtml(shell)
  assert.match(html, /<title>Page not found \| CONVRT<\/title>/)
  assert.match(html, /<meta name="robots" content="noindex, follow" \/>/)
  assert.ok(!/<link[^>]+rel="canonical"/i.test(html))
  assert.ok(html.includes('<div id="root">'), 'must still boot the app')
  assert.throws(() => notFoundHtml('<html><head><title>x</title></head></html>'))
})

test('vercel.json: no catch-all rewrite; creative-testing-sprint redirect and /blog header preserved', () => {
  for (const r of VERCEL.rewrites ?? []) {
    assert.ok(!/\(\.\*\)|\*/.test(r.source), `catch-all rewrite would turn unknown URLs into 200s: ${r.source}`)
  }
  assert.deepEqual(VERCEL.redirects, [{ source: '/creative-testing-sprint', destination: '/pricing', permanent: true }])
  const blog = VERCEL.headers.find((h) => h.source === '/blog')
  assert.deepEqual(blog.headers, [{ key: 'X-Robots-Tag', value: 'noindex, follow' }])
})

test('NotFoundPage: branded, links home and to useful pages, no canonical, noindex', () => {
  const src = read('src/NotFoundPage.jsx')
  assert.match(src, /robots: 'noindex, follow'/)
  assert.ok(!/\burl:/.test(src), 'a 404 page must not declare a canonical / og:url')
  for (const k of ['home', 'caseStudies', 'pricing', 'blog', 'hooks']) assert.match(src, new RegExp(`PATHS\\.${k}\\b`), k)
  assert.match(src, /<h1/)
})

test('hash links and case-study query links never depend on the server path', () => {
  // The server only ever sees the path: "/page#section" and "/case-studies?case=elyon" both map to a real file.
  // The case-study tabs use history.pushState to "/case-studies?case=<id>" (a known path), so a refresh works.
  const cs = read('src/CaseStudiesPage.jsx')
  assert.match(cs, /replace\(\/\\\/case-studies\\\/\[a-z0-9-\]\+\/i, '\/case-studies'\)\}\?case=\$\{id\}/)
})

// ── real build + real HTTP ───────────────────────────────────────────────────────────────
let server, base, tmp, dist

/* How Vercel answers a request (the part of its behaviour this project relies on). */
function resolveRequest(pathname) {
  for (const r of VERCEL.redirects ?? []) {
    if (r.source === pathname) return { status: r.permanent ? 308 : 307, headers: { location: r.destination } }
  }
  if (pathname.startsWith('/api/')) {
    const name = pathname.slice('/api/'.length)
    if (/^[a-z-]+$/.test(name) && fs.existsSync(path.join(ROOT, 'api', `${name}.js`))) return { status: 200, fn: true }
  }
  const file = findFile(pathname)
  if (file) return { status: 200, file }
  for (const r of VERCEL.rewrites ?? []) {
    // Supports the forms used here: an exact path, or `(.*)` wildcards (e.g. "/(.*)").
    const re = new RegExp('^' + r.source.split('(.*)').map((part) => part.replace(/[.+?^${}|()[\]\\]/g, '\\$&')).join('.*') + '$')
    if (re.test(pathname)) return { status: 200, file: path.join(dist, r.destination) }
  }
  return { status: 404, file: path.join(dist, '404.html') }
}

/* Case-sensitive: a file, or a directory containing index.html. */
function findFile(pathname) {
  let dir = dist
  const parts = pathname.split('/').filter(Boolean)
  for (let i = 0; i < parts.length; i++) {
    const hit = fs.readdirSync(dir).find((n) => n === decodeURIComponent(parts[i]))
    if (!hit) return null
    dir = path.join(dir, hit)
    if (i === parts.length - 1) {
      const st = fs.statSync(dir)
      if (st.isFile()) return dir
      const idx = path.join(dir, 'index.html')
      return fs.existsSync(idx) ? idx : null
    }
    if (!fs.statSync(dir).isDirectory()) return null
  }
  const idx = path.join(dist, 'index.html')
  return fs.existsSync(idx) ? idx : null
}

const MIME = { '.html': 'text/html', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' }

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-routes-'))
  dist = path.join(tmp, 'dist')
  // A slim copy of public/ (the real one can hold GBs of local-only video).
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  for (const f of ['robots.txt', 'favicon.svg']) fs.copyFileSync(path.join(ROOT, 'public', f), path.join(pub, f))
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })

  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })

  server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    const r = resolveRequest(url.pathname)
    if (r.fn) { res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{}') }
    const headers = { ...(r.headers ?? {}) }
    for (const h of VERCEL.headers ?? []) {
      if (h.source === url.pathname) for (const { key, value } of h.headers) headers[key.toLowerCase()] = value
    }
    if (r.file) {
      headers['content-type'] = MIME[path.extname(r.file)] ?? 'application/octet-stream'
      res.writeHead(r.status, headers)
      return res.end(fs.readFileSync(r.file))
    }
    res.writeHead(r.status, headers)
    res.end()
  })
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
  base = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((ok) => (server ? server.close(ok) : ok()))
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

const get = (p, init) => fetch(base + p, { redirect: 'manual', ...init })

test('HTTP: every known route answers 200 with the app shell', async () => {
  for (const p of KNOWN_PATHS) {
    const r = await get(p)
    assert.equal(r.status, 200, p)
    assert.match(r.headers.get('content-type'), /text\/html/, p)
    assert.ok((await r.text()).includes('<div id="root">'), `${p} is not the app shell`)
  }
})

test('HTTP: direct navigation / refresh work with query strings and trailing slashes', async () => {
  for (const p of ['/case-studies?case=elyon', '/pricing?utm_source=x', '/case-studies/graspo?x=1', '/pricing/', '/blog/']) {
    assert.equal((await get(p)).status, 200, p)
  }
})

test('HTTP: unknown URLs get a genuine 404 (and the 404 page is noindex, not the homepage)', async () => {
  for (const p of ['/this-page-does-not-exist', '/pricing/extra', '/case-studies/other', '/Pricing', '/scale/x', '/random/deep/path', '/index', '/favicon.ico', '/assets/nope.js']) {
    const r = await get(p)
    assert.equal(r.status, 404, p)
    const body = await r.text()
    assert.match(body, /<title>Page not found \| CONVRT<\/title>/, p)
    assert.match(body, /name="robots" content="noindex, follow"/, p)
    assert.ok(!/Performance Creative Studio for Paid Social/.test(body.replace(/<!--[\s\S]*?-->/g, '').match(/<title>[\s\S]*?<\/title>/)[0]), `${p} serves the homepage title`)
  }
})

test('HTTP: missing blog slugs are 404 (no articles are published yet, so every slug is missing)', async () => {
  for (const p of ['/blog/does-not-exist', '/blog/any-slug', '/blog/a/b']) assert.equal((await get(p)).status, 404, p)
  assert.equal((await get('/blog')).status, 200)
})

test('HTTP: /creative-testing-sprint still redirects permanently to /pricing', async () => {
  const r = await get('/creative-testing-sprint')
  assert.equal(r.status, 308)
  assert.equal(r.headers.get('location'), '/pricing')
})

test('HTTP: /api functions are not swallowed; unknown /api paths are 404', async () => {
  for (const fn of ['free-hooks-subscribe', 'risk-free-apply', 'referral-apply']) {
    assert.equal((await get(`/api/${fn}`)).status, 200, `/api/${fn} must reach its function`)
  }
  assert.equal((await get('/api/does-not-exist')).status, 404)
})

test('HTTP: static assets and generated files are served correctly', async () => {
  const html = await (await get('/')).text()
  const asset = html.match(/\/assets\/[^"]+\.js/)[0]
  assert.equal((await get(asset)).status, 200)
  assert.match((await get(asset)).headers.get('content-type'), /javascript/)
  assert.equal((await get('/robots.txt')).status, 200)
  assert.match((await get('/robots.txt')).headers.get('content-type'), /text\/plain/)
  const sm = await get('/sitemap.xml')
  assert.equal(sm.status, 200)
  assert.match(sm.headers.get('content-type'), /xml/)
  assert.equal((await get('/sitemap-blog.xml')).status, 200)
  assert.equal((await get('/favicon.svg')).status, 200)
  assert.equal((await get('/fonts/inter-latin.woff2')).status, 200)
})

test('HTTP: /blog keeps its X-Robots-Tag header; other pages and 404s do not gain one', async () => {
  assert.equal((await get('/blog')).headers.get('x-robots-tag'), 'noindex, follow')
  assert.equal((await get('/pricing')).headers.get('x-robots-tag'), null)
  assert.equal((await get('/nope')).headers.get('x-robots-tag'), null)
})

test('sitemap only lists URLs that answer 200', async () => {
  const xml = await (await get('/sitemap.xml')).text()
  const locs = [...xml.matchAll(/<loc>https:\/\/www\.convrt\.studio(\/[^<]*)<\/loc>/g)].map((m) => m[1])
  assert.ok(locs.length >= 4)
  for (const p of locs) assert.equal((await get(p)).status, 200, `sitemap lists ${p}`)
})
