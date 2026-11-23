// Run with: node --test tests/spanish-visual-parity.test.mjs
// Spanish visual & conversion parity, Review 1 (branch feat/es-visual-parity-review-1, Nov 2026): homepage hero and offer cards, the Spanish creator carousel, translated testimonials,
// Pricing tabs and CTA, Roadmap and UGC headlines. English must stay untouched (see scripts/i18n-english-parity.mjs for the byte-level check).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { HOME_CREATOR_IDS, homeCreatorVideos } from '../src/content/homeCreators.js'
import { PORTFOLIO } from '../src/content/portfolio.js'
import { ES_TESTIMONIALS } from '../src/i18n/es/testimonials.js'
import { ES_HERO } from '../src/i18n/es/hero.js'
import { LOCALIZED_FLOWS } from '../src/i18n/cta.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
let tmp, dist
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-es-parity-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })
const page = (p) => fs.readFileSync(path.join(dist, ...(p ? ['es', p] : ['es']), 'index.html'), 'utf8')
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1')
const h1 = (p) => text(page(p).match(/<h1[\s\S]*?<\/h1>/)[0]).replace(/\s+\./g, '.')

test('homepage hero: approved headline, offer line, CTAs and the two secondary offer cards', () => {
  const html = page('')
  const t = text(html)
  assert.match(t, /Creatividades diseñadas para conectar/)
  assert.match(t, /Tus próximos 5 conceptos\. A tu medida\. Gratis\./)
  assert.match(t, /5 conceptos gratis/)
  assert.match(t, /Explorar vídeos/)
  assert.match(t, /¿Aún no\? Tienes otras dos formas gratis de empezar\./)
  assert.match(t, /1 vídeo GRATIS/)
  assert.match(t, /Prueba nuestra producción sin riesgo\./)
  assert.match(t, /Comprueba si encajas/)
  assert.match(t, /10 hooks GRATIS/)
  assert.match(t, /Ideas para tus próximos anuncios\./)
  assert.ok(!/FreeVideoOffer|Haz que tu primer vídeo/.test(t), 'the separate homepage free-video block is replaced by the hero cards')
})

test('homepage hero: the free-video card reuses the existing Spanish page; the hooks card is visible but is not a link', () => {
  const html = page('')
  assert.ok(html.includes('href="/es/risk-free-trial"'), 'free-video card links to the existing page')
  assert.ok(fs.existsSync(path.join(dist, 'es', 'risk-free-trial', 'index.html')), 'no duplicate page, the existing one is built')
  assert.ok(!/href="[^"]*(free-hooks|hooks)[^"]*"/.test(html), 'no link to any hooks page (English or Spanish)')
  assert.equal(LOCALIZED_FLOWS.es.hooks, false)
  const m = html.match(/<div[^>]*aria-disabled="true"[^>]*>[\s\S]*?<\/div>/)
  assert.ok(m, 'the hooks card is rendered as a disabled, non-interactive block')
  assert.ok(!/<a[\s>]/.test(m[0]), 'the disabled card contains no anchor')
  assert.match(text(m[0]), /10 hooks GRATIS/)
  assert.match(text(m[0]), /Próximamente/)
  assert.ok(!/tabindex/i.test(m[0]), 'not focusable')
})

test('English hero is unchanged: both offer cards still link to their pages', () => {
  const src = read('src/components/Hero.jsx')
  assert.match(src, /locale === 'en'/)
  assert.ok(!fs.existsSync(path.join(dist, 'es', 'free-hooks')), 'no Spanish hooks page exists')
})

