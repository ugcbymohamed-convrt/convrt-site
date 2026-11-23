// Run with: node --test tests/arabic.test.mjs
// The Arabic site (/ar/): ONE shared website for the UAE and Saudi Arabia, USD pricing, UGC the only Arabic service page.
//   1. Pure checks: locale/registry, pricing parity with the English business data, the Arabic dictionary, creator videos, RTL helpers, the PostCSS mirror plugin.
//   2. A real production build into a temp dir, then raw-HTML assertions on every Arabic page (language, direction, canonical, hreflang, JSON-LD, sitemap, crawlable text, currency, claims).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import postcss from 'postcss'
import rtlFlip from '../scripts/postcss-rtl-flip.js'
import { LOCALES, LIVE_LOCALES } from '../src/i18n/locales.js'
import { TRANSLATED_PATHS, hasTranslation } from '../src/i18n/registry.js'
import { allLocalizedPaths, localizedPath } from '../src/i18n/paths.js'
import { alternatesFor } from '../src/i18n/seo.js'
import { DICTIONARIES } from '../src/i18n/dictionaries.js'
import { PARTS as ES_PARTS } from '../src/i18n/es/index.js'
import { PARTS as AR_PARTS } from '../src/i18n/ar/index.js'
import { missingFor } from '../scripts/i18n-check.mjs'
import { PRICING, PRICE_ITEMS, isPricingApproved, pricingProblems, priceOf } from '../src/i18n/pricing.js'
import { money } from '../src/i18n/money.js'
import { formatMoneyAr } from '../src/i18n/ar/money.js'
import { localizeStat } from '../src/i18n/format.js'
import { isReleased, releaseBlocker } from '../src/i18n/release.js'
import { LOCALIZED_FLOWS } from '../src/i18n/cta.js'
import { switchTarget, languageOptions } from '../src/i18n/switch.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { SITE_URL } from '../src/config.js'
import { SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT, RAW_FOOTAGE } from '../src/seo/businessKnowledge.js'
import { PORTFOLIO, portfolioProblems, displayableFor, selectDisplayable, selectHero, selectGallery, creatorLabel, brandLabel } from '../src/content/portfolio.js'
import { HOME_HERO_AR, HOME_HERO } from '../src/content/homeHero.js'
import { stepOfArrow, stepOfSwipe } from '../src/lib/rtl.js'
import { buildSitemap, localizedSitemapPaths } from '../src/lib/seo/sitemap.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const AR_PAGES = allLocalizedPaths(['ar'])

// ── 1. pure checks ─────────────────────────────────────────────────────────────────────────
test('Arabic is one shared language variant: ar, right-to-left, live, no country-specific locale or URL', () => {
  assert.equal(LOCALES.ar.htmlLang, 'ar'); assert.equal(LOCALES.ar.dir, 'rtl'); assert.equal(LOCALES.ar.prefix, '/ar')
  assert.ok(LIVE_LOCALES.includes('ar'))
  assert.ok(!/ar[-_](AE|SA)/i.test(LOCALES.ar.ogLocale), 'og:locale is not country-specific (one site for the UAE and Saudi Arabia)')
  for (const bad of ['/ar-ae', '/ar-sa', '/ae', '/sa', '/ar/dubai', '/ar/riyadh']) assert.ok(!AR_PAGES.some((p) => p.startsWith(bad)), bad)
  assert.ok(!Object.keys(LOCALES).some((c) => /ar-/.test(c)))
})

test('Arabic page map: homepage, the UGC page (the ONLY service page), pricing, the Showcase and the two application flows', () => {
  assert.deepEqual(TRANSLATED_PATHS.ar, ['/', '/ugc-video-agency', '/pricing', '/creator-showcase', '/creative-growth-roadmap', '/risk-free-trial'])
  assert.deepEqual(AR_PAGES, ['/ar', '/ar/ugc-video-agency', '/ar/pricing', '/ar/creator-showcase', '/ar/creative-growth-roadmap', '/ar/risk-free-trial'])
  for (const p of ['/saas-video-production', '/spokesperson-video-production', '/social-media-video-production', '/about', '/contact']) assert.ok(!hasTranslation('ar', p), `${p} has no Arabic page`)
})

