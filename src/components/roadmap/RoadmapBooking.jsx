import { useEffect, useRef, useState } from 'react'
import { CONTACT_EMAIL } from '../../config.js'
import { trackEvent, withUtm } from '../../lib/analytics.js'

/* ─────────────────────────────────────────────
   Booking step — shown ONLY to visitors the qualification rules approved.

   Booking details (name, email, anything else) are handled entirely by
   Calendly's own booking form and confirmation emails. Nothing from the
   qualification answers is sent anywhere.

   Tracking:
   • roadmap_calendar_viewed   — the calendar iframe finished loading.
   • roadmap_booking_confirmed — THE conversion. Fired ONLY when Calendly
     itself posts `calendly.event_scheduled` from https://calendly.com.
     Seeing the calendar or clicking in it never counts as a booking.
   Nothing personal is sent to analytics.
───────────────────────────────────────────── */


const SLOW_LOAD_MS = 8000

function buildEmbedUrl(base) {
  const url = new URL(base)
  url.searchParams.set('embed_domain', window.location.hostname)
  url.searchParams.set('embed_type', 'Inline')
  url.searchParams.set('hide_gdpr_banner', '1')
  url.searchParams.set('background_color', '0a0a0b')
  url.searchParams.set('text_color', 'fafafa')
  url.searchParams.set('primary_color', 'd5ff40')
  return withUtm(url.toString())
}

export default function RoadmapBooking({ bookingUrl, headingRef }) {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [booked, setBooked] = useState(false)
  const viewedRef = useRef(false)
  const bookedRef = useRef(false)
  const embedSrc = useRef(buildEmbedUrl(bookingUrl)).current

  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), SLOW_LOAD_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== 'https://calendly.com') return // ignore anything not from Calendly
      if (e.data?.event !== 'calendly.event_scheduled') return
      if (bookedRef.current) return
      bookedRef.current = true
      trackEvent('roadmap_booking_confirmed')
      setBooked(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const onLoad = () => {
    setLoaded(true)
    if (!viewedRef.current) {
      viewedRef.current = true
      trackEvent('roadmap_calendar_viewed')
    }
  }

  const fallbackHref = withUtm(bookingUrl)
  const showFallbackNotice = slow && !loaded

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lime">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-lime/50 text-[10px]" aria-hidden="true">✓</span>
        You’re a good fit
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-2xl font-bold leading-tight tracking-display text-ink outline-none sm:text-3xl">
        {booked ? 'You’re booked. See you on the call!' : 'Choose a time for your strategy session.'}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted" role="status">
        {booked
          ? 'Calendly will email your confirmation and meeting details. We’ll prepare your roadmap concepts ahead of the session.'
          : 'Pick a time below to book your free Creative Growth Roadmap session. You’ll enter your details on the next screen and Calendly will confirm your booking. Your concepts are prepared for confirmed bookings, so please choose a time that works.'}
      </p>

      {/* Fixed-height frame: reserved up-front so revealing the calendar never shifts the page. */}
      <div className="relative -mx-5 mt-6 h-[760px] overflow-hidden border-y border-hairline bg-canvas sm:mx-0 sm:h-[700px] sm:rounded-2xl sm:border">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-ink-subtle" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime motion-reduce:animate-none" />
            Loading calendar…
          </div>
        )}
        <iframe
          title="Book your Free Creative Growth Roadmap session with CONVRT"
          src={embedSrc}
          onLoad={onLoad}
          className="block h-full w-full transition-opacity duration-300 motion-reduce:transition-none"
          style={{ opacity: loaded ? 1 : 0, colorScheme: 'light' }}
        />
      </div>

      <p className={`mt-4 text-sm leading-relaxed ${showFallbackNotice ? 'text-ink' : 'text-ink-subtle'}`}>
        {showFallbackNotice ? 'The calendar is taking a while to load. ' : 'Calendar not loading? '}
        <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-lime underline underline-offset-4">
          Open it in a new tab
        </a>{' '}
        or email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-lime">{CONTACT_EMAIL}</a>.
      </p>
    </div>
  )
}
