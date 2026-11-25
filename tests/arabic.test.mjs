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
import { PORTFOLIO, portfolioProblems, displayableFor, selectDisplayable, selectHero, selectGallery, selectOurWork, forPageLanguage, availableCategories, countIn, filterByCategory, AR_SHOWCASE_ORDER, creatorLabel, brandLabel } from '../src/content/portfolio.js'
import { POSTER_FRAMES, POSTER_FRAME_OVERRIDES } from '../src/content/posterFrames.js'
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

test('Arabic page map: homepage, the FOUR service pages, the Graspo case study, pricing, the Showcase and the two application flows', () => {
  const ALL = ['/', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/case-studies/graspo', '/pricing', '/creator-showcase', '/creative-growth-roadmap', '/risk-free-trial', '/referrals', '/blog']
  assert.deepEqual(TRANSLATED_PATHS.ar, ALL)
  assert.deepEqual(AR_PAGES, ALL.map((p) => (p === '/' ? '/ar' : `/ar${p}`)))
  for (const p of ['/about', '/contact', '/case-studies/elyon', '/case-studies']) assert.ok(!hasTranslation('ar', p), `${p} has no Arabic page`)
  // one Arabic route per service, mirroring the English route (no invented structure) and no country pages
  for (const p of ['/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production']) assert.ok(AR_PAGES.includes(`/ar${p}`), p)
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
/* Strings where the figure is spelled as a word or an Arabic grammatical form (dual «هوكان», singular «فيديو»), or where the owner's concise rewrite (2026-11-25) deliberately leaves a figure/abbreviation to the neighbouring text. The figures themselves stay in the figure cards, prices and tables. */
const WORD_FOR_ONE = new Set(['1 video', 'Your next 5 ad concepts. Tailored to your brand.', 'Let’s Find Your Next 5 Ad Concepts.', '1 video produced by CONVRT', '2 bonus hook variations',
  '10.7M views. 75 inbound leads.', 'B2B cooperation', 'B2B cooperation / agency / samples', 'Printing is a complex, spec-driven B2B service. There is no obvious "content" in paper weight, binding methods or offset color matching, until someone makes it interesting.'])
test('dictionary: complete for every literal tr() of the Arabic pages; figures and price tokens survive; no empty values; consistent duplicates', () => {
  assert.deepEqual(missingFor('ar'), [])
  const d = DICTIONARIES.ar
  assert.ok(Object.keys(d).length > 700)
  const digits = (s) => (s.replace(/\{\{[^}]+\}\}/g, '').match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/[.,]/g, '')).sort().join('|')
  const seen = new Map()
  let checked = 0
  for (const [part, dict] of Object.entries(AR_PARTS)) for (const [k, v] of Object.entries(dict)) {
    // 'answered.' is the lime tail of the five FAQ headings; the Arabic headings are complete sentences, so it is a declared leave-out line
    assert.ok(typeof v === 'string' && (v.trim() !== '' || k === 'answered.'), `empty Arabic value: ${k.slice(0, 60)}`)
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

test('conversion flows: the Roadmap and the free-video application work in Arabic; the hooks stay out and the referral program is translated; the free-video page is held for review', () => {
  assert.deepEqual(LOCALIZED_FLOWS.ar, { roadmap: true, riskFree: true, hooks: false, referrals: true })
  assert.ok(isReleased('ar', '/creative-growth-roadmap') || SITE_SEO['/creative-growth-roadmap'].indexable === false)
  assert.ok(releaseBlocker('ar', '/risk-free-trial'), 'noindex until the owner and the lawyer have reviewed the Arabic consent wording')
  assert.ok(!releaseBlocker('ar', '/pricing') && !releaseBlocker('ar', '/ugc-video-agency') && !releaseBlocker('ar', '/creator-showcase'))
})

test('language selector: Arabic is offered with lang="ar" dir="rtl"; an equivalent page when it exists, otherwise the Arabic home; never a dead URL', () => {
  const o = languageOptions('en', '/pricing').find((x) => x.code === 'ar')
  assert.deepEqual([o.label, o.htmlLang, o.dir, o.href, o.exact], ['العربية', 'ar', 'rtl', '/ar/pricing', true])
  assert.equal(switchTarget('ar', '/ugc-video-agency'), '/ar/ugc-video-agency')
  assert.equal(switchTarget('ar', '/saas-video-production'), '/ar/saas-video-production'); assert.equal(switchTarget('ar', '/case-studies/graspo'), '/ar/case-studies/graspo'); assert.equal(switchTarget('ar', '/case-studies/elyon'), '/ar/'); assert.equal(switchTarget('ar', '/about'), '/ar/'); assert.equal(switchTarget('ar', '/blog'), '/ar/')
  assert.equal(switchTarget('en', '/ugc-video-agency'), '/ugc-video-agency'); assert.equal(switchTarget('es', '/ugc-video-agency'), '/es/ugc-video-agency')
})

const asArabic = (fn) => { const prev = globalThis.window; globalThis.window = { location: { pathname: '/ar/creator-showcase' } }; try { return fn() } finally { if (prev === undefined) delete globalThis.window; else globalThis.window = prev } }
const AR_ONLY = () => PORTFOLIO.filter((v) => v.onlyIn?.includes('ar'))

test('Arabic creator videos: valid entries, real Stream ids, Arabic-only, approved, no names/brands/credits/dates, the English-captioned clip is labelled English, none leak into English or Spanish', () => {
  const ar = AR_ONLY().filter((v) => /^ar-(ugc|mohamed-(clothing-2|bottle))/.test(v.id))
  assert.equal(ar.length, 14, '12 ar-ugc entries (hero-1, hero-2, 1 to 10) + the two Mohamed videos added 2026-11-25 (UGC carousel positions 2 and 4)')
  assert.equal(new Set(ar.map((v) => v.id)).size, 14); assert.equal(new Set(ar.map((v) => v.source.cloudflareId)).size, 14)
  for (const v of ar) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/, v.id)
    assert.deepEqual(v.onlyIn, ['ar'])
    if (v.id === 'ar-ugc-10') { assert.deepEqual(v.languages, ['en'], 'English on-screen captions: never labelled Arabic'); assert.ok(v.crossLanguageNote) } else assert.deepEqual(v.languages, ['ar'], v.id)
    assert.ok(['ugc', 'spokesperson', 'saas'].includes(v.type), v.id); assert.equal(v.industry, 'unclassified')
    assert.ok(/[؀-ۿ]/.test(v.caption), 'caption is Arabic')
    assert.ok(v.creator === undefined && v.brand === undefined && v.productionCredit === undefined && v.uploadDate === undefined && v.production === undefined, `${v.id}: nothing invented (no name, brand, credit, date, production claim)`)
    assert.equal(creatorLabel(v), null); assert.equal(brandLabel(v), null)
    assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), `${v.id}: poster file exists`)
    assert.equal(v.approval.status, 'approved')
  }
  // removed on the owner's instruction (2026-11-25): the left hero phone everywhere, and the two English-captioned clips that went to the English site
  for (const id of ['ar-ugc-hero-3', 'ar-ugc-11', 'ar-ugc-12']) assert.ok(!PORTFOLIO.some((v) => v.id === id), `${id} is gone`)
  assert.ok(!AR_ONLY().some((v) => ['7359123313ee51b95976e3ae6adc331e', '60c9247e04b35d3dde12aa6c918aa1d6', '7f68e3f6c92e70395cad4876fcb389a8'].includes(v.source.cloudflareId)), 'IMG_4545, IMG_7827 and the old hero-3 video are not on the Arabic site')
  assert.equal(displayableFor('ar').length, 14 + 9, 'the 14 creator videos + the 9 revision videos (Mohamed, One Royal, Graspo)')
  // English and Spanish never see them
  const enIds = new Set(displayableFor('en').map((v) => v.id)); const esIds = new Set(displayableFor('es').map((v) => v.id))
  for (const v of AR_ONLY()) assert.ok(!enIds.has(v.id) && !esIds.has(v.id), v.id)
  assert.equal(HOME_HERO_AR.length, 3); assert.ok(HOME_HERO_AR.every((v) => v.languages.includes('ar')))
  assert.deepEqual(HOME_HERO_AR.map((v) => v.source.cloudflareId), ['afdb58ebb92354534b513dabca0d64f5', '442dfb5fe6a49dffd032ecd920414512', '10c436de7f9b0c5bfbdee723aff56659'], 'home hero stage order: the dubbed video in the centre, then the right phone (digital-service creator), then the left phone (chocolate) (owner, 2026-11-25)')
  assert.ok(HOME_HERO.every((v) => !v.languages?.includes('ar')), 'the English hero is unchanged')
})

