import { openBookingModal } from '../../lib/bookingModal.js'
import { trackEvent } from '../../lib/analytics.js'

/* ─────────────────────────────────────────────
   Single source of truth for every "Book a Discovery Call" CTA on
   /scale — one label, one click behaviour (opens the booking modal),
   one tracked event. Fixes the earlier inconsistency between "Book a
   Creative Call" and "Book a Discovery Call" by construction: every
   call site renders this instead of writing its own <a>.
───────────────────────────────────────────── */

const VARIANTS = {
  primary: 'cta-gradient text-canvas',
  ghost: 'border border-hairline text-ink hover:border-hairline-strong bg-transparent',
  inverse: 'bg-ink text-canvas hover:bg-white',
}

export default function DiscoveryCallButton({
  location,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  showIcon = true,
}) {
  const sizeClass = size === 'sm' ? 'px-5 py-2.5 text-[13px]' : size === 'lg' ? 'px-8 py-4 text-[15px]' : 'px-6 py-3 text-sm'

  const handleClick = () => {
    trackEvent('primary_cta_click', { page: 'scale', location })
    openBookingModal({ location })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform duration-150 active:scale-[0.98] ${VARIANTS[variant]} ${sizeClass} ${className}`}
    >
      {children ?? 'Book a Discovery Call'}
      {showIcon && (
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
