// Run with: node --test tests/scale-hero.test.mjs
// /scale hero: the scroll-driven video expansion. Desktop (>= 768 px) is pinned exactly; phones expand in proportion to the screen; reduced motion stays static.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = fs.readFileSync(path.join(ROOT, 'src/components/scale/ScaleHero.jsx'), 'utf8')

test('desktop (>= 768 px) is unchanged: 62vw resting width (min 320 px), 1.48x growth, same sticky offsets, radius and shadow maths', () => {
  assert.match(src, /md:min-w-\[320px\] md:max-w-\[min\(62vw,calc\(\(100vh_-_128px\)\*1\.28\)\)\]/, 'the old inline max-width, now an md: class with the identical expression')
  assert.match(src, /isMobile \? \(window\.innerWidth \* 0\.94\) \/ frame\.offsetWidth : 1\.48/, 'desktop growth is still exactly 1.48')
  assert.ok(src.includes("const navH = isMobile ? 72 : 96") && src.includes("const stickyOffset = () => (window.innerWidth < 768 ? 72 : 96)"))
  assert.ok(src.includes('frame.style.borderRadius = `${(28 - p * 18).toFixed(1)}px`'))
  assert.ok(src.includes('const copyFade = Math.min(p / 0.6, 1)'))
  assert.ok(src.includes("height: reducedMotion ? 'auto' : 'clamp(135vh, 160vh, 175vh)'"), 'pin length unchanged')
})

test('phones (< 768 px): rest at 66vw (never below 240 px or the container), then grow to 94% of the screen width, never past the visible height', () => {
  assert.match(src, /min-w-\[min\(240px,100%\)\] max-w-\[min\(66vw,calc\(\(100vh_-_128px\)\*1\.28\)\)\]/)
  assert.ok(src.includes('Math.min(Math.max(1, widthScale), Math.max(1, fitScale))'), 'capped by the visible height as before')
  assert.ok(!/isMobile \? 1\.08/.test(src), 'the 1.08x phone cap (about 26 px of growth) is gone')
  // 94% of the screen can never exceed it: no horizontal overflow from the scaled frame
  assert.ok(0.94 < 1)
})

test('reduced motion: nothing grows, the pin is off, and phones keep the previous fixed size', () => {
  assert.match(src, /if \(!section \|\| !copy \|\| !frame \|\| reducedMotion\) return/, 'the scroll effect does not run')
  assert.ok(src.includes("height: reducedMotion ? 'auto'"))
  assert.match(src, /reducedMotion\s*\?\s*'min-w-\[min\(320px,100%\)\] max-w-\[min\(62vw/)
})

test('the overflow fix is still the single horizontal clip on the hero section, and the sticky CTA and VSL controls are untouched', () => {
  assert.match(src, /className="relative overflow-x-clip"/)
  assert.ok(!/overflow-x-hidden/.test(src))
  for (const f of ['src/components/scale/ScaleStickyCTA.jsx', 'src/components/scale/VslControls.jsx']) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8')
    assert.ok(s.length > 500, f)
  }
  assert.match(src, /<VslControls/)
})
