// Run with: node --test tests/about-localized.test.mjs  (reads dist/: run `npm run build` first)
// About in four languages: ONE premium layout (src/components/about/AboutLayout.jsx). English keeps its words (src/content/about/english.js over TRUST_CONTENT.about); Spanish, French and Arabic are the
// owner's professionally localized copy, copied verbatim (src/content/about/{es,fr,ar}.js, supplied 27 Nov 2026), with the founder-experience figures read from siteStats.js and their disclosure always visible.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ABOUT_ES from '../src/content/about/es.js'
import ABOUT_FR from '../src/content/about/fr.js'
import ABOUT_AR from '../src/content/about/ar.js'
import { CONVRT_STATS } from '../src/lib/siteStats.js'
import { localizeStat } from '../src/i18n/format.js'
import { SEO_BY_LOCALE } from '../src/i18n/seo.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(ROOT, 'dist')
const page = (p) => fs.readFileSync(path.join(dist, `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const SPACES = /[  ]/g
const norm = (s) => s.replace(SPACES, ' ').replace(/\s+/g, ' ').trim()
/* The visible text of the About content: block tags end a line, inline tags (links, bdi, spans, React text markers) vanish, so a sentence that contains a link is still one string. */
const text = (h) => norm(h.slice(h.indexOf('aria-labelledby="about-h1"')).replace(/<footer[\s\S]*$/, '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<!-- -->/g, '').replace(/<\/(p|h1|h2|h3|li|div|section|ul|ol)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').split('\n').map(norm).filter(Boolean).join('\n')
  .replace(/\n/g, ' \n '))
const plain = (s) => s.replace(/\[\[([^\]|]+)\|[^\]]+\]\]/g, '$1')
const PAGES = { es: '/es/about', fr: '/fr/about', ar: '/ar/about' }
const CONTENT = { es: ABOUT_ES, fr: ABOUT_FR, ar: ABOUT_AR }

/* Every string of a content module in page order (the order the layout renders them). */
const sequence = (c) => [
  c.badge, c.h1.lead, c.h1.accent, c.intro,
  c.glance.heading, ...c.glance.items.flatMap((i) => [i.label, i.text]),
  c.what.badge, c.what.lead, ...c.what.services.flatMap((s) => [s.name, s.text]), c.what.outro,
  c.founder.badge, c.founder.heading, ...c.founder.paragraphs,
  c.experience.heading, c.experience.disclaimer,
  c.creators.badge, c.creators.heading, ...c.creators.paragraphs,
  c.markets.badge, c.markets.heading, ...c.markets.paragraphs,
  c.scope.badge, c.scope.heading, ...c.scope.items.flatMap((i) => [i.title, i.text]),
  c.closing.badge, c.closing.heading, c.closing.text, c.closing.primary, c.closing.secondary,
].map(plain)

test('every supplied string of the owner\'s About copy is on its page, in order, with exactly one h1', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p), t = text(h)
    assert.equal((h.match(/<h1[ >]/g) ?? []).length, 1, p)
    let from = 0
    for (const s of sequence(CONTENT[l])) { const i = t.indexOf(norm(s), from); assert.ok(i >= 0, `${p}: missing or out of order: ${s.slice(0, 80)}`); from = i }
  }
})

test('the modules hold the supplied copy: structure (9 fact cards, 4 services, 5 creator paragraphs, 4 scope cards) and spot checks of the supplied wording', () => {
  for (const l of ['es', 'fr', 'ar']) {
    const c = CONTENT[l]
    assert.equal(c.glance.items.length, 9, l); assert.equal(c.what.services.length, 4, l); assert.equal(c.creators.paragraphs.length, 5, l); assert.equal(c.scope.items.length, 4, l)
    assert.equal(c.founder.paragraphs.length, 2, l); assert.equal(c.markets.paragraphs.length, 2, l)
    assert.deepEqual(c.what.services.map((s) => s.href), ['/ugc-video-agency', '/saas-video-production', '/spokesperson-video-production', '/social-media-video-production'], l)
  }
  assert.equal(ABOUT_ES.badge, 'Sobre CONVRT'); assert.deepEqual(ABOUT_ES.h1, { lead: 'Sobre', accent: 'CONVRT Studio' })
  assert.equal(ABOUT_ES.what.lead, 'Creamos contenido en vídeo diseñado para captar la atención, generar confianza e impulsar la acción.')
  assert.equal(ABOUT_ES.closing.heading, 'Demos forma a tu próxima gran creatividad'); assert.equal(ABOUT_ES.closing.primary, 'Consigue 5 conceptos publicitarios gratis'); assert.equal(ABOUT_ES.closing.secondary, 'Explora nuestros servicios')
  assert.equal(ABOUT_ES.experience.disclaimer, 'Estas cifras reflejan la trayectoria profesional de nuestro fundador, incluidos los trabajos realizados a través de CONVRT Studio y sus proyectos anteriores de producción creativa.')
  assert.equal(ABOUT_FR.badge, 'À propos de CONVRT'); assert.deepEqual(ABOUT_FR.h1, { lead: 'À propos de', accent: 'CONVRT Studio' })
  assert.equal(ABOUT_FR.what.lead, "Nous créons des vidéos conçues pour capter l'attention, inspirer confiance et inciter à l'action.")
  assert.equal(ABOUT_FR.closing.heading, 'Créons votre prochaine grande créa'); assert.equal(ABOUT_FR.closing.primary, 'Obtenez 5 concepts publicitaires offerts'); assert.equal(ABOUT_FR.closing.secondary, 'Découvrez nos services')
  assert.equal(ABOUT_FR.experience.disclaimer, "Ces chiffres reflètent l'ensemble de l'expérience professionnelle de notre fondateur, y compris les projets réalisés au sein de CONVRT Studio et ses précédents projets de production créative.")
  assert.equal(ABOUT_AR.badge, 'عن CONVRT'); assert.deepEqual(ABOUT_AR.h1, { lead: 'تعرّف على', accent: 'CONVRT Studio' })
  assert.equal(ABOUT_AR.what.lead, 'نصنع محتوى فيديو مصمّمًا لجذب الانتباه، وبناء الثقة، وتحفيز الجمهور على اتخاذ إجراء.')
  assert.equal(ABOUT_AR.closing.heading, 'لنصنع إعلانك الإبداعي القادم'); assert.equal(ABOUT_AR.closing.primary, 'احصل على 5 أفكار إعلانية مجانًا'); assert.equal(ABOUT_AR.closing.secondary, 'استكشف خدماتنا')
  assert.equal(ABOUT_AR.experience.disclaimer, 'تعكس هذه الأرقام مجمل الخبرة المهنية لمؤسسنا، بما في ذلك الأعمال المنفّذة من خلال CONVRT Studio ومشاريعه السابقة في الإنتاج الإبداعي.')
  // the founder is named in full, in Latin script, in every language (legal name; the Arabic copy keeps it in Latin)
  for (const l of ['es', 'fr', 'ar']) assert.ok(plain(JSON.stringify(CONTENT[l])).includes('Mohamed Doukkali Azizi'), l)
})

test('the four figures come from the single source (siteStats.js); each label is the tail of the supplied bullet; the supplied disclaimer is printed under them with four asterisks', () => {
  // the supplied bullets, whole (the layout shows the figure large and the rest as its caption: the formatting differences are listed in the About report)
  const bullets = {
    es: ['+1.200 vídeos producidos', '+40 M de visualizaciones generadas', '+500 clientes atendidos', 'Más del 50 % de clientes recurrentes'],
    fr: ['1 200+ vidéos produites', '40 M+ de vues générées', '500+ clients accompagnés', '50 %+ de clients récurrents'],
    ar: ['أكثر من 1,200 فيديو تم إنتاجه', 'أكثر من 40 مليون مشاهدة', 'أكثر من 500 عميل تم العمل معهم', 'أكثر من 50% من العملاء يعودون للتعامل مجددًا'],
  }
  assert.deepEqual([CONVRT_STATS.videos, CONVRT_STATS.views, CONVRT_STATS.clients, CONVRT_STATS.returningClients], ['1,200+', '40M+', '500+', '50%+'])
  for (const [l, p] of Object.entries(PAGES)) {
    const c = CONTENT[l], keys = ['videos', 'views', 'clients', 'returningClients']
    assert.ok(!('bullets' in c.experience), `${l}: the figures are never typed in the copy module (siteStats.js only); the supplied bullets are pinned in this test`)
    const h = page(p), t = text(h)
    keys.forEach((k, i) => {
      assert.ok(bullets[l][i].endsWith(c.experience.labels[k]), `${l}.${k}: the label is the tail of the supplied bullet`)
      const figure = norm(localizeStat(l, CONVRT_STATS[k]))
      assert.ok(t.includes(figure), `${p}: figure ${figure}`)
      assert.ok(t.includes(norm(c.experience.labels[k])), `${p}: label ${c.experience.labels[k]}`)
    })
    assert.ok(t.includes(norm(c.experience.disclaimer)), `${p}: disclosure visible`)
    assert.ok(/CONVRT Studio/.test(c.experience.disclaimer) && !/(only|solo|uniquement|فقط)/.test(c.experience.disclaimer), 'never presented as CONVRT-only')
    assert.equal((h.match(/<span aria-hidden="true">\*<\/span>/g) ?? []).length, 4, `${p}: four asterisks`)
  }
  // the English About page shows the same four figures under the owner's shortened disclosure (27 Nov 2026)
  const en = text(page('/about'))
  for (const v of ['1,200+', '40M+', '500+', '50%+']) assert.ok(en.includes(v), `English About: ${v}`)
  assert.ok(en.includes('These figures reflect our founder’s combined professional experience, including work through CONVRT Studio and previous creative production projects.'), 'English About: the shortened founder-experience disclosure')
})

test('every internal link in the About content points to the page\'s own language; the links added to the supplied copy mirror the English page\'s links', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p)
    const region = h.slice(h.indexOf('id="about-h1"')).replace(/<footer[\s\S]*$/, '')
    const hrefs = [...region.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1])
    for (const href of hrefs.filter((x) => x.startsWith('/'))) assert.ok(href === `/${l}` || href.startsWith(`/${l}/`), `${p}: ${href} is not localized`)
    for (const want of ['/ugc-video-agency', '/saas-video-production', '/spokesperson-video-production', '/social-media-video-production', '/case-studies/graspo', '/case-studies/elyon', '/pricing', '/creator-showcase', '/contact', '/creative-growth-roadmap'])
      assert.ok(hrefs.includes(`/${l}${want}`), `${p}: link to ${want}`)
    for (const want of ['https://www.linkedin.com/company/123164137/', 'https://www.instagram.com/convrtcreativestudio/', 'https://www.linkedin.com/in/mohameddoukkaliazizi/', 'https://forms.gle/Bg8ubU2tnmMj88m7A']) assert.ok(hrefs.includes(want), `${p}: ${want}`)
    assert.ok(hrefs.includes(`/${l}/#services`), `${p}: services button`)
    assert.ok(!/calendly/i.test(h), p)
  }
  // the English page links the same targets (so the localized pages carry no link the English one lacks, and vice versa)
  const en = page('/about'); const enHrefs = new Set([...en.slice(en.indexOf('id="about-h1"')).replace(/<footer[\s\S]*$/, '').matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]))
  for (const l of ['es', 'fr', 'ar']) {
    const h = page(PAGES[l]); const hrefs = new Set([...h.slice(h.indexOf('id="about-h1"')).replace(/<footer[\s\S]*$/, '').matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1].replace(new RegExp(`^/${l}(?=/|$)`), '') || '/'))
    for (const href of enHrefs) assert.ok(hrefs.has(href === '' ? '/' : href), `${l}: the English page's link ${href} is missing`)
  }
})

