# Project application: the purchase-intent funnel (Nov 2026)

Two conversion journeys now coexist:

| Visitor | Journey |
|---|---|
| Exploring | Free Creative Growth Roadmap (`/creative-growth-roadmap`) → qualification form → five personalised ad concepts. **Unchanged.** |
| Ready to buy | `/pricing` → a package card → **`/project-application`** with the package selected → internal qualification → the owner decides the next step personally. |

The second journey gives the visitor **no calendar, booking link, Calendly embed, automatic meeting invitation, payment request or checkout**, and sends the applicant no e-mail. The acknowledgement is a qualification step, not a purchase agreement, a payment authorization or acceptance of a contract.

## URLs
`/project-application`, `/es/project-application`, `/fr/project-application`, `/ar/project-application` (one reusable page; `src/ProjectApplicationPage.jsx`). A package is selected with identifiers only: `?package=<id>&billing=<monthly|one-time>&from=pricing`.

| `package` | `billing` | Questions |
|---|---|---|
| `sprint`, `sprint-plus` | `monthly` or `one-time` | paid |
| `organic-light`, `organic-growth` | `monthly` (the only option) | organic |
| `custom-paid` | none | paid + custom |
| `custom-organic` | none | organic + custom |

No package or price is retyped anywhere: `selectionFor(locale, package, billing)` (`src/lib/projectApplication.js`) looks the price up in the existing pricing configuration: English = the business data (USD), Spanish = the owner-approved EUR table, French = the same EUR amounts, Arabic = the English USD amounts (`src/i18n/pricing.js`). Commitments come from `COMMITMENT` (3 months, 30 days' notice; monthly Sprint only) and `ORGANIC_COMMITMENT` (6 months); a one-time package shows no commitment; a custom project says the final quotation depends on the requirements. No VAT wording on the Arabic page (owner rule); « hors TVA » / « sin IVA » / "Prices exclude VAT" elsewhere.

Entering with a missing or invalid package shows a package chooser instead of a form. "Change package" (summary card) opens the same list and a Monthly / One-time switch for the Sprints; "Back to pricing" returns to `/pricing#packages`. The URL is kept in step (`history.replaceState`), and the language selector carries the package to the other language.

## The form (two steps)
**Step 1, About your brand** (all required): full name, e-mail, brand or company name, website / app-store listing / social URL (any https URL; no website needed).

**Step 2, About your project**: description (one open field, required), objective, **conditional questions**, readiness, desired start date, production language(s), acknowledgement.

| Package group | Conditional questions |
|---|---|
| Sprint, Sprint Plus | monthly advertising spend (Not running paid ads yet / Under 5,000 / 5,000–15,000 / 15,000–50,000 / 50,000+; euros for es and fr, dollars for en and ar: qualification ranges, never conversions); objective: launch a product or campaign / test concepts / scale / improve creative performance / other (+ a few words). "Not running ads yet" is a valid answer: nobody is auto-rejected. |
| Organic Light, Organic Growth | current social activity (just starting / occasional / regular but needs better content / wants to outsource); objective: awareness / consistent presence / commercial inquiries / engagement / new markets / other; social accounts (optional). No paid-ads question. |
| Custom paid / custom organic | everything above for the service, **plus** type of production (UGC, Spokesperson, organic social, SaaS and app, other; multi-select) and estimated budget (Under 3,000 / 3,000–6,000 / 6,000–12,000 / 12,000–25,000 / 25,000+ / Not sure yet). No minimum price is stated and nobody is rejected on budget. |
| Every package | readiness (As soon as possible / Within 30 days / Within 1–3 months / Still exploring), desired start date, languages (English, Spanish, French, Arabic, other). |

Acknowledgement: standard packages "I understand the pricing and terms of my selected package."; custom "I understand that pricing will be determined based on the final project requirements." plus a note that it is not a purchase agreement. All copy (owner-supplied headline, description, confirmation, button and CTA labels verbatim) is in **`src/i18n/projectApplicationCopy.js`**, in the four languages.

## Delivery (server): `api/project-apply.js` → `api/_lib/projectApplication.js`
- **The owner is the system of record.** A valid application is e-mailed to the owner with Resend (the same provider, sender, recipient and HTML template as the other CONVRT alerts, `api/_lib/notify.js buildAlert`; that file is untouched). Subject: `[CONVRT] New Project Application — Sprint One-time — Brand Name`. Nothing is saved to MailerLite or any CRM, and the applicant is never added to an e-mail list.
- **Success means delivered.** No `RESEND_API_KEY`, a refused message or a timeout answers 503/502 and the visitor sees an error, never the confirmation.
- **Price integrity.** The browser sends identifiers and answers, never a price. The server re-validates the package and billing against the pricing configuration and writes the price, currency and commitment itself (a test posts a tampered price and proves it is ignored).
- **Duplicates.** One id per form (`submissionId`) is the Resend `Idempotency-Key`, so a double click or a retry sends one e-mail; the button is disabled while sending.
- **Spam.** The existing same-origin check, a 24 KB body limit and a honeypot (`nickname`, a convincing fake success).
- **Privacy.** Logs carry error kinds only. The privacy line says the details are sent to CONVRT by e-mail and used only to review the application; no marketing e-mail, no marketing-consent box.
- **URLs.** Only http(s) URLs with a real host and no credentials are accepted; they appear as escaped text in the e-mail.
- **Attribution.** The e-mail lists the page language, the source page (`pricing` / `direct`), the session's landing page (only when analytics consent exists) and the `utm_*` parameters stored in the visitor's tab (`utmAttribution()` in `src/lib/analytics.js`; never click identifiers).

Setup: `RESEND_API_KEY` (and optionally `NOTIFY_EMAIL_TO` / `NOTIFY_EMAIL_FROM`), exactly as for the free-video application (`docs/privacy-provider-checklist.md`). The Resend test sender only delivers to the Resend account owner; verify `convrt.studio` there so alerts do not depend on it.

**Safe testing:** `PROJECT_APPLICATION_DRY_RUN=1` (in the git-ignored `.env.local`; never set it on Vercel) makes the endpoint validate everything and build the e-mail but send nothing and still answer success. `npm test` mocks Resend completely.

### Example notification
```
Subject: [CONVRT] New Project Application — Sprint One-time — Perfumes Prueba
Application type: PROJECT APPLICATION (purchase intent). NOT a Free Creative Growth Roadmap application.
Applicant name / Email / Company / Website: Lucía Prueba / lucia@example.com / Perfumes Prueba / https://perfumesprueba.com/
Selected package: Creative Testing Sprint · Billing preference: One-time
Current package price: €3,250 EUR · Currency: EUR
Applicable commitment: One production batch, no recurring commitment.
Project description / objective: … / Test new advertising concepts
Monthly advertising spend: €5,000–€15,000 per month
Project readiness: Within 30 days · Desired start date: 2027-01-15
Production languages: Spanish, English
Pricing acknowledgement: Yes: understands the pricing and terms of the selected package (a qualification acknowledgement, not a purchase agreement or payment authorization).
Submitted: 2026-11-26T20:00:00.000Z · Website locale: es (Spanish) · Source page: pricing · Landing page: /es/ugc-video-agency
Campaign attribution: utm_source=google, utm_campaign=brand-es
```

## Analytics (GTM / GA4, consent-gated like every event: `trackEvent`)
| Event | When | Parameters |
|---|---|---|
| `package_cta_click` | a package card's CTA on `/pricing` | `package_id`, `billing`, `locale`, `currency`, `source_page`, `service_category` |
| `project_application_view` | the application page loads | same |
| `project_application_start` | the first interaction with the form (once) | same |
| `project_application_submit` | **only after the server confirmed delivery** (once per application) | same |
| `project_application_error` | a failed submission | same + `reason` (`rate_limited`, `network`, `unavailable`) |

`billing` is `monthly`, `one-time` or `custom`; `service_category` is `paid`, `organic`, `custom_paid` or `custom_organic`. No name, e-mail, URL, description or answer is ever sent (a test scans every `trackEvent` call). The pricing click is not a conversion. The event is separate from the Roadmap (`roadmap_*`), free-video (`risk_free_*`), hooks (`hooks_*`) and referral events.

**Google Ads (prepared, nothing launched):** the conversion is the GTM trigger "Custom Event = `project_application_submit`". Create it as a Google Ads conversion action separate from the Roadmap conversions, and mark `project_application_submit` as a GA4 key event (see `docs/analytics-conversion-readiness.md`). No conversion value is sent because there is no checkout. Campaign attribution survives the pricing → application hop in the same tab (utm_* in sessionStorage; `landing_page` on every event); Google's own tags read gclid from the URL themselves.

## SEO
Noindex (`<meta robots noindex, follow>` + an `X-Robots-Tag` header in `vercel.json`), self-canonical to the clean URL (so `?package=…` never makes an indexable duplicate), no hreflang, not in the sitemap, not in `robots.txt` (a crawler must be able to read the directive), no structured data. The prerendered HTML shows the package chooser; the selected package is read from the URL after load.

## What did not change
Package prices, deliverables, commitments and usage rights; the Free Creative Growth Roadmap (hero, navigation, pricing block, form, e-mail handling, events); the free-video and hooks funnels; `api/_lib/notify.js`, `subscribe.js` and the MailerLite integration.

## Tests
`node --test tests/project-application.test.mjs` (selection per package × language, validation, server integrity, e-mail content, SEO, tracking hygiene, "no calendar / no payment").
