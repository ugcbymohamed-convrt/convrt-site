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
import { LINK_LABEL_OVERRIDES } from '../src/i18n/es/dict-casestudies.js'
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
import { isPricingApproved, pricingConfig, pricingProblems } from '../src/i18n/pricing.js'
import { ES_PRICED_PAGES } from '../src/i18n/es/pricing.js'
import { money } from '../src/i18n/money.js'
import { displayableFor, titleOf, portfolioProblems, forPageLanguage, selectOurWork, selectGallery, selectSpokespersonGallery, selectSaasGallery, selectHero, selectSaasHero, selectOrganicHero, isDisplayable, ENGLISH_LIBRARY } from '../src/content/portfolio.js'
import { HOME_HERO, HOME_HERO_ES } from '../src/content/homeHero.js'

// Pages that are built AND released (the Spanish Showcase is launch-blocked until Spanish-language videos exist).
const RELEASED_ES = TRANSLATED_PATHS.es.filter((bp) => isReleased('es', bp))
// Released AND indexable: only these get hreflang and a sitemap entry (the Roadmap is a paid-traffic landing page, noindex in English, so its Spanish twin follows).
const INDEXABLE_ES = RELEASED_ES.filter((bp) => SITE_SEO[bp].indexable !== false && !SITE_SEO[bp].canonicalPath) // a duplicate (/case-studies) is never in the sitemap or hreflang

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
  assert.deepEqual(allLocalizedPaths(['es']), ['/es', '/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/social-media-video-production', '/es/saas-video-production', '/es/pricing', '/es/creator-showcase', '/es/about', '/es/contact', '/es/case-studies', '/es/case-studies/graspo', '/es/case-studies/elyon', '/es/creative-growth-roadmap', '/es/risk-free-trial'])
})

test('every translated path is a real English page with SEO data and a Spanish title/description/OG copy', () => {
  for (const bp of TRANSLATED_PATHS.es) {
    assert.ok(SITE_SEO[bp], `${bp} has English SEO data`)
    // /case-studies is the duplicate of the default study (it canonicalises to /case-studies/graspo): it has no head of its own, in either language
    if (SITE_SEO[bp].canonicalPath) { assert.equal(ES_SEO[bp], undefined, `${bp} is a duplicate: no Spanish SEO entry of its own`); continue }
    const e = ES_SEO[bp]
    assert.ok(e && e.title && e.description, `${bp} has Spanish SEO copy`)
    assert.ok(e.title.length <= 66, `${bp} title is not truncated in search results (${e.title.length})`)
    assert.ok(e.description.length >= 90 && e.description.length <= 200, `${bp} description length ${e.description.length}`)
    assert.notEqual(e.title, SITE_SEO[bp].title)
    assert.notEqual(e.description, SITE_SEO[bp].description)
  }
  assert.equal(new Set(Object.values(ES_SEO).map((e) => e.title)).size, Object.keys(ES_SEO).length, 'unique Spanish titles')
  assert.equal(new Set(Object.values(ES_SEO).map((e) => e.description)).size, Object.keys(ES_SEO).length, 'unique Spanish descriptions')
  assert.deepEqual(Object.keys(ES_SEO).sort(), TRANSLATED_PATHS.es.filter((bp) => !SITE_SEO[bp].canonicalPath).sort(), 'no Spanish SEO entry exists for a page that is not translated')
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
  const onAbout = languageOptions('en', '/about')
  assert.deepEqual(onAbout.map((o) => [o.code, o.href, o.exact]), [['en', '/about', true], ['es', '/es/about', true]])
  // while the Spanish EUR prices are not approved the Spanish pricing page is launch-blocked, so the selector falls back to the Spanish home
  const onPricing = languageOptions('en', '/pricing')
  assert.deepEqual(onPricing.map((o) => [o.code, o.href, o.exact]), isPricingApproved('es') ? [['en', '/pricing', true], ['es', '/es/pricing', true]] : [['en', '/pricing', true], ['es', '/es/', false]])
  const onBlog = languageOptions('en', '/blog')
  assert.deepEqual(onBlog.map((o) => [o.code, o.href, o.exact]), [['en', '/blog', true], ['es', '/es/', false]], 'an English-only page falls back to the Spanish home')
  assert.equal(switchTarget('es', '/case-studies/graspo'), '/es/case-studies/graspo', 'the case studies exist in Spanish now')
  assert.equal(switchTarget('es', '/blog'), '/es/', 'an English-only page still falls back to the Spanish home')
  assert.equal(switchTarget('en', '/pricing'), '/pricing')
  assert.equal(switchTarget('en', '/about'), '/about')
  assert.equal(languageOptions('es', '/about').find((o) => o.current).code, 'es')
  assert.deepEqual(languageOptions('en', '/').map((o) => o.label), ['English', 'Español'], 'native names; French and Arabic are not offered until they are live')
  for (const o of languageOptions('en', '/about')) assert.ok(o.code === 'en' || hasTranslation(o.code, '/about'))
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
      if (seen.has(k) && part === 'casestudies' && k in LINK_LABEL_OVERRIDES) { assert.ok(!/\(en inglés\)/.test(v), `override "${k.slice(0, 40)}" must drop the old English-only label`); seen.set(k, v); continue }
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
    // prices are not typed in Spanish: the English key's $ amounts become {{price:…}} tokens resolved from the Spanish pricing configuration
    const priced = /\{\{[^}]+\}\}/.test(v)
    assert.equal(priced ? digits(v.replace(/\{\{[^}]+\}\}/g, '')) : digits(v), priced ? digits(k.replace(/\$[\d,.]+/g, '')) : digits(k), `figures differ between\n  ${k}\n  ${v}`)
    checked++
  }
  assert.ok(checked > 40, `checked ${checked} figure-bearing strings`)
})

