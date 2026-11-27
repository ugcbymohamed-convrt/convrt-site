# Public Calendly links removed (27 Nov 2026)

Owner decision: no unrestricted public booking links on the website, in any language. The Roadmap's qualification-first booking and the owner's private invitations stay.

| Where | Before | Now |
|---|---|---|
| `/scale` (English only, noindex) | "Book a Discovery Call" opened an in-page Calendly modal (hero fallback, case studies, system, booking panel, FAQ, final CTA, sticky mobile bar, header) | One component, `ScaleCtaButton` (and the sticky bar): the existing Roadmap label "Get 5 Free Ad Concepts" → `/creative-growth-roadmap` (qualification first). `BookingModal.jsx` and `lib/bookingModal.js` deleted. Event `primary_cta_click` (`page: scale`, same `location` values) kept; `booking_flow_opened` / `booking_completed` (scale) retired. |
| Header on `/scale` | Opened the modal | The normal header CTA (Roadmap) |
| Organic CTAs on `/pricing` (promo and closing CTA) and `/social-media-video-production` (hero, proof, final CTA, FAQ link) in en/es/fr/ar | Calendly strategy call, new tab | `ORGANIC_CTA`: `/project-application?package=custom-organic&from=pricing` (from Pricing) or `&from=organic-social` (Organic page), localized with `hrefFor`. Labels unchanged. `SOURCE_PAGES` now `pricing`, `organic-social`. |
| `OfferPlaceholderPage` (free-hooks placeholder) | "Book a Creative Call" → Calendly | "Get 5 Free Ad Concepts" → Roadmap |
| `src/i18n/cta.js` fallbacks (a language whose Roadmap flow is switched off; unused today: all flows are on) | Calendly, new tab | The Contact page (`CONTACT_PATH`), label "Contact" |
| Contact pages | none | none |
| Roadmap booking (`CalendlyGate` in `RoadmapBooking`) | qualified visitors | **unchanged** |
| Privacy Policy and Legal Notice (operator list "book a call") | linked | revised on the `legal-revision-calendly` branch, not here |

Other changes: `hrefFor` now keeps a query string when it localizes a path (`/project-application?package=…` → `/es/project-application?package=…`); the Arabic "(in English)" label logic ignores the query.

Copy changed on `/scale` (English only; the page promised a call that can no longer be booked): the booking sentences now say "Roadmap strategy session" (Roadmap's own term) and the final CTA sentence starts "Start your free Creative Growth Roadmap and…"; the page's SEO title/description (noindex page) no longer say "Book a discovery call".

Left as it is (sentences, not links; the Roadmap itself offers a strategy session to qualified brands): the homepage Services card "free 20-minute strategy call" (and its es/fr/ar translations), the Roadmap FAQ and booking texts.
