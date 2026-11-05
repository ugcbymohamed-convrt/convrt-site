import { trackEvent } from '../../lib/analytics.js'
import { scrollToApply } from '../../lib/roadmapForm.js'
import { useInView } from '../caseStudies/shared/useInView.js'

/* Scroll-reveal wrapper. Pure CSS transitions; reduced-motion users get the
   final state immediately. Only used below the fold. */
export function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView(0.08)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
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
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
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
