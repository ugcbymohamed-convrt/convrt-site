// Run with: node --test tests/organic-social-page.test.mjs
// The /social-media-video-production service page (Organic Social Video Production & Management): head, canonical, sitemap gate, prerendered HTML, claims, the
// figures-from-data rule, the proof rules, structured data, the portfolio isolation from the UGC and Spokesperson pages, the shared configuration-driven components,
// internal links, and that the UGC and Spokesperson pages are unchanged.
// Builds the site once into a temp dir and starts a Vite SSR loader to render components with sample data.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { readSource } from './helpers/i18nSource.mjs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PATHS, KNOWN_PATHS } from '../src/routes.js'
import { SITE_URL, OFFER_PATHS, CREATOR_SHOWCASE_PATH, BOOKING_URL } from '../src/config.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { organicSocialGraph, jsonLdFor, ORG_ID, serviceId, BREADCRUMB_TRAILS } from '../src/seo/structuredData.js'
import { ORGANIC_SOCIAL_FAQ, organicSocialFaqText } from '../src/seo/organicSocialFaq.js'
import { UGC_FAQ } from '../src/seo/ugcFaq.js'
import { SPOKESPERSON_FAQ } from '../src/seo/spokespersonFaq.js'
import { ORGANIC, ORGANIC_COMMITMENT, CARD_NOTES, formatMoney } from '../src/seo/businessKnowledge.js'
import {
  PORTFOLIO, ORGANIC_STYLES, selectHero, selectGallery, selectSpokespersonHero, selectSpokespersonGallery, selectOrganicHero, selectOrganicGallery,
  selectOurWork, isDisplayable, portfolioProblems,
} from '../src/content/portfolio.js'
import { ORGANIC_HERO, ORGANIC_PROOF, ORGANIC_PAGE_STAGES, ORGANIC_SYSTEM, ORGANIC_GALLERY, ORGANIC_PRICING_HREF, ORGANIC_PAGE_CTA } from '../src/content/organicSocialPage.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readSource(path.join(ROOT, p))
const PATH = PATHS.socialMediaVideoProduction
const URL_ = `${SITE_URL}${PATH}`

const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;|&#x2019;/g, '’')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
const headOf = (h) => h.slice(0, h.indexOf('</head>'))
const flatten = (html) => decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()

let tmp, dist, vite, Hero, Gallery, Proof
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-organic-'))
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
  id: 'org-sample-a', title: 'Sample', caption: 'An organic sample caption.', type: 'organic', industry: 'ecommerce', languages: ['en'],
  source: { mp4: '/videos/sample.mp4' }, poster: '/portfolio/sample.webp', creatorId: 'c-test-1', approval: APPROVED, ...over,
})

// ── route, head, canonical, sitemap ──────────────────────────────────────────────────────
test('route: /social-media-video-production (the approved service-page map URL) is a public path with its own static HTML file', () => {
  assert.equal(PATH, '/social-media-video-production')
  assert.ok(KNOWN_PATHS.includes(PATH))
  assert.ok(fs.existsSync(path.join(dist, 'social-media-video-production', 'index.html')))
  assert.match(read('src/App.jsx'), /\[PATHS\.socialMediaVideoProduction\]: OrganicSocialVideoPage/)
})

