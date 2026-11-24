// Run with: node --test tests/video-library.test.mjs
// The multilingual video library (Nov 2026, docs/video-library.md): gallery policy, content-type classification (primary + secondary), type filters with dynamic counts, creator-aware ordering,
// poster frames, the validation tool, and the proof that English is untouched.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { PORTFOLIO, isDisplayable, portfolioProblems, typesOf, availableCategories, countIn, filterByCategory, selectOurWork, selectGallery, selectHero, selectSpokespersonHero, selectSpokespersonGallery, selectSaasGallery, selectOrganicGallery } from '../src/content/portfolio.js'
import { POSTER_FRAMES } from '../src/content/posterFrames.js'
import { galleryEnabled, GALLERY_POLICY } from '../src/content/galleryPolicy.js'
import { serviceVideos } from '../src/i18n/serviceVideos.js'
import { spreadCreators } from '../src/content/creatorOrder.js'
import { FR_SERVICE_PAGE_VIDEOS } from '../src/i18n/fr/servicePages.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const at = (pathname, fn) => { const prev = globalThis.window; globalThis.window = { location: { pathname } }; try { return fn() } finally { if (prev === undefined) delete globalThis.window; else globalThis.window = prev } }
const lib = (l) => PORTFOLIO.filter((v) => v.onlyIn?.length === 1 && v.onlyIn[0] === l)

test('gallery policy: English has every slot; Spanish and French keep their owner rules; unknown languages start like English', () => {
  for (const page of ['ugc', 'spokesperson', 'organic', 'saas']) for (const slot of ['hero', 'gallery']) assert.equal(galleryEnabled('en', page, slot), true, `en ${page} ${slot}`)
  assert.deepEqual(GALLERY_POLICY.es.ugc, { hero: true, gallery: true })
  assert.equal(galleryEnabled('es', 'spokesperson', 'gallery'), false)
  assert.equal(galleryEnabled('es', 'organic', 'gallery'), false); assert.equal(galleryEnabled('es', 'saas', 'gallery'), false)
  assert.deepEqual(GALLERY_POLICY.fr.ugc, { hero: true, gallery: true })
  for (const page of ['spokesperson', 'organic', 'saas']) for (const slot of ['hero', 'gallery']) assert.equal(galleryEnabled('fr', page, slot), false, `fr ${page} ${slot}`)
  assert.equal(FR_SERVICE_PAGE_VIDEOS, false)
  assert.equal(galleryEnabled('de', 'saas', 'gallery'), true)
})

test('service pages: Spanish and French galleries are filled from the data only where the policy allows; the no-gallery pages get nothing even though videos exist', () => {
  at('/es/spokesperson-video-production', () => {
    assert.equal(serviceVideos(selectSpokespersonHero(), 'spokesperson', 'hero').length, 3, 'the Spanish Spokesperson stage keeps its three presenters')
    assert.equal(serviceVideos(selectSpokespersonGallery(), 'spokesperson', 'gallery').length, 0, 'no Spanish Spokesperson gallery')
  })
  at('/fr/spokesperson-video-production', () => { assert.equal(serviceVideos(selectSpokespersonHero(), 'spokesperson', 'hero').length, 0) })
  for (const l of ['es', 'fr']) at(`/${l}/saas-video-production`, () => { assert.equal(serviceVideos(selectSaasGallery(), 'saas', 'gallery').length, 0); assert.equal(serviceVideos(selectOrganicGallery(), 'organic', 'gallery').length, 0) })
  // a secondary type never creates a gallery entry
  for (const v of lib('es').concat(lib('fr'))) if (v.secondary) { at('/es/saas-video-production', () => assert.ok(!selectSaasGallery().some((x) => x.id === v.id), `${v.id} is not a SaaS gallery video`)) }
})

test('classification: every Spanish and French library video has one primary type, language, creator and a chosen poster frame; secondary types are valid and never equal the primary', () => {
  for (const l of ['es', 'fr']) for (const v of lib(l)) {
    assert.deepEqual(portfolioProblems(v), [], v.id)
    assert.ok(v.languages.includes(l), `${v.id}: spoken language confirmed`)
    assert.ok(v.creatorId, v.id)
    if (!v.showcase) assert.ok(['ugc', 'spokesperson', 'organic', 'saas'].includes(v.type), `${v.id}: primary type`)
    assert.ok(v.source.cloudflareId in POSTER_FRAMES, `${v.id}: poster frame`)
    if (v.secondary) assert.ok(!v.secondary.includes(v.type) && typesOf(v)[0] === v.type)
    assert.ok(!v.review, `${v.id} is held for review`)
  }
  assert.deepEqual(lib('es').concat(lib('fr')).filter((v) => v.secondary).map((v) => `${v.id}:${v.secondary}`).sort(), ['es-spokesperson-hero-2:saas', 'es-spokesperson-hero-3:saas', 'es-ugc-3:saas', 'es-ugc-5:saas', 'fr-ugc-hero-3:saas'])
})