test('Spanish money: EUR notation "3.000 €" (non-breaking space), USD kept only for a client\'s real reported figure; no CONVRT USD price can reach a Spanish page', () => {
  const NB = '\u00a0'
  assert.equal(formatMoneyEs({ amount: 3000, currency: 'EUR' }), `3.000${NB}€`)
  assert.equal(formatMoneyEs({ amount: 937.5, currency: 'EUR' }), `937,50${NB}€`)
  assert.equal(formatMoneyEs({ amount: 1234567, currency: 'EUR' }), `1.234.567${NB}€`)
  assert.equal(formatMoneyEs({ amount: 3421.25, currency: 'USD' }), `3.421,25${NB}USD`)
  assert.throws(() => formatMoneyEs({ amount: 1, currency: 'GBP' }))
  assert.throws(() => money({ amount: 3000, currency: 'USD' }, 'es'), /no key/, 'a USD price object that is not in PRICE_ITEMS is refused for Spanish, never shown in dollars')
  assert.equal(money(SPRINT.monthly, 'en'), '$3,000', 'English is untouched')
  assert.equal(localizeStat('es', '1,200+'), '1.200+'); assert.equal(localizeStat('es', '10.7M'), '10,7 M'); assert.equal(localizeStat('en', '10.7M'), '10.7M')
})

