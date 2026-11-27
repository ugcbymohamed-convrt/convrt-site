// Run with: node --test tests/final-copy-refinements.test.mjs
// The final copy and design refinements of 2026-11-26 (branch feat/final-copy-design-refinements): Spanish terminology, the Spanish Creator Showcase guide, the Graspo and Elyon conclusions in all
// languages, the Elyon in-page CTA, and the exact Spanish wording of the pricing, contact, FAQ and referral headings. English output is checked byte-level by scripts/i18n-english-parity.mjs.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { GRASPO_CONCLUSION, ELYON_CONCLUSION } from '../src/i18n/caseStudyConclusions.js'
import { GRASPO_FUNNEL, ELYON_METRICS } from '../src/caseStudies/data.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
let tmp, dist
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-final-copy-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })
const html = (p) => fs.readFileSync(path.join(dist, ...p.split('/').filter(Boolean), 'index.html'), 'utf8')
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').replace(/ ([.,])/g, '$1')

const flat = (x) => String(x).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ')
const ES_PAGES = ['/es', '/es/pricing', '/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/social-media-video-production', '/es/saas-video-production', '/es/creator-showcase',
  '/es/case-studies/graspo', '/es/case-studies/elyon', '/es/referrals', '/es/creative-growth-roadmap', '/es/risk-free-trial']

test('Spanish terminology: no "creatividades", no "gancho(s)" on any Spanish page; hooks and creativos are used instead', () => {
  for (const p of ES_PAGES) {
    const t = text(html(p))
    assert.ok(!/\bcreatividades\b/i.test(t), `${p}: creatividades`)
    assert.ok(!/\bganchos?\b/i.test(t), `${p}: gancho(s)`)
  }
  const pricing = text(html('/es/pricing'))
  assert.ok(pricing.includes('3 variantes por concepto, con distintos hooks o CTA.'), 'the owner wording of the testing model')
  assert.ok(!/3 versiones por concepto/.test(pricing))
  assert.ok(html('/es').includes('Creativos') && /diseñados para/.test(text(html('/es'))), 'homepage headline agrees in gender')
  const seo = read('src/i18n/es/seo.js') + read('src/i18n/es/jsonld-parts.js')
  assert.ok(!/ganch/i.test(seo) && !/creatividades/i.test(seo), 'metadata and structured data follow the terminology')
})

test('Spanish pricing, contact, FAQ and referral wording is exactly the requested copy', () => {
  const pricing = text(html('/es/pricing'))
  assert.match(html('/es/pricing'), /Tu aliado creativo\.<!-- --> <span class="text-lime">A tu medida\.<\/span>|Tu aliado creativo\.\s*<span class="text-lime">A tu medida\./)
  assert.ok(pricing.includes('Escalar mis campañas') && !pricing.includes('Mejorar mis anuncios'))
  assert.ok(!pricing.includes('La opción que mejor encaja contigo'))
  const home = text(html('/es'))
  assert.ok(home.includes('Tanto si necesitas creativos para campañas en redes sociales, vídeos UGC, anuncios con spokesperson o un aliado creativo a largo plazo, creamos contenido diseñado para captar la atención del público actual.'))
  assert.ok(home.includes('Lo que suelen preguntarnos las marcas.'), 'FAQ heading')
  assert.ok(!home.includes('Tus preguntas'))
  const ref = html('/es/referrals')
  assert.match(ref, /Una presentación\.(<!-- -->)? <span class="whitespace-nowrap text-lime">Dos ganadores<\/span>(<!-- -->)?\./, '"Dos ganadores" in the brand lime (owner, 2026-11-27: not the full stop), the first half untouched')
})

