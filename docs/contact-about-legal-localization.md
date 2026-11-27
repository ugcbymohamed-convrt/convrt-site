# About, Contact and legal pages in four languages (Nov 2026)

Branch `contact-about-legal-localization`, Preview only. Nothing is deployed to Production and nothing is merged.

## What changed

| Area | Result |
|---|---|
| **Contact** (`/contact`, `/es/contact`, `/fr/contact`, `/ar/contact`) | One redesigned, reusable page (`src/components/contact/ContactPage.jsx`, copy in `src/content/contactCopy.js`): hero, general inquiry form, "Prefer email?", compact cards, the site's FAQ accordion, the existing Free Creative Growth Roadmap CTA. **No Calendly, booking link, widget or scheduling prompt.** The "Who runs this website" section is gone (operator details stay in the Legal Notice, linked from the footer). |
| **About** | English unchanged (text page). Spanish, French, Arabic: one premium page (`src/AboutPage.jsx`, copy in `src/content/aboutCopy.js`) from the owner-approved copy. The old Spanish About (`src/i18n/es/about.js`) is replaced. |
| **Privacy Policy, Terms and Conditions, Legal Notice** | Spanish, French and Arabic translations of the English documents (`src/content/legal/es|fr|ar.js`), rendered by the existing reading template. **Held** until `LEGAL_TRANSLATIONS_APPROVED` (`src/config.js`) is `true`. |
| Navigation / footer | Approved names in four languages (`src/i18n/trustLinks.js`); the header "Contact" link now opens `/contact`; footer links go to the visitor's language (legal documents: once approved). |
| SEO | Titles as supplied; self-canonicals; reciprocal hreflang for About and Contact; sitemap; localized structured data (`AboutPage` / `ContactPage`, one Organization). |
| Server | `POST /api/contact` (`api/contact.js`, `api/_lib/contact.js`): Resend only (the shared `sendOwnerAlert`), labelled "General inquiry". `notify.js`, MailerLite code, and every other form are untouched. |

## URLs

| | English | Spanish | French | Arabic |
|---|---|---|---|---|
| About | /about | /es/about | /fr/about | /ar/about |
| Contact | /contact | /es/contact | /fr/contact | /ar/contact |
| Privacy Policy | /privacy | /es/privacy (held) | /fr/privacy (held) | /ar/privacy (held) |
| Terms and Conditions | /terms | /es/terms (held) | /fr/terms (held) | /ar/terms (held) |
| Legal Notice | /legal-notice | /es/legal-notice (held) | /fr/legal-notice (held) | /ar/legal-notice (held) |

Existing URLs did not change. "Held" = built and reachable for review, `noindex, follow`, self-canonical, a visible "translation under review" notice, no hreflang, not in the sitemap, not linked from the footer or the forms (those keep the English document, labelled "in English"). On Vercel previews and localhost the footer and form links show the final localized state after hydration (`usePreviewHost`), so the footer can be reviewed without the live site linking unapproved text.

**To publish the legal translations (after owner and lawyer approval):** set `LEGAL_TRANSLATIONS_APPROVED = true` in `src/config.js`, update the held-state test in `tests/legal-translations.test.mjs` (the simulated-approval test already proves what happens), build, merge. Nothing else.

## General inquiry form

Fields: full name*, email*, brand or company*, website or social media, service*, estimated budget, project description*, and a required consent box (links the Privacy Policy). `*` required. Website is optional and accepts an address, a social profile link or an `@handle`, so prospects without a company website are not turned away. Services: UGC Videos, Spokesperson Videos, Organic Social Video, SaaS & App Videos, Custom Project, Not sure yet. Honeypot field; same-origin check; 16 KB body limit; server-side validation (`src/lib/contactInquiry.js`, shared with the browser).

Delivery: one Resend email to the owner (`NOTIFY_EMAIL_TO`, default mohamed@convrt.studio), subject `[General inquiry] Name (Company)`, Reply-To = the visitor, with type, service, budget band, language, source page (derived from the language, never from the request) and consent. No MailerLite record, no booking link, no automatic scheduling, no promised reply time. If the email cannot be sent (no `RESEND_API_KEY`, Resend down) the visitor sees the approved error message, never a false success.

**Needs a check on Vercel before this works for real:** `RESEND_API_KEY` must be set for the Preview and Production environments, and `NOTIFY_EMAIL_FROM` must be a sender Resend can deliver from (the default `onboarding@resend.dev` only delivers to the Resend account owner).

## Analytics

