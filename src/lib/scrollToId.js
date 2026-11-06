/* Smooth-scrolls to an element (respecting reduced motion) and moves focus to
   `focusId` afterwards so keyboard / screen-reader users land there. */
export function scrollToId(id, focusId) {
  if (typeof document === 'undefined') return
  const target = document.getElementById(id)
  if (!target) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  const focusEl = focusId && document.getElementById(focusId)
  if (focusEl) window.setTimeout(() => focusEl.focus({ preventScroll: true }), reduce ? 0 : 450)
}
