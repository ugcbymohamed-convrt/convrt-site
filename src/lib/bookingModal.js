/* ─────────────────────────────────────────────
   Tiny pub/sub so any component — including the sitewide Nav, which
   isn't a descendant of ScalePage — can open the /scale booking
   modal without prop-drilling or a React context provider. Nav only
   dispatches this on the /scale route; everywhere else it keeps
   linking straight to Calendly.
───────────────────────────────────────────── */
export const OPEN_BOOKING_EVENT = 'convrt:open-booking-modal'

export function openBookingModal(detail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_BOOKING_EVENT, { detail }))
}
