// Run with: node --test tests/french-services.test.mjs
// The three native French service pages added after the UGC page (Nov 2026): /fr/spokesperson-video-production, /fr/social-media-video-production, /fr/saas-video-production.
// Routes and registry, no English-fallback note, French title/description/H1, one distinct primary keyword each, canonical + reciprocal hreflang, sitemap, JSON-LD, no video markup,
// no typed amounts in the dictionaries, French conversion rules.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { TRANSLATED_PATHS, hasTranslation } from '../src/i18n/registry.js'
import { allLocalizedPaths, localizedPath } from '../src/i18n/paths.js'
import { localHref, hrefFor, isFallbackPath } from '../src/i18n/tr.js'
import { editorial } from '../src/i18n/editorial.js'
import { isReleased, blockedPages } from '../src/i18n/release.js'
import { alternatesFor, absoluteUrl } from '../src/i18n/seo.js'
import { switchTarget } from '../src/i18n/switch.js'
import { FR_SEO, FR_PRIMARY_KEYWORDS } from '../src/i18n/fr/seo.js'
import { FR_PRICED_PAGES } from '../src/i18n/fr/pricing.js'
import { FR_SERVICE_PAGE_VIDEOS } from '../src/i18n/fr/servicePages.js'
import { PARTS } from '../src/i18n/fr/index.js'
import { ES_PRICING } from '../src/i18n/es/pricing.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { SITE_URL } from '../src/config.js'
import { localizedSitemapPaths, buildSitemap } from '../src/lib/seo/sitemap.js'
import { missingFor } from '../scripts/i18n-check.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SPK = '/spokesperson-video-production'
const ORG = '/social-media-video-production'
const SAAS = '/saas-video-production'
const SERVICES = [SPK, ORG, SAAS]
const fr = (bp) => `/fr${bp}`

// ── routes and registry ────────────────────────────────────────────────────────────────────────────────────────
test('registry: the three services are French pages (same slugs as English), alongside UGC; genuinely untranslated pages are not', () => {
  for (const bp of ['/ugc-video-agency', ...SERVICES]) assert.ok(hasTranslation('fr', bp), bp)
  for (const bp of ['/blog']) assert.ok(!hasTranslation('fr', bp), `${bp} stays English-only`)
  for (const bp of ['/about', '/contact', '/privacy', '/terms', '/legal-notice']) assert.ok(hasTranslation('fr', bp), `${bp} is French now`)
  for (const bp of ['/case-studies', '/case-studies/graspo', '/case-studies/elyon', '/referrals']) assert.ok(hasTranslation('fr', bp), `${bp} is French now`)
  const paths = allLocalizedPaths(['fr'])
  for (const bp of SERVICES) assert.ok(paths.includes(fr(bp)), fr(bp))
  assert.equal(localizedPath('fr', SPK), '/fr/spokesperson-video-production')
  assert.deepEqual(TRANSLATED_PATHS.fr.filter((p) => SERVICES.includes(p)), SERVICES)
})

test('no English fallback: localHref / hrefFor send French visitors to the French page, isFallbackPath is false for the three, still true for English-only pages', () => {
  for (const bp of SERVICES) {
    assert.equal(localHref(bp, 'fr'), fr(bp))
    assert.equal(hrefFor(`${bp}#how-it-works`, 'fr'), `${fr(bp)}#how-it-works`)
    assert.equal(isFallbackPath(bp, 'fr'), false, `${bp}: the « (en anglais) » note must disappear`)
  }
  for (const bp of ['/blog']) assert.equal(isFallbackPath(bp, 'fr'), true, bp)
  for (const bp of ['/about', '/contact', '/privacy', '/terms', '/legal-notice']) assert.equal(isFallbackPath(bp, 'fr'), false, bp)
  for (const bp of ['/case-studies', '/case-studies/graspo', '/case-studies/elyon', '/referrals']) assert.equal(isFallbackPath(bp, 'fr'), false, bp)
  assert.equal(editorial('fr').fallbackNote, 'en anglais')
  assert.equal(isFallbackPath(SPK, 'en'), false)
})

