# Spanish launch candidate: state, checklist and decisions before publication

Branch `multilingual-foundation-es` (merged with `origin/main` da558ee, which includes GEO Work Package 1). Not merged, not deployed to Production. Merging it **is** the publication act: `src/i18n/locales.js` has
`es: 'live'` (indexable pages, sitemap, hreflang, selector). To merge the code without publishing Spanish, set `'review'` (pages stay reachable by URL, noindex, no sitemap/hreflang/selector).
Live blocker list: `node scripts/es-launch-readiness.mjs` (exit code 1 while any remain).

## Production release (owner-approved 2026-11-22)
The Spanish site (`es: 'live'`) was merged into `main` and deployed to Production together with the `spanish-full-copy-review` editorial pass (`docs/spanish-full-copy-review.md`) and the homepage session's work.
Kept as gated or open on purpose:
- **Spanish Roadmap** `/es/creative-growth-roadmap`: noindex, no sitemap/hreflang (as in English).
- **Spanish free-video application** `/es/risk-free-trial`: reachable and working, but noindex and out of the sitemap/hreflang (`ES_FREE_VIDEO_REVIEWED = false`, `src/i18n/release.js`) until the owner and a lawyer have reviewed its consent
  wording (the marketing checkbox is omitted until a reviewed Spanish consent exists). The homepage block links to it; to hide that block until then, return `null` in `src/components/FreeVideoOffer.jsx`.
- **Outstanding Spanish legal review:** Privacy, Terms and Legal Notice are English-only and every link to them from Spanish pages is labelled "(en inglés)" (`lang="en"`). Spanish drafts for the lawyer are outside the repo
  (`CONVRT/Claude/multilingual-es/legal-translation-review/`); what the lawyer must check is in `docs/multilingual-legal-translation-review.md`. The Roadmap's privacy note and the Calendly notice are on the same list.
- Spanish OG image (`public/og/convrt-og-es.png`) still missing: Spanish pages share the English image.
- Owner-directed English change included from the homepage session: the English menu no longer lists "How It Works" (translated menus keep it).

## Pages prepared (native Spanish, same slugs)
`/es/` · `/es/ugc-video-agency` · `/es/spokesperson-video-production` · `/es/social-media-video-production` · `/es/saas-video-production` · `/es/pricing` · `/es/creator-showcase` (live: 18 Spanish videos) ·
`/es/about` · `/es/contact` · `/es/creative-growth-roadmap` (the application; `noindex`, like the English page, so no sitemap or hreflang) · `/es/risk-free-trial` (the 1 FREE video application; `noindex` and held by a release gate, see below).
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
- [x] 18 Spanish videos integrated (home, UGC, Spokesperson, Showcase); SaaS and Organic launch without videos (text-led hero); Showcase gate lifted
- [ ] Spanish OG image (blocker 1), legal set (blocker 2)

## Launch blockers
1. **Spanish OG image.** `public/og/convrt-og-es.png` (1200×630) is missing; Spanish pages share the English image until it exists. Requirements in `docs/multilingual-spanish-videos.md`; flip `ES_OG_IMAGE_READY` after adding it.
2. **Legal pages.** Privacy, Terms and Legal Notice are English-only (linked from Spanish pages, marked `lang="en"`). Unpublished Spanish drafts for review are outside the repo (`CONVRT/Claude/multilingual-es/legal-translation-review/`); `docs/multilingual-legal-translation-review.md` lists what the lawyer must check.

3. **Spanish free-video page (`/es/risk-free-trial`).** Built and linked from the homepage's secondary free-video block; held out of indexing, sitemap and hreflang by `ES_FREE_VIDEO_REVIEWED = false` (`src/i18n/release.js`) until the owner and the lawyer review it. It uses the existing backend and MailerLite integration unchanged (option values stay English, `marketingConsent` is sent as `false`). **The optional marketing-email checkbox is not shown in Spanish** because its consent wording is versioned and no reviewed Spanish version exists; adding one needs a new recorded version in `src/content/marketingConsent.js`. The privacy-policy link is the English policy, labelled "(en inglés)". Eligibility copy is the English application's, translated; the offer is application-based and subject to approval.