test('creator carousel: eight videos in a stable order, Spanish only, approved only, poster-only until played', () => {
  assert.equal(HOME_CREATOR_IDS.length, 8)
  assert.equal(new Set(HOME_CREATOR_IDS).size, 8)
  const vids = homeCreatorVideos('es')
  assert.deepEqual(vids.map((v) => v.id), HOME_CREATOR_IDS, 'every configured video is approved and displayable, same order')
  const creators = new Set(vids.map((v) => v.creatorId))
  for (const id of ['es-c01', 'es-c02', 'es-c03', 'es-c04', 'es-c05', 'es-c06']) assert.ok(creators.has(id), `creator ${id} is represented`)
  for (const v of vids) {
    assert.deepEqual(v.languages, ['es'])
    assert.ok(!v.showName, 'no creator name is displayed without permission')
  }
  assert.deepEqual(homeCreatorVideos('en'), [], 'English homepage has no creator carousel')
  const html = page('')
  assert.match(text(html), /Creadores que destacan\. A tu alcance\./)
  const start = html.indexOf('id="creators-heading"')
  assert.ok(start > 0, 'carousel section is present')
  const section = html.slice(html.lastIndexOf('<section', start), html.indexOf('</section>', start))
  assert.ok(!/<video[\s>]/.test(section), 'the carousel renders posters only, no video element')
  assert.equal((section.match(/<img[\s>]/g) || []).length >= 8, true, 'eight poster images')
  const src = read('src/content/homeCreators.js')
  assert.ok(!/\b(Luis|Mohamed|Mohamad)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'no creator name in code')
  assert.ok(PORTFOLIO.length > 0)
})

test('testimonials: three Spanish translations, same claims, with the disclosure; the English originals stay in the source', () => {
  assert.deepEqual(Object.keys(ES_TESTIMONIALS).sort(), ['adscale', 'elyon', 'talk360'])
  for (const v of Object.values(ES_TESTIMONIALS)) assert.ok(v.length > 60)
  const t = text(page(''))
  assert.match(t, /Testimonios originales en inglés, traducidos al español\./)
  assert.ok(t.includes('Mohamed entendió muy bien el concepto'))
  assert.ok(t.includes('Trabajar con Mohamad fue un auténtico placer'))
  assert.ok(t.includes('Los vídeos son increíbles, otra vez'))
  const en = read('src/components/Testimonials.jsx')
  assert.match(en, /Mohamed understood the concept/i)
  // no number or result is added by the translation
  for (const v of Object.values(ES_TESTIMONIALS)) assert.ok(!/\d/.test(v), 'no figure in a translated testimonial')
})

test('pricing: headline, subtitle, renamed service, FAQ tabs on one row on desktop and scrollable on small screens, CTA', () => {
  const html = page('pricing')
  const t = text(html)
  assert.match(h1('pricing'), /Tu socio creativo\. A tu manera\./)
  assert.match(t, /De anuncios UGC a contenido orgánico\. Elige cómo trabajar con CONVRT\./)
  assert.match(t, /Montaje de vídeos/)
  assert.ok(!/Edición de vídeo corto/.test(t))
  for (const tab of ['Planes y precios', 'Producción y entrega', 'Derechos y extras', 'Redes sociales']) assert.ok(t.includes(tab), tab)
  assert.match(t, /¿Listo para crear algo que convierta\?/)
  assert.match(t, /Encontremos el enfoque creativo para tu marca\./)
  assert.match(t, /Hablemos de tu estrategia/)
  const faq = read('src/components/pricing/PricingFAQ.jsx')
  assert.match(faq, /flex-nowrap[^'`]*overflow-x-auto[^'`]*md:flex-wrap[^'`]*md:overflow-visible/)
  assert.match(faq, /flex-wrap justify-center/, 'English tablist is unchanged')
})

test('pricing: paid prospects still go to the Roadmap, organic to the strategy call; commitments and EUR unchanged', () => {
  const html = page('pricing')
  assert.ok(html.includes('href="/es/creative-growth-roadmap"'))
  assert.ok(/href="https:\/\/calendly\.com\/[^"]+"/.test(html))
  const t = text(html)
  assert.match(t, /3 meses/)
  assert.match(t, /6 meses/)
  assert.ok(/€/.test(t) && !/\$\s?\d/.test(t), 'Spanish pricing shows EUR, never USD')
})