New events only (no personal data; params are the page language and the service category): `contact_page_view`, `contact_form_start`, **`contact_inquiry_success`** (the one conversion; fires only after the server confirmed delivery, never on view, click or failed attempt), `contact_inquiry_error`, `contact_link_click` (`link`: linkedin | instagram | creators | referrals | founder_linkedin), `contact_email_click`, `contact_roadmap_cta_click`, `contact_pricing_link_click`, `contact_founder_email_click`, `about_page_view`, `about_roadmap_cta_click`, `about_services_cta_click`. Measured separately from `referral_application_*`, the Roadmap, free-video and hooks events. There was no Calendly tracking on the old Contact page. Events still pass through `trackEvent`, so they only fire with consent when GTM is configured (unchanged).

## Public Calendly links elsewhere (for your review; none changed)

Static HTML that links the booking page: `/scale`; `/pricing` and its es/fr/ar pages; `/social-media-video-production` (the organic strategy call) and its es/fr/ar pages; and the **operator list** of the Privacy Policy and Legal Notice in all four languages ("book a call"). The Privacy Policy section "Booking a call" also describes the calendar as a public feature. Runtime only (not in the static HTML): the Roadmap booking shown to qualified visitors (`CalendlyGate`). The Contact pages contain none.

## Decisions and flags for the owner

1. **Legal translations**: approve them (ideally after a lawyer reads the clause-level comparison). Items a lawyer should look at are flagged in the review pack (`CONVRT/Claude/contact-legal-review`). "Conditions générales" usually means general terms of *sale* in France while the English is website terms of use (the approved name was kept).
2. **Source issues found in the English documents (not changed, not reconciled):** the Legal Notice says prices are in US dollars while the Spanish and French sites show euros; the Terms say a paid engagement starts only when scope, price and terms are agreed in writing but say nothing of the 3-month / 6-month commitments, refunds, timelines, revisions or subscription terms on the pricing pages; the Privacy Policy does not cover the general contact form or the project-application funnel, still describes the Calendly calendar as a public feature, and describes the marketing checkbox as appearing next to forms where the translated forms do not show it; the operator list publishes the Calendly link; the effective date (21 Nov 2026) may predate later changes. The translations follow the English exactly.
3. **English renames** (to the approved names): "Terms of Service" → "Terms and Conditions" (h1, SEO title, footer, links); "Legal Notice (Aviso Legal)" → "Legal Notice"; the footer says "About CONVRT" and "Terms and Conditions". Clause text unchanged.
4. **Founder name** (settled): the owner confirmed the full name for the About pages: Mohamed Doukkali Azizi (Spanish, French) and «محمد الدكالي العزيزي» (Arabic). It replaces the shorter forms in the supplied copy and matches the legal name used in structured data and the legal documents.
5. **Figures**: the four founder-experience figures match the supplied copy exactly in all languages (read from `siteStats.js`); the disclosure is printed under them; no review or rating structured data.
6. **About**: English is unchanged and keeps its text layout (you asked to preserve its copy); say so if you want it restyled with the premium layout. There is no standalone founder photograph on the site: the founder stills have English captions burnt in, so none was used. The previous Spanish About carried statements (production model, Almería base, case-study links) that the supplied copy does not; they are no longer on `/es/about`.
7. **Budget bands** (settled 2026-11-27: everything in EUR on es/fr; the Roadmap and free-trial forms now show the same EUR bands too; option values stay English): the only approved ranges are the monthly ad-spend brackets of the Roadmap and free-video forms (Under $5,000 / $5,000–$20,000 / $20,000+). The form reuses those band boundaries plus "not sure yet" (USD in English and Arabic). For Spanish and French the same boundaries are shown in EUR (Menos de 5.000 € / Entre 5.000 € y 20.000 € / Más de 20.000 €): owner-confirmed as EUR; there is no minimum budget and no band blocks an inquiry.
8. **Required fields** (my call, easy to change): name, email, brand or company, service, description, consent.
9. **Microcopy not in the supplied copy** (written in the same register, marked `UNAPPROVED MICROCOPY` in `src/content/contactCopy.js`): field-level error messages, "Optional", "Sending…", the consent sentence, "See the Privacy Policy", "Back to home", the heading above the connection cards in es/fr/ar, the founder-LinkedIn link label, the form's accessible name; and the legal-page "translation under review" notice.
10. The "Join our creator network" card opens the existing Google Form, which is in English.
11. Pre-existing, not changed: the homepage final CTA button reads "Book a Creative Call" but goes to the Roadmap; the Roadmap's alternative for unqualified visitors points to `/contact`, which is now the inquiry form.

## Sitemap inventory (built)