test('conversion flows: the Roadmap and the 1 FREE video application are translated for Spanish; the 10 free hooks and referrals stay English-only (never promoted in Spanish); French and Arabic have none', () => {
  for (const l of ['fr', 'ar']) for (const f of ['roadmap', 'riskFree', 'hooks', 'referrals']) assert.equal(LOCALIZED_FLOWS[l][f], false, `${l}.${f}`)
  assert.equal(LOCALIZED_FLOWS.es.roadmap, true)
  assert.equal(LOCALIZED_FLOWS.es.riskFree, true)
  for (const f of ['hooks', 'referrals']) assert.equal(LOCALIZED_FLOWS.es[f], false, `es.${f}`)
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
    const bp = SITE_SEO[baseOf(p)].canonicalPath ?? baseOf(p) // /es/case-studies is the Spanish default study: it carries that study's head and canonicalises to it
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
  for (const p of ['/blog', '/privacy', '/terms', '/legal-notice', '/free-hooks', '/creative-growth-roadmap', ...TRANSLATED_PATHS.es.filter((bp) => !INDEXABLE_ES.includes(bp)), ...TRANSLATED_PATHS.es.filter((bp) => !INDEXABLE_ES.includes(bp)).map((bp) => localizedPath('es', bp))]) assert.ok(!/hreflang/.test(page(p)), `${p} has no hreflang`)
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

// The owner's FINAL approved Spanish-market EUR prices (2026-11-21). Pinned here so a change to src/i18n/es/pricing.js cannot slip through without a deliberate test edit.
const APPROVED_EUR = { 'sprint.monthly': 2750, 'sprint.oneOff': 3250, 'sprint.ext3': 850, 'sprint.ext6': 1375, 'sprint.ext12': 2400, 'sprintPlus.monthly': 4600, 'sprintPlus.oneOff': 5500, 'sprintPlus.ext3': 1550, 'sprintPlus.ext6': 2500, 'sprintPlus.ext12': 4350, rawFootage: 225, 'organicLight.monthly': 1400, 'organicGrowth.monthly': 2300 }
const eurText = (n) => formatMoneyEs({ amount: n, currency: 'EUR' })

test('Spanish prices are the owner-approved EUR amounts: shown everywhere a price appears, no placeholder, no USD package price, EUR Offers, pricing gates lifted, other gates intact', () => {
  const cfg = pricingConfig('es')
  assert.deepEqual(pricingProblems(cfg), [], 'the Spanish pricing configuration is valid')
  assert.equal(cfg.currency, 'EUR'); assert.equal(cfg.status, 'approved'); assert.equal(cfg.approvedOn, '2026-11-21')
  assert.deepEqual(cfg.amounts, APPROVED_EUR, 'the 13 approved amounts')
  assert.ok(isPricingApproved('es'))
  for (const p of ES_PAGES) {
    const h = page(p), t = textOf(h).join('\n')
    assert.ok(!t.includes(cfg.placeholder), `${p}: no price placeholder`)
    assert.ok(!/\$\s?\d/.test(t), `${p}: no "$N" amount`)
    // the only dollars on a Spanish page are a client's real reported result (UGC page) and the Roadmap's ad-spend answer brackets (qualification thresholds, unchanged)
    const usd = t.match(/[\d.,]+ ?\s?USD|dólar/g) ?? []
    assert.ok(usd.every((u) => (p === '/es/ugc-video-agency' && /3\.421,25/.test(u)) || (/^\/es\/case-studies/.test(p) && /^(0|229,89|835|3\.421,25) ?\s?USD$/.test(u.trim())) || (['/es/creative-growth-roadmap', '/es/risk-free-trial'].includes(p) && /^(5|20)\.000/.test(u))), `${p}: USD left on a Spanish page: ${usd}`)
    assert.ok(!/"priceCurrency":"USD"/.test(h), `${p}: no USD price in JSON-LD`)
  }
  // /es/pricing: every approved amount and the derived per-variation figures
  const pt = textOf(page('/es/pricing')).join('\n')
  for (const [k, n] of Object.entries(APPROVED_EUR)) assert.ok(pt.includes(eurText(n)), `/es/pricing shows ${k} = ${eurText(n)}`)
  for (const n of [183, 217, 153]) assert.ok(pt.includes(eurText(n)), `per-variation ${n}`) // 2750/15, 3250/15, 4600/30 (= 5500/30 = 183)
  assert.match(pt, /no incluyen IVA|sin IVA|excluyen el IVA/, 'VAT wording kept')
  // spokesperson / organic / UGC pages carry the EUR figures from the same configuration
  assert.ok(textOf(page('/es/spokesperson-video-production')).join('\n').includes(eurText(2750)))
  assert.ok(textOf(page('/es/social-media-video-production')).join('\n').includes(eurText(1400)))
  assert.ok(textOf(page('/es/ugc-video-agency')).join('\n').includes(eurText(2750)))
  // metadata
  assert.match(headOf(page('/es/ugc-video-agency')), new RegExp(`desde ${eurText(2750).replace(' ', ' ')}/mes`))
  assert.match(ES_SEO['/pricing'].description, /precios claros en euros/)
  // Offers: EUR, exactly the approved amounts
  const offers = JSON.stringify(jsonLd(page('/es/pricing'))[0]['@graph'])
  const prices = [...offers.matchAll(/"price":([\d.]+),"priceCurrency":"(\w+)"/g)].map((m) => [Number(m[1]), m[2]])
  assert.ok(prices.every(([, c]) => c === 'EUR'))
  assert.deepEqual(prices.map(([n]) => n).sort((a, b) => a - b), [225, 1400, 2300, 2750, 3250, 4600, 5500])
  // pricing gates lifted: indexable, hreflang, sitemap; unrelated gates untouched
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const bp of ES_PRICED_PAGES) {
    assert.equal(releaseBlocker('es', bp), null, `${bp}: released`)
    assert.ok(!/name="robots"/.test(headOf(page(localizedPath('es', bp)))), `${bp}: indexable`)
    assert.ok(sm.includes(localizedPath('es', bp)) && /hreflang="es"/.test(page(bp)), `${bp}: sitemap + hreflang`)
  }
  assert.equal(releaseBlocker('es', '/creator-showcase'), null, 'the Spanish Showcase gate lifted because approved Spanish videos exist (see its own test)')
  assert.deepEqual(blockedPages('es').map((b) => b.path), ['/risk-free-trial'], 'the only gate left is the Spanish free-video page, held for owner/legal review')
  // English is untouched: USD notation from the business data, no euro sign
  const en = textOf(page('/pricing')).join('\n')
  assert.match(en, /\$3,000/); assert.ok(!/€/.test(en))
})

test('commercial facts match the English source: the Spanish pricing page carries the same non-price figures as /pricing (deliverables, months, days, rounds)', () => {
  // prices differ by design (USD vs approved EUR): strip them, then every remaining figure on the Spanish page must exist on the English one
  const nums = (t, priceRe) => (t.replace(priceRe, ' ').match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]/g, ''))
  const en = new Set(nums(textOf(page('/pricing')).join(' '), /\$[\d,.]+/g)), es = nums(textOf(page('/es/pricing')).join(' '), /[\d.,]+ €/g)
  const stray = [...new Set(es)].filter((n) => !en.has(n) && n.length > 2)
  assert.deepEqual(stray, [], 'a figure on the Spanish pricing page that is not on the English one')
})

