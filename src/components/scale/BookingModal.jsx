import { useEffect, useRef, useState } from 'react'
import { BOOKING_URL, CONTACT_EMAIL } from '../../config.js'
import { OPEN_BOOKING_EVENT } from '../../lib/bookingModal.js'
import { trackEvent, withUtm } from '../../lib/analytics.js'

/* ─────────────────────────────────────────────
   Booking overlay — replaces the old permanently-visible white
   Calendly iframe. Calendly itself is unchanged (same BOOKING_URL,
   same UTM forwarding via withUtm); only the presentation moves from
   "always on the page" to "on demand, in a dark-framed modal."
───────────────────────────────────────────── */
export default function BookingModal() {
  const [open, setOpen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const closeBtnRef = useRef(null)
  const openedTrackedRef = useRef(false)

  useEffect(() => {
    const onOpen = (e) => {
      setOpen(true)
      if (!openedTrackedRef.current) {
        openedTrackedRef.current = true
        trackEvent('booking_flow_opened', { page: 'scale', location: e?.detail?.location })
      }
    }
    window.addEventListener(OPEN_BOOKING_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_BOOKING_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()

    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    function onMessage(e) {
      const evt = e?.data?.event
      if (typeof evt !== 'string' || !evt.startsWith('calendly.')) return
      if (evt === 'calendly.event_scheduled') trackEvent('booking_completed', { page: 'scale' })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (!open) return null

  const embedSrc = withUtm(
    `${BOOKING_URL}?embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'convrt.studio'}&embed_type=Inline&hide_gdpr_banner=1&background_color=0a0a0b&text_color=fafafa&primary_color=d5ff40`
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book a Discovery Call"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        style={{ animation: 'convrt-modal-fade 0.25s ease' }}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] border border-hairline-strong bg-surface-1"
        style={{ animation: 'convrt-modal-rise 0.32s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-hairline shrink-0">
          <div>
            <p className="text-sm font-semibold text-ink">Book a Discovery Call</p>
            <p className="text-[12px] text-ink-subtle mt-0.5">No hard sell — we'll first confirm there's a fit.</p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close booking dialog"
            className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 min-h-[520px] overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-ink-subtle text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
              Loading calendar…
            </div>
          )}
          <iframe
            title="Book a Discovery Call with CONVRT"
            src={embedSrc}
            onLoad={() => setIframeLoaded(true)}
            className="block h-full w-full"
            style={{ opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.35s ease', colorScheme: 'light' }}
          />
        </div>

        <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-hairline text-center">
          <p className="text-[12px] text-ink-subtle">
            Calendar not loading?{' '}
            <a
              href={withUtm(BOOKING_URL)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('primary_cta_click', { page: 'scale', location: 'modal_fallback' })}
              className="text-ink-muted underline decoration-hairline underline-offset-4 hover:text-lime hover:decoration-lime transition-colors"
            >
              Open in a new tab
            </a>{' '}
            or email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink-muted underline decoration-hairline underline-offset-4 hover:text-lime hover:decoration-lime transition-colors">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes convrt-modal-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes convrt-modal-rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
