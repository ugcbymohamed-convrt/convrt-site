import { scrollToElement } from '../../lib/scroll.js'
import { usePressFeedback } from '../../lib/usePressFeedback.js'

/* Link-styled CTA that starts scrolling on the very next frame (see src/lib/scroll.js).
   Plain left-clicks are intercepted; modified clicks (new tab, etc.) keep normal link
   behaviour, so `href` still works without JS. */
export function ScrollCta({ href, onGo, variant = 'primary', className = '', children }) {
  const press = usePressFeedback()
  const base =
    variant === 'primary'
      ? 'cta-gradient hero-cta text-canvas font-bold focus-visible:outline-lime'
      : 'hero-cta-ghost border border-hairline-strong bg-surface-2 text-ink font-semibold hover:border-ink-muted focus-visible:outline-ink'
  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        onGo()
      }}
      {...press}
      className={`${base} group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] tracking-snug
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`}
    >
      {children}
    </a>
  )
}

export const Arrow = () => (
  <span
    aria-hidden="true"
    className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
  >
    →
  </span>
)

/* Scrolls to a section by id and moves keyboard / screen-reader focus to it. The visitor
   asked to go there, so its scroll-reveal content is shown at once instead of fading in
   after they arrive (same approach as scrollToApply in src/lib/roadmapForm.js). */
export function goToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.querySelectorAll('[data-reveal]').forEach((node) => {
    node.style.transition = 'none'
    node.style.opacity = '1'
    node.style.transform = 'none'
  })
  scrollToElement(el)
  el.focus({ preventScroll: true })
}

/* Opens the full program terms (an accordion in ReferralTerms.jsx) and scrolls to them.
   Used by every "full terms" link on the page, so the terms stay one click away from the
   rewards, the form and the FAQ. */
export const TERMS_OPEN_EVENT = 'referral-terms-open'
export function openTerms() {
  window.dispatchEvent(new Event(TERMS_OPEN_EVENT))
  goToSection('terms')
}

/* Inline-looking text link with a 44px touch target. */
export function TermsLink({ children = 'Read full program terms', className = '' }) {
  return (
    <a
      href="#terms"
      onClick={(e) => {
        e.preventDefault()
        openTerms()
      }}
      className={`inline-flex min-h-[44px] items-center font-medium text-ink-muted underline underline-offset-2 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${className}`}
    >
      {children}
    </a>
  )
}