test('JSON-LD: one stable Organization @id across languages; Spanish WebPage/FAQPage/Service in Spanish; FAQ markup equals the visible FAQ; no invented facts', () => {
  const orgEn = jsonLd(page('/'))[0]['@graph'].find((n) => n['@type'] === 'Organization')
  for (const p of ES_PAGES) {
    if (!jsonLd(page(p)).length) { assert.ok(['/es/creative-growth-roadmap', '/es/risk-free-trial'].includes(p), `${p}: only the noindex Roadmap and free-video pages have no JSON-LD (as in English)`); continue }
    const g = jsonLd(page(p))[0]['@graph']
    const org = g.find((n) => n['@type'] === 'Organization')
    assert.deepEqual(org, orgEn, `${p}: the Organization node is identical in every language`)
    const web = g.find((n) => /Page$/.test(n['@type']))
    assert.equal(web.inLanguage, 'es', p)
    assert.equal(web.url, `${SITE_URL}${p === '/es' ? '/es/' : p === '/es/case-studies' ? '/es/case-studies/graspo' : p}`)
    assert.deepEqual(web.isPartOf, { '@id': `${SITE_URL}/#website` }, p)
    assert.ok(!g.some((n) => n['@type'] === 'WebSite'), `${p}: the WebSite is referenced by @id, not redefined`)
    assert.ok(!JSON.stringify(g.filter((n) => n['@type'] !== 'Organization')).match(/aggregateRating|review"|"rating|address|geo|areaServed/), `${p}: nothing invented (the Organization node, incl. its country-only address, is asserted identical to English above)`)
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
  const FORM_PAGES = ['/es/creative-growth-roadmap', '/es/risk-free-trial']
  for (const p of ES_PAGES) {
    // the language switcher's English alternate (hrefLang="en") is the only link allowed to point at an English page
    const h = bodyOf(page(p)).replace(/<a [^>]*hrefLang="en"[^>]*>/g, '')
    for (const flow of [OFFER_PATHS.roadmap, OFFER_PATHS.hooks, OFFER_PATHS.riskFree, '/referrals']) assert.ok(!h.includes(`href="${flow}`), `${p} links ${flow}`)
    if (FORM_PAGES.includes(p)) assert.match(h, /<form[\s>]/, `${p}: the translated application form`)
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

test('Spanish Showcase release gate: it lifts only because approved Spanish-spoken videos exist; the gate still holds without them; English pages never see them', () => {
  assert.equal(displayableFor('es').length, 18, 'the 18 owner-approved Spanish videos')
  assert.equal(releaseBlocker('es', '/creator-showcase'), null, 'the gate lifted by itself')
  assert.equal(displayableFor('es', PORTFOLIO.filter((v) => !(v.languages ?? []).includes('es'))).length, 0, 'without Spanish-spoken videos the same rule would block the page again')
  const h = page('/es/creator-showcase')
  assert.ok(!/name="robots"/.test(headOf(h)), 'indexable')
  assert.ok(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes('/es/creator-showcase'), 'in the sitemap')
  assert.match(page('/creator-showcase'), /hreflang="es"/, 'reciprocal hreflang from the English Showcase')
  assert.match(h, /hreflang="en"/)
  assert.equal(switchTarget('es', '/creator-showcase'), '/es/creator-showcase', 'the selector now offers the equivalent page')
  const labels = h.match(/aria-label="Reproducir vídeo: [^"]*"/g) ?? []
  assert.equal(labels.length, 12, 'first page of the library (12), with "Mostrar más" for the other 6')
  assert.ok(!/UGC ad example|Spokesperson video example|example \d/i.test(textOf(h).join('\n')), 'no English-library video appears on the Spanish Showcase')
  // the English Showcase and English service pages never show a Spanish-only video
  for (const p of ['/creator-showcase', '/ugc-video-agency', '/spokesperson-video-production', '/']) assert.ok(!/portfolio\/es-/.test(page(p)) && !/es-(ugc|spokesperson)/.test(page(p)), `${p}: no Spanish-only video in English HTML`)
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

// ── Spanish video integration (owner folders ~/Desktop/SPANISH, uploaded to Cloudflare Stream 2026-11-22) ───────────────────────────────────────────
const ES_VIDEOS = PORTFOLIO.filter((v) => v.onlyIn?.includes('es'))
const posters = (h) => [...h.matchAll(/src="(\/portfolio\/[^"]+\.webp)"/g)].map((m) => m[1])
const cards = (h) => [...h.matchAll(/(?:aria-label="Reproducir vídeo: ([^"]*)"|alt="([^"]*)")/g)].map((m) => m[1] ?? m[2])

test('Spanish videos: 18 approved entries, valid, Spanish-only, opaque creators, no name/brand/credit shown, no invented upload date, real Cloudflare ids and posters', () => {
  assert.equal(ES_VIDEOS.length, 18)
  assert.equal(ES_VIDEOS.filter((v) => v.type === 'ugc').length, 9)
  assert.equal(ES_VIDEOS.filter((v) => v.type === 'spokesperson').length, 9)
  assert.equal(ES_VIDEOS.filter((v) => v.placement === 'hero').length, 6, 'three hero videos per service page')
  const ids = new Set(), cfs = new Set()
  for (const v of ES_VIDEOS) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.deepEqual(v.languages, ['es']); assert.deepEqual(v.onlyIn, ['es'])
    assert.ok(isDisplayable(v), `${v.id}: approved`)
    assert.equal(v.approval.approvedOn, '2026-11-22')
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/, v.id)
    assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), `${v.id}: poster exists`)
    assert.match(v.creatorId, /^es-c\d\d$/, 'opaque creator id (names are kept privately, outside the repository)')
    assert.ok(!v.creator && !v.brand && !v.productionCredit && !v.uploadDate && v.production === undefined, `${v.id}: no creator name, brand, credit, upload date or production claim`)
    assert.ok(!ids.has(v.id) && !cfs.has(v.source.cloudflareId), `${v.id}: no duplicate`); ids.add(v.id); cfs.add(v.source.cloudflareId)
    assert.ok(v.title && v.caption.endsWith('.') && !/[A-Z][a-z]+ [A-Z]/.test(v.title.replace(/^[A-ZÁÉÍÓÚ]\S+ /, '')), `${v.id}: factual Spanish title`)
  }
  // the whole repository carries no creator name from the owner's folders
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  const repoText = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'docs')), ...walk(path.join(ROOT, 'tests'))].filter((f) => /\.(jsx?|mjs|md|csv)$/.test(f) && !f.endsWith('i18n.test.mjs')).map((f) => fs.readFileSync(f, 'utf8')).join('\n')
  for (const n of ['Ainhoa', 'Nacar', 'Blázquez', 'Badenes', 'Badia Benlloch']) assert.ok(!repoText.includes(n), `creator name "${n}" must stay out of the repository`)
})