Not blockers but English-only: the 10 free hooks (never promoted in Spanish: no link, banner or CTA; the English offer and the architecture stay, so a Spanish resource can be enabled later by flipping `LOCALIZED_FLOWS.es.hooks` once a page exists) and referrals.

## Spanish homepage copy and terminology (owner-approved, 2026-11-22)
Homepage copy follows the owner's supplied text section by section. Terminology across all Spanish pages: "creativos" for advertising creative assets (e.g. "creativos diseñados para convertir"; "creatividad" kept only where it is the abstract noun), **Spokesperson** as the service name (nav, cards, footer, CTAs, FAQs, breadcrumbs, JSON-LD names; "presentador/a" still names the person, and the Spokesperson page keeps the keyword "vídeos con presentador" next to the service name in its title/H1), "testear" for ad testing. The CTA label is "5 conceptos gratis" (hero, navigation and every other 5-concepts CTA). Testimonials stay in their original English; the owner's supplied text wrote the Elyon quote as "MOHAMED understood…" in capitals, the verified original reads "Mohamed understood…" and is kept. FAQ answers are unchanged; only the 12 questions were reworded as supplied (the first, "¿Qué hace exactamente CONVRT Studio?", is answered by the existing definition of CONVRT's role).

## Spanish Roadmap (`/es/creative-growth-roadmap`)
- The English flow, qualification logic, outcomes, Calendly gate/booking and analytics calls are unchanged (no analytics, API or backend line was touched). The Roadmap is entirely client-side: no request is sent to the backend and there is no consent box.
- Option **values** stay English (qualification compares them exactly); only the displayed labels are Spanish. Spend options read "Menos de 5.000 USD", "Entre 5.000 y 20.000 USD", "Más de 20.000 USD" (USD kept).
- Outcomes verified in a browser against English with the same answers: qualified → Calendly gate then booking; marketing agency → `/es/#contact`; not ready → `/es/contact` (English offers the free hooks, which exist only in English).
- Spanish Calendly gate text (the consent-style cookie notice) is a translation of the existing notice and is on the lawyer's list.
- Hidden on the Spanish page: the Roadmap explainer video (spoken English, no captions).
- Privacy policy link is the English policy, labelled "(en inglés)".
- Calendly renders in the visitor's browser language; the event's own name/description and its confirmation emails stay as set in the Calendly account (English). The owner can localize them in Calendly.

## Decisions needed from the owner
1. **Legal set:** publish lawyer-reviewed Spanish Privacy/Terms/Legal Notice before indexing (recommended), or accept English-only legal links labelled "(en inglés)".
2. **Spanish OG image:** commission it or publish with the English image.
3. **Roadmap explainer in Spanish:** provide a Spanish version (audio or burned-in captions), or keep it hidden on the Spanish page.
4. **Roadmap privacy wording** and the Calendly notice translation: lawyer review.
5. **Native Spanish review** of all copy before launch.
6. **Spanish-only video pages and indexing:** a Spanish gallery page follows its English twin's indexability flag. Change only if you want Spanish videos alone to make a page indexable.
7. **Publishing control:** `es: 'live'` means merging publishes Spanish, including the open items above. Use `'review'` to merge without publishing.

Closed: **Spanish prices are EUR** (final, approved amounts), `hreflang="es"`, no language-preference storage, quotes verbatim in English, 20-minute wording (the Calendly event is titled "20-minute strategy call"; the `30min` in the URL is a legacy slug).

## Integration with main
The branch contains `origin/main` da558ee (SEO/GEO Batch 2, the Showcase titles and GEO Work Package 1 with the United States follow-up), merged with a merge commit; the 30 new English strings from GEO WP1 are translated (`src/i18n/es/dict-geo.js` and updated FAQ keys) and the Organization JSON-LD stays identical in both languages. Because Spanish is keyed by the exact English sentence, any later English copy change fails the Spanish build with the exact list to re-translate; nothing goes stale silently.
