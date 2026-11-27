import { OFFER_PATHS } from '../../config.js'
import { trackEvent, withUtm } from '../../lib/analytics.js'

/* ─────────────────────────────────────────────
   Single source of truth for every primary CTA on /scale: one label, one
   destination, one tracked event. There is NO public booking calendar on this
   page (owner decision, 27 Nov 2026): the CTA opens the Free Creative Growth
   Roadmap, whose qualification step comes first and whose booking is shown only
   to qualified visitors (src/components/roadmap/RoadmapBooking.jsx).
   The label is the Roadmap's own existing label. The event name and its
   `location` parameter are unchanged, so existing reports keep working.
───────────────────────────────────────────── */

export const SCALE_CTA_LABEL = 'Get 5 Free Ad Concepts'

const VARIANTS = {
  primary: 'cta-gradient text-canvas',
  ghost: 'border border-hairline text-ink hover:border-hairline-strong bg-transparent',
  inverse: 'bg-ink text-canvas hover:bg-white',
}

export default function ScaleCtaButton({
  location,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  showIcon = true,
}) {
  const sizeClass = size === 'sm' ? 'px-5 py-2.5 text-[13px]' : size === 'lg' ? 'px-8 py-4 text-[15px]' : 'px-6 py-3 text-sm'

  return (
    <a
      href={OFFER_PATHS.roadmap}
      onClick={(e) => {
        trackEvent('primary_cta_click', { page: 'scale', location })
        e.currentTarget.href = withUtm(OFFER_PATHS.roadmap) // the campaign's utm_* (kept in this tab by captureAttribution) travel in the Roadmap URL; the markup stays the plain link for crawlers
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform duration-150 active:scale-[0.98] ${VARIANTS[variant]} ${sizeClass} ${className}`}
    >
      {children ?? SCALE_CTA_LABEL}
      {showIcon && (
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  )
}