test('Spanish homepage hero: Front (the Spanish version of the CONVRT ad) in the centre, then the two Spanish videos; English homepage unchanged', () => {
  assert.equal(HOME_HERO_ES.length, 3)
  assert.notEqual(HOME_HERO_ES[0].source.cloudflareId, HOME_HERO[0].source.cloudflareId, 'Front is no longer the English ad')
  assert.equal(HOME_HERO_ES[0].source.cloudflareId, '5904f4189ee4726cb4d7e4272a8b915b', 'Front is the Spanish CONVRT ad (CONVRT_AD_SPANISH_FINAL.mp4)')
  assert.deepEqual(HOME_HERO_ES.map((v) => v.languages), [['es'], ['es'], ['es']])
  const es = page('/es'), en = page('/')
  assert.deepEqual(posters(es).filter((p) => /home-hero|es-ugc/.test(p)), ['/portfolio/es-home-hero.webp', '/portfolio/es-ugc-2.webp', '/portfolio/es-ugc-1.webp'])
  assert.ok(es.includes('aria-label="Vídeos UGC de creadores"'), 'the stage has a Spanish accessible name')
  assert.ok(!/es-ugc|es-home-hero/.test(en) && en.includes('ugc-hero-1.webp') && en.includes('/portfolio/home-hero.webp'), 'the English homepage still shows its own three videos')
})

