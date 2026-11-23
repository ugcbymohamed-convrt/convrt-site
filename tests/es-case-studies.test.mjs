// Run with: node --test tests/es-case-studies.test.mjs
// Spanish case studies (/es/case-studies, /es/case-studies/graspo, /es/case-studies/elyon): static HTML, head, hreflang, sitemap, JSON-LD, figures read from the data modules.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { SITE_URL } from '../src/config.js'
import { ES_SEO } from '../src/i18n/es/seo.js'
import { localizeStat } from '../src/i18n/format.js'
import { formatMoneyEs } from '../src/i18n/es/money.js'
import { GRASPO_METRICS, GRASPO_FUNNEL, GRASPO_LEADS_BY_MONTH, GRASPO_PERIOD, ELYON_METRICS, ELYON_EARLY_TEST, ELYON_STANDOUT, ELYON_SCALE_STAGES } from '../src/caseStudies/data.js'
import { ELYON_PROOF } from '../src/content/ugcProof.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let tmp, dist
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-es-cs-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

const file = (p) => path.join(dist, p.replace(/^\//, ''), 'index.html')
const page = (p) => fs.readFileSync(file(p), 'utf8')
const head = (h) => h.slice(0, h.indexOf('</head>'))
const text = (h) => h.slice(h.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/&quot;|&#x27;/g, "'").replace(/\s+/g, ' ')
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const es = (v) => localizeStat('es', v)
const usd = (n) => formatMoneyEs({ amount: n, currency: 'USD' }).replace(' ', ' ')
const PAGES = ['/es/case-studies', '/es/case-studies/graspo', '/es/case-studies/elyon']
const metric = (label) => GRASPO_METRICS.find((m) => m.label === label).value

test('the three Spanish pages exist as static HTML: Spanish lang, one H1, Spanish title/description', () => {
  for (const p of PAGES) {
    const h = page(p)
    assert.match(h, /^<!doctype html>\s*<html lang="es">/i, p)
    assert.equal([...h.matchAll(/<h1[\s>]/g)].length, 1, `${p}: one H1`)
  }
  for (const bp of ['/case-studies/graspo', '/case-studies/elyon']) {
    const seo = ES_SEO[bp]
    const h = page('/es' + bp)
    assert.ok(head(h).includes(`<title>${seo.title}</title>`), `${bp}: title`)
    assert.ok(head(h).includes(`content="${seo.description}"`), `${bp}: description`)
    assert.ok(seo.title.length <= 66 && seo.description.length <= 200)
    assert.ok(!/name="robots"/.test(head(h)), `${bp}: indexable`)
  }
  assert.match(text(page('/es/case-studies/graspo')), /Caso de éxito/)
})

test('canonical and hreflang: each study is self-canonical with en/es/x-default; /es/case-studies canonicalises to Graspo and carries no hreflang (as in English)', () => {
  for (const bp of ['/case-studies/graspo', '/case-studies/elyon']) {
    const es = page('/es' + bp), en = page(bp)
    assert.ok(head(es).includes(`<link rel="canonical" href="${SITE_URL}/es${bp}" />`), `${bp}: Spanish self-canonical`)
    const set = (h) => [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|')
    assert.equal(set(es), set(en), `${bp}: reciprocal set`)
    assert.equal(set(en), `en ${SITE_URL}${bp}|es ${SITE_URL}/es${bp}|x-default ${SITE_URL}${bp}`)
  }
  const dup = page('/es/case-studies')
  assert.ok(head(dup).includes(`<link rel="canonical" href="${SITE_URL}/es/case-studies/graspo" />`))
  assert.ok(!/hreflang/.test(head(dup)) && !/hreflang/.test(head(page('/case-studies'))))
})

test('sitemap: the two studies are listed in Spanish; the duplicate /es/case-studies is not', () => {
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  assert.ok(sm.includes(`<loc>${SITE_URL}/es/case-studies/graspo</loc>`) && sm.includes(`<loc>${SITE_URL}/es/case-studies/elyon</loc>`))
  assert.ok(!sm.includes(`<loc>${SITE_URL}/es/case-studies</loc>`))
})

test('JSON-LD: Spanish WebPage + two-level breadcrumb + Service, same Organization @id as English, no Article / rating / dates', () => {
  const org = (h) => ld(h)[0]['@graph'].find((n) => n['@type'] === 'Organization')
  for (const bp of ['/case-studies/graspo', '/case-studies/elyon']) {
    const h = page('/es' + bp), g = ld(h)[0]['@graph']
    assert.deepEqual(org(h), org(page(bp)), `${bp}: Organization identical to English`)
    const web = g.find((n) => n['@type'] === 'WebPage')
    assert.equal(web.inLanguage, 'es')
    assert.equal(web.url, `${SITE_URL}/es${bp}`)
    const bc = g.find((n) => n['@type'] === 'BreadcrumbList')
    assert.deepEqual(bc.itemListElement.map((i) => i.item), [`${SITE_URL}/es/`, `${SITE_URL}/es${bp}`])
    assert.match(bc.itemListElement[1].name, /^Caso de éxito de /)
    assert.ok(g.some((n) => n['@type'] === 'Service'))
    assert.ok(!/Article|aggregateRating|Review|datePublished|"Rating"/.test(JSON.stringify(g)))
  }
})

test('Graspo: every verified figure, the period, the sources and the limitation appear in Spanish notation', () => {
  const t = text(page('/es/case-studies/graspo'))
  for (const m of GRASPO_METRICS) assert.ok(t.includes(es(m.value)), `metric ${m.value}`)
  for (const s of GRASPO_FUNNEL) assert.ok(t.includes(es(s.value)))
  for (const m of GRASPO_LEADS_BY_MONTH) assert.ok(t.includes(String(m.count)))
  assert.ok(t.includes('10,7 M') && t.includes('3,4 M') && t.includes('75 leads'))
  assert.equal(GRASPO_PERIOD.to, 'Jun 19 2026')
  assert.ok(t.includes('del 1 de enero al 19 de junio de 2026'), 'reporting period')
  assert.ok(/Meta Business Suite/.test(t) && /registro interno de contactos entrantes/.test(t), 'sources')
  assert.ok(/corresponden a un cliente y un periodo concretos\. No son resultados habituales ni constituyen una garantía/.test(t), 'caveat')
  assert.ok(/pensad[oa] en árabe/.test(t), 'Arabic-first production is kept')
  assert.ok(t.includes('0 USD'))
  assert.equal(metric('Total Views'), '10.7M')
})

test('Elyon: figures in Spanish notation, USD never converted, the two snapshots stay separate, "Spanish-language interviews" kept, quotes untouched', () => {
  const h = page('/es/case-studies/elyon'), t = text(h)
  for (const m of ELYON_METRICS) assert.ok(t.includes(es(m.value)), `metric ${m.value}`)
  assert.ok(t.includes(usd(ELYON_STANDOUT.revenue.usd)) && t.includes('3.421,25 USD'))
  assert.ok(t.includes(usd(ELYON_EARLY_TEST.spend.usd)) && t.includes(usd(ELYON_EARLY_TEST.purchaseValue.usd)))
  assert.equal(`$${ELYON_STANDOUT.revenue.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, ELYON_PROOF.revenue)
  assert.equal(ELYON_STANDOUT.roas, ELYON_PROOF.roas)
  assert.ok(!/€|EUR/.test(t.replace(/Almería/g, '')), 'no euro conversion')
  assert.ok(t.includes(es(ELYON_EARLY_TEST.averageRoas)) && t.includes('Instantánea de rendimiento 1') && t.includes('Instantánea de rendimiento 2'))
  assert.ok(/sin sumarlas/.test(t) && /semanas después/.test(t), 'snapshots are separate moments')
  assert.ok(t.includes('Entrevistas en español') && ELYON_SCALE_STAGES.some((s) => s.value === '22'))
  assert.ok(/no son resultados habituales ni constituyen una garantía/i.test(t))
  assert.ok(!/<blockquote/.test(h), 'no testimonial is added or translated on this page')
})

test('no leftover English UI sentences and no English-only links without a label', () => {
  const EN = new Set('the and your with you our for are this that from what how will we of its is to can has have be or not it by at an on in as but'.split(' '))
  const ES = new Set('el la los las de del y en que un una con para por tu tus su sus es se no al lo como más pero si o a'.split(' '))
  for (const p of PAGES) {
    const body = page(p).slice(page(p).indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, ' ')
    for (const chunk of body.split(/<[^>]+>/).map((s) => s.trim()).filter(Boolean)) {
      const w = chunk.toLowerCase().replace(/[^a-záéíóúñü' ]/g, ' ').split(/\s+/).filter(Boolean)
      if (w.length < 2) continue
      const en = w.filter((x) => EN.has(x)).length, e = w.filter((x) => ES.has(x)).length
      assert.ok(!(en >= 1 && en > e), `${p}: English text left: "${chunk.slice(0, 100)}"`)
    }
    for (const m of body.matchAll(/<a [^>]*href="(\/[^"#?]*)[^>]*>/g)) {
      if (/lang="en"/.test(m[0])) continue
      assert.ok(!/^\/(case-studies|pricing|ugc-video-agency|social-media-video-production|creative-growth-roadmap)(\/|$)/.test(m[1]) || m[1] === '/', `${p}: links the English ${m[1]}`)
    }
  }
})

test('the Spanish menu and footer list the case studies; English pages keep their English figures', () => {
  const h = page('/es/pricing')
  assert.match(h, /href="\/es\/case-studies"[^>]*>Casos de éxito</)
  assert.ok(text(page('/case-studies/elyon')).includes('3.63x') && text(page('/case-studies/graspo')).includes('10.7M views. 75 inbound leads.'))
})
