// Run with: node --test tests/spokesperson-page.test.mjs
// The /spokesperson-video-production service page: head, canonical, sitemap gate, prerendered HTML, claims, figures-from-data rule, the proof rules,
// structured data, the portfolio isolation from the UGC page, the shared configuration-driven components, internal links, and that the UGC page is unchanged.
// Builds the site once into a temp dir and starts a Vite SSR loader to render components with sample data.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PATHS, KNOWN_PATHS } from '../src/routes.js'
import { SITE_URL, OFFER_PATHS, CREATOR_SHOWCASE_PATH } from '../src/config.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { spokespersonGraph, jsonLdFor, ORG_ID, serviceId, BREADCRUMB_TRAILS } from '../src/seo/structuredData.js'
import { SPOKESPERSON_FAQ, spokespersonFaqText } from '../src/seo/spokespersonFaq.js'
import { UGC_FAQ } from '../src/seo/ugcFaq.js'
import { SPRINT, SPRINT_PLUS, USAGE_RIGHTS, FORMATS, TURNAROUND, REVISIONS, PRODUCTION_LANGUAGES, formatMoney } from '../src/seo/businessKnowledge.js'
import {
  PORTFOLIO, selectHero, selectGallery, selectSpokespersonHero, selectSpokespersonGallery, selectOurWork, selectShowcase, portfolioProblems,
} from '../src/content/portfolio.js'
import { SPOKESPERSON_PROOF, SPOKESPERSON_HERO } from '../src/content/spokespersonPage.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const PATH = PATHS.spokespersonVideoProduction
const URL_ = `${SITE_URL}${PATH}`

const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;|&#x2019;/g, '’')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const section = (html, from, to) => html.split(from)[1].split(to)[0]
const section_ = (html, id) => (html.includes(id) ? section(html, id, '</section>') : '')

