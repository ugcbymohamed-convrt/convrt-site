// Run with: node --test tests/video-posters.test.mjs
// Video posters: one chosen frame per Cloudflare Stream video, kept in ONE place (src/content/posterFrames.js) and used everywhere the video appears.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PORTFOLIO, posterUrl } from '../src/content/portfolio.js'
import { HOME_HERO, HOME_HERO_ES } from '../src/content/homeHero.js'
import { POSTER_FRAMES, streamPoster } from '../src/content/posterFrames.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

test('every chosen frame is a valid second for a 32-character Stream id; no duplicates', () => {
  const ids = Object.keys(POSTER_FRAMES)
  assert.equal(ids.length, new Set(ids).size)
  assert.ok(ids.length >= 60, `${ids.length} videos have a chosen frame`)
  for (const [id, t] of Object.entries(POSTER_FRAMES)) {
    assert.match(id, /^[0-9a-f]{32}$/, id)
    assert.ok(Number.isFinite(t) && t >= 0 && t < 600, `${id}: ${t}`) // 0 = the first frame (a deliberate choice: the owner's jail frame)
  }
})

test('every Stream video with a same-origin poster has a chosen frame and a real image file; the same video shows the same poster wherever it appears', () => {
  const byId = new Map()
  for (const v of [...PORTFOLIO, ...HOME_HERO, ...HOME_HERO_ES]) {
    const id = v.source?.cloudflareId
    if (!id) continue // the self-hosted Adscale clip is not on Stream: it keeps its own poster
    assert.ok(id in POSTER_FRAMES, `${v.id}: no chosen frame for ${id}`)
    if (v.poster) {
      assert.ok(fs.existsSync(path.join(ROOT, 'public', v.poster)), `${v.id}: ${v.poster} exists`)
      const seen = byId.get(id)
      if (seen) assert.equal(v.poster, seen, `${v.id}: another entry of the same video uses a different poster`)
      byId.set(id, v.poster)
    }
  }
})

test('Stream thumbnails read the chosen time; the homepage client panels, both case studies and /scale no longer use the first frame', () => {
  const id = Object.keys(POSTER_FRAMES)[0]
  assert.equal(streamPoster(id, { height: 600 }), `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg?time=${POSTER_FRAMES[id]}s&height=600`)
  assert.equal(streamPoster('f'.repeat(32)), `https://videodelivery.net/${'f'.repeat(32)}/thumbnails/thumbnail.jpg?time=0s&height=720`, 'an unlisted video keeps its first frame')
  assert.ok(posterUrl({ source: { cloudflareId: id } }).includes(`time=${POSTER_FRAMES[id]}s`))
  for (const f of ['src/components/CaseStudies.jsx', 'src/components/elyon/ElyonShowcase.jsx', 'src/components/graspo/GraspoShowcase.jsx', 'src/components/scale/ScaleHero.jsx']) {
    const t = read(f)
    assert.ok(!/thumbnail\.jpg/.test(t), `${f}: builds no Stream thumbnail URL by hand`)
    assert.match(t, /streamPoster\(/, f)
  }
  const roadmap = read('src/content/roadmapVideo.js')
  assert.match(roadmap, /25\.6 s/, 'the Roadmap explainer keeps its deliberately chosen frame')
})

test('the inventory and contact sheet exist and list every chosen frame', () => {
  const md = read('docs/video-thumbnails.md')
  for (const id of Object.keys(POSTER_FRAMES)) assert.ok(md.includes(`${id.slice(0, 8)}…`), id)
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/video-thumbnail-contact-sheet.jpg')))
  assert.ok(fs.existsSync(path.join(ROOT, 'scripts/poster-frames.py')))
})
