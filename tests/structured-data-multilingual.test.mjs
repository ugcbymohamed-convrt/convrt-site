/* Multilingual structured data and metadata regression (Phase 5, audit F2-3, F2-4, F2-6, F2-9). Runs on a REAL production build, so what is checked is the prerendered HTML a crawler receives
   (no JavaScript involved): all 56 canonical sitemap pages in English, Spanish, French and Arabic. */
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://www.convrt.studio'
const ORG_ID = `${SITE}/#organization`, WEBSITE_ID = `${SITE}/#website`
const HTML_LANG = { en: 'en', es: 'es', fr: 'fr-FR', ar: 'ar' }
const OG = { en: 'en_US', es: 'es_ES', fr: 'fr_FR', ar: 'ar_AR' }
const LOCALES = ['en', 'es', 'fr', 'ar']
const SERVICE_PAGES = ['/ugc-video-agency', '/spokesperson-video-production', '/social-media-video-production', '/saas-video-production']

let tmp, dist, pages
const localeOf = (p) => LOCALES.find((l) => l !== 'en' && (p === `/${l}` || p === `/${l}/` || p.startsWith(`/${l}/`))) ?? 'en'
const baseOf = (p, l) => (l === 'en' ? p : p.slice(l.length + 1) || '/')
const fileOf = (p) => path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`)
const walk = (o, out = []) => { if (Array.isArray(o)) o.forEach((v) => walk(v, out)); else if (o && typeof o === 'object') { out.push(o); Object.values(o).forEach((v) => walk(v, out)) } return out }
const isPage = (n) => ['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage'].includes(n['@type'])

before(async () => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-sd-')))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '') || '/').map((p) => {
    const html = fs.readFileSync(fileOf(p), 'utf8')
    const head = html.slice(0, html.indexOf('</head>'))
    const nodes = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((m) => { const j = JSON.parse(m[1]); return j['@graph'] ?? [j] })
    const locale = localeOf(p)
    return {
      p, locale, base: baseOf(p, locale), html, head, nodes,
      title: head.match(/<title>([\s\S]*?)<\/title>/)?.[1],
      description: head.match(/<meta name="description" content="([^"]*)"/)?.[1],
      canonical: head.match(/<link rel="canonical" href="([^"]*)"/)?.[1],
      lang: html.match(/<html[^>]*lang="([^"]*)"/)?.[1],
      hreflang: [...head.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [m[1], m[2]]),
      ogLocale: head.match(/property="og:locale" content="([^"]*)"/)?.[1],
      ogAlt: [...head.matchAll(/property="og:locale:alternate" content="([^"]*)"/g)].map((m) => m[1]),
      ogTitle: head.match(/property="og:title" content="([^"]*)"/)?.[1],
    }
  })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })
const unesc = (s) => s?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

test('the audit covers all 56 canonical sitemap pages (14 per language) and every one carries JSON-LD in its static HTML', () => {
  assert.equal(pages.length, 56)
  for (const l of LOCALES) assert.equal(pages.filter((x) => x.locale === l).length, 14, l)
  for (const x of pages) assert.ok(x.nodes.length >= 2, `${x.p}: JSON-LD is in the prerendered HTML`)
})

test('one Organization entity in every language: same @id, name, url (trailing slash), logo, email, profiles and languages; only the description is localized (audit F2-9)', () => {
  const orgs = pages.map((x) => [x, x.nodes.find((n) => n['@type'] === 'Organization')])
  const ref = orgs.find(([x]) => x.p === '/')[1]
  assert.equal(ref['@id'], ORG_ID)
  assert.equal(ref.url, `${SITE}/`)
  const { description: _d, ...refRest } = ref
  const descriptions = new Map()
  for (const [x, org] of orgs) {
    assert.ok(org, x.p)
    const { description, ...rest } = org
    assert.deepEqual(rest, refRest, `${x.p}: same Organization entity`)
    descriptions.set(x.locale, description)
    if (x.locale === 'ar') assert.match(description, /[؀-ۿ]/, `${x.p}: Arabic description`)
    else assert.equal(description === ref.description, x.locale === 'en', `${x.p}: description language`)
  }
  assert.match(descriptions.get('es'), /estudio creativo de marketing en vídeo/)
  assert.match(descriptions.get('fr'), /studio de marketing vidéo créatif/)
  assert.ok(!/office|oficina|bureau|مكتب|award|premio|prix |جائزة|\d+\s?(clients|clientes)/i.test(descriptions.get('es') + descriptions.get('fr') + descriptions.get('ar')), 'the translated description adds no claim')
})

test('every page: WebPage url = canonical, name = SEO title, description = meta description, inLanguage = the page language; ids are stable and resolvable', () => {
  for (const x of pages) {
    const web = x.nodes.find(isPage)
    assert.ok(web, `${x.p}: a WebPage-type node`)
    assert.equal(web.url, x.canonical, `${x.p}: url equals the canonical`)
    assert.equal(web.name, unesc(x.title), `${x.p}: name equals the title`)
    assert.equal(web.description, unesc(x.description), `${x.p}: description equals the meta description`)
    assert.equal(web.inLanguage, HTML_LANG[x.locale], `${x.p}: inLanguage`)
    assert.equal(x.lang, HTML_LANG[x.locale], `${x.p}: <html lang>`)
    assert.deepEqual(web.isPartOf, { '@id': WEBSITE_ID }, x.p)
    const defined = new Set(x.nodes.filter((n) => n['@id']).map((n) => n['@id']))
    for (const n of walk(x.nodes)) {
      const keys = Object.keys(n)
      // a bare reference resolves on the page, is one of the two stable entity ids, or points at a package Service of the SAME language's /pricing page (the service pages relate to those packages)
      const pricing = `${SITE}${x.locale === 'en' ? '' : `/${x.locale}`}/pricing#service-`
      if (keys.length === 1 && keys[0] === '@id') assert.ok(defined.has(n['@id']) || n['@id'] === ORG_ID || n['@id'] === WEBSITE_ID || n['@id'].startsWith(pricing) || SERVICE_PAGES.some((s) => n['@id'] === `${SITE}${x.locale === 'en' ? '' : `/${x.locale}`}${s}#service`), `${x.p}: ${n['@id']} is defined on the page, is a stable entity id, or is a Service of the same language's pricing or service pages`)
    }
    for (const n of x.nodes.filter((n) => n.inLanguage)) assert.equal(n.inLanguage, HTML_LANG[x.locale], `${x.p}: ${n['@type']} inLanguage`)
    for (const n of x.nodes.filter((n) => n['@id'] && !n['@id'].startsWith(SITE + '/#') && n['@type'] !== 'Service')) assert.ok(n['@id'].startsWith(x.canonical.split('#')[0]) || n['@id'].startsWith(x.canonical), `${x.p}: ${n['@id']} belongs to the page`)
  }
})

