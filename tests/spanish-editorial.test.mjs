// Run with: node --test tests/spanish-editorial.test.mjs
// Spanish editorial copy review (branch spanish-full-copy-review, Nov 2026): the eight pages' approved Spanish copy, plus the safeguards the owner set for it
// (data-driven About figures, no unconfirmed Organic commitment period, neutral Roadmap privacy wording, real CTA destinations, unchanged English).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { ES_HERO } from '../src/i18n/es/hero.js'
import ABOUT_ES from '../src/content/about/es.js'
import { ES_FAQ_TITLES, ES_STAGE_TITLES, ES_FINAL_CTA, ES_SECTION_INTROS } from '../src/i18n/es/labels.js'
import { CONVRT_STATS } from '../src/lib/siteStats.js'
import { ELYON_PROOF } from '../src/content/ugcProof.js'
import { PORTFOLIO, availableCategories } from '../src/content/portfolio.js'
import { UGC_FAQ } from '../src/seo/ugcFaq.js'
import { SPOKESPERSON_FAQ } from '../src/seo/spokespersonFaq.js'
import { SAAS_FAQ } from '../src/seo/saasFaq.js'
import { ORGANIC_SOCIAL_FAQ } from '../src/seo/organicSocialFaq.js'
import { localizeFaq } from '../src/i18n/content.js'
import { PUBLIC_CLAIMS } from '../src/seo/businessKnowledge.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let tmp, dist
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-es-editorial-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })
const page = (p) => fs.readFileSync(path.join(dist, 'es', p, 'index.html'), 'utf8')
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')

test('hero: the four Spanish H1s are the approved editorial headlines and every secondary CTA goes to a real place', () => {
  assert.deepEqual(Object.keys(ES_HERO).sort(), ['organic-h1', 'saas-h1', 'spokesperson-h1', 'ugc-h1'])
  const h1 = (p) => text(page(p).match(/<h1[\s\S]*?<\/h1>/)[0]).replace(/\s+\./g, '.')
  assert.match(h1('ugc-video-agency'), /Vídeos UGC con personas reales\. Hechos para destacar\./)
  assert.match(h1('spokesperson-video-production'), /Vídeos Spokesperson con personas reales\. Mensajes que conectan\./)
  assert.match(h1('social-media-video-production'), /Vídeos para redes sociales que merecen la pena guardar\./)
  assert.match(h1('saas-video-production'), /Vídeos que explican tu software o aplicación\./)
  // SaaS scrolls to the formats section, Organic to the process section: both anchors must exist on the page that links to them.
  assert.equal(ES_HERO['saas-h1'].secondary.href, '#saas-formats')
  assert.ok(page('saas-video-production').includes('id="saas-formats"'))
  assert.equal(ES_HERO['organic-h1'].secondary.href, '#how-it-works')
  assert.ok(page('social-media-video-production').includes('id="how-it-works"'))
  assert.match(page('saas-video-production'), /href="#saas-formats"[^>]*>[^<]*Explorar formatos/)
  assert.match(page('social-media-video-production'), /href="#how-it-works"[^>]*>[^<]*Cómo trabajamos/)
})

test('CTAs: Organic uses "Hablemos de tus redes" into the booking flow; the others use "5 conceptos gratis" into the Spanish Roadmap', () => {
  const org = page('social-media-video-production')
  assert.match(text(org), /Hablemos de tus redes/)
  assert.ok(org.includes('href="/es/contact?service=organic"') && !/calendly\.com/.test(org), 'the Organic CTA is the Spanish Contact inquiry, no public Calendly link')
  for (const p of ['ugc-video-agency', 'spokesperson-video-production', 'saas-video-production', 'pricing', 'creator-showcase']) {
    const html = page(p)
    assert.match(text(html), /5 conceptos gratis/, p)
    assert.ok(html.includes('href="/es/creative-growth-roadmap"'), `${p} links to the Spanish Roadmap`)
  }
  assert.match(text(page('creative-growth-roadmap')), /Solicitar mis 5 conceptos/)
})