- **English (14):** `/`, `/pricing`, `/ugc-video-agency`, `/spokesperson-video-production`, `/social-media-video-production`, `/saas-video-production`, `/creator-showcase`, `/case-studies/graspo`, `/case-studies/elyon`, `/about`, `/contact`, `/privacy`, `/terms`, `/legal-notice`
- **Spanish (11):** `/es/`, `/es/ugc-video-agency`, `/es/spokesperson-video-production`, `/es/social-media-video-production`, `/es/saas-video-production`, `/es/pricing`, `/es/creator-showcase`, `/es/about`, `/es/contact`, `/es/case-studies/graspo`, `/es/case-studies/elyon`
- **French (11):** `/fr/`, the four services, `/fr/pricing`, `/fr/creator-showcase`, `/fr/case-studies/graspo`, `/fr/case-studies/elyon`, `/fr/about`, `/fr/contact`
- **Arabic (10):** `/ar/`, the four services, `/ar/case-studies/graspo`, `/ar/pricing`, `/ar/creator-showcase`, `/ar/about`, `/ar/contact`

Not in the sitemap: the nine held legal translations, success states (there is no confirmation URL: the confirmation replaces the form in place), and any parameter variant.

## Review pack

`~/Desktop/CONVRT/Claude/contact-legal-review/` (outside the repository): `00-README.md`, `legal-es|fr|ar.md` (complete translations), `comparison-es|fr|ar.html` (clause-level, English | translation, with review notes; open in a browser) and `.md`, `notes-*.json`. Regenerate with `node scripts/legal-review-export.mjs <folder>`. Structural fidelity is proven by `tests/legal-translations.test.mjs` (`node scripts/legal-structure-check.mjs es|fr|ar`); legal equivalence of meaning is not, and these are not legally certified.

## Tests

`tests/contact-inquiry.test.mjs`, `tests/legal-translations.test.mjs`, `tests/about-localized.test.mjs` are new; the older suites that pinned "About/Contact/legal are English-only" were updated to the new state (registry lists, hreflang, sitemap, selector, footer, Arabic no-VAT rule now exempts the legal documents, which must keep the legally required tax disclosure).

## Currency on the Spanish and French sites (owner, 2026-11-27: EVERYTHING in EUR)

Done: Contact budget bands, Roadmap and free-trial budget bands, referral commission cap (500 €) and example (5.000 €), and the Legal Notice sentence on prices (es/fr now say euros: a deliberate departure from the English source, flagged for the lawyer). **Still USD on es/fr, left on purpose:** the client-reported results on the Elyon and Graspo case studies and the Elyon figure on the UGC page (3.421,25 USD revenue, 0 USD ad spend, etc.): they were earned in dollars and converting them would invent a figure. Owner decision (2026-11-27): they stay in USD, because the clients are outside Spain.

## Final consolidation (27 Nov 2026)

- **English About** now uses the same premium layout as es/fr/ar (`src/components/about/EnglishAbout.jsx`, shared `aboutParts.jsx`). Every English sentence still comes from `TRUST_CONTENT.about` (`src/content/trustPages.js`), found by its heading, so the GEO tests and the About JSON-LD read the same words. Only the badge/figure-caption/button labels are new layout chrome.
- **No unrestricted public Calendly link** in any language. The Organic route (`ORGANIC_CTA`: Organic page hero/proof/final CTA/FAQ, Pricing promo and final CTA) is now `/contact?service=organic` (localized with `hrefFor`, which now keeps a query string); `ContactForm` preselects a known `?service=` key after mount. The Legal Notice/Privacy "book a call" contact line became "contact form" (en/es/fr/ar). `cta.js` fallbacks and the unused hooks placeholder point at Contact. Calendly stays in: the Creative Growth Roadmap booking (shown only after qualification), `/scale` (noindex paid landing page, not linked from the site, **left unchanged: owner decision**) and private invitations. `tests/no-public-calendly.test.mjs` fails if any other built page links to calendly.com.
- **Legal translations stay held** (`LEGAL_TRANSLATIONS_APPROVED = false`); the commit that published them (7c995c1) was reverted.
- **Privacy Policy** now describes the General enquiry form and the Project application (what is collected, campaign details, Resend, no marketing list), the Resend line says "applies or sends an enquiry", the `convrt_scale_attribution` line says it may be included in an application, and the marketing-box sentence says which forms have no box. Spanish, French and Arabic held translations carry the same clauses. "Last updated" is 27 November 2026 in all four. These additions are descriptive of what the code does and need the owner's and lawyer's confirmation (`docs/english-legal-gaps-DRAFT.md` lists the open commercial questions for the Terms; none were invented).

## Status 27 Nov 2026 (final sign-off)

The owner approved publishing the Spanish, French and Arabic Privacy Policy, Terms and Conditions and Legal Notice (`LEGAL_TRANSLATIONS_APPROVED = true` in `src/config.js`). They are translations of the English documents, not lawyer-certified; the review files and the open questions (cancellation-cost calculation, provider safeguards, MailerLite entity, retention routine) are in `CONVRT/Claude/contact-legal-review/`. Setting the flag back to `false` holds them again (noindex, review notice, out of the sitemap).