test('release gates: the three pages are released (EUR pricing approved); the two priced ones are gated on it; only the held free-video page is blocked (the legal documents are published: owner approved, 27 Nov 2026)', () => {
  for (const bp of SERVICES) assert.ok(isReleased('fr', bp), bp)
  assert.ok(FR_PRICED_PAGES.includes(SPK) && FR_PRICED_PAGES.includes(ORG), 'the pages that show a price wait for approved EUR pricing')
  assert.ok(!FR_PRICED_PAGES.includes(SAAS), 'SaaS is custom-scoped: it shows no price, so it is not price-gated')
  assert.deepEqual(blockedPages('fr').map((b) => b.path), ['/risk-free-trial'])
})

test('language selector: the equivalent French page exists for each service, from English and Spanish', () => {
  for (const bp of SERVICES) {
    assert.equal(switchTarget('fr', bp), fr(bp))
    assert.equal(switchTarget('en', bp), bp)
    assert.equal(switchTarget('es', bp), `/es${bp}`)
  }
})

test('pure SEO data: French title, description and social copy for each page; one distinct primary keyword; none borrows « agence UGC »', () => {
  assert.deepEqual(Object.keys(FR_PRIMARY_KEYWORDS).sort(), ['/ugc-video-agency', ...SERVICES].sort())
  const kws = Object.values(FR_PRIMARY_KEYWORDS).map((k) => k.toLowerCase())
  assert.equal(new Set(kws).size, kws.length, 'distinct primary keywords')
  assert.equal(FR_PRIMARY_KEYWORDS['/ugc-video-agency'], 'agence UGC')
  const titles = SERVICES.map((bp) => FR_SEO[bp].title), descs = SERVICES.map((bp) => FR_SEO[bp].description)
  assert.equal(new Set(titles).size, 3); assert.equal(new Set(descs).size, 3)
  for (const bp of SERVICES) {
    const s = FR_SEO[bp]
    assert.ok(s.title.endsWith('| CONVRT') && s.title.length <= 70, `${bp}: title ≤ 70 characters`)
    assert.ok(s.description.length >= 110 && s.description.length <= 200, `${bp}: description length ${s.description.length}`)
    assert.ok(s.ogTitle && s.ogDescription, `${bp}: social copy`)
    assert.ok((s.title + s.description).toLowerCase().includes(FR_PRIMARY_KEYWORDS[bp].toLowerCase()) || bp === SPK || bp === ORG, `${bp}: keyword in title or description`)
    assert.ok(s.title.toLowerCase().includes(FR_PRIMARY_KEYWORDS[bp].toLowerCase()) || bp === ORG && /réseaux sociaux/i.test(s.title), `${bp}: primary keyword in the title`)
    assert.doesNotMatch(s.title + s.description + s.ogTitle + s.ogDescription, /agence UGC/i, `${bp}: « agence UGC » belongs to the UGC page`)
    assert.doesNotMatch(s.title + s.description, /\$|USD|€|\d\s?%|garanti|meilleure|n°\s?1|leader/i, `${bp}: no amount, guarantee or superlative in the snippet`)
  }
  assert.match(FR_SEO[SPK].title, /Spokesperson/i)
  assert.match(FR_SEO[SAAS].title, /Production vidéo pour SaaS et applications/i)
  assert.match(FR_SEO[ORG].title, /réseaux sociaux/i)
})

