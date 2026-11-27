import { CONTACT_EMAIL } from '../../config.js'
import { trackEvent, withUtm } from '../../lib/analytics.js'
import { tr } from '../../i18n/tr.js'

/* ─────────────────────────────────────────────
   Booking step: shown ONLY to visitors the qualification rules approved.

   LINK OUT ONLY (owner decision, 27 Nov 2026, after the privacy audit: docs/booking-embed-and-cookies.md). Nothing from Calendly is ever loaded on our pages:
   no iframe, no script, no preconnect. The visitor opens Calendly's own page in a NEW TAB (target=_blank, rel=noopener noreferrer), where Calendly's own cookie
   notice and consent controls govern what is set. The campaign details already stored for the tab pass through `withUtm` exactly as before. An email address is
   the alternative.

   Booking details (name, email, anything else) are handled entirely by Calendly's own booking form and confirmation emails. Nothing from the qualification
   answers is sent anywhere.

   Tracking: `calendar_newtab_click` (parameter page = roadmap), consent-gated like every event. A completed booking can no longer be observed by this site
   (it used to be the booking message the embedded calendar posted), so no booking-confirmed event exists. Nothing personal is sent to analytics.
───────────────────────────────────────────── */

export default function RoadmapBooking({ bookingUrl, headingRef }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lime">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-lime/50 text-[10px]" aria-hidden="true">✓</span>{tr('You’re a good fit')}</div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-2xl font-bold leading-tight tracking-display text-ink outline-none sm:text-3xl">
        {tr('Choose a time for your strategy session.')}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted" role="status">
        {tr('Pick a time on Calendly to book your free Creative Growth Roadmap session. You’ll enter your details there and Calendly will confirm your booking. Your concepts are prepared for confirmed bookings, so please choose a time that works.')}
      </p>

      <div className="mt-6 flex flex-col items-start gap-3">
        <a
          href={withUtm(bookingUrl)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('calendar_newtab_click', { page: 'roadmap' })}
          className="cta-gradient inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
        >
          {tr('Open Calendly in a new tab')}
        </a>
        <p className="max-w-md text-[13px] leading-relaxed text-ink-subtle">
          {tr('Calendly opens in a new tab. It is run by Calendly, a separate company, under its own privacy and cookie notices.')}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-subtle">
        {tr('Prefer email? Write to')}{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-lime">{CONTACT_EMAIL}</a>.
      </p>
    </div>
  )
}
