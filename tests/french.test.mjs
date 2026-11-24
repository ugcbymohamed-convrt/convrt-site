// Run with: node --test tests/french.test.mjs
// French localization (fr-FR, France-first, Nov 2026): routes, SEO, hreflang, sitemap, structured data, EUR pricing, creators, conversion flows, copy quality, regression.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { LOCALES, isLive, LIVE_LOCALES } from '../src/i18n/locales.js'
import { TRANSLATED_PATHS, hasTranslation } from '../src/i18n/registry.js'
import { localizedPath, allLocalizedPaths } from '../src/i18n/paths.js'
import { switchTarget, languageOptions } from '../src/i18n/switch.js'
import { alternatesFor, absoluteUrl } from '../src/i18n/seo.js'
import { FR_SEO } from '../src/i18n/fr/seo.js'
import { DICTIONARIES } from '../src/i18n/dictionaries.js'
import { missingFor } from '../scripts/i18n-check.mjs'
import { localizeStat } from '../src/i18n/format.js'
import { formatMoneyFr } from '../src/i18n/fr/money.js'
import { frTypography } from '../src/i18n/fr/typography.js'
import { LOCALIZED_FLOWS, flowAvailable } from '../src/i18n/cta.js'
import { PORTFOLIO, displayableFor, isDisplayable, portfolioProblems, ENGLISH_LIBRARY, selectDisplayable } from '../src/content/portfolio.js'
import { HOME_HERO_FR } from '../src/content/homeHero.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { SITE_URL } from '../src/config.js'
import { SPRINT, SPRINT_PLUS, ORGANIC, RAW_FOOTAGE } from '../src/seo/businessKnowledge.js'
import { buildSitemap, localizedSitemapPaths } from '../src/lib/seo/sitemap.js'
import { isReleased, blockedPages } from '../src/i18n/release.js'
import { pricingProblems, PRICING, isPricingApproved, perVariationOf } from '../src/i18n/pricing.js'
import { ES_PRICING } from '../src/i18n/es/pricing.js'
import { FR_PRICING } from '../src/i18n/fr/pricing.js'
import { money } from '../src/i18n/money.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const FR_PAGES = ['/', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/pricing', '/creator-showcase', '/case-studies', '/case-studies/graspo', '/case-studies/elyon', '/creative-growth-roadmap', '/risk-free-trial', '/referrals']
const FR_INDEXABLE = FR_PAGES.filter((bp) => isReleased('fr', bp) && SITE_SEO[bp].indexable !== false)

// ── pure checks ────────────────────────────────────────────────────────────────────────────────────────────────
test('French is live as fr-FR with exactly the approved pages; the four service pages (UGC, spokesperson, organic social, SaaS) are all French (tests/french-services.test.mjs)', () => {
  assert.ok(isLive('fr'))
  assert.equal(LOCALES.fr.htmlLang, 'fr-FR'); assert.equal(LOCALES.fr.ogLocale, 'fr_FR'); assert.equal(LOCALES.fr.dir, 'ltr'); assert.equal(LOCALES.fr.prefix, '/fr')
  assert.deepEqual(TRANSLATED_PATHS.fr, FR_PAGES)
  for (const bp of ['/about', '/contact', '/privacy', '/terms', '/blog']) assert.ok(!hasTranslation('fr', bp), `${bp} must not exist in French`)
  assert.deepEqual(allLocalizedPaths(['fr']), ['/fr', '/fr/ugc-video-agency', '/fr/spokesperson-video-production', '/fr/social-media-video-production', '/fr/saas-video-production', '/fr/pricing', '/fr/creator-showcase', '/fr/case-studies', '/fr/case-studies/graspo', '/fr/case-studies/elyon', '/fr/creative-growth-roadmap', '/fr/risk-free-trial', '/fr/referrals'])
  assert.equal(localizedPath('fr', '/'), '/fr/')
})

test('French dictionary: every literal tr() of the French pages is translated, no empty value, duplicate keys agree', async () => {
  assert.deepEqual(missingFor('fr'), [], 'run `node scripts/i18n-check.mjs fr`')
  const { PARTS } = await import('../src/i18n/fr/index.js')
  const seen = new Map()
  for (const [part, dict] of Object.entries(PARTS)) for (const [k, v] of Object.entries(dict)) {
    assert.ok(typeof v === 'string' && v.trim(), `empty French value in ${part}: ${k.slice(0, 60)}`)
    if (seen.has(k)) assert.equal(seen.get(k), v, `duplicate key "${k.slice(0, 50)}" disagrees (${part})`)
    seen.set(k, v)
  }
})