test('Arabic: right-to-left page; Latin names, brands and identifiers are isolated (bdi), Western digits kept; French uses non-breaking spaces before ; : ? !', () => {
  const ar = page('/ar/about')
  assert.match(ar, /<html lang="ar" dir="rtl">/)
  assert.ok(ar.includes('<bdi dir="ltr">Graspo:</bdi>') && ar.includes('<bdi dir="ltr">Elyon Dubai:</bdi>') && ar.includes('<bdi dir="ltr">ROAS</bdi>'), 'Latin brand names and ROAS are isolated runs')
  assert.ok(/<bdi dir="ltr">[^<]*Mohamed Doukkali Azizi[^<]*<\/bdi>/.test(ar), 'the founder name is one isolated Latin run')
  assert.ok(!/[٠-٩]/.test(text(ar)), 'Western digits only (one notation for UAE and Saudi readers)')
  assert.ok(text(ar).includes('10.7') && text(ar).includes('5.28') && text(ar).includes('2026'))
  assert.ok(!/ضريبة|القيمة المضافة|VAT/.test(JSON.stringify(ABOUT_AR)), 'no VAT wording on any Arabic page (owner, 26 Nov 2026)')
  const fr = page('/fr/about')
  assert.ok(/ [:;?!]/.test(fr.replace(/<[^>]+>/g, '')) || / [:;?!»]/.test(fr), 'French pages carry the typographic no-break space')
})

