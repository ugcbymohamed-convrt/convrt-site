import { trackEvent, withUtm } from '../../lib/analytics.js'
import { usePressFeedback } from '../../lib/usePressFeedback.js'
import { OFFER_PATHS } from '../../config.js'
import { tr, hrefFor, ctaText } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { resolveCta } from '../../i18n/cta.js'
import { Reveal, Eyebrow } from '../roadmap/shared.jsx'

export { Reveal, Eyebrow }

/* Building blocks for /ugc-video-agency. Same visual vocabulary as the homepage, /pricing and the Roadmap:
   black canvas, hairline borders, surface-1 cards, lime CTAs, a violet glow as the UGC accent (the homepage's UGC card colour). */

export function Section({ id, label, className = '', glow = false, children }) {
  return (
    <section id={id} aria-labelledby={label} className={`relative overflow-hidden py-10 md:py-14 scroll-mt-24 ${className}`}>
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-violet/[0.07] blur-[150px]"
        />
      )}
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">{children}</div>
    </section>
  )
}

/* Section heading. `align="left"` for split layouts; centred otherwise. */
export function Head({ id, eyebrow, title, intro, align = 'center', className = '' }) {
  const center = align === 'center'
  return (
    <div className={`${center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'} ${className}`}>
      <div className={`inline-flex items-center gap-2.5 ${center ? '' : ''}`}>
        <span className="h-px w-8 bg-lime" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{eyebrow}</span>
        {center && <span className="h-px w-8 bg-lime" aria-hidden="true" />}
      </div>
      <h2
        id={id}
        className="mt-4 font-display font-bold text-ink tracking-display leading-[1.06] text-[1.9rem] sm:text-4xl md:text-[2.5rem]"
      >
        {title}
      </h2>
      {intro && <p className="mt-3 text-base leading-relaxed text-ink-muted md:text-lg">{intro}</p>}
    </div>
  )
}

export function Card({ className = '', children, as: Tag = 'div' }) {
  return (
    <Tag className={`rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:p-7 ${className}`}>{children}</Tag>
  )
}

export function Tick({ className = 'text-lime' }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-1 h-3.5 w-3.5 shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Primary lime CTA → the Free Creative Growth Roadmap by default. `href` points it elsewhere (the Organic Social page sends it to the existing discovery-call booking link);
   an `external` destination opens in a new tab and carries the visitor's stored UTM parameters at click time (the markup stays the plain link for crawlers). */
export function RoadmapCta({ location, className = '', hero = false, children = 'Get 5 Free Ad Concepts', track = 'ugc_page_cta_click', href: hrefProp = OFFER_PATHS.roadmap, external: externalProp = false }) {
  const press = usePressFeedback()
  // Other languages: a CTA into the English-only Roadmap flow becomes the booking call (src/i18n/cta.js); a label is translated through the dictionary.
  const locale = currentLocale()
  const resolved = resolveCta(locale, { href: hrefProp, external: externalProp, label: children })
  const href = hrefFor(resolved.href, locale)
  const external = resolved.external
  // A redirected CTA gets the booking label; the default label is translated here; a label a caller already localized (page config) is shown as given.
  const label = resolved.redirected ? tr(resolved.label) : resolved.label === 'Get 5 Free Ad Concepts' ? ctaText(resolved.label) : resolved.label
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => {
        trackEvent(track, resolved.redirected ? { location, page: locale } : { location })
        if (external) e.currentTarget.href = withUtm(href)
      }}
      {...(hero ? press : {})}
      className={`${hero ? 'hero-cta ' : ''}cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {label}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
    </a>
  )
}

/* Secondary (ghost) button. */
export function GhostCta({ href, onClick, className = '', children }) {
  const press = usePressFeedback()
  return (
    <a
      href={hrefFor(href)}
      onClick={onClick}
      {...press}
      className={`hero-cta-ghost inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-hairline-strong bg-surface-2 px-7 py-3.5 text-[15px] font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {children}
    </a>
  )
}

export const TextLink = ({ href, onClick, children, className = '', external = false }) => (
  <a
    href={hrefFor(href)}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    onClick={(e) => {
      onClick?.(e)
      if (external) e.currentTarget.href = withUtm(href) // carries the visitor's stored UTM parameters to the booking page, as the page CTAs do
    }}
    className={`font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
  >
    {children}
  </a>
)