test('coverage parity (audit F2-3): the same node types, counts of Services, Offers, FAQ questions and breadcrumbs on equivalent pages in all four languages', () => {
  const by = new Map()
  for (const x of pages) by.set(x.base, { ...(by.get(x.base) ?? {}), [x.locale]: x })
  const sig = (x) => ({
    types: [...new Set(x.nodes.map((n) => n['@type']))].filter((t) => t !== 'WebSite').sort().join(','),
    services: x.nodes.filter((n) => n['@type'] === 'Service').length,
    offers: walk(x.nodes).filter((n) => n['@type'] === 'Offer').length,
    faq: x.nodes.find((n) => n['@type'] === 'FAQPage')?.mainEntity.length ?? 0,
    breadcrumbs: x.nodes.filter((n) => n['@type'] === 'BreadcrumbList').length,
  })
  for (const [base, group] of by) {
    assert.equal(Object.keys(group).length, 4, `${base}: exists in all four languages`)
    const ref = sig(group.en)
    for (const l of ['es', 'fr', 'ar']) {
      // The one documented difference: the Arabic pricing FAQ omits the VAT question, because the Arabic pages carry no VAT wording (owner decision, 26 Nov 2026).
      const expected = base === '/pricing' && l === 'ar' ? { ...ref, faq: ref.faq - 1 } : ref
      assert.deepEqual(sig(group[l]), expected, `${base}: ${l} equals English`)
    }
  }
  const home = pages.filter((x) => x.base === '/').map((x) => x.nodes.filter((n) => n['@type'] === 'Service').length)
  assert.deepEqual(home, [4, 4, 4, 4], 'the four core services on every homepage')
  assert.deepEqual(pages.filter((x) => x.base === '/pricing').map((x) => x.nodes.filter((n) => n['@type'] === 'Service').length), [11, 11, 11, 11])
  for (const x of pages.filter((x) => x.base.startsWith('/case-studies/'))) assert.ok(x.nodes.some((n) => n['@type'] === 'Service'), `${x.p}: the study embeds the service it exemplifies`)
  for (const x of pages.filter((x) => ['/about', '/contact', '/pricing'].includes(x.base))) assert.ok(!x.nodes.some((n) => n['@type'] === 'BreadcrumbList'), `${x.p}: no breadcrumb markup without a visible trail`)
})

