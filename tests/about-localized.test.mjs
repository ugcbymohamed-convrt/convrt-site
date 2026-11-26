// Run with: node --test tests/about-localized.test.mjs  (reads dist/: run `npm run build` first)
// Spanish, French and Arabic About pages (src/AboutPage.jsx + src/content/aboutCopy.js): the owner-approved copy, the founder-experience figures and their visible disclosure, no invented claims.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ABOUT_COPY } from '../src/content/aboutCopy.js'
import { CONVRT_STATS } from '../src/lib/siteStats.js'
import { localizeStat } from '../src/i18n/format.js'
import { SEO_BY_LOCALE } from '../src/i18n/seo.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { TRUST_CONTENT, plainText } from '../src/content/trustPages.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(ROOT, 'dist')
const page = (p) => fs.readFileSync(path.join(dist, `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const text = (h) => h.slice(h.indexOf('<body')).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map((s) => s.trim()).filter(Boolean).join('\n').replace(/ | /g, ' ')
const norm = (s) => s.replace(/ | /g, ' ')
const PAGES = { es: '/es/about', fr: '/fr/about', ar: '/ar/about' }

test('every supplied sentence of the approved About copy is on its page, in order, with one h1', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p), t = text(h), c = ABOUT_COPY[l]
    assert.equal((h.match(/<h1[ >]/g) ?? []).length, 1, p)
    const all = [c.hero.badge, ...c.hero.h1, ...c.hero.body, c.philosophy.badge, ...c.philosophy.h2, c.philosophy.lead, ...c.philosophy.body, c.philosophy.closing, c.approach.badge, ...c.approach.h2,
      ...c.approach.items.flatMap((i) => [i.title, i.text]), c.behind.badge, ...c.behind.h2, ...c.behind.body, c.figures.badge, c.figures.footnote, c.borderless.badge, ...c.borderless.h2, ...c.borderless.body, c.cta.badge, ...c.cta.h2, c.cta.body, c.cta.primary, c.cta.secondary]
    let from = 0
    for (const s of all) { const i = norm(t).indexOf(norm(s), from); assert.ok(i >= 0, `${p}: missing or out of order: ${s}`); from = i }
  }
})

test('spot checks against the supplied wording (headlines, philosophy question, CTAs, founder name as supplied)', () => {
  const es = ABOUT_COPY.es, fr = ABOUT_COPY.fr, ar = ABOUT_COPY.ar
  assert.deepEqual(es.hero.h1, ['Creatividad con estrategia.', 'Contenido con propósito.']); assert.equal(es.cta.primary, 'Consigue 5 conceptos gratis'); assert.equal(es.cta.secondary, 'Descubre nuestros servicios')
  assert.deepEqual(fr.hero.h1, ['De la créativité. De la stratégie.', 'Un objectif.']); assert.equal(fr.cta.primary, 'Obtenez 5 concepts gratuits'); assert.equal(fr.cta.secondary, 'Découvrez nos services')
  assert.deepEqual(ar.hero.h1, ['إبداع مدروس.', 'محتوى له هدف.']); assert.equal(ar.cta.primary, 'احصل على 5 أفكار إعلانية مجانًا'); assert.equal(ar.cta.secondary, 'اكتشف خدماتنا')
  assert.ok(es.behind.body[0].includes('Mohamed Doukkali,') && fr.behind.body[0].includes('Mohamed Doukkali,') && ar.behind.body[0].includes('محمد الدكالي'), 'the founder name exactly as supplied (flagged for confirmation: legal name is Mohamed Doukkali Azizi; the Arabic spelling is unverified)')
  assert.ok(es.hero.body[1].includes('creativos') && !/creatividades|gancho/i.test(JSON.stringify(es)) && es.approach.items[2].text.includes('hooks'))
  assert.ok(fr.hero.body[1].includes('créas') && !/accroche/i.test(JSON.stringify(fr)) && fr.approach.items[2].text.includes('hooks'))
  assert.ok(!/ضريبة|القيمة المضافة|VAT/.test(JSON.stringify(ar)))
})

test('the four figures come from the single source (siteStats.js) and read exactly as supplied in each language; the founder-experience disclosure is printed under them', () => {
  const supplied = { es: ['1.200+', '40 M+', '500+', '50%+'], fr: ['1 200+', '40 M+', '500+', '50 %+'], ar: ['1,200+', '40 مليون+', '500+', '50%+'] }
  for (const [l, p] of Object.entries(PAGES)) {
    const got = [CONVRT_STATS.videos, CONVRT_STATS.views, CONVRT_STATS.clients, CONVRT_STATS.returningClients].map((v) => localizeStat(l, v))
    assert.deepEqual(got.map(norm), supplied[l].map(norm), `${l}: figures equal the supplied copy`)
    const h = page(p), t = text(h)
    for (const v of supplied[l]) assert.ok(norm(h).includes(norm(v)), `${p}: ${v}`)
    const c = ABOUT_COPY[l]
    assert.ok(t.includes(norm(c.figures.footnote)), `${p}: disclosure visible`)
    assert.ok(/CONVRT Studio/.test(c.figures.footnote) && !/(only|solo|uniquement|فقط)/.test(c.figures.footnote), 'never presented as CONVRT-only')
    // each figure carries the asterisk that points at the disclosure
    assert.equal((h.match(/<span aria-hidden="true">\*<\/span>/g) ?? []).length, 4, `${p}: four asterisks`)
  }
  assert.equal(CONVRT_STATS.videos, '1,200+'); assert.equal(CONVRT_STATS.views, '40M+'); assert.equal(CONVRT_STATS.clients, '500+'); assert.equal(CONVRT_STATS.returningClients, '50%+')
  // the English About page (unchanged) still states the same four figures with the same scope
  assert.ok(plainText(TRUST_CONTENT.about).includes('1,200+ videos produced, 500+ clients served, 40M+ views generated and 50%+ returning clients'))
})

test('no invented claim: no office, address, award, certification, rating, team member or client relationship; markets are served markets, not offices', () => {
  for (const l of ['es', 'fr', 'ar']) {
    const flat = JSON.stringify(ABOUT_COPY[l])
    assert.ok(!/oficina|sucursal|premio|certific|valoraci|reseñas|bureau|prix|certifi|avis|مكتب|جائزة|شهادة|تقييم/i.test(flat.replace(/valoración/g, '')), l)
    assert.ok(!/\b(Graspo|Elyon|Adscale|FIXD)\b/i.test(flat), `${l}: no client named on the About page`)
    assert.ok(!page(PAGES[l]).includes('LocalBusiness') && !/aggregateRating|"review"/.test(page(PAGES[l])), `${l}: no review/rating/LocalBusiness structured data`)
  }
})

test('Call to action: the free Roadmap in the page language and the services section; no booking link; tracked with page events', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p)
    assert.ok(h.includes(`href="/${l}/creative-growth-roadmap"`), p); assert.ok(h.includes(`href="/${l}/#services"`), p)
    assert.ok(!/calendly/i.test(h), p)
  }
})

test('About SEO: the approved preliminary titles, self-canonical, reciprocal hreflang in four languages, in the sitemap; the English page is unchanged', () => {
  assert.equal(SITE_SEO['/about'].title, 'About CONVRT | Creative Video Production Studio')
  assert.equal(SEO_BY_LOCALE.es['/about'].title, 'Sobre CONVRT | Estudio creativo de producción de vídeo')
  assert.equal(SEO_BY_LOCALE.fr['/about'].title, 'À propos de CONVRT | Studio de production vidéo créative')
  assert.equal(SEO_BY_LOCALE.ar['/about'].title, 'عن CONVRT | استوديو إبداعي لإنتاج الفيديوهات')
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const p of ['/about', ...Object.values(PAGES)]) { assert.ok(sm.includes(`https://www.convrt.studio${p}</loc>`), p); assert.match(page(p), new RegExp(`<link rel="canonical" href="https://www.convrt.studio${p}"`)) }
  const sets = ['/about', ...Object.values(PAGES)].map((p) => [...page(p).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|'))
  assert.ok(sets.every((s) => s === sets[0]) && sets[0].split('|').length === 5)
  assert.match(page('/about'), /About CONVRT Studio/)
  assert.match(page('/ar/about'), /<html lang="ar" dir="rtl">/)
  // structured data: the same Organization entity in every language, an AboutPage, no founder-as-person invention beyond the existing Organization.founder node
  for (const p of ['/about', ...Object.values(PAGES)]) {
    const ld = [...page(p).matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
    const g = ld[0]['@graph']
    assert.ok(g.some((n) => n['@type'] === 'AboutPage') && g.filter((n) => n['@type'] === 'Organization').length === 1, p)
    assert.equal(g.find((n) => n['@type'] === 'Organization')['@id'], 'https://www.convrt.studio/#organization')
  }
})