test('French copy rules: no banned filler, no straight apostrophes, no hand-typed currency, price tokens only where the English has a dollar amount, figures survive', async () => {
  const BANNED = [/r[ée]volutionn/i, /solutions innovantes/i, /maximis\w+ (votre|son|leur) potentiel/i, /meilleure agence/i, /\bleader\b/i]
  const DOLLAR = /\$\d[\d,]*(?:\.\d+)?/g
  const nums = (s) => (s.replace(/\{\{[^}]*\}\}/g, ' ').match(/\d+/g) ?? [])
  // owner-reviewed departures: the 10-free-hooks library is never promoted in French (its flow is English-only), the bracket options are client-supplied dollar bands
  const OMIT = /free library of 10 ad hooks|^1 video( produced by CONVRT)?$|^2 bonus hook variations$|10 Free Ad Hooks|^5 winning ad concepts\.$|^Under \$5,000$|^\$5,000–\$20,000$|^\$20,000\+$|^10\+ videos$/
  for (const [k, v] of Object.entries(DICTIONARIES.fr)) {
    for (const re of BANNED) assert.ok(!re.test(v), `banned phrase in: ${v.slice(0, 80)}`)
    assert.ok(!/'/.test(v), `straight apostrophe (use ’): ${v.slice(0, 80)}`)
    if (OMIT.test(k)) continue
    const dollars = k.match(DOLLAR) ?? []
    const tokens = v.match(/\{\{(?:price|perVariation|usd|reward):[A-Za-z0-9.]+\}\}/g) ?? []
    if (dollars.length) assert.ok(tokens.length >= 1, `price token missing: ${k.slice(0, 70)}`)
    assert.ok(!/[$€]|\bUSD\b/.test(v.replace(/\{\{[^}]*\}\}/g, '')), `hand-typed currency: ${v.slice(0, 80)}`)
    const fr = nums(v)
    for (const n of nums(k.replace(DOLLAR, ' '))) assert.ok(fr.includes(n), `number ${n} lost: ${k.slice(0, 60)} → ${v.slice(0, 60)}`)
  }
})

test('French typography: non-breaking space before : ; ? ! » and after «; tokens untouched', () => {
  assert.equal(frTypography('Pourquoi : vraiment ?'), 'Pourquoi\u00a0: vraiment\u00a0?')
  assert.equal(frTypography('Dites « bonjour » !'), 'Dites «\u00a0bonjour\u00a0»\u00a0!')
  assert.equal(frTypography('{{price:sprint.monthly}} par mois'), '{{price:sprint.monthly}} par mois')
})

test('French numbers and money: EUR with narrow-nbsp thousands and a no-break space before the euro sign; USD only for a client’s real reported result', () => {
  assert.equal(formatMoneyFr({ amount: 2750, currency: 'EUR' }), '2\u202f750\u00a0€')
  assert.equal(formatMoneyFr({ amount: 225, currency: 'EUR' }), '225\u00a0€')
  assert.equal(formatMoneyFr({ amount: 3421.25, currency: 'USD' }), '3\u202f421,25\u00a0USD')
  assert.equal(localizeStat('fr', '1,200+'), '1\u202f200+'); assert.equal(localizeStat('fr', '40M+'), '40\u00a0M+'); assert.equal(localizeStat('fr', '10.7M'), '10,7\u00a0M'); assert.equal(localizeStat('fr', '22K'), '22\u00a0k'); assert.equal(localizeStat('fr', '50%+'), '50\u00a0%+')
  assert.equal(localizeStat('en', '1,200+'), '1,200+')
})

test('French prices ARE the owner-approved Spanish EUR amounts (imported, not retyped), never converted from USD', () => {
  assert.deepEqual(pricingProblems(FR_PRICING), [])
  assert.deepEqual(FR_PRICING.amounts, ES_PRICING.amounts)
  assert.deepEqual(FR_PRICING.amounts, { 'sprint.monthly': 2750, 'sprint.oneOff': 3250, 'sprint.ext3': 850, 'sprint.ext6': 1375, 'sprint.ext12': 2400, 'sprintPlus.monthly': 4600, 'sprintPlus.oneOff': 5500, 'sprintPlus.ext3': 1550, 'sprintPlus.ext6': 2500, 'sprintPlus.ext12': 4350, rawFootage: 225, 'organicLight.monthly': 1400, 'organicGrowth.monthly': 2300 })
  assert.equal(FR_PRICING.currency, 'EUR'); assert.ok(isPricingApproved('fr')); assert.deepEqual(Object.keys(PRICING), ['es', 'fr', 'ar'])
  assert.equal(money(SPRINT.monthly, 'fr'), '2\u202f750\u00a0€'); assert.equal(money(SPRINT_PLUS.oneOff, 'fr'), '5\u202f500\u00a0€'); assert.equal(money(RAW_FOOTAGE.price, 'fr'), '225\u00a0€')
  assert.equal(money(ORGANIC.light.monthly, 'fr'), '1\u202f400\u00a0€'); assert.equal(money(ORGANIC.growth.monthly, 'fr'), '2\u202f300\u00a0€')
  assert.equal(perVariationOf('fr', 'sprint.monthly').amount, 183)
  assert.equal(money(SPRINT.monthly, 'en'), '$3,000', 'English stays USD')
})

