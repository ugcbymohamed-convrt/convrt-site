// Run with: node --test tests/video-library.test.mjs
// The multilingual video library for Arabic (Nov 2026, docs/video-library.md): gallery policy, content-type classification (primary + secondary), type filters with dynamic counts, creator-aware ordering,
// poster frames, the validation tool, and the proof that English is untouched.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { PORTFOLIO, isDisplayable, portfolioProblems, typesOf, availableCategories, countIn, filterByCategory, selectOurWork, selectGallery, selectHero, selectSpokespersonHero, selectSpokespersonGallery, selectSaasGallery, selectOrganicHero, selectOrganicGallery } from '../src/content/portfolio.js'
import { POSTER_FRAMES } from '../src/content/posterFrames.js'
import { galleryEnabled } from '../src/content/galleryPolicy.js'
import { serviceVideos } from '../src/i18n/serviceVideos.js'
import { spreadCreators } from '../src/content/creatorOrder.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const at = (pathname, fn) => { const prev = globalThis.window; globalThis.window = { location: { pathname } }; try { return fn() } finally { if (prev === undefined) delete globalThis.window; else globalThis.window = prev } }
const lib = PORTFOLIO.filter((v) => v.onlyIn?.length === 1 && v.onlyIn[0] === 'ar')

test('gallery policy: English has every slot; Arabic has UGC and Spokesperson galleries, the Graspo organic presentation and no SaaS videos', () => {
  for (const page of ['ugc', 'spokesperson', 'organic', 'saas']) for (const slot of ['hero', 'gallery']) assert.equal(galleryEnabled('en', page, slot), true)
  for (const slot of ['hero', 'gallery']) { assert.equal(galleryEnabled('ar', 'ugc', slot), true); assert.equal(galleryEnabled('ar', 'spokesperson', slot), true); assert.equal(galleryEnabled('ar', 'saas', slot), false) }
  assert.equal(galleryEnabled('ar', 'organic', 'hero'), true); assert.equal(galleryEnabled('ar', 'organic', 'gallery'), false)
})

test('Arabic service pages are filled from the data: UGC and Spokesperson galleries, the three Graspo organic videos, nothing on SaaS', () => {
  at('/ar/spokesperson-video-production', () => {
    assert.equal(serviceVideos(selectSpokespersonHero(), 'spokesperson', 'hero').length, 3)
    assert.equal(serviceVideos(selectSpokespersonGallery(), 'spokesperson', 'gallery').length, 1)
  })
  at('/ar/social-media-video-production', () => { assert.equal(serviceVideos(selectOrganicHero(), 'organic', 'hero').length, 3); assert.equal(serviceVideos(selectOrganicGallery(), 'organic', 'gallery').length, 0) })
  at('/ar/saas-video-production', () => assert.equal(serviceVideos(selectSaasGallery(), 'saas', 'gallery').length, 0))
  at('/ar/ugc-video-agency', () => assert.ok(serviceVideos(selectHero(), 'ugc', 'hero').length === 3 && selectGallery().filter((v) => (v.languages ?? []).includes('ar')).length === 11))
  for (const v of lib.filter((x) => x.secondary)) at('/ar/saas-video-production', () => assert.ok(!selectSaasGallery().some((x) => x.id === v.id), `${v.id} is not a SaaS gallery video`))
})

test('classification: every Arabic library video has one primary type, spoken language, creator and a chosen poster frame; secondary types are valid', () => {
  assert.equal(lib.length, 21)
  for (const v of lib) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.ok(v.languages.includes('ar'), v.id); assert.ok(v.creatorId, v.id)
    assert.ok(['ugc', 'spokesperson', 'organic', 'saas'].includes(v.type), `${v.id}: primary type`)
    assert.ok(v.source.cloudflareId in POSTER_FRAMES, `${v.id}: poster frame`)
    assert.ok(!v.review, `${v.id} is held for review`)
    if (v.secondary) assert.ok(!v.secondary.includes(v.type) && typesOf(v)[0] === v.type)
  }
  assert.deepEqual(lib.filter((v) => v.secondary).map((v) => `${v.id}:${v.secondary}`).sort(), ['ar-mohamed-zory:saas', 'ar-ugc-6:saas', 'ar-ugc-hero-1:saas'])
})

