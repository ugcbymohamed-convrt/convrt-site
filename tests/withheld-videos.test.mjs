/* Withheld portfolio videos (on-hold, unlisted, review-held) never reach the public build, while their source records stay untouched
   (vite-plugin-withheld-videos.js). */
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseAst } from 'rollup/parseAst'
import { build } from 'vite'
import { findWithheld, removeRanges } from '../vite-plugin-withheld-videos.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const parser = (c) => parseAst(c)

const FIXTURE = `const OK = { status: 'approved', portfolioUse: true, creatorConsent: true }
const PORTFOLIO_ENTRIES = [
  { id: 'a', source: { cloudflareId: 'aaa' }, poster: '/portfolio/a.webp', approval: { status: 'approved' } },
  {
    id: 'held',
    source: { cloudflareId: 'hhh' },
    poster: '/portfolio/held.webp',
    approval: { status: 'on-hold', holdReason: 'x' },
  },
  { id: 'hidden', source: { cloudflareId: 'uuu' }, poster: '/portfolio/hidden.webp', unlisted: true, approval: OK },
  { id: 'rev', source: { cloudflareId: 'rrr' }, review: 'check', approval: OK },
  { id: 'b', source: { cloudflareId: 'bbb' }, approval: OK },
]`

test('findWithheld: on-hold, unlisted and review-held entries are found, approved ones are not', () => {
  const found = findWithheld(FIXTURE, parser)
  assert.deepEqual(found.map((f) => f.id), ['held', 'hidden', 'rev'])
  assert.deepEqual(found.map((f) => f.streamId), ['hhh', 'uuu', 'rrr'])
  assert.equal(found[0].poster, '/portfolio/held.webp')
})

test('removeRanges: the remaining source is still valid and keeps every other entry', () => {
  const out = removeRanges(FIXTURE, findWithheld(FIXTURE, parser))
  assert.ok(!/held|hidden|rrr|uuu|hhh/.test(out))
  assert.ok(out.includes("id: 'a'") && out.includes("id: 'b'"))
  assert.doesNotThrow(() => parser(out))
  assert.equal(findWithheld(out, parser).length, 0)
})

test('the real source keeps its private records: the on-hold and unlisted entries are still in portfolio.js and posterFrames.js', () => {
  const src = read('src/content/portfolio.js')
  assert.ok(src.includes("id: 'creator-05'") && src.includes("status: 'on-hold'"))
  assert.ok(src.includes("id: 'ar-ugc-10'") && src.includes('unlisted: true'))
  assert.ok(read('src/content/posterFrames.js').includes('3058e60f87200babb0b6c60606923e1b'))
  const found = findWithheld(src, parser).map((f) => f.id)
  assert.deepEqual(found.sort(), ['ar-ugc-10', 'creator-05'])
})

let tmp, dist, withheld
before(async () => {
  withheld = findWithheld(read('src/content/portfolio.js'), parser)
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-withheld-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(path.join(pub, 'portfolio'), { recursive: true })
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  for (const w of withheld) if (w.poster) fs.copyFileSync(path.join(ROOT, 'public', w.poster), path.join(pub, w.poster)) // the real poster files, so their removal is observable
  fs.copyFileSync(path.join(ROOT, 'public/portfolio/home-hero.webp'), path.join(pub, 'portfolio/home-hero.webp'))
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('public build: no withheld id, creator id, Stream id, video URL or poster file is shipped (JavaScript, HTML, XML, JSON, images)', () => {
  assert.ok(withheld.length >= 2)
  const needles = withheld.flatMap((w) => [w.id, w.streamId, w.poster && path.basename(w.poster)]).filter(Boolean)
  needles.push('cv-creator-05') // (ar-c05 is shared with approved Arabic videos of the same creator, so it is not a withheld-only identifier)
  const hits = []
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name)
      if (f.isDirectory()) walk(p)
      else {
        const text = fs.readFileSync(p, 'latin1')
        for (const n of needles) if (text.includes(n) || f.name === n) hits.push(`${path.relative(dist, p)} ~ ${n}`)
      }
    }
  }
  walk(dist)
  assert.deepEqual(hits, [])
  assert.ok(fs.existsSync(path.join(dist, 'portfolio/home-hero.webp')), 'approved posters are untouched')
})

test('public build: approved videos are still shipped (the filter removes only the withheld ones)', () => {
  const js = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
  assert.ok(js.includes('002d9dab913f13496e6513e4a7761ec9'), 'an approved Stream id is present')
  assert.ok(js.includes("id:\"creator-04\"") || js.includes("id: \"creator-04\"") || js.includes('creator-04'), 'neighbouring approved entries remain')
})