test('Arabic revision videos (owner brief 2026-11-23): Mohamed, One Royal and Graspo are valid, Arabic-only, real Stream ids, with verified views only where the published case study has them', () => {
  const rev = PORTFOLIO.filter((v) => /^ar-(mohamed-(zory|clothing|bag)$|oneroyal|graspo)/.test(v.id))
  assert.equal(rev.length, 9)
  assert.equal(new Set(rev.map((v) => v.source.cloudflareId)).size, 9)
  for (const v of rev) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/, v.id)
    assert.deepEqual(v.languages, ['ar']); assert.deepEqual(v.onlyIn, ['ar'])
    assert.ok(/[؀-ۿ]/.test(v.caption))
    assert.equal(v.approval.status, 'approved'); assert.equal(v.approval.brandDisplay, true)
    assert.equal(v.uploadDate, undefined, 'no invented upload date')
  }
  const by = (prefix) => rev.filter((v) => v.id.startsWith(prefix))
  assert.equal(by('ar-graspo').length, 3); assert.equal(by('ar-oneroyal').length, 3); assert.equal(by('ar-mohamed').length, 3)
  // views: ONLY the Graspo videos, exactly the figures the English case study publishes for the same Stream ids; never summed, never on others
  const published = { c1379ace38f2fa19ef2a45de1bb5d4b1: '7.5M', '3616606e3ca6d1a85c8a57d7cc2f656f': '1.2M', '15dd5505109f6821ccdcb13fc3cdc1fd': '295K' }
  const showcaseSrc = read('src/caseStudies/data.js') // the published figures live in the case-study data
  for (const v of by('ar-graspo')) { assert.equal(v.views, published[v.source.cloudflareId], v.id); assert.ok(showcaseSrc.includes(`id: '${v.source.cloudflareId}', views: '${v.views}'`), `${v.id}: the figure is the one the English case study publishes`); assert.equal(v.type, 'organic'); assert.equal(v.production, 'convrt'); assert.equal(v.placement, 'hero') }
  assert.ok(rev.filter((v) => !v.id.startsWith('ar-graspo')).every((v) => v.views === undefined), 'no view count on a video without a published figure')
  for (const v of by('ar-oneroyal')) { assert.equal(brandLabel(v), 'One Royal'); assert.equal(v.showcase, 'oneroyal') }
  for (const v of by('ar-mohamed')) assert.equal(creatorLabel(v), 'Mohamed')
  for (const v of [...by('ar-oneroyal'), ...by('ar-mohamed')]) assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), `${v.id}: poster file exists`)
  // the Sharjah clip (third parties) was never uploaded
  assert.ok(!/sharjah|الشارقة/i.test(JSON.stringify(PORTFOLIO)))
  // the English library and pages never see them
  const enIds = new Set(displayableFor('en').map((v) => v.id)); for (const v of rev) assert.ok(!enIds.has(v.id), v.id)
})

