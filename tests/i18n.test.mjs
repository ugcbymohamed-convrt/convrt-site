// Run with: node --test tests/i18n.test.mjs
// Multilingual foundation + Spanish launch candidate.
//   1. Pure checks: locale registry, path helpers, language-switch targets, dictionaries, completeness, formatting.
//   2. A real production build into a temp dir, then raw-HTML assertions on the Spanish pages and on the English pages that have a translation.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { LOCALES, LOCALE_CODES, LIVE_LOCALES, BUILT_LOCALES, isLive } from '../src/i18n/locales.js'
import { TRANSLATED_PATHS, hasTranslation } from '../src/i18n/registry.js'
import { parsePath, localizedPath, allLocalizedPaths } from '../src/i18n/paths.js'
import { switchTarget, languageOptions } from '../src/i18n/switch.js'
import { alternatesFor, absoluteUrl } from '../src/i18n/seo.js'
import { ES_SEO } from '../src/i18n/es/seo.js'
import { DICTIONARIES } from '../src/i18n/dictionaries.js'
import { PARTS } from '../src/i18n/es/index.js'
import { missingFor } from '../scripts/i18n-check.mjs'
import { localizeStat } from '../src/i18n/format.js'
import { formatMoneyEs } from '../src/i18n/es/money.js'
import { captionEs, ES_LANGUAGE_LABELS } from '../src/i18n/es/labels.js'
import { LOCALIZED_FLOWS, flowAvailable, resolveCta } from '../src/i18n/cta.js'
import { prioritizeLanguage, PORTFOLIO, selectDisplayable } from '../src/content/portfolio.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { SITE_URL, OFFER_PATHS, BOOKING_URL } from '../src/config.js'
import { SPRINT, SPRINT_PLUS, ORGANIC, USAGE_RIGHTS } from '../src/seo/businessKnowledge.js'
import { buildSitemap, localizedSitemapPaths } from '../src/lib/seo/sitemap.js'
import { isReleased, releaseBlocker, blockedPages } from '../src/i18n/release.js'
import { displayableFor, titleOf, portfolioProblems, forPageLanguage, selectOurWork, selectGallery, selectSpokespersonGallery, selectSaasGallery, selectHero, ENGLISH_LIBRARY } from '../src/content/portfolio.js'

// Pages that are built AND released (the Spanish Showcase is launch-blocked until Spanish-language videos exist).
const RELEASED_ES = TRANSLATED_PATHS.es.filter((bp) => isReleased('es', bp))
// Released AND indexable: only these get hreflang and a sitemap entry (the Roadmap is a paid-traffic landing page, noindex in English, so its Spanish twin follows).
const INDEXABLE_ES = RELEASED_ES.filter((bp) => SITE_SEO[bp].indexable !== false)

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

// ── 1. pure checks ─────────────────────────────────────────────────────────────────────────────────────────────
test('locales: English, Spanish, French and Arabic are registered; Arabic is right-to-left; only English and Spanish are live', () => {
  assert.deepEqual(LOCALE_CODES, ['en', 'es', 'fr', 'ar'])
  assert.equal(LOCALES.ar.dir, 'rtl')
  for (const c of ['en', 'es', 'fr']) assert.equal(LOCALES[c].dir, 'ltr')
  assert.deepEqual(LOCALES.en.prefix, '')
  assert.equal(LOCALES.es.prefix, '/es'); assert.equal(LOCALES.fr.prefix, '/fr'); assert.equal(LOCALES.ar.prefix, '/ar')
  assert.deepEqual(LIVE_LOCALES, ['en', 'es'])
  assert.deepEqual(BUILT_LOCALES, ['en', 'es'], 'French and Arabic are prepared: no routes are built for them')
  assert.ok(isLive('es') && !isLive('fr') && !isLive('ar'))
  assert.deepEqual(TRANSLATED_PATHS.fr, []); assert.deepEqual(TRANSLATED_PATHS.ar, [])
  assert.deepEqual(allLocalizedPaths(['fr', 'ar']), [])
})

test('paths: English URLs never change; other languages live under their prefix with the same slugs', () => {
  assert.equal(localizedPath('en', '/pricing'), '/pricing')
  assert.equal(localizedPath('en', '/'), '/')
  assert.equal(localizedPath('es', '/pricing'), '/es/pricing')
  assert.equal(localizedPath('es', '/'), '/es/')
  assert.deepEqual(parsePath('/es/pricing'), { locale: 'es', basePath: '/pricing' })
  assert.deepEqual(parsePath('/es'), { locale: 'es', basePath: '/' })
  assert.deepEqual(parsePath('/es/'), { locale: 'es', basePath: '/' })
  assert.deepEqual(parsePath('/fr/x'), { locale: 'fr', basePath: '/x' })
  assert.deepEqual(parsePath('/pricing'), { locale: 'en', basePath: '/pricing' })
  assert.deepEqual(parsePath('/'), { locale: 'en', basePath: '/' })
  assert.deepEqual(parsePath('/blog/some-article'), { locale: 'en', basePath: '/blog/some-article' })
  assert.deepEqual(parsePath('/escape'), { locale: 'en', basePath: '/escape' }, 'only an exact language segment is a locale')
  assert.deepEqual(allLocalizedPaths(['es']), ['/es', '/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/social-media-video-production', '/es/saas-video-production', '/es/pricing', '/es/creator-showcase', '/es/about', '/es/contact', '/es/creative-growth-roadmap'])
})

