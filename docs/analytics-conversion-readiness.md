# Analytics and conversion readiness (21 Nov 2026)

Scope: the remaining blockers after your Tag Assistant check (GTM-W7N2RPCQ and GA4 G-7R9WTV2XQF working on the combined Preview; `roadmap_form_started` and `referral_cta_click` seen; analytics-only consent grants `analytics_storage`; advertising stays denied with Marketing OFF). I did **not** repeat those. I did not touch the GA4 or GTM accounts.

## What I tested this session (local build with a FAKE GTM id, every API mocked in the page; nothing reached Google, MailerLite, Resend or Calendly)
| Check | Result |
|---|---|
| No Google script before consent | Pass: no `googletagmanager` script until a category is granted |
| Reject all, then submit the three forms | Pass: forms succeed; **zero** analytics events in the dataLayer |
| Analytics-only consent | Pass: Consent Mode update shows `analytics_storage: granted` and all `ad_*` **denied** |
| Events sent exactly once per action | Pass for `hooks_industry_selected`, `hooks_signup_submitted`, `hooks_signup_success` (one each; 750 ms de-dupe) |
| Consent withdrawal | Pass: update to `analytics_storage: denied`, later actions push **no** events, no `_ga*` cookies, stored choice `analytics:false` |
| Marketing-email consent separate from cookie consent | Pass: the email box never touches `convrt_consent_v1`, and ticking it left the dataLayer unchanged; a test asserts neither module references the other |
| No personal data in analytics events | Pass: the dataLayer contained no email, consent flag or wording after a ticked submission; a test scans every form component's `trackEvent` calls |
| Forms with and without marketing consent | Pass for hooks, free video application and referral (declined: request sent with `marketingConsent:false`, success screen shown; accepted: `marketingConsent:true` + `marketingConsentVersion:"v2"`). The referral form still requires its own processing consent (refused client-side without it) |

## What is **not** verified (do not treat conversion tracking as proven)
1. **Real successful applications**: the three success events fire only after the API answers `{ok:true}`; I proved that against mocks only. A real submission on the Preview (with MailerLite configured) is needed to see them in GA4 DebugView.
2. **Real confirmed bookings**: `roadmap_booking_confirmed` and `booking_completed` fire only on Calendly's own `calendly.event_scheduled` message from origin `https://calendly.com` (spoofing tested). A real booking in the embed is needed. A booking made on a Calendly page opened in a new tab is **invisible** to the site.
3. **GA4 receiving the events**: only your Tag Assistant run confirms that for two events. The four success events and both booking events are not yet confirmed in GA4.
4. **Google data-processing terms** accepted for the Analytics and Tag Manager accounts (owner dashboard check; `docs/privacy-provider-checklist.md`).
5. **Retention toggle** "Reset user data on new activity" (recommended OFF; `docs/data-retention-and-deletion.md`).
6. **Hooks success is "saved", not "confirmed"** when MailerLite double opt-in is on.

## Recommended GA4 key events (five), nothing else
`roadmap_booking_confirmed`, `booking_completed`, `risk_free_application_success`, `hooks_signup_success`, `referral_application_success`.

Do **not** mark as key events: `roadmap_qualified` (a qualified visitor, nothing is sent to CONVRT), `*_submitted`, `*_submit`, `*_started`, `*_click`, `calendar_load_click`, `calendar_newtab_click`, `roadmap_calendar_viewed` (intent or attempts, not leads). `hooks_signup_success` is a lead-magnet signup, a softer conversion than the other four; mark it but report it separately.

## Order to finish verification (needs you)
1. Set the Preview environment (MailerLite token and groups, `MAILERLITE_GROUP_MARKETING_ID`, fields created, Resend key) per `docs/marketing-consent-mailerlite.md`.
2. In GTM Preview / GA4 DebugView on the Preview URL: accept analytics, submit one real test application per form with **your own test address**, once with and once without the marketing box, and book one real test slot in the embed; then cancel the booking and delete the test contacts.
3. Confirm each of the five events appears once; then mark the five key events; then withdraw consent and confirm nothing more arrives.
4. Only then publish the GTM container.