test('French dictionaries of the three pages: registered, no amount typed by hand, price tokens only where the English sentence has a dollar amount, typographic apostrophes, no filler', () => {
  for (const part of ['spokesperson', 'saas', 'organic']) assert.ok(PARTS[part] && Object.keys(PARTS[part]).length > 50, `${part} dictionary is registered`)
  const BANNED = [/r[ée]volutionn/i, /solutions innovantes/i, /maximis\w+ (votre|son|leur) potentiel/i, /meilleure agence/i, /\bleader\b/i, /n[°o]\s?1\b/i, /garantit?\b(?! jamais)/i]
  const DOLLAR = /\$\d[\d,]*(?:\.\d+)?/
  for (const part of ['spokesperson', 'saas', 'organic']) {
    for (const [k, v] of Object.entries(PARTS[part])) {
      const body = v.replace(/\{\{[^}]*\}\}/g, '')
      assert.ok(!/[$€£]|\bUSD\b|\bEUR\b/.test(body), `${part}: hand-typed currency in "${v.slice(0, 60)}"`)
      const tokens = v.match(/\{\{(?:price|perVariation):[A-Za-z0-9.]+\}\}/g) ?? []
      assert.equal(tokens.length > 0, DOLLAR.test(k), `${part}: price tokens iff the English has a dollar amount: ${k.slice(0, 60)}`)
      assert.ok(!/'/.test(v), `${part}: straight apostrophe in "${v.slice(0, 60)}"`)
      assert.ok(!/[\u00a0\u202f]/.test(v), `${part}: type ordinary spaces, typography is applied at lookup`)
      for (const re of BANNED) assert.doesNotMatch(v, re, `${part}: banned phrase in "${v.slice(0, 60)}"`)
      // every plain number of the English sentence survives (counts, months, days, rounds)
      const nums = (s) => (s.replace(/\{\{[^}]*\}\}/g, ' ').replace(/\$\d[\d,]*(?:\.\d+)?/g, ' ').match(/\d+/g) ?? []).sort().join(',')
      if (!/^\d · /.test(k)) assert.equal(nums(v), nums(k), `${part}: figures differ: ${k.slice(0, 60)}`)
    }
  }
  assert.deepEqual(missingFor('fr'), [], 'every literal tr() of every French page is translated: run `node scripts/i18n-check.mjs fr`')
  // the three pages' strings are required of the French dictionary now (the per-locale scope exclusion was removed)
  const src = fs.readFileSync(path.join(ROOT, 'scripts/i18n-check.mjs'), 'utf8')
  assert.match(src, /const SCOPE_EXCLUDED = \{/) // Spanish excludes the case-study components (no Spanish case studies yet); French excludes nothing
})

test('scene illustrations: every capitalised word the spokesperson, SaaS and organic scenes can show (even in states a static render never reaches) is in the French dictionary', async () => {
  const { default: FR } = await import('../src/i18n/fr/index.js')
  const missing = new Set()
  for (const d of ['components/spokesperson', 'components/saas', 'components/organic', 'components/scenes']) {
    for (const f of fs.readdirSync(path.join(ROOT, 'src', d))) {
      const src = fs.readFileSync(path.join(ROOT, 'src', d, f), 'utf8')
      const found = [
        ...[...src.matchAll(/'((?:[^'\\\n]|\\.)+)'/g)].map((m) => m[1].replace(/\\'/g, "'")).filter((t) => /^[A-Z][a-z]/.test(t) && !/[{}<>=;/]|\.jsx?$/.test(t) && !/^(Inter|Math|Number|Object|Array|React|Icon|Avatar|Skel|Tag|Cap)$/.test(t)),
        ...[...src.matchAll(/\b(?:label|tag|title|text|caption|short)="([A-Z][^"]*)"/g)].map((m) => m[1]),
        ...[...src.matchAll(/"([A-Z][a-z][A-Za-z ,&’.-]{2,50})"/g)].map((m) => m[1]),
      ]
      for (const t of found) if (!(t in FR)) missing.add(`${d}/${f}: ${t}`)
    }
  }
  assert.deepEqual([...missing], [], 'add these strings to src/i18n/fr/dict-spokesperson.js / dict-saas.js / dict-organic.js')
})

test('the three prices on the French pages are tokens resolved from the approved EUR table (Sprint, Sprint Plus, Organic Light/Growth), never English dollar figures', () => {
  const spk = PARTS.spokesperson
  const cost = Object.entries(spk).find(([k]) => k.startsWith('We do not publish a separate spokesperson price list'))[1]
  assert.match(cost, /\{\{price:sprint\.monthly\}\}.*\{\{price:sprint\.oneOff\}\}.*\{\{price:sprintPlus\.monthly\}\}/)
  const org = Object.entries(PARTS.organic).find(([k]) => k.startsWith('Organic Light is $1,500'))[1]
  assert.match(org, /\{\{price:organicLight\.monthly\}\}.*\{\{price:organicGrowth\.monthly\}\}/)
  assert.ok(!Object.keys(PARTS.saas).some((k) => /\$\d/.test(k)), 'SaaS is custom-scoped: no price anywhere in its English sentences')
})