test('roadmap: approved headline and copy, five cards kept, illustrative disclaimer, Calendly flow untouched', () => {
  const t = text(page('creative-growth-roadmap'))
  assert.match(h1('creative-growth-roadmap'), /Tus próximos 5 conceptos\. Para tu marca\. Gratis\./)
  assert.match(t, /Estrategia creativa gratuita · Previa solicitud/)
  assert.match(t, /Deja de improvisar tu próximo anuncio\./)
  assert.match(t, /Solicitar mis 5 conceptos/)
  assert.match(t, /Ejemplos ilustrativos, no son anuncios reales/)
  for (const n of ['01', '02', '03', '04', '05']) assert.ok(t.includes(`${n} Concepto`), n)
  const hero = read('src/components/roadmap/RoadmapHero.jsx')
  assert.match(hero, /currentLocale\(\) === 'en' \? 'lg:text-\[2\.75rem\] xl:text-\[3\.6rem\]'/, 'English sizes unchanged')
})

test('UGC page: approved headline in three balanced lines and the same offer structure as English', () => {
  assert.match(h1('ugc-video-agency'), /UGC con personas reales\. Para tus anuncios\. Para conectar\./)
  assert.deepEqual(ES_HERO['ugc-h1'].lines, [['UGC', 'con', 'personas', 'reales.'], ['Para', 'tus', 'anuncios.']])
  const t = text(page('ugc-video-agency'))
  assert.match(t, /Somos un estudio creativo especializado en anuncios UGC con personas reales\./)
  assert.match(t, /1 vídeo GRATIS/)
  assert.match(t, /10 hooks GRATIS/)
  assert.match(t, /Próximamente/)
  assert.ok(page('ugc-video-agency').includes('href="/es/risk-free-trial"'))
})

test('how-it-works and services copy on the Spanish homepage', () => {
  const t = text(page(''))
  assert.match(t, /Empezamos con cinco ideas para tu marca\. Tú decides si seguimos adelante\. Nosotros nos encargamos de la producción\./)
  assert.match(t, /Tus primeros 5 conceptos\. Gratis\./)
  assert.match(t, /De la idea al vídeo final\./)
})

/* ── Review 2: Spanish pricing refinement ─────────────────────────────────────────────── */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'
import { CARD_NOTES, COMMITMENT, ORGANIC_COMMITMENT, PARTNERSHIP_TERMS, GOALS } from '../src/seo/businessKnowledge.js'