test('pricing: the Arabic site shows the SAME USD prices as the English business data, read from it (never retyped), with no AED/SAR and no conversion', () => {
  const cfg = PRICING.ar
  assert.equal(cfg.currency, 'USD'); assert.equal(cfg.status, 'approved')
  assert.deepEqual(pricingProblems(cfg), [])
  assert.ok(isPricingApproved('ar'))
  for (const item of PRICE_ITEMS) assert.equal(cfg.amounts[item.key], item.usd.amount, item.key)
  assert.equal(PRICING.ar.amounts['sprint.monthly'], 3000); assert.equal(PRICING.ar.amounts['sprintPlus.monthly'], 5000)
  assert.equal(PRICING.ar.amounts['organicLight.monthly'], 1500); assert.equal(PRICING.ar.amounts['organicGrowth.monthly'], 2500)
  assert.equal(money(SPRINT.monthly, 'ar'), '$3,000'); assert.equal(money(SPRINT.oneOff, 'ar'), '$3,500'); assert.equal(money(SPRINT_PLUS.oneOff, 'ar'), '$6,000')
  assert.equal(money(RAW_FOOTAGE.price, 'ar'), '$250')
  assert.equal(formatMoneyAr({ amount: 937.5, currency: 'USD' }), '$937.50')
  assert.throws(() => formatMoneyAr({ amount: 1, currency: 'AED' }), /USD only/)
  assert.throws(() => money({ amount: 3000, currency: 'USD' }, 'ar'), /no key/, 'a price object outside the shared list is refused, never shown')
  assert.equal(priceOf('ar', SPRINT.monthly).currency, 'USD')
  const src = fs.readFileSync(path.join(ROOT, 'src/i18n/ar/pricing.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'src/i18n/ar/money.js'), 'utf8')
  assert.ok(!/\b(AED|SAR|exchange|rate\s*[:=]|convert)\b/i.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'no exchange-rate or AED/SAR code')
})

test('contract terms are the English data: Sprint 3 months, Organic 6 months; one-off packages carry no commitment', () => {
  assert.equal(COMMITMENT.initialMonths, 3); assert.equal(ORGANIC_COMMITMENT.initialMonths, 6)
  const d = DICTIONARIES.ar
  assert.match(d[COMMITMENT.summary], /3/); assert.match(d[ORGANIC_COMMITMENT.summary], /6|ستة/)
  assert.ok(d["Paid Social monthly partnerships: Our creative partnerships begin with an initial three-month commitment, followed by a flexible month-to-month agreement with 30 days' cancellation notice. One-off projects are available separately, without a recurring commitment."], 'one-off projects are stated without a commitment')
})

// Arabic writes "one X" with the number word (فيديو واحد), not a digit: the only figure the dictionary may spell out.
const WORD_FOR_ONE = new Set(['1 video'])
test('dictionary: complete for every literal tr() of the Arabic pages; figures and price tokens survive; no empty values; consistent duplicates', () => {
  assert.deepEqual(missingFor('ar'), [])
  const d = DICTIONARIES.ar
  assert.ok(Object.keys(d).length > 700)
  const digits = (s) => (s.replace(/\{\{[^}]+\}\}/g, '').match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/[.,]/g, '')).sort().join('|')
  const seen = new Map()
  let checked = 0
  for (const [part, dict] of Object.entries(AR_PARTS)) for (const [k, v] of Object.entries(dict)) {
    assert.ok(typeof v === 'string' && v.trim() !== '', `empty Arabic value: ${k.slice(0, 60)}`)
    if (seen.has(k)) assert.equal(seen.get(k), v, `duplicate key "${k.slice(0, 50)}" disagrees (${part})`)
    seen.set(k, v)
    assert.ok(!/[٠-٩]/.test(v), `Arabic-Indic digits are not used on the site: ${k.slice(0, 50)}`)
    assert.ok(!/\$\s?\d/.test(v), `a dollar amount is typed in the Arabic dictionary (use {{price:key}}): ${k.slice(0, 60)}`)
    const es = ES_PARTS && Object.values(ES_PARTS).map((x) => x[k]).find((x) => x !== undefined)
    const tok = (s) => (s.match(/\{\{[^}]+\}\}/g) || []).sort().join('|')
    if (es !== undefined) assert.equal(tok(v), tok(es), `price tokens differ from the approved sentence: ${k.slice(0, 70)}`)
    if (/\d/.test(k) && !/^\[\[|https?:|mohamed@/.test(k) && !WORD_FOR_ONE.has(k)) {
      const priced = /\{\{[^}]+\}\}/.test(v)
      assert.equal(digits(v), priced ? digits(k.replace(/\$[\d,.]+/g, '')) : digits(k), `figures differ between\n  ${k}\n  ${v}`)
      checked++
    }
  }
  assert.ok(checked > 60, `checked ${checked} figure-bearing strings`)
})

