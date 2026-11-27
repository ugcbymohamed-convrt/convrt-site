# Booking calendar (Calendly): cookies and consent

## CURRENT STATE (27 Nov 2026): the Roadmap booking is LINK-OUT ONLY. The embed was removed.
The privacy audit of 27 Nov 2026 (`CONVRT/Claude/contact-legal-review/privacy-verification-2026-11-27.md`) re-confirmed that once Calendly's page loads, `__stripe_mid`, `__stripe_sid` and `_dd_s` are already set before the visitor uses Calendly's own cookie notice, while Calendly's own consent record shows only "strictly necessary" granted. The owner chose **option A**: qualified visitors now see a button, **Open Calendly in a new tab** (`target="_blank" rel="noopener noreferrer"`, the existing UTM pass-through `withUtm`), and the email address. Nothing from calendly.com is ever loaded on our pages (no iframe, script or preconnect; `tests/booking-gate.test.mjs`, `tests/no-public-calendly.test.mjs`). Calendly's own page and notice govern what Calendly sets there.
* Component: `src/components/roadmap/RoadmapBooking.jsx` (shown only to qualified visitors, inside `RoadmapApplication`). `CalendlyGate.jsx`, the iframe, the slow-load frame, the `postMessage` listener and the session key `convrt_calendly_requested` were **removed** (the Privacy Policy's storage list must drop that key).
* Event kept: `calendar_newtab_click` (`page: roadmap`). Events retired: `roadmap_calendar_viewed`, `roadmap_booking_confirmed`, `calendar_load_click`. **A completed booking can no longer be observed by this site** (it came only from the embed's message); count bookings in Calendly itself.
* Strings changed (en/es/fr/ar): the booking paragraph now says "Pick a time on Calendly…" instead of "…below…"; one note was added under the button ("Calendly opens in a new tab. It is run by Calendly, a separate company, under its own privacy and cookie notices."). Dictionary entries only used by the embed were deleted.

Everything below is the HISTORY that led here.

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
- Other places: **none since 27 Nov 2026.** The Organic Social page, `/pricing`, `/scale` and the Contact page no longer link Calendly (owner decision; see docs/calendly-removal.md). The gate remains only inside the Roadmap booking, for qualified visitors.

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

## Update 21 Nov 2026: what the official sources say, and what is still open (the owner chose to KEEP the embed)

**Kept exactly as it is:** click-to-load gate, "Show the calendar", Calendly's own cookie notice, the new-tab alternative, booking when analytics is rejected, booking events only from origin `https://calendly.com`, the session flag `convrt_calendly_requested`. Tests in `tests/booking-gate.test.mjs` cover these and still pass.

**What I can and cannot state about the third-party cookies (accurately):**
* *Observed by me (20 Nov, above):* with Calendly loaded and no choice made, `__stripe_mid`, `__stripe_sid` and `_dd_s` were present besides `_calendly_session`, `__cf_bm`, `_cfuvid` and the OneTrust record. Stripe (payments/fraud) and Datadog (monitoring) scripts are part of Calendly's page; their cookies appear because Calendly's page loads them.
* *Calendly's own words (help centre, via search summary):* it sets cookies even if the banner is hidden, and recommends waiting to load Calendly until visitors accept performance cookies. A third-party summary of its terms says the site that embeds it must show Calendly's banner or run its own consent: **read the terms yourself; I did not**.
* *Not established:* whether the Stripe/Datadog cookies are "strictly necessary" for booking (Calendly lists the Stripe ones as functional), or whether a click on "Show the calendar" is valid consent for them. **Click-to-load does not by itself satisfy GDPR/ePrivacy.** It only guarantees that nothing loads before an informed action; the cookies that follow may still need a legal basis.

**Options to remove or reduce non-essential storage before consent (not implemented, listed safest first):**
1. **Make the button a consent step for the embed** (recommended if your adviser wants more than today): rename it "Load Calendly and accept its cookies" with a link to Calendly's cookie information, and remember that choice as a third category in `convrt_consent_v1` ("Third-party booking embed"). Same booking experience, a clearer record, no new library.
2. **Default to the new-tab link for visitors in the EEA/UK** and show the embed only after the stronger step in 1. Needs a location signal (the site has none); skip unless your adviser insists.
3. **Replace the embed by the link only.** Simplest and the strongest on cookies, but you lose on-page booking and the booking conversion events (`roadmap_booking_confirmed`, `booking_completed`), which come only from the embed.
4. **Hosting a Calendly alternative** that does not load third-party scripts: a different product; out of scope.

**Unresolved legal questions (for your adviser):** is the click enough for Calendly's cookies; are `_dd_s` and `__stripe_*` strictly necessary; is Calendly a processor or an independent controller; who must obtain consent, the site or Calendly (the embed shows Calendly's own notice, which may be the answer).
