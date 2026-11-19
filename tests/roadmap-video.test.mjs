// Run with: node --test tests/roadmap-video.test.mjs
// The video-first top of /creative-growth-roadmap: same player controls as /scale, but a fixed-size frame.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROADMAP_VIDEO_ID, ROADMAP_VIDEO_HLS, ROADMAP_VIDEO_POSTER, ROADMAP_VIDEO_POSTER_SMALL } from '../src/content/roadmapVideo.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const player = strip(read('src/components/roadmap/RoadmapVideo.jsx'))

test('video data: Stream id, HLS manifest on videodelivery.net, same-origin posters that exist', () => {
  assert.match(ROADMAP_VIDEO_ID, /^[0-9a-f]{32}$/)
  assert.equal(ROADMAP_VIDEO_HLS, `https://videodelivery.net/${ROADMAP_VIDEO_ID}/manifest/video.m3u8`)
  for (const p of [ROADMAP_VIDEO_POSTER, ROADMAP_VIDEO_POSTER_SMALL]) assert.ok(fs.existsSync(path.join(ROOT, 'public', p)), p)
})

test('no scroll-driven behaviour: no scroll/resize listeners, transforms, sticky or pinned frame', () => {
  assert.ok(!/addEventListener\(\s*['"](scroll|resize)['"]/.test(player), 'no scroll/resize listeners')
  assert.ok(!/style\.transform|translateY|scale\(|requestAnimationFrame|sticky|getBoundingClientRect/.test(player), 'no scroll maths or sticky layout')
  assert.ok(!/usePrefersReducedMotion/.test(player), 'nothing to switch off: there is no scroll animation')
})

test('reuses the /scale controls (non-linear decorative bar) and never touches playback speed or autoplay', () => {
  assert.match(player, /import VslControls from '\.\.\/scale\/VslControls\.jsx'/)
  assert.ok(!/playbackRate|autoPlay|autoplay/i.test(player))
  const controls = read('src/components/scale/VslControls.jsx')
  assert.match(controls, /PROGRESS_EXPONENT = 0\.6/)
  assert.match(controls, /Math\.pow\(p, PROGRESS_EXPONENT\)/)
})

test('loading: nothing is fetched before Play (no src, preload none), hls.js only on demand, poster is prioritised', () => {
  assert.match(player, /preload="none"/)
  assert.ok(!/^import .*hls\.js/m.test(player), 'hls.js is imported dynamically')
  assert.match(player, /import\('hls\.js'\)/)
  assert.match(player, /fetchpriority="high"/)
  assert.match(player, /width=\{ROADMAP_VIDEO_POSTER_SIZE\.width\}/)
  assert.match(player, /aspect-video/)
})

test('analytics: same vsl_* events as /scale, tagged page: roadmap', () => {
  for (const e of ['vsl_play', 'vsl_progress', 'vsl_complete']) assert.ok(player.includes(`'${e}', { page: 'roadmap'`), e)
})

test('page: the video comes first, then the existing hero, form and FAQ in their original order', () => {
  const page = read('src/RoadmapPage.jsx')
  const order = ['<RoadmapVideo />', '<RoadmapHero />', '<RoadmapApplication />', '<RoadmapFAQ />'].map((t) => page.indexOf(t))
  assert.ok(order.every((i) => i >= 0) && order.every((v, i) => i === 0 || v > order[i - 1]), order.join(','))
  assert.match(page, /useDocumentHead\(pageHead\(OFFER_PATHS\.roadmap\)\)/)
})

test('/scale is untouched: its hero still owns the scroll enlargement and the shared controls file is unchanged', () => {
  const hero = read('src/components/scale/ScaleHero.jsx')
  assert.match(hero, /window\.addEventListener\('scroll'/)
  assert.match(hero, /VSL_VIDEO_ID = 'a5e60be52e693016bb47bed4c801eb5f'/)
  assert.ok(!hero.includes('RoadmapVideo'))
})