let tmp, dist, vite, Hero, Gallery, Proof, Stage
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-spokes-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
  vite = await createServer({ root: ROOT, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  Hero = await vite.ssrLoadModule('/src/components/ugc/UgcHero.jsx')
  Gallery = await vite.ssrLoadModule('/src/components/ugc/UgcGallery.jsx')
  Proof = await vite.ssrLoadModule('/src/components/spokesperson/SpokespersonProof.jsx')
  Stage = await vite.ssrLoadModule('/src/components/ugc/CreatorVideoStage.jsx')
})
after(async () => {
  if (vite) await vite.close()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

const APPROVED = { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'test', approvedOn: '2026-01-01' }
const sample = (over = {}) => ({
  id: 'sp-sample-a', title: 'Sample', caption: 'A spokesperson sample caption.', type: 'spokesperson', industry: 'saas', languages: ['en'],
  source: { mp4: '/videos/sample.mp4' }, poster: '/portfolio/sample.webp', creatorId: 'c-test-1', approval: APPROVED, ...over,
})

// ── route, head, canonical, sitemap ──────────────────────────────────────────────────────
test('route: /spokesperson-video-production is a public path with its own static HTML file', () => {
  assert.equal(PATH, '/spokesperson-video-production')
  assert.ok(KNOWN_PATHS.includes(PATH))
  assert.ok(fs.existsSync(path.join(dist, 'spokesperson-video-production', 'index.html')))
  assert.match(read('src/App.jsx'), /\[PATHS\.spokespersonVideoProduction\]: SpokespersonVideoPage/)
})

test('head: approved title and description, unique, self-canonical (never the UGC page), robots follows the video gate, sitemap follows the same gate', () => {
  const e = SITE_SEO[PATH]
  assert.equal(e.title, 'Spokesperson Video Production | Professional Video Presenters | CONVRT')
  assert.equal(e.description, 'Professional spokesperson videos featuring real human presenters. Multilingual video production for websites, product demos, apps and paid advertising.')
  assert.ok(e.description.length >= 120 && e.description.length <= 160, `description length ${e.description.length}`)
  assert.equal(e.canonicalPath, undefined, 'a canonical of its own, not a duplicate of another page')
  for (const [p, v] of Object.entries(SITE_SEO)) if (p !== PATH) { assert.notEqual(v.title, e.title); assert.notEqual(v.description, e.description) }
  assert.equal(pageHead(PATH).url, URL_)
  // indexable once the page has approved spokesperson videos (the same rule as /creator-showcase); the gate flips by itself when the first one is added
  assert.equal(e.indexable, selectSpokespersonHero().length + selectSpokespersonGallery().length > 0)
  assert.equal(sitemapRoutes().includes(PATH), e.indexable)
  const html = page(PATH)
  const head = headOf(html)
  assert.ok(head.includes('<title>Spokesperson Video Production | Professional Video Presenters | CONVRT</title>'))
  assert.ok(head.includes(`<link rel="canonical" href="${URL_}" />`))
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.ok(!head.includes('href="https://www.convrt.studio/ugc-video-agency"'), 'never canonicalised to the UGC page')
  assert.equal(/name="robots"/.test(head), !e.indexable)
  assert.equal(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${URL_}</loc>`), e.indexable)
})

// ── prerendered HTML ─────────────────────────────────────────────────────────────────────
test('static HTML: breadcrumb, ONE H1 reading "Human-led spokesperson videos. Built to communicate. Made to convrt.", the approved description and CTAs', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.match(html, /<nav aria-label="Breadcrumb"[\s\S]*?Home[\s\S]*?Spokesperson Video Production/)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  const h1 = textOf(`<div id="root">${html.match(/<h1[\s\S]*?<\/h1>/)[0]}`)
  assert.equal(h1, 'Human-led spokesperson videos. Built to communicate. Made to convrt.')
  assert.ok(t.includes('Professional, multilingual spokesperson videos featuring real people on camera. From SaaS demos and product presentations to website videos and paid ads, we handle scripting, talent selection, filming and editing.'))
  assert.match(html, new RegExp(`<a [^>]*href="${OFFER_PATHS.roadmap}"[^>]*>\\s*Get 5 Free Ad Concepts`), 'primary CTA → the Roadmap')
  assert.match(html, new RegExp(`<a [^>]*href="${CREATOR_SHOWCASE_PATH}"[^>]*>\\s*Explore Videos`), 'secondary CTA → /creator-showcase')
  assert.ok(/1 <span class="text-lime">FREE<\/span> Video/.test(html) && /10 <span class="text-\[#F472B6\]">FREE<\/span> Ad Hooks/.test(html), 'the two free-offer cards, reused from the homepage hero')
})

test('headline reel: convrt, explain, connect, persuade; only "convrt." in the server HTML; the sizer reserves the longest word; every word completes "Made to ___."', () => {
  assert.deepEqual(SPOKESPERSON_HERO.words, ['convrt', 'explain', 'connect', 'persuade'])
  assert.deepEqual(SPOKESPERSON_HERO.lead, ['Made', 'to'])
  const longest = SPOKESPERSON_HERO.words.reduce((a, b) => (b.length > a.length ? b : a))
  assert.equal(SPOKESPERSON_HERO.sizer, `${longest}.`)
  const h1 = rootOf(page(PATH)).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]
  assert.ok(h1.includes(`data-sizer="${SPOKESPERSON_HERO.sizer}"`))
  assert.ok(!/explain|>connect|persuade/.test(h1.replace(`data-sizer="${SPOKESPERSON_HERO.sizer}"`, '')), 'the other words appear only while a roll is in progress')
  assert.equal((h1.match(/ugc-reel-track/g) || []).length, 1)
})

test('empty hero: with no approved spokesperson videos the three phones stay empty (no stand-in portraits, no video, no UGC imagery)', () => {
  const hero = renderToStaticMarkup(createElement(Hero.default, { items: [], config: SPOKESPERSON_HERO }))
  assert.ok(/aspect-\[9\/19\.5\]/.test(hero), 'the three-phone stage is there')
  assert.ok(!/<video|<source/.test(hero) && !/<img (?![^>]*convrt-logo\.svg)/.test(hero), 'no video and no image other than the CONVRT logo watermark in the empty phones')
  assert.ok(!/Previous video|Play video/.test(hero))
})

test('live page: the stage and gallery show exactly the approved spokesperson videos and nothing from the UGC page or the homepage clients', () => {
  const html = rootOf(page(PATH))
  const hero = html.split('<section aria-labelledby="spokesperson-h1"')[1].split('id="how-it-works"')[0]
  const heroItems = selectSpokespersonHero()
  const galleryItems = selectSpokespersonGallery()
  if (heroItems.length) {
    assert.ok(hero.includes('aria-label="Spokesperson videos"') && hero.includes('aria-roledescription="carousel"'))
    assert.equal((hero.match(/<video /g) || []).length, Math.min(heroItems.length, 3), 'one video element per phone (nothing attached until idle)')
    assert.ok(heroItems.slice(0, 3).every((v) => hero.includes(v.poster)), 'each phone has its own hand-picked poster')
  } else {
    assert.ok(!/<video|<source/.test(hero))
  }
  assert.ok(!/<video[^>]*\ssrc=/.test(html) && !/<source|autoplay/i.test(html) && !/\.m3u8/.test(html), 'no stream is requested by the static HTML')
  assert.equal((section_(html, 'id="spokesperson-videos"').match(/Play video:/g) || []).length, Math.min(galleryItems.length, 10), 'one card per approved gallery video (max 10)')
  assert.ok(galleryItems.every((v) => html.includes(v.poster)))
  for (const v of PORTFOLIO.filter((x) => x.type === 'ugc' || x.showcase)) assert.ok(!html.includes(v.source.cloudflareId ?? 'no-id-xyz') && !(v.poster && html.includes(v.poster)), `${v.id} is not on the Spokesperson page`)
  assert.ok(!/\/portfolio\/ugc-/.test(html), 'no UGC poster')
  assert.ok(heroItems.concat(galleryItems).every((v) => v.approval.portfolioUse === true && v.approval.creatorConsent === true && v.approval.status === 'approved'))
  assert.equal(new Set(heroItems.concat(galleryItems).map((v) => v.source.cloudflareId)).size, heroItems.length + galleryItems.length, 'no video is used twice')
  assert.ok(heroItems.length <= 3 && galleryItems.length <= 10)
  assert.ok(!/coming soon|being updated/i.test(textOf(page(PATH))), 'no placeholder message')
})

// ── portfolio isolation ──────────────────────────────────────────────────────────────────
test('portfolio: the spokesperson selectors take ONLY approved type "spokesperson" videos; no UGC video can appear, and no spokesperson video can appear on the UGC page', () => {
  const ugcHero = { ...sample({ id: 'u-1', type: 'ugc', placement: 'hero' }) }
  const items = [
    ugcHero,
    sample({ id: 's-hero', placement: 'hero' }),
    sample({ id: 's-gal' }),
    sample({ id: 's-unapproved', approval: { ...APPROVED, status: 'pending' } }),
    sample({ id: 's-no-portfolio', approval: { ...APPROVED, portfolioUse: false } }),
    sample({ id: 's-no-consent', approval: { ...APPROVED, creatorConsent: false } }),
    sample({ id: 's-speaking-ad', type: 'ad' }),
    sample({ id: 's-default-type', type: undefined }),
  ]
  assert.deepEqual(selectSpokespersonHero(items).map((i) => i.id), ['s-hero'])
  assert.deepEqual(selectSpokespersonGallery(items).map((i) => i.id), ['s-gal'])
  assert.ok(!selectHero(items).concat(selectGallery(items)).some((i) => i.id.startsWith('s-hero') || i.id === 's-gal'), 'the UGC selectors never return a spokesperson video')
  // the shipped data: whatever is typed spokesperson is valid, never shared with the UGC page, and never a homepage client video
  const shipped = selectSpokespersonHero().concat(selectSpokespersonGallery())
  assert.ok(shipped.every((v) => v.type === 'spokesperson' && portfolioProblems(v).length === 0))
  assert.ok(shipped.every((v) => !selectHero().concat(selectGallery()).includes(v)))
  assert.ok(shipped.every((v) => selectOurWork().includes(v)), 'every approved spokesperson video is also in the broader Creator Showcase (/creator-showcase)')
  assert.deepEqual(selectShowcase('elyon').map((v) => v.id), PORTFOLIO.filter((v) => v.showcase === 'elyon').map((v) => v.id), 'homepage client panels are unchanged')
})

test('portfolio present: with approved spokesperson videos the hero becomes the interactive stage (labelled for this page) and the gallery shows "Spokesperson" cards with the /creator-showcase button', () => {
  const items = [sample(), sample({ id: 'sp-b', caption: 'Second.' }), sample({ id: 'sp-c', caption: 'Third.', languages: ['es'] })]
  const hero = renderToStaticMarkup(createElement(Hero.default, { items, config: SPOKESPERSON_HERO }))
  assert.ok(hero.includes('aria-roledescription="carousel"') && hero.includes('aria-label="Spokesperson videos"'))
  assert.ok(!/Creator UGC videos/.test(hero))
  assert.equal((hero.match(/<video /g) || []).length, 3)
  assert.ok(Stage.default, 'the same CreatorVideoStage as the UGC page')
  assert.equal(SPOKESPERSON_HERO.previewPortraits, false, 'the empty phones stay empty on preview hosts too')
  const dflt = renderToStaticMarkup(createElement(Gallery.default, { items }))
  assert.ok(dflt.includes('id="ugc-videos"') && /UGC ·/.test(dflt.replace(/<[^>]+>/g, '')), 'with no config the gallery is still the UGC one (default)')
})

test('gallery: spokesperson heading, copy, badge, button and four-up horizontal scroller; absent without videos; preview stand-ins are neutral frames, never portraits', async () => {
  const mod = await vite.ssrLoadModule('/src/content/spokespersonPage.js')
  const items = [sample(), sample({ id: 'sp-b', caption: 'Second.' })]
  const g = renderToStaticMarkup(createElement(Gallery.default, { items, config: mod.SPOKESPERSON_GALLERY }))
  const t = decode(g.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
  assert.ok(g.includes('id="spokesperson-videos"'))
  assert.ok(t.includes('See spokespersons in action.'))
  assert.ok(t.includes('Explore different presentation styles, languages and approaches for explaining products, promoting offers and communicating with customers.'))
  assert.ok(/Spokesperson ·/.test(t) && !/UGC/.test(t), 'cards are labelled Spokesperson, never UGC')
  assert.match(g, new RegExp(`href="${CREATOR_SHOWCASE_PATH}"[^>]*>[^<]*Explore Spokesperson Videos`))
  assert.ok(/aria-label="Spokesperson video examples\. Scroll sideways to see more\."/.test(g))
  assert.ok(/lg:w-\[calc\(\(100%-3rem\)\/4\)\]/.test(g), 'four cards across on a laptop')
  assert.equal(renderToStaticMarkup(createElement(Gallery.default, { items: [], config: mod.SPOKESPERSON_GALLERY })), '', 'absent without videos (the stand-ins are preview-only and appear after hydration)')
  assert.equal(mod.SPOKESPERSON_GALLERY.samplePortraits, null, 'preview stand-ins carry no creator imagery')
  assert.ok(!/id="spokesperson-videos"/.test(rootOf(page(PATH))) || selectSpokespersonGallery().length > 0)
})

// ── the sections ─────────────────────────────────────────────────────────────────────────
test('how it works: four spokesperson stages, readable without interaction, spokesperson scenes, and none of the UGC sprint structure or turnaround', () => {
  const html = rootOf(page(PATH))
  const proc = section(html, 'id="how-it-works"', 'id="spokesperson-formats"')
  const t = textOf(`<div id="root">${proc}`)
  for (const s of ['Brief & Message', 'Presenter & Script', 'Filming & Editing', 'Delivery & Distribution']) assert.ok(t.includes(s), s)
  assert.ok(!/visibility:\s*hidden/.test(proc), 'no stage text is hidden')
  assert.ok(t.includes('Angle 1') && t.includes('Possible video messages'))
  assert.ok(!/business days|Production turnaround|15 finished|concepts ×|5 concepts|versions each|Hook A/i.test(t), 'no UGC sprint structure or turnaround promise in the process')
  const src = read('src/components/spokesperson/SpokespersonScenes.jsx')
  assert.ok(/<Avatar variant/.test(src) && !/<ellipse|<circle cx="50"/.test(src), 'realistic portraits, no cartoon avatars')
  assert.ok(!/ROAS|conversion rate|outperform/i.test(src))
  assert.match(read('src/components/ugc/UgcProcess.jsx'), /export function ProcessSection/)
  assert.match(read('src/SpokespersonVideoPage.jsx'), /ProcessSection/)
})

test('"One message. Different ways to deliver it.": three states, same interaction system, no package or deliverable promises', () => {
  const html = rootOf(page(PATH))
  const sec = section(html, 'id="spokesperson-formats"', '</section>')
  const t = textOf(`<div id="root">${sec}`)
  assert.ok(t.includes('One message. Different ways to deliver it.'))
  for (const s of ['Product Explanation', 'Demonstration', 'Promotional Creative']) assert.ok(t.includes(s), s)
  assert.ok(t.includes('A presenter explains your product or service clearly, straight to camera.'))
  assert.ok(t.includes('depends on your package or custom brief'))
  assert.ok(!/every (spokesperson )?package|all three|includes all|\bcomes with\b/i.test(t), 'never claims every package includes all three')
  assert.ok(!/\$\s?\d|\b\d+\s+(concepts|versions|videos)\b/i.test(t), 'no prices or counts')
  assert.equal((sec.match(/aria-current="step"/g) || []).length, 1)
  assert.ok(/aria-live="polite"/.test(sec))
  const src = read('src/components/spokesperson/DeliveryStyles.jsx')
  assert.ok(/useAutoplayAllowed/.test(src) && /Pause/.test(src) && /IntersectionObserver/.test(src), 'auto-advance respects reduced motion and data saver, can be paused, and runs only on screen')
  assert.ok(/aria-hidden="true"/.test(src))
})

test('proof: no UGC results or testimonials are reused; the compact "what to expect" strip uses only published business terms; populated proof is supported', () => {
  const t = textOf(page(PATH))
  assert.deepEqual(SPOKESPERSON_PROOF, { results: [], testimonials: [] }, 'no spokesperson-specific result or testimonial has been verified yet')
  assert.ok(!/5\.28|Elyon|Adscale|Talk360|ROAS|3421/.test(t), 'none of the UGC page\'s proof is on this page')
  assert.ok(t.includes('What to expect') && t.includes('Real human presenters'))
  assert.ok(t.includes(`Standard packages include ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights.`), 'usage figure comes from the data')
  assert.ok(t.includes(PRODUCTION_LANGUAGES.core.at(-1)))
  assert.ok(!/stars?\b|rating|\d+\+? (clients|brands|customers)/i.test(t))
  const empty = renderToStaticMarkup(createElement(Proof.default, {}))
  assert.ok(empty.includes('What to expect') && !empty.includes('Results &amp; client feedback'))
  const filled = renderToStaticMarkup(createElement(Proof.default, {
    proof: {
      results: [{ id: 'r', brand: 'Brand X', category: 'Cat', metric: '2x', metricLabel: 'a verified figure', context: 'Context sentence.', disclaimer: 'Client-reported.' }],
      testimonials: [{ id: 't', brand: 'Brand Y', category: 'Cat', quote: 'A verbatim quote.' }],
    },
  }))
  assert.ok(filled.includes('Results &amp; client feedback') && filled.includes('2x') && filled.includes('A verbatim quote.') && filled.includes('Client-reported.'))
  assert.ok(!filled.includes('What to expect'))
})

test('FAQ: twelve spokesperson-specific questions, all (and their links) in the static HTML; none copied from the UGC FAQ', async () => {
  assert.equal(SPOKESPERSON_FAQ.length, 12)
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  for (const f of SPOKESPERSON_FAQ) {
    assert.ok(t.includes(f.q), f.q)
    for (const para of f.a) assert.ok(t.includes(para), `answer in the HTML: ${f.q}`)
    for (const l of f.links ?? []) assert.ok(html.includes(`href="${l.href}"`), l.href)
  }
  const ugcQ = new Set(UGC_FAQ.map((f) => f.q))
  assert.ok(SPOKESPERSON_FAQ.every((f) => !ugcQ.has(f.q)), 'no question is shared with the UGC FAQ')
  for (const topic of [/What is a spokesperson video/, /types of spokesperson videos/, /different from UGC/, /choose the person presenting/, /scripts and creative direction/, /multiple languages/, /demonstrate software or apps/, /real people or AI-generated/, /How much does professional spokesperson video production cost/, /How long does spokesperson video production take/, /revisions and usage rights/, /websites, social media and paid advertising/]) assert.ok(SPOKESPERSON_FAQ.some((f) => topic.test(f.q)), String(topic))
  assert.ok(SPOKESPERSON_FAQ.find((f) => f.id === 'spokesperson-vs-ugc').links.some((l) => l.href === '/ugc-video-agency'), 'the UGC difference answer links to the UGC page')
  assert.ok(html.includes('href="/pricing#packages"'))
})

test('FAQ facts come from the business data and make no invented commitments; AI answer is scoped to this service', () => {
  const t = SPOKESPERSON_FAQ.map(spokespersonFaqText).join(' ')
  assert.ok(t.includes(formatMoney(SPRINT.monthly)) && t.includes(formatMoney(SPRINT.oneOff)) && t.includes(formatMoney(SPRINT_PLUS.monthly)))
  assert.ok(t.includes(`${SPRINT.turnaroundBusinessDays} business days`) && t.includes(`${SPRINT_PLUS.turnaroundBusinessDays} business days`) && t.includes(TURNAROUND.startsAt))
  assert.ok(t.includes(`${REVISIONS.roundsPerConcept} rounds of revisions`) && t.includes(`${USAGE_RIGHTS.includedMonths} months`))
  assert.ok(t.includes(`up to ${FORMATS.standardMaxSeconds} seconds`) && t.includes(FORMATS.separateDeliverable))
  assert.ok(/do not publish a separate spokesperson price list/.test(t), 'no spokesperson-specific price is invented')
  assert.ok(/agreed individually|scoped as custom/i.test(t), 'custom projects are scoped individually')
  assert.ok(!/guarantee/i.test(t), 'no guarantees')
  const ai = SPOKESPERSON_FAQ.find((f) => f.id === 'real-people-or-ai').a.join(' ')
  assert.ok(/real human presenters/.test(ai) && !/never use AI|no AI\b|without AI|AI-free|we do not use AI/i.test(t), 'scoped to the spokesperson videos, no business-wide "no AI" claim')
  for (const f of ['src/seo/spokespersonFaq.js', 'src/content/spokespersonPage.js', 'src/SpokespersonVideoPage.jsx', 'src/components/spokesperson/SpokespersonScenes.jsx', 'src/components/spokesperson/DeliveryStyles.jsx', 'src/components/spokesperson/SpokespersonProof.jsx']) {
    const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.ok(!/\$\s?\d/.test(code) && !/\b(2,?500|3,?000|3,?500|5,?000|6,?000)\b/.test(code), `${f}: a price is typed in the source`)
  }
})

test('positioning and SEO copy: spokesperson terms appear naturally, service not limited to SaaS or tech, no rankings or volume claims', () => {
  const t = textOf(page(PATH))
  for (const kw of [/spokesperson video production/i, /professional spokesperson videos?|spokesperson videos?/i, /website/i, /SaaS/, /product demonstration/i, /talking-head/i, /multilingual/i, /human presenters/i]) assert.ok(kw.test(t), String(kw))
  assert.ok(!/\b(the best|#1|number one|top-rated|leading|award|ranked)\b/i.test(t), 'no superlatives or rankings')
  assert.ok(!/(only|just|exclusively) (for|designed for|offered to|open to) (SaaS|software|tech)/i.test(t))
  assert.ok(!/monthly searches|search volume|searches per month/i.test(t + read('src/content/spokespersonPage.js').replace(/\/\*[\s\S]*?\*\//g, '')), 'no keyword volume claims')
  assert.ok(!/AI-assisted|AI-generated avatars? (are|is) used/i.test(t))
})

// ── structured data ──────────────────────────────────────────────────────────────────────
test('JSON-LD: Organization, WebPage, BreadcrumbList, a Service with NO price, and an FAQPage generated from the visible FAQ; nothing the page does not show', () => {
  const g = spokespersonGraph(SITE_SEO[PATH])['@graph']
  assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage'])
  assert.equal(jsonLdFor(PATH, SITE_SEO[PATH])['@graph'].length, g.length)
  const [, web, crumb, svc, faq] = g
  assert.equal(web.url, URL_)
  assert.equal(web.about['@id'], svc['@id'])
  assert.deepEqual(crumb.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'Spokesperson Video Production', URL_]])
  assert.equal(BREADCRUMB_TRAILS[PATH].length, 2)
  assert.equal(svc.provider['@id'], ORG_ID)
  assert.equal(svc.offers, undefined, 'no spokesperson-specific price is published, so no Offer')
  assert.equal(svc['@id'], serviceId('spokesperson'), 'the stable service id the homepage and /pricing also use (Batch 2)')
  assert.ok(!svc.isRelatedTo.some((r) => r['@id'] === svc['@id']), 'never related to itself')
  assert.equal(svc.serviceType, 'Spokesperson video production')
  assert.equal(faq.mainEntity.length, SPOKESPERSON_FAQ.length)
  faq.mainEntity.forEach((q, i) => { assert.equal(q.name, SPOKESPERSON_FAQ[i].q); assert.equal(q.acceptedAnswer.text, spokespersonFaqText(SPOKESPERSON_FAQ[i])) })
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed|VideoObject|"Product"|"Person"|"price"/.test(JSON.stringify(g.filter((n) => n['@type'] !== 'Organization'))))
  const ugcLd = JSON.stringify(jsonLdFor(PATHS.ugcVideoAgency, SITE_SEO[PATHS.ugcVideoAgency]))
  assert.ok(!ugcLd.includes('spokesperson-video-production'), 'the UGC page JSON-LD is unchanged')
})

test('JSON-LD is in the static HTML as one valid block equal to the manifest graph', () => {
  const html = page(PATH)
  const raw = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1].replace(/\\u003c/g, '<'))
  assert.equal(raw.length, 1)
  assert.deepEqual(JSON.parse(raw[0]), JSON.parse(JSON.stringify(pageHead(PATH).jsonLd)))
  assert.equal((raw[0].match(/"@type":"FAQPage"/g) || []).length, 1)
})

// ── internal links ───────────────────────────────────────────────────────────────────────
test('internal links: homepage Services and FAQ, Pricing, and the footer link to the page; the FAQ link is not in the homepage JSON-LD; the page links out to Pricing, UGC and the offers', () => {
  const link = (h) => rootOf(h).includes(`href="${PATH}"`)
  assert.ok(link(page('/')), 'homepage')
  assert.match(rootOf(page('/')), /<a href="\/spokesperson-video-production" class="svc-card"/, 'homepage Services card')
  assert.match(rootOf(page('/')), /Learn about our spokesperson video production/)
  assert.match(rootOf(page('/')), /Learn about our UGC video production/, 'the existing UGC link is kept')
  assert.ok(link(page('/pricing')) && /See spokesperson video production/.test(rootOf(page('/pricing'))), 'pricing')
  for (const p of ['/', '/pricing', '/creative-growth-roadmap', PATH]) assert.match(rootOf(page(p)), /<a [^>]*href="\/spokesperson-video-production"[^>]*>Spokesperson Videos<\/a>/, `footer link on ${p}`)
  assert.ok(!JSON.stringify(jsonLdFor('/')['@graph'].find((n) => n['@type'] === 'FAQPage')).includes('spokesperson-video-production'), 'the FAQ link is not part of the homepage FAQ answer text')
  assert.ok(JSON.stringify(jsonLdFor('/')).includes('spokesperson-video-production#service'))
  const html = rootOf(page(PATH))
  for (const href of ['/pricing#packages', '/pricing#package-info', '/ugc-video-agency', OFFER_PATHS.roadmap, CREATOR_SHOWCASE_PATH]) assert.ok(html.includes(`href="${href}"`), href)
})

test('final CTA: the same system as the UGC page, with the spokesperson headline; pricing and founder e-mail are real buttons', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  const cta = html.split('id="get-started"')[1]
  assert.ok(t.includes('Ready to put the right face behind your message?'))
  assert.match(cta, new RegExp(`href="${OFFER_PATHS.roadmap}"[^>]*>Get 5 Free Ad Concepts`))
  assert.match(cta, /href="\/pricing#packages"[^>]*>See Pricing/)
  assert.match(cta, /href="mailto:[^"]+\?subject=Spokesperson%20video%20production"[^>]*>[\s\S]*Email the Founder/)
  assert.ok(t.includes('Every industry welcome'), 'the Roadmap stays open to every industry')
})

// ── architecture and the UGC page ────────────────────────────────────────────────────────
test('architecture: the page is assembled from the shared configuration-driven components; nothing large is duplicated', () => {
  const src = read('src/SpokespersonVideoPage.jsx')
  for (const c of ['UgcHero', 'ProcessSection', 'UgcGallery', 'UgcFAQ', 'UgcFinalCTA']) assert.ok(new RegExp(`import[^\\n]*${c}`).test(src), c)
  assert.ok(!/function Headline|function ReelWord|function Item\(/.test(src), 'no second headline, reel or accordion')
  assert.ok(src.split('\n').length < 110, 'a thin page file')
  assert.match(src, /selectSpokespersonHero/)
  assert.ok(!/selectHero\(|selectGallery\(|selectDisplayable|selectOurWork/.test(src), 'it never reads the UGC lists')
})

test('UGC page unchanged: same H1, reel word, FAQ length, Elyon proof, gallery and hero defaults', () => {
  const html = rootOf(page(PATHS.ugcVideoAgency))
  const t = textOf(page(PATHS.ugcVideoAgency))
  assert.equal(textOf(`<div id="root">${html.match(/<h1[\s\S]*?<\/h1>/)[0]}`), 'Human-led UGC ads. Built for paid social. to convrt.')
  assert.ok(html.includes('class="ugc-reel text-lime" data-sizer="resonate."'))
  assert.ok(t.includes('5.28x') && t.includes('Elyon Dubai') && t.includes('Structured creative testing') && t.includes('How we create and test UGC ads.'))
  assert.ok(!/spokesperson-h1|One message\. Different ways/.test(html + t))
  assert.equal((html.match(/spokesperson-video-production/g) || []).length, 2, 'the footer link and (Batch 2) one FAQ link for presenter-led formats')
  assert.ok(html.includes('id="ugc-faq"') && !html.includes('id="spokesperson-faq"'))
  assert.equal(UGC_FAQ.length, 16)
})

test('accessibility: one H1, headings never skip a level, buttons are real buttons, secondary text meets contrast, motion respects preferences', () => {
  const html = rootOf(page(PATH))
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
  assert.equal(levels.filter((l) => l === 1).length, 1)
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, `heading level jumps ${levels[i - 1]} → ${levels[i]}`)
  for (const f of ['SpokespersonScenes', 'DeliveryStyles', 'SpokespersonProof']) {
    const code = read(`src/components/spokesperson/${f}.jsx`)
    for (const line of code.split('\n').filter((l) => /text-ink-subtle/.test(l))) assert.ok(/aria-hidden="true"/.test(line), `${f}: secondary copy must use text-ink-muted`)
  }
  assert.ok(/prefers-reduced-motion: reduce/.test(read('src/components/ugc/creatorVideo.jsx')) && /saveData/.test(read('src/components/ugc/creatorVideo.jsx')))
  assert.ok(/useAutoplayAllowed/.test(read('src/components/ugc/UgcProcess.jsx')) && /Pause animation/.test(read('src/components/ugc/UgcProcess.jsx')))
})

test('spokesperson page order is independent of the Showcase order: hero 1, 2, 3 (first = centre) and gallery 1 to 4', () => {
  assert.deepEqual(selectSpokespersonHero().map((v) => v.id), ['spokesperson-hero-1', 'spokesperson-hero-2', 'spokesperson-hero-3'])
  assert.deepEqual(selectSpokespersonGallery().map((v) => v.id), ['spokesperson-gal-1', 'spokesperson-gal-2', 'en-mohamed-spokesperson-1', 'spokesperson-gal-3', 'spokesperson-gal-4', 'en-mohamed-spokesperson-2'])
})