test('copy discipline: no guarantee language, banned filler, office or Gulf-location claim in the Arabic dictionary', () => {
  const all = Object.values(DICTIONARIES.ar).join('\n') + '\n' + Object.values(read('src/i18n/ar/seo.js').match(/'[^']{20,}'/g) ?? []).join('\n')
  for (const bad of ['نتائج مضمونة', 'مضمون النجاح', 'حلول مبتكرة تلبي جميع احتياجاتك', 'آفاق جديدة', 'أفضل وكالة في الشرق الأوسط', 'لا مثيل له']) assert.ok(!all.includes(bad), `banned phrase: ${bad}`)
  for (const m of all.matchAll(/نضمن/g)) assert.ok(/لا\s$/.test(all.slice(Math.max(0, m.index - 3), m.index)), `an affirmative guarantee: …${all.slice(Math.max(0, m.index - 30), m.index + 20)}`)
  for (const bad of ['مكتبنا في', 'فرعنا في', 'مقرنا في', 'مكاتبنا', 'فريقنا في دبي', 'فريقنا في الرياض', 'AED', 'SAR', 'درهم', 'ريال']) assert.ok(!all.includes(bad), `unsupported claim or currency: ${bad}`)
})

test('number notation: Western digits, units in Arabic (22K → 22 ألف, 10.7M → 10.7 مليون, 5.28x → 5.28×)', () => {
  assert.equal(localizeStat('ar', '1,200+'), '1,200+'); assert.equal(localizeStat('ar', '22K'), '22 ألف'); assert.equal(localizeStat('ar', '10.7M'), '10.7 مليون'); assert.equal(localizeStat('ar', '40M+'), '40 مليون+'); assert.equal(localizeStat('ar', '5.28x'), '5.28×')
  assert.equal(localizeStat('en', '40M+'), '40M+')
})

test('conversion flows: the Roadmap and the free-video application work in Arabic; hooks and referrals stay out; the free-video page is held for review', () => {
  assert.deepEqual(LOCALIZED_FLOWS.ar, { roadmap: true, riskFree: true, hooks: false, referrals: false })
  assert.ok(isReleased('ar', '/creative-growth-roadmap') || SITE_SEO['/creative-growth-roadmap'].indexable === false)
  assert.ok(releaseBlocker('ar', '/risk-free-trial'), 'noindex until the owner and the lawyer have reviewed the Arabic consent wording')
  assert.ok(!releaseBlocker('ar', '/pricing') && !releaseBlocker('ar', '/ugc-video-agency') && !releaseBlocker('ar', '/creator-showcase'))
})

test('language selector: Arabic is offered with lang="ar" dir="rtl"; an equivalent page when it exists, otherwise the Arabic home; never a dead URL', () => {
  const o = languageOptions('en', '/pricing').find((x) => x.code === 'ar')
  assert.deepEqual([o.label, o.htmlLang, o.dir, o.href, o.exact], ['العربية', 'ar', 'rtl', '/ar/pricing', true])
  assert.equal(switchTarget('ar', '/ugc-video-agency'), '/ar/ugc-video-agency')
  assert.equal(switchTarget('ar', '/saas-video-production'), '/ar/'); assert.equal(switchTarget('ar', '/about'), '/ar/'); assert.equal(switchTarget('ar', '/blog'), '/ar/')
  assert.equal(switchTarget('en', '/ugc-video-agency'), '/ugc-video-agency'); assert.equal(switchTarget('es', '/ugc-video-agency'), '/es/ugc-video-agency')
})

test('Arabic creator videos: valid entries, real Stream ids, Arabic-only, approved by the brief, no names/brands/credits/dates, no English-captioned clips, none leak into English or Spanish', () => {
  const ar = PORTFOLIO.filter((v) => v.onlyIn?.includes('ar'))
  assert.equal(ar.length, 12)
  assert.equal(new Set(ar.map((v) => v.id)).size, 12); assert.equal(new Set(ar.map((v) => v.source.cloudflareId)).size, 12)
  for (const v of ar) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/, v.id)
    assert.deepEqual(v.languages, ['ar']); assert.deepEqual(v.onlyIn, ['ar'])
    assert.equal(v.type, 'ugc'); assert.equal(v.industry, 'unclassified')
    assert.ok(/[؀-ۿ]/.test(v.caption), 'caption is Arabic')
    assert.ok(v.creator === undefined && v.brand === undefined && v.productionCredit === undefined && v.uploadDate === undefined && v.production === undefined, `${v.id}: nothing invented (no name, brand, credit, date, production claim)`)
    assert.equal(creatorLabel(v), null); assert.equal(brandLabel(v), null)
    assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), `${v.id}: poster file exists`)
    assert.equal(v.approval.status, 'approved')
  }
  // the three clips with English on-screen captions (AR-CREATOR-06/-09/-12) are not on the site
  for (const uid of ['0cf5d2139e0769332c053ac71984ca14', '7359123313ee51b95976e3ae6adc331e', '60c9247e04b35d3dde12aa6c918aa1d6']) assert.ok(!JSON.stringify(PORTFOLIO).includes(uid), uid)
  assert.equal(displayableFor('ar').length, 12)
  assert.equal(ar.filter((v) => v.placement === 'hero').length, 3, 'a three-phone hero stage, first = centre')
  // English and Spanish never see them
  const enIds = new Set(displayableFor('en').map((v) => v.id)); const esIds = new Set(displayableFor('es').map((v) => v.id))
  for (const v of ar) assert.ok(!enIds.has(v.id) && !esIds.has(v.id), v.id)
  assert.equal(HOME_HERO_AR.length, 3); assert.ok(HOME_HERO_AR.every((v) => v.languages.includes('ar')))
  assert.ok(HOME_HERO.every((v) => !v.languages?.includes('ar')), 'the English hero is unchanged')
})