test('Spanish Creator Showcase guide: the English section (heading, intro, four cards, case-study line), Spanish copy, Spanish links', () => {
  const h = html('/es/creator-showcase')
  const t = text(h)
  for (const s of ['Qué encontrarás en nuestra biblioteca de creadores',
    'Nuestra biblioteca reúne ejemplos de diferentes creadores independientes, para que puedas descubrir distintos estilos, formatos y enfoques creativos antes de iniciar tu proyecto. Explora los vídeos por sector: e-commerce, SaaS y aplicaciones, servicios y contenido orgánico.',
    'Vídeos naturales con creadores reales, diseñados para captar la atención en campañas publicitarias en redes sociales.',
    'Presentadores que explican tu producto o transmiten el mensaje de tu marca directamente a cámara.',
    'Vídeos para software y aplicaciones', 'Vídeos con creadores para marcas de software y aplicaciones. También producimos vídeos explicativos y demostraciones de producto adaptados a cada proyecto.',
    'Contenido orgánico', 'Vídeos de formato corto diseñados para las redes sociales de tu marca.',
    'Descubre también nuestros casos de éxito en contenido orgánico y campañas publicitarias con vídeos UGC.']) assert.ok(t.includes(s), s)
  const guide = h.slice(h.indexOf('id="showcase-guide"'))
  assert.equal((guide.match(/<li class="list-none rounded-3xl/g) ?? []).length, 4, 'four cards, like English')
  for (const href of ['/es/ugc-video-agency', '/es/spokesperson-video-production', '/es/saas-video-production', '/es/social-media-video-production', '/es/case-studies/graspo', '/es/case-studies/elyon']) assert.ok(guide.includes(`href="${href}"`), href)
  assert.ok(!t.includes('Dos formatos. Muchas formas'))
  // same component, same classes as English
  const en = html('/creator-showcase')
  const cls = (s) => s.match(/<li class="list-none[^"]*"/)?.[0]
  assert.equal(cls(guide), cls(en.slice(en.indexOf('id="showcase-guide"'))))
})

test('Graspo (Spanish): strategy and attention-to-demand headings and paragraphs; balanced, no forced break on small screens', () => {
  const h = html('/es/case-studies/graspo')
  const t = text(h)
  assert.ok(t.includes('De experiencia industrial') && t.includes('a un contenido que conecta.'))
  assert.ok(!t.includes('Convertimos experiencia industrial'))
  assert.ok(t.includes('Combinamos estrategia, producción de contenido adaptado al mercado árabe y seguimiento de oportunidades comerciales en un mismo proceso.'))
  assert.match(h, /De experiencia industrial\s*(<!-- -->)?\s*<br class="hidden md:block"\/>/, 'the break is desktop-only in Spanish')
  assert.ok(t.includes('De las visualizaciones a las oportunidades comerciales.') && !t.includes('embudo social'))
  assert.ok(t.includes('Durante el periodo analizado, registramos millones de visualizaciones y oportunidades comerciales reales. Estos datos muestran la evolución del alcance y las consultas recibidas, sin atribuir cada contacto directamente a una visualización.'))
  assert.match(h, /text-balance[^"]*"[^>]*>De experiencia industrial/)
  // English keeps its own forced break
  assert.match(html('/case-studies/graspo'), /From industrial expertise\s*(<!-- -->)?\s*<br\/>/)
})

test('Graspo conclusion: shared component, all four languages, the four verified figures, theme lime, links kept', () => {
  const figs = [GRASPO_FUNNEL[0].value, GRASPO_FUNNEL[2].value, GRASPO_FUNNEL[3].value, GRASPO_FUNNEL[4].value]
  assert.deepEqual(figs, ['10.7M', '75', '26', '10'])
  for (const [loc, p, service, pricing] of [['en', '/case-studies/graspo', '/social-media-video-production', '/pricing#organic'], ['es', '/es/case-studies/graspo', '/es/social-media-video-production', '/es/pricing#organic'],
    ['fr', '/fr/case-studies/graspo', '/fr/social-media-video-production', '/fr/pricing#organic'], ['ar', '/ar/case-studies/graspo', '/ar/social-media-video-production', '/ar/pricing#organic']]) {
    const h = html(p)
    const at = h.indexOf('aria-labelledby="graspo-result-heading"')
    const sec = h.slice(at, h.indexOf('</section>', at))
    const c = GRASPO_CONCLUSION[loc]
    assert.ok(sec.includes('id="graspo-result-heading"'), loc)
    for (const seg of c.headline) assert.ok(text(sec).includes(flat(seg.text).trim()), `${loc}: ${seg.text}`)
    assert.ok(text(sec).includes(flat(c.lead)) && text(sec).includes(flat(c.strategy)) && text(sec).includes(flat(c.ctaLead)), `${loc}: paragraphs`)
    for (const l of c.labels) assert.ok(text(sec).includes(flat(l)), `${loc}: ${l}`)
    assert.ok(sec.includes(`href="${service}"`) && sec.includes(`href="${pricing}"`), `${loc}: link destinations`)
    assert.ok(sec.includes('rgba(213,255,64'), `${loc}: lime theme`)
    assert.ok(!/RelatedService|aria-label="(Related service|Servicio relacionado)"/.test(h), `${loc}: the old related-service line is gone`)
  }
  const es = GRASPO_CONCLUSION.es
  assert.equal(es.badge, 'El resultado')
  assert.deepEqual(es.headline.map((s) => s.text), ['De publicar contenido a ', 'generar demanda.'])
  assert.ok(es.lead.includes('10,7 millones de visualizaciones') && es.lead.includes('75 contactos comerciales') && es.lead.includes('26 fueron clasificados como prioritarios') && es.lead.includes('10 llegaron a una fase avanzada de negociación o seguimiento comercial'))
  assert.ok(/sin promoción de pago/.test(es.note) && /No todas las visualizaciones/.test(es.note), 'organic distribution and the sales limitation stay stated')
  assert.ok(!/presupuesto|quotation|cotización/i.test(es.labels[3]), 'the advanced tile does not imply quotations')
})

test('Elyon conclusion: gold theme, ROAS qualified, all languages share the component, links kept, no related-service line', () => {
  assert.equal(ELYON_METRICS[2].value, '5.28x')
  for (const [loc, p, service, pricing] of [['en', '/case-studies/elyon', '/ugc-video-agency', '/pricing#packages'], ['es', '/es/case-studies/elyon', '/es/ugc-video-agency', '/es/pricing#packages'], ['fr', '/fr/case-studies/elyon', '/fr/ugc-video-agency', '/fr/pricing#packages']]) {
    const h = html(p)
    const at = h.indexOf('aria-labelledby="elyon-result-heading"')
    const sec = h.slice(at, h.indexOf('</section>', at))
    const c = ELYON_CONCLUSION[loc]
    assert.ok(at > 0, loc)
    for (const seg of c.headline) assert.ok(text(sec).includes(flat(seg.text).trim()), `${loc}: ${seg.text}`)
    assert.ok(text(sec).includes(flat(c.lead)) && text(sec).includes(flat(c.strategy)) && text(sec).includes(flat(c.note)), `${loc}: paragraphs and the ROAS qualification`)
    assert.ok(sec.includes(`href="${service}"`) && sec.includes(`href="${pricing}"`), `${loc}: link destinations`)
    assert.ok(sec.includes('rgba(201,166,104') && !sec.includes('rgba(213,255,64'), `${loc}: gold theme, never lime`)
    assert.ok(!/aria-label="(Related service|Servicio relacionado|Service associé)"/.test(h), `${loc}: no separate related-service line`)
  }
  const es = ELYON_CONCLUSION.es
  assert.ok(es.lead === 'Para Elyon Dubai, combinamos la identidad de una marca de lujo con vídeos de creadores, entrevistas en la calle y una estrategia de producción continua para desarrollar nuevos creativos publicitarios.')
  assert.ok(es.strategy === 'Durante la fase inicial de aprendizaje, algunos creativos alcanzaron un ROAS de hasta 5,28x. Más allá de ese resultado, desarrollamos un sistema de producción que permite seguir probando, mejorando y creando nuevos anuncios.')
  assert.ok(/no son una media de todas las campañas/i.test(es.note) && /garantía/.test(es.note), 'not an average, not a guarantee')
  assert.deepEqual(es.headline.map((s) => s.text).join(''), 'Una marca premium necesita anuncios que estén a su altura.')
})

test('Elyon secondary hero CTA: in-page link to the Elyon videos, localized labels, primary CTA untouched, no new tab', () => {
  for (const [p, label] of [['/case-studies/elyon', 'See the videos we made'], ['/es/case-studies/elyon', 'Ver los vídeos que hemos producido'], ['/fr/case-studies/elyon', 'Voir les vidéos que nous avons réalisées']]) {
    const h = html(p)
    const m = h.match(/<a href="#elyon-videos"[^>]*>([^<]*)<\/a>/)
    assert.ok(m && m[1] === label, `${p}: ${m?.[1]}`)
    assert.ok(!/<a href="#elyon-videos"[^>]*target=/.test(h), `${p}: no new tab`)
    assert.ok(!h.includes('href="https://ugcbymohamed.com"'), `${p}: no longer leaves the case study`)
    assert.match(h, /<section id="elyon-videos" class="[^"]*scroll-mt-20[^"]*md:scroll-mt-24/, `${p}: anchor with header offset`)
  }
  assert.equal(read('src/i18n/ar/dict-graspo.js').includes('"See the videos we made": "شاهد الفيديوهات التي أنتجناها"'), true, 'Arabic label ready (no Arabic Elyon page exists)')
  const src = read('src/components/elyon/ElyonHero.jsx')
  assert.ok(/prefers-reduced-motion: reduce/.test(src) && /behavior: reduce \? 'auto' : 'smooth'/.test(src), 'reduced motion respected')
  assert.ok(/focus\(\{ preventScroll: true \}\)/.test(src), 'focus moves to the target heading')
})