test('release gates: every French page is released (showcase has approved French videos, EUR approved) except the free-video application held for review', () => {
  assert.deepEqual(blockedPages('fr').map((b) => b.path), ['/risk-free-trial'])
  for (const bp of FR_PAGES.filter((p) => p !== '/risk-free-trial')) assert.ok(isReleased('fr', bp), bp)
})

test('hreflang: reciprocal sets use fr-FR, x-default is English, only for indexable French pages; never a fake target for a missing translation', () => {
  for (const bp of FR_INDEXABLE) {
    const set = alternatesFor(bp, SITE_SEO[bp])
    const codes = set.map((a) => a.hreflang)
    assert.ok(codes.includes('fr-FR') && codes.includes('en') && codes.at(-1) === 'x-default', bp)
    assert.equal(set.find((a) => a.hreflang === 'fr-FR').href, absoluteUrl('fr', bp))
    assert.equal(set.at(-1).href, `${SITE_URL}${bp}`)
  }
  // the UGC page references only languages that really have a UGC page; Spanish does (never the Spanish homepage)
  const ugc = alternatesFor('/ugc-video-agency', SITE_SEO['/ugc-video-agency'])
  assert.deepEqual(ugc.map((a) => a.href), [`${SITE_URL}/ugc-video-agency`, `${SITE_URL}/es/ugc-video-agency`, `${SITE_URL}/fr/ugc-video-agency`, `${SITE_URL}/ar/ugc-video-agency`, `${SITE_URL}/ugc-video-agency`])
  assert.deepEqual(alternatesFor('/spokesperson-video-production', SITE_SEO['/spokesperson-video-production']).map((a) => a.hreflang), ['en', 'es', 'fr-FR', 'ar', 'x-default'], 'the French spokesperson page exists: reciprocal fr-FR (and the Arabic one)')
  assert.ok(!alternatesFor('/about', SITE_SEO['/about']).some((a) => a.hreflang === 'fr-FR'), 'About has no French page: no fr hreflang')
  assert.deepEqual(alternatesFor('/creative-growth-roadmap', SITE_SEO['/creative-growth-roadmap']), [], 'noindex Roadmap: no hreflang')
})

test('language selector: French offered, equivalent page when it exists, otherwise the French home; no redirect or detection', () => {
  assert.deepEqual(languageOptions('en', '/pricing').map((o) => [o.code, o.href, o.exact]), [['en', '/pricing', true], ['es', '/es/pricing', true], ['fr', '/fr/pricing', true], ['ar', '/ar/pricing', true]])
  assert.deepEqual(languageOptions('es', '/ugc-video-agency').map((o) => o.href), ['/ugc-video-agency', '/es/ugc-video-agency', '/fr/ugc-video-agency', '/ar/ugc-video-agency'], 'ES → FR equivalent')
  assert.deepEqual(languageOptions('fr', '/ugc-video-agency').map((o) => o.href), ['/ugc-video-agency', '/es/ugc-video-agency', '/fr/ugc-video-agency', '/ar/ugc-video-agency'], 'FR → EN / ES equivalents')
  assert.equal(switchTarget('fr', '/about'), '/fr/'); assert.equal(switchTarget('fr', '/blog'), '/fr/'); assert.equal(switchTarget('es', '/spokesperson-video-production'), '/es/spokesperson-video-production')
  assert.equal(switchTarget('en', '/risk-free-trial'), '/risk-free-trial')
  assert.deepEqual(languageOptions('fr', '/').map((o) => o.label), ['English', 'Español', 'Français', 'العربية'])
  assert.ok(languageOptions('fr', '/').find((o) => o.current).code === 'fr')
})

test('sitemap: the released, indexable French pages are listed with their own canonical URLs; the noindex Roadmap and held free-video page are not', () => {
  const fr = localizedSitemapPaths().filter((p) => p.startsWith('/fr'))
  assert.deepEqual(fr, ['/fr/', '/fr/ugc-video-agency', '/fr/spokesperson-video-production', '/fr/social-media-video-production', '/fr/saas-video-production', '/fr/pricing', '/fr/creator-showcase', '/fr/case-studies/graspo', '/fr/case-studies/elyon'])
  const xml = buildSitemap()
  for (const p of fr) assert.ok(xml.includes(`<loc>${SITE_URL}${p}</loc>`), p)
  assert.ok(!xml.includes('/fr/creative-growth-roadmap') && !xml.includes('/fr/risk-free-trial'))
  assert.equal(new Set(fr).size, fr.length)
})

