# Spanish launch candidate: state, checklist and decisions before publication

Branch `multilingual-foundation-es` (merged with `origin/main` da558ee, which includes GEO Work Package 1). Not merged, not deployed to Production. Merging it **is** the publication act: `src/i18n/locales.js` has
`es: 'live'` (indexable pages, sitemap, hreflang, selector). To merge the code without publishing Spanish, set `'review'` (pages stay reachable by URL, noindex, no sitemap/hreflang/selector).
Live blocker list: `node scripts/es-launch-readiness.mjs` (exit code 1 while any remain).

## Pages prepared (native Spanish, same slugs)
`/es/` · `/es/ugc-video-agency` · `/es/spokesperson-video-production` · `/es/social-media-video-production` · `/es/saas-video-production` · `/es/pricing` · `/es/creator-showcase` (launch-blocked) ·
`/es/about` · `/es/contact` · `/es/creative-growth-roadmap` (the application; `noindex`, like the English page, so no sitemap or hreflang).
Deliberately English-only: case studies, blog, free hooks, risk-free trial, referrals, /scale, Privacy, Terms, Legal Notice.

## Completeness checklist
- [x] Visible text, headings, FAQs, buttons, aria labels, scene labels, form labels/errors/outcomes; 404 for unbuilt `/es/…`, `/fr`, `/ar`
- [x] Unique titles/descriptions per page from the approved keyword map (`docs/multilingual-spanish-seo-map.md`); self-referencing canonicals; reciprocal hreflang `en`/`es`/`x-default` for indexable pages only
- [x] FAQ and JSON-LD generated from the same Spanish text; one stable Organization `@id`; the noindex Roadmap has no JSON-LD (as in English)
- [x] EUR pricing mechanism (separate Spanish configuration, "2.750 €" notation, tokens in every sentence, Offers, metadata); **the 13 amounts are owner-approved (2026-11-21)** and the pricing gates are lifted (`docs/multilingual-spanish-eur-pricing.md`)
- [x] Client quotes verbatim in English, marked `lang="en"`, with a visible note; English-only case studies labelled "(en inglés)"
- [x] No language preference is stored (language comes from the URL only)
- [x] English pages differ from `origin/main` only by the selector and hreflang tags (`scripts/i18n-english-parity.mjs`: 0 differences)
- [x] Spanish Roadmap application: see below
- [ ] Native-Spanish review of all copy (see the list in the report)
- [ ] Spanish-language Showcase videos (blocker 1), Spanish OG image (blocker 2), legal set (blocker 3)

## Launch blockers
1. **Spanish Creator Showcase has no videos.** `/es/creator-showcase` is built but `noindex`, out of the sitemap and hreflang, and the selector falls back to the Spanish home (`src/i18n/release.js`).
   The four service galleries on Spanish pages are empty for the same reason. Exact information needed, and how an approved video flows to the Showcase and the galleries: `docs/multilingual-spanish-videos.md`.
   Spanish videos use `languages: ['es']` + `onlyIn: ['es']`, so they never change an English page.
2. **Spanish OG image.** `public/og/convrt-og-es.png` (1200×630) is missing; Spanish pages share the English image until it exists. Requirements in `docs/multilingual-spanish-videos.md`; flip `ES_OG_IMAGE_READY` after adding it.
3. **Legal pages.** Privacy, Terms and Legal Notice are English-only (linked from Spanish pages, marked `lang="en"`). Unpublished Spanish drafts for review are outside the repo (`CONVRT/Claude/multilingual-es/legal-translation-review/`); `docs/multilingual-legal-translation-review.md` lists what the lawyer must check.

Not blockers but English-only: free hooks, risk-free trial and referrals (their Spanish CTAs are omitted or send the visitor to the booking call or contact page).

## Spanish Roadmap (`/es/creative-growth-roadmap`)
- The English flow, qualification logic, outcomes, Calendly gate/booking and analytics calls are unchanged (no analytics, API or backend line was touched). The Roadmap is entirely client-side: no request is sent to the backend and there is no consent box.
- Option **values** stay English (qualification compares them exactly); only the displayed labels are Spanish. Spend options read "Menos de 5.000 USD", "Entre 5.000 y 20.000 USD", "Más de 20.000 USD" (USD kept).
- Outcomes verified in a browser against English with the same answers: qualified → Calendly gate then booking; marketing agency → `/es/#contact`; not ready → `/es/contact` (English offers the free hooks, which exist only in English).
- Spanish Calendly gate text (the consent-style cookie notice) is a translation of the existing notice and is on the lawyer's list.
- Hidden on the Spanish page: the Roadmap explainer video (spoken English, no captions).
- Privacy policy link is the English policy, labelled "(en inglés)".
- Calendly renders in the visitor's browser language; the event's own name/description and its confirmation emails stay as set in the Calendly account (English). The owner can localize them in Calendly.

## Decisions needed from the owner
1. **Spanish videos:** which creators and videos have written consent for portfolio use, and the spoken language of each (`docs/multilingual-spanish-videos.md`).
2. **Legal set:** publish lawyer-reviewed Spanish Privacy/Terms/Legal Notice before indexing (recommended), or accept English-only legal links labelled "(en inglés)".
3. **Spanish OG image:** commission it or publish with the English image.
4. **Roadmap explainer in Spanish:** provide a Spanish version (audio or burned-in captions), or keep it hidden on the Spanish page.
5. **Roadmap privacy wording** and the Calendly notice translation: lawyer review.
6. **Native Spanish review** of all copy before launch.
7. **Spanish-only video pages and indexing:** a Spanish gallery page follows its English twin's indexability flag. Change only if you want Spanish videos alone to make a page indexable.
8. **Publishing control:** `es: 'live'` means merging publishes Spanish, including the blocked items above (the Showcase stays noindex by gate). Use `'review'` to merge without publishing.

Closed: **Spanish prices are EUR** (final, approved amounts), `hreflang="es"`, no language-preference storage, quotes verbatim in English, 20-minute wording (the Calendly event is titled "20-minute strategy call"; the `30min` in the URL is a legacy slug).

## Integration with main
The branch contains `origin/main` da558ee (SEO/GEO Batch 2, the Showcase titles and GEO Work Package 1 with the United States follow-up), merged with a merge commit; the 30 new English strings from GEO WP1 are translated (`src/i18n/es/dict-geo.js` and updated FAQ keys) and the Organization JSON-LD stays identical in both languages. Because Spanish is keyed by the exact English sentence, any later English copy change fails the Spanish build with the exact list to re-translate; nothing goes stale silently.