test('FAQ: the approved question counts, Spanish headings, and visible questions = JSON-LD questions', () => {
  const sizes = { ugc: UGC_FAQ.length, spokesperson: SPOKESPERSON_FAQ.length, saas: SAAS_FAQ.length, organic: ORGANIC_SOCIAL_FAQ.length }
  assert.deepEqual(sizes, { ugc: 16, spokesperson: 12, saas: 12, organic: 12 })
  for (const [prefix, p, faq] of [['ugc', 'ugc-video-agency', UGC_FAQ], ['spokesperson', 'spokesperson-video-production', SPOKESPERSON_FAQ], ['saas', 'saas-video-production', SAAS_FAQ], ['organic', 'social-media-video-production', ORGANIC_SOCIAL_FAQ]]) {
    const html = page(p)
    const qs = localizeFaq(faq, 'es').map((x) => x.q)
    for (const q of qs) {
      assert.match(q, /^¿.*\?$/, q)
      assert.ok(text(html).includes(q), `${prefix}: visible question "${q}"`)
      assert.ok(html.includes(JSON.stringify(q).slice(1, -1)), `${prefix}: JSON-LD question "${q}"`)
    }
    assert.ok(text(html).includes(`${ES_FAQ_TITLES[prefix][0]} ${ES_FAQ_TITLES[prefix][1]}`.replace(/\s+/g, ' ')))
  }
})

test('Organic: the owner-confirmed six-month initial commitment is stated, community management is not customer support, no growth promise', () => {
  const html = page('social-media-video-production')
  const t = text(html)
  assert.match(t, /Compromiso inicial de 6 meses/)
  assert.match(t, /compromiso de seis meses/)
  assert.match(html.match(/application\/ld\+json[\s\S]*?<\/script>/)[0], /seis meses/)
  assert.match(t, /La gestión de comunidad no incluye atención al cliente/)
  assert.match(t, /1\.400 €/)
  assert.match(t, /2\.300 €/)
  assert.ok(!/garantiz\w+ (el )?crecimiento|viralidad garantizada/i.test(t.replace(/Nunca garantizamos viralidad, crecimiento de seguidores ni ventas/g, '')), 'no growth promise')
})

test('Graspo and Elyon figures survive (Spanish notation, same values)', () => {
  const org = text(page('social-media-video-production'))
  for (const s of ['10,7 M', '3,4 M', '75', '1 de enero al 19 de junio de 2026', 'Facebook e Instagram']) assert.ok(org.includes(s), s)
  const ugc = text(page('ugc-video-agency'))
  for (const s of ['5,28x', '3.421,25 USD', '9 Compras', 'Resultados comunicados por el cliente']) assert.ok(ugc.includes(s), s)
  assert.ok(!/3\.421,25 €|€ ?3\.421/.test(ugc), 'the historical USD revenue is never converted to EUR')
  assert.ok(ugc.includes('Los vídeos UGC que creó eran justo lo que necesitábamos') && !ugc.includes('The UGC videos he created'), 'the UGC page shows the approved Spanish reviews, no English original')
  assert.ok(!/It has 9 sales|Roas 5\.28/.test(ugc), 'the raw English client note is not on the Spanish page')
})

test('About (owner-supplied copy, 27 Nov 2026): the four statistics are the founder\'s combined experience and the disclosure is visible; no invented claims', () => {
  const flat = JSON.stringify(ABOUT_ES)
  const html = page('about')
  const t = text(html)
  assert.equal(CONVRT_STATS.videos, '1,200+')
  for (const s of ['1.200+', '40 M+', '500+', '50%+', 'vídeos producidos', 'clientes recurrentes']) assert.ok(t.includes(s), s)
  assert.ok(flat.includes('Estas cifras reflejan la trayectoria profesional de nuestro fundador, incluidos los trabajos realizados a través de CONVRT Studio y sus proyectos anteriores de producción creativa.') && t.includes('trayectoria profesional de nuestro fundador'))
  assert.ok(!/oficina|sucursal|premio|valoraci|reseñas|equipo de \d+|fundad[oa] en \d{4}|calle |avenida /i.test(flat.replace(/valoración/g, '')), 'no offices, branches, awards, reviews, ratings, team size, founding date or street address')
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1)
  assert.ok(!html.includes('LocalBusiness'), 'no LocalBusiness schema')
})

