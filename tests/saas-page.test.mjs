// Run with: node --test tests/saas-page.test.mjs
// The /saas-video-production service page: head, canonical, sitemap gate, prerendered HTML, claims, figures-from-data rule, the proof rules, structured data, the portfolio
// placement rules (type + alsoOn, never a fallback), the shared configuration-driven components, internal links, and that the UGC, Spokesperson and Organic pages are unchanged.
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
import { CREATOR_EXAMPLES_NOTE } from '../src/content/attribution.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { saasGraph, jsonLdFor, ORG_ID, serviceId, BREADCRUMB_TRAILS } from '../src/seo/structuredData.js'
import { SAAS_FAQ, saasFaqText } from '../src/seo/saasFaq.js'
import { SPOKESPERSON_FAQ } from '../src/seo/spokespersonFaq.js'
import { UGC_FAQ } from '../src/seo/ugcFaq.js'
import { USAGE_RIGHTS, REVISIONS, PRODUCTION_LANGUAGES, PRODUCT_REQUIREMENTS, CUSTOM_PACKAGES } from '../src/seo/businessKnowledge.js'
import {
  PORTFOLIO, selectHero, selectGallery, selectSpokespersonHero, selectSpokespersonGallery, selectOrganicHero, selectOrganicGallery, selectSaasHero, selectSaasGallery,
  selectOurWork, selectShowcase, portfolioProblems, servesPage, placementOn, SAAS_FORMATS, typeLabel,
} from '../src/content/portfolio.js'
import { SAAS_HERO, SAAS_PROOF, SAAS_GALLERY, SAAS_STAGES } from '../src/content/saasPage.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const PATH = PATHS.saasVideoProduction
const URL_ = `${SITE_URL}${PATH}`

const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;|&#x2019;/g, '’')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const section = (html, from, to) => html.split(from)[1].split(to)[0]