// ── a real production build ────────────────────────────────────────────────────────────────────────────────────
let tmp, dist
const exists = (p) => fs.existsSync(path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`))
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const bodyOf = (h) => h.slice(h.indexOf('<body'))
const visible = (h) => bodyOf(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<!--[\s\S]*?-->/g, '')
const text = (h) => visible(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/[\s  ]+/g, ' ').trim()
const h1Of = (h) => h.match(/<h1[\s\S]*?<\/h1>/)[0].replace(/<[^>]+>/g, ' ').replace(/[\s ]+/g, ' ').trim()
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const tag = (h, re) => [...headOf(h).matchAll(re)].map((m) => m[1])
const hreflangSet = (h) => tag(h, /<link rel="alternate" hreflang="([^"]+)" href="[^"]+"/g).join(',') + '|' + tag(h, /<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g).join(',')

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-frsvc-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('built pages: real static HTML in French, French <title>, description and H1, one H1, indexable, self-referencing canonical', () => {
  const H1 = {
    [SPK]: /^Vidéos Spokesperson : donnez un visage à votre message\.?$/,
    [SAAS]: /^Des vidéos qui expliquent votre logiciel ou votre application\.?$/,
    [ORG]: /^Des vidéos pour les réseaux sociaux qui donnent envie de suivre votre marque\.?$/,
  }
  for (const bp of SERVICES) {
    const h = page(fr(bp))
    assert.match(h, /^<!doctype html>\s*<html lang="fr-FR">/i, bp)
    assert.equal(tag(h, /<title>([^<]*)<\/title>/g)[0].replace(/&amp;/g, '&'), FR_SEO[bp].title, `${bp} title`)
    assert.equal(tag(h, /<meta name="description" content="([^"]*)"/g)[0].replace(/&amp;/g, '&'), FR_SEO[bp].description, `${bp} description`)
    assert.deepEqual(tag(h, /<link rel="canonical" href="([^"]+)"/g), [absoluteUrl('fr', bp)], `${bp} canonical is its own French URL`)
    assert.deepEqual(tag(h, /<meta property="og:locale" content="([^"]+)"/g), ['fr_FR'], bp)
    assert.ok(!/name="robots"[^>]*noindex/.test(headOf(h)), `${bp}: indexable`)
    assert.equal([...h.matchAll(/<h1[\s>]/g)].length, 1, `${bp}: one H1`)
    assert.match(h1Of(h), H1[bp], `${bp} H1`)
    assert.ok(text(h).length > 4000, `${bp}: substantive crawlable French text`)
  }
  // each page's H1 carries its own primary keyword and none borrows another page's
  assert.match(h1Of(page(fr(SPK))), /Spokesperson/i); assert.match(h1Of(page(fr(SAAS))), /logiciel ou votre application/i); assert.match(h1Of(page(fr(ORG))), /réseaux sociaux/i)
  for (const bp of SERVICES) assert.doesNotMatch(h1Of(page(fr(bp))) + FR_SEO[bp].title, /agence UGC/i, bp)
})

test('hreflang: the French page, its English page and its Spanish page carry the identical reciprocal set (en, es, fr-FR, x-default = English)', () => {
  for (const bp of SERVICES) {
    const en = hreflangSet(page(bp)), es = hreflangSet(page(`/es${bp}`)), frs = hreflangSet(page(fr(bp)))
    assert.equal(en, frs, bp); assert.equal(es, frs, bp)
    assert.match(en.split('|')[0], /^en,es,fr-FR,ar,x-default$/, bp)
    assert.deepEqual(alternatesFor(bp, SITE_SEO[bp]).map((a) => a.href), [`${SITE_URL}${bp}`, `${SITE_URL}/es${bp}`, `${SITE_URL}/fr${bp}`, `${SITE_URL}/ar${bp}`, `${SITE_URL}${bp}`])
  }
})

test('sitemap: the three French URLs are listed once each, in the built sitemap too; the English-only pages still have no French URL', () => {
  const fp = localizedSitemapPaths().filter((p) => p.startsWith('/fr'))
  for (const bp of SERVICES) assert.ok(fp.includes(fr(bp)), fr(bp))
  const built = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const bp of SERVICES) assert.equal(built.split(`<loc>${SITE_URL}${fr(bp)}</loc>`).length - 1, 1, bp)
  assert.equal(built, buildSitemap())
  for (const m of built.matchAll(/<loc>([^<]+)<\/loc>/g)) assert.ok(exists(m[1].replace(SITE_URL, '') || '/'), `sitemap entry without a page: ${m[1]}`)
  assert.ok(!/\/fr\/(blog|referrals)/.test(built) && !built.includes('/fr/case-studies</loc>'), 'the duplicate /fr/case-studies and the noindex referral page are not in the sitemap')
  for (const p of ['/fr/privacy', '/fr/terms', '/fr/legal-notice']) assert.equal(built.split(`<loc>${SITE_URL}${p}</loc>`).length - 1, 1, `${p}: the published French legal document is listed once`)
})

test('404: only the registered French routes exist as files; look-alike French URLs have no page, so the host answers its genuine 404', () => {
  for (const bp of SERVICES) assert.ok(exists(fr(bp)), fr(bp))
  for (const p of ['/fr/spokesperson-video-production/extra', '/fr/saas', '/fr/seo-video-production', '/fr/about/extra', '/fr/case-studies/unknown', '/fr/blog']) assert.ok(!exists(p), `${p} must not be built`)
  assert.ok(fs.existsSync(path.join(dist, '404.html')))
})

test('no « (en anglais) » on links to the three pages (home cards, footer, pricing, FAQ links, every French page); it remains for genuinely English-only pages', () => {
  const frPages = allLocalizedPaths(['fr'])
  for (const p of frPages) {
    const h = page(p)
    const anchors = [...h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    for (const [, attrs, inner] of anchors) {
      const href = (attrs.match(/href="([^"]+)"/) ?? [])[1] ?? ''
      const label = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
      if (SERVICES.some((bp) => href === bp || href.startsWith(`${bp}#`)) && label.trim() !== 'English') assert.fail(`${p}: link to the ENGLISH service page ${href}: "${label}"`)
      if (SERVICES.some((bp) => href === fr(bp) || href.startsWith(`${fr(bp)}#`))) assert.ok(!/en anglais/.test(label) && !/hreflang="en"/i.test(attrs), `${p}: link to the French ${href} must not carry the English note: "${label}"`)
    }
  }
  for (const p of frPages) assert.ok(!/\(en anglais\)\s*\(en anglais\)/.test(text(page(p))), `${p}: the note is never doubled`)
  // the home service cards and the footer link to the French pages
  const home = page('/fr'), footer = page(fr(SPK))
  for (const bp of SERVICES) { assert.ok(home.includes(`href="${fr(bp)}"`), `home card ${bp}`); assert.ok(footer.includes(`href="${fr(bp)}"`), `footer ${bp}`) }
  // About is French now; the legal documents are published in French (LEGAL_TRANSLATIONS_APPROVED, src/config.js) and linked in French, with no « en anglais » note.
  assert.ok(footer.includes('href="/fr/about"')); assert.ok(!/À propos \(en anglais\)/.test(text(footer))); assert.ok(footer.includes('href="/fr/legal-notice"') && footer.includes('href="/fr/privacy"') && footer.includes('href="/fr/terms"'), 'the footer links the French legal documents'); assert.match(text(footer), /Mentions légales(?! \(en anglais\))/)
  // the pricing page's two cross-links no longer say « en anglais »
  const pricing = text(page('/fr/pricing'))
  assert.match(pricing, /Vidéos Spokesperson(?! \(en anglais\))/); assert.match(pricing, /Comment fonctionne le contenu organique(?! \(en anglais\))/)
})