test('conversion flows: Roadmap and free-video application are French; the 10 free hooks are never promoted in French; the Referral Partner Program is French', () => {
  assert.deepEqual(LOCALIZED_FLOWS.fr, { roadmap: true, riskFree: true, hooks: false, referrals: true })
  assert.ok(flowAvailable('fr', 'roadmap') && !flowAvailable('fr', 'hooks'))
})

test('French SEO copy: one distinct primary intent per page; homepage is not an « agence UGC » page; no unsupported claim', () => {
  assert.match(FR_SEO['/ugc-video-agency'].title, /Agence UGC/)
  assert.doesNotMatch(FR_SEO['/'].title + FR_SEO['/'].description, /agence UGC/i, 'the homepage does not compete for « agence UGC »')
  assert.match(FR_SEO['/'].title, /vidéo publicitaire/)
  for (const e of Object.values(FR_SEO)) {
    assert.ok(e.title.length <= 70, e.title); assert.ok(e.description.length <= 215, e.description)
    assert.doesNotMatch(e.title + e.description, /meilleure|n° ?1|garanti|Paris|\bLyon\b|Bordeaux|bureau|France entière/i)
  }
  assert.match(FR_SEO['/ugc-video-agency'].description, /2\u202f750\u00a0€ HT\/mois/)
})

test('French share image: a real 1200x630 PNG exists and every French page uses it for og:image and twitter:image', () => {
  const f = path.join(ROOT, 'public/og/convrt-og-fr.png')
  const b = fs.readFileSync(f)
  assert.equal(b.subarray(1, 4).toString(), 'PNG'); assert.equal(b.readUInt32BE(16), 1200); assert.equal(b.readUInt32BE(20), 630)
})

// ── creators ───────────────────────────────────────────────────────────────────────────────────────────────────
test('French creator videos: nine valid French-only gallery videos (five of two opaque creators, four of the founder) and three landscape client-stage videos (FIXD1-3); real Cloudflare ids and posters; no brand/credit shown, no invented upload date', () => {
  const all = PORTFOLIO.filter((i) => (i.onlyIn ?? []).includes('fr'))
  assert.equal(all.length, 12)
  const stage = all.filter((v) => v.showcase === 'fixd')
  assert.equal(stage.length, 3)
  for (const v of stage) {
    assert.deepEqual(portfolioProblems(v), [], v.id); assert.equal(v.orientation, 'landscape'); assert.deepEqual(v.languages, ['fr']); assert.deepEqual(v.onlyIn, ['fr'])
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/); assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), v.poster)
    assert.equal(v.approval.portfolioUse, false); assert.equal(v.approval.creatorConsent, false); assert.ok(!isDisplayable(v), 'client-stage only: never in a gallery or the Showcase')
    assert.equal(v.uploadDate, undefined)
  }
  // the founder: shown by first name and role (owner: Mohamed is the founder and a creator), nothing more is claimed
  const founder = all.filter((v) => v.creatorId === 'fr-c03' && !v.showcase)
  assert.equal(founder.length, 4)
  for (const v of founder) {
    assert.deepEqual(portfolioProblems(v), [], v.id); assert.equal(v.creator.displayName, 'Mohamed, fondateur de CONVRT'); assert.equal(v.creator.showName, true)
    assert.equal(v.brand, undefined); assert.equal(v.productionCredit, undefined); assert.equal(v.uploadDate, undefined); assert.equal(v.production, undefined); assert.ok(isDisplayable(v)); assert.equal(v.placement, 'gallery')
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/); assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), v.poster)
  }
  const fr = all.filter((v) => !v.showcase && v.creatorId !== 'fr-c03')
  assert.equal(fr.length, 5)
  for (const v of fr) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.deepEqual(v.languages, ['fr']); assert.deepEqual(v.onlyIn, ['fr'])
    assert.match(v.source.cloudflareId, /^[0-9a-f]{32}$/); assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), v.poster)
    assert.match(v.creatorId, /^fr-c0\d$/)
    assert.equal(v.uploadDate, undefined); assert.equal(v.creator, undefined); assert.equal(v.brand, undefined); assert.equal(v.productionCredit, undefined)
    assert.ok(isDisplayable(v)); assert.equal(v.industry, 'unclassified'); assert.equal(v.production, undefined)
  }
  assert.equal(new Set(all.map((v) => v.source.cloudflareId)).size, 12)
  assert.equal(displayableFor('fr').length, 9)
  // never on English pages or in the English library; never the English library on French pages
  assert.ok(!ENGLISH_LIBRARY.some((i) => (i.onlyIn ?? []).includes('fr')))
  assert.ok(fr.every((v) => !displayableFor('es').includes(v)))
  // the phone-case video whose captions are English is NOT in the French set
  assert.ok(!fs.readFileSync(path.join(ROOT, 'src/content/portfolio.js'), 'utf8').includes('default-2.mp4'))
  // creator names never enter the repository
  const names = /\b(Kristina|Xander)\b/i
  for (const f of ['src/content/portfolio.js', 'src/content/homeHero.js', 'docs/multilingual-french-release.md']) if (fs.existsSync(path.join(ROOT, f))) assert.ok(!names.test(read(f)), `${f} names a creator`)
})