let tmp, dist, vite, Hero, Gallery, Proof
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-saas-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
  vite = await createServer({ root: ROOT, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  Hero = await vite.ssrLoadModule('/src/components/ugc/UgcHero.jsx')
  Gallery = await vite.ssrLoadModule('/src/components/ugc/UgcGallery.jsx')
  Proof = await vite.ssrLoadModule('/src/components/spokesperson/SpokespersonProof.jsx')
})
after(async () => {
  if (vite) await vite.close()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

const APPROVED = { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'test', approvedOn: '2026-01-01' }
const sample = (over = {}) => ({
  id: 'sa-sample-a', title: 'Sample', caption: 'A SaaS sample caption.', type: 'saas', industry: 'saas', languages: ['en'],
  source: { mp4: '/videos/sample.mp4' }, poster: '/portfolio/sample.webp', creatorId: 'c-test-1', approval: APPROVED, ...over,
})

// ── route, head, canonical, sitemap ──────────────────────────────────────────────────────
test('route: /saas-video-production is a public path (the approved keyword-to-page map) with its own static HTML file', () => {
  assert.equal(PATH, '/saas-video-production')
  assert.ok(KNOWN_PATHS.includes(PATH))
  assert.ok(fs.existsSync(path.join(dist, 'saas-video-production', 'index.html')))
  assert.match(read('src/App.jsx'), /\[PATHS\.saasVideoProduction\]: SaasVideoPage/)
})

test('head: approved title and description, unique, self-canonical (never the UGC or Spokesperson page), robots and sitemap follow the video gate', () => {
  const e = SITE_SEO[PATH]
  assert.equal(e.title, 'SaaS Video Production Agency | Explainers, Demos & Ads | CONVRT')
  assert.equal(e.description, 'SaaS video production for software and app brands. Human-led explainers, product demos, animated videos and performance-driven ads, from concept to delivery.')
  assert.ok(e.description.length >= 120 && e.description.length <= 160, `description length ${e.description.length}`)
  assert.equal(e.canonicalPath, undefined, 'a canonical of its own, not a duplicate of another page')
  for (const [p, v] of Object.entries(SITE_SEO)) if (p !== PATH) { assert.notEqual(v.title, e.title); assert.notEqual(v.description, e.description) }
  assert.equal(pageHead(PATH).url, URL_)
  // indexable once the page has approved SaaS videos (the same rule as the Spokesperson page and /our-work); the gate flips by itself when the first one is added
  assert.equal(e.indexable, selectSaasHero().length + selectSaasGallery().length > 0)
  assert.equal(sitemapRoutes().includes(PATH), e.indexable)
  const html = page(PATH)
  const head = headOf(html)
  assert.ok(head.includes('<title>SaaS Video Production Agency | Explainers, Demos &amp; Ads | CONVRT</title>'))
  assert.ok(head.includes(`<link rel="canonical" href="${URL_}" />`))
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.ok(!head.includes('href="https://www.convrt.studio/ugc-video-agency"') && !head.includes('href="https://www.convrt.studio/spokesperson-video-production"'), 'never canonicalised to another service page')
  assert.equal(/name="robots"/.test(head), !e.indexable)
  assert.equal(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${URL_}</loc>`), e.indexable)
})

// ── prerendered HTML ─────────────────────────────────────────────────────────────────────
test('static HTML: breadcrumb, ONE H1 reading "SaaS videos. Built to explain. Made to convrt.", the approved description and CTAs', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.match(html, /<nav aria-label="Breadcrumb"[\s\S]*?Home[\s\S]*?SaaS Video Production/)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  const h1 = textOf(`<div id="root">${html.match(/<h1[\s\S]*?<\/h1>/)[0]}`)
  assert.equal(h1, 'SaaS videos. Built to explain. Made to convrt.')
  assert.ok(t.includes('From product demos and animated explainers to human-led presentations and paid ads, we turn complex software into clear, engaging videos that communicate your product’s value.'))
  assert.match(html, new RegExp(`<a [^>]*href="${OFFER_PATHS.roadmap}"[^>]*>\\s*Get 5 Free Ad Concepts`), 'primary CTA → the Roadmap')
  assert.match(html, new RegExp(`<a [^>]*href="${CREATOR_SHOWCASE_PATH}"[^>]*>\\s*Explore Videos`), 'secondary CTA → /our-work')
  assert.ok(/1 <span class="text-lime">FREE<\/span> Video/.test(html) && /10 <span class="text-\[#F472B6\]">FREE<\/span> Ad Hooks/.test(html), 'the two free-offer cards, reused from the homepage hero')
})

test('headline reel: convrt, engage, connect; only "convrt." in the server HTML; the sizer reserves the longest word; every word completes "Made to ___."', () => {
  assert.deepEqual(SAAS_HERO.words, ['convrt', 'engage', 'connect'])
  assert.deepEqual(SAAS_HERO.lead, ['Made', 'to'])
  assert.deepEqual(SAAS_HERO.lines, [['SaaS', 'videos.'], ['Built', 'to', 'explain.']], '"explain" is fixed on line two, so it is not repeated in the reel')
  const longest = SAAS_HERO.words.reduce((a, b) => (b.length > a.length ? b : a))
  assert.equal(SAAS_HERO.sizer, `${longest}.`)
  const h1 = rootOf(page(PATH)).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]
  assert.ok(h1.includes(`data-sizer="${SAAS_HERO.sizer}"`))
  assert.ok(!/>engage|>connect/.test(h1), 'the other words appear only while a roll is in progress')
  assert.equal((h1.match(/ugc-reel-track/g) || []).length, 1)
})

test('empty hero: with no approved SaaS videos the three phones stay empty (no stand-in portraits, no video, no UGC imagery) and the live HTML starts no stream', () => {
  const hero = renderToStaticMarkup(createElement(Hero.default, { items: [], config: SAAS_HERO }))
  assert.ok(/aspect-\[9\/19\.5\]/.test(hero), 'the three-phone stage is there')
  assert.ok(!/<video|<source/.test(hero) && !/<img (?![^>]*convrt-logo\.svg)/.test(hero), 'no video and no image other than the CONVRT logo watermark in the empty phones')
  assert.ok(!/Previous video|Play video/.test(hero))
  assert.equal(SAAS_HERO.previewPortraits, false, 'the empty phones stay empty on preview hosts too')
  const html = rootOf(page(PATH))
  assert.ok(!/<video[^>]*\ssrc=/.test(html) && !/<source|autoplay/i.test(html) && !/\.m3u8/.test(html))
  assert.ok(!/coming soon|being updated/i.test(textOf(page(PATH))), 'no placeholder message')
})

test('hero slots: three dedicated SaaS hero slots are documented in the shared video configuration; no Cloudflare id was invented', () => {
  const src = read('src/content/portfolio.js')
  assert.ok(/SAAS SLOTS \(\/saas-video-production\)/.test(src) && /hero slot 1 \(centre\): a human-led SaaS product explainer/.test(src) && /hero slot 3: an animated/.test(src))
  // every SaaS-page entry that exists is valid and has a real source (a 32-hex Cloudflare id or an mp4 with a poster); none is a stand-in
  for (const v of PORTFOLIO.filter((x) => servesPage(x, 'saas'))) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.ok(/^[0-9a-f]{32}$/.test(v.source.cloudflareId ?? '') || (v.source.mp4 && v.poster), `${v.id}: a real source`)
  }
})

// ── portfolio placement rules ────────────────────────────────────────────────────────────
test('portfolio: the SaaS selectors take ONLY approved type "saas" videos or explicit alsoOn.saas entries; no UGC, organic, client or talking-head video appears by accident', () => {
  const items = [
    sample({ id: 'u-1', type: 'ugc', placement: 'hero' }),
    sample({ id: 'org-1', type: 'organic', placement: 'hero' }),
    sample({ id: 'cl-1', type: 'social', showcase: 'elyon' }),
    sample({ id: 'sp-talking', type: 'spokesperson', placement: 'hero' }),
    sample({ id: 'sp-both', type: 'spokesperson', placement: 'hero', alsoOn: { saas: 'gallery' } }),
    sample({ id: 's-hero', placement: 'hero' }),
    sample({ id: 's-gal' }),
    sample({ id: 's-unapproved', approval: { ...APPROVED, status: 'pending' } }),
    sample({ id: 's-no-portfolio', approval: { ...APPROVED, portfolioUse: false } }),
    sample({ id: 's-no-consent', approval: { ...APPROVED, creatorConsent: false } }),
    sample({ id: 's-default-type', type: undefined }),
    sample({ id: 's-speaking-ad', type: 'ad' }),
  ]
  assert.deepEqual(selectSaasHero(items).map((i) => i.id), ['s-hero'])
  assert.deepEqual(selectSaasGallery(items).map((i) => i.id), ['sp-both', 's-gal'], 'a spokesperson video appears only because its own entry says so, with the placement it names for SaaS')
  assert.ok(!selectSaasHero(items).concat(selectSaasGallery(items)).some((i) => ['u-1', 'org-1', 'cl-1', 'sp-talking', 's-default-type', 's-speaking-ad'].includes(i.id)))
  // alsoOn does not move the video on its own page: the spokesperson page keeps its placement, the SaaS page uses the one in alsoOn
  assert.deepEqual(selectSpokespersonHero(items).map((i) => i.id), ['sp-talking', 'sp-both'])
  assert.equal(placementOn(items[4], 'saas'), 'gallery')
  assert.equal(placementOn(items[4], 'spokesperson'), 'hero')
  assert.ok(servesPage(items[4], 'saas') && servesPage(items[4], 'spokesperson') && !servesPage(items[4], 'ugc'))
  // the other service pages never gain a SaaS video
  assert.ok(!selectHero(items).concat(selectGallery(items), selectOrganicHero(items), selectOrganicGallery(items)).some((i) => i.id.startsWith('s-') || i.id === 'sp-both'))
  // the shipped data
  const shipped = selectSaasHero().concat(selectSaasGallery())
  assert.ok(shipped.every((v) => portfolioProblems(v).length === 0 && v.approval.status === 'approved' && v.approval.portfolioUse === true && v.approval.creatorConsent === true))
  // a video typed 'saas' is never on another service page; a UGC video reaches the SaaS page only through an explicit alsoOn entry (and keeps its UGC placement)
  const others = selectHero().concat(selectGallery(), selectOrganicHero(), selectOrganicGallery(), selectSpokespersonHero(), selectSpokespersonGallery())
  assert.ok(shipped.filter((v) => v.type === 'saas').every((v) => !others.includes(v)))
  assert.ok(shipped.filter((v) => v.type !== 'saas').every((v) => v.alsoOn?.saas), 'every non-SaaS-typed video on the page is there by an explicit alsoOn entry')
  assert.ok(selectSpokespersonHero().concat(selectSpokespersonGallery()).every((v) => !shipped.includes(v) || v.alsoOn?.saas), 'a shipped spokesperson video is on the SaaS page only through a deliberate alsoOn entry')
  assert.deepEqual(selectShowcase('elyon').map((v) => v.id), PORTFOLIO.filter((v) => v.showcase === 'elyon').map((v) => v.id), 'homepage client panels are unchanged')
  assert.equal(typeLabel({ type: 'saas' }), 'SaaS video')
})

test('portfolio validation: alsoOn and format are checked; an unknown page, placement or format is a problem; format is for SaaS-page videos only', () => {
  assert.deepEqual(portfolioProblems(sample({ format: 'demo', alsoOn: { spokesperson: 'gallery' } })), [])
  assert.deepEqual(portfolioProblems(sample({ type: 'spokesperson', alsoOn: { saas: 'hero' }, format: 'presenter' })), [])
  assert.ok(portfolioProblems(sample({ alsoOn: { blog: 'gallery' } })).some((p) => /unknown service page/.test(p)))
  assert.ok(portfolioProblems(sample({ alsoOn: { ugc: 'top' } })).some((p) => /'hero' or 'gallery'/.test(p)))
  assert.ok(portfolioProblems(sample({ alsoOn: ['saas'] })).some((p) => /alsoOn must be an object/.test(p)))
  assert.ok(portfolioProblems(sample({ alsoOn: { saas: 'gallery' } })).some((p) => /already belongs/.test(p)))
  assert.ok(portfolioProblems(sample({ format: 'cinematic' })).some((p) => /format must be one of/.test(p)))
  assert.ok(portfolioProblems(sample({ type: 'ugc', format: 'demo' })).some((p) => /only for videos shown on the SaaS page/.test(p)))
  assert.deepEqual(SAAS_FORMATS.map((f) => f.id), ['explainer', 'demo', 'presenter', 'animated', 'ad'])
})

// ── gallery ──────────────────────────────────────────────────────────────────────────────
test('gallery: SaaS heading, copy, badge, button and four-up horizontal scroller; absent without videos; the format filter appears only for formats an approved video carries', () => {
  const items = [sample({ format: 'demo' }), sample({ id: 'sa-b', caption: 'Second.', format: 'explainer' }), sample({ id: 'sa-c', caption: 'Third.', format: 'demo' })]
  const g = renderToStaticMarkup(createElement(Gallery.default, { items, config: SAAS_GALLERY }))
  const t = decode(g.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
  assert.ok(g.includes('id="saas-videos"'))
  assert.ok(t.includes('Creator-led videos for software brands.'))
  assert.ok(t.includes('Examples of how software and app products can be presented on camera. Explainers, demos and animation are scoped to your brief.'))
  assert.ok(!t.includes(CREATOR_EXAMPLES_NOTE), 'the repeated independent-creators line is not shown in the gallery')
  assert.ok(/SaaS ·/.test(t) && !/UGC|Spokesperson/.test(t), 'cards are labelled SaaS')
  assert.match(g, new RegExp(`href="${CREATOR_SHOWCASE_PATH}"[^>]*>[^<]*Explore SaaS Videos`))
  assert.ok(/aria-label="SaaS video examples\. Scroll sideways to see more\."/.test(g))
  assert.ok(/lg:w-\[calc\(\(100%-3rem\)\/4\)\]/.test(g), 'four cards across on a laptop')
  assert.ok(g.includes('Product demos') && g.includes('Product explainers') && !g.includes('>Animated<') && !g.includes('>Ads<'), 'only formats that approved videos carry get a chip')
  const one = renderToStaticMarkup(createElement(Gallery.default, { items: [sample({ format: 'demo' }), sample({ id: 'sa-b', format: 'demo' })], config: SAAS_GALLERY }))
  assert.ok(!one.includes('Filter videos by format'), 'a single format needs no filter')
  const none = renderToStaticMarkup(createElement(Gallery.default, { items: [sample(), sample({ id: 'sa-b' })], config: SAAS_GALLERY }))
  assert.ok(!none.includes('Filter videos by format'), 'no unconfirmed format, no filter')
  assert.equal(renderToStaticMarkup(createElement(Gallery.default, { items: [], config: SAAS_GALLERY })), '', 'absent without videos (the stand-ins are preview-only and appear after hydration)')
  assert.equal(SAAS_GALLERY.samplePortraits, null, 'preview stand-ins carry no creator imagery')
  assert.equal(SAAS_GALLERY.cta.href, CREATOR_SHOWCASE_PATH, 'no invented filtered route')
})

// ── the sections ─────────────────────────────────────────────────────────────────────────
test('how it works: four SaaS stages, readable without interaction, product-interface scenes, and none of the UGC sprint structure, turnaround or results', () => {
  const html = rootOf(page(PATH))
  const proc = section(html, 'id="how-it-works"', 'id="saas-formats"')
  const t = textOf(`<div id="root">${proc}`)
  assert.deepEqual(SAAS_STAGES.map((s) => s.title), ['Product Discovery & Strategy', 'Concept & Script', 'Production & Animation', 'Delivery & Distribution'])
  for (const s of SAAS_STAGES) { assert.ok(t.includes(s.title), s.title); assert.ok(t.includes(s.text), s.id) }
  assert.ok(!/visibility:\s*hidden/.test(proc), 'no stage text is hidden')
  assert.ok(t.includes('We manage the creative process from product discovery to the finished video.'))
  assert.ok(!/business days|Production turnaround|15 finished|concepts ×|5 concepts|versions each|Hook A/i.test(t), 'no UGC sprint structure or turnaround promise in the process')
  const src = read('src/components/saas/SaasScenes.jsx')
  assert.ok(/<Avatar variant/.test(src) && !/<ellipse|<circle cx="50"/.test(src), 'realistic portraits, no cartoon avatars')
  assert.ok(!/ROAS|conversion rate|outperform|\+\d+%|\d+(\.\d+)?x\b/i.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'no performance claims or fake metrics in the illustrations')
  assert.match(read('src/SaasVideoPage.jsx'), /ProcessSection/)
  assert.ok(/aria-hidden="true"[^>]*>\s*<Visual \/>|aria-hidden="true"[^\n]*\n\s*<Visual \/>/.test(read('src/components/ugc/UgcProcess.jsx')) || /<Visual \/>/.test(read('src/components/ugc/UgcProcess.jsx')), 'the shared section renders the scene')
  assert.ok(/aria-hidden="true"[^>]*className="pricing-panel-in/.test(read('src/components/ugc/UgcProcess.jsx')) || /aria-hidden="true" className="pricing-panel-in/.test(read('src/components/ugc/UgcProcess.jsx')), 'the scenes are hidden from assistive tech; the text carries the meaning')
})

test('"One product. Different ways to bring it to life.": three SaaS states, the shared interaction system, no package, quantity or deliverable promises', () => {
  const html = rootOf(page(PATH))
  const sec = section(html, 'id="saas-formats"', '</section>')
  const t = textOf(`<div id="root">${sec}`)
  assert.ok(t.includes('One product. Different ways to bring it to life.'))
  for (const s of ['Product Explainer', 'Product Demonstration', 'SaaS Advertising Creative']) assert.ok(t.includes(s), s)
  assert.ok(t.includes('Communicates what the software does, who it is for and why it matters'))
  assert.ok(t.includes('depends on your approved brief'))
  assert.ok(!/every (saas )?package|all three|includes all|\bcomes with\b/i.test(t), 'never claims every package includes all three')
  assert.ok(!/\$\s?\d|\b\d+\s+(concepts|versions|videos)\b|business days/i.test(t), 'no prices, counts or turnaround')
  assert.equal((sec.match(/aria-current="step"/g) || []).length, 1)
  assert.ok(/aria-live="polite"/.test(sec))
  // the shell is the one Spokesperson uses (shared, not copied), and keeps reduced-motion / data-saver / pause behaviour
  const shell = read('src/components/spokesperson/DeliveryStyles.jsx')
  assert.ok(/export function FormatStage/.test(shell) && /useAutoplayAllowed/.test(shell) && /Pause/.test(shell) && /IntersectionObserver/.test(shell))
  const src = read('src/components/saas/SaasFormats.jsx')
  assert.match(src, /import \{ FormatStage \}/)
  assert.ok(!/useState|IntersectionObserver/.test(src), 'the interaction logic is not duplicated')
})

test('proof: no UGC results, Elyon figure or unverified testimonial is reused; the compact "what to expect" strip uses only published business terms; populated proof is supported', () => {
  const t = textOf(page(PATH))
  assert.deepEqual(SAAS_PROOF, { results: [], testimonials: [] }, 'no SaaS-specific result or testimonial has been verified yet')
  assert.ok(!/5\.28|Elyon|Adscale|Talk360|ROAS|3421|Graspo|10\.7M/.test(t), 'none of the other pages\' proof is on this page')
  assert.ok(t.includes('What to expect') && t.includes('Built on your real product') && t.includes('Scoped to your brief'))
  assert.ok(t.includes('SaaS demos and explainers are scoped as custom packages. Custom project terms are agreed individually.'))
  assert.ok(CUSTOM_PACKAGES.paid.features.includes('SaaS demos and explainers'), 'the custom-package wording is the business data\'s')
  assert.ok(t.includes(PRODUCTION_LANGUAGES.core.at(-1)))
  assert.ok(!/stars?\b|rating|\d+\+? (clients|brands|customers)/i.test(t))
  const empty = renderToStaticMarkup(createElement(Proof.default, { config: { proof: SAAS_PROOF, expectations: null, headingId: 'x', heading: { eyebrow: 'e', title: 't' }, track: { cta: 'c', pricing: 'p' } } }))
  assert.equal(empty, '', 'with no proof and no strip the section is simply absent')
  const filled = renderToStaticMarkup(createElement(Proof.default, {
    proof: {
      results: [{ id: 'r', brand: 'Brand X', category: 'Cat', metric: '2x', metricLabel: 'a verified figure', context: 'Context sentence.', disclaimer: 'Client-reported.' }],
      testimonials: [{ id: 't', brand: 'Brand Y', category: 'Cat', quote: 'A verbatim quote.' }],
    },
  }))
  assert.ok(filled.includes('2x') && filled.includes('A verbatim quote.') && filled.includes('Client-reported.'), 'populated proof renders through the shared component')
})

test('FAQ: twelve SaaS-specific questions, all (and their links) in the static HTML; none copied from the UGC or Spokesperson FAQ', () => {
  assert.equal(SAAS_FAQ.length, 12)
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  for (const f of SAAS_FAQ) {
    assert.ok(t.includes(f.q), f.q)
    for (const para of f.a) assert.ok(t.includes(para), `answer in the HTML: ${f.q}`)
    for (const l of f.links ?? []) assert.ok(html.includes(`href="${l.href}"`), l.href)
  }
  const other = new Set([...UGC_FAQ, ...SPOKESPERSON_FAQ].map((f) => f.q))
  assert.ok(SAAS_FAQ.every((f) => !other.has(f.q)), 'no question is shared with another service page')
  for (const topic of [/What is SaaS video production/, /types of SaaS videos/, /SaaS explainer and a product demo/, /actual software interface/, /animated SaaS explainer/, /real human presenter with product demonstrations/, /paid advertising/, /concepts, scripts, filming and editing/, /multiple languages/, /How much does SaaS video production cost/, /How long does it take/, /usage rights and revisions/]) assert.ok(SAAS_FAQ.some((f) => topic.test(f.q)), String(topic))
  assert.ok(new Set(SAAS_FAQ.map((f) => f.id)).size === 12, 'unique ids')
  assert.ok(html.includes('href="/pricing#packages"') && html.includes('href="/spokesperson-video-production"') && html.includes('href="/ugc-video-agency"'))
})

test('FAQ facts come from the business data and make no invented commitments: no SaaS price, turnaround, revision allowance or deliverable; Sprint pricing is not applied to custom projects', () => {
  const t = SAAS_FAQ.map(saasFaqText).join(' ')
  assert.ok(t.includes(PRODUCT_REQUIREMENTS.saas), 'the dummy-account requirement is quoted from the data')
  assert.ok(t.includes(`${REVISIONS.roundsPerConcept} rounds of revisions`) && t.includes(`${USAGE_RIGHTS.includedMonths} months`))
  assert.ok(/do not publish a SaaS price list/.test(t) && /scoped as custom packages/.test(t) && /agreed individually/.test(t))
  assert.ok(/do not quote a fixed timeline/.test(t), 'no invented turnaround')
  assert.ok(!/\$\s?\d|\b\d[\d,]*\s?(USD|EUR)\b/.test(t) && !/business days/.test(t), 'no price and no day count in any answer')
  assert.ok(!/guarantee|unlimited revisions|within \d+ (days|weeks)/i.test(t), 'no guarantees or timelines')
  assert.ok(/does not include a free explainer or demo video/.test(t), 'the free ad concepts offer is not presented as a free explainer')
  assert.ok(!/we do not use AI|never use AI|AI-free/i.test(t), 'no business-wide AI claim')
  for (const f of ['src/seo/saasFaq.js', 'src/content/saasPage.js', 'src/SaasVideoPage.jsx', 'src/components/saas/SaasScenes.jsx', 'src/components/saas/SaasFormats.jsx']) {
    const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.ok(!/\$\s?\d/.test(code) && !/\b(2,?500|3,?000|3,?500|5,?000|6,?000)\b/.test(code), `${f}: a price is typed in the source`)
  }
})

test('positioning and SEO copy: SaaS terms appear naturally, not an animation-only studio, no rankings or search-volume claims, no keyword stuffing', () => {
  const t = textOf(page(PATH))
  for (const kw of [/SaaS video production/i, /explainer/i, /product demo(nstration)?s?/i, /app walkthroughs?/i, /animated/i, /software/i, /human-led/i, /motion graphics/i, /paid advertising|video ads?/i, /multilingual|languages/i]) assert.ok(kw.test(t), String(kw))
  assert.ok(!/\b(the best|#1|number one|top-rated|leading|award|ranked)\b/i.test(t), 'no superlatives or rankings')
  assert.ok(!/monthly searches|search volume|searches per month/i.test(t + read('src/content/saasPage.js').replace(/\/\*[\s\S]*?\*\//g, '')), 'no keyword volume claims')
  assert.ok(!/animation[- ]only|only (animated|animation)/i.test(t))
  assert.ok((t.match(/SaaS video production/gi) || []).length <= 8, 'the primary phrase is used naturally, not repeated')
  assert.ok(!/(guaranteed|guarantees?) (results|conversions|signups|sign-ups|sales)|increase(s|d)? (your )?(conversions|signups|sales)/i.test(t), 'no invented outcomes')
})

// ── structured data ──────────────────────────────────────────────────────────────────────
test('JSON-LD: Organization, WebPage, BreadcrumbList, a Service with NO price, and an FAQPage generated from the visible FAQ; nothing the page does not show', () => {
  const g = saasGraph(SITE_SEO[PATH])['@graph']
  assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage'])
  assert.equal(jsonLdFor(PATH, SITE_SEO[PATH])['@graph'].length, g.length)
  const [, web, crumb, svc, faq] = g
  assert.equal(web.url, URL_)
  assert.equal(web.about['@id'], svc['@id'])
  assert.deepEqual(crumb.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'SaaS Video Production', URL_]])
  assert.equal(BREADCRUMB_TRAILS[PATH].length, 2)
  assert.equal(svc.provider['@id'], ORG_ID)
  assert.equal(svc.offers, undefined, 'no SaaS-specific price is published, so no Offer')
  assert.ok(svc.isRelatedTo.some((r) => r['@id'] === serviceId(CUSTOM_PACKAGES.paid.id)), 'related to the custom package that scopes SaaS demos and explainers')
  assert.equal(svc.serviceType, 'SaaS video production')
  assert.equal(faq.mainEntity.length, SAAS_FAQ.length)
  faq.mainEntity.forEach((q, i) => { assert.equal(q.name, SAAS_FAQ[i].q); assert.equal(q.acceptedAnswer.text, saasFaqText(SAAS_FAQ[i])) })
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed|VideoObject|"Product"|"Person"|"price"/.test(JSON.stringify(g.filter((n) => n['@type'] !== 'Organization'))))
  for (const p of [PATHS.ugcVideoAgency, PATHS.spokespersonVideoProduction, PATHS.socialMediaVideoProduction]) assert.ok(!JSON.stringify(jsonLdFor(p, SITE_SEO[p])).includes('saas-video-production'), `${p}: JSON-LD unchanged`)
})

test('JSON-LD is in the static HTML as one valid block equal to the manifest graph', () => {
  const html = page(PATH)
  const raw = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1].replace(/\\u003c/g, '<'))
  assert.equal(raw.length, 1)
  assert.deepEqual(JSON.parse(raw[0]), JSON.parse(JSON.stringify(pageHead(PATH).jsonLd)))
  assert.equal((raw[0].match(/"@type":"FAQPage"/g) || []).length, 1)
})

// ── internal links ───────────────────────────────────────────────────────────────────────
test('internal links: the footer on every page, the homepage Services line and FAQ, and the Spokesperson FAQ link to the page; the page links out to Pricing, UGC, Spokesperson, the offers and the showcase', () => {
  const link = (h) => rootOf(h).includes(`href="${PATH}"`)
  assert.ok(link(page('/')))
  assert.match(rootOf(page('/')), /<a href="\/saas-video-production" class="svc-card"/, 'homepage Services card')
  assert.match(rootOf(page('/')), /Learn about our SaaS video production/)
  for (const p of ['/', '/pricing', '/creative-growth-roadmap', PATHS.ugcVideoAgency, PATHS.spokespersonVideoProduction, PATH]) assert.match(rootOf(page(p)), /<a [^>]*href="\/saas-video-production"[^>]*>SaaS Video Production<\/a>/, `footer link on ${p}`)
  assert.match(rootOf(page(PATHS.spokespersonVideoProduction)), /See our SaaS video production/)
  assert.ok(!JSON.stringify(jsonLdFor('/')['@graph'].find((n) => n['@type'] === 'FAQPage')).includes('saas-video-production'), 'the FAQ link is not part of the homepage FAQ answer text')
  assert.ok(JSON.stringify(jsonLdFor('/')).includes('saas-video-production#service'), 'Batch 2: SaaS is a core Service on the homepage, with the SaaS page\'s own id')
  const html = rootOf(page(PATH))
  for (const href of ['/pricing#packages', '/pricing#package-info', '/ugc-video-agency', '/spokesperson-video-production', OFFER_PATHS.roadmap, CREATOR_SHOWCASE_PATH, '/']) assert.ok(html.includes(`href="${href}"`), href)
})

test('final CTA: the same system as the other service pages, with the SaaS headline; pricing and founder e-mail are real buttons; no free-explainer implication', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  const cta = html.split('id="get-started"')[1]
  assert.ok(t.includes('Ready to show the world what your software can do?'))
  assert.match(cta, new RegExp(`href="${OFFER_PATHS.roadmap}"[^>]*>Get 5 Free Ad Concepts`))
  assert.match(cta, /href="\/pricing#packages"[^>]*>See Pricing/)
  assert.match(cta, /href="mailto:[^"]+\?subject=SaaS%20video%20production"[^>]*>[\s\S]*Email the Founder/)
  assert.ok(!/free (saas )?(explainer|demo)/i.test(t.replace(/does not include a free explainer or demo video/g, '')), 'the free roadmap is not presented as including a free explainer')
})

// ── architecture and the other pages ─────────────────────────────────────────────────────
test('architecture: the page is assembled from the shared configuration-driven components; nothing large is duplicated; copy, metadata and video selection live apart from the components', () => {
  const src = read('src/SaasVideoPage.jsx')
  for (const c of ['UgcHero', 'ProcessSection', 'UgcGallery', 'UgcFAQ', 'UgcFinalCTA', 'SpokespersonProof']) assert.ok(new RegExp(`import[^\\n]*${c}`).test(src), c)
  assert.ok(!/function Headline|function ReelWord|function Item\(/.test(src), 'no second headline, reel or accordion')
  assert.ok(src.split('\n').length < 120, 'a thin page file')
  assert.match(src, /selectSaasHero/)
  assert.ok(!/selectHero\(|selectGallery\(|selectDisplayable|selectOurWork|selectSpokesperson/.test(src), 'it never reads another page\'s lists')
  assert.ok(!/href="\/|Get 5 Free|SaaS videos\./.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/href="\/pricing#packages"|href="\/"/g, '')), 'copy lives in src/content/saasPage.js and src/seo/saasFaq.js')
})

test('other pages unchanged: UGC, Spokesperson and Organic keep their H1, reel word, FAQ length and gallery/hero defaults; only the footer (and a Spokesperson FAQ link) mention the new page; the UGC lists are unchanged by alsoOn', () => {
  const ugc = rootOf(page(PATHS.ugcVideoAgency))
  assert.equal(textOf(`<div id="root">${ugc.match(/<h1[\s\S]*?<\/h1>/)[0]}`), 'Human-led UGC ads. Built for paid social. to convrt.')
  assert.ok(ugc.includes('class="ugc-reel text-lime" data-sizer="resonate."') && textOf(page(PATHS.ugcVideoAgency)).includes('5.28x'))
  assert.equal((ugc.match(/saas-video-production/g) || []).length, 2, 'the footer link and (Batch 2) one FAQ link for software brands')
  assert.equal(UGC_FAQ.length, 16)
  const sp = rootOf(page(PATHS.spokespersonVideoProduction))
  assert.equal(textOf(`<div id="root">${sp.match(/<h1[\s\S]*?<\/h1>/)[0]}`), 'Human-led spokesperson videos. Built to communicate. Made to convrt.')
  assert.ok(sp.includes('id="spokesperson-formats"') && sp.includes('One message. Different ways to deliver it.'), 'the Spokesperson formats section still renders through the shared FormatStage')
  assert.equal(SPOKESPERSON_FAQ.length, 12)
  const org = rootOf(page(PATHS.socialMediaVideoProduction))
  assert.ok(!/SaaS/.test(textOf(`<div id="root">${org.match(/<h1[\s\S]*?<\/h1>/)[0]}`)), 'the Organic H1 is its own')
  assert.ok(!org.includes('saas-h1') && !sp.includes('saas-h1') && !ugc.includes('saas-h1'))
  // the Creator Showcase still lists exactly what it listed before the SaaS page existed (no SaaS-typed video ships)
  // the SaaS-typed videos are independent creator examples from the owner's folder: no CONVRT-production claim, and they are all on the SaaS page (and in the Creator Showcase)
  const saasTyped = PORTFOLIO.filter((v) => v.type === 'saas')
  assert.ok(saasTyped.every((v) => v.production === undefined && v.brand === undefined && selectOurWork().includes(v) && selectSaasHero().concat(selectSaasGallery()).includes(v)))
})

test('accessibility: one H1, headings never skip a level, secondary text uses the muted token, motion respects preferences', () => {
  const html = rootOf(page(PATH))
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
  assert.equal(levels.filter((l) => l === 1).length, 1)
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, `heading level jumps ${levels[i - 1]} → ${levels[i]}`)
  for (const f of ['SaasScenes', 'SaasFormats']) {
    const code = read(`src/components/saas/${f}.jsx`)
    for (const line of code.split('\n').filter((l) => /text-ink-subtle/.test(l))) assert.ok(/aria-hidden="true"/.test(line), `${f}: secondary copy must use text-ink-muted`)
  }
  assert.ok(/prefers-reduced-motion: reduce/.test(read('src/components/ugc/creatorVideo.jsx')) && /saveData/.test(read('src/components/ugc/creatorVideo.jsx')))
  assert.ok(/useAutoplayAllowed/.test(read('src/components/ugc/UgcProcess.jsx')) && /Pause animation/.test(read('src/components/ugc/UgcProcess.jsx')))
  assert.ok(!/<(img|video)[^>]*>/.test(html.split('id="saas-formats"')[1]?.split('</section>')[0]?.replace(/<img[^>]*alt=""[^>]*>/g, '') ?? ''), 'decorative images carry empty alt text')
})