test('Spanish UGC and Spokesperson pages: hero stage and gallery use ONLY the provided Spanish videos, in the owner\'s order; no English-library video', () => {
  for (const [p, type] of [['/es/ugc-video-agency', 'ugc'], ['/es/spokesperson-video-production', 'spokesperson']]) {
    const h = page(p)
    const mine = ES_VIDEOS.filter((v) => v.type === type)
    const want = mine.map((v) => v.poster)
    const got = posters(h)
    assert.deepEqual(got.filter((x) => /\/portfolio\/es-/.test(x)).slice(0, 3), want.slice(0, 3), `${p}: hero stage, first video is the centre phone`)
    for (const v of mine) assert.ok(h.includes(v.poster), `${p}: shows ${v.id}`)
    assert.ok(!got.some((x) => !/\/portfolio\/es-/.test(x) && /ugc-|spokesperson-|creator-|saas-|organic-/.test(x)), `${p}: no English-library poster`)
    assert.ok(!/\/portfolio\/es-spokesperson/.test(page('/es/ugc-video-agency')), 'spokesperson videos never appear on the UGC page')
    assert.ok(!/\/portfolio\/es-ugc/.test(page('/es/spokesperson-video-production')), 'UGC videos never appear on the Spokesperson page')
    assert.match(h, /aria-roledescription="carousel"/, `${p}: the video-led hero stage`)
    assert.equal(cards(h).filter((c) => mine.some((v) => c === v.caption)).length >= 6, true)
  }
})

test('Spanish SaaS and Organic pages launch without videos: a text-led hero, no phones, no stage, no empty gallery, no placeholder; still indexable with JSON-LD, FAQ and CTAs', () => {
  for (const [p, galleryId] of [['/es/saas-video-production', 'saas-videos'], ['/es/social-media-video-production', 'organic-videos']]) {
    const h = page(p), body = bodyOf(h)
    assert.ok(!/<video/.test(body) && !/videodelivery\.net/.test(body) && !/\.mp4/.test(body), `${p}: no video`)
    assert.ok(!/aria-roledescription="carousel"/.test(body), `${p}: no phone stage`)
    assert.ok(!/aspect-\[9\/19\.5\]/.test(body), `${p}: no empty phone frames`)
    assert.ok(!/\/portfolio\//.test(body), `${p}: no portfolio image of any language`)
    assert.ok(!body.includes(`id="${galleryId}"`), `${p}: the empty gallery section is absent`)
    assert.ok(!/(sample-\d|Vídeos de ejemplo|se está preparando|próximamente)/i.test(textOf(h).join('\n')), `${p}: no placeholder text`)
    assert.match(body, /<section aria-labelledby="[^"]+" class="relative overflow-hidden">[\s\S]*?max-w-5xl[^"]*text-center/, `${p}: the centred text-led hero`)
    assert.equal([...body.matchAll(/<h1[\s>]/g)].length, 1)
    assert.ok(!/name="robots"/.test(headOf(h)), `${p}: indexable`)
    assert.ok(jsonLd(h).length >= 1 && /"FAQPage"/.test(JSON.stringify(jsonLd(h))), `${p}: JSON-LD with the FAQ`)
    assert.ok(body.includes('href="/es/creative-growth-roadmap"') || body.includes('calendly.com'), `${p}: a conversion CTA`)
  }
  // English keeps its (empty-frame) fallback hero: unchanged
  assert.match(bodyOf(page('/saas-video-production')), /aspect-\[9\/19\.5\]/)
})