let vite, Terms
const renderAt = (pathname, node) => {
  const prev = globalThis.window
  globalThis.window = { location: { pathname } }
  try { return text(renderToStaticMarkup(node)) } finally { if (prev === undefined) delete globalThis.window; else globalThis.window = prev }
}
before(async () => {
  vite = await createServer({ root: ROOT, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  Terms = await vite.ssrLoadModule('/src/components/pricing/PartnershipTerms.jsx')
})
after(async () => { await vite?.close() })

test('pricing terms (Spanish): the commitment follows the selected group AND billing option', () => {
  const monthly = renderAt('/es/pricing', createElement(Terms.PaidTerms, { billing: 'monthly' }))
  assert.match(monthly, /Compromiso inicial de 3 meses\. Después, mes a mes con 30 días de preaviso\./)
  assert.match(monthly, /Precios sin IVA\. También disponibles proyectos puntuales\./)
  assert.equal(COMMITMENT.initialMonths, 3); assert.equal(COMMITMENT.cancellationNoticeDays, 30)

  const oneOff = renderAt('/es/pricing', createElement(Terms.PaidTerms, { billing: 'oneOff' }))
  assert.match(oneOff, /Un único lote de producción creativa, sin compromiso recurrente\./)
  assert.ok(!/3 meses|preaviso|mes a mes/.test(oneOff.replace('plan mensual', '')), 'a one-off project is never shown with a minimum commitment')
  assert.match(oneOff, /Precios sin IVA\./)
  assert.equal(PARTNERSHIP_TERMS.oneOff, 'One creative production batch, without a recurring commitment.')

  const organic = renderAt('/es/pricing', createElement(Terms.OrganicTerms))
  assert.match(organic, /Compromiso inicial de 6 meses\./)
  assert.ok(!/3 meses|30 días|mes a mes/.test(organic), 'Paid terms never appear on the Organic note')
  assert.ok(!/mes a mes/.test(organic), 'what follows the Organic initial period is not confirmed, so no month-to-month claim')
  assert.equal(ORGANIC_COMMITMENT.initialMonths, 6)
  assert.match(organic, /Precios sin IVA\./)
})

test('pricing terms (English): unchanged text, still not billing-aware', () => {
  for (const b of ['monthly', 'oneOff']) {
    const t = renderAt('/pricing', createElement(Terms.PaidTerms, { billing: b }))
    assert.ok(t.includes(CARD_NOTES.paid.replace(/’/g, '’')), b)
    assert.match(t, /See how our UGC production works/)
  }
  assert.ok(renderAt('/pricing', createElement(Terms.OrganicTerms)).includes(CARD_NOTES.organic))
})

test('pricing terms: the "learn more" row keeps the existing destinations and adds no page', () => {
  const html = (() => {
    const prev = globalThis.window; globalThis.window = { location: { pathname: '/es/pricing' } }
    try { return renderToStaticMarkup(createElement(Terms.PaidTerms, { billing: 'monthly' })) } finally { if (prev === undefined) delete globalThis.window; else globalThis.window = prev }
  })()
  assert.ok(html.includes('href="/es/ugc-video-agency"'))
  assert.ok(html.includes('href="/es/spokesperson-video-production"'))
  const t = text(html)
  assert.match(t, /¿Quieres saber más\?/); assert.match(t, /Cómo funciona nuestro UGC/); assert.match(t, /Vídeos con portavoz/)
})

test('pricing selector and cards: short Spanish copy, package names never wrap, badges stay on the title row', () => {
  const t = text(page('pricing'))
  assert.deepEqual(GOALS.map((g) => g.id), ['paid', 'organic'], 'selector options unchanged')
  assert.match(t, /Escalar mis anuncios Anuncios UGC, vídeos con portavoz y creatividades para tus campañas\./)
  assert.match(t, /Crecer en redes Vídeos, publicaciones y gestión de comunidad\./)
  assert.match(t, /Prueba nuevos conceptos y descubre qué conecta con tu audiencia\./)
  assert.match(t, /Más conceptos, más creadores y más opciones para tus campañas\./)
  assert.match(t, /Más testeo/)
  const cards = read('src/components/pricing/PricingCards.jsx')
  assert.match(cards, /whitespace-nowrap lg:px-3\.5 xl:px-4/, 'the package name is nowrap in other languages')
  assert.match(cards, /flex-wrap gap-y-2/, 'a badge that cannot fit drops below instead of squeezing the name')
  // English keeps its exact original classes (byte-level parity is checked by scripts/i18n-english-parity.mjs)
  assert.match(cards, /\$\{en \? '' : ' flex-wrap/)
})

test('pricing amounts and deliverables are untouched by the copy refinement', () => {
  const t = text(page('pricing'))
  for (const a of ['2.750 €', '3.250 €', '4.600 €', '5.500 €', '1.400 €', '2.300 €']) assert.ok(t.includes(a), a)
  for (const d of ['15 versiones finales', '30 versiones finales', '183 € por versión', '153 € por versión', '217 € por versión', '5 conceptos únicos, 3 versiones cada uno.', '10 conceptos únicos, 3 versiones cada uno.', '2 rondas de revisiones por concepto', 'Hasta 3 creadores o presentadores', 'Hasta 5 creadores o presentadores', 'Compromiso inicial de 6 meses']) assert.ok(t.includes(d), d)
  assert.ok(!/\$\s?\d/.test(t), 'no USD on the Spanish page')
})
