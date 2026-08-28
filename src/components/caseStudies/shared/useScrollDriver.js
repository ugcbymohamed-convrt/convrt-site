import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────
   SCROLL DRIVER
   Two progress models, both 0→1, both driving visuals
   imperatively via onTick(progress) — callers write
   straight to refs, so scrolling never triggers a React
   re-render.

   Default ("enter"): 0 when the section's top edge is at
   the bottom of the viewport (just entering), 1 when its
   top edge reaches the top of the viewport. Used when the
   payoff should be finishing right as the section settles
   into view.

   "through" (pass `throughPx`): 0 for as long as the
   section's top edge is still more than `throughOffsetPx`
   (default 0) below the top of the viewport — the content
   sits still while the visitor reads the heading — then
   ramps 0→1 over the next `throughPx` of scrolling. Used
   when the payoff should trigger once the visitor is
   already reading the section, not before they get there.
   Raise `throughOffsetPx` to let the payoff start a bit
   earlier, while the section still has a little further to
   settle into place, rather than waiting for it to fully stop.

   Fully idle (no listeners, no rAF) whenever the target
   is nowhere near the viewport, and skipped entirely
   when `disabled` (prefers-reduced-motion) is true.
───────────────────────────────────────────── */
export function useScrollDriver(targetRef, onTick, { disabled = false, throughPx, throughOffsetPx = 0 } = {}) {
  const rafRef = useRef(null)

  useEffect(() => {
    const el = targetRef.current
    if (!el || disabled || typeof onTick !== 'function') return

    const compute = () => {
      rafRef.current = null
      const rect = el.getBoundingClientRect()
      let raw
      if (throughPx) {
        raw = rect.top > throughOffsetPx ? 0 : (throughOffsetPx - rect.top) / throughPx
      } else {
        const vh = window.innerHeight || 1
        raw = 1 - rect.top / vh
      }
      onTick(raw < 0 ? 0 : raw > 1 ? 1 : raw)
    }

    const requestTick = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(compute)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', requestTick, { passive: true })
          window.addEventListener('resize', requestTick)
          requestTick()
        } else {
          window.removeEventListener('scroll', requestTick)
          window.removeEventListener('resize', requestTick)
        }
      },
      { rootMargin: '40% 0px' }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', requestTick)
      window.removeEventListener('resize', requestTick)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [targetRef, onTick, disabled, throughPx, throughOffsetPx])
}

export function clamp01(n) {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/* Remaps progress p from [from, to] onto [0, 1], clamped. */
export function remap(p, from, to) {
  if (to === from) return p >= to ? 1 : 0
  return clamp01((p - from) / (to - from))
}