test('French homepage hero uses only French-spoken videos that are also in the portfolio (same Stream ids)', () => {
  const ids = new Set(PORTFOLIO.filter((i) => (i.onlyIn ?? []).includes('fr')).map((i) => i.source.cloudflareId))
  assert.equal(HOME_HERO_FR.length, 3)
  for (const h of HOME_HERO_FR) { assert.deepEqual(h.languages, ['fr']); assert.ok(isDisplayable(h)) }
  // centre = the French-dubbed CONVRT advertisement (its own Stream upload, not a creator video); left = the French female creator, right = the French male creator (the same Stream videos as the UGC hero)
  const [main, left, right] = HOME_HERO_FR
  assert.equal(main.source.cloudflareId, 'ce7f495642b90a531e44f17b8e7454c5'); assert.equal(main.creatorId, 'cv-home-hero')
  assert.ok(ids.has(left.source.cloudflareId) && ids.has(right.source.cloudflareId))
  assert.equal(left.creatorId, 'fr-c01'); assert.equal(right.creatorId, 'fr-c02')
  // Comma (the founder's football-shirt video) is NOT a hero video: it is in the carousel and the showcase
  const comma = PORTFOLIO.find((i) => i.id === 'fr-mohamed-comma')
  assert.ok(comma && !HOME_HERO_FR.some((h) => h.source.cloudflareId === comma.source.cloudflareId))
})

// ── a real production build ────────────────────────────────────────────────────────────────────────────────────
let tmp, dist
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const bodyOf = (h) => h.slice(h.indexOf('<body'))
const textOf = (h) => bodyOf(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map((s) => s.trim()).filter(Boolean)
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const tag = (h, re) => [...headOf(h).matchAll(re)].map((m) => m[1])
const FR_URLS = allLocalizedPaths(['fr'])

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-fr-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('French pages: real static HTML, html lang="fr-FR", no dir, one self-referencing canonical, French title/description/H1, crawlable body', () => {
  for (const p of FR_URLS) {
    const h = page(p)
    const bp = p === '/fr' ? '/' : p.replace(/^\/fr/, '')
    assert.match(h, /^<!doctype html>\s*<html lang="fr-FR">/i, p)
    assert.ok(!/<html[^>]*\sdir=/.test(h), p)
    assert.deepEqual(tag(h, /<link rel="canonical" href="([^"]+)"/g), [absoluteUrl('fr', bp === '/case-studies' ? '/case-studies/graspo' : bp)], `${p} canonical`) // /fr/case-studies shows the default study and canonicalises to it, exactly like the English page
    assert.deepEqual(tag(h, /<meta property="og:locale" content="([^"]+)"/g), ['fr_FR'], p)
    assert.match(h, new RegExp(`<title>${FR_SEO[bp === '/case-studies' ? '/case-studies/graspo' : bp].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`), p)
    assert.equal([...h.matchAll(/<h1[\s>]/g)].length, 1, `${p}: one H1`)
    assert.ok(textOf(h).join(' ').length > 1500, `${p}: crawlable text`)
    assert.ok(h.includes(`data-ssr-path="${p}"`), p)
  }
  const h1 = (p) => page(p).match(/<h1[\s\S]*?<\/h1>/)[0].replace(/<[^>]+>/g, ' ').replace(/[\s\u00a0]+/g, ' ').trim()
  assert.match(h1('/fr'), /^Des vidéos publicitaires pensées pour convertir$/)
  assert.match(h1('/fr/ugc-video-agency'), /^Agence UGC : des vidéos qui captent l’attention\.?$/)
})

test('French pages use the French share image with a French alt text', () => {
  for (const p of FR_URLS) {
    const h = headOf(page(p))
    assert.match(h, /property="og:image" content="https:\/\/www\.convrt\.studio\/og\/convrt-og-fr\.png"/, p)
    assert.match(h, /og:image:alt" content="CONVRT : des vidéos publicitaires/, p)
  }
})

test('robots: indexable French pages have none; the Roadmap and the held free-video page are noindex', () => {
  for (const bp of FR_INDEXABLE) assert.ok(!/name="robots"[^>]*noindex/.test(headOf(page(localizedPath('fr', bp)))), bp)
  for (const bp of ['/creative-growth-roadmap', '/risk-free-trial']) assert.match(headOf(page(localizedPath('fr', bp))), /name="robots" content="noindex, follow"/, bp)
})

test('hreflang in the built HTML: each French page and its English and Spanish twins carry the identical set', () => {
  for (const bp of FR_INDEXABLE) {
    if (bp === '/case-studies') continue // the index is the default study's duplicate: it canonicalises to /case-studies/graspo and carries no hreflang in any language
    const set = (h) => tag(h, /<link rel="alternate" hreflang="([^"]+)" href="[^"]+"/g).join(',') + '|' + tag(h, /<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g).join(',')
    const en = set(page(bp)), fr = set(page(localizedPath('fr', bp)))
    const hasEs = TRANSLATED_PATHS.es.includes(bp) // the case studies exist in French only (so far): their set is en, fr-FR, x-default
    assert.equal(en, fr, bp)
    if (hasEs) assert.equal(set(page(localizedPath('es', bp))), fr, bp)
    const hasAr = TRANSLATED_PATHS.ar.includes(bp) && !['/risk-free-trial', '/creative-growth-roadmap'].includes(bp)
    assert.match(en.split('|')[0], new RegExp(`^en,${hasEs ? 'es,' : ''}fr-FR,${hasAr ? 'ar,' : ''}x-default$`), bp)
  }
  for (const p of ['/fr/creative-growth-roadmap', '/fr/risk-free-trial', '/about', '/contact']) assert.ok(!/hreflang="fr/.test(page(p)), `${p} has no French hreflang`)
})

test('sitemap.xml in the build lists the French URLs once, and every sitemap URL has a built page', () => {
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const p of ['/fr/', '/fr/ugc-video-agency', '/fr/spokesperson-video-production', '/fr/social-media-video-production', '/fr/saas-video-production', '/fr/pricing', '/fr/creator-showcase']) assert.equal(sm.split(`<loc>${SITE_URL}${p}</loc>`).length - 1, 1, p)
  for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) { const u = m[1].replace(SITE_URL, '') || '/'; assert.ok(fs.existsSync(path.join(dist, u === '/' ? 'index.html' : `${u.replace(/^\/|\/$/g, '')}/index.html`)), `sitemap entry without a page: ${u}`) }
})

