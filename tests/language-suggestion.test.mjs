// Run with: node --test tests/language-suggestion.test.mjs
// The language suggestion for visitors in Spain (branch language-suggestion): detection endpoint, remembered preference, eligibility, the banner, and the SEO safeguards
// (no redirect, nothing in the prerendered HTML, routing/redirect rules/hreflang/sitemap unchanged).
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
import { readLanguageChoice, rememberLanguage, rememberDismissal, LANGUAGE_STORAGE_KEY } from '../src/lib/languagePreference.js'
import { suggestionTarget, visitorIsInSpain, startLanguageSuggestion, GEO_ENDPOINT } from '../src/lib/languageSuggestion.js'
import handler from '../api/visitor-country.js'
import { isSpain } from '../api/_lib/geo.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const memStore = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m } }
const blocked = () => ({ getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } })
const fakeWin = (pathname, { local = memStore(), session = memStore() } = {}) => ({ location: { pathname }, localStorage: local, sessionStorage: session })
const json = (body, ok = true) => async () => ({ ok, json: async () => body })

let tmp, dist, vite, Banner
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-langsuggest-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
  vite = await createServer({ root: ROOT, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  Banner = (await vite.ssrLoadModule('/src/components/LanguageSuggestion.jsx')).default
})
after(async () => { await vite?.close(); if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

/* ── detection: Spain from the server, nothing else ── */
test('Spain detection: only the x-vercel-ip-country header "ES" counts; anything else, or nothing, is "not Spain"', () => {
  assert.equal(isSpain({ 'x-vercel-ip-country': 'ES' }), true)
  assert.equal(isSpain({ 'x-vercel-ip-country': 'es' }), true)
  for (const v of ['GB', 'US', 'FR', '', ' ', undefined, 'ESP', 'E']) assert.equal(isSpain({ 'x-vercel-ip-country': v }), false, String(v))
  assert.equal(isSpain({}), false)
  assert.equal(isSpain(), false)
})

test('GET /api/visitor-country answers only { spain }, is never cacheable by a shared cache, and rejects other methods', () => {
  const call = (method, headers) => {
    const out = { headers: {} }
    const res = { setHeader: (k, v) => { out.headers[k.toLowerCase()] = v }, end: (b) => { out.body = b }, set statusCode(v) { out.status = v } }
    handler({ method, headers }, res)
    return out
  }
  const es = call('GET', { 'x-vercel-ip-country': 'ES', 'x-forwarded-for': '203.0.113.9' })
  assert.equal(es.status, 200)
  assert.deepEqual(JSON.parse(es.body), { spain: true }, 'no IP, no country code, nothing else is returned')
  assert.match(es.headers['cache-control'], /private/)
  assert.match(es.headers['cache-control'], /no-store/)
  assert.match(es.headers.vary, /x-vercel-ip-country/i)
  assert.deepEqual(JSON.parse(call('GET', { 'x-vercel-ip-country': 'GB' }).body), { spain: false })
  assert.deepEqual(JSON.parse(call('GET', {}).body), { spain: false }, 'geolocation unavailable → not Spain')
  assert.equal(call('POST', {}).status, 405)
  const src = stripComments(read('api/visitor-country.js') + read('api/_lib/geo.js'))
  assert.ok(!/console\.|x-forwarded-for|x-real-ip|ipAddress|fetch\(|https?:\/\//.test(src), 'no IP handling, logging or external service')
})

test('the client asks once and treats every failure as "not Spain"', async () => {
  assert.equal(await visitorIsInSpain(json({ spain: true })), true)
  assert.equal(await visitorIsInSpain(json({ spain: false })), false)
  assert.equal(await visitorIsInSpain(json({ spain: 'true' })), false)
  assert.equal(await visitorIsInSpain(json({ spain: true }, false)), false, 'non-2xx')
  assert.equal(await visitorIsInSpain(async () => { throw new Error('offline') }), false)
  assert.equal(await visitorIsInSpain(async () => ({ ok: true, json: async () => { throw new Error('bad json') } })), false)
  assert.equal(await visitorIsInSpain(undefined), false)
  const hang = (_u, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('aborted'))))
  assert.equal(await visitorIsInSpain(hang, 30), false, 'a slow lookup is abandoned')
  let seen
  await visitorIsInSpain(async (u, o) => { seen = [u, o]; return { ok: true, json: async () => ({ spain: false }) } })
  assert.equal(seen[0], GEO_ENDPOINT)
  assert.equal(seen[1].cache, 'no-store')
  assert.equal(seen[1].credentials, 'same-origin')
})

/* ── remembered preference ── */
test('preference: the chosen language and a dismissal are remembered, nothing else, and blocked storage never throws', () => {
  const w = fakeWin('/')
  assert.equal(readLanguageChoice(w), null)
  assert.equal(rememberLanguage('en', w), true)
  assert.equal(readLanguageChoice(w), 'en')
  assert.equal(w.localStorage._m.get(LANGUAGE_STORAGE_KEY), 'en')
  rememberLanguage('es', w)
  assert.equal(readLanguageChoice(w), 'es')
  const w2 = fakeWin('/')
  rememberDismissal(w2)
  assert.equal(readLanguageChoice(w2), 'dismissed')
  assert.equal(rememberLanguage('<script>', fakeWin('/')), false, 'only a two-letter language code is stored')
  const junk = fakeWin('/'); junk.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'zzz-not-valid'); assert.equal(readLanguageChoice(junk), null)
  // localStorage blocked → sessionStorage fallback; both blocked → nothing remembered, no error
  const half = fakeWin('/', { local: blocked() })
  assert.equal(rememberLanguage('en', half), true); assert.equal(readLanguageChoice(half), 'en')
  const none = fakeWin('/', { local: blocked(), session: blocked() })
  assert.equal(rememberLanguage('en', none), false); assert.equal(readLanguageChoice(none), null)
  assert.doesNotThrow(() => rememberDismissal(none))
  assert.equal(readLanguageChoice({}), null)
  assert.equal(readLanguageChoice(undefined), null)
  const throwingGetter = { get localStorage() { throw new Error('denied') }, get sessionStorage() { throw new Error('denied') } }
  assert.equal(readLanguageChoice(throwingGetter), null)
  assert.equal(rememberLanguage('en', throwingGetter), false)
})

/* ── eligibility and the Spanish destination ── */
test('suggestion target: English public pages get their Spanish equivalent or /es/; Spanish, legal, private and unknown pages get nothing', () => {
  assert.equal(suggestionTarget('/').href, '/es/')
  assert.equal(suggestionTarget('/pricing').href, '/es/pricing')
  assert.equal(suggestionTarget('/pricing/').href, '/es/pricing')
  assert.equal(suggestionTarget('/ugc-video-agency').href, '/es/ugc-video-agency')
  assert.equal(suggestionTarget('/creator-showcase').href, '/es/creator-showcase')
  assert.equal(suggestionTarget('/about').href, '/es/about')
  assert.equal(suggestionTarget('/creative-growth-roadmap').href, '/es/creative-growth-roadmap')
  assert.equal(suggestionTarget('/case-studies').href, '/es/case-studies')
  assert.equal(suggestionTarget('/case-studies/graspo').href, '/es/case-studies/graspo')
  assert.equal(suggestionTarget('/case-studies/elyon').href, '/es/case-studies/elyon')
  for (const englishOnly of ['/blog', '/blog/some-article', '/free-hooks', '/referrals']) assert.equal(suggestionTarget(englishOnly).href, '/es/', englishOnly)
  for (const none of ['/es', '/es/', '/es/pricing', '/es/ugc-video-agency', '/privacy', '/terms', '/legal-notice', '/creator-onboarding', '/creator-onboarding/privacy', '/creator-admin', '/not-a-page', '/fr/pricing']) {
    assert.equal(suggestionTarget(none), null, none)
  }
})

test('start: first-time visitor from Spain → suggestion mounted for the right page; every other case → nothing, and no request when a choice is stored', async () => {
  const run = async ({ pathname = '/pricing', stored, spain = true, fetchImpl } = {}) => {
    const win = fakeWin(pathname)
    if (stored) win.localStorage.setItem(LANGUAGE_STORAGE_KEY, stored)
    let calls = 0; let mounted
    const f = fetchImpl ?? (async () => { calls += 1; return { ok: true, json: async () => ({ spain }) } })
    const result = await startLanguageSuggestion({ win, doc: {}, fetchImpl: f, mount: (_d, href) => { mounted = href } })
    return { result, calls, mounted }
  }
  assert.deepEqual(await run(), { result: true, calls: 1, mounted: '/es/pricing' }, 'Spain, first visit')
  assert.deepEqual((await run({ spain: false })).mounted, undefined, 'UK and everyone else: no suggestion')
  for (const stored of ['en', 'es', 'dismissed']) assert.deepEqual(await run({ stored }), { result: false, calls: 0, mounted: undefined }, `${stored}: remembered → no request, no banner`)
  assert.deepEqual(await run({ pathname: '/es/pricing' }), { result: false, calls: 0, mounted: undefined }, 'Spanish URL: never')
  assert.deepEqual(await run({ pathname: '/es/' }), { result: false, calls: 0, mounted: undefined })
  assert.equal((await run({ fetchImpl: async () => { throw new Error('offline') } })).result, false, 'geolocation unavailable: nothing, no error')
  // a choice made in another tab while the lookup was running wins
  const win = fakeWin('/')
  let mounted = false
  await startLanguageSuggestion({ win, doc: {}, fetchImpl: async () => { win.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en'); return { ok: true, json: async () => ({ spain: true }) } }, mount: () => { mounted = true } })
  assert.equal(mounted, false)
  // storage unavailable: still works, no error
  const w = fakeWin('/', { local: blocked(), session: blocked() })
  assert.equal(await startLanguageSuggestion({ win: w, doc: {}, fetchImpl: json({ spain: true }), mount: () => {} }), true)
})

/* ── the banner ── */
test('banner: compact, accessible, Spanish text on an English page, the two buttons, a dismiss control, an ordinary link to the Spanish page', () => {
  const html = renderToStaticMarkup(createElement(Banner, { href: '/es/pricing', onClose() {} }))
  assert.match(html, /role="region"/)
  assert.match(html, /aria-label="Sugerencia de idioma"/)
  assert.match(html, /lang="es"/)
  assert.ok(html.includes('¿Prefieres navegar en español?'))
  assert.ok(html.includes('También puedes visitar nuestra web en español.'))
  assert.ok(html.includes('Continuar en inglés'))
  assert.match(html, /<a href="\/es\/pricing"[^>]*>Ver en español<\/a>/, 'a plain link, so it works without scripts and is not a redirect')
  assert.match(html, /aria-label="Cerrar"/)
  assert.match(html, /bg-lime/, 'lime Spanish call to action')
  assert.ok(!/aria-modal|role="dialog"|tabindex|autofocus/i.test(html), 'non-modal: no focus trap, no focus steal')
  assert.match(html, /fixed inset-x-3 bottom-3/, 'bottom of the screen, never full-screen')
  assert.ok(!/inset-0|h-screen|min-h-screen/.test(html), 'no overlay')
  assert.match(html, /motion-reduce:transition-none/)
  const src = stripComments(read('src/components/LanguageSuggestion.jsx'))
  assert.ok(!/location\.(replace|assign|href)|window\.open|navigate\(/.test(src), 'the card never navigates by itself')
  assert.match(src, /rememberLanguage\('en'\)/)
  assert.match(src, /rememberLanguage\('es'\)/)
  assert.match(src, /rememberDismissal\(\)/)
  assert.match(src, /key === 'Escape'/)
  assert.match(src, /Cookie consent/, 'waits for the cookie banner to be answered')
  assert.match(src, /if \(waiting\) return null/)
})

/* ── SEO / GEO safeguards ── */
test('never a redirect: no code path navigates on detection, and the redirect/header rules, robots and routing are untouched', () => {
  for (const f of ['src/lib/languageSuggestion.js', 'src/lib/languagePreference.js', 'src/components/mountLanguageSuggestion.jsx', 'api/visitor-country.js', 'api/_lib/geo.js']) {
    const src = stripComments(read(f))
    assert.ok(!/location\.(replace|assign|href\s*=)|window\.open|statusCode\s*=\s*30\d|\b30[1278]\b|Location['"]?\s*:|navigator\.(language|languages|geolocation)/.test(src), `${f} must not redirect or read browser language/location`)
  }
  const vercel = JSON.parse(read('vercel.json'))
  assert.deepEqual(vercel.redirects.map((r) => r.source), ['/(.*)', '/creative-testing-sprint', '/our-work'], 'redirect rules unchanged: the apex→www rule and two old URLs only')
  assert.ok(!JSON.stringify(vercel).match(/x-vercel-ip-country|geo|\/es/i), 'no geo rule, no Spanish rule in vercel.json')
  assert.ok(!/User-agent[^\n]*\n\s*Disallow:\s*\/(es)?\s*$/m.test(read('public/robots.txt')), 'no crawler is blocked from / or /es/')
  const main = stripComments(read('src/main.jsx'))
  assert.match(main, /hydrate && currentLocale\(\) === 'en' && !readLanguageChoice\(\)/, 'only English pages, only without a stored choice, only after hydration')
  assert.match(main, /load/)
})

test('the prerendered HTML is unchanged: no suggestion text anywhere, canonical and hreflang intact, Spanish URLs and the sitemap still there', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []))
  const files = walk(dist)
  assert.ok(files.length > 20, `${files.length} pages`)
  for (const f of files) {
    const h = fs.readFileSync(f, 'utf8')
    assert.ok(!/Prefieres navegar|Sugerencia de idioma|language-suggestion-root|visitor-country/.test(h), `${path.relative(dist, f)} must not contain the suggestion`)
  }
  const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  assert.match(home, /<link rel="canonical" href="https:\/\/www\.convrt\.studio\/"/)
  for (const [hl, href] of [['en', 'https://www.convrt.studio/'], ['es', 'https://www.convrt.studio/es/'], ['x-default', 'https://www.convrt.studio/']]) assert.ok(home.includes(`hreflang="${hl}" href="${href}"`), `${hl} hreflang on /`)
  const esHome = fs.readFileSync(path.join(dist, 'es', 'index.html'), 'utf8')
  assert.match(esHome, /<link rel="canonical" href="https:\/\/www\.convrt\.studio\/es\/"/)
  assert.ok(!/noindex/.test(home) && !/noindex/.test(esHome), 'both homepages stay indexable')
  assert.match(fs.readFileSync(path.join(dist, 'es', 'creative-growth-roadmap', 'index.html'), 'utf8'), /noindex/, 'existing noindex gates are respected')
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const u of ['https://www.convrt.studio/', 'https://www.convrt.studio/es/', 'https://www.convrt.studio/es/pricing']) assert.ok(sm.includes(`<loc>${u}</loc>`), u)
  assert.ok(!sm.includes('visitor-country'))
  assert.ok(!fs.existsSync(path.join(dist, 'api')), 'the endpoint is a serverless function, not a page')
})

test('the language selector still works: plain links, hreflang, and each click records the explicit choice', () => {
  const src = read('src/components/LanguageSelector.jsx')
  assert.equal((src.match(/rememberLanguage\(o\.code\)/g) ?? []).length, 2, 'dropdown/list links and footer links record the choice')
  assert.ok(!/preventDefault|location\.(replace|assign|href\s*=)/.test(stripComments(src)), 'links stay ordinary links')
  const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  assert.match(home, /<a href="\/es\/"[^>]*lang="es"[^>]*hrefLang="es"|<a href="\/es\/"[^>]*hreflang="es"/i)
})

test('performance: the feature adds nothing to the critical path (no static import of the banner, one tiny same-origin request only after load, and none for returning visitors)', () => {
  const main = stripComments(read('src/main.jsx'))
  assert.ok(!/import .*LanguageSuggestion|import .*languageSuggestion/.test(main.split('\n').filter((l) => /^import /.test(l)).join('\n')), 'banner and detection code are dynamically imported')
  assert.match(main, /import\('\.\/lib\/languageSuggestion\.js'\)/)
  assert.match(main, /requestIdleCallback/)
  const pkg = JSON.parse(read('package.json'))
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['@pdf-lib/fontkit', '@vercel/functions', 'hls.js', 'pdf-lib', 'react', 'react-dom'], 'no new dependency')
})

test('privacy: the stored key is disclosed in the Privacy Policy and the language selector docs no longer say "stores nothing"', () => {
  const policy = fs.readFileSync(path.join(dist, 'privacy', 'index.html'), 'utf8')
  assert.ok(policy.includes('convrt_language'))
  assert.match(policy, /our server answers only yes or no and stores nothing/)
  assert.ok(!/analytics|gtag|dataLayer|trackEvent/.test(stripComments(read('src/lib/languageSuggestion.js') + read('src/lib/languagePreference.js') + read('src/components/LanguageSuggestion.jsx'))), 'no tracking')
})