test('no invented claim: no office, address, award, certification, rating, team member; only the two published case studies are named; no review or LocalBusiness structured data', () => {
  for (const l of ['es', 'fr', 'ar']) {
    const flat = plain(JSON.stringify(CONTENT[l]))
    assert.ok(!/oficina|sucursal|premio|certific|valoraci|reseñas|bureau|prix|certifi|avis|مكتب|جائزة|شهادة|تقييم/i.test(flat.replace(/valoración/g, '')), l)
    assert.ok(!/\b(Adscale|FIXD)\b/i.test(flat), `${l}: no client other than the two published case studies is named`)
    assert.ok(!page(PAGES[l]).includes('LocalBusiness') && !/aggregateRating|"review"/.test(page(PAGES[l])), `${l}: no review/rating/LocalBusiness structured data`)
    assert.ok(!/calle |avenida |rue |avenue |شارع/i.test(flat), `${l}: no street address on the About page`)
  }
  // "gancho" is never used for an advertising hook (site terminology; the supplied Spanish copy uses "hooks" where the English does)
  assert.ok(!/gancho/i.test(JSON.stringify(ABOUT_ES)))
})

test('Call to action: the free Roadmap in the page language and the services section; no booking link; tracked with page events', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p)
    assert.ok(h.includes(`href="/${l}/creative-growth-roadmap"`), p); assert.ok(h.includes(`href="/${l}/#services"`), p)
    assert.ok(!/calendly/i.test(h), p)
  }
})

