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
import { suggestionTarget, suggestionTargetFor, visitorIsInSpain, visitorGeo, preferredSuggestible, startLanguageSuggestion, GEO_ENDPOINT } from '../src/lib/languageSuggestion.js'
import handler from '../api/visitor-country.js'
import { isSpain, isFrance, isFrenchSpeaking, countryKnown } from '../api/_lib/geo.js'

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

test('GET /api/visitor-country answers only { spain, france, french, known }, is never cacheable by a shared cache, and rejects other methods', () => {
  const call = (method, headers) => {
    const out = { headers: {} }
    const res = { setHeader: (k, v) => { out.headers[k.toLowerCase()] = v }, end: (b) => { out.body = b }, set statusCode(v) { out.status = v } }
    handler({ method, headers }, res)
    return out
  }
  const es = call('GET', { 'x-vercel-ip-country': 'ES', 'x-forwarded-for': '203.0.113.9' })
  assert.equal(es.status, 200)
  assert.deepEqual(JSON.parse(es.body), { spain: true, france: false, french: false, known: true }, 'no IP, no country code, nothing else is returned')
  assert.match(es.headers['cache-control'], /private/)
  assert.match(es.headers['cache-control'], /no-store/)
  assert.match(es.headers.vary, /x-vercel-ip-country/i)
  assert.deepEqual(JSON.parse(call('GET', { 'x-vercel-ip-country': 'FR' }).body), { spain: false, france: true, french: true, known: true })
  assert.deepEqual(JSON.parse(call('GET', { 'x-vercel-ip-country': 'GB' }).body), { spain: false, france: false, french: false, known: true })
  assert.deepEqual(JSON.parse(call('GET', {}).body), { spain: false, france: false, french: false, known: false }, 'geolocation unavailable → neither, and the client is told it is unknown')
  assert.equal(call('POST', {}).status, 405)
  const src = stripComments(read('api/visitor-country.js') + read('api/_lib/geo.js'))
  assert.ok(!/console\.|x-forwarded-for|x-real-ip|ipAddress|fetch\(|https?:\/\//.test(src), 'no IP handling, logging or external service')
})

test('France detection: only the x-vercel-ip-country header "FR" counts; "known" means the edge gave some two-letter country', () => {
  assert.equal(isFrance({ 'x-vercel-ip-country': 'FR' }), true)
  assert.equal(isFrance({ 'x-vercel-ip-country': 'fr' }), true)
  for (const v of ['ES', 'BE', 'CH', 'CA', 'GB', '', undefined, 'FRA', 'F']) assert.equal(isFrance({ 'x-vercel-ip-country': v }), false, String(v))
  assert.equal(countryKnown({ 'x-vercel-ip-country': 'BE' }), true)
  for (const v of ['', ' ', undefined, 'XXX', '1']) assert.equal(countryKnown({ 'x-vercel-ip-country': v }), false, String(v))
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
  for (const englishOnly of ['/blog', '/blog/some-article', '/case-studies', '/case-studies/graspo', '/free-hooks']) assert.equal(suggestionTarget(englishOnly).href, '/es/', englishOnly)
  assert.equal(suggestionTarget('/referrals').href, '/es/referrals', 'the referral program now exists in Spanish')
  for (const none of ['/es', '/es/', '/es/pricing', '/es/ugc-video-agency', '/privacy', '/terms', '/legal-notice', '/creator-onboarding', '/creator-onboarding/privacy', '/creator-admin', '/not-a-page', '/fr/pricing']) {
    assert.equal(suggestionTarget(none), null, none)
  }
})

test('start: first-time visitor from Spain → suggestion mounted for the right page; every other case → nothing, and no request when a choice is stored', async () => {
  const run = async ({ pathname = '/pricing', stored, spain = true, fetchImpl } = {}) => {
    const win = fakeWin(pathname)
    if (stored) win.localStorage.setItem(LANGUAGE_STORAGE_KEY, stored)
    let calls = 0; let mounted
    const f = fetchImpl ?? (async () => { calls += 1; return { ok: true, json: async () => ({ spain, france: false, french: false, known: true }) } })
    const result = await startLanguageSuggestion({ win, doc: {}, fetchImpl: f, mount: (_d, href) => { mounted = href } })
    return { result, calls, mounted }
  }
  assert.deepEqual(await run(), { result: 'es', calls: 1, mounted: '/es/pricing' }, 'Spain, first visit')
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
  assert.equal(await startLanguageSuggestion({ win: w, doc: {}, fetchImpl: json({ spain: true, france: false, french: false, known: true }), mount: () => {} }), 'es')
})

/* ── France (French) ── */
test('France: a first-time visitor from France gets the French suggestion; elsewhere nothing; a stored choice means no request', async () => {
  const run = async ({ pathname = '/ugc-video-agency', stored, geo, languages, fetchImpl } = {}) => {
    const win = { ...fakeWin(pathname), navigator: { languages } }
    if (stored) win.localStorage.setItem(LANGUAGE_STORAGE_KEY, stored)
    let calls = 0; let mounted
    const f = fetchImpl ?? (async () => { calls += 1; return { ok: true, json: async () => geo } })
    const result = await startLanguageSuggestion({ win, doc: {}, fetchImpl: f, mount: (_d, href, locale) => { mounted = [href, locale] } })
    return { result, calls, mounted }
  }
  const FR = { spain: false, france: true, french: true, known: true }
  assert.deepEqual(await run({ geo: FR }), { result: 'fr', calls: 1, mounted: ['/fr/ugc-video-agency', 'fr'] }, 'France, first visit, equivalent French page')
  assert.deepEqual((await run({ pathname: '/', geo: FR })).mounted, ['/fr/', 'fr'])
  assert.deepEqual((await run({ pathname: '/pricing', geo: FR })).mounted, ['/fr/pricing', 'fr'])
  assert.deepEqual((await run({ pathname: '/about', geo: FR })).mounted, ['/fr/', 'fr'], 'an English page with no French twin goes to the French homepage')
  assert.equal((await run({ geo: { spain: false, france: false, french: false, known: true }, languages: ['fr-FR'] })).result, false, 'the edge placed the visitor outside France: the browser language is NOT consulted')
  assert.equal((await run({ geo: { spain: true, france: false, french: false, known: true } })).result, 'es', 'Spain still gets Spanish')
  for (const stored of ['en', 'fr', 'dismissed']) assert.deepEqual(await run({ stored, geo: FR }), { result: false, calls: 0, mounted: undefined }, `${stored}: remembered → no request`)
  for (const none of ['/fr/', '/fr/pricing', '/privacy', '/terms', '/legal-notice', '/creator-admin']) assert.equal((await run({ pathname: none, geo: FR })).result, false, none)
  // country unavailable (no header, lookup failed): the browser's preferred language decides, and only for a language we offer
  const unknown = { spain: false, france: false, french: false, known: false }
  assert.equal((await run({ geo: unknown, languages: ['fr-FR', 'en'] })).result, 'fr')
  assert.equal((await run({ geo: unknown, languages: ['fr-CA'] })).result, 'fr')
  assert.equal((await run({ geo: unknown, languages: ['es-ES'] })).result, 'es')
  assert.equal((await run({ geo: unknown, languages: ['en-GB', 'fr'] })).result, 'fr', 'English first, French second: still offered (the visitor can read French)')
  assert.equal((await run({ geo: unknown, languages: ['de-DE', 'fr'] })).result, false, 'a first language we do not offer: nothing')
  assert.equal((await run({ geo: unknown, languages: ['en-US'] })).result, false)
  assert.equal((await run({ geo: unknown, languages: undefined })).result, false)
  assert.equal((await run({ fetchImpl: async () => { throw new Error('offline') }, languages: ['fr-FR'] })).result, 'fr', 'lookup failed → unknown → browser language')
  assert.equal((await run({ fetchImpl: async () => { throw new Error('offline') }, languages: ['en-US'] })).result, false)
  assert.equal(await visitorIsInSpain(json({ spain: true, france: false, french: false, known: true })), true)
  assert.deepEqual(await visitorGeo(json({ france: 'yes' })), { spain: false, france: false, french: false, known: false })
  assert.equal(preferredSuggestible({ navigator: { language: 'fr-FR' } }, ['fr', 'es']), 'fr')
  assert.equal(preferredSuggestible({}, ['fr']), null)
  assert.equal(suggestionTargetFor('fr', '/creator-showcase').href, '/fr/creator-showcase')
  assert.equal(suggestionTargetFor('fr', '/fr/pricing'), null)
})

test('French-speaking countries: Canada, Switzerland, Belgium, Luxembourg, Monaco and French-speaking Africa get the French suggestion; Spain, the UK, the US and the Maghreb do not', async () => {
  for (const c of ['FR', 'CA', 'CH', 'BE', 'LU', 'MC', 'SN', 'CI', 'CM', 'cd', 'RE']) assert.equal(isFrenchSpeaking({ 'x-vercel-ip-country': c }), true, c)
  for (const c of ['ES', 'GB', 'US', 'DE', 'MA', 'DZ', 'TN', 'AE', 'FRA', '', undefined]) assert.equal(isFrenchSpeaking({ 'x-vercel-ip-country': c }), false, String(c))
  const call = (c) => { const out = {}; handler({ method: 'GET', headers: { 'x-vercel-ip-country': c } }, { setHeader() {}, end: (b) => { out.body = b }, set statusCode(v) {} }); return JSON.parse(out.body) }
  assert.deepEqual(call('CA'), { spain: false, france: false, french: true, known: true })
  assert.deepEqual(call('CH'), { spain: false, france: false, french: true, known: true })
  const w = { location: { pathname: '/pricing' }, navigator: { languages: ['en-US'] }, localStorage: { getItem: () => null, setItem() {} } }
  const mounted = []
  assert.equal(await startLanguageSuggestion({ win: w, doc: {}, fetchImpl: async () => ({ ok: true, json: async () => ({ spain: false, france: false, french: true, known: true }) }), mount: (...a) => mounted.push(a.slice(1)) }), 'fr')
  assert.deepEqual(mounted, [['/fr/pricing', 'fr']])
})

/* ── the banner ── */
test('banner (French): « Vous préférez naviguer en français ? Découvrez notre site en français. », « Passer en français » is a plain link, « Rester en anglais » stays, dismissible, lang fr', () => {
  const html = renderToStaticMarkup(createElement(Banner, { href: '/fr/ugc-video-agency', locale: 'fr', onClose() {} }))
  assert.match(html, /role="region"/)
  assert.match(html, /aria-label="Suggestion de langue"/)
  assert.match(html, /lang="fr-FR"/)
  assert.ok(html.includes('Vous préférez naviguer en français ?'))
  assert.ok(html.includes('Découvrez notre site en français.'))
  assert.ok(html.includes('Rester en anglais'))
  assert.match(html, /<a href="\/fr\/ugc-video-agency" hrefLang="fr-FR"[^>]*>Passer en français<\/a>/)
  assert.match(html, /aria-label="Fermer"/)
  assert.ok(!/aria-modal|role="dialog"|tabindex|autofocus/i.test(html), 'non-modal')
  assert.ok(!/inset-0|h-screen|min-h-screen/.test(html), 'no overlay')
  assert.match(stripComments(read('src/components/LanguageSuggestion.jsx')), /rememberLanguage\(locale\)/, 'the click remembers the suggested language')
})

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
  assert.match(src, /rememberLanguage\(locale\)/)
  assert.match(src, /rememberDismissal\(\)/)
  assert.match(src, /key === 'Escape'/)
  assert.match(src, /Cookie consent/, 'waits for the cookie banner to be answered')
  assert.match(src, /if \(waiting\) return null/)
})