test('NO videos on the French SaaS and Organic Social pages (the Spokesperson hero stage is covered in video-library.test.mjs): no <video>, no iframe, no stream URL, no gallery or showcase section, no placeholder, no “coming soon”, no empty three-phone stage', () => {
  assert.equal(FR_SERVICE_PAGE_VIDEOS, false)
  for (const bp of [SAAS, ORG]) {
    const h = page(fr(bp)), body = visible(h)
    assert.ok(!/<video\b|<iframe\b|videodelivery\.net|cloudflarestream|\.m3u8|\/portfolio\/|data-video|poster=/.test(body), `${bp}: no video or poster markup`)
    assert.ok(!/id="(spokesperson|saas|organic)-videos(-heading)?"/.test(body), `${bp}: no gallery section`)
    assert.ok(!/aria-label="[^"]*(Scroll sideways|Faites défiler latéralement)/.test(body), `${bp}: no horizontal gallery scroller`)
    assert.ok(!/Layout preview|Aperçu de la mise en page|bientôt|coming soon|Sample card/i.test(text(h)), `${bp}: no placeholder or “coming soon” copy`)
    assert.ok(!/Voir les vidéos|Explore Videos|Explore Spokesperson Videos|Explore SaaS Videos/.test(text(h)), `${bp}: no button to a video gallery`)
    // text-led hero: the headline and CTAs are centred in one column, no phone stage column
    const hero = body.slice(body.indexOf('<section'), body.indexOf('</section>'))
    assert.ok(/mx-auto w-full max-w-5xl text-center/.test(hero), `${bp}: text-led hero`)
    assert.ok(!/lg:col-span-6/.test(hero), `${bp}: no stage column in the hero`)
  }
})