test('About SEO and structured data are untouched: the approved titles, self-canonical, reciprocal hreflang in four languages, in the sitemap; one Organization and an AboutPage per language', () => {
  assert.equal(SITE_SEO['/about'].title, 'About CONVRT | Creative Video Production Studio')
  assert.equal(SEO_BY_LOCALE.es['/about'].title, 'Sobre CONVRT | Estudio creativo de producción de vídeo')
  assert.equal(SEO_BY_LOCALE.fr['/about'].title, 'À propos de CONVRT | Studio de production vidéo créative')
  assert.equal(SEO_BY_LOCALE.ar['/about'].title, 'عن CONVRT | استوديو إبداعي لإنتاج الفيديوهات')
  // the page badge repeats the title's brand part in every language
  for (const [l, c] of Object.entries(CONTENT)) assert.ok(SEO_BY_LOCALE[l]['/about'].title.startsWith(c.badge), `${l}: the badge matches the title`)
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const p of ['/about', ...Object.values(PAGES)]) { assert.ok(sm.includes(`https://www.convrt.studio${p}</loc>`), p); assert.match(page(p), new RegExp(`<link rel="canonical" href="https://www.convrt.studio${p}"`)) }
  const sets = ['/about', ...Object.values(PAGES)].map((p) => [...page(p).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|'))
  assert.ok(sets.every((s) => s === sets[0]) && sets[0].split('|').length === 5)
  for (const p of ['/about', ...Object.values(PAGES)]) {
    assert.ok(!/content="noindex/.test(page(p)), `${p} is indexable`)
    const ld = [...page(p).matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
    const g = ld[0]['@graph']
    assert.ok(g.some((n) => n['@type'] === 'AboutPage') && g.filter((n) => n['@type'] === 'Organization').length === 1, p)
    assert.equal(g.find((n) => n['@type'] === 'Organization')['@id'], 'https://www.convrt.studio/#organization')
    // nothing in the markup repeats a figure or a claim: the founder-experience numbers are never in structured data (CLAUDE.md, GEO Work Package 2)
    assert.ok(!/1,200|1\.200|40M|500\+|aggregateRating/.test(JSON.stringify(g)), `${p}: no founder-experience figure in structured data`)
  }
  assert.match(page('/about').replace(/<[^>]+>/g, '').replace(/<!-- -->/g, '').replace(/\s+/g, ' '), /About CONVRT Studio/)
})