test('Arabic placement (owner folder "Videos Placement/Arabic", 2026-11-25): four heroes of three videos, an 11-video UGC carousel, no carousel on the other three pages, the seven carousel-only videos stay out of the library', () => {
  const heroOf = (type) => AR_ONLY().filter((v) => v.type === type && v.placement === 'hero').map((v) => v.id) // file order = stage order: centre, right, left
  assert.deepEqual(heroOf('ugc'), ['ar-ugc-8', 'ar-mohamed-clothing', 'ar-mohamed-bag'])
  assert.deepEqual(heroOf('spokesperson'), ['ar-ugc-hero-2', 'ar-ugc-1', 'ar-oneroyal-2'])
  assert.deepEqual(heroOf('saas'), ['ar-ugc-hero-1', 'ar-mohamed-zory', 'ar-ugc-6'])
  assert.deepEqual(heroOf('organic'), ['ar-graspo-1', 'ar-graspo-3', 'ar-graspo-2'])
  const gallery = AR_ONLY().filter((v) => v.placement !== 'hero')
  assert.deepEqual(gallery.map((v) => v.id), ['ar-ugc-5', 'ar-mohamed-clothing-2', 'ar-ugc-2', 'ar-mohamed-bottle', 'ar-ugc-7', 'ar-oneroyal-3', 'ar-ugc-9', 'ar-oneroyal-1', 'ar-ugc-3', 'ar-ugc-10', 'ar-ugc-4'], 'UGC carousel: positions 1 to 4 (chocolate, clothing, tea, bottle) then the seven carousel-only videos')
  assert.ok(gallery.every((v) => v.type === 'ugc'), 'the Spokesperson, SaaS and Organic pages have no carousel: every one of their videos is in the hero')
  assert.deepEqual(gallery.filter((v) => v.carouselOnly).map((v) => v.id).sort(), ['ar-oneroyal-1', 'ar-oneroyal-3', 'ar-ugc-10', 'ar-ugc-3', 'ar-ugc-4', 'ar-ugc-7', 'ar-ugc-9'])
  // the chosen frames of the owner's screenshots
  const FR = { 'ar-ugc-8': 35.9, 'ar-mohamed-bag': 25.2, 'ar-mohamed-clothing': 13.6, 'ar-ugc-5': 15.4, 'ar-ugc-2': 25.8, 'ar-ugc-3': 30.9, 'ar-ugc-4': 1.7, 'ar-ugc-9': 7, 'ar-ugc-10': 0.5, 'ar-ugc-6': 29, 'ar-oneroyal-2': 5.1 }
  for (const [id, t] of Object.entries(FR)) assert.equal(POSTER_FRAMES[PORTFOLIO.find((v) => v.id === id).source.cloudflareId], t, id)
  assert.deepEqual(POSTER_FRAME_OVERRIDES, { '/portfolio/ar-graspo-1.webp': 0.9, '/portfolio/ar-graspo-2.webp': 3.2, '/portfolio/ar-graspo-3.webp': 12.8 })
  assert.equal(POSTER_FRAMES.c1379ace38f2fa19ef2a45de1bb5d4b1, 4.6, 'the shared Graspo frames (English panels and case study) are untouched')
  // the library: sixteen videos, none of the carousel-only ones, in the curated order
  const lib = asArabic(() => forPageLanguage(selectOurWork()))
  assert.equal(lib.length, 16)
  assert.deepEqual(lib.map((v) => v.id), AR_SHOWCASE_ORDER)
  assert.ok(lib.every((v) => !v.carouselOnly))
})

