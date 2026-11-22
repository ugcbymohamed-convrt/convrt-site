// Run with: node --test tests/founder-experience.test.mjs
// GEO Work Package 2 implementation (2026-11-22): the four statistics are the FOUNDER'S combined professional experience, not CONVRT-Studio-only; home/pricing/About attribute them in
// the same words; the numbers and the design are unchanged; no ratings, reviews, founding date or employee data anywhere; hero posters have real alt text; favicon.ico and
// apple-touch-icon exist. The built-page checks run a real production build into a temp dir (as tests/prerender.test.mjs does).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../src/lib/siteStats.js'
import { TRUST_CONTENT } from '../src/content/trustPages.js'
import { PUBLIC_CLAIMS, BRAND } from '../src/seo/businessKnowledge.js'
import { organizationNode, homeGraph } from '../src/seo/structuredData.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { COMPANY_LINKEDIN_URL, TRUST_PAGES_PUBLISHED } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const unesc = (h) => h.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')

let tmp, dist
const page = (route) => fs.readFileSync(path.join(dist, route === '/' ? 'index.html' : path.join(route.replace(/^\//, ''), 'index.html')), 'utf8')
const allHtml = (dir = dist) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name)
  return e.isDirectory() ? allHtml(p) : e.name.endsWith('.html') ? [p] : []
})
const jsonLdOf = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-founder-exp-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('the four figures are unchanged and their attribution is written once', () => {
  assert.deepEqual([CONVRT_STATS.videos, CONVRT_STATS.views, CONVRT_STATS.clients, CONVRT_STATS.returningClients], ['1,200+', '40M+', '500+', '50%+'])
  for (const k of ['caption', 'footnote', 'scope']) assert.ok(/CONVRT Studio and other professional creative production work/.test(FOUNDER_EXPERIENCE[k]), k)
  assert.ok(/founder/i.test(FOUNDER_EXPERIENCE.footnote) && /founder/i.test(FOUNDER_EXPERIENCE.scope))
  assert.ok(/not exclusive/.test(FOUNDER_EXPERIENCE.scope))
})

test('the literal figures live in siteStats.js only (components and pages read them from there)', () => {
  const walk = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  const offenders = walk('src').filter((f) => /\.(jsx?|mjs)$/.test(f) && !f.includes('i18n/') && f !== 'src/lib/siteStats.js').filter((f) => /1,200\+|40M\+|\b500\+ (clients|brands)/.test(read(f)))
  assert.deepEqual(offenders, [])
})

test('homepage: "clients" not "brands", founder attribution in the headline and caption, footnote under the strip, every figure marked, labels unchanged', () => {
  const h = unesc(page('/')).replace(/<!-- -->/g, '')
  assert.match(h, /Our founder has worked with <span class="text-lime">500\+ clients<\/span> across ecommerce, apps, SaaS, and global consumer markets\./)
  assert.ok(!/Trusted by(<[^>]+>|\s)*500\+/.test(h) && !/500\+ brands/.test(h))
  assert.ok(h.includes(FOUNDER_EXPERIENCE.caption))
  for (const label of ['Videos produced', 'Views generated', 'of clients return for more']) assert.ok(h.includes(`${label}<span aria-hidden="true">*</span>`), label)
  for (const v of ['1,200+', '40M+', '50%+']) assert.ok(h.includes(`>${v}</span>`), v)
  assert.ok(h.includes(`* ${FOUNDER_EXPERIENCE.footnote}`))
  assert.match(h, /500\+ clients/)
})

test('pricing: the three founder figures are marked and explained once; the languages count (a CONVRT fact) is not', () => {
  const h = unesc(page('/pricing')).replace(/<!-- -->/g, '')
  for (const label of ['Views generated', 'Videos produced', 'Clients served']) assert.ok(h.includes(`${label}<span aria-hidden="true">*</span>`), label)
  assert.ok(h.includes('Core production languages</p>') && !h.includes('Core production languages<span'))
  assert.equal(h.split(`* ${FOUNDER_EXPERIENCE.footnote}`).length - 1, 1)
})

test('About: one concise founder-experience section, all four figures with their attribution, no repetition in "at a glance", case studies linked', () => {
  const about = TRUST_CONTENT.about
  const sec = about.sections.find((s) => s.heading === "The founder's experience")
  assert.ok(sec, 'section exists')
  assert.equal(sec.body.length, 1)
  const t = sec.body[0]
  for (const v of [CONVRT_STATS.videos, CONVRT_STATS.clients, CONVRT_STATS.views, CONVRT_STATS.returningClients]) assert.ok(t.includes(v), v)
  assert.match(t, /founder's combined professional experience, including CONVRT Studio and other professional creative production work/)
  assert.match(t, /not statistics for projects delivered under the CONVRT Studio brand alone/)
  assert.ok(t.includes('[[Graspo|/case-studies/graspo]]') && t.includes('[[Elyon Dubai|/case-studies/elyon]]'))
  assert.ok(t.length < 700, 'concise')
  const glance = JSON.stringify(about.sections.find((s) => s.heading === 'CONVRT Studio at a glance'))
  assert.ok(!/1,200|500\+|40M|50%/.test(glance), 'not repeated in the at-a-glance block')
  const order = about.sections.map((s) => s.heading)
  assert.ok(order.indexOf("The founder's experience") === order.indexOf('A founder-led studio') + 1)
  if (TRUST_PAGES_PUBLISHED) {
    const h = unesc(page('/about')).replace(/<!-- -->/g, '')
    assert.ok(h.includes("The founder's experience") && h.includes('1,200+ videos produced, 500+ clients served, 40M+ views generated and 50%+ returning clients'))
  }
})

test('claims register: the confirmed scope is recorded for all four figures; the "hundreds of creatives" claim is left as published; nothing is unconfirmed', () => {
  const byId = (id) => PUBLIC_CLAIMS.find((c) => c.id === id)
  assert.ok(byId('founder-experience-scope') && /not exclusive/.test(byId('founder-experience-scope').claim))
  for (const id of ['stat-clients', 'stat-videos', 'stat-views', 'stat-returning']) {
    assert.ok(byId(id).source.includes("founder's combined professional experience"), id)
    assert.equal(byId(id).status, 'owner-confirmed', id)
    assert.ok(!/CONVRT overall|Trusted by/.test(JSON.stringify(byId(id))), id)
  }
  assert.match(byId('stat-returning').note, /not reinterpreted/)
  assert.equal(byId('hundreds-of-creatives').claim, "After producing hundreds of creatives, we've developed a strong understanding of what captures attention")
  assert.deepEqual(PUBLIC_CLAIMS.filter((c) => c.status === 'needs-confirmation'), [])
  assert.equal(byId('elyon-roas').claim, '5.28x ROAS, 9 purchases, $3,421.25 reported revenue (one video)', 'case-study results unchanged')
})

test('structured data: no statistics, ratings, reviews, founding date or employee data on any built page; Organization and founder stay minimal and match the visible About facts', () => {
  const banned = [/1,200\+/, /\b500\+/, /40M\+/, /50%\+/, /aggregateRating/, /"@type":"Review"/, /reviewRating/, /ratingValue/, /foundingDate/, /numberOfEmployees/, /five-star/i]
  for (const f of allHtml()) {
    for (const ld of jsonLdOf(fs.readFileSync(f, 'utf8'))) for (const re of banned) assert.ok(!re.test(ld), `${path.relative(dist, f)}: ${re}`)
  }
  const org = organizationNode()
  assert.ok(!('foundingDate' in org) && !('numberOfEmployees' in org) && !('aggregateRating' in org) && !('review' in org))
  assert.ok(!/1,200|500\+|40M|50%/.test(JSON.stringify(homeGraph(SITE_SEO['/']))))
  if (TRUST_PAGES_PUBLISHED) {
    assert.deepEqual(org.address, { '@type': 'PostalAddress', addressCountry: BRAND.country }, 'address stays country-only')
    assert.deepEqual(Object.keys(org.founder).sort(), ['@id', '@type', 'jobTitle', 'name', 'sameAs'])
  }
})

test('the unconfirmed review claim and the founder portfolio figures appear on no built page', () => {
  for (const f of allHtml()) {
    const h = fs.readFileSync(f, 'utf8')
    assert.ok(!/240\+|\+240|five-star|\+600|600\+ videos/i.test(h), path.relative(dist, f))
  }
})

test('LinkedIn: the company URL is unchanged until its identity with the vanity page is established (owner rule D5)', () => {
  assert.equal(COMPANY_LINKEDIN_URL, 'https://www.linkedin.com/company/123164137/')
})

test('hero posters: real alt text from the owner-written caption, no duplicate name on the muted video; the homepage has no empty or missing alt', () => {
  const stage = read('src/components/ugc/CreatorVideoStage.jsx')
  assert.match(stage, /src=\{posterUrl\(item\)\}\s+alt=\{item\.caption\}/)
  assert.ok(!/alt=""\s+width="540"/.test(stage))
  assert.match(stage, /<video[\s\S]*?aria-hidden="true"[\s\S]*?\/>/)
  const imgs = page('/').match(/<img\b[^>]*>/g) || []
  assert.ok(imgs.length > 20)
  assert.deepEqual(imgs.filter((i) => !/\balt=/.test(i)), [], 'no image without alt')
  assert.deepEqual(imgs.filter((i) => /\balt=""/.test(i)), [], 'no empty alt on the homepage')
  for (const c of ['CONVRT UGC ad example.', 'Creator-led UGC ad example 1.', 'Creator-led UGC ad example 2.']) assert.ok(page('/').includes(`alt="${c}"`), c)
})

test('favicon.ico and apple-touch-icon exist (real files from the existing mark) and every page links them beside the SVG icon', () => {
  const ico = fs.readFileSync(path.join(ROOT, 'public/favicon.ico'))
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0], 'ICO header')
  assert.ok(ico.readUInt16LE(4) >= 2, 'several sizes')
  const png = fs.readFileSync(path.join(ROOT, 'public/apple-touch-icon.png'))
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'PNG signature')
  assert.equal(png.readUInt32BE(16), 180); assert.equal(png.readUInt32BE(20), 180)
  const shell = read('index.html')
  assert.ok(shell.includes('<link rel="icon" href="/favicon.ico" sizes="48x48" />') && shell.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />') && shell.includes('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />'))
  for (const r of ['/', '/pricing', '/ugc-video-agency']) assert.ok(page(r).includes('rel="apple-touch-icon"') && page(r).includes('href="/favicon.ico"'), r)
})
