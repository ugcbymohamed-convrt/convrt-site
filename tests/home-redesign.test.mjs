// Run with: node --test tests/home-redesign.test.mjs
// English website premium design review #1 (Nov 2026): the connected founder + industry-showcase block and its two closing CTAs, the homepage creator carousel (eight approved English videos),
// the modernised client reviews (faithful excerpts, full originals kept, no invented ratings), the SaaS and Spokesperson hero video order, and that the Spanish homepage and the other pages are unchanged.
// Builds the site once into a temp dir (like tests/prerender.test.mjs).
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { PATHS } from '../src/routes.js'
import { CREATOR_SHOWCASE_PATH, OFFER_PATHS } from '../src/config.js'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../src/lib/siteStats.js'
import {
  PORTFOLIO, selectHomeCreators, selectSaasHero, selectSaasGallery, selectSpokespersonHero, selectSpokespersonGallery, selectHero, selectGallery, selectShowcase,
  portfolioProblems, isDisplayable, orderedBy, HOME_CREATORS_MAX, servesPage,
} from '../src/content/portfolio.js'
import { SAAS_VIDEO_ORDER } from '../src/content/saasPage.js'
import { SPOKESPERSON_VIDEO_ORDER } from '../src/content/spokespersonPage.js'
import { REVIEWS } from '../src/content/reviews.js'
import { SHOWCASE_INDUSTRIES } from '../src/content/homeShowcase.js'
import { pose, poseStyle, shortestDelta, easeInOutCubic, ROTATION_MS } from '../src/lib/rotary.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<!-- -->/g, '')
let tmp, dist
const page = (route) => decode(fs.readFileSync(path.join(dist, route === '/' ? 'index.html' : path.join(route.replace(/^\//, ''), 'index.html')), 'utf8'))
const bodyOf = (h) => h.slice(h.indexOf('<div id="root"'))
const sectionOf = (h, id) => { const i = h.indexOf(`id="${id}"`); const from = h.lastIndexOf('<section', i); return h.slice(from, h.indexOf('</section>', i)) }
const textOf = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-home-redesign-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

// ── 1. founder statement ─────────────────────────────────────────────────────────────────
test('founder statement: "Worked with 500+ clients" with the owner-approved founder disclosure beside the stage; the marquee section keeps only the logos', () => {
  const h = bodyOf(page('/'))
  const clients = sectionOf(h, 'clients')
  assert.ok(!/<h2|<a |founder has worked|Combined professional experience|Become our next client/.test(clients), 'the logo marquee section no longer carries the headline or buttons')
  assert.ok(/aria-label="Brands from the founder&#x27;s professional experience"|aria-label="Brands from the founder's professional experience"/.test(clients) || clients.includes("Brands from the founder"), 'the marquee keeps its founder-experience label')
  const s = sectionOf(h, 'showcase')
  assert.ok(s.includes(`Worked with <span class="block text-lime sm:inline">${CONVRT_STATS.clients} clients</span>`), 'one centred heading (two lines only on a phone), figure from siteStats, lime')
  assert.match(textOf(s), /Founder experience Worked with 500\+ clients/)
  assert.ok(textOf(s).includes(FOUNDER_EXPERIENCE.captionShort) && /^Founder experience across CONVRT Studio and other creative production work\.$/.test(FOUNDER_EXPERIENCE.captionShort))
  // the approved reference carries only the eyebrow, the heading and a short disclosure: none of the former client copy is drawn any more
  const drawn = textOf(s.replace(/<nav aria-label="Client case studies[\s\S]*?<\/nav>/, ''))
  for (const gone of ["Long-form creatives that can't be skipped", 'Aesthetic transitions', 'Explore SaaS video production', 'Full case studies:', '100+ creatives tested', '6 million views']) assert.ok(!drawn.includes(gone), gone)
  assert.ok(!/(500\+ clients (served|of CONVRT)|CONVRT.{0,20}500\+)/i.test(textOf(s)), 'never implies the 500+ clients were all CONVRT clients')
  assert.ok(h.indexOf('id="showcase"') > h.indexOf('id="clients"'))
  const between = h.slice(h.indexOf('</section>', h.indexOf('id="clients"')), h.indexOf('id="showcase"'))
  assert.ok(!/linear-gradient\(to right, transparent 0%/.test(between), 'no SectionDivider between the logos and the founder statement')
})

// ── 2. industry showcase ─────────────────────────────────────────────────────────────────
test('client work: the studio scene with three posters, the client selector in order, destinations of all three clients in the HTML', () => {
  const h = bodyOf(page('/'))
  const s = sectionOf(h, 'showcase')
  assert.ok(!/Work that speaks|for itself\.|Real brands, real budgets|CASE STUDIES|>Case Studies<\/span>/.test(h.replace(/<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/g, '')), 'the old section introduction is gone')
  assert.ok(!/href="#showcase"/.test(h))
  const tabs = [...s.matchAll(/role="tab"[^>]*aria-label="([^"]+)"/g)].map((m) => m[1])
  assert.deepEqual(tabs, ['Adscale, SaaS', 'Elyon Dubai, E-commerce', 'Graspo, Printing'])
  assert.match(s, /role="tablist"/); assert.equal((s.match(/aria-selected="true"/g) || []).length, 1)
  for (const c of SHOWCASE_INDUSTRIES) {
    assert.ok(s.includes(`src="${c.logo.src}"`) && s.includes(`alt="${c.logo.alt}"`), `${c.id}: the real client logo`)
    assert.ok(s.includes(`href="${c.link.href}"`), `${c.id}: destination ${c.link.href} stays in the HTML`)
  }
  for (const href of ['/case-studies/graspo', '/case-studies/elyon', PATHS.saasVideoProduction]) assert.ok(s.includes(`href="${href}"`), href)
  assert.match(s, /<nav aria-label="Client case studies and service page" class="sr-only">/, 'the destinations are a visually hidden client navigation (drawn only when a keyboard user focuses a link)')
  assert.equal((s.match(/role="tabpanel"/g) || []).length, 1, 'the one stage the selector controls')
  // the stage: three videos of the first client, centre one playable, sides only selectable, nothing playing
  assert.match(s, /role="group" aria-roledescription="carousel" aria-label="Adscale videos\./)
  assert.equal((s.match(/aria-label="Play video: /g) || []).length, 1, 'one play button, on the featured video, the hero one')
  assert.equal((s.match(/aria-label="Show video [23] of 3"/g) || []).length, 2)
  assert.ok(!/<video/.test(s) && !/autoplay/i.test(s), 'posters only: no video element or stream on load')
  assert.ok(/>Previous video<\/button>/.test(s) && />Next video<\/button>/.test(s), 'keyboard / screen-reader controls exist (not drawn)')
  assert.equal((s.match(/<img[^>]*width="405"/g) || []).length, 3)
  assert.ok(!/<canvas|<svg[^>]*viewBox="0 0 1436/.test(s), 'the studio is CSS, not an image or canvas')
})

test('studio scene: drawn on the reference grid with CSS only; compact; the three videos have the reference proportions; the podium stays put', () => {
  const env = read('src/components/home/StudioEnvironment.jsx')
  assert.ok(env.includes('const W = 1280') && env.includes('const H = 740') && env.includes('const K = 1.55'), 'the design grid: the reference room scaled for the centred, larger videos')
  assert.ok(!/<img|<canvas|new Image|three|webgl|url\(/i.test(env.replace(/\/\*[\s\S]*?\*\//g, '')), 'no image, canvas, WebGL or external asset')
  for (const k of ['ring light', 'podium, upper tier', 'podium, lower tier', 'floor', 'left wall', 'right wall']) assert.ok(env.includes(k), k)
  assert.ok(!/animation|transition|@keyframes/.test(env), 'the environment never moves (only the videos rotate)')
  const show = read('src/components/home/IndustryShowcase.jsx')
  assert.ok(show.includes('aspect-[1280/740]'), 'the scene keeps one proportion on its own design grid')
  assert.ok(!/xl:absolute|lg:absolute|xl:left-|lg:left-/.test(show), 'no left-text / right-videos split: nothing is placed beside the stage')
  assert.ok(!/100vh|100svh|h-screen|min-h-screen|max-h-\[|overflow-y/.test(show), 'no viewport-height or fixed-height constraint shrinks the section')
  // centred layout: the featured video is 310 px (target 290-320), the side videos 85 % of it (263 px, target 250-280), a modest difference, true 9:16, a clear gap between frames
  const [c, r, l] = [pose(0, 0), pose(1, 0), pose(2, 0)]
  assert.ok(r.scale >= 0.75 && r.scale <= 0.85 && Math.abs(r.x + l.x) < 1e-9 && r.x > 0.8 && r.x < 1.0, `side width ${r.scale}, offset ${r.x}`)
  const featured = 0.25 * 1280
  assert.ok(featured >= 290 && featured <= 320 && featured * r.scale >= 240 && featured * r.scale <= 270, `featured ${featured}, side ${featured * r.scale}: clearly smaller supporting cards (the hero stage uses 80 %), still true portrait`)
  const tuck = 0.5 + 0.5 * r.scale - r.x
  assert.ok(tuck > 0.03 && tuck < 0.12, `each side card tucks slightly (${tuck.toFixed(3)} of a width) behind the featured card, never hiding much of it`)
  assert.ok(c.z > r.z && c.z > l.z && c.z === 100, 'the featured card is the front layer')
  assert.ok(r.shade > c.shade && r.shade <= 0.35, 'the supporting cards recede')
  assert.equal(r.scaleY, r.scale, 'frames are never squashed: uniform scale keeps them true 9:16 (no short, fat side cards)')
  assert.ok(r.y === 0 && l.y === 0 && c.y === 0, 'all three cards share one top line and one baseline')
  const stage = read('src/components/home/RotaryStage.jsx')
  assert.ok(stage.includes("width: '25%'") && stage.includes("left: '50%'"), 'the featured video: 320 of the 1280 px grid, on the centre axis')
  assert.ok((stage.match(/aspect-\[9\/16\]/g) || []).length >= 2 && !/9\/15/.test(stage), 'every frame is exactly 9:16')
  // below 640 px the scene is shown larger than the screen and centred on the stage (never shrunk to fit)
  assert.ok(show.includes('w-[230vw]') && show.includes('sm:w-[max(100%,900px)]') && show.includes('-translate-x-1/2'))
  // the podium and background are a separate layer from the rotating videos
  assert.ok(!/StudioEnvironment/.test(read('src/components/home/RotaryStage.jsx')))
})


test('rotary stage maths: the centre video is upright and largest, the sides sit left and right, a rotation follows a curved orbit and passes the third video behind', () => {
  const at = (pos) => [0, 1, 2].map((i) => pose(i, pos))
  const [a, b, c] = at(0)
  assert.deepEqual([a.x, a.rot, a.scale, a.z], [0, 0, 1, 100], 'centre: upright, full size, in front')
  assert.ok(b.x > 0.8 && c.x < -0.8 && Math.abs(b.x + c.x) < 1e-9, 'next video right, previous video left, symmetric')
  assert.ok(b.scale < 1 && b.scale > 0.7 && b.z < a.z && b.rot < 0 && c.rot > 0 && Math.abs(b.rot) < 30, 'sides: smaller, farther back, tilted toward the centre')
  assert.ok(b.shade <= 0.35 && a.shade === 0, 'sides are only gently dimmed')
  // every integer position is a clean arrangement with three distinct slots (no duplicated or overlapping video)
  for (const pos of [0, 1, 2]) {
    const p = at(pos)
    assert.equal(p.filter((x) => Math.abs(x.x) < 1e-9 && x.rot === 0 && x.scale === 1).length, 1, `pos ${pos}: exactly one active video`)
    assert.equal(new Set(p.map((x) => x.z)).size, 2, `pos ${pos}: one front, two equal-depth sides`)
    assert.ok(p[pos].z === 100 && p.filter((x) => x.x > 0.8).length === 1 && p.filter((x) => x.x < -0.8).length === 1)
  }
  // rotating toward the right-hand video (position 0 -> 1): it must move along a CURVE, not a straight line
  const start = pose(1, 0), end = pose(1, 1), mid = pose(1, 0.5)
  const lerp = (u, v) => (u + v) / 2
  assert.ok(Math.abs(mid.x - lerp(start.x, end.x)) > 0.3, 'sideways travel is not linear')
  assert.ok(mid.scale >= lerp(start.scale, end.scale) && mid.z > start.z, 'it comes forward on the way in')
  // the previous centre video swings out to the left in FRONT of the left slot, and the third video passes behind everything
  const out = pose(0, 0.5)
  assert.ok(out.x < -0.8 && out.z > pose(0, 1).z, 'the old centre video orbits out and settles back')
  const behind = pose(2, 0.5)
  assert.equal(behind.z, 0); assert.ok(behind.z < Math.min(pose(0, 0.5).z, pose(1, 0.5).z), 'the third video passes behind')
  // the rotation is continuous and returns to the same arrangement every full turn
  for (const i of [0, 1, 2]) assert.deepEqual(poseStyle(pose(i, 0)), poseStyle(pose(i, 3)), `video ${i}: a full turn returns to the same pose`)
  assert.ok(poseStyle(pose(0, 0)).transform.endsWith('scale(1, 1) rotateY(0deg)') && !/NaN|undefined/.test(poseStyle(pose(1, 0.37)).transform))
})

test('rotary stage logic: shortest direction, ease-in-out, 550-750 ms, and a click mid-rotation retargets from the current position', () => {
  assert.equal(shortestDelta(0, 1, 3), 1); assert.equal(shortestDelta(0, 2, 3), -1); assert.equal(shortestDelta(1, 0, 3), -1); assert.equal(shortestDelta(2, 0, 3), 1); assert.equal(shortestDelta(1, 1, 3), 0)
  assert.ok(Math.abs(shortestDelta(0.4, 2, 3)) <= 1.5, 'from a position part-way through a rotation the nearest way round is still taken')
  assert.equal(easeInOutCubic(0), 0); assert.equal(easeInOutCubic(1), 1); assert.equal(easeInOutCubic(0.5), 0.5)
  assert.ok(easeInOutCubic(0.1) < 0.1 && easeInOutCubic(0.9) > 0.9, 'slow start, slow finish')
  assert.ok(ROTATION_MS >= 550 && ROTATION_MS <= 750)
  const src = read('src/components/home/RotaryStage.jsx')
  assert.ok(src.includes('cancelAnimationFrame(raf.current)') && src.includes('const from = posRef.current'), 'a new selection cancels the running tween and continues from the current position')
  assert.ok(src.includes('activeRef.current = t') && src.includes("matchMedia?.('(prefers-reduced-motion: reduce)')"), 'latest selection wins; reduced motion changes at once')
  const apply = src.slice(src.indexOf('const apply = useCallback'), src.indexOf('const select = useCallback'))
  assert.ok(/style\.transform/.test(apply) && !/style\.(width|height|top|left|margin)/.test(apply), 'only transform, z-index and opacity change per frame (no layout)')
  // playback: the stream is attached only after a press on the centre video, rotating away pauses, side videos cannot be played
  assert.ok(/if \(!armed\) return undefined/.test(src) && /useEffect\(\(\) => \{ if \(!active\) \{ ref\.current\?\.pause\?\.\(\); userPaused\.current = true \} \}, \[active\]\)/.test(src))
  assert.ok(src.includes("import { HeroPlayerControls } from '../ugc/CreatorVideoStage.jsx'") && /\{active && !moving && \(\s*<HeroPlayerControls/.test(src), 'the active video carries the hero player UI')
  assert.ok(/\{!active && \(\s*<button[\s\S]{0,200}onClick=\{onSelect\}/.test(src) && !/\bcontrols=/.test(src), 'side videos only select; no native controls, no second control design')
  assert.ok(/IntersectionObserver/.test(src) && /v\.pause\(\)/.test(src), 'paused when out of view')
  assert.ok(!/\bautoPlay\b=|<video[^>]*\bautoplay\b/i.test(src), 'no autoplay attribute on any video: starting by itself is explicit logic (see the play-when-reached test)')
})

test('industry showcase data: Adscale is the verified SaaS client (no invented case study or result); every industry has exactly its three client videos', () => {
  assert.deepEqual(SHOWCASE_INDUSTRIES.map((c) => [c.label, c.client, c.clientId]), [['SaaS', 'Adscale', 'adscale'], ['E-commerce', 'Elyon Dubai', 'elyon'], ['Printing', 'Graspo', 'graspo']])
  const saas = SHOWCASE_INDUSTRIES[0]
  assert.equal(saas.link.href, PATHS.saasVideoProduction, 'Adscale has no case-study page: the link goes to the SaaS service page')
  assert.ok(!/\/case-studies\/adscale|adscale-case/.test(JSON.stringify(SHOWCASE_INDUSTRIES)))
  assert.ok(!/\d/.test(saas.headline + saas.text), 'no figure is claimed for Adscale')
  assert.equal(SHOWCASE_INDUSTRIES[1].link.href, '/case-studies/elyon'); assert.equal(SHOWCASE_INDUSTRIES[2].link.href, '/case-studies/graspo')
  for (const c of SHOWCASE_INDUSTRIES) assert.ok(selectShowcase(c.clientId).length >= 3, c.id)
  const src = read('src/components/home/IndustryShowcase.jsx')
  assert.ok(!/cloudflareId|videodelivery/.test(src) && !/cloudflareId|videodelivery/.test(read('src/content/homeShowcase.js')), 'no video is copied into a component: they come from portfolio.js')
})

// ── 3. the two closing CTAs ──────────────────────────────────────────────────────────────
test('CTAs: "Become our next client" and "I\'m a creator" sit under the client selector with the same destinations, larger than before', () => {
  const h = bodyOf(page('/'))
  const s = sectionOf(h, 'showcase')
  assert.match(s, new RegExp(`<a href="${OFFER_PATHS.roadmap}"[^>]*cta-gradient[^>]*>[\\s\\S]*?Become our next client`))
  assert.match(s, /<a href="https:\/\/forms\.gle\/Bg8ubU2tnmMj88m7A" target="_blank" rel="noopener noreferrer"[^>]*>[\s\S]*?I'm a creator/)
  assert.ok(s.indexOf('Become our next client') > s.indexOf('role="tablist"'), 'the buttons come after the client selector')
  assert.equal((h.match(/Become our next client/g) || []).length, 1); assert.equal((h.match(/I'm a creator/g) || []).length, 1)
  assert.match(s, /min-h-\[58px\] px-9 text-base/, 'large equal-height pills, moderately larger than the old px-6 py-3 text-sm')
})

test('centred composition: eyebrow, headline, disclosure, then the stage, the selector and the buttons, in this order, on one axis', () => {
  const s = sectionOf(bodyOf(page('/')), 'showcase')
  const at = (needle) => { const i = s.indexOf(needle); assert.ok(i >= 0, needle); return i }
  const order = [at('Founder experience'), at('id="showcase-heading"'), at(FOUNDER_EXPERIENCE.captionShort), at('id="showcase-stage"'), at('role="tablist"'), at('Become our next client'), at("I'm a creator")]
  assert.deepEqual([...order].sort((a, b) => a - b), order)
  assert.match(s.slice(0, s.indexOf('id="showcase-stage"')), /text-center/, 'the text block is centred')
  assert.ok(/mx-auto -mt-\[27vw\][^"]*max-w-\[42rem\]/.test(s) && /sm:-mt-\[min\(max\(11\.7vw,105px\),150px\)\]/.test(s), 'the selector is centred and tucked against the podium')
})

test('polish: equal-height side cards, a lime backlight behind the featured video, the hero player UI, a larger brand selector, more room above the buttons', () => {
  const stage = read('src/components/home/RotaryStage.jsx')
  assert.ok(/h-\[134%\] w-\[164%\]/.test(stage) && /filter: 'blur\(28px\)'/.test(stage) && /zIndex: 55/.test(stage), 'a wide soft lime aura behind the featured card')
  assert.ok(/h-\[105%\] w-\[105%\]/.test(stage) && /border: '7px solid rgba\(213,255,64,0\.9\)'/.test(stage) && /0 0 40px 8px rgba\(213,255,64,0\.48\)/.test(stage) && /zIndex: 60/.test(stage), 'a lime LED ring hugging the card edges, blurred, with an outer glow: a real halo around the top, sides and corners')
  assert.ok(/0 0 20px 3px rgba\(213,255,64,0\.6\)/.test(stage) && /0 0 54px 5px rgba\(213,255,64,0\.3\)/.test(stage) && /0 40px 60px -20px rgba\(0,0,0,1\)/.test(stage), 'the featured frame itself carries a lime edge glow and a dark depth shadow')
  assert.ok(read('src/components/home/IndustryShowcase.jsx').includes('overflow-hidden pt-10'), 'headroom above the stage: the halo is not clipped at the top')
  assert.ok(stage.indexOf('active-video backlight') < stage.indexOf('items.map((item, i) => ('), 'the glow is drawn before (behind) the videos')
  // the hero player UI is ONE component, used by the homepage hero's stage and by this stage
  const hero = read('src/components/ugc/CreatorVideoStage.jsx')
  assert.ok(hero.includes('export function HeroPlayerControls') && hero.includes('<HeroPlayerControls item={item}'), 'the hero stage renders its controls through the shared component')
  assert.ok(/ugc-seek/.test(hero.slice(hero.indexOf('export function HeroPlayerControls'), hero.indexOf('/* One phone.'))) && /bg-black\/55 py-1\.5 pl-1\.5 pr-1\.5 backdrop-blur-md/.test(hero))
  const h = bodyOf(page('/'))
  const s = sectionOf(h, 'showcase')
  assert.match(s, /aria-label="Play video: [^"]*"/, 'the same play button (and label) as the hero')
  assert.match(s, /aria-label="Seek video"[^>]*class="ugc-seek min-w-0 flex-1"/, 'the hero seek bar')
  assert.match(s, /aria-label="Turn sound (on|off)"/)
  // brand selector: larger logos and labels, taller cards
  const show = read('src/components/home/IndustryShowcase.jsx')
  assert.ok(show.includes('calc(var(--lh)*1.65)') && show.includes('sm:text-[15px]') && show.includes('sm:min-h-[122px]') && show.includes('max-w-[42rem]'), 'larger logos, industry labels and cards')
  assert.ok(show.includes('mt-12 px-5 md:mt-16'), 'the buttons sit clearly lower than the selector')
})

test('interaction: the control bar shows on hover, focus or once started (never permanently before); side videos are selectable with a visible hover state; the hero is unchanged', () => {
  const stage = read('src/components/home/RotaryStage.jsx')
  assert.ok(/const BAR_UNTIL_STARTED = 'pointer-events-none opacity-0 [^']*group-hover:opacity-100[^']*group-focus-within:opacity-100'/.test(stage), 'hidden with opacity only (so it stays keyboard-reachable), shown on hover and on focus-within')
  assert.ok(stage.includes("barClass={armed ? '' : BAR_UNTIL_STARTED}"), 'once the video has been started the bar is permanent (touch screens: the big play button starts it)')
  assert.ok(/hover:bg-lime\/\[0\.07\]/.test(stage) && /cursor-pointer/.test(stage) && /onClick=\{onSelect\}/.test(stage), 'a side video shows it is selectable and a click brings it to the centre (the halo stays on the centre slot)')
  // the shared controls take the class as an option and default to the unchanged hero markup
  const hero = read('src/components/ugc/CreatorVideoStage.jsx')
  assert.ok(hero.includes("barClass = ''") && hero.includes('${barClass}`.trim()'))
  assert.ok(!hero.includes('BAR_UNTIL_STARTED'), 'the hero stage never hides its bar')
  const h = bodyOf(page('/'))
  const s = sectionOf(h, 'showcase')
  assert.match(s, /class="absolute inset-x-3 bottom-3\.5 z-20 md:inset-x-4 md:bottom-5 pointer-events-none opacity-0 /, 'the featured card\'s bar is hidden until hover, focus or start')
  const home = h.replace(s, '')
  assert.ok(!/pointer-events-none opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover/.test(home), 'the homepage hero bar is untouched')
})

test('play when reached: the front Adscale video starts muted when the stage is scrolled into view, only that one, only once, never against the visitor; the three posters are the owner-supplied frames', () => {
  const stage = read('src/components/home/RotaryStage.jsx')
  assert.ok(/autoMode=\{autoPlayOnView && autoAllowed && i === 0\}/.test(stage), 'only the first (front) video, only when asked, never for reduced-motion / data-saver visitors')
  assert.ok(/threshold: 0\.35/.test(stage) && /setInView\(e\.isIntersecting\)/.test(stage), 'triggered by the stage reaching the screen')
  assert.ok(/inView && autoMode && !armed && !autoStarted\.current/.test(stage) && /autoStarted\.current = true\s+setMuted\(true\)\s+setArmed\(true\)/.test(stage), 'started once, muted')
  assert.ok(/v\.muted = muted/.test(stage.slice(stage.indexOf('useEffect(() => {\n    if (!armed) return undefined'))), 'the muted state is applied before play()')
  assert.ok(/userPaused\.current = true/.test(stage) && /!userPaused\.current && v\.paused/.test(stage), 'a visitor pause (or rotating away) is never overridden')
  assert.ok(read('src/components/home/IndustryShowcase.jsx').includes('autoPlayOnView={!visitorChose}'), 'once the visitor picks another client nothing starts by itself')
  // server HTML: still posters only (nothing downloads or plays before the visitor gets there)
  const s = sectionOf(bodyOf(page('/')), 'showcase')
  assert.ok(!/<video/.test(s))
  // the exact frames the owner supplied
  assert.deepEqual(selectShowcase('adscale').map((v) => v.homeStagePoster), ['/showcase/adscale-jail-poster.webp', '/showcase/adscale-coffee-poster.webp', '/showcase/adscale-women-poster.webp'])
  assert.deepEqual(selectShowcase('adscale').map((v) => v.poster), [undefined, '/showcase/adscale-agentic-poster.webp', '/showcase/adscale-creator-poster.webp'], 'the Spanish homepage keeps its posters')
  for (const f of ['jail', 'coffee', 'women']) {
    const buf = fs.readFileSync(path.join(ROOT, `public/showcase/adscale-${f}-poster.webp`))
    assert.equal(buf.toString('ascii', 0, 4), 'RIFF'); assert.equal(buf.toString('ascii', 8, 12), 'WEBP')
  }
  for (const f of ['jail', 'coffee', 'women']) assert.ok(s.includes(`/showcase/adscale-${f}-poster.webp`), f)
  assert.ok(s.indexOf('adscale-jail-poster.webp') < s.indexOf('adscale-coffee-poster.webp') && s.indexOf('adscale-jail-poster.webp') < s.indexOf('adscale-women-poster.webp'), 'the jail video is the front (first) one')
})

// ── 4. page order ────────────────────────────────────────────────────────────────────────
test('homepage narrative: credibility → client work → services → process → creators → reviews → conversion', () => {
  const h = bodyOf(page('/'))
  const at = (id) => h.indexOf(`id="${id}"`)
  const order = ['clients', 'showcase', 'services', 'how-it-works', 'home-creators', 'testimonials'].map(at)
  assert.ok(order.every((i) => i > 0), JSON.stringify(order))
  assert.deepEqual([...order].sort((a, b) => a - b), order)
  assert.ok(h.indexOf('id="faq"') > order.at(-1))
})

// ── 5. creator carousel ──────────────────────────────────────────────────────────────────
test('creator carousel: eight approved, English-confirmed, distinct videos in the shared gallery; nothing is a placeholder; no stream starts on load', () => {
  const v = selectHomeCreators()
  assert.equal(v.length, HOME_CREATORS_MAX); assert.equal(HOME_CREATORS_MAX, 8)
  assert.equal(new Set(v.map((x) => x.id)).size, 8)
  assert.equal(new Set(v.map((x) => x.source.cloudflareId)).size, 8, 'no footage twice')
  assert.equal(new Set(v.map((x) => x.creatorId)).size, 8, 'no creator twice (by recorded id)')
  for (const x of v) {
    assert.deepEqual(portfolioProblems(x), [], x.id)
    assert.ok(isDisplayable(x) && x.approval.portfolioUse === true && x.approval.creatorConsent === true && x.approval.status === 'approved', x.id)
    assert.ok((x.languages ?? []).includes('en'), `${x.id}: language confirmed English`)
    assert.ok(!(x.onlyIn ?? []).includes('es') && x.source.cloudflareId, x.id)
  }
  assert.deepEqual(v.map((x) => x.homeCreator), [1, 2, 3, 4, 5, 6, 7, 8])
  // the owner-flagged ones stay out: the on-hold health-slate video and the one with doubtful spoken language; a duplicate of the SaaS footage
  for (const id of ['creator-05', 'ugc-gal-5', 'ugc-hero-1']) assert.ok(!v.some((x) => x.id === id), id)
  const h = bodyOf(page('/'))
  const s = sectionOf(h, 'home-creators')
  assert.equal((s.match(/<li class="w-\[66%\]/g) || []).length, 8)
  assert.match(textOf(s), /Real creators\. Real presence\. Ready for your brand\./)
  assert.ok(textOf(s).includes('Explore the people and creative styles behind our videos.'))
  assert.ok(!textOf(s).includes('not necessarily productions by CONVRT'), 'the standing disclaimer is removed (owner, 2026-11-24)')
  assert.ok(!/Creator · EN/.test(textOf(s)), 'no generic creator/language pill on the cards')
  assert.ok(!/<video/.test(s), 'poster first: no video element or stream until a tap')
  assert.match(s, new RegExp(`<a href="${CREATOR_SHOWCASE_PATH}"[^>]*>\\s*Explore All Creators`))
  // all selected videos live in portfolio.js and stay valid for the Creator Showcase
  for (const x of v) assert.ok(PORTFOLIO.includes(x))
})

test('creator carousel: the code is split off the homepage entry bundle and nothing new is autoplayed', () => {
  assert.match(read('src/App.jsx'), /const HomeCreators = lazy\(\(\) => import\('\.\/components\/home\/HomeCreators\.jsx'\)\)/)
  const src = read('src/components/home/IndustryShowcase.jsx') + read('src/components/home/HomeCreators.jsx') + read('src/components/home/ClientReviews.jsx')
  assert.ok(!/\bautoPlay\b|autoplay|\.play\(\)/.test(src), 'no autoplay in the new homepage sections (the shared Player starts only after a tap)')
})

// ── 6. reviews ───────────────────────────────────────────────────────────────────────────
test('reviews: editorial feature with one featured quote and a client list; faithful excerpts, complete originals preserved verbatim, no stars or invented credibility', () => {
  const ORIGINAL = {
    elyon: "Mohamed understood the concept really well and actually exceeded my expectations with the quality. The videos are high quality, delivered on time, and the communication throughout was excellent. I've already ordered again, looking forward to continuing this partnership.",
    adscale: "Working with Mohamad was an absolute pleasure. He's professional, creative, and truly understands what makes content perform. The UGC videos he created were exactly what we needed to scale our ads. We've already come back for a second order and plan to continue working together long-term.",
    talk360: "The videos are amazing again. Every time we work together the quality just keeps getting better. Fast delivery, great communication, and the content performs exactly the way we need it to. This is our third order and it won't be the last.",
  }
  assert.deepEqual(REVIEWS.map((r) => r.brand).sort(), ['Adscale', 'Elyon Dubai', 'Talk360'])
  assert.deepEqual(REVIEWS.map((r) => r.category).sort(), ['Luxury Fragrance · E-commerce', 'Mobile App · International', 'SaaS · Paid Social'])
  for (const r of REVIEWS) {
    assert.equal(r.full, ORIGINAL[r.id], `${r.id}: the full original is unchanged`)
    assert.ok(r.full.includes(r.excerpt), `${r.id}: the excerpt is a verbatim part of the original`)
    assert.ok(r.excerpt.includes(r.highlight), `${r.id}: the highlight is a verbatim part of the excerpt`)
    assert.ok(/ordered again|second order|third order/.test(r.full) && r.repeat === true, `${r.id}: the repeat relationship is documented in the review itself`)
    assert.ok(!('stars' in r) && !('rating' in r) && !('url' in r))
  }
  assert.equal(REVIEWS.find((r) => r.id === 'adscale').excerpt, 'The UGC videos he created were exactly what we needed to scale our ads.')
  assert.equal(REVIEWS.find((r) => r.id === 'adscale').highlight, 'scale our ads')
  const h = bodyOf(page('/'))
  const s = sectionOf(h, 'testimonials')
  const t = textOf(s)
  // one featured quote (Adscale first, as in the reference); the other two are in the page but invisible and inert
  assert.equal((s.match(/role="tabpanel"/g) || []).length, 3); assert.equal((s.match(/ inert=""/g) || []).length, 2)
  assert.ok(s.includes('<span class="text-lime">scale our ads</span>'))
  assert.deepEqual([...s.matchAll(/role="tab"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/g)].map((m) => m[1]), ['Adscale', 'Elyon Dubai', 'Talk360'])
  assert.equal((s.match(/aria-selected="true"/g) || []).length, 1)
  assert.ok(s.indexOf('id="review-panel-adscale"') < s.indexOf('id="review-panel-elyon"'))
  for (const r of REVIEWS) { assert.ok(t.includes(`“${r.excerpt}”`), r.id); assert.ok(t.includes(r.full), `${r.id}: the full review is in the page (behind "Read full review")`) }
  assert.equal((s.match(/<details/g) || []).length, 3); assert.equal((t.match(/Read full review/g) || []).length, 3)
  assert.equal((t.match(/Repeat client/g) || []).length, 3)
  assert.match(textOf(h.slice(h.indexOf('id="reviews-heading"'), h.indexOf('id="reviews-heading"') + 200)), /Great work\. Strong relationships\. Repeat collaborations\./)
  assert.ok(/class="sr-only"/.test(s.slice(s.indexOf('<h2'), s.indexOf('<h2') + 120)), 'the heading is kept for the page outline but visually hidden, as in the reference')
  assert.ok(/<svg[^>]*viewBox="0 0 128 92"/.test(s) && /font-editorial/.test(s), 'oversized vector opening mark and the editorial serif')
  assert.ok(!/rv-card|rounded-\[28px\] border/.test(s), 'no cards')
  assert.ok(!/<path d="M8 1\.25l1\.74/.test(s) && !/★|stars?\b/i.test(t), 'no star graphics: no rating source is on record')
  assert.ok(!/50%\+|returning|retention|verified|Trustpilot|Google reviews?|G2|Clutch|\d+ reviews/i.test(t), 'no new statistic, platform or verification claim')
  assert.ok(!/aggregateRating|"@type":"Review"/.test(h), 'no review markup')
  assert.match(read('tailwind.config.js'), /editorial: \[/)
  assert.ok(!fs.existsSync(path.join(ROOT, 'public/fonts/editorial.woff2')), 'no font file was added: the serif is a system stack')
})

// ── 7. service-page hero order ───────────────────────────────────────────────────────────
test('SaaS page: the founder presenter video is the featured centre hero video; the previous featured example is the THIRD gallery video; nothing duplicated or lost', () => {
  const hero = orderedBy(selectSaasHero(), SAAS_VIDEO_ORDER.hero).map((x) => x.id)
  const gallery = orderedBy(selectSaasGallery(), SAAS_VIDEO_ORDER.gallery).map((x) => x.id)
  assert.deepEqual(hero, ['spokesperson-gal-1', 'saas-creator-2', 'creator-04'])
  assert.deepEqual(gallery, ['spokesperson-gal-3', 'spokesperson-hero-1', 'saas-creator-1', 'creator-15', 'creator-10'])
  assert.equal(gallery[2], 'saas-creator-1')
  assert.equal(new Set([...hero, ...gallery]).size, hero.length + gallery.length, 'no video twice on the page')
  // the same eight videos as before, only moved: the old hero [saas-creator-1, saas-creator-2, creator-04] and old gallery [spokesperson-gal-1, -gal-3, -hero-1, creator-15, creator-10]
  assert.deepEqual([...hero, ...gallery].sort(), ['creator-04', 'creator-10', 'creator-15', 'saas-creator-1', 'saas-creator-2', 'spokesperson-gal-1', 'spokesperson-gal-3', 'spokesperson-hero-1'])
  // no new Cloudflare asset: the founder video is the existing spokesperson-gal-1 entry, still a Spokesperson-page video as well
  const f = PORTFOLIO.find((x) => x.id === 'spokesperson-gal-1')
  assert.equal(f.source.cloudflareId, 'e767742bb12024437e9df368cedbfba2'); assert.equal(f.type, 'spokesperson'); assert.equal(f.alsoOn.saas, 'hero')
  assert.equal(PORTFOLIO.filter((x) => x.source.cloudflareId === f.source.cloudflareId).length, 1)
  const s = PORTFOLIO.find((x) => x.id === 'saas-creator-1'); assert.equal(s.placement, 'gallery'); assert.equal(s.source.cloudflareId, '80fc999238285c7f73757c78d9bcd8e7')
  // built page: the featured (first) hero phone's poster is the founder video; the gallery lists the previous example third
  const h = bodyOf(page(PATHS.saasVideoProduction))
  const heroAlts = [...h.slice(0, h.indexOf('id="saas-videos"')).matchAll(/<img[^>]*alt="([^"]+)"[^>]*width="540"/g)].map((m) => m[1])
  assert.equal(heroAlts[0], 'Presenter-Led Software Explainer With Screen Footage.', heroAlts.join(' | '))
  const plays = [...h.slice(h.indexOf('id="saas-videos"')).matchAll(/aria-label="Play video: ([^"]+)"/g)].map((m) => m[1])
  assert.equal(plays[2], 'Creator at Desk — File Management App Demo.', plays.join(' | '))
  assert.equal(plays.length, 5)
})

test('Spokesperson page: the dark-haired presenter is the featured centre hero video; the other hero videos and the gallery keep their order and assets', () => {
  const hero = orderedBy(selectSpokespersonHero(), SPOKESPERSON_VIDEO_ORDER.hero).map((x) => x.id)
  assert.deepEqual(hero, ['spokesperson-hero-2', 'spokesperson-hero-1', 'spokesperson-hero-3'])
  assert.deepEqual(selectSpokespersonGallery().map((x) => x.id), ['spokesperson-gal-1', 'spokesperson-gal-2', 'spokesperson-gal-3', 'spokesperson-gal-4'])
  assert.deepEqual(['spokesperson-hero-1', 'spokesperson-hero-2', 'spokesperson-hero-3'].map((id) => PORTFOLIO.find((x) => x.id === id).source.cloudflareId), ['b3db228064bde5cd076d22d9c938c2b0', 'c0c30e58489e' + PORTFOLIO.find((x) => x.id === 'spokesperson-hero-2').source.cloudflareId.slice(12), '0d3a810ee068bd311f13ffd4d7a7f3d6'])
  const h = bodyOf(page(PATHS.spokespersonVideoProduction))
  const alts = [...h.slice(0, h.indexOf('id="spokesperson-videos"')).matchAll(/<img[^>]*alt="([^"]+)"[^>]*width="540"/g)].map((m) => m[1])
  assert.equal(alts[0], 'Presenter — Book Recommendations With On-Screen Covers.', alts.join(' | '))
  assert.equal(alts.length, 3)
})

test('the UGC page and the shared file order are untouched by the ordering helper (orderedBy only reorders what a page lists)', () => {
  assert.deepEqual(orderedBy([{ id: 'a' }, { id: 'b' }, { id: 'c' }], ['c']).map((x) => x.id), ['c', 'a', 'b'])
  assert.deepEqual(orderedBy([{ id: 'a' }, { id: 'b' }], ['zz', 'b']).map((x) => x.id), ['b', 'a'])
  assert.deepEqual(orderedBy([{ id: 'a' }, { id: 'b' }]).map((x) => x.id), ['a', 'b'])
  assert.deepEqual(selectHero().map((x) => x.id), ['ugc-hero-1', 'ugc-hero-2', 'ugc-hero-3'])
  assert.ok(!selectGallery().some((x) => x.id === 'saas-creator-1' || x.id === 'spokesperson-gal-1'), 'the SaaS reorder never leaks into the UGC page')
  assert.ok(servesPage(PORTFOLIO.find((x) => x.id === 'spokesperson-gal-1'), 'spokesperson'))
  assert.ok(portfolioProblems({ ...PORTFOLIO[0], homeCreator: 0 }).length && portfolioProblems({ ...PORTFOLIO[0], homeCreator: 'a' }).length)
  assert.deepEqual(portfolioProblems({ ...PORTFOLIO.find((x) => x.id === 'ugc-gal-1'), homeCreator: 2 }), [])
})

// ── 8. Spanish and the other pages ───────────────────────────────────────────────────────
test('Spanish homepage (Nov 2026 revision): the SAME client stage and review design as English with Spanish text; no creator carousel; the verbatim English reviews stay', () => {
  const h = bodyOf(page('/es'))
  assert.ok(h.includes('id="showcase"') && h.includes('id="testimonials"') && h.includes('role="tablist"') && h.includes('showcase-stage'), 'the redesigned stage, selector and reviews')
  assert.ok(!/Proyectos que hablan|Quiero anuncios como estos|home-creators|Real creators/.test(h), 'none of the old Spanish case-study panels, and no creator carousel (not requested for Spanish)')
  const t = textOf(h)
  assert.ok(t.includes('Experiencia del fundador') && /Ha trabajado con\s+500\+\s+clientes/.test(t))
  assert.ok(t.includes('Opiniones de clientes'))
  // the review wording is the same source, unchanged: the clients' own English words (lang="en"), complete behind "Leer la opinión completa"
  assert.ok(t.includes('Leer la opinión completa'))
  for (const r of REVIEWS) assert.ok(t.includes(r.full) && t.includes(r.excerpt), r.id)
  assert.equal((h.match(/<figure[^>]*role="tabpanel"/g) || []).length, 3)
})

test('SEO and structure are untouched: homepage head and JSON-LD carry no review, rating or video markup; the case-study pages are still linked', () => {
  const html = page('/')
  const head = html.slice(0, html.indexOf('</head>'))
  assert.ok(!/aggregateRating|"Review"|VideoObject/.test(head + [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('')))
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'one H1')
  for (const p of ['/case-studies/graspo', '/case-studies/elyon']) assert.ok(fs.existsSync(path.join(dist, p.slice(1), 'index.html')), p)
})

test('motion and accessibility: the new animations are off for prefers-reduced-motion; tabs, stage, carousel and disclosure are keyboard-operable', () => {
  const css = read('src/index.css')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.sc-panel-in \{ animation: none; \}/)
  assert.ok(!/\.rv-card/.test(css), 'the old review-card styles are gone')
  const showcase = read('src/components/home/IndustryShowcase.jsx')
  for (const k of ["'tablist'", 'role="tab"', 'aria-selected', 'ArrowRight: 1', "matchMedia?.('(prefers-reduced-motion: reduce)')", 'motion-reduce:']) assert.ok(showcase.includes(k), k)
  const stage = read('src/components/home/RotaryStage.jsx')
  for (const k of ["e.key === 'ArrowRight'", "e.key === 'ArrowLeft'", 'tabIndex={0}', 'aria-roledescription="carousel"', 'onPointerUp', 'motion-reduce:']) assert.ok(stage.includes(k), k)
  const reviews = read('src/components/home/ClientReviews.jsx')
  for (const k of ['role="tablist"', 'role="tab"', 'ArrowDown: 1', '<details', '<summary', 'motion-reduce:transition-none', 'duration-300']) assert.ok(reviews.includes(k), k)
})