test('structured data: one stable Organization @id, French WebPage/FAQPage/Service, FAQ markup equals the visible FAQ, no invented facts', () => {
  const en = jsonLd(page('/'))[0]['@graph'].find((n) => n['@type'] === 'Organization')
  for (const p of FR_URLS.filter((u) => !/roadmap|risk-free/.test(u))) {
    const h = page(p)
    const g = jsonLd(h)[0]['@graph']
    const org = g.find((n) => n['@type'] === 'Organization')
    assert.equal(org['@id'], en['@id'], `${p}: one Organization identity`)
    assert.deepEqual(org.address, en.address, 'country-only address, identical to English (no French office)')
    const wp = g.find((n) => /Page$/.test(n['@type']))
    assert.equal(wp.inLanguage, 'fr-FR'); assert.equal(wp.url, `${SITE_URL}${p === '/fr' ? '/fr/' : p === '/fr/case-studies' ? '/fr/case-studies/graspo' : p}`)
    assert.ok(!/Review|AggregateRating|VideoObject/.test(JSON.stringify(g)), `${p}: no fabricated reviews, ratings or video markup`)
    assert.ok(!/"streetAddress"|"addressLocality"|"areaServed"|"telephone"/.test(JSON.stringify(g)), `${p}: no French address, area or phone`)
    const faq = g.find((n) => n['@type'] === 'FAQPage')
    if (faq) for (const q of faq.mainEntity) assert.ok(textOf(h).join(' ').includes(q.name.slice(0, 40)), `${p}: FAQ question is visible: ${q.name.slice(0, 40)}`)
  }
  const pricing = jsonLd(page('/fr/pricing'))[0]['@graph']
  const offers = pricing.flatMap((n) => n.offers ?? [])
  assert.ok(offers.length >= 7)
  for (const o of offers) { assert.equal(o.priceSpecification.priceCurrency, 'EUR'); assert.equal(o.priceSpecification.valueAddedTaxIncluded, false); assert.ok(Object.values(ES_PRICING.amounts).includes(o.priceSpecification.price), String(o.priceSpecification.price)) }
})