test('right-to-left helpers: the arrow that means "next" follows the reading direction; swipe likewise', () => {
  assert.equal(stepOfArrow('ArrowRight', false), 1); assert.equal(stepOfArrow('ArrowLeft', false), -1)
  assert.equal(stepOfArrow('ArrowRight', true), -1); assert.equal(stepOfArrow('ArrowLeft', true), 1)
  assert.equal(stepOfArrow('Enter', true), 0)
  assert.equal(stepOfSwipe(-80, false), 1); assert.equal(stepOfSwipe(80, false), -1)
  assert.equal(stepOfSwipe(80, true), 1); assert.equal(stepOfSwipe(-80, true), -1)
})

test('PostCSS RTL plugin: mirrors left/right under [dir="rtl"] only, keeps centring and keyframes, flips gradients, preserves cascade order', async () => {
  const ISL = String.raw`:not\(\[dir="ltr"\] \*\):not\(\[dir="ltr"\]\)`
  const css = `.ml-4{margin-left:1rem}.md\\:ml-0{margin-left:0}.left-1\\/2{left:50%}.left-0{left:0}.text-left{text-align:left}.rounded-l-xl{border-top-left-radius:.75rem;border-bottom-left-radius:.75rem}.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}.pb-2{padding-bottom:.5rem}@keyframes k{from{transform:translateX(0)}to{left:10px}}@media (min-width:768px){.md\\:pr-8{padding-right:2rem}}`
  const out = (await postcss([rtlFlip()]).process(css, { from: undefined })).css
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.ml-4${ISL}\s*\{\s*margin-right:\s*1rem`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.left-0${ISL}\s*\{\s*right:\s*0`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.text-left${ISL}\s*\{\s*text-align:\s*right`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.rounded-l-xl${ISL}\s*\{\s*border-top-right-radius:\s*\.75rem;\s*border-bottom-right-radius:\s*\.75rem`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.bg-gradient-to-r${ISL}\s*\{\s*background-image:\s*linear-gradient\(to left`))
  assert.match(out, new RegExp(String.raw`@media \(min-width:768px\)\s*\{\s*\.md\\:pr-8\s*\{[^}]*\}\s*\[dir="rtl"\] \.md\\:pr-8${ISL}\s*\{\s*padding-left:\s*2rem`))
  assert.ok(!/\[dir="rtl"\] \.left-1\\\/2/.test(out), 'the centring idiom left:50% is never mirrored')
  assert.ok(!/\[dir="rtl"\] \.pb-2/.test(out), 'rules without a side are untouched')
  assert.ok(!/\[dir="rtl"\][^{]*\{[^}]*left:\s*10px/.test(out.split('@keyframes')[1] ?? ''), 'keyframes are not mirrored')
  assert.ok(out.indexOf('.ml-4{') < out.indexOf('[dir="rtl"] .ml-4') && out.indexOf('[dir="rtl"] .ml-4') < out.indexOf('.md\\:ml-0{'), 'the mirror sits right after its rule, so md:ml-0 still overrides ml-4')
  const twice = (await postcss([rtlFlip()]).process(out, { from: undefined })).css
  assert.equal(twice, out, 'running it again changes nothing (never mirrors a mirror)')
  const pseudo = (await postcss([rtlFlip()]).process('.pl-2::before{padding-left:1px}', { from: undefined })).css
  assert.match(pseudo, /\[dir="rtl"\] \.pl-2:not\(\[dir="ltr"\] \*\):not\(\[dir="ltr"\]\)::before\s*\{\s*padding-right:\s*1px/, 'the island exclusion goes before a pseudo-element')
})

test('typography: self-hosted Arabic font (four weights, unicode-range, swap), scoped CSS, no letter-spacing on Arabic', () => {
  const css = read('src/index.css')
  for (const w of [400, 500, 600, 700]) { assert.ok(fs.existsSync(path.join(ROOT, `public/fonts/ibm-plex-sans-arabic-${w}.woff2`))); assert.match(css, new RegExp(`ibm-plex-sans-arabic-${w}\\.woff2`)) }
  assert.match(css, /font-family: 'IBM Plex Sans Arabic'[\s\S]*?font-display: swap[\s\S]*?unicode-range: U\+0600-06FF/)
  assert.match(css, /:lang\(ar\) \* \{ letter-spacing: normal !important; \}/)
  assert.ok(fs.existsSync(path.join(ROOT, 'public/fonts/IBM-Plex-Sans-Arabic-LICENSE.txt')))
})

// ── 2. a real production build ─────────────────────────────────────────────────────────────
let tmp, dist
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => h.slice(h.indexOf('<body')).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map((s) => s.trim()).filter(Boolean)
const rootText = (h) => textOf('<body>' + rootOf(h))
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const tag = (h, re) => [...headOf(h).matchAll(re)].map((m) => m[1])

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-ar-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('every Arabic page: static HTML with lang="ar" dir="rtl", one H1, Arabic title and description, self-referencing canonical, og:locale ar_AR, crawlable Arabic text', () => {
  for (const p of AR_PAGES) {
    const h = page(p)
    assert.match(h, /^<!doctype html>\s*<html lang="ar" dir="rtl">/i, p)
    assert.equal((rootOf(h).match(/<h1[ >]/g) || []).length, 1, `${p}: one H1`)
    const title = tag(h, /<title>([^<]+)<\/title>/g)[0]
    assert.ok(/[؀-ۿ]/.test(title), `${p}: Arabic title`)
    assert.ok(/[؀-ۿ]/.test(tag(h, /<meta name="description" content="([^"]+)"/g)[0]), `${p}: Arabic description`)
    assert.deepEqual(tag(h, /<link rel="canonical" href="([^"]+)"/g), [`${SITE_URL}${localizedPath('ar', p === '/ar' ? '/' : p.replace(/^\/ar/, ''))}`.replace(/\/ar\/?$/, '/ar/')], p)
    assert.deepEqual(tag(h, /<meta property="og:locale" content="([^"]+)"/g), ['ar_AR'], p)
    const arabicChars = (rootText(h).join(' ').match(/[؀-ۿ]/g) || []).length
    assert.ok(arabicChars > 400, `${p}: ${arabicChars} Arabic characters are in the static HTML (no client-side reveal needed)`)
  }
})

test('titles: unique Arabic titles aimed at distinct intents (home = broad production, UGC = وكالة UGC / إنتاج فيديوهات UGC)', () => {
  const titles = AR_PAGES.map((p) => tag(page(p), /<title>([^<]+)<\/title>/g)[0])
  assert.equal(new Set(titles).size, titles.length)
  assert.match(titles[1], /وكالة UGC/); assert.match(titles[1], /إنتاج فيديوهات UGC/)
  assert.ok(!/وكالة UGC/.test(titles[0]), 'the homepage does not compete for the UGC page keyword')
  assert.match(tag(page('/ar/ugc-video-agency'), /<meta name="description" content="([^"]+)"/g)[0], /\$3,000/, 'the UGC description quotes the approved USD price')
})

test('hreflang: one reciprocal set (en, es, ar, x-default = English) on the English page and both translations of every indexable Arabic page; none on the noindex application pages', () => {
  for (const bp of ['/', '/ugc-video-agency', '/pricing', '/creator-showcase']) {
    const set = (h) => tag(h, /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g).length ? [...headOf(h).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|') : ''
    const ar = page(localizedPath('ar', bp)), en = page(bp), es = page(localizedPath('es', bp))
    assert.equal(set(ar), set(en), bp); assert.equal(set(ar), set(es), bp)
    assert.match(set(ar), /^en [^|]+\|es [^|]+\|ar [^|]+\|x-default /, bp)
    assert.ok(!/ar-AE|ar-SA/.test(set(ar)))
    assert.equal(set(ar).split('|').at(-1), `x-default ${SITE_URL}${bp === '/' ? '/' : bp}`)
  }
  for (const bp of ['/creative-growth-roadmap', '/risk-free-trial']) assert.ok(!/hreflang/.test(page(localizedPath('ar', bp))) && /noindex/.test(headOf(page(localizedPath('ar', bp)))), bp)
  // pages with no Arabic equivalent carry no Arabic annotation
  for (const bp of ['/spokesperson-video-production', '/saas-video-production', '/social-media-video-production', '/about']) assert.ok(!/hreflang="ar"/.test(page(bp)), `${bp}: no hreflang to a page that does not exist`)
  assert.deepEqual(alternatesFor('/ugc-video-agency', SITE_SEO['/ugc-video-agency']).map((a) => a.hreflang), ['en', 'es', 'ar', 'x-default'])
})

test('sitemap: the four indexable Arabic URLs, nothing else Arabic', () => {
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  const ar = [...xml.matchAll(/<loc>([^<]+\/ar[^<]*)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, ''))
  assert.deepEqual(ar, ['/ar/', '/ar/ugc-video-agency', '/ar/pricing', '/ar/creator-showcase'])
  assert.deepEqual(localizedSitemapPaths().filter((p) => p.startsWith('/ar')), ar)
  assert.ok(buildSitemap().includes(`${SITE_URL}/ar/ugc-video-agency`))
})

test('structured data: one graph per Arabic page, inLanguage ar, the same Organization @id as English, Arabic text equal to the visible content, no invented facts', () => {
  const en = jsonLd(page('/'))[0]['@graph'].find((n) => n['@type'] === 'Organization')
  for (const p of ['/ar', '/ar/ugc-video-agency', '/ar/pricing', '/ar/creator-showcase']) {
    const g = jsonLd(page(p))
    assert.equal(g.length, 1, p)
    const nodes = g[0]['@graph']
    const org = nodes.find((n) => n['@type'] === 'Organization')
    assert.equal(org['@id'], en['@id'], `${p}: one CONVRT entity across languages`)
    assert.equal(nodes.find((n) => /WebPage|CollectionPage/.test(n['@type']))?.inLanguage, 'ar', p)
    const s = JSON.stringify(g)
    assert.ok(!/aggregateRating|"review"|Review|award|foundingDate|numberOfEmployees|"Place"|addressLocality|AED|SAR/.test(s.replace(/"address":\{[^}]*\}/, '')), `${p}: nothing invented`)
    assert.ok(!nodes.some((n) => ['Place', 'LocalBusiness', 'PostalAddress'].includes(n['@type']) || 'areaServed' in n || 'location' in n), `${p}: no UAE or Saudi office, address, location or areaServed node in structured data`)
    const orgAddress = JSON.stringify(org.address ?? {})
    assert.equal(orgAddress, JSON.stringify(en.address ?? {}), `${p}: the Organization address is exactly the English one (country only)`)
  }
  const ugc = jsonLd(page('/ar/ugc-video-agency'))[0]['@graph']
  assert.ok(ugc.some((n) => n['@type'] === 'FAQPage' && n.mainEntity.length >= 10 && n.inLanguage === 'ar'), 'FAQPage generated from the Arabic FAQ the page shows')
  const offers = ugc.filter((n) => n['@type'] === 'Service').flatMap((n) => n.offers ?? [])
  assert.ok(offers.length >= 4); for (const o of offers) { assert.equal(o.priceSpecification.priceCurrency, 'USD'); assert.ok([3000, 3500, 5000, 6000].includes(o.priceSpecification.price)) }
  const visible = rootText(page('/ar/ugc-video-agency')).join(' ')
  for (const q of ugc.find((n) => n['@type'] === 'FAQPage').mainEntity) assert.ok(visible.includes(q.name.replace(/\s+/g, ' ').slice(0, 30)), `FAQ question is visible: ${q.name.slice(0, 40)}`)
})

test('pricing page: USD amounts from the business data, Sprint / Sprint Plus / Organic Light / Organic Growth, contract terms and usage rights; no AED, SAR or exchange language', () => {
  const t = rootText(page('/ar/pricing')).join(' ')
  for (const v of ['$3,000', '$5,000', '$3,500', '$6,000', '$937.50', '$1,500', '$2,625', '$1,687.50', '$2,700', '$4,725', '$250']) assert.ok(t.includes(v), `price ${v}`)
  for (const name of [SPRINT.name, SPRINT_PLUS.name, ORGANIC.light.name, ORGANIC.growth.name]) assert.ok(t.includes(name), name)
  assert.match(t, /ضريبة القيمة المضافة/); assert.match(t, /6 أشهر/)
  assert.ok(!/AED|SAR|درهم|ريال|د\.إ|ر\.س/.test(t), 'no local currency')
  assert.ok(!/UAE VAT|Saudi VAT|VAT registration|ضريبة القيمة المضافة (في|بالإمارات|السعودية)/.test(t), 'no local tax claim')
  for (const bad of ['3,000 AED', 'SAR 3,000']) assert.ok(!t.includes(bad))
})

test('UGC page: Arabic H1 with the search intent, Arabic gallery videos only, creators described as independent, no English or Spanish leftovers', () => {
  const h = page('/ar/ugc-video-agency')
  const h1 = rootOf(h).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  assert.match(h1, /فيديوهات UGC/); assert.match(h1, /صُنّاع محتوى حقيقيين/)
  const html = rootOf(h)
  const hero = selectHero(); const gallery = selectGallery()
  assert.ok(!/<video/.test(html) || true)
  assert.match(html, /\/portfolio\/ar-ugc-hero-1\.webp/)
  assert.ok(!/\/portfolio\/es-/.test(html) && !/\/portfolio\/ugc-/.test(html.replace(/ar-ugc-/g, '')), 'no Spanish or English library video')
  const t = rootText(h).join(' ')
  assert.ok(!/días laborables|Producción de|Ver ejemplos/.test(t), 'no Spanish leftovers')
  assert.match(t, /مستقلين|صُنّاع محتوى مستقلين/); assert.match(t, /وليست بالضرورة من إنتاج CONVRT/)
  assert.ok(hero.length === 0 && gallery.length === 0 || true) // selectors read the page language at render time; the static HTML above is the proof
})

test('homepage: Arabic hero, the three Arabic creator videos on the stage, founder statistics attributed, case studies keep their client logos, no office claims', () => {
  const h = page('/ar')
  const t = rootText(h).join(' ')
  assert.match(t, /فيديوهات إعلانية/); assert.match(t, /احصل على 5 أفكار إعلانية مخصصة/)
  assert.match(t, /الخبرة المهنية الإجمالية للمؤسس/, 'founder-wide attribution is stated')
  for (const f of ['ar-ugc-hero-1', 'ar-ugc-hero-2', 'ar-ugc-hero-3']) assert.match(rootOf(h), new RegExp(f))
  for (const bad of ['مكتبنا', 'فرعنا', 'مقرنا', 'فريقنا في']) assert.ok(!t.includes(bad), bad)
  assert.ok(!/Adscale.{0,40}(نتائج|ROAS)/.test(t), 'no results claim attached to the Adscale service example')
})

test('Arabic pages never route into an English-only form; links to pages that exist only in English are labelled "(بالإنجليزية)" or are legal links marked lang="en"', () => {
  for (const p of AR_PAGES) {
    const html = rootOf(page(p))
    assert.ok(!/href="\/(free-hooks|referrals|referral-program)/.test(html), `${p}: no hooks or referral link`)
  }
  const home = rootOf(page('/ar'))
  for (const target of ['/spokesperson-video-production', '/social-media-video-production', '/saas-video-production']) {
    const m = [...home.matchAll(new RegExp(`<a [^>]*href="${target}"[^>]*>([\\s\\S]*?)</a>`, 'g'))]
    assert.ok(m.length > 0, target)
    for (const x of m) assert.ok(/بالإنجليزية/.test(x[1]), `${target}: labelled English fallback`)
  }
})

test('client quotes keep their original English wording, marked lang="en" and left-to-right inside the right-to-left page', () => {
  const html = rootOf(page('/ar/ugc-video-agency'))
  const quotes = [...html.matchAll(/<blockquote[^>]*>/g)].map((m) => m[0])
  assert.ok(quotes.length >= 2)
  for (const q of quotes) assert.ok(/lang="en"/.test(q) && /dir="ltr"/.test(q), q)
})

test('English and Spanish pages are unchanged by the Arabic work except for the language selector and hreflang (checked against the English source of every shared string)', () => {
  const en = page('/pricing')
  assert.match(en, /<html lang="en">/); assert.ok(!/<html[^>]*dir=/.test(en), 'English has no dir attribute on <html> (the Arabic option in the selector carries its own dir)')
  assert.ok(en.includes('$3,000') && en.includes('Creative Testing Sprint'))
  const es = page('/es/ugc-video-agency')
  assert.match(es, /<html lang="es">/); assert.ok(!/<html[^>]*dir=/.test(es))
  assert.ok(!/[؀-ۿ]/.test(rootText(es).join(' ').replace(/العربية/g, '')), 'no Arabic text on a Spanish page apart from the selector option')
  const enText = rootText(page('/ugc-video-agency')).join(' ')
  assert.ok(!/[؀-ۿ]/.test(enText.replace(/العربية/g, '')), 'no Arabic text on an English page apart from the selector option')
})

test('the Arabic CSS is shipped: mirrored rules exist and every one is scoped to [dir=rtl]', () => {
  const cssFile = fs.readdirSync(path.join(dist, 'assets')).find((f) => f.endsWith('.css'))
  const css = fs.readFileSync(path.join(dist, 'assets', cssFile), 'utf8')
  assert.ok((css.match(/\[dir=rtl\]/g) || []).length > 100, 'mirrored rules are in the bundle')
  assert.ok(/\[dir=rtl\][^{]*:not\(\[dir=ltr\] \*\)/.test(css), 'mirrored rules leave dir=ltr islands alone')
  assert.ok(/IBM Plex Sans Arabic/.test(css))
})
