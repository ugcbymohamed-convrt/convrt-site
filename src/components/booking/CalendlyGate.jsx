import { useEffect, useState } from 'react'
import { BOOKING_URL } from '../../config.js'
import { trackEvent, withUtm } from '../../lib/analytics.js'
import { tr } from '../../i18n/tr.js'

/* Booking calendar gate. Calendly (a third party) is NOT contacted until the visitor asks for the calendar.

   WHY. Loading Calendly's page, even inside an iframe, connects the visitor's browser to Calendly and its providers (Cloudflare, Stripe, Datadog, reCAPTCHA,
   OneTrust). A check of the embed found cookies set before any choice was made (see docs/booking-embed-and-cookies.md). The site's own cookie banner
   cannot control a third party's cookies, so the calendar loads only after an explicit click, with a plain notice. Nothing is hidden: Calendly's own cookie
   notice is NO LONGER suppressed (the embed URLs no longer carry Calendly's parameter that hides it), so Calendly's consent controls appear in the calendar.

   BOOKING STAYS POSSIBLE WITHOUT ANY CHOICE ON OUR COOKIE BANNER. The visitor can show the calendar here, or open Calendly's own page in a new tab, or email.
   Booking does not depend on analytics consent. Whether the click satisfies what privacy law requires for Calendly's cookies is a legal question for the owner's
   adviser; this component only guarantees that nothing loads before the click.

   The click is remembered for the browser session (sessionStorage, functional) so reopening the calendar does not ask again.
   Analytics: `calendar_load_click` and `calendar_newtab_click` (with `page`), through trackEvent (consent-gated like every event). */

export const CALENDLY_SESSION_KEY = 'convrt_calendly_requested'

export const CALENDLY_NOTICE =
  'Booking is run by Calendly, a separate company. Showing the calendar connects your browser to Calendly, which sets cookies of its own: necessary ones, and optional ones only if you allow them in Calendly’s cookie notice.'

const readRequested = () => {
  try { return window.sessionStorage.getItem(CALENDLY_SESSION_KEY) === '1' } catch { return false }
}
const writeRequested = () => {
  try { window.sessionStorage.setItem(CALENDLY_SESSION_KEY, '1') } catch { /* simply asks again next time */ }
}

/* children = the calendar (an iframe). `page` names the place for analytics ('roadmap' | 'scale'). `className` lets the caller keep its own spacing.
   `onShow` is optional (the Roadmap uses it to start its slow-load timer only once the calendar is really loading). */
export default function CalendlyGate({ page, children, className = '', onShow }) {
  const [shown, setShown] = useState(readRequested)
  // `onShow` runs once the calendar is being shown (after the click, or at once when the visitor already asked earlier in this session).
  useEffect(() => { if (shown && onShow) onShow() }, [shown]) // eslint-disable-line react-hooks/exhaustive-deps

  if (shown) return children

  const request = () => {
    trackEvent('calendar_load_click', { page })
    writeRequested()
    setShown(true)
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface-1/60 px-5 py-8 text-center sm:px-8 ${className}`}>
      <h4 className="font-display text-lg font-bold tracking-display text-ink sm:text-xl">{tr('Show the booking calendar')}</h4>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-muted">{tr(CALENDLY_NOTICE)}</p>
      <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={request}
          className="cta-gradient inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
        >
          {tr('Show the calendar')}
        </button>
        <a
          href={withUtm(BOOKING_URL)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('calendar_newtab_click', { page })}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong bg-surface-2 px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
        >
          {tr('Open Calendly in a new tab')}
        </a>
      </div>
    </div>
  )
}
