import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────
   Reliable "pressed" feedback for link-buttons.

   Why not just CSS `:active`? On production a click navigates away ~65–105 ms after
   the mouse is released, and a normal click only holds the button for ~90 ms. A
   transition longer than that never finishes, and iOS Safari doesn't apply `:active`
   to links at all unless a touch handler exists. So the pressed look is driven by
   pointer events instead: it is applied on pointer-DOWN (before the click and any
   navigation), kept for at least MIN_HOLD ms from that moment, then released.

   The handlers only toggle a CSS class. They never call preventDefault and never
   delay anything, so normal link behaviour (navigation, modifier-click, new tab,
   keyboard) is untouched. The CSS (`.is-pressed` in index.css) defines the visuals
   and honors prefers-reduced-motion.
───────────────────────────────────────────── */

const MIN_HOLD = 160 // ms the pressed look stays, counted from pointer-down

export function usePressFeedback() {
  const downAt = useRef(0)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const press = (node) => {
    window.clearTimeout(timer.current)
    downAt.current = performance.now()
    node.classList.add('is-pressed')
  }
  const release = (node) => {
    window.clearTimeout(timer.current)
    const wait = Math.max(0, MIN_HOLD - (performance.now() - downAt.current))
    timer.current = window.setTimeout(() => node.classList.remove('is-pressed'), wait)
  }

  return {
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return // ignore right / middle click
      press(e.currentTarget)
    },
    onPointerUp: (e) => release(e.currentTarget),
    onPointerLeave: (e) => release(e.currentTarget),
    onPointerCancel: (e) => release(e.currentTarget),
    // Enter activates a link on keydown; Space does not.
    onKeyDown: (e) => { if (e.key === 'Enter' && !e.repeat) press(e.currentTarget) },
    onKeyUp: (e) => release(e.currentTarget),
    onBlur: (e) => release(e.currentTarget),
  }
}
