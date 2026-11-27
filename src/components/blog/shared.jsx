import { currentLocale } from '../../i18n/locale.js'
import { blogUi } from '../../content/blogUi.js'
import { useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { usePressFeedback } from '../../lib/usePressFeedback.js'
import CoverArt from './CoverArt.jsx'

/* Small pieces shared by the blog index and the article template. */

export const PINK = '#F472B6'

const dateFormats = {}
/* A date in the language of the page it appears on (English: "March 3, 2026"). */
export const formatDate = (ymd, locale = currentLocale()) => {
  const d = new Date(`${ymd}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return ''
  const tag = blogUi(locale).dateLocale
  return (dateFormats[tag] ||= new Intl.DateTimeFormat(tag, { dateStyle: 'long', timeZone: 'UTC' })).format(d)
}

export function ArrowUpRight({ className = '' }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" aria-hidden="true">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* The status label used on every planned topic. Pink = "not yet", lime = interactive. */
export function ComingSoonPill({ children = 'Coming soon', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#F472B6]/40 bg-canvas/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F472B6] ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#F472B6]" aria-hidden="true" />
      {children}
    </span>
  )
}

export function CategoryLabel({ children, className = '' }) {
  return <p className={`text-xs font-semibold uppercase tracking-[0.14em] text-lime ${className}`}>{children}</p>
}

/* The site's primary lime CTA (same classes as the hero / roadmap / hooks buttons). */
export function PrimaryCta({ href, children, event, params, className = '' }) {
  const press = usePressFeedback()
  return (
    <a
      href={href}
      onClick={() => event && trackEvent(event, params)}
      {...press}
      className={`hero-cta cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
    </a>
  )
}

/* Thumbnail for a card: the article's own image when it has one, otherwise the abstract
   SVG graphic. The box has a fixed 16:10 ratio, so nothing shifts while images load, and
   a missing/broken file falls back to the graphic instead of leaving a hole. */
export function Thumb({ item, priority = false, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showImage = item.image && !failed
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-surface-1 ${className}`}>
      {showImage ? (
        <img
          src={item.image}
          alt={item.imageAlt || ''}
          width="1200"
          height="750"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <CoverArt
          art={item.art}
          category={item.category}
          className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
    </div>
  )
}