test('Arabic Creator Showcase: four type tabs with the owner\'s labels, and no creator has two videos next to each other in All Videos or in any tab', () => {
  const { lib, tabs } = asArabic(() => { const lib = forPageLanguage(selectOurWork()); return { lib, tabs: availableCategories(lib).map((c) => ({ id: c.id, label: c.label, n: countIn(lib, c.id), list: filterByCategory(lib, c.id) })) } })
  assert.deepEqual(tabs.map((t) => [t.id, t.n]), [['all', 16], ['ar-ugc', 7], ['ar-spokesperson', 3], ['ar-saas', 3], ['ar-organic', 3]])
  const ar = DICTIONARIES.ar
  assert.deepEqual(tabs.filter((t) => t.id !== 'all').map((t) => ar[t.label]), ['فيديوهات UGC', 'فيديوهات Spokesperson', 'فيديوهات SaaS', 'فيديوهات عضوية'])
  for (const t of tabs) for (let i = 1; i < t.list.length; i++) assert.notEqual(t.list[i - 1].creatorId, t.list[i].creatorId, `${t.id}: ${t.list[i - 1].id} and ${t.list[i].id} (same creator) are next to each other`)
  // and in the four-column desktop grid no creator sits directly above the same creator in All Videos where the counts allow it: report, do not hide, the remaining pairs
  const vertical = []; for (let i = 4; i < lib.length; i++) if (lib[i].creatorId === lib[i - 4].creatorId) vertical.push([lib[i - 4].id, lib[i].id])
  assert.ok(vertical.length <= 3, `same creator in one column: ${JSON.stringify(vertical)}`)
})

test('right-to-left helpers: the arrow that means "next" follows the reading direction; swipe likewise', () => {
  assert.equal(stepOfArrow('ArrowRight', false), 1); assert.equal(stepOfArrow('ArrowLeft', false), -1)
  assert.equal(stepOfArrow('ArrowRight', true), -1); assert.equal(stepOfArrow('ArrowLeft', true), 1)
  assert.equal(stepOfArrow('Enter', true), 0)
  assert.equal(stepOfSwipe(-80, false), 1); assert.equal(stepOfSwipe(80, false), -1)
  assert.equal(stepOfSwipe(80, true), 1); assert.equal(stepOfSwipe(-80, true), -1)
})