test('Roadmap: five questions, option values unchanged (English), brackets shown in EUR, neutral privacy wording, still noindex and out of the sitemap', () => {
  const html = page('creative-growth-roadmap')
  const t = text(html)
  assert.match(t, /0 de 5 preguntas respondidas/)
  for (const s of ['Menos de 5.000 €', 'Entre 5.000 € y 20.000 €', 'Más de 20.000 €']) assert.ok(t.includes(s), s)
  for (const v of ['Under $5,000', '$5,000–$20,000', '$20,000+', 'SaaS / Software', 'E-commerce / DTC', 'Marketing agency']) assert.ok(html.includes(`value="${v}"`), `option value ${v} stays English`)
  assert.ok(!/permanecen en tu navegador|solo se usan para comprobar/i.test(t), 'the "answers stay in your browser" claim is not repeated')
  assert.match(t, /Nota de privacidad: consulta cómo tratamos los datos de tu solicitud en nuestra política de privacidad\s?\./)
  assert.match(html, /Nota de privacidad:[\s\S]{0,200}<a href="\/es\/privacy"[^>]*>política de privacidad<\/a>/, 'the privacy note links the published Spanish policy')
  assert.ok(!/política de privacidad \(en inglés\)/i.test(t), 'no "(en inglés)" label: the Spanish policy is published')
  assert.ok(/<meta name="robots" content="noindex, follow"/.test(html))
  assert.ok(!fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes('/es/creative-growth-roadmap'))
})

test('Pricing: the thirteen approved EUR amounts are all on the Spanish page and "variantes finales de anuncio" replaced "creativos de testeo"', () => {
  const html = page('pricing')
  const t = text(html)
  for (const a of ['2.750 €', '3.250 €', '850 €', '1.375 €', '2.400 €', '4.600 €', '5.500 €', '1.550 €', '2.500 €', '4.350 €', '225 €', '1.400 €', '2.300 €']) assert.ok(t.includes(a), a)
  assert.ok(t.includes('183 € por variante') && t.includes('217 € por variante') && t.includes('153 € por variante'))
  assert.ok(!/creativos de testeo/.test(t) && t.includes('variantes finales de anuncio'))
  assert.match(t, /Compromiso inicial de 3 meses\. Después, mes a mes con 30 días de preaviso\./)
})

test('Creator Showcase: 18 samples, UGC and Spokesperson filters on the Spanish page only, language named in full, English tabs unchanged', () => {
  const es = PORTFOLIO.filter((i) => i.onlyIn?.includes('es') && !i.showcase) // `showcase` entries are the homepage stage, not the creator library
  assert.equal(es.length, 18)
  assert.equal(new Set(es.map((i) => i.title)).size, 18, 'titles are distinct')
  assert.ok(es.every((i) => i.approval?.creatorConsent === true && i.approval?.portfolioUse === true), 'approvals untouched')
  const html = page('creator-showcase')
  assert.match(text(html), /Todos los vídeos\s*18\s*UGC\s*9\s*Spokesperson\s*9/)
  assert.match(text(html), /Español/)
  assert.ok(!availableCategories(PORTFOLIO).some((c) => c.id === 'ugc'), 'no UGC tab outside Spanish (module default locale is English)')
})

test('terminology: editorial heading data is complete for the four service pages', () => {
  for (const id of ['ugc-cta-heading', 'spokesperson-cta-heading', 'saas-cta-heading', 'organic-cta-heading']) assert.ok(ES_FINAL_CTA[id].text.length > 40, id)
  for (const id of ['spokesperson-process-heading', 'saas-process-heading']) assert.ok(Object.keys(ES_STAGE_TITLES[id]).length >= 1, id)
  for (const id of ['ugc-testing', 'spokesperson-formats', 'saas-formats', 'organic-content-system', 'ugc-faq']) assert.ok(ES_SECTION_INTROS[id], id)
  for (const p of ['ugc-video-agency', 'spokesperson-video-production', 'saas-video-production', 'social-media-video-production', 'creator-showcase', 'pricing', 'about']) {
    assert.ok(!/creatividades? de testeo|creativos de testeo/.test(text(page(p))), p)
  }
})