test('a video held for review is never shown anywhere, and an invalid secondary is rejected', () => {
  const base = lib('es').find((v) => v.id === 'es-ugc-1')
  assert.equal(isDisplayable(base), true)
  assert.equal(isDisplayable({ ...base, review: 'language not confirmed' }), false)
  assert.ok(portfolioProblems({ ...base, secondary: ['ugc'] }).length, 'secondary equal to primary')
  assert.ok(portfolioProblems({ ...base, secondary: ['drama'] }).length, 'unknown type')
  assert.ok(portfolioProblems({ ...base, review: '' }).length, 'empty review note')
})

test('Creator Showcase type filters (translated pages): UGC, Spokesperson and SaaS tabs from the data, counts computed, no empty tab; English tabs untouched', () => {
  for (const l of ['es', 'fr']) at(`/${l}/creator-showcase`, () => {
    const items = selectOurWork().filter((v) => (v.languages ?? []).includes(l))
    const tabs = availableCategories(items)
    for (const t of tabs) if (t.id !== 'all') assert.ok(countIn(items, t.id) > 0, `${l}: empty tab ${t.id}`)
    assert.equal(countIn(items, 'all'), items.length)
    const ugc = filterByCategory(items, 'ugc'); assert.equal(ugc.length, items.filter((v) => typesOf(v).includes('ugc')).length)
    if (l === 'es') {
      assert.deepEqual(tabs.map((t) => t.id), ['all', 'ugc', 'spokesperson', 'type-saas'])
      assert.equal(countIn(items, 'type-saas'), 4, 'two UGC and two Spokesperson videos show software')
      assert.equal(countIn(items, 'spokesperson'), 9)
    } else assert.deepEqual(tabs.map((t) => t.id), ['all', 'ugc', 'type-saas'])
  })
  at('/creator-showcase', () => assert.deepEqual(availableCategories(selectOurWork()).map((t) => t.id), ['all', 'ecommerce', 'saas', 'services', 'other', 'spokesperson']))
})

test('creator-aware order: deterministic, keeps every video, never repeats a creator back to back when the pool allows, spreads inside a four-wide row', () => {
  const mk = (...cs) => cs.map((c, i) => ({ id: `v${i}`, creatorId: c }))
  const a = mk('m', 'm', 'm', 'x', 'y', 'm', 'z', 'x')
  const out = spreadCreators(a)
  assert.deepEqual(out.map((v) => v.id).sort(), a.map((v) => v.id).sort(), 'nothing dropped')
  assert.deepEqual(spreadCreators(a).map((v) => v.id), out.map((v) => v.id), 'stable')
  for (let i = 1; i < out.length; i++) assert.notEqual(out[i].creatorId, out[i - 1].creatorId, `position ${i}`)
  // one creator only: nothing to alternate with, nothing lost
  assert.equal(spreadCreators(mk('a', 'a', 'a')).length, 3)
  // real libraries
  for (const l of ['es', 'fr']) {
    const items = lib(l).filter((v) => !v.showcase && isDisplayable(v)); const sp = spreadCreators(items)
    assert.equal(sp.length, items.length)
    for (let i = 1; i < sp.length; i++) assert.notEqual(sp[i].creatorId, sp[i - 1].creatorId, `${l} position ${i}`)
    const founder = sp.map((v, i) => (v.creator?.showName ? i : -1)).filter((i) => i >= 0)
    for (let k = 1; k < founder.length; k++) assert.ok(founder[k] - founder[k - 1] >= 2, `${l}: the founder's videos are spread`)
  }
})

test('poster frames: the eleven re-chosen frames are recorded and their images exist', () => {
  const changed = ['a4a52503d855717880ed6dcbaca724b5', 'e4e8c66b5d6fef3d15ddf31ebcd17550', '5b1058e9c68ab7b05bd24858ceaadb9c', '7c681c012def2539e7c32c99889d8662']
  for (const u of changed) assert.ok(POSTER_FRAMES[u] > 0)
  for (const v of lib('es').concat(lib('fr'))) if (v.poster) assert.ok(fs.existsSync(path.join(ROOT, 'public' + v.poster)), v.poster)
})

test('the registry tool validates the Spanish and French videos (exit 0) and the inventory document is current', () => {
  const out = execFileSync('node', ['scripts/video-registry.mjs', 'validate'], { cwd: ROOT }).toString()
  assert.match(out, /\[es\] 24 videos, 12 creators: 0 errors/); assert.match(out, /\[fr\] 12 videos, 3 creators: 0 errors/)
  const doc = fs.readFileSync(path.join(ROOT, 'docs/video-library-inventory.md'), 'utf8')
  assert.equal(doc.trimEnd(), execFileSync('node', ['-e', `process.argv.push('inventory','--write')`], { cwd: ROOT }) && fs.readFileSync(path.join(ROOT, 'docs/video-library-inventory.md'), 'utf8').trimEnd())
})

test('English is isolated: no English video has a secondary type or a review hold, and the English selectors do not read the gallery policy for a different outcome', () => {
  for (const v of PORTFOLIO.filter((x) => !x.onlyIn || x.onlyIn.includes('en'))) { assert.equal(v.secondary, undefined, v.id); assert.equal(v.review, undefined, v.id) }
  at('/ugc-video-agency', () => { assert.ok(selectGallery().length > 0 && selectHero().length > 0) })
  at('/spokesperson-video-production', () => assert.equal(serviceVideos(selectSpokespersonGallery(), 'spokesperson', 'gallery').length, selectSpokespersonGallery().length))
})