test('Offers reflect the approved prices and currencies: USD in English and Arabic, EUR in Spanish and French, same amounts per currency; no tax status on the Arabic pages (audit F2-4)', () => {
  const offersOf = (x) => walk(x.nodes).filter((n) => n['@type'] === 'Offer').map((o) => o.priceSpecification)
  for (const base of ['/pricing', '/ugc-video-agency', '/social-media-video-production']) {
    const get = (l) => offersOf(pages.find((x) => x.base === base && x.locale === l))
    for (const l of ['en', 'ar']) assert.ok(get(l).length && get(l).every((s) => s.priceCurrency === 'USD'), `${base} ${l}: USD`)
    for (const l of ['es', 'fr']) assert.ok(get(l).length && get(l).every((s) => s.priceCurrency === 'EUR'), `${base} ${l}: EUR`)
    assert.deepEqual(get('en').map((s) => s.price), get('ar').map((s) => s.price), `${base}: the Arabic USD amounts are the English ones`)
    assert.deepEqual(get('es').map((s) => s.price), get('fr').map((s) => s.price), `${base}: the French EUR amounts are the Spanish ones`)
    for (const l of ['en', 'es', 'fr']) assert.ok(get(l).every((s) => s.valueAddedTaxIncluded === false), `${base} ${l}: states "excluding VAT", as the visible page does`)
    assert.ok(get('ar').every((s) => !('valueAddedTaxIncluded' in s)), `${base} ar: no tax status (the Arabic pages show no VAT wording)`)
  }
  for (const x of pages.filter((x) => x.locale === 'ar')) assert.ok(!/valueAddedTax|VAT|ضريبة/.test(JSON.stringify(x.nodes)), `${x.p}: no VAT assertion in Arabic structured data`)
})

test('nothing invented: no ratings, reviews, locations, extra business types or video objects; the founder only inside the Organization; the withheld creators are absent', () => {
  for (const x of pages) {
    const flat = walk(x.nodes)
    const types = flat.map((n) => n['@type']).flat()
    for (const t of ['Review', 'AggregateRating', 'Rating', 'LocalBusiness', 'Place', 'GeoCoordinates', 'VideoObject', 'ImageObject', 'Article', 'HowTo', 'Product']) {
      if (t === 'ImageObject') continue // the logo
      assert.ok(!types.includes(t), `${x.p}: no ${t}`)
    }
    assert.ok(!flat.some((n) => 'areaServed' in n || 'telephone' in n || 'geo' in n || 'aggregateRating' in n || 'review' in n || 'foundingDate' in n || 'numberOfEmployees' in n), `${x.p}: no invented property`)
    for (const n of flat.filter((n) => n['@type'] === 'PostalAddress')) assert.deepEqual(n, { '@type': 'PostalAddress', addressCountry: 'ES' }, 'country only')
    assert.ok(!/3058e60f87200babb0b6c60606923e1b|0cf5d2139e0769332c053ac71984ca14|creator-05|ar-ugc-10/.test(x.html), `${x.p}: withheld creator data absent`)
  }
})

test('hreflang, canonical and Open Graph locale (audit F2-6): reciprocal en / es / fr-FR / ar / x-default; og:locale = the page language; og:locale:alternate = the other languages', () => {
  const by = new Map()
  for (const x of pages) by.set(x.base, { ...(by.get(x.base) ?? {}), [x.locale]: x })
  for (const [base, group] of by) {
    const expected = [['en', group.en.canonical], ['es', group.es.canonical], ['fr-FR', group.fr.canonical], ['ar', group.ar.canonical], ['x-default', group.en.canonical]].sort()
    for (const l of LOCALES) {
      const x = group[l]
      assert.deepEqual([...x.hreflang].sort(), expected, `${x.p}: the same five hreflang annotations on every language version`)
      assert.equal(x.canonical, `${SITE}${x.p === '/' ? '/' : x.p}`.replace(/(\/es|\/fr|\/ar)$/, '$1/'), `${x.p}: self-canonical`)
      assert.equal(x.ogLocale, OG[l], `${x.p}: og:locale`)
      assert.deepEqual([...x.ogAlt].sort(), LOCALES.filter((o) => o !== l).map((o) => OG[o]).sort(), `${x.p}: og:locale:alternate`)
      assert.ok(x.ogTitle && x.ogTitle.length > 5, `${x.p}: og:title present`)
    }
  }
  // a page without a translation (noindex utility pages) is untouched: no language metadata is invented
  for (const p of ['/project-application', '/blog', '/scale']) { const h = fs.readFileSync(fileOf(p), 'utf8'); assert.ok(!/og:locale/.test(h), `${p}: no og:locale`) }
})

test('unchanged: 56 sitemap URLs, the same canonical set, noindex pages stay out of the sitemap', () => {
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  assert.equal((sitemap.match(/<loc>/g) || []).length, 56)
  for (const p of ['/project-application', '/es/project-application', '/blog', '/scale', '/referrals', '/creative-growth-roadmap']) assert.ok(!sitemap.includes(`${SITE}${p}<`), p)
  for (const x of pages) assert.ok(!/name="robots" content="noindex/.test(x.head), `${x.p}: indexable`)
})