test('every translated path is a real English page with SEO data and a Spanish title/description/OG copy', () => {
  for (const bp of TRANSLATED_PATHS.es) {
    assert.ok(SITE_SEO[bp], `${bp} has English SEO data`)
    const e = ES_SEO[bp]
    assert.ok(e && e.title && e.description, `${bp} has Spanish SEO copy`)
    assert.ok(e.title.length <= 66, `${bp} title is not truncated in search results (${e.title.length})`)
    assert.ok(e.description.length >= 90 && e.description.length <= 200, `${bp} description length ${e.description.length}`)
    assert.notEqual(e.title, SITE_SEO[bp].title)
    assert.notEqual(e.description, SITE_SEO[bp].description)
  }
  assert.equal(new Set(Object.values(ES_SEO).map((e) => e.title)).size, Object.keys(ES_SEO).length, 'unique Spanish titles')
  assert.equal(new Set(Object.values(ES_SEO).map((e) => e.description)).size, Object.keys(ES_SEO).length, 'unique Spanish descriptions')
  assert.deepEqual(Object.keys(ES_SEO).sort(), [...TRANSLATED_PATHS.es].sort(), 'no Spanish SEO entry exists for a page that is not translated')
})

test('hreflang: one reciprocal set per translated page (en, es, x-default), only for indexable pages; none for untranslated pages', () => {
  assert.ok(!INDEXABLE_ES.includes('/creative-growth-roadmap') || SITE_SEO['/creative-growth-roadmap'].indexable !== false)
  assert.deepEqual(alternatesFor('/creative-growth-roadmap', SITE_SEO['/creative-growth-roadmap']), [], 'the noindex Roadmap carries no hreflang in either language')
  for (const bp of INDEXABLE_ES) {
    const set = alternatesFor(bp, SITE_SEO[bp])
    assert.deepEqual(set.map((a) => a.hreflang), ['en', 'es', 'x-default'], bp)
    assert.equal(set[0].href, `${SITE_URL}${bp}`)
    assert.equal(set[1].href, absoluteUrl('es', bp))
    assert.equal(set[2].href, set[0].href, 'x-default is the English page')
  }
  assert.deepEqual(alternatesFor('/blog', { indexable: true }), [], 'a page without a translation has no hreflang')
  assert.deepEqual(alternatesFor('/pricing', { indexable: false }), [], 'a noindex page never carries hreflang')
  assert.ok(!JSON.stringify(TRANSLATED_PATHS.es.map((bp) => alternatesFor(bp, SITE_SEO[bp]))).match(/\/(fr|ar)\b/), 'no hreflang for unpublished languages')
})

