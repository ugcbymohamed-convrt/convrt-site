/* ─────────────────────────────────────────────
   Fast, interruptible scroll-to-element for form CTAs.

   Why this exists: the browser's native `behavior: 'smooth'` scroll starts
   slowly (ease-in) and runs ~450–600 ms in Chrome and longer in Safari, which
   made "Apply" buttons feel like they waited about a second. This animates for
   ~180–360 ms (distance-scaled) with an ease-OUT curve, so movement is visible
   on the very next frame.

   • No dependency, no timers: one requestAnimationFrame loop at a time.
   • A new call (or any wheel / touch / key press) cancels the running one, so
     repeated clicks never fight each other.
   • Honors `scroll-margin-top` on the target (the sticky header offset set by
     the `scroll-mt-*` classes), so headings are never hidden under the header.
   • prefers-reduced-motion → jumps instantly.
   • The page sets `html { scroll-behavior: smooth }`; the inline override below
     keeps that from smoothing each animation frame.
───────────────────────────────────────────── */

let frame = 0
let stopListening = null

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

function cancelScroll() {
  if (frame) window.cancelAnimationFrame(frame)
  frame = 0
  if (stopListening) stopListening()
  stopListening = null
  document.documentElement.style.removeProperty('scroll-behavior')
}

/* Pixel offset the element should be scrolled to (`block` mirrors scrollIntoView). */
function targetFor(el, block) {
  const rect = el.getBoundingClientRect()
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const top = rect.top + window.scrollY
  const vh = window.innerHeight
  let y
  if (block === 'center') y = top - (vh - rect.height) / 2
  else if (block === 'nearest') {
    if (rect.top >= margin && rect.bottom <= vh) return window.scrollY // already fully visible
    y = rect.top < margin ? top - margin : top + rect.height - vh + 16
  } else y = top - margin
  const max = document.documentElement.scrollHeight - vh
  return clamp(y, 0, Math.max(max, 0))
}

/* @param {Element|null} el
   @param {{ block?: 'start'|'center'|'nearest', duration?: number }} [opts]  duration 0 = instant */
export function scrollToElement(el, { block = 'start', duration } = {}) {
  if (!el || typeof window === 'undefined') return
  cancelScroll()

  const from = window.scrollY
  const to = targetFor(el, block)
  const distance = Math.abs(to - from)
  const root = document.documentElement
  const ms = duration ?? clamp(160 + distance * 0.12, 180, 360)

  if (reducedMotion() || ms <= 0 || distance < 2) {
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, to)
    root.style.removeProperty('scroll-behavior')
    return
  }

  root.style.scrollBehavior = 'auto'
  const abort = () => cancelScroll()
  const opts = { passive: true }
  const events = ['wheel', 'touchstart', 'keydown', 'mousedown']
  events.forEach((e) => window.addEventListener(e, abort, opts))
  stopListening = () => events.forEach((e) => window.removeEventListener(e, abort, opts))

  const start = performance.now()
  const step = (now) => {
    const t = clamp((now - start) / ms, 0, 1)
    window.scrollTo(0, from + (to - from) * easeOutCubic(t))
    if (t < 1) frame = window.requestAnimationFrame(step)
    else cancelScroll()
  }
  frame = window.requestAnimationFrame(step)
}

/* Scrolls (instantly) to the element named by location.hash, if any. Client-rendered
   pages are not in the DOM when the browser first tries to honor `/page#apply`, so
   components call this once their content has mounted. */
export function scrollToHash() {
  if (typeof window === 'undefined') return
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id) return
  const el = document.getElementById(id)
  if (el) scrollToElement(el, { duration: 0 })
}