test('a genuine Spanish video added later brings the stage back on its own (no redesign): text-led only while there is none', () => {
  const src = read('src/components/ugc/UgcHero.jsx')
  assert.match(src, /const textLed = !hasWork && locale !== 'en'/)
  assert.match(read('src/components/ugc/UgcGallery.jsx'), /real\.length === 0 && preview && currentLocale\(\) === 'en'/, 'no stand-in gallery cards on translated pages, even on a Preview')
  const v = (type) => ({ id: `es-fixture-${type}`, creatorId: 'es-c99', caption: 'Un ejemplo.', type, languages: ['es'], onlyIn: ['es'], source: { cloudflareId: 'a'.repeat(32) }, approval: { status: 'approved', portfolioUse: true, creatorConsent: true } })
  for (const [type, sel] of [['saas', selectSaasHero], ['organic', selectOrganicHero]]) {
    const item = { ...v(type), placement: 'hero' }
    assert.equal(forPageLanguageAt('/es/x', () => sel([item])).length, 1, `${type}: a Spanish-only video reaches the Spanish page`)
    assert.equal(sel([item]).length, 0, `${type}: and never the English page`)
  }
})
const forPageLanguageAt = (pathname, fn) => { globalThis.window = { location: { pathname } }; try { return forPageLanguage(fn()) } finally { delete globalThis.window } }

test('Spanish structured data stays factual: no VideoObject (no upload dates exist), JSON-LD valid, no Roadmap/Offer change', () => {
  for (const p of ES_PAGES) assert.ok(!/"VideoObject"/.test(page(p)), `${p}: no VideoObject for videos without a recorded upload date`)
  const offers = JSON.stringify(jsonLd(page('/es/pricing'))[0]['@graph'])
  assert.deepEqual([...offers.matchAll(/"price":([\d.]+),"priceCurrency":"(\w+)"/g)].map((m) => `${m[1]} ${m[2]}`).sort(), ['1400 EUR', '2300 EUR', '2750 EUR', '3250 EUR', '4600 EUR', '5500 EUR', '225 EUR'].sort())
})