test('French pricing page: EUR amounts from the approved table everywhere, commitments exact (Sprint 3 months, Organic 6 months), no USD package price, no placeholder', () => {
  const t = textOf(page('/fr/pricing')).join(' ').replace(/[\u00a0\u202f]/g, ' ')
  for (const a of ['2 750 €', '4 600 €']) assert.ok(t.includes(a), a)
  assert.ok(!/\$\s?\d|USD|\[€/.test(t), 'no dollar amount or placeholder on the French pricing page')
  assert.match(t, /engagement initial de 3 mois, puis mensuel avec un préavis de 30 jours/i)
  assert.match(t, /6 mois de droits d’utilisation dans le monde entier/)
  const full = page('/fr/pricing').replace(/<[^>]+>/g, ' ').replace(/[\u00a0\u202f]/g, ' ')
  for (const a of ['3 250 €', '5 500 €', '1 400 €', '2 300 €', '850 €', '1 375 €', '2 400 €', '1 550 €', '2 500 €', '4 350 €', '225 €']) assert.ok(full.includes(a), a)
  assert.match(full, /engagement initial de six mois|engagement initial de 6 mois/, 'organic: six-month initial commitment')
  assert.match(full, /sans engagement récurrent|sans engagement de renouvellement|sans engagement mensuel/, 'one-off packages do not inherit a recurring commitment')
})

test('French pages contain no leftover English or Spanish: every visible sentence is French except verbatim client quotes (lang="en"), brand and package names', () => {
  const EN = new Set('the and your with you our for are this that from what how will we of its is to can has have be or not it by at an on in as but'.split(' '))
  const FR = new Set('le la les de des du et en que un une avec pour par vos votre notre nos est se ne pas au aux ce cette sur dans qui plus ou à'.split(' '))
  const ES = new Set('el los las y con para por tu tus su sus es no al lo como más pero'.split(' '))
  const verbatim = /It has 9 sales|Roas 5\.28|Mohamed understood the concept|Working with Mohamad|The videos are amazing again|The UGC videos he created|Wait, you|I thought of you because|I know a creative studio|They also offer a Free Creative|Happy to introduce you/
  for (const p of FR_URLS) {
    const lines = textOf(page(p))
    for (const line of lines) {
      if (verbatim.test(line)) continue
      const w = line.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿœæ' ]/g, ' ').split(/\s+/).filter(Boolean)
      if (w.length < 3) continue
      const en = w.filter((x) => EN.has(x)).length, fr = w.filter((x) => FR.has(x)).length, es = w.filter((x) => ES.has(x)).length
      assert.ok(!(en >= 2 && en > fr), `${p}: English text left on the French page: "${line.slice(0, 120)}"`)
      assert.ok(!(es >= 2 && es > fr), `${p}: Spanish text left on the French page: "${line.slice(0, 120)}"`)
    }
  }
})

test('client reviews: French text only (no translation label, no English original, no explanatory note), the owner’s approved French wording, names and logos unchanged', () => {
  const home = page('/fr')
  const t = textOf(home).join(' ')
  assert.ok(!/Traduction française|Avis d’origine|rédigés en anglais/.test(t), 'no translation label, no original label, no note')
  assert.ok(!/<q lang="en">/.test(home) && !/Mohamed understood the concept|Working with Mohamad|The videos are amazing again/.test(home), 'no English original on the French page')
  for (const frag of ['Des vidéos de grande qualité, livrées dans les délais, avec une excellente communication du début à la fin.', 'Les vidéos UGC correspondaient exactement à ce qu’il nous fallait pour développer nos campagnes publicitaires.', 'À chaque collaboration, la qualité s’améliore.', 'Travailler avec Mohamad a été un vrai plaisir.', 'C’est notre troisième commande, et certainement pas la dernière.', 'Ce que nos clients disent de nous.', 'Des collaborations qui durent']) assert.ok(t.replace(/\s+/g, '').includes(frag.replace(/\s+/g, '')), frag)
  for (const b of ['Elyon Dubai', 'Adscale', 'Talk360']) assert.ok(home.includes(b), b)
  assert.ok(/Client fidèle/.test(t) && /Lire l’avis complet/.test(t))
})

test('internal links: translated targets stay in French, every other target is an existing English page and says so (« en anglais »)', () => {
  const known = new Set(['/', '/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production', '/creator-showcase', '/about', '/contact', '/privacy', '/terms', '/legal-notice', '/case-studies', '/case-studies/graspo', '/case-studies/elyon', '/creative-growth-roadmap', '/risk-free-trial', '/es', '/free-hooks', '/referrals', '/blog'])
  for (const p of FR_URLS) {
    const html = bodyOf(page(p))
    for (const m of html.matchAll(/<a ([^>]*)href="(\/[^"#?]*)(?:[#?][^"]*)?"([^>]*)>([\s\S]*?)<\/a>/g)) {
      const href = m[2].replace(/\/$/, '') || '/'
      if (/^\/(fr|es|ar)(\/|$)/.test(href) || /\.(png|svg|webp|jpg|pdf|xml|txt)$/.test(href)) continue
      assert.ok(known.has(href), `${p}: unknown link ${href}`)
      const label = m[4].replace(/<[^>]+>/g, '')
      const sameAsCurrent = /hreflang="en"/i.test(m[1] + m[3]) // the language selector's own English link
      if (/^(\/spokesperson|\/social-media|\/saas|\/about|\/contact|\/case-studies|\/privacy|\/terms|\/legal-notice)/.test(href)) assert.ok(/en anglais|English/.test(label) || sameAsCurrent || /lang="en"/.test(m[1] + m[3]) || /^\s*\(en anglais\)/.test(html.slice(m.index + m[0].length)), `${p}: link to the English-only page ${href} must say so: "${label.slice(0, 60)}"`)
      assert.ok(!['/free-hooks'].includes(href), `${p}: French pages never link to ${href}`) // /referrals is a French page now; /blog is the English blog (labelled)
    }
    assert.ok(!/href="\/free-hooks/.test(html) && !/href="\/referrals/.test(html.replace(/<a [^>]*hreflang="en"[^>]*>[\s\S]*?<\/a>/gi, '')), p) // the language selector's English alternate is the only allowed link to an English referral page
  }
})

test('French pages: no VideoObject, no invented claims; CONVRT presents no French office or local team; founder figures stay attributed', () => {
  for (const p of FR_URLS) {
    const t = textOf(page(p)).join(' ')
    assert.ok(!/bureau à (Paris|Lyon)|notre bureau|notre équipe (parisienne|française)|basés? (à|en) (Paris|France)|garantie? (de )?(ROAS|conversions|ventes)/i.test(t), p)
  }
  const home = textOf(page('/fr')).join(' ')
  // Revision 3: the stage is the founder-experience section (500+ clients), not a case study; the figures stay attributed to the founder's combined experience, once, concisely.
  assert.match(home, /Expérience du fondateur/i)
  assert.match(home, /Plus de 500 clients accompagnés/)
  assert.match(home, /Une expérience acquise chez CONVRT et au fil de collaborations dans la production créative\./)
  assert.match(home, /Expérience cumulée du fondateur, chez CONVRT et au fil de ses précédentes collaborations\./, 'the figures that remain are attributed to the founder’s combined experience')
  assert.ok(!/Un premier projet|Cas client/i.test(home), 'no longer an individual case study')
})

test('the standing « independent creators » paragraph is gone from the French showcase and UGC page (owner, 2026-11-24); provenance lives in the data', () => {
  for (const p of ['/fr/creator-showcase', '/fr/ugc-video-agency']) {
    const t = textOf(page(p)).join(' ')
    assert.ok(!/pas (forcément|nécessairement) des productions (de )?CONVRT/.test(t), p)
    assert.ok(!/Créateur · Français|UGC · Français/.test(t), `${p}: no generic creator/language pill`)
  }
})

test('conversion journey: French pages route into the French Roadmap, never into English-only forms; privacy link says it is in English', () => {
  for (const p of FR_URLS) {
    const html = bodyOf(page(p))
    assert.ok(!/href="\/creative-growth-roadmap"/.test(html) || /fr\/creative-growth-roadmap/.test(html), p)
    assert.ok(!/href="\/(risk-free-trial|free-hooks)"/.test(html.replace(/<a [^>]*hreflang="en"[^>]*>[\s\S]*?<\/a>/gi, '')), `${p}: no link into the English forms`)
  }
  assert.match(bodyOf(page('/fr')), /href="\/fr\/creative-growth-roadmap"/)
  assert.match(bodyOf(page('/fr')), /href="\/fr\/risk-free-trial"/)
  assert.match(textOf(page('/fr/risk-free-trial')).join(' ').replace(/[\u00a0\u202f]/g, ' '), /politique de confidentialité \(en anglais\)/i)
  assert.ok(!/type="checkbox"/.test(bodyOf(page('/fr/risk-free-trial'))), 'no marketing checkbox in the held French free-video form')
})

test('UGC page: French-only overview with figures read from the data; English and Spanish pages unchanged by it', () => {
  const fr = textOf(page('/fr/ugc-video-agency')).join(' ').replace(/[\u00a0\u202f]/g, ' ')
  assert.match(fr, /Des publicités UGC pensées pour votre marque/)
  // Revision 4 (owner brief): the four blocks are short; the figures (read from the business data) live in the FAQ answers and the pricing page.
  assert.match(fr, /Des formules mensuelles ou ponctuelles, avec des droits d’utilisation clairement définis/)
  assert.match(fr, /commencent à 2 750 € par mois/)
  assert.match(fr, /formules ponctuelles sont à 3 250 € pour le Creative Testing Sprint et à 5 500 €/)
  assert.match(fr, /6 mois de droits d’utilisation mondiaux/)
  assert.match(fr, /engagement de 3 mois, puis se poursuivent mois par mois avec un préavis de résiliation de 30 jours/)
  for (const p of ['/ugc-video-agency', '/es/ugc-video-agency']) assert.ok(!/ugc-overview-heading/.test(page(p)), p)
})

test('English and Spanish keep their language, canonical and robots', () => {
  assert.match(page('/'), /<html lang="en">/); assert.match(page('/es/'), /<html lang="es">/)
  assert.deepEqual(tag(page('/es/pricing'), /<link rel="canonical" href="([^"]+)"/g), [`${SITE_URL}/es/pricing`])
  assert.ok(LIVE_LOCALES.includes('es') && LIVE_LOCALES.includes('fr'))
})