/* ── SEO / GEO safeguards ── */
test('never a redirect: no code path navigates on detection, and the redirect/header rules, robots and routing are untouched', () => {
  for (const f of ['src/lib/languageSuggestion.js', 'src/lib/languagePreference.js', 'src/components/mountLanguageSuggestion.jsx', 'api/visitor-country.js', 'api/_lib/geo.js']) {
    const src = stripComments(read(f))
    assert.ok(!/location\.(replace|assign|href\s*=)|window\.open|statusCode\s*=\s*30\d|\b30[1278]\b|Location['"]?\s*:|navigator\.geolocation/.test(src), `${f} must not redirect or read the browser location`)
    // the browser's language list is read in ONE place only: the fallback used when the server cannot place the request (owner brief, Nov 2026: French suggestion)
    if (f !== 'src/lib/languageSuggestion.js') assert.ok(!/navigator\.(language|languages)/.test(src), `${f} must not read the browser language`)
  }
  const langSrc = stripComments(read('src/lib/languageSuggestion.js'))
  const fn = langSrc.slice(langSrc.indexOf('export function preferredSuggestible'), langSrc.indexOf('/* Called once from src/main.jsx'))
  assert.equal((langSrc.match(/navigator\??\.(language|languages)/g) ?? []).length, (fn.match(/navigator\??\.(language|languages)/g) ?? []).length, 'only preferredSuggestible reads the browser language')
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
    assert.ok(!/Prefieres navegar|Sugerencia de idioma|Vous préférez naviguer|Suggestion de langue|language-suggestion-root|visitor-country/.test(h), `${path.relative(dist, f)} must not contain the suggestion`)
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
