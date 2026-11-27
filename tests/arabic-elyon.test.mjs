// Run with: node --test tests/arabic-elyon.test.mjs
// The Arabic Elyon Dubai case study (/ar/case-studies/elyon) and the Arabic case-study navigation (Nov 2026): static HTML, head, hreflang, sitemap, JSON-LD, figures read from the data module,
// the two ROAS figures kept apart, the discoverability links, and the ES / FR terminology and hero-CTA checks of the same brief.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { SITE_URL } from '../src/config.js'
import { AR_SEO } from '../src/i18n/ar/seo.js'
import { ELYON_METRICS, ELYON_EARLY_TEST, ELYON_STANDOUT } from '../src/caseStudies/data.js'
import { ELYON_CONCLUSION } from '../src/i18n/caseStudyConclusions.js'
import { TRANSLATED_PATHS } from '../src/i18n/registry.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let tmp, dist
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-ar-elyon-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

const page = (p) => fs.readFileSync(path.join(dist, p.replace(/^\//, ''), 'index.html'), 'utf8')
const head = (h) => h.slice(0, h.indexOf('</head>'))
const root = (h) => h.slice(h.indexOf('id="root"'))
const text = (h) => root(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/&quot;|&#x27;/g, "'").replace(/\s+/g, ' ')
/* one entry per rendered element (cards, sentences, labels), so "the same card" is testable */
const blocks = (h) => root(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&nbsp;| /g, ' ').split('\n').map((l) => l.trim()).filter(Boolean)
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const hreflangs = (h) => [...head(h).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|')
const ELYON = '/ar/case-studies/elyon'

test('registry: both case studies and the duplicate default exist in Arabic', () => {
  for (const p of ['/case-studies', '/case-studies/graspo', '/case-studies/elyon']) assert.ok(TRANSLATED_PATHS.ar.includes(p), p)
})

test('static HTML: lang="ar" dir="rtl", one H1, Arabic title/description, self-canonical, indexable, reciprocal hreflang with all four languages', () => {
  const h = page(ELYON)
  assert.match(h, /^<!doctype html>\s*<html lang="ar" dir="rtl">/i)
  assert.equal([...root(h).matchAll(/<h1[\s>]/g)].length, 1)
  const seo = AR_SEO['/case-studies/elyon']
  assert.ok(head(h).includes(`<title>${seo.title}</title>`))
  assert.ok(head(h).includes(`content="${seo.description}"`))
  assert.ok(seo.title.length <= 70 && seo.description.length <= 220)
  assert.ok(head(h).includes(`<link rel="canonical" href="${SITE_URL}${ELYON}" />`))
  assert.ok(!/name="robots"/.test(head(h)), 'indexable')
  assert.ok(head(h).includes('property="og:locale" content="ar_AR"'))
  const want = `en ${SITE_URL}/case-studies/elyon|es ${SITE_URL}/es/case-studies/elyon|fr-FR ${SITE_URL}/fr/case-studies/elyon|ar ${SITE_URL}${ELYON}|x-default ${SITE_URL}/case-studies/elyon`
  for (const p of ['/case-studies/elyon', '/es/case-studies/elyon', '/fr/case-studies/elyon', ELYON]) assert.equal(hreflangs(page(p)), want, p)
  assert.ok(!/ar-(AE|SA)/.test(want))
})

test('/ar/case-studies is the Graspo duplicate (canonical to Graspo, no hreflang, not in the sitemap) and carries the switcher and both Arabic names', () => {
  const h = page('/ar/case-studies')
  assert.ok(head(h).includes(`<link rel="canonical" href="${SITE_URL}/ar/case-studies/graspo" />`))
  assert.ok(!/hreflang/.test(head(h)))
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  assert.ok(!xml.includes(`<loc>${SITE_URL}/ar/case-studies</loc>`))
  assert.ok(xml.includes(`<loc>${SITE_URL}${ELYON}</loc>`) && xml.includes(`<loc>${SITE_URL}/ar/case-studies/graspo</loc>`))
  for (const p of ['/ar/case-studies', '/ar/case-studies/graspo', ELYON]) {
    const t = text(page(p))
    assert.ok(t.includes('غراسبو') && t.includes('إيليون دبي'), `${p}: the switcher names both studies in Arabic`)
    assert.match(root(page(p)), /role="tablist"/)
    assert.ok(t.includes('دراسة الحالة التالية'), `${p}: next case study`)
  }
})

test('Arabic copy: the client is «إيليون دبي», figures come from the data module (ROAS with a Latin x, as in the owner copy), the two ROAS figures are never merged, MSA only', () => {
  const t = text(page(ELYON))
  const body = t.slice(t.indexOf('إيليون دبي × CONVRT · دراسة حالة'))
  assert.ok(t.includes('إيليون دبي'))
  assert.ok(!/Elyon Dubai|Elyon(?! *·)/.test(body.replace(/Elyon Dubai · WhatsApp/g, '')), 'no visitor-facing Latin «Elyon» in the body (the logo, handle and screenshot file names are not text)')
  for (const m of ELYON_METRICS) assert.ok(body.includes(m.value), m.value)
  assert.ok(body.includes(ELYON_EARLY_TEST.averageRoas) && body.includes(ELYON_STANDOUT.roas))
  for (const f of ['$229.89', '$835', '$3,421.25', '5.10x ROAS', '3.17x ROAS']) assert.ok(body.includes(f), f)
  assert.ok(!/USD|€/.test(body), 'amounts are written $…, never converted or relabelled')
  // 3.63x is the AVERAGE of the early four-creative test; 5.28x is ONE standout creative: no sentence or card mixes them
  for (const part of blocks(page(ELYON))) assert.ok(!(part.includes('3.63') && part.includes('5.28')), `3.63 and 5.28 in one element: ${part.slice(0, 80)}`)
  assert.match(body, /أربعة إعلانات على مدار يومين/); assert.match(body, /نتيجة مستقلة بعد عدة أسابيع/); assert.match(body, /دون دمج الأرقام/)
  assert.match(body, /ولا تمثل متوسط أداء جميع الحملات أو ضمانًا/)
  assert.ok(!/متوسط[^.]*5\.28/.test(body), 'the peak is never called an average')
  assert.ok(!/(^|\s)(مو|وش|نبغى|نبغي|بس|اللي|لحالها|مليانة)(\s|$)/.test(body), 'no Gulf dialect words')
  // approved terminology
  for (const w of ['UGC', 'Spokesperson', 'كونسيبت', 'مقابلات في الشارع', 'العائد على الإنفاق الإعلاني (ROAS)', 'غراسبو']) assert.ok(body.includes(w), w)
  assert.ok(!/(^|\s)قطعة محتوى/.test(body))
  // the Arabic conclusion block: the owner's wording; the qualification stays (client-reported, specific ads, not an average, not a guarantee)
  assert.match(ELYON_CONCLUSION.ar.note, /ولا تمثل متوسط أداء جميع الحملات أو ضمانًا/)
  assert.ok(ELYON_CONCLUSION.ar.labels[1].includes('واحد'))
})

test('owner copy (2026-11-26): headings, section labels, the three video ordinals, snapshot labels, ordinal stages and the conclusion read exactly as supplied', () => {
  const flat = blocks(page(ELYON)).join(' ').replace(/[\u2066\u2069]/g, '').replace(/\s+/g, ' ')
  for (const w of [
    'من إطلاق علامة عطور فاخرة إلى إعلانات تحقق مبيعات.', 'التجارة الإلكترونية', 'اختبار الإعلانات', 'المجال', 'السوق', 'طبيعة التعاون', 'شراكة إبداعية مستمرة', 'فيديو ونسخة إعلانية', 'وما زال الإنتاج مستمرًا', 'مدن للتصوير',
    'استراتيجية إنتاج مستمرة، وليس مجرد مجموعة فيديوهات.', 'التركيز على المبيعات، وليس المشاهدات فقط', 'من إنتاج المحتوى', 'إلى منظومة إعلانية متكاملة.', 'ردود فعل حقيقية تعزز الثقة بالمنتج.',
    'الفيديو الأول', 'إعلان مع صانع محتوى', 'الفيديو الثاني', 'مقابلة في الشارع', 'الفيديو الثالث', 'كونسيبت إعلاني يركز على المبيعات',
    'الأداء الإعلاني', 'إعلانات لم تكتفِ بجذب الانتباه.', 'بل حققت مبيعات.', 'النتائج الأولى', 'الاختبار الأولي', 'متوسط ROAS', 'ثاني أفضل إعلان', 'نتائج أكدها العميل عبر واتساب', 'نتيجة مستقلة بعد عدة أسابيع',
    'النتائج الثانية', 'الإعلان الأفضل أداءً', 'إعلان واحد. 9 عمليات شراء.', 'إيرادات المبيعات', 'عمليات شراء', 'عندما ينجح الإعلان،', 'نطوّر المزيد من الأفكار انطلاقًا منه.', '01 · الدفعة الأولى', '02 · التوسع', '03 · الإنتاج المستمر',
    'سبعة فيديوهات أسبوعيًا.', 'النتائج في الحساب الإعلاني.', 'والتأكيد من العميل.', 'إيليون دبي · واتساب', 'تأكيد العائد على الإنفاق الإعلاني للفيديو نفسه', 'العلامة الفاخرة تستحق إعلانات تليق بها.',
    'حققنا ذلك من خلال استراتيجية إنتاج مستمرة', 'أعلى ROAS', 'لكن الإنجاز الأهم كان بناء منظومة إنتاج', 'هل تبحث عن إعلانات تجمع بين جودة الإنتاج والأداء؟', 'اكتشف خدماتنا في إنتاج فيديوهات UGC', 'اطّلع على باقات إنتاج فيديوهات UGC',
    'دراسة الحالة التالية', 'شاهد دراسة الحالة', 'لنبدع معًا', 'البراندات الجيدة تستحق', 'إعلانات أفضل.', 'من العملاء يعودون للعمل معنا', 'ومشاريعه الأخرى في إنتاج المحتوى الإبداعي.',
  ]) assert.ok(flat.includes(w), w)
  // the screenshot disclosure was dropped from the header at the owner's wording, the logo image keeps its Latin alt
  assert.ok(!flat.includes('لقطة الشاشة بالإنجليزية'))
  // scoped wording does not leak: the Graspo study keeps «القطاع» / «الأسواق المستهدفة», the hero label of Elyon is «المجال» / «السوق»
  const g = blocks(page('/ar/case-studies/graspo')).join(' ')
  assert.ok(g.includes('القطاع') && g.includes('الأسواق المستهدفة'))
  assert.ok(!flat.includes('القطاع '))
})

test('primary CTAs open the Arabic Free Creative Growth Roadmap; no calendar or booking link anywhere on the page; secondary CTA scrolls in page', () => {
  const h = root(page(ELYON))
  const hrefs = [...h.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').trim()])
  const primary = hrefs.filter(([, label]) => label === 'احصل على 5 أفكار إعلانية مجانًا')
  assert.ok(primary.length >= 3, 'nav, hero and final CTA')
  for (const [href] of primary) assert.equal(href, '/ar/creative-growth-roadmap')
  assert.ok(!/calendly|احجز مكالمة/i.test(h))
  assert.ok(hrefs.some(([href, label]) => href === '#elyon-videos' && label === 'شاهد الفيديوهات التي أنتجناها'))
  // internal links stay localized
  for (const [href] of hrefs) assert.ok(!/^\/(ugc-video-agency|pricing|case-studies\/graspo)/.test(href), `English link on the Arabic page: ${href}`)
})

test('hero secondary CTA scrolls to the video section on the same page; the section exists with a scroll margin for the fixed header', () => {
  const h = root(page(ELYON))
  assert.match(h, /<a href="#elyon-videos"[^>]*>\s*شاهد الفيديوهات التي أنتجناها\s*<\/a>/)
  assert.match(h, /<section id="elyon-videos" class="[^"]*scroll-mt-20[^"]*md:scroll-mt-24/)
  const src = fs.readFileSync(path.join(ROOT, 'src/components/elyon/ElyonHero.jsx'), 'utf8')
  assert.ok(src.includes("(prefers-reduced-motion: reduce)") && src.includes('scrollIntoView') && src.includes('heading.focus'), 'reduced motion and keyboard focus are handled')
})

test('gold identity: no lime anywhere in the Elyon components, RTL arrows are turned, the bottle scene is an LTR island', () => {
  for (const f of fs.readdirSync(path.join(ROOT, 'src/components/elyon'))) {
    assert.ok(!/#d5ff40|text-lime|bg-lime|border-lime/i.test(fs.readFileSync(path.join(ROOT, 'src/components/elyon', f), 'utf8')), `${f}: no lime`)
  }
  const h = root(page(ELYON))
  assert.match(h, /md:rotate-180/, 'the spend → value → ROAS arrows point left in RTL')
  assert.match(h, /<div dir="ltr" class="contents">/)
  const en = root(page('/case-studies/elyon'))
  assert.match(en, /md:rotate-0/); assert.ok(!/md:rotate-180/.test(en))
})

test('structured data: one graph, inLanguage ar, the existing case-study shape (WebPage + breadcrumb + the UGC service), no Article, rating, review or date', () => {
  const g = ld(page(ELYON))
  assert.equal(g.length, 1)
  const nodes = g[0]['@graph']
  const web = nodes.find((n) => n['@type'] === 'WebPage')
  assert.equal(web.inLanguage, 'ar'); assert.equal(web.url, `${SITE_URL}${ELYON}`)
  assert.deepEqual(web.about, { '@type': 'Organization', name: 'Elyon Dubai' })
  assert.deepEqual(web.mentions, { '@id': `${SITE_URL}/ar/ugc-video-agency#service` })
  const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList').itemListElement
  assert.equal(crumbs.length, 2)
  const s = JSON.stringify(g)
  assert.ok(!/"Article"|"Review"|"Rating"|aggregateRating|datePublished|dateModified/.test(s))
})

test('discoverability: Arabic navigation, footer, UGC page, Showcase, referrals and the home stage reach the Arabic Elyon study; no Arabic link to the English study', () => {
  for (const p of ['/ar', '/ar/pricing', '/ar/ugc-video-agency', '/ar/creator-showcase', ELYON, '/ar/case-studies/graspo']) {
    const h = root(page(p))
    assert.ok(h.includes('href="/ar/case-studies"'), `${p}: the Case Studies menu entry opens /ar/case-studies (not Graspo only)`)
    const english = [...h.matchAll(/<a [^>]*href="(\/case-studies\/[a-z]+)"[^>]*>/g)].filter((m) => !/hrefLang="en"/.test(m[0])) // the language selector's own English link is expected
    assert.deepEqual(english.map((m) => m[1]), [], `${p}: no link to an English study`)
  }
  for (const p of ['/ar', '/ar/ugc-video-agency', '/ar/creator-showcase']) assert.ok(root(page(p)).includes(`href="${ELYON}"`), `${p}: links the Arabic Elyon study`)
  assert.ok(root(page('/ar/creator-showcase')).includes('href="/ar/case-studies/graspo"'), 'the Showcase guide keeps the organic (Graspo) link too')
  // the Elyon link is never labelled as English any more
  const showcase = text(page('/ar/creator-showcase'))
  assert.ok(!/الحملات الإعلانية باستخدام فيديوهات UGC \(بالإنجليزية\)/.test(showcase))
  // English pages keep their own URLs untouched
  assert.ok(root(page('/')).includes('href="/case-studies/elyon"'))
})

test('Spanish and French Elyon studies: the owner\'s CTA wording, hook/créas terminology, the two ROAS figures apart', () => {
  const es = text(page('/es/case-studies/elyon')), fr = text(page('/fr/case-studies/elyon'))
  assert.ok(es.includes('Ver los vídeos que hemos producido')); assert.ok(fr.includes('Voir les vidéos que nous avons réalisées'))
  assert.ok(!/gancho/i.test(es), 'Spanish: "hook", never "gancho"'); assert.ok(!/creatividades/i.test(es), 'Spanish: "creativos", not "creatividades"')
  for (const [name, t] of [['es', es], ['fr', fr]]) {
    assert.ok(t.includes('3,63') && t.includes('5,28'), `${name}: both figures`)
    for (const part of blocks(page(`/${name}/case-studies/elyon`))) assert.ok(!(part.includes('3,63') && part.includes('5,28')), `${name}: 3,63 and 5,28 in one element: ${part.slice(0, 80)}`)
  }
  for (const loc of ['/es', '/fr']) assert.match(root(page(`${loc}/case-studies/elyon`)), /<section id="elyon-videos"/)
})