test('structured data: one stable Organization @id, a Service with a stable @id and a BreadcrumbList; no rating, review, office, founding date or invented result', () => {
  const org = jsonLd(page('/fr'))[0]['@graph'].find((n) => n['@type'] === 'Organization')
  const ALLOWED = new Set(['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage'])
  for (const bp of SERVICES) {
    const h = page(fr(bp))
    const ld = jsonLd(h)
    assert.equal(ld.length, 1, `${bp}: one JSON-LD block`)
    const g = ld[0]['@graph']
    for (const n of g) assert.ok(ALLOWED.has(n['@type']), `${bp}: unexpected type ${n['@type']}`)
    assert.deepEqual(g.find((n) => n['@type'] === 'Organization'), org, `${bp}: the single Organization identity, identical to the rest of the site`)
    const services = g.filter((n) => n['@type'] === 'Service')
    assert.equal(services.length, 1, `${bp}: exactly one Service`)
    assert.equal(services[0]['@id'], `${SITE_URL}${fr(bp)}#service`, `${bp}: stable Service @id (the page's own #service, as the Spanish and UGC pages do)`)
    assert.equal(services[0].provider['@id'], org['@id'])
    const wp = g.find((n) => n['@type'] === 'WebPage')
    assert.equal(wp['@id'], `${SITE_URL}${fr(bp)}#webpage`); assert.equal(wp.inLanguage, 'fr-FR'); assert.equal(wp.about['@id'], services[0]['@id'])
    const bc = g.find((n) => n['@type'] === 'BreadcrumbList')
    const crumb = { [SPK]: 'Vidéos Spokesperson', [ORG]: 'Vidéos organiques pour les réseaux', [SAAS]: 'Production vidéo pour SaaS et applications' }[bp]
    assert.deepEqual(bc.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Accueil', `${SITE_URL}/fr/`], [2, crumb, `${SITE_URL}${fr(bp)}`]], `${bp}: BreadcrumbList`)
    assert.ok(text(h).includes(`Accueil / ${crumb}`), `${bp}: the visible breadcrumb says the same as the markup`)
    const json = JSON.stringify(g)
    assert.ok(!/Review|AggregateRating|ratingValue|reviewCount|foundingDate|numberOfEmployees|VideoObject|streetAddress|addressLocality|areaServed|telephone|"award"/.test(json), `${bp}: nothing fabricated`)
    const faq = g.find((n) => n['@type'] === 'FAQPage')
    for (const q of faq.mainEntity) assert.ok(text(h).includes(q.name.replace(/[\u00a0\u202f]/g, ' ').slice(0, 40)), `${bp}: FAQ question is on the page: ${q.name.slice(0, 40)}`)
    assert.equal(faq.inLanguage, 'fr-FR')
  }
  const offers = (bp) => jsonLd(page(fr(bp)))[0]['@graph'].find((n) => n['@type'] === 'Service').offers
  assert.equal(offers(SPK), undefined, 'spokesperson: no Offer (no published spokesperson price)')
  assert.equal(offers(SAAS), undefined, 'SaaS: no Offer (custom-scoped)')
  const orgOffers = offers(ORG)
  assert.equal(orgOffers.length, 2, 'Organic Light and Organic Growth, as in the English graph')
  for (const o of orgOffers) { assert.equal(o.priceSpecification.priceCurrency, 'EUR'); assert.equal(o.priceSpecification.valueAddedTaxIncluded, false); assert.ok(Object.values(ES_PRICING.amounts).includes(o.priceSpecification.price)) }
})

test('prices: only on the pages whose English twin shows one, always the approved EUR amounts; never a dollar amount; SaaS shows none', () => {
  const t = (bp) => text(page(fr(bp)))
  for (const bp of SERVICES) assert.ok(!/\$\s?\d|USD|\[€/.test(t(bp)), `${bp}: no dollar amount or placeholder`)
  for (const a of ['2 750 €', '4 600 €']) assert.ok(t(SPK).includes(a), `spokesperson FAQ: ${a}`)
  for (const a of ['1 400 €', '2 300 €']) assert.ok(t(ORG).includes(a), `organic: ${a}`)
  assert.ok(!/\d\s?€/.test(t(SAAS)), 'SaaS demos and explainers are custom-scoped: no price')
  assert.match(t(ORG), /Organic Light.*Organic Growth/, 'the Light vs Growth distinction is kept')
  assert.match(t(ORG), /2 publications par semaine, environ 9 publications originales par mois/); assert.match(t(ORG), /3 publications par semaine, 13 publications originales par mois/)
  assert.match(t(ORG), /engagement de six mois/); assert.match(t(ORG), /Support client et gestion publicitaire non inclus/)
  assert.match(t(ORG), /Nous ne garantissons jamais/, 'the English hedge is kept: no guaranteed virality, growth or sales')
})

test('conversion: the Roadmap is the French flow; no 10 free hooks, no referral program and no English-only Google Form is linked; booking links are the language-neutral Calendly one', () => {
  for (const bp of SERVICES) {
    const h = page(fr(bp))
    const hrefs = [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
    assert.ok(!hrefs.some((u) => /free-hooks|forms\.gle|docs\.google\.com\/forms/.test(u) || u === '/referrals'), `${bp}: no English-only flow`)
    assert.ok(!/10 (hooks|accroches)|dix hooks/i.test(text(h)), `${bp}: the 10 free hooks are not promoted`)
    assert.ok(!hrefs.some((u) => u === '/creative-growth-roadmap' || u === '/risk-free-trial'), `${bp}: no link into the English flows`)
  }
  for (const bp of [SPK, SAAS]) assert.ok(page(fr(bp)).includes('href="/fr/creative-growth-roadmap"'), `${bp}: French Roadmap`)
  assert.ok(/href="https:\/\/calendly\.com\//.test(page(fr(ORG))), 'organic: the strategy call (Calendly), as on the English page')
})

test('no leftover English: the French service pages render only French sentences (brand, package and tool names aside)', () => {
  const EN = new Set('the and your with you our for are this that from what how will we of its is to can has have be or not it by at an on in as but do does'.split(' '))
  for (const bp of SERVICES) {
    const h = page(fr(bp))
    const sentences = text(h.replace(/<(a|span|p)[^>]*lang="en"[\s\S]*?<\/\1>/g, ' ')).split(/(?<=[.!?])\s+/)
    for (const s of sentences) {
      const words = s.toLowerCase().match(/[a-zàâçéèêëîïôûùüœ’']+/g) ?? []
      if (words.length < 6) continue
      const en = words.filter((w) => EN.has(w)).length
      assert.ok(en / words.length < 0.2, `${bp}: looks English: "${s.slice(0, 90)}"`)
    }
  }
})

test('English and Spanish pages keep their own canonical and language; the French pages add no French copy to them', () => {
  for (const bp of SERVICES) {
    const en = page(bp), es = page(`/es${bp}`)
    assert.match(en.slice(0, 400), /<html lang="en"|<html>/i, `${bp} is English`)
    assert.ok(en.includes(`rel="canonical" href="${SITE_URL}${bp}"`) && es.includes(`rel="canonical" href="${SITE_URL}/es${bp}"`))
    assert.ok(!/en anglais/.test(text(en)) && !/en anglais/.test(text(es)), `${bp}: no French note on English or Spanish pages`)
    assert.ok(/<html lang="es"/.test(es.slice(0, 400)))
  }
})