test('a video held for review is never shown anywhere, and an invalid secondary is rejected', () => {
  const base = lib.find((v) => v.id === 'ar-ugc-1')
  assert.equal(isDisplayable(base), true)
  assert.equal(isDisplayable({ ...base, review: 'language not confirmed' }), false)
  assert.ok(portfolioProblems({ ...base, secondary: ['ugc'] }).length); assert.ok(portfolioProblems({ ...base, secondary: ['drama'] }).length)
})

test('Arabic Creator Showcase type filters: UGC, Spokesperson, SaaS and Organic Social from the data with computed counts; English tabs untouched', () => {
  at('/ar/creator-showcase', () => {
    const items = selectOurWork().filter((v) => (v.languages ?? []).includes('ar'))
    const tabs = availableCategories(items)
    assert.deepEqual(tabs.map((t) => t.id), ['all', 'ugc', 'spokesperson', 'type-saas', 'type-organic'])
    assert.deepEqual(tabs.map((t) => countIn(items, t.id)), [21, 14, 4, 3, 3])
    assert.equal(filterByCategory(items, 'type-organic').every((v) => v.type === 'organic'), true)
  })
  at('/creator-showcase', () => assert.deepEqual(availableCategories(selectOurWork()).map((t) => t.id), ['all', 'ecommerce', 'saas', 'services', 'other', 'spokesperson']))
})

test('creator-aware order: deterministic, keeps every video, never back to back when the pool allows', () => {
  const mk = (...cs) => cs.map((c, i) => ({ id: `v${i}`, creatorId: c }))
  const a = mk('m', 'm', 'm', 'x', 'y', 'm', 'z', 'x'); const out = spreadCreators(a)
  assert.deepEqual(out.map((v) => v.id).sort(), a.map((v) => v.id).sort())
  assert.deepEqual(spreadCreators(a).map((v) => v.id), out.map((v) => v.id))
  for (let i = 1; i < out.length; i++) assert.notEqual(out[i].creatorId, out[i - 1].creatorId)
  at('/ar/creator-showcase', () => {
    const sp = spreadCreators(selectOurWork().filter((v) => (v.languages ?? []).includes('ar')))
    assert.equal(sp.length, 21)
    for (let i = 1; i < sp.length; i++) assert.notEqual(sp[i].creatorId, sp[i - 1].creatorId, `position ${i}`)
  })
})

test('poster frames: the eight re-chosen Arabic frames are recorded and every poster image exists', () => {
  for (const u of ['871ea801', 'a32cb282', '9e7fca5c', '442dfb5f', '6d550ed3', 'ad0e4e3b', '49313ecc', '583c9f51']) assert.ok(Object.keys(POSTER_FRAMES).some((k) => k.startsWith(u)), u)
  for (const v of lib) if (v.poster) assert.ok(fs.existsSync(path.join(ROOT, 'public' + v.poster)), v.poster)
})

test('the registry tool validates the Arabic videos (exit 0)', () => {
  assert.match(execFileSync('node', ['scripts/video-registry.mjs', 'validate', 'ar'], { cwd: ROOT }).toString(), /\[ar\] 21 videos, 9 creators: 0 errors/)
})

test('English is isolated: no English video has a secondary type or a review hold', () => {
  for (const v of PORTFOLIO.filter((x) => !x.onlyIn || x.onlyIn.includes('en'))) { assert.equal(v.secondary, undefined, v.id); assert.equal(v.review, undefined, v.id) }
  at('/spokesperson-video-production', () => assert.equal(serviceVideos(selectSpokespersonGallery(), 'spokesperson', 'gallery').length, selectSpokespersonGallery().length))
})
