import { useEffect, useRef, useState } from 'react'
import { forward } from '../../lib/rtl.js'
import { trackEvent } from '../../lib/analytics.js'
import { scrollToApply } from '../../lib/roadmapForm.js'
import { tr } from '../../i18n/tr.js'

/* Scroll-reveal wrapper. Reduced-motion users get the final state immediately.

   Content is NEVER hidden until JavaScript runs (technical audit F5-1: the prerendered above-the-fold text used to start at opacity 0 and only appeared after the
   1.2 MB entry script had been downloaded and executed, which set mobile FCP/LCP):
   • server HTML and the first client render ('initial'): visible, entering with the CSS keyframe `reveal-enter` that starts at first paint, so the same fade-and-rise
     plays with no JavaScript and the text is in the document, readable and paintable immediately;
   • after hydration the block is measured: already on screen (or within `early`'s margin) → left as it is; below the fold → hidden ('hidden') and revealed with the
     original transition when it scrolls into view. A block that is off screen cannot flash, because nobody can see it while its state changes.
   `early`: for the application form's intro — begins fading in while the block is still ~30% of a screen below the fold and fades faster, so it is already visible
   when a CTA's scroll lands. */
export function Reveal({ children, delay = 0, className = '', early = false }) {
  const ref = useRef(null)
  const [state, setState] = useState('initial') // 'initial' (server + first paint) | 'hidden' (below the fold, waiting) | 'shown'
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined' || !window.innerHeight) return undefined // no viewport to measure (hidden frame): leave the content visible
    const margin = early ? window.innerHeight * 0.3 : 0
    const { top, bottom } = el.getBoundingClientRect()
    if (bottom > 0 && top < window.innerHeight + margin) return undefined // on screen now: keep the first-paint entrance, never re-hide
    setState('hidden')
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setState('shown'); obs.disconnect() } },
      { threshold: early ? 0 : 0.08, rootMargin: early ? '0px 0px 30% 0px' : '0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [early])
  const shown = state === 'shown'
  return (
    <div
      ref={ref}
      data-reveal=""
      style={state === 'initial' ? { animationDelay: `${delay}ms` } : { transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`${
        state === 'initial'
          ? `reveal-enter${early ? ' reveal-enter-early' : ''}`
          : `transition-[opacity,transform] ${early ? 'duration-300' : 'duration-700'} ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`
      } motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${className}`}
    >
      {children}
    </div>
  )
}

/* Line-flanked eyebrow, same pattern as the FAQ / Testimonials headers. */
export function Eyebrow({ children, align = 'center' }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${align === 'center' ? '' : ''}`}>
      <span className="h-px w-8 bg-lime" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{children}</span>
      <span className="h-px w-8 bg-lime" aria-hidden="true" />
    </div>
  )
}

export function SectionHeader({ id, eyebrow, title, children, className = '' }) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-5 font-display font-bold text-ink tracking-display leading-[1.06] text-[1.9rem] sm:text-4xl md:text-[2.75rem]"
      >
        {title}
      </h2>
      {children && <p className="mt-4 text-base md:text-lg text-ink-muted leading-relaxed">{children}</p>}
    </div>
  )
}

/* Primary lime CTA that scrolls to the application form. */
export function ApplyButton({ location, className = '', children = 'Apply for Your Free Roadmap' }) {
  return (
    <a
      href="#apply"
      onClick={(e) => {
        e.preventDefault()
        trackEvent('roadmap_apply_click', { location })
        scrollToApply()
      }}
      className={`cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {typeof children === 'string' ? tr(children) : children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">{forward()}</span>
    </a>
  )
}

export function Check({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
