/* Smooth-scrolls to the qualification form (respecting reduced motion) and
   moves focus to its heading so keyboard / screen-reader users land there. */
export function scrollToApply() {
  if (typeof document === 'undefined') return
  const target = document.getElementById('apply')
  if (!target) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  const heading = document.getElementById('apply-heading')
  if (heading) window.setTimeout(() => heading.focus({ preventScroll: true }), reduce ? 0 : 450)
}