// ── Spanish homepage copy, terminology, CTAs, free-video offer, hooks ──────────────────────────────────────────────────────────────────────────────
test('Spanish homepage: approved copy, one-line short CTA (hero and navigation), 3-line final headline, terminology rules', () => {
  const h = page('/es'), t = textOf(h).join('\n'), body = bodyOf(h)
  assert.match(t, /Creativos de alto rendimiento\ndiseñados para\nconvertir/)
  assert.match(t, /Producimos anuncios UGC con personas reales, vídeos para SaaS, vídeos Spokesperson y contenido orgánico para redes sociales\. Creativos listos para testear\./)
  assert.match(t, /Tus próximos 5 conceptos publicitarios, a medida de tu marca\s*\ny por nuestra cuenta\./)
  assert.equal((body.match(/>5 conceptos gratis</g) ?? []).length >= 2 || (t.match(/^5 conceptos gratis$/gm) ?? []).length >= 3, true, 'the short label is used in the navigation, the hero and the other 5-concepts CTAs')
  assert.ok(!/Recibe 5 conceptos publicitarios gratis/.test(t))
  // hero CTA: compact, no wrapping, same destination as before (the Spanish Roadmap)
  assert.match(body, /href="\/es\/creative-growth-roadmap" class="cta-gradient hero-cta[^"]*whitespace-nowrap[^"]*px-5 md:px-6/)
  // founder section, services, final headline
  assert.match(t, /Nuestro fundador ha trabajado con\s+más de\s+500\s+clientes\s+de e-commerce, apps, SaaS y otros sectores\./)
  assert.match(t, /Las buenas marcas\nmerecen mejores\ncreativos\./)
  assert.ok(/class="block text-ink sm:whitespace-nowrap">merecen mejores</.test(body), 'the middle line of the final headline never wraps from tablet up')
  for (const s of ['Qué hacemos', 'Creativos en vídeo para', 'Anuncios UGC', 'Vídeos Spokesperson', 'Contenido orgánico para redes sociales', '¿No tienes claro qué servicio necesitas?', 'Reservar una llamada', 'Prueba a trabajar con nosotros.', 'Solicitar 1 vídeo gratis', 'Oferta sujeta a revisión y aprobación.', 'Marcas que confiaron en nosotros.', '¿Qué hace exactamente CONVRT Studio?', '¿En qué se diferencia un vídeo UGC de un vídeo Spokesperson?', '¿Te queda alguna duda?']) assert.ok(t.includes(s), s)
  // verbatim original testimonials (English), approved labels
  for (const q of ['Mohamed understood the concept really well', 'Working with Mohamad was an absolute pleasure', 'The videos are amazing again']) assert.ok(t.includes(q), q)
  // terminology: no "creatividad(es)" for ad creative assets, no "listos para rendir", Spokesperson stays the service name
  for (const p of ES_PAGES) {
    const x = textOf(page(p)).join('\n')
    assert.ok(!/listos para rendir/i.test(x), `${p}: "listos para rendir"`)
    assert.ok(!/\bcreatividades\b/i.test(x), `${p}: "creatividades"`)
    assert.ok(!/vídeos? con presentador(?!es)/i.test(x.replace(/Vídeos con presentadores/g, '')), `${p}: the service is "Spokesperson", not "con presentador"`)
  }
  assert.match(headOf(page('/es/spokesperson-video-production')), /<title>Vídeos Spokesperson \| Vídeos con presentador/)
})

test('Spanish free-video offer: a secondary homepage block pointing to the existing application (real route, translated, held for review); the five free concepts stay primary; the 10 free hooks are never promoted in Spanish', () => {
  const h = page('/es'), body = bodyOf(h)
  assert.ok(body.includes('id="free-video"') && body.includes('href="/es/risk-free-trial"'))
  assert.ok(fs.existsSync(path.join(dist, 'es/risk-free-trial/index.html')), 'the destination exists')
  assert.equal((body.match(/href="\/es\/risk-free-trial"/g) ?? []).length, 1, 'one secondary block, not a navigation item')
  assert.ok(body.indexOf('id="free-video"') > body.indexOf('id="services"') || body.indexOf('id="free-video"') > 0)
  assert.match(headOf(page('/es/risk-free-trial')), /name="robots" content="noindex, follow"/)
  assert.ok(!fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes('risk-free-trial'))
  assert.ok(!/hreflang/.test(page('/risk-free-trial')), 'no hreflang to the held page')
  assert.ok(releaseBlocker('es', '/risk-free-trial'))
  const rf = page('/es/risk-free-trial'), rt = textOf(rf).join('\n')
  assert.match(rt, /Solicita tu\s*\nvídeo gratis\./)
  assert.ok(!/name="marketingConsent"/.test(rf) && !/data-consent-version/.test(rf), 'no marketing-consent box until a reviewed Spanish wording exists')
  assert.ok(!/href="\/(es\/)?free-hooks/.test(rf))
  // English keeps its consent box and hooks link
  assert.match(page('/risk-free-trial'), /name="marketingConsent"/)
  // hooks: no Spanish page links to or advertises the lead magnet
  for (const p of ES_PAGES) {
    const x = page(p)
    assert.ok(!/href="[^"]*free-hooks/.test(x), `${p}: no hooks link`)
    assert.ok(!/ganchos (publicitarios )?gratis|10 (ganchos|FREE)|Free Ad Hooks/i.test(textOf(x).join('\n')), `${p}: no hooks promotion`)
  }
  assert.equal(LOCALIZED_FLOWS.es.hooks, false)
  // the English homepage hero still carries both free offers
  assert.match(textOf(page('/')).join('\n'), /10\nFREE\nAd Hooks|10 FREE Ad Hooks/)
  // payload compatibility: option VALUES stay English (the server and the English form compare them exactly)
  const q = read('src/lib/riskFreeQuestions.js')
  assert.match(q, /'SaaS \/ Software', 'E-commerce \/ DTC brand'/)
})