test('head: title and description, unique, self-canonical, robots follows the video gate, sitemap follows the same gate', () => {
  const e = SITE_SEO[PATH]
  assert.equal(e.title, 'Organic Social Media Video Production & Management | CONVRT')
  assert.ok(e.title.length <= 60, `title length ${e.title.length}`)
  assert.equal(e.description, 'Organic social media video production: human-led short-form video, from strategy to publishing and community management on Instagram, TikTok and Facebook.')
  assert.ok(e.description.length >= 120 && e.description.length <= 160, `description length ${e.description.length}`)
  assert.equal(e.canonicalPath, undefined, 'a canonical of its own')
  for (const [p, v] of Object.entries(SITE_SEO)) if (p !== PATH) { assert.notEqual(v.title, e.title); assert.notEqual(v.description, e.description) }
  assert.equal(pageHead(PATH).url, URL_)
  // indexable once the page has approved organic videos (the same rule as /our-work and the spokesperson page); the gate flips by itself when the first one is added
  assert.equal(e.indexable, selectOrganicHero().length + selectOrganicGallery().length > 0)
  assert.equal(sitemapRoutes().includes(PATH), e.indexable)
  const html = page(PATH)
  const head = headOf(html)
  assert.ok(head.includes(`<title>${e.title.replace('&', '&amp;')}</title>`))
  assert.ok(head.includes(`<link rel="canonical" href="${URL_}" />`))
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.equal(/name="robots"/.test(head), !e.indexable)
  assert.equal(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${URL_}</loc>`), e.indexable)
  assert.ok(!/guarantee|#1|best/i.test(e.title + e.description), 'no ranking or result claims in the metadata')
})

// ── prerendered HTML ─────────────────────────────────────────────────────────────────────
test('static HTML: breadcrumb, ONE H1 reading "Organic social videos. Built to engage. Made to convrt.", the approved description and CTAs', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.match(html, /<nav aria-label="Breadcrumb"[\s\S]*?Home[\s\S]*?Organic Social Video Production/)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  assert.equal(textOf(`<div id="root">${html.match(/<h1[\s\S]*?<\/h1>/)[0]}`), 'Organic social videos. Built to engage. Made to convrt.')
  assert.ok(t.includes('Turn your brand into content worth following. We handle short-form social media video production end to end: creative strategy, creator-led filming, editing, publishing and community management, so your brand shows up consistently.'))
  assert.ok(!t.includes('Keep your brand visible with human-led'), 'the long description is gone')
  const hero = html.split('<section aria-labelledby="organic-h1"')[1].split('</section>')[0]
  assert.equal((hero.match(/<p class="cs-fade-up mx-auto mt-6/g) || []).length, 1, 'one description paragraph only')
  assert.match(hero, new RegExp(`<a href="${BOOKING_URL.replace(/[.?]/g, '\\$&')}" target="_blank" rel="noopener noreferrer"[^>]*>\\s*Discuss Your Content Strategy`), 'primary CTA → the existing discovery-call booking link, in a new tab')
  assert.ok(!/Get 5 Free Ad Concepts|Your next 5 ad concepts/.test(hero), 'the paid-ads Roadmap promise is not in the organic hero')
  assert.match(html, new RegExp(`<a [^>]*href="${CREATOR_SHOWCASE_PATH}"[^>]*>\\s*Explore Videos`), 'secondary CTA → /our-work')
  assert.ok(html.includes(`href="${OFFER_PATHS.roadmap}"`) && /Get 5 Free Ad Concepts/.test(html), 'the Free Creative Growth Roadmap stays reachable (header and proof section)')
  assert.ok(/1 <span class="text-lime">FREE<\/span> Video/.test(html) && /10 <span class="text-\[#F472B6\]">FREE<\/span> Ad Hooks/.test(html), 'the two free-offer cards, reused from the homepage hero')
})

test('headline reel: convrt, connect, inspire, resonate; only "convrt." in the server HTML; the sizer reserves the longest word; every word completes "Made to ___."; "engage" is not repeated', () => {
  assert.deepEqual(ORGANIC_HERO.words, ['convrt', 'connect', 'inspire', 'resonate'])
  assert.deepEqual(ORGANIC_HERO.lead, ['Made', 'to'])
  assert.ok(!ORGANIC_HERO.words.includes('engage'), 'line two already ends "Built to engage."')
  const longest = ORGANIC_HERO.words.reduce((a, b) => (b.length > a.length ? b : a))
  assert.equal(ORGANIC_HERO.sizer, `${longest}.`)
  const h1 = rootOf(page(PATH)).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]
  assert.ok(h1.includes(`data-sizer="${ORGANIC_HERO.sizer}"`))
  assert.ok(!/>connect|inspire|>resonate/.test(h1.replace(`data-sizer="${ORGANIC_HERO.sizer}"`, '')), 'the other words appear only while a roll is in progress')
  assert.equal((h1.match(/ugc-reel-track/g) || []).length, 1)
})

test('empty hero: with no approved organic videos the three phones stay empty (no stand-in portraits, no video, no UGC or spokesperson imagery)', () => {
  const hero = renderToStaticMarkup(createElement(Hero.default, { items: [], config: ORGANIC_HERO }))
  assert.ok(/aspect-\[9\/19\.5\]/.test(hero), 'the three-phone stage is there')
  assert.ok(!/<video|<source/.test(hero) && !/<img (?![^>]*convrt-logo\.svg)/.test(hero), 'no video and no image other than the CONVRT logo watermark in the empty phones')
  assert.equal(ORGANIC_HERO.previewPortraits, false)
})

// ── portfolio ────────────────────────────────────────────────────────────────────────────
test('portfolio: the organic selectors take ONLY approved type "organic" videos (3 hero + 4 gallery supplied 2026-11-20); nothing crosses between the three service pages', () => {
  assert.equal(PORTFOLIO.filter((i) => i.type === 'organic').length, 7)
  assert.deepEqual(selectOrganicHero().map((i) => i.id), ['organic-hero-1', 'organic-hero-2', 'organic-hero-3'], 'hero 1 is the centre phone')
  assert.deepEqual(selectOrganicGallery().map((i) => i.id), ['organic-gal-1', 'organic-gal-2', 'organic-gal-3', 'organic-gal-4'])
  assert.ok(selectOrganicHero().every((i) => fs.existsSync(path.join(ROOT, 'public', i.poster))) && selectOrganicGallery().every((i) => fs.existsSync(path.join(ROOT, 'public', i.poster))), 'every video has its own hand-picked thumbnail file')
  assert.ok(PORTFOLIO.filter((i) => i.type === 'organic').every((i) => !i.brand && !i.creator && !i.style), 'no brand, creator or style was supplied, so none is invented')
  assert.equal(new Set(PORTFOLIO.map((i) => i.source?.cloudflareId).filter(Boolean)).size, PORTFOLIO.filter((i) => i.source?.cloudflareId).length, 'no Cloudflare id is reused across entries')
  const list = [
    sample({ id: 'o-hero', placement: 'hero' }), sample({ id: 'o-gal' }), sample({ id: 'o-unapproved', approval: { ...APPROVED, creatorConsent: false } }),
    sample({ id: 'o-pending', approval: { ...APPROVED, status: 'pending' } }),
    sample({ id: 'u-1', type: 'ugc' }), sample({ id: 'u-2', type: undefined }), sample({ id: 's-1', type: 'spokesperson' }), sample({ id: 'c-1', type: 'social' }),
  ]
  assert.deepEqual(selectOrganicHero(list).map((i) => i.id), ['o-hero'])
  assert.deepEqual(selectOrganicGallery(list).map((i) => i.id), ['o-gal'], 'consent and approval are required; UGC, spokesperson and homepage-client videos never appear')
  assert.ok(!selectGallery(list).some((i) => i.id.startsWith('o-')) && !selectHero(list).some((i) => i.id.startsWith('o-')), 'an organic video never reaches the UGC page')
  assert.ok(!selectSpokespersonGallery(list).some((i) => i.id.startsWith('o-')) && !selectSpokespersonHero(list).some((i) => i.id.startsWith('o-')), 'nor the spokesperson page')
  assert.deepEqual(selectOurWork(list).filter((i) => i.type === 'organic').map((i) => i.id), ['o-hero', 'o-gal'], 'approved organic videos still reach /our-work')
  // the existing homepage-client videos (type "social") are never used as organic examples
  assert.ok(PORTFOLIO.filter((i) => i.type === 'social').every((i) => !isDisplayable(i) || !selectOrganicGallery().includes(i)))
})

test('portfolio: the content-style field is optional, only for organic videos and only one of the four suggested styles; no existing video is classified', () => {
  assert.deepEqual(ORGANIC_STYLES.map((s) => s.label), ['Educational', 'Entertaining', 'Product-focused', 'Founder-led'])
  assert.deepEqual(portfolioProblems(sample()), [])
  assert.deepEqual(portfolioProblems(sample({ style: 'educational' })), [])
  assert.ok(portfolioProblems(sample({ style: 'viral' })).some((p) => /style must be one of/.test(p)))
  assert.ok(portfolioProblems(sample({ type: 'ugc', style: 'educational' })).some((p) => /only for type 'organic'/.test(p)))
  assert.ok(PORTFOLIO.every((i) => i.style === undefined), 'no existing video was assigned a content style without confirmation')
  assert.ok(PORTFOLIO.every((i) => portfolioProblems(i).length === 0))
})

test('section order: hero, how it works, content system, showcase, proof, packages, FAQ, final CTA', () => {
  const src = read('src/OrganicSocialVideoPage.jsx')
  const order = ['<UgcHero', '<ProcessSection', '<ContentSystem', '<UgcGallery', '<SpokespersonProof', '<OrganicPackages', '<UgcFAQ', '<UgcFinalCTA'].map((t) => src.indexOf(t))
  assert.ok(order.every((i) => i > 0) && order.every((v, i) => i === 0 || v > order[i - 1]), 'sections are in the owner-approved order')
})

test('live page: with approved organic videos the stage and gallery show exactly those (and nothing else)', () => {
  const html = rootOf(page(PATH))
  const heroItems = selectOrganicHero()
  const galleryItems = selectOrganicGallery()
  if (heroItems.length) {
    const hero = html.split('<section aria-labelledby="organic-h1"')[1].split('</section>')[0]
    assert.ok(hero.includes('aria-label="Organic social videos"') && hero.includes('aria-roledescription="carousel"'))
    assert.ok(heroItems.slice(0, 3).every((v) => hero.includes(v.poster ?? v.source.cloudflareId)))
  } else {
    assert.ok(!/<video /.test(html), 'no video element anywhere on an empty page')
  }
  assert.equal(html.includes('id="organic-videos"'), galleryItems.length > 0, 'the gallery is absent without videos on the live site')
})

test('gallery: heading, copy, badge, button and four-up horizontal scroller; styles filter only for styles that approved videos carry; absent without videos; neutral preview frames', () => {
  const items = [sample({ style: 'educational' }), sample({ id: 'org-b', caption: 'Second.', style: 'founder' }), sample({ id: 'org-c', caption: 'Third.', style: 'educational' })]
  const g = renderToStaticMarkup(createElement(Gallery.default, { items, config: ORGANIC_GALLERY }))
  const t = decode(g.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
  assert.ok(g.includes('id="organic-videos"'))
  assert.ok(t.includes('Content people actually want to watch.'))
  assert.ok(t.includes('From educational Reels and creator-led stories to entertaining short-form videos, explore different ways brands can connect with their audiences.'))
  assert.ok(/Organic ·/.test(t) && !/UGC|Spokesperson/.test(t), 'cards are labelled Organic')
  assert.match(g, new RegExp(`href="${CREATOR_SHOWCASE_PATH}"[^>]*>[^<]*Explore Videos`))
  assert.ok(/lg:w-\[calc\(\(100%-3rem\)\/4\)\]/.test(g), 'four cards across on a laptop')
  // filter: All + only the two styles that exist; real toggle buttons in a labelled group
  assert.match(g, /role="group" aria-label="Filter videos by content style"/)
  const chips = [...g.matchAll(/<button type="button" aria-pressed="(true|false)"[^>]*>([^<]+)<\/button>/g)].map((m) => [m[2], m[1]])
  assert.deepEqual(chips, [['All', 'true'], ['Educational', 'false'], ['Founder-led', 'false']])
  // a single style (or none) needs no filter, and nothing is filtered or hidden from the HTML
  const one = renderToStaticMarkup(createElement(Gallery.default, { items: [sample({ style: 'educational' }), sample({ id: 'org-b', style: 'educational' })], config: ORGANIC_GALLERY }))
  assert.ok(!/aria-label="Filter videos by content style"/.test(one))
  const none = renderToStaticMarkup(createElement(Gallery.default, { items: [sample(), sample({ id: 'org-b' })], config: ORGANIC_GALLERY }))
  assert.ok(!/aria-label="Filter videos by content style"/.test(none), 'unclassified videos produce no filter: styles are never invented')
  assert.equal((g.match(/<figure/g) || []).length, 3, 'every approved card is in the HTML')
  assert.equal(renderToStaticMarkup(createElement(Gallery.default, { items: [], config: ORGANIC_GALLERY })), '', 'absent without videos (the stand-ins are preview-only and appear after hydration)')
  assert.equal(ORGANIC_GALLERY.samplePortraits, null, 'preview stand-ins carry no creator imagery')
  assert.deepEqual(ORGANIC_GALLERY.cta, { label: 'Explore Videos', href: CREATOR_SHOWCASE_PATH }, '/our-work has no style filter, so the button goes to the whole showcase')
  // the shared gallery without a filter config is exactly as before
  const ugcLike = renderToStaticMarkup(createElement(Gallery.default, { items }))
  assert.ok(!/aria-pressed/.test(ugcLike))
})

// ── the sections ─────────────────────────────────────────────────────────────────────────
test('how it works: four organic stages, readable without interaction, scenes aria-hidden, and no results, counts or growth claims', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.deepEqual(ORGANIC_PAGE_STAGES.map((s) => s.title), ['Strategy & Content Planning', 'Scripts & Creators', 'Filming & Editing', 'Publishing & Community'])
  for (const s of ORGANIC_PAGE_STAGES) assert.ok(t.includes(s.title) && t.includes(s.text), s.title)
  assert.ok(ORGANIC_PAGE_STAGES.every((s) => s.text.split(/[.!?]\s/).length <= 2), 'one or two short sentences per stage')
  const how = html.split('id="how-it-works"')[1].split('id="organic-content-system"')[0]
  assert.ok(!/Concepts × versions|business days|Creative testing/i.test(how), 'none of the UGC sprint structure')
  assert.ok(/Scenes are illustrative/.test(t))
  const scenes = read('src/components/organic/OrganicScenes.jsx') + read('src/components/organic/ContentSystem.jsx')
  assert.ok(!/\b\d+(\.\d+)?\s?(k|m|%|likes|followers|views)\b/i.test(scenes.replace(/text-\[\d+px\]|\d+%|w-\[\d+%\]/g, '')), 'no figures drawn in the scenes')
  assert.ok(!/followers|likes|viral|guarantee/i.test(scenes.replace(/\/\*[\s\S]*?\*\//g, '')), 'no likes, follower growth, virality or guarantee wording in the scenes')
  assert.ok(!/<img [^>]*class="[^"]*"[^>]*alt="[^"]+"/.test(how), 'the illustrative portraits are decorative (empty alt)')
})

test('"Not just more posts. A content system.": three states, the Strategy → Production → Publishing → Learning line, same interaction system, no promises', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  const sys = html.split('id="organic-content-system"')[1].split('</section>')[0]
  assert.ok(t.includes('Not just more posts. A content system.'))
  assert.deepEqual(ORGANIC_SYSTEM.flow, ['Strategy', 'Production', 'Publishing', 'Learning'])
  assert.match(sys, /aria-label="Strategy, Production, Publishing, Learning"/)
  assert.deepEqual(ORGANIC_SYSTEM.steps.map((s) => s.short), ['Plan', 'Produce', 'Publish & Learn'])
  assert.equal((sys.match(/<button type="button"/g) || []).length, 3, 'one real button per state')
  assert.ok(/aria-live="polite"/.test(sys) && /Illustration only\./.test(textOf(`<div id="root">${sys}`)))
  const copy = JSON.stringify(ORGANIC_SYSTEM)
  assert.ok(!/guarantee|viral|virality|growth|sales|customer support|\d/.test(copy.replace(/Strategy.*?Learning/, '')), 'no promises, results or figures')
  const src = read('src/components/organic/ContentSystem.jsx')
  assert.ok(/useAutoplayAllowed/.test(src) && />\s*Pause\s*</.test(src) && /aria-current/.test(src), 'auto-advance respects reduced motion / data saver, has a Pause button, and the buttons always work')
  assert.ok(/motion-reduce:transition-none/.test(src))
})

test('content system scenes: Plan shows pillars → video concepts → calendar; Produce is video-first; Publish & Learn drops finished videos into the calendar with metric NAMES only', () => {
  const src = read('src/components/organic/ContentSystem.jsx')
  for (const l of ['1 · Content pillars', '2 · Video concepts', '3 · Content calendar']) assert.ok(src.includes(l), l)
  assert.ok(src.includes('Footage') && src.includes('Finished videos') && ['Cut', 'Captions', 'Graphics'].every((x) => src.includes(`'${x}'`)), 'footage → edit → finished vertical videos')
  assert.ok(/Finished videos → publishing calendar/.test(src) && /org-drop/.test(src), 'finished videos drop into the schedule')
  for (const m of ['Reach', 'Watch time', 'Engagement']) assert.ok(src.includes(`'${m}'`), m)
  const jsx = src.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!/\d+(\.\d+)?\s?(%|k\b|m\b|views|likes|followers)/i.test(jsx.replace(/w-\d+\/\d+|\d+%|text-\[\d+px\]/g, '')), 'no performance numbers')
  assert.ok(!/ugc-bar|rising|chart|dashboard/i.test(jsx), 'no bars, charts or dashboard styling for the metrics')
  assert.ok(/\.org-drop \{/.test(read('src/index.css')) && /\.org-drop,/.test(read('src/index.css')), 'the drop animation exists and is switched off for reduced motion')
  assert.ok(/max-w-4xl/.test(src) && /lg:flex-row/.test(src), 'larger stage on desktop, stacked below lg')
})

test('proof: only the published Graspo organic result (figures match its case study); no UGC or paid results or testimonials; empty proof leaves no section', async () => {
  const t = textOf(page(PATH))
  const r = ORGANIC_PROOF.results[0]
  assert.equal(ORGANIC_PROOF.results.length, 1)
  assert.deepEqual(ORGANIC_PROOF.testimonials, [], 'there is no organic testimonial yet, so none is shown')
  // the same figures, from the same published case study (Meta Business Suite, 1 Jan to 19 Jun 2026)
  const metrics = read('src/caseStudies/data.js') // the case study's figures live in one data module (GRASPO_METRICS)
  assert.ok(metrics.includes("value: '10.7M'") && metrics.includes("value: '3.4M'") && metrics.includes("value: '75'"))
  assert.equal(r.metric, '10.7M')
  assert.deepEqual(r.secondary, [{ value: '3.4M', label: 'accounts reached' }, { value: '75', label: 'unique inbound leads' }])
  assert.equal(r.href, '/case-studies/graspo')
  assert.ok(t.includes('10.7M') && t.includes('3.4M') && t.includes('75 unique inbound leads') && t.includes('1 January to 19 June 2026'))
  assert.ok(/not typical and not guaranteed/.test(t) && /Meta Business Suite/.test(t), 'the honest qualifiers and the source are on the page')
  assert.match(rootOf(page(PATH)), /href="\/case-studies\/graspo"/)
  // nothing from the paid-social proof
  assert.ok(!/5\.28x|Elyon|Adscale|ROAS/.test(t), "the UGC page's paid results and quotes are not reused")
  // no organic proof at all: the section is simply absent (no filler)
  const none = renderToStaticMarkup(createElement(Proof.default, { config: { proof: { results: [], testimonials: [] }, expectations: null, headingId: 'x', heading: {}, track: {} } }))
  assert.equal(none, '')
  // the spokesperson page still shows its own compact strip
  assert.ok(textOf(page(PATHS.spokespersonVideoProduction)).includes('What to expect'))
})

test('packages: a compact pointer to Pricing; both package figures come from the business data; nothing invented', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  const sec = flatten(html.split('id="organic-packages"')[1].split('</section>')[0])
  assert.ok(sec.includes('Consistent content. Flexible support.'))
  for (const p of [ORGANIC.light, ORGANIC.growth]) assert.ok(sec.includes(p.name) && sec.includes(formatMoney(p.monthly)) && sec.includes(p.cadence), p.name)
  // three compact lines (owner, Nov 2026): scheduling/posting/community management on three platforms, the commitment + VAT + exclusions, and the custom-plan line
  assert.ok(sec.includes('Both packages include scheduling, posting and organic community management across Instagram, Facebook and TikTok.'))
  assert.ok(sec.includes(`${ORGANIC_COMMITMENT.initialMonths}-month initial commitment. Prices exclude VAT. Customer support and paid ad management are not included.`))
  assert.ok(sec.includes('Need a different approach? Let’s build a plan around your brand.'))
  assert.match(html.split('id="organic-packages"')[1].split('</section>')[0], new RegExp(`href="${ORGANIC_PRICING_HREF}"[^>]*>Compare packages and full scope`))
  assert.equal(ORGANIC_PRICING_HREF, '/pricing#organic')
  assert.ok(!/turnaround|response time|business days|videos per month|reporting schedule|unlimited|guarantee/i.test(sec), 'no unconfirmed commitments')
  const src = read('src/components/organic/OrganicPackages.jsx')
  assert.ok(!/\$\s?\d|\b1,?500\b|\b2,?500\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'no price typed in the component')
  assert.ok(t.length > 0 && !/Monthly\s*One-off|billing/i.test(sec), 'no second Pricing page: no billing switch or matrix')
  assert.equal(ORGANIC_COMMITMENT.initialMonths, 6)
})

test('FAQ: twelve organic questions, all (and their links) in the static HTML; none copied from the UGC or Spokesperson FAQ', () => {
  assert.equal(ORGANIC_SOCIAL_FAQ.length, 12)
  const html = rootOf(page(PATH))
  const faq = html.split('id="organic-faq"')[1].split('</section>')[0]
  const ft = flatten(faq)
  for (const item of ORGANIC_SOCIAL_FAQ) {
    assert.ok(ft.includes(item.q), item.q)
    for (const para of item.a) assert.ok(ft.includes(para), `${item.id}: answer in the HTML`)
    for (const l of item.links ?? []) assert.ok(faq.includes(`href="${l.href.replace(/&/g, '&amp;')}"`), l.href)
  }
  const others = new Set([...UGC_FAQ, ...SPOKESPERSON_FAQ].map((f) => f.q))
  assert.ok(ORGANIC_SOCIAL_FAQ.every((f) => !others.has(f.q)))
  assert.equal(new Set(ORGANIC_SOCIAL_FAQ.map((f) => f.id)).size, 12)
  assert.ok(ft.includes('Organic social video, answered.'))
})

test('FAQ facts come from the business data and make no invented commitments', () => {
  const by = (id) => organicSocialFaqText(ORGANIC_SOCIAL_FAQ.find((f) => f.id === id))
  const cost = by('organic-cost')
  assert.ok(cost.includes('$1,500') && cost.includes('$2,500') && cost.includes('US dollars') && cost.includes('exclude VAT'))
  assert.ok(cost.includes(ORGANIC_COMMITMENT.faqAnswer) && cost.includes(ORGANIC_COMMITMENT.afterInitial), 'six-month commitment, later terms per agreement')
  const pkgs = by('organic-light-vs-growth')
  assert.ok(pkgs.includes(ORGANIC.light.cadence) && pkgs.includes(ORGANIC.growth.cadence))
  assert.ok(/Paid Social usage rights and extension prices do not automatically apply/.test(pkgs))
  const plat = by('platforms')
  assert.ok(/Facebook, Instagram and TikTok/.test(plat) && /YouTube Shorts and LinkedIn are not part of the standard packages/.test(plat), 'platforms are never overstated')
  const comm = by('posting-and-community')
  assert.ok(/Customer support is not part of the service/.test(comm) && comm.includes(ORGANIC.communityManagement))
  assert.ok(/outside the organic service scope/.test(by('organic-vs-ugc')), 'paid advertising management is excluded')
  const perf = by('measuring-performance')
  assert.ok(/never guarantee virality, follower growth or sales/.test(perf) && /set out in your agreement/.test(perf), 'no result promises; the reporting schedule is left to the agreement')
  const all = ORGANIC_SOCIAL_FAQ.map(organicSocialFaqText).join(' ')
  assert.ok(!/\b(guaranteed?|will grow|go viral|within \d+ (days|hours)|response time of|24\/7|unlimited)\b/i.test(all.replace('never guarantee virality, follower growth or sales', '')))
  assert.ok(/human-led/.test(by('real-people-or-ai')) && !/100%/.test(by('real-people-or-ai')))
})

test('positioning and SEO copy: one primary cluster (social media video production) with supporting phrases, distinct from the UGC and Spokesperson pages, no rankings or volume claims', () => {
  const t = textOf(page(PATH))
  for (const phrase of ['social media video', 'organic social', 'short-form', 'community management', 'content calendar'.replace('content calendar', 'content plan')]) assert.ok(new RegExp(phrase, 'i').test(t), phrase)
  assert.ok(!/search volume|rank(s|ing)? #|first page of google|\b#1\b/i.test(t))
  assert.ok(!/Human-led UGC ads\. Built for paid social|One message\. Different ways to deliver it/.test(t), 'no copy borrowed from the UGC or Spokesperson pages')
  const mine = new Set(t.split(/(?<=[.!?])\s/).filter((s) => s.length > 60))
  const other = textOf(page(PATHS.spokespersonVideoProduction)).split(/(?<=[.!?])\s/).filter((s) => mine.has(s) && !/English Español|Not ready yet|Your next 5 ad concepts|Free strategy session|A performance creative studio|Scenes are illustrative|See if you qualify|^Studio Services|CONVRT works with both in-house talent|Other languages are available on request|Videos shown are examples from independent creators/.test(s))
  assert.deepEqual(other, [], 'no long sentence is shared with the Spokesperson page apart from the shared chrome and the approved business-data facts (talent model, other languages)')
})

test('JSON-LD: Organization, WebPage, BreadcrumbList, a Service with the two monthly Offers from the data, and an FAQPage generated from the visible FAQ', () => {
  const g = organicSocialGraph(SITE_SEO[PATH])['@graph']
  assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage'])
  assert.equal(jsonLdFor(PATH, SITE_SEO[PATH])['@graph'].length, g.length)
  const [, web, crumb, svc, faq] = g
  assert.equal(web.url, URL_)
  assert.equal(web.about['@id'], svc['@id'])
  assert.deepEqual(crumb.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'Organic Social Video Production', URL_]])
  assert.equal(BREADCRUMB_TRAILS[PATH].length, 2)
  assert.equal(svc.provider['@id'], ORG_ID)
  assert.equal(svc['@id'], serviceId('organic'), 'the stable service id every other page (homepage, /pricing, case studies) refers to')
  assert.ok(!svc.isRelatedTo.some((r) => r['@id'] === svc['@id']), 'never related to itself')
  assert.ok(svc.isRelatedTo.some((r) => r['@id'] === serviceId('organic-light')) && svc.isRelatedTo.some((r) => r['@id'] === serviceId('organic-growth')))
  assert.deepEqual(svc.offers.map((o) => [o.name, o.priceSpecification.price, o.priceSpecification.priceCurrency, o.priceSpecification.unitCode]), [
    ['Organic Light (monthly)', 1500, 'USD', 'MON'], ['Organic Growth (monthly)', 2500, 'USD', 'MON'],
  ])
  assert.ok(svc.offers.every((o) => /Initial six-month commitment/.test(o.description) && /exclud/.test(o.description)))
  assert.equal(faq.mainEntity.length, ORGANIC_SOCIAL_FAQ.length)
  faq.mainEntity.forEach((q, i) => { assert.equal(q.name, ORGANIC_SOCIAL_FAQ[i].q); assert.equal(q.acceptedAnswer.text, organicSocialFaqText(ORGANIC_SOCIAL_FAQ[i])) })
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed|VideoObject|"Product"|"Person"/.test(JSON.stringify(g.filter((n) => n['@type'] !== 'Organization'))))
  const ugcLd = JSON.stringify(jsonLdFor(PATHS.ugcVideoAgency, SITE_SEO[PATHS.ugcVideoAgency]))
  assert.ok(!ugcLd.includes('social-media-video-production'), 'the UGC page JSON-LD is unchanged')
})

test('JSON-LD is in the static HTML as one valid block equal to the manifest graph', () => {
  const html = page(PATH)
  const raw = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1].replace(/\\u003c/g, '<'))
  assert.equal(raw.length, 1)
  assert.deepEqual(JSON.parse(raw[0]), JSON.parse(JSON.stringify(pageHead(PATH).jsonLd)))
  assert.equal((raw[0].match(/"@type":"FAQPage"/g) || []).length, 1)
})

// ── internal links ───────────────────────────────────────────────────────────────────────
test('internal links: homepage Services and FAQ, Pricing and the footer link to the page; the FAQ link is not in the homepage JSON-LD; the page links out to Pricing, UGC and the offers', () => {
  const link = (h) => rootOf(h).includes(`href="${PATH}"`)
  assert.ok(link(page('/')), 'homepage')
  assert.match(rootOf(page('/')), /<a href="\/social-media-video-production" class="svc-card"/, 'homepage Services card')
  assert.match(rootOf(page('/')), /Learn about our organic social video production/)
  assert.match(rootOf(page('/')), /Learn about our UGC video production/, 'the existing UGC link is kept')
  assert.match(rootOf(page('/')), /<a href="\/spokesperson-video-production" class="svc-card"/, 'the existing spokesperson link is kept')
  assert.ok(link(page('/pricing')) && /See organic social video production/.test(rootOf(page('/pricing'))), 'pricing')
  for (const p of ['/', '/pricing', '/creative-growth-roadmap', PATH, PATHS.ugcVideoAgency]) assert.match(rootOf(page(p)), /<a [^>]*href="\/social-media-video-production"[^>]*>Organic Social Video<\/a>/, `footer link on ${p}`)
  // the FAQ link is not in the homepage FAQ answer text; the homepage Service node (Batch 2) now carries the page URL as the service's url
  assert.ok(!JSON.stringify(jsonLdFor('/')['@graph'].find((n) => n['@type'] === 'FAQPage')).includes('social-media-video-production'))
  assert.ok(JSON.stringify(jsonLdFor('/')).includes('social-media-video-production#service'))
  const html = rootOf(page(PATH))
  for (const href of [ORGANIC_PRICING_HREF, '/pricing#packages', '/ugc-video-agency', OFFER_PATHS.roadmap, CREATOR_SHOWCASE_PATH, '/case-studies/graspo']) assert.ok(html.includes(`href="${href}"`), href)
})

test('pricing deep link: /pricing#organic opens the Organic Social packages after mount; the prerendered pricing HTML still starts on Paid', () => {
  const src = read('src/CreativeTestingSprintPage.jsx')
  assert.match(src, /window\.location\.hash !== '#organic'/)
  assert.match(src, /useState\('paid'\)/)
  assert.match(rootOf(page('/pricing')), /id="service-panel-paid"[^>]*data-state="active"/)
  assert.match(rootOf(page('/pricing')), /id="service-panel-organic"[^>]*data-state="inactive"/)
})

test('final CTA: the same system as the other service pages, with the organic headline and the booking button; pricing and founder e-mail are real buttons; the Roadmap flow is untouched', () => {
  const html = rootOf(page(PATH))
  const t = textOf(page(PATH))
  const cta = html.split('id="get-started"')[1]
  assert.ok(t.includes('Ready to turn your ideas into content worth watching?'))
  assert.match(cta, new RegExp(`href="${BOOKING_URL.replace(/[.?]/g, '\\$&')}"[^>]*>Discuss Your Content Strategy`))
  assert.ok(/target="_blank" rel="noopener noreferrer"/.test(cta.match(/<a [^>]*Discuss Your Content Strategy/)?.[0] ?? '') || /target="_blank" rel="noopener noreferrer"[^>]*>Discuss Your Content Strategy/.test(cta), 'opens in a new tab')
  assert.ok(!/Get 5 Free Ad Concepts|Free strategy session|fit check/.test(cta), 'the Roadmap wording is not under the booking button')
  assert.match(cta, /href="\/pricing#packages"[^>]*>See Pricing/)
  assert.match(cta, /href="mailto:[^"]+\?subject=Organic%20social%20video%20production"[^>]*>[\s\S]*Email the Founder/)
  assert.deepEqual(ORGANIC_HERO.primary, { label: 'Discuss Your Content Strategy', href: BOOKING_URL, external: true })
  assert.equal(ORGANIC_PAGE_CTA.primary.href, ORGANIC_HERO.primary.href, 'the hero and the final CTA share one verified destination')
  assert.equal(BOOKING_URL, 'https://calendly.com/mohamed-convrt/30min', 'the existing site-wide booking link, not a new one')
  assert.match(read('src/i18n/cta.js'), /label: 'Get 5 Free Ad Concepts', href: hrefFor\(OFFER_PATHS\.roadmap, locale\)/, 'the global header CTA is untouched (English keeps the Roadmap)')
  // the roadmap application itself is untouched by this page
  assert.match(read('src/lib/roadmapQualification.js'), /QUALIFYING_TIMELINES = \['Immediately \/ This month', 'Within 1–3 months'\]/)
})

// ── architecture and the other pages ─────────────────────────────────────────────────────
test('architecture: the page is assembled from the shared configuration-driven components; nothing large is duplicated; the scene kit is shared', () => {
  const src = read('src/OrganicSocialVideoPage.jsx')
  for (const c of ['UgcHero', 'ProcessSection', 'UgcGallery', 'UgcFAQ', 'UgcFinalCTA', 'SpokespersonProof']) assert.ok(new RegExp(`import[^\\n]*${c}`).test(src), c)
  assert.ok(!/function Headline|function ReelWord|function Item\(/.test(src), 'no second headline, reel or accordion')
  assert.ok(src.split('\n').length < 125, 'a thin page file')
  assert.match(src, /selectOrganicHero/)
  assert.ok(!/selectHero\(|selectGallery\(|selectSpokesperson|selectDisplayable|selectOurWork/.test(src), 'it never reads the other pages\' lists')
  assert.ok(/from '\.\.\/scenes\/sceneKit\.jsx'/.test(read('src/components/spokesperson/SpokespersonScenes.jsx')) && /from '\.\.\/scenes\/sceneKit\.jsx'/.test(read('src/components/organic/OrganicScenes.jsx')))
  assert.ok(!/const Skel =/.test(read('src/components/spokesperson/SpokespersonScenes.jsx')), 'one skeleton primitive, shared')
})

test('UGC and Spokesperson pages unchanged: same H1, reel words, FAQ lengths, proof and defaults', () => {
  const ugc = rootOf(page(PATHS.ugcVideoAgency))
  const ugcT = textOf(page(PATHS.ugcVideoAgency))
  assert.equal(textOf(`<div id="root">${ugc.match(/<h1[\s\S]*?<\/h1>/)[0]}`), 'Human-led UGC ads. Built for paid social. to convrt.')
  assert.ok(ugc.includes('class="ugc-reel text-lime" data-sizer="resonate."'))
  assert.ok(ugcT.includes('5.28x') && ugcT.includes('Elyon Dubai') && ugcT.includes('How we create and test UGC ads.'))
  assert.ok(!/organic-h1|Not just more posts/.test(ugc + ugcT))
  assert.equal(UGC_FAQ.length, 16, '14 + the two Batch 2 FAQs (agency vs hiring creators, how to evaluate an agency)')
  const sp = rootOf(page(PATHS.spokespersonVideoProduction))
  const spT = textOf(page(PATHS.spokespersonVideoProduction))
  assert.equal(textOf(`<div id="root">${sp.match(/<h1[\s\S]*?<\/h1>/)[0]}`), 'Human-led spokesperson videos. Built to communicate. Made to convrt.')
  assert.ok(spT.includes('One message. Different ways to deliver it.') && spT.includes('What to expect') && !/Graspo|Not just more posts/.test(spT))
  assert.ok(sp.includes('id="spokesperson-faq"') && SPOKESPERSON_FAQ.length === 12)
  assert.ok(!/organic-h1/.test(sp))
})

test('accessibility: one H1, headings never skip a level, filter chips are real toggle buttons, secondary text meets contrast, motion respects preferences', () => {
  const html = rootOf(page(PATH))
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
  assert.equal(levels.filter((l) => l === 1).length, 1)
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, `heading level jumps ${levels[i - 1]} → ${levels[i]}`)
  for (const f of ['OrganicScenes', 'ContentSystem', 'OrganicPackages']) {
    const code = read(`src/components/organic/${f}.jsx`)
    for (const line of code.split('\n').filter((l) => /text-ink-subtle/.test(l))) assert.ok(/aria-hidden="true"/.test(line), `${f}: secondary copy must use text-ink-muted`)
  }
  const gal = read('src/components/ugc/UgcGallery.jsx')
  assert.ok(/aria-pressed=\{chip === o\.id\}/.test(gal) && /min-h-\[44px\]/.test(gal) && /role="group"/.test(gal))
  assert.ok(/prefers-reduced-motion: reduce/.test(read('src/components/ugc/creatorVideo.jsx')) && /saveData/.test(read('src/components/ugc/creatorVideo.jsx')))
})