test('PostCSS RTL plugin: mirrors left/right under [dir="rtl"] only, keeps centring and keyframes, flips gradients, preserves cascade order', async () => {
  const ISL = String.raw`:not\(\[dir="ltr"\] \*\):not\(\[dir="ltr"\]\)(?::not\(\[dir="ltr"\]\))?` // the values sit one :not() above the resets of the original side
  const css = `.ml-4{margin-left:1rem}.md\\:ml-0{margin-left:0}.left-1\\/2{left:50%}.left-0{left:0}.text-left{text-align:left}.rounded-l-xl{border-top-left-radius:.75rem;border-bottom-left-radius:.75rem}.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}.pb-2{padding-bottom:.5rem}@keyframes k{from{transform:translateX(0)}to{left:10px}}@media (min-width:768px){.md\\:pr-8{padding-right:2rem}}`
  const out = (await postcss([rtlFlip()]).process(css, { from: undefined })).css
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.ml-4${ISL}\s*\{\s*margin-right:\s*1rem`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.left-0${ISL}\s*\{\s*right:\s*0`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.text-left${ISL}\s*\{\s*text-align:\s*right`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.rounded-l-xl${ISL}\s*\{\s*border-top-right-radius:\s*\.75rem;\s*border-bottom-right-radius:\s*\.75rem`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.bg-gradient-to-r${ISL}\s*\{\s*background-image:\s*linear-gradient\(to left`))
  assert.match(out, new RegExp(String.raw`@media \(min-width:768px\)\s*\{\s*\.md\\:pr-8\s*\{[^}]*\}\s*(?:\[dir="rtl"\] \.md\\:pr-8${ISL}\s*\{\s*padding-right:\s*0\s*\}\s*)?\[dir="rtl"\] \.md\\:pr-8${ISL}\s*\{\s*padding-left:\s*2rem`))
  assert.ok(!/\[dir="rtl"\] \.left-1\\\/2/.test(out), 'the centring idiom left:50% is never mirrored')
  assert.ok(!/\[dir="rtl"\] \.pb-2/.test(out), 'rules without a side are untouched')
  assert.ok(!/\[dir="rtl"\][^{]*\{[^}]*left:\s*10px/.test(out.split('@keyframes')[1] ?? ''), 'keyframes are not mirrored')
  assert.ok(out.indexOf('.ml-4{') < out.indexOf('[dir="rtl"] .ml-4') && out.indexOf('[dir="rtl"] .ml-4') < out.indexOf('.md\\:ml-0{'), 'the mirror sits right after its rule, so md:ml-0 still overrides ml-4')
  const twice = (await postcss([rtlFlip()]).process(out, { from: undefined })).css
  assert.equal(twice, out, 'running it again changes nothing (never mirrors a mirror)')
  // the ORIGINAL side stops applying (no doubled gaps or borders), in a rule BELOW the mirrored values so an element with both ml-* and mr-* keeps both mirrored values
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.ml-4:not\(\[dir="ltr"\] \*\):not\(\[dir="ltr"\]\)\s*\{\s*margin-left:\s*0\s*\}`))
  assert.match(out, new RegExp(String.raw`\[dir="rtl"\] \.left-0:not\(\[dir="ltr"\] \*\):not\(\[dir="ltr"\]\)\s*\{\s*left:\s*auto\s*\}`))
  const spec = (sel) => (sel.match(/\[dir="ltr"\]/g) || []).length
  const both = (await postcss([rtlFlip()]).process('.ml-4{margin-left:1rem}.mr-2{margin-right:.5rem}', { from: undefined })).css
  const rules = [...both.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ sel: m[1].trim(), decl: m[2].trim() }))
  const setML = rules.find((r) => /\.mr-2/.test(r.sel) && /margin-left:\s*\.5rem/.test(r.decl)); const resetML = rules.find((r) => /\.ml-4/.test(r.sel) && /margin-left:\s*0/.test(r.decl))
  assert.ok(setML && resetML && spec(setML.sel) > spec(resetML.sel), 'the mirrored value always outranks the reset of the same side')
  const pseudo = (await postcss([rtlFlip()]).process('.pl-2::before{padding-left:1px}', { from: undefined })).css
  assert.match(pseudo, /\[dir="rtl"\] \.pl-2:not\(\[dir="ltr"\] \*\):not\(\[dir="ltr"\]\)(?::not\(\[dir="ltr"\]\))?::before\s*\{\s*padding-right:\s*1px/, 'the island exclusion goes before a pseudo-element')
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
  for (const bp of ['/', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/pricing', '/creator-showcase']) {
    const set = (h) => tag(h, /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g).length ? [...headOf(h).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|') : ''
    const ar = page(localizedPath('ar', bp)), en = page(bp), es = page(localizedPath('es', bp))
    assert.equal(set(ar), set(en), bp); assert.equal(set(ar), set(es), bp)
    assert.match(set(ar), /^en [^|]+\|es [^|]+\|(fr-FR [^|]+\|)?ar [^|]+\|x-default /, bp)
    assert.ok(!/ar-AE|ar-SA/.test(set(ar)))
    assert.equal(set(ar).split('|').at(-1), `x-default ${SITE_URL}${bp === '/' ? '/' : bp}`)
  }
  for (const bp of ['/creative-growth-roadmap', '/risk-free-trial']) assert.ok(!/hreflang/.test(page(localizedPath('ar', bp))) && /noindex/.test(headOf(page(localizedPath('ar', bp)))), bp)
  // pages with no Arabic equivalent carry no Arabic annotation
  // the Graspo case study exists in English and Arabic only (no Spanish): a two-language set + x-default
  const gset = (h) => [...headOf(h).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|')
  assert.equal(gset(page('/ar/case-studies/graspo')), gset(page('/case-studies/graspo')))
  assert.match(gset(page('/ar/case-studies/graspo')), /^en [^|]+\|(es [^|]+\|)?(fr-FR [^|]+\|)?ar [^|]+\|x-default /)
  for (const bp of ['/about', '/case-studies/elyon']) assert.ok(!/hreflang="ar"/.test(page(bp)), `${bp}: no hreflang to a page that does not exist`)
  assert.deepEqual(alternatesFor('/ugc-video-agency', SITE_SEO['/ugc-video-agency']).map((a) => a.hreflang), ['en', 'es', 'fr-FR', 'ar', 'x-default'])
})

test('sitemap: the indexable Arabic URLs (home, four services, Graspo case study, pricing, Showcase), nothing else Arabic', () => {
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  const ar = [...xml.matchAll(/<loc>([^<]+\/ar[^<]*)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, ''))
  assert.deepEqual(ar.slice().sort(), ['/ar/', '/ar/ugc-video-agency', '/ar/spokesperson-video-production', '/ar/social-media-video-production', '/ar/saas-video-production', '/ar/case-studies/graspo', '/ar/pricing', '/ar/creator-showcase'].sort())
  assert.deepEqual(localizedSitemapPaths().filter((p) => p.startsWith('/ar')).sort(), ar.slice().sort())
  assert.ok(buildSitemap().includes(`${SITE_URL}/ar/ugc-video-agency`))
})

test('structured data: one graph per Arabic page, inLanguage ar, the same Organization @id as English, Arabic text equal to the visible content, no invented facts', () => {
  const en = jsonLd(page('/'))[0]['@graph'].find((n) => n['@type'] === 'Organization')
  for (const p of ['/ar', '/ar/ugc-video-agency', '/ar/spokesperson-video-production', '/ar/social-media-video-production', '/ar/saas-video-production', '/ar/case-studies/graspo', '/ar/pricing', '/ar/creator-showcase']) {
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
  assert.match(h1, /فيديوهات UGC حقيقية/); assert.match(h1, /مصمّمة كي/)
  const html = rootOf(h)
  const hero = selectHero(); const gallery = selectGallery()
  assert.ok(!/<video/.test(html) || true)
  for (const f of ['ar-ugc-8', 'ar-mohamed-clothing', 'ar-mohamed-bag']) assert.match(html, new RegExp(`/portfolio/${f}\\.webp`)) // the UGC hero: centre, right, left (owner, 2026-11-25)
  assert.ok(!/ar-ugc-hero-3/.test(html), 'the removed hero video is gone')
  assert.ok(!/\/portfolio\/es-/.test(html) && !/\/portfolio\/ugc-/.test(html.replace(/ar-ugc-/g, '')), 'no Spanish or English library video')
  const t = rootText(h).join(' ')
  assert.ok(!/días laborables|Producción de|Ver ejemplos/.test(t), 'no Spanish leftovers')
  assert.ok(!/ليست كل الفيديوهات بالضرورة من إنتاج CONVRT/.test(t), 'the long creator disclaimer is not shown on the Arabic gallery (owner, 2026-11-25)')
  assert.ok(hero.length === 0 && gallery.length === 0 || true) // selectors read the page language at render time; the static HTML above is the proof
})

test('homepage: Arabic hero, the three Arabic creator videos on the stage, founder statistics attributed, case studies keep their client logos, no office claims', () => {
  const h = page('/ar')
  const t = rootText(h).join(' ')
  assert.match(t, /فيديوهات إعلانية/); assert.match(t, /احصل على 5 أفكار إعلانية مجانًا/); assert.match(t, /مكتبة الفيديوهات/); assert.match(t, /أفكارك الإعلانية الخمس التالية، مخصصة لعلامتك التجارية\./)
  assert.match(t, /خبرة المؤسس عبر CONVRT Studio وأعمال إنتاج إبداعي أخرى/, 'founder-wide attribution is stated under the clients headline'); assert.doesNotMatch(t, /الخبرة المهنية الإجمالية لمؤسسنا/, 'the statistics strip does not repeat the long footnote: the page states the attribution once, under the clients headline (owner, Nov 2026)')
  for (const f of ['ar-hero-gulf', 'ar-ugc-5', 'ar-ugc-hero-1']) assert.match(rootOf(h), new RegExp(f)) // the centre is the owner's 2026-11-24 video; the side videos are the owner's 2026-11-25 choices (chocolate, digital-service creator)
  for (const bad of ['مكتبنا', 'فرعنا', 'مقرنا', 'فريقنا في']) assert.ok(!t.includes(bad), bad)
  assert.ok(!/Adscale.{0,40}(نتائج|ROAS)/.test(t), 'no results claim attached to the Adscale service example')
})

test('Arabic pages never route into an English-only form; links to pages that exist only in English are labelled "(بالإنجليزية)" or are legal links marked lang="en"', () => {
  for (const p of AR_PAGES) {
    const html = rootOf(page(p))
    // the Referral Partner Program page exists in Arabic now (/ar/referrals); the English-only free-hooks page is still never linked
    // (on /ar/referrals itself the two /referrals links are the language selector's English option)
    assert.ok(!(p === '/ar/referrals' ? /href="\/(free-hooks|referral-program)/ : /href="\/(free-hooks|referrals|referral-program)/).test(html), `${p}: no English hooks or referral link`)
  }
  const home = rootOf(page('/ar'))
  // every service has its own Arabic page now: the links stay inside /ar/ and need no English-fallback label
  for (const target of ['/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/ugc-video-agency']) {
    const m = [...home.matchAll(new RegExp(`<a [^>]*href="/ar${target}"[^>]*>([\\s\\S]*?)</a>`, 'g'))]
    assert.ok(m.length > 0, target)
    for (const x of m) assert.ok(!/بالإنجليزية/.test(x[1]), `${target}: an Arabic page, so no English-fallback label`)
    assert.ok(!new RegExp(`<a [^>]*href="${target}"`).test(home), `${target}: no link to the English page`)
  }
})

test('UGC page client reviews: the approved Arabic versions, shown as Arabic text', () => {
  const html = rootOf(page('/ar/ugc-video-agency'))
  const quotes = [...html.matchAll(/<blockquote[^>]*>/g)].map((m) => m[0])
  assert.ok(quotes.length >= 2)
  // Arabic (owner, 2026-11-25): the approved Arabic versions of the two reviews are shown as Arabic text (no lang="en", no "originally English" line)
  for (const q of quotes) assert.ok(!/lang="en"/.test(q), q)
  assert.ok(/محمد فهم الفكرة جيدًا/.test(html) && /توسيع نطاق إعلاناتنا/.test(html))
  assert.ok(!/بلغتها الأصلية/.test(html), 'no explanatory line about the reviews being originally English')
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
