# Booking calendar (Calendly): cookies and consent

## What was found (2026-11-20, observed, not assumed)
- Both embeds (`/creative-growth-roadmap` after qualification, and the `/scale` booking modal) loaded Calendly with `hide_gdpr_banner=1`, which suppresses Calendly's own cookie notice.
- Loading Calendly's page makes the browser contact Calendly and its providers: `assets.calendly.com`, `cdn.cookielaw.org` and `geolocation.onetrust.com` (OneTrust, Calendly's consent tool), `js.stripe.com`, `www.recaptcha.net`, `accounts.google.com` / `gstatic.com`, Datadog and Airbrake endpoints.
- Calendly's server response itself sets `_calendly_session`, `__cf_bm` and `_cfuvid`. In a browser, **before any choice was made**, the page also had `__stripe_mid`, `__stripe_sid` and `_dd_s` cookies, with Calendly's consent record `OptanonConsent` showing only the "strictly necessary" group enabled.
- Calendly's own OneTrust configuration (public) lists `_calendly_session` and Cloudflare cookies as strictly necessary, and lists the Stripe cookies under "Functional" (inactive until consent), so the Stripe cookies appeared earlier than Calendly's own declaration suggests. Calendly's configuration has an opt-in rule set for EU countries. Which cookies are set depends on the visitor's location and on Calendly's own setup, which CONVRT does not control.
- This site's cookie banner (Google Consent Mode) only governs this site's own analytics. It cannot control a third party's cookies.

## What changed
- **Nothing from Calendly loads until the visitor asks for the calendar.** A short notice ("Booking is run by Calendly… sets cookies of its own: necessary ones, and optional ones only if you allow them in Calendly's cookie notice") appears with two buttons: **Show the calendar** and **Open Calendly in a new tab**. Component: `src/components/booking/CalendlyGate.jsx`, used by `RoadmapBooking.jsx` and `BookingModal.jsx`.
- **Calendly's own cookie notice is no longer hidden** (`hide_gdpr_banner` removed), so its consent controls appear inside the calendar.
- **Booking never depends on analytics consent.** A visitor who rejects every cookie on this site can still book: show the calendar, open Calendly in a new tab, or email.
- The request is remembered for the browser session only (`sessionStorage`, key `convrt_calendly_requested`) so reopening the calendar does not ask again.
- Events (consent-gated like all others): `calendar_load_click`, `calendar_newtab_click` (parameter `page` = `roadmap` or `scale`). The existing booking events are unchanged.
- Other places: the Organic Social page, the Contact draft and the `/scale` fallback link open Calendly's own page in a **new tab** (Calendly then shows its own notice); nothing changes there.

## Is the embed essential?
Booking itself does not need the embed: a plain link to Calendly works and Calendly then controls its own consent in its own page. The embed is a convenience (the visitor stays on the page) and is what lets the site see Calendly's "scheduled" message for conversion tracking. Without the embed, `roadmap_booking_confirmed` and `booking_completed` could not be measured.

## Least disruptive alternatives considered
| Option | Effect | Status |
|---|---|---|
| Click-to-load calendar + Calendly's own notice visible (**implemented**) | One extra click before the calendar; nothing loads earlier | Done |
| Load automatically but leave Calendly's notice visible | No extra click, but Calendly (and its Stripe/Datadog cookies observed above) load before any choice | Not done |
| Replace the embed with a link only | Simplest; loses on-page booking and booking conversion events | Fallback if you prefer |
| Add a third consent category for embeds to our own banner | Remembers a "load third-party booking" choice site-wide | Possible later |

## Decisions for a privacy/legal adviser (not legal conclusions)
1. Whether a deliberate click on "Show the calendar", with the notice above, is enough for the cookies Calendly sets, or whether a stronger consent step is needed.
2. Whether the cookies observed before Calendly's own choice (`__stripe_*`, `_dd_s`) are acceptable as strictly necessary for booking, given Calendly's own classification.
3. Whether CONVRT should accept joint-controller or processor terms with Calendly and what the privacy policy must say (draft text added in `src/content/trustPages.js`).
4. Whether direct new-tab links are preferred over the embed for EU visitors.