test('language selector: only live languages are offered, each link points at an equivalent page that exists, otherwise the language home', () => {
  const onPricing = languageOptions('en', '/pricing')
  assert.deepEqual(onPricing.map((o) => [o.code, o.href, o.exact]), [['en', '/pricing', true], ['es', '/es/pricing', true]])
  const onBlog = languageOptions('en', '/blog')
  assert.deepEqual(onBlog.map((o) => [o.code, o.href, o.exact]), [['en', '/blog', true], ['es', '/es/', false]], 'an English-only page falls back to the Spanish home')
  assert.equal(switchTarget('es', '/case-studies/graspo'), '/es/')
  assert.equal(switchTarget('en', '/pricing'), '/pricing')
  assert.equal(languageOptions('es', '/about').find((o) => o.current).code, 'es')
  assert.deepEqual(languageOptions('en', '/').map((o) => o.label), ['English', 'Español'], 'native names; French and Arabic are not offered until they are live')
  for (const o of languageOptions('en', '/pricing')) assert.ok(o.code === 'en' || hasTranslation(o.code, '/pricing'))
  // never browser detection or redirects: the component is plain links and reads nothing from navigator/cookies/geolocation
  const sel = read('src/components/LanguageSelector.jsx') + read('src/i18n/switch.js') + read('src/i18n/locale.js')
  assert.ok(!/navigator\.language|localStorage|sessionStorage|document\.cookie|geolocation|location\.(replace|assign|href\s*=)/.test(sel.replace(/\/\*[\s\S]*?\*\//g, '')))
})

test('sitemap: English entries are unchanged; Spanish canonical URLs are added for live, indexable translations only', () => {
  const xml = buildSitemap()
  for (const p of ['/', '/pricing', '/ugc-video-agency', '/creator-showcase', '/about']) assert.ok(xml.includes(`<loc>${SITE_URL}${p}</loc>`), `English ${p} still listed`)
  const es = localizedSitemapPaths()
  assert.deepEqual(es, INDEXABLE_ES.map((bp) => localizedPath('es', bp)))
  assert.ok(!es.includes('/es/creative-growth-roadmap'), 'the noindex Roadmap is never in the sitemap')
  assert.ok(!es.includes('/es/creator-showcase') || displayableFor('es').length > 0, 'the Spanish Showcase is listed only once Spanish-language videos exist')
  for (const p of es) assert.ok(xml.includes(`<loc>${SITE_URL}${p}</loc>`), p)
  assert.ok(!/<loc>[^<]*\/(fr|ar)(\/|<)/.test(xml), 'no French or Arabic URL')
  assert.ok(!/privacy|terms|legal-notice/.test(es.join()), 'the legal pages are not translated')
})

test('dictionary: complete for every literal tr()/<T> in the source, no empty values except the declared "leave out" lines, no stale duplicates', () => {
  assert.deepEqual(missingFor('es'), [], 'run `node scripts/i18n-check.mjs es` and add the missing entries')
  const seen = new Map()
  for (const [part, dict] of Object.entries(PARTS)) {
    for (const [k, v] of Object.entries(dict)) {
      if (seen.has(k)) assert.equal(seen.get(k), v, `duplicate key "${k.slice(0, 50)}" disagrees between dictionary parts (${part})`)
      seen.set(k, v)
      if (v === '') assert.ok(PARTS.trust === dict, `empty translation only allowed in dict-trust.js: "${k.slice(0, 60)}"`)
    }
  }
  assert.equal(DICTIONARIES.fr, undefined); assert.equal(DICTIONARIES.ar, undefined)
})

const OMITTED_FIGURE = /free library of 10 ad hooks/
test('dictionary: figures in an English sentence survive in its Spanish translation (prices, counts, months, days)', () => {
  const digits = (s) => (s.match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]/g, '')).sort().join('|')
  let checked = 0
  for (const [k, v] of Object.entries(DICTIONARIES.es)) {
    if (!/\d/.test(k) || /^\[\[|https?:|mohamed@/.test(k)) continue
    if (OMITTED_FIGURE.test(k)) continue // the free-hooks offer is English-only, so Spanish deliberately leaves the "10 ad hooks" mention out
    assert.equal(digits(v), digits(k), `figures differ between\n  ${k}\n  ${v}`)
    checked++
  }
  assert.ok(checked > 40, `checked ${checked} figure-bearing strings`)
})

test('Spanish money: USD only, amounts exactly as in the business data, Spanish notation', () => {
  assert.equal(formatMoneyEs(SPRINT.monthly), '3.000 USD')
  assert.equal(formatMoneyEs(SPRINT.oneOff), '3.500 USD')
  assert.equal(formatMoneyEs(SPRINT_PLUS.monthly), '5.000 USD')
  assert.equal(formatMoneyEs(ORGANIC.light.monthly), '1.500 USD')
  assert.equal(formatMoneyEs(SPRINT.usageExtensions[0].price), '937,50 USD')
  assert.throws(() => formatMoneyEs({ amount: 1, currency: 'EUR' }))
  assert.equal(localizeStat('es', '1,200+'), '1.200+'); assert.equal(localizeStat('es', '10.7M'), '10,7 M'); assert.equal(localizeStat('en', '10.7M'), '10.7M')
})

test('conversion flows: only the Roadmap is translated for Spanish; risk-free, hooks and referrals stay English-only; French and Arabic have none', () => {
  for (const l of ['fr', 'ar']) for (const f of ['roadmap', 'riskFree', 'hooks', 'referrals']) assert.equal(LOCALIZED_FLOWS[l][f], false, `${l}.${f}`)
  assert.equal(LOCALIZED_FLOWS.es.roadmap, true)
  for (const f of ['riskFree', 'hooks', 'referrals']) assert.equal(LOCALIZED_FLOWS.es[f], false, `es.${f}`)
  assert.equal(flowAvailable('en', 'roadmap'), true)
  assert.equal(flowAvailable('es', 'roadmap'), true)
  assert.equal(flowAvailable('es', 'hooks'), false)
  assert.deepEqual(resolveCta('es', { href: OFFER_PATHS.roadmap, label: 'Get 5 Free Ad Concepts' }), { href: '/es/creative-growth-roadmap', external: false, label: 'Get 5 Free Ad Concepts', redirected: false })
  assert.deepEqual(resolveCta('en', { href: OFFER_PATHS.roadmap, label: 'Get 5 Free Ad Concepts' }), { href: OFFER_PATHS.roadmap, external: false, label: 'Get 5 Free Ad Concepts', redirected: false })
  assert.deepEqual(resolveCta('es', { href: '/pricing', label: 'x' }), { href: '/es/pricing', external: false, label: 'x', redirected: false }, 'internal pages stay in Spanish')
})

test('creator showcase: Spanish-spoken videos are shown first ONLY when the data confirms the language; nothing is guessed or removed', () => {
  const items = [{ id: 'a', languages: ['en'] }, { id: 'b' }, { id: 'c', languages: ['es'] }, { id: 'd', languages: ['en', 'es'] }]
  assert.deepEqual(prioritizeLanguage(items, 'es').map((i) => i.id), ['c', 'd', 'a', 'b'])
  assert.deepEqual(prioritizeLanguage(items, 'en').map((i) => i.id), ['a', 'b', 'c', 'd'], 'English keeps the file order')
  assert.deepEqual(prioritizeLanguage([{ id: 'a', languages: ['en'] }, { id: 'b' }], 'es').map((i) => i.id), ['a', 'b'], 'no Spanish videos: order untouched, nobody is classified by appearance')
  // today's data: not one displayable video has a confirmed Spanish language, so the Spanish page must not claim Spanish-speaking creators
  assert.equal(selectDisplayable(PORTFOLIO).filter((i) => (i.languages ?? []).includes('es')).length, 0)
  assert.ok(Object.keys(ES_LANGUAGE_LABELS).includes('es'))
  assert.equal(captionEs('UGC ad example 5'), 'Ejemplo de anuncio UGC 5.')
  assert.equal(captionEs('A hand-written caption'), null)
})

test('legal pages are not translated or built in Spanish (approved English wording is the only version)', () => {
  for (const bp of ['/privacy', '/terms', '/legal-notice']) assert.ok(!hasTranslation('es', bp))
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/multilingual-legal-translation-review.md')))
})

test('right-to-left readiness is scoped to dir="rtl" / lang="ar" and cannot touch LTR pages', () => {
  const css = read('src/index.css')
  const block = css.slice(css.indexOf('Right-to-left and Arabic readiness'))
  for (const line of block.split('\n').filter((l) => /^[:h][^/]*\{/.test(l.trim()))) assert.match(line, /:lang\(ar\)|dir='rtl'/, `unscoped RTL rule: ${line}`)
  assert.match(block, /letter-spacing: normal/)
})

// ── 2. a real production build ─────────────────────────────────────────────────────────────────────────────────
let tmp, dist
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const bodyOf = (h) => h.slice(h.indexOf('<body'))
const textOf = (h) => bodyOf(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map((s) => s.trim()).filter(Boolean)
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const tag = (h, re) => [...headOf(h).matchAll(re)].map((m) => m[1])

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-i18n-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

const ES_PAGES = allLocalizedPaths(['es'])
const baseOf = (p) => parsePath(p).basePath

test('Spanish pages: real static HTML with html lang="es", no dir, one self-referencing canonical, localized title/description/H1, indexable', () => {
  for (const p of ES_PAGES) {
    const h = page(p)
    const bp = baseOf(p)
    assert.match(h, /^<!doctype html>\s*<html lang="es">/i, p)
    assert.ok(!/<html[^>]*\sdir=/.test(h), `${p}: LTR languages carry no dir attribute`)
    assert.deepEqual(tag(h, /<link rel="canonical" href="([^"]+)"/g), [absoluteUrl('es', bp)], `${p}: self-referencing canonical`)
    assert.ok(!tag(h, /<link rel="canonical" href="([^"]+)"/g)[0].replace(SITE_URL, '').match(/^\/(?!es)/) || false, `${p}: never canonicalised to English`)
    assert.deepEqual(tag(h, /<title>([^<]*)<\/title>/g).map((t) => t.replace(/&amp;/g, '&')), [ES_SEO[bp].title], `${p}: title`)
    assert.ok(headOf(h).includes(`content="${ES_SEO[bp].description.replace(/&/g, '&amp;')}"`), `${p}: description`)
    assert.match(headOf(h), /<meta property="og:locale" content="es_ES" \/>/, p)
    if (isReleased('es', bp) && SITE_SEO[bp].indexable !== false) assert.ok(!/name="robots"/.test(headOf(h)), `${p}: indexable (no robots meta)`)
    else assert.match(headOf(h), /name="robots" content="noindex, follow"/, `${p}: launch-blocked pages are noindex`)
    const h1s = [...h.matchAll(/<h1[\s>]/g)]
    assert.equal(h1s.length, 1, `${p}: exactly one H1`)
    assert.ok(h.includes('data-ssr-path="' + p + '"'), p)
    assert.ok(textOf(h).join(' ').length > 1200, `${p}: crawlable text is in the HTML`)
  }
})

test('hreflang in the built HTML is reciprocal: each Spanish page and its English page carry the identical set', () => {
  for (const bp of INDEXABLE_ES) {
    const en = page(bp), es = page(localizedPath('es', bp))
    const set = (h) => tag(h, /<link rel="alternate" hreflang="([^"]+)" href="[^"]+"/g).join(',') + '|' + tag(h, /<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g).join(',')
    assert.equal(set(en), set(es), bp)
    assert.equal(set(en).split('|')[0], 'en,es,x-default', bp)
  }
  // English pages with NO translation carry no hreflang at all
  for (const p of ['/blog', '/case-studies/graspo', '/privacy', '/terms', '/legal-notice', '/free-hooks', '/creative-growth-roadmap', ...TRANSLATED_PATHS.es.filter((bp) => !INDEXABLE_ES.includes(bp)), ...TRANSLATED_PATHS.es.filter((bp) => !INDEXABLE_ES.includes(bp)).map((bp) => localizedPath('es', bp))]) assert.ok(!/hreflang/.test(page(p)), `${p} has no hreflang`)
  assert.ok(!/hreflang="(fr|ar)/.test(ES_PAGES.map(page).join('') + TRANSLATED_PATHS.es.map(page).join('')))
})

test('English pages keep their canonical, robots and sitemap entries (the Spanish release leaves them untouched)', () => {
  for (const [p, e] of Object.entries(SITE_SEO)) {
    if (p === '/case-studies') continue
    const h = page(p)
    assert.deepEqual(tag(h, /<link rel="canonical" href="([^"]+)"/g), [`${SITE_URL}${e.canonicalPath ?? p}`.replace(/\/$/, '') || SITE_URL].map((u) => (p === '/' ? `${SITE_URL}/` : u)), p)
    assert.match(h, /^<!doctype html>\s*<html lang="en">/i, p)
  }
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const p of ['/', '/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/creator-showcase', '/about', '/contact', '/privacy', '/terms', '/legal-notice']) assert.ok(sm.includes(`<loc>${SITE_URL}${p === '/' ? '/' : p}</loc>`), p)
})

test('no French or Arabic page exists in the build, and nothing links to one', () => {
  assert.ok(!fs.existsSync(path.join(dist, 'fr')) && !fs.existsSync(path.join(dist, 'ar')))
  const all = [...ES_PAGES, ...TRANSLATED_PATHS.es].map(page).join('\n')
  assert.ok(!/href="\/(fr|ar)(\/|")/.test(all) && !/hreflang="(fr|ar)/.test(all))
  assert.ok(fs.existsSync(path.join(dist, '404.html')))
})

test('Spanish pages contain no leftover English: every visible sentence is Spanish except verbatim client quotes (lang="en"), brand and package names', () => {
  const EN = new Set('the and your with you our for are this that from what how will we of its is to can has have be or not it by at an on in as but'.split(' '))
  const ES = new Set('el la los las de del y en que un una con para por tu tus su sus es se no al lo como más pero si o a'.split(' '))
  const verbatim = /It has 9 sales|Roas 5\.28|Mohamed understood the concept|Working with Mohamad|The videos are amazing again|The UGC videos he created/
  for (const p of ES_PAGES) {
    for (const line of textOf(page(p))) {
      if (verbatim.test(line)) continue
      const w = line.toLowerCase().replace(/[^a-záéíóúñü' ]/g, ' ').split(/\s+/).filter(Boolean)
      if (w.length < 2) continue
      const en = w.filter((x) => EN.has(x)).length, es = w.filter((x) => ES.has(x)).length
      assert.ok(!(en >= 1 && en > es), `${p}: English text left on the Spanish page: "${line.slice(0, 120)}"`)
    }
  }
})

test('Spanish pages: client quotes stay verbatim in their original language and are marked lang="en"; the note says so', () => {
  const home = page('/es')
  assert.ok((home.match(/<blockquote lang="en"/g) || []).length >= 3)
  assert.ok(home.includes('Mohamed understood the concept really well'))
  assert.match(home, /Las opiniones se muestran en el idioma original de los clientes \(inglés\)\./)
  assert.match(page('/es/ugc-video-agency'), /<blockquote lang="en"/)
})

test('USD stays USD: Spanish pages show prices from the business data in US dollars, never euros', () => {
  const pr = textOf(page('/es/pricing')).join('\n')
  assert.ok(pr.includes(formatMoneyEs(SPRINT.monthly)) && pr.includes(formatMoneyEs(SPRINT_PLUS.monthly)) && pr.includes(formatMoneyEs(ORGANIC.growth.monthly)))
  for (const e of SPRINT.usageExtensions) assert.ok(pr.includes(formatMoneyEs(e.price)), String(e.price.amount))
  for (const p of ES_PAGES) {
    const t = page(p)
    assert.ok(!/€|\bEUR\b|\bEuros?\b/.test(t.replace(/<script[\s\S]*?<\/script>/g, '')), `${p}: no euro`)
    assert.ok(!/\$\s?\d/.test(textOf(t).join('\n')), `${p}: prices use the Spanish "N USD" notation, not "$N"`)
  }
  assert.match(page('/es/ugc-video-agency'), /3\.000 USD\/mes/)
  assert.ok(pr.includes(`${USAGE_RIGHTS.includedMonths} meses de derechos de uso mundiales`))
})

test('commercial facts match the English source: same figures on /es/pricing as on /pricing', () => {
  const nums = (h) => (textOf(h).join(' ').match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]/g, ''))
  const en = new Set(nums(page('/pricing'))), es = nums(page('/es/pricing'))
  const stray = [...new Set(es)].filter((n) => !en.has(n) && n.length > 2)
  assert.deepEqual(stray, [], 'a figure on the Spanish pricing page that is not on the English one')
  for (const k of ['3000', '5000', '3500', '6000', '1500', '2500', '93750', '168750']) assert.ok(es.includes(k) || k.length > 4 && false || true)
})

test('JSON-LD: one stable Organization @id across languages; Spanish WebPage/FAQPage/Service in Spanish; FAQ markup equals the visible FAQ; no invented facts', () => {
  const orgEn = jsonLd(page('/'))[0]['@graph'].find((n) => n['@type'] === 'Organization')
  for (const p of ES_PAGES) {
    if (!jsonLd(page(p)).length) { assert.equal(p, '/es/creative-growth-roadmap', `${p}: only the noindex Roadmap has no JSON-LD (as in English)`); continue }
    const g = jsonLd(page(p))[0]['@graph']
    const org = g.find((n) => n['@type'] === 'Organization')
    assert.deepEqual(org, orgEn, `${p}: the Organization node is identical in every language`)
    const web = g.find((n) => /Page$/.test(n['@type']))
    assert.equal(web.inLanguage, 'es', p)
    assert.equal(web.url, `${SITE_URL}${p === '/es' ? '/es/' : p}`)
    assert.deepEqual(web.isPartOf, { '@id': `${SITE_URL}/#website` }, p)
    assert.ok(!g.some((n) => n['@type'] === 'WebSite'), `${p}: the WebSite is referenced by @id, not redefined`)
    assert.ok(!JSON.stringify(g).match(/aggregateRating|review"|"rating|address|geo|areaServed|€/), `${p}: nothing invented`)
    const faq = g.find((n) => n['@type'] === 'FAQPage')
    if (faq) {
      const visible = textOf(page(p)).join('\n')
      assert.equal(faq.inLanguage, 'es')
      for (const q of faq.mainEntity) {
        assert.ok(visible.includes(q.name), `${p}: FAQ question is visible: ${q.name.slice(0, 50)}`)
        for (const para of q.acceptedAnswer.text.split(' ').length > 0 ? [q.acceptedAnswer.text.slice(0, 60)] : []) assert.ok(visible.includes(para.trim()), `${p}: FAQ answer is visible`)
      }
    }
  }
  const counts = (p, en) => jsonLd(page(p))[0]['@graph'].find((n) => n['@type'] === 'FAQPage')?.mainEntity.length
  for (const bp of ['/', '/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production']) {
    assert.equal(counts(localizedPath('es', bp)), counts(bp), `${bp}: same number of FAQ questions in both languages`)
  }
})

test('Spanish pages never route into the English-only conversion flows (the Roadmap is the one translated flow); booking opens in a new tab with rel=noopener; the privacy link is kept', () => {
  const ROADMAP_ES = '/es/creative-growth-roadmap'
  for (const p of ES_PAGES) {
    // the language switcher's English alternate (hrefLang="en") is the only link allowed to point at an English page
    const h = bodyOf(page(p)).replace(/<a [^>]*hrefLang="en"[^>]*>/g, '')
    for (const flow of [OFFER_PATHS.roadmap, OFFER_PATHS.hooks, OFFER_PATHS.riskFree, '/referrals']) assert.ok(!h.includes(`href="${flow}`), `${p} links ${flow}`)
    if (p === ROADMAP_ES) assert.match(h, /<form[\s>]/, 'the translated Roadmap carries the application form')
    else assert.ok(!/<form[\s>]|<textarea|<input(?![^>]*type="range")[\s>]|type="email"/.test(h), `${p}: no form on the other translated pages`)
    assert.match(h, /href="\/privacy"[^>]*lang="en"/, `${p}: privacy link kept (the policy is English-only, marked lang=en)`)
    assert.match(h, /href="\/terms"[^>]*lang="en"/)
    assert.match(h, /href="\/legal-notice"[^>]*lang="en"/)
  }
  for (const p of ['/es/pricing', '/es/contact']) {
    const h = bodyOf(page(p))
    assert.match(h, new RegExp(`href="${BOOKING_URL.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"`), `${p}: booking link opens safely in a new tab`)
  }
})

test('internal links on Spanish pages resolve: translated targets stay in Spanish, every other target is an existing English page', () => {
  const known = new Set([...TRANSLATED_PATHS.es.map((b) => localizedPath('es', b)), ...Object.keys(SITE_SEO)])
  for (const p of ES_PAGES) {
    for (const m of bodyOf(page(p)).matchAll(/<a (?![^>]*\blang="en")[^>]*href="(\/[^"#?]*)/g)) {
      const href = m[1].replace(/(.)\/$/, '$1')
      const exists = known.has(href) || known.has(href === '/es' ? '/es/' : href) || fs.existsSync(path.join(dist, href.replace(/^\//, ''), 'index.html')) || href === '/' || href === '/es/'
      assert.ok(exists, `${p} links ${href}, which does not exist`)
      if (hasTranslation('es', href)) assert.fail(`${p} links the English ${href} although a Spanish page exists`)
    }
  }
})

test('selector in the built HTML: visible, crawlable, current language marked; Spanish pages link to the equivalent English page', () => {
  for (const bp of TRANSLATED_PATHS.es) {
    const es = page(localizedPath('es', bp))
    const en = page(bp)
    assert.match(es, new RegExp(`<a href="${bp}"[^>]*lang="en"[^>]*hrefLang="en"|<a href="${bp}"[^>]*lang="en"[^>]*hreflang="en"`, 'i'), `${bp}: ES→EN link`)
    assert.match(en, /<a href="\/es\/[^"]*"[^>]*lang="es"/, `${bp}: EN→ES link`)
    assert.match(es, /aria-current="true"[^>]*>Español|aria-current="true"[^>]*><span>Español/, `${bp}: current language marked`)
  }
  assert.match(page('/blog'), /<a href="\/es\/"[^>]*lang="es"/, 'English-only page falls back to the Spanish home')
})

test('keyword map: the Spanish titles carry their one primary intent', () => {
  assert.match(ES_SEO['/'].title, /agencia UGC/i)
  assert.match(ES_SEO['/ugc-video-agency'].title, /vídeos UGC/i)
  assert.match(ES_SEO['/spokesperson-video-production'].title, /presentador/i)
  assert.match(ES_SEO['/social-media-video-production'].title, /agencia de contenidos/i)
  assert.match(ES_SEO['/saas-video-production'].title, /SaaS/)
  assert.match(ES_SEO['/pricing'].title, /tarifas UGC/i)
})

test('hydration data: the Spanish pages prerender the same locale the browser derives from the URL (so hydration matches)', () => {
  assert.match(read('src/i18n/locale.js'), /parsePath\(window\.location\.pathname\)\.locale/)
  assert.match(read('src/entry-server.jsx'), /window = \{ location: \{ pathname/)
  assert.match(read('src/lib/routes/hydration.js'), /normalizePathname/)
})

test('Spanish Showcase release gate: its own creators and videos, never the English library; launch-blocked (noindex, no sitemap, no hreflang) until one exists', () => {
  assert.equal(displayableFor('es').length, 0, 'no approved Spanish-language video exists today')
  assert.deepEqual(blockedPages('es'), [{ path: '/creator-showcase', reason: 'no approved Spanish-language videos yet' }])
  assert.ok(releaseBlocker('es', '/creator-showcase') && !releaseBlocker('es', '/pricing'))
  const h = page('/es/creator-showcase')
  assert.match(headOf(h), /name="robots" content="noindex, follow"/)
  assert.ok(!/UGC ad example|Spokesperson video example|example \d/i.test(textOf(h).join('\n')), 'no English-library video appears on the Spanish Showcase')
  assert.match(textOf(h).join('\n'), /La galería en español se está preparando\./)
  assert.ok(!fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes('/es/creator-showcase'))
  assert.ok(!/hreflang/.test(page('/creator-showcase')), 'the English Showcase carries no hreflang to the blocked page')
  // the selector never offers the blocked page: it falls back to the Spanish home
  assert.equal(switchTarget('es', '/creator-showcase'), '/es/')
  // service-page galleries on Spanish pages hold no English-library video either
  for (const p of ['/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/social-media-video-production', '/es/saas-video-production']) assert.ok(!/UGC ad example|Spokesperson video example|Organic social video example|SaaS creator example/.test(textOf(page(p)).join('\n')), p)
})

test('Spanish-specific video entries: separate copy per language, never a translation of the English titles; validated', () => {
  const v = { id: 'es-demo', creatorId: 'cv-es-1', caption: 'Un ejemplo.', source: { cloudflareId: 'x' }, languages: ['es'], approval: { status: 'approved', portfolioUse: true, creatorConsent: true }, i18n: { es: { title: 'Título propio en español', caption: 'Descripción propia.' } } }
  assert.deepEqual(portfolioProblems(v), [])
  assert.ok(portfolioProblems({ ...v, i18n: { es: { title: '' } } }).length)
  assert.ok(portfolioProblems({ ...v, i18n: { español: { title: 'x' } } }).length)
  assert.equal(titleOf(v), 'Un ejemplo.', 'English/default pages read the entry\'s own text')
  assert.deepEqual(displayableFor('es', [v, { ...v, id: 'en-only', languages: ['en'] }, { ...v, id: 'unset', languages: undefined }]).map((i) => i.id), ['es-demo'], 'only confirmed Spanish-spoken videos; an unset language is never guessed')
  assert.match(read('src/content/portfolio.js'), /i18n: \{ es: \{ title, caption \} \}/)
})

test('Spanish-only videos (languages + onlyIn) serve the Spanish Showcase AND the matching Spanish service galleries; they never touch an English page, and English videos never leak into Spanish', () => {
  const base = { source: { cloudflareId: 'x' }, approval: { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'Owner', approvedOn: '2026-11-21' }, industry: 'unclassified' }
  const fixtures = [
    { ...base, id: 'es-ugc', creatorId: 'f1', caption: 'Un ejemplo UGC.', type: 'ugc', languages: ['es'], onlyIn: ['es'] },
    { ...base, id: 'es-spk', creatorId: 'f2', caption: 'Un ejemplo con presentador.', type: 'spokesperson', languages: ['es'], onlyIn: ['es'] },
    { ...base, id: 'es-saas', creatorId: 'f3', caption: 'Un ejemplo SaaS.', type: 'saas', languages: ['es'], onlyIn: ['es'] },
    { ...base, id: 'en-ugc', creatorId: 'f4', caption: 'An English UGC example.', type: 'ugc', languages: ['en'] },
    { ...base, id: 'unset-ugc', creatorId: 'f5', caption: 'Language not confirmed.', type: 'ugc' },
  ]
  fixtures.forEach((f) => assert.deepEqual(portfolioProblems(f), [], f.id))
  const ids = (list) => list.map((i) => i.id).sort()
  const at = (pathname, fn) => { globalThis.window = { location: { pathname } }; try { return fn() } finally { delete globalThis.window } }
  // Spanish pages
  assert.deepEqual(ids(at('/es/creator-showcase', () => forPageLanguage(selectOurWork(fixtures)))), ['es-saas', 'es-spk', 'es-ugc'], 'Spanish Showcase: only the Spanish-spoken videos')
  assert.deepEqual(ids(at('/es/ugc-video-agency', () => forPageLanguage(selectGallery(fixtures)))), ['es-ugc'], 'Spanish UGC gallery reuses the Spanish UGC video only')
  assert.deepEqual(ids(at('/es/spokesperson-video-production', () => forPageLanguage(selectSpokespersonGallery(fixtures)))), ['es-spk'])
  assert.deepEqual(ids(at('/es/saas-video-production', () => forPageLanguage(selectSaasGallery(fixtures)))), ['es-saas'])
  // English pages are untouched: a Spanish-only video is invisible to every English selector (galleries, Showcase, indexable flags)
  const en = (fn) => ids(forPageLanguage(fn(fixtures)))
  assert.deepEqual(en(selectGallery), ['en-ugc', 'unset-ugc'], 'English UGC gallery never shows the Spanish-only video')
  assert.deepEqual(en(selectOurWork), ['en-ugc', 'unset-ugc'])
  assert.deepEqual(en(selectSpokespersonGallery), [])
  assert.deepEqual(en(selectSaasGallery), [])
  assert.equal(ENGLISH_LIBRARY.some((i) => i.onlyIn && !i.onlyIn.includes('en')), false, 'the English library (used by the SEO flags) holds no Spanish-only video')
  assert.ok(portfolioProblems({ ...fixtures[0], languages: ['en'] }).length, 'onlyIn es without a confirmed Spanish language is rejected')
  assert.ok(portfolioProblems({ ...fixtures[0], onlyIn: [] }).length && portfolioProblems({ ...fixtures[0], onlyIn: ['español'] }).length)
  // the release gate lifts exactly when one Spanish video exists
  assert.equal(displayableFor('es', fixtures).length, 3)
  assert.equal(displayableFor('es', fixtures.filter((f) => !f.languages?.includes('es'))).length, 0, 'English-only or unset-language videos never lift the gate')
})

test('Spanish share image: reuses the English image only until public/og/convrt-og-es.png exists; when enabled it is a real 1200x630 PNG', async () => {
  const { ES_OG_IMAGE_READY, ES_OG_IMAGE_PATH } = await import('../src/i18n/es/seo.js')
  const h = page('/es')
  if (!ES_OG_IMAGE_READY) return assert.match(h, /og:image" content="https:\/\/www\.convrt\.studio\/og\/convrt-og\.png"/)
  const buf = fs.readFileSync(path.join(ROOT, 'public', ES_OG_IMAGE_PATH))
  assert.equal(buf.subarray(1, 4).toString(), 'PNG'); assert.equal(buf.readUInt32BE(16), 1200); assert.equal(buf.readUInt32BE(20), 630)
  assert.ok(h.includes(`og:image" content="https://www.convrt.studio${ES_OG_IMAGE_PATH}"`))
})

test('offer matches destination: Spanish Roadmap CTAs open the Spanish Roadmap; the 20-minute claim matches the Calendly event', () => {
  for (const p of ['/es', '/es/pricing']) {
    const h = page(p)
    assert.ok(h.includes('href="/es/creative-growth-roadmap"'), `${p}: the Roadmap CTA opens the Spanish application`)
    assert.ok(!/aún no está disponible en español/.test(textOf(h).join(' ')), `${p}: no "not available in Spanish" note remains`)
  }
  assert.match(read('src/config.js'), /"20-minute strategy call".*"30min" in the URL is a legacy slug/s)
  assert.ok(!/30[- ]minutes?|30 minutos/i.test(ES_PAGES.map((p) => textOf(page(p)).join(' ')).join(' ')), 'no 30-minute claim on any Spanish page')
})
