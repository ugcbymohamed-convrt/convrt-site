import { scrollToElement } from './scroll.js'

/* Scrolls to the qualification form with a fast ease-out animation (instant for
   reduced-motion users) and moves focus to its heading so keyboard / screen-reader
   users land there. Focus uses preventScroll, so it never fights the animation, and
   needs no timer. See src/lib/scroll.js for why this replaces native smooth scroll. */
export function scrollToApply() {
  if (typeof document === 'undefined') return
  const target = document.getElementById('apply')
  if (!target) return
  // The visitor asked to go here: show the form's intro at once instead of letting its
  // scroll-in fade play out after they arrive. (Natural scrolling still fades in.)
  target.querySelectorAll('[data-reveal]').forEach((el) => {
    el.style.transition = 'none'
    el.style.opacity = '1'
    el.style.transform = 'none'
  })
  scrollToElement(target, { block: 'start' })
  document.getElementById('apply-heading')?.focus({ preventScroll: true })
}
