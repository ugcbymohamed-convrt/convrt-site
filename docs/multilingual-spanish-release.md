# Spanish launch candidate: state, checklist and decisions before publication

Branch `multilingual-foundation-es` (from `origin/main` 5bf3b50). Not merged, not deployed to Production. Merging it **is** the publication act: `src/i18n/locales.js` has `es: 'live'`
(indexable, sitemap, hreflang, selector). To hold Spanish back after a merge set it to `'review'` (pages stay reachable by URL, noindex, no sitemap/hreflang/selector).

## Pages prepared (complete native Spanish, same slugs)
`/es/` · `/es/ugc-video-agency` · `/es/spokesperson-video-production` · `/es/social-media-video-production` · `/es/saas-video-production` · `/es/pricing` · `/es/creator-showcase` · `/es/about` · `/es/contact`.
Not translated, deliberately: case studies, blog, Roadmap, free hooks, risk-free trial, referrals, /scale, Privacy, Terms, Legal Notice (English remains; see below).

## Localization completeness checklist
- [x] 9 pages, visible text, headings, FAQs (5 lists), buttons, aria labels, illustrated scene labels, 404 for `/es/…`
- [x] Titles/descriptions/OG copy unique per page; self-referencing canonicals; reciprocal hreflang (en, es, x-default); `html lang="es"`
- [x] FAQ and JSON-LD generated from the same Spanish text; one stable Organization @id; Spanish Services/offers from the business data
- [x] USD kept, Spanish number notation ("3.000 USD"); all figures verified equal to the English page by test
- [x] Client quotes verbatim in English, marked `lang="en"`, with a visible note; case-study links labelled "(en inglés)"
- [x] Creator Showcase: separate Spanish video set supported (language filter, `i18n` copy, release gate); none configured, so the page is launch-blocked
- [x] Language selector (header, mobile menu, footer); no detection/redirect/storage
- [x] Conversion CTAs → booking call + email; English-only flows blocked; consent/forms untouched; privacy links kept (English, labelled)
- [x] English pages byte-identical except the selector and hreflang tags (`scripts/i18n-english-parity.mjs`: 0 differences)
- [x] Full suite 671 existing + 27 new tests pass; build passes; 404 model: `/fr`, `/ar`, `/es/<missing>`, `/es/privacy` → 404
- [ ] Native-Spanish reviewer pass (written as natural Spain-Spanish marketing copy: "tú" to the reader, "vosotros" for the studio in FAQ questions, "vídeo", "testeo")
- [ ] Spanish-language Showcase videos (launch blocker), Spanish OG image, Spanish conversion flows, legal set (see blockers)

## Launch blockers (live list: `node scripts/es-launch-readiness.mjs`, exit code 1 while any remain)
1. **Spanish Creator Showcase has no videos.** The Spanish Showcase has its OWN creators and videos (owner, Nov 2026), never the 39 English ones, and none is configured. `/es/creator-showcase` is therefore
   **launch-blocked**: built and reachable for review, but `noindex`, out of the sitemap and hreflang, the English showcase carries no hreflang to it, the selector falls back to the Spanish home, and the
   page itself says "La galería en español se está preparando" instead of showing an irrelevant gallery (`src/i18n/release.js`). The four service pages on Spanish also show only Spanish-language videos (none yet), so their
   galleries are absent. **To add the Spanish videos:** append entries to `src/content/portfolio.js` with `languages: ['es']`, a real `creatorId`, the usual approval flags (only once the creator consented) and, if the
   English caption would not suit, `i18n: { es: { title, caption } }` copy written for the Spanish page (validated; a Spanish-spoken entry with no `i18n` simply uses its own title/caption). The gate lifts by itself with the first approved
   Spanish-language video, and the Spanish language filter appears at two spoken languages. The English showcase is untouched. (The homepage hero and the client case-study panels are not "Showcase" content and still use their existing videos.)
2. **Conversion flows.** Roadmap, 1 FREE Video, Free Hooks and Referral stay English-only (API-coupled option labels). See decision 2.
3. **Spanish OG image.** The shared image has English text burned in. Recommended: design `public/og/convrt-og-es.png` (1200×630, same layout) with: headline "Creatividades de alto rendimiento diseñadas para *convertir*." (lime on the last word), line "Anuncios UGC · Vídeos para SaaS · Vídeos con presentador · Contenido orgánico", tagline "Creadores reales. Entrega auténtica.", "convrt.studio"; then set `ES_OG_IMAGE_READY = true` in `src/i18n/es/seo.js` (a test validates the file). Interim: keep the English image (the page title, description and alt text are Spanish) or use a text-free image.
4. **English-only legal pages** (see `docs/multilingual-legal-translation-review.md`).

## Conversion experience (what the Spanish visitor is promised vs where they land)
- Every Spanish CTA that would have opened the Roadmap now says what it is: **"Reservar una llamada creativa"**, opening the Calendly "20-minute strategy call" in a new tab (same event the English /scale and Organic pages use).
- Where Spanish copy still describes the free five-concept Roadmap (How it works, the pricing "Roadmap" card) the CTA block now explains the step: *"La solicitud online de la Hoja de Ruta aún no está disponible en español. Reserva una llamada estratégica gratuita de 20 minutos (sujeta a una breve comprobación de encaje, sin compromiso) y te explicamos cómo conseguir tus cinco conceptos publicitarios."* The free-video and free-hooks cards are hidden; FAQ links into blocked flows are removed.
- **Duration check:** the Calendly event's public title is "20-minute strategy call"; the `30min` in the URL is a legacy slug, not the duration. Site copy ("free 20-minute strategy call") is accurate; comments in `config.js` and `businessKnowledge.js` now say so. (The event's actual length setting lives in your Calendly account; please confirm it is 20.)
- **Recommended path to a fully Spanish funnel:** (1) Roadmap first: Spanish page + application (labels shown in Spanish, English option values sent unchanged so `roadmapQualification` and the API contract stay as they are), Spanish validation/confirmation messages, subtitled or Spanish version of the Roadmap video, Spanish consent text with its **own recorded version** (not "v2") reviewed by your lawyer; owner-alert emails stay English. (2) Then risk-free and hooks the same way; (3) referral program last. Flip each flag in `LOCALIZED_FLOWS.es` as it ships; CTAs switch automatically. Nothing about the API or the English flows needs to change.

## Decisions needed from the owner before publication
1. **Spanish videos:** who are the Spanish-speaking creators, and which videos have the creator's consent for portfolio use? (Without them the Showcase stays blocked.) Should the four service pages show the same Spanish set?
2. **Conversion flow:** launch with the booking call (current), or translate the Roadmap first (recommended), and accept that Spanish visitors currently skip the Roadmap fit questions.
3. **Legal set:** publish lawyer-reviewed Spanish Privacy/Terms/Legal Notice before indexing (recommended), or accept English-only legal links labelled "(en inglés)".
4. **Prices in USD for Spain** ("3.000 USD", "sin IVA"): confirm, or approve a displayed EUR reference (would change a commercial claim).
5. **Spanish OG image:** commission the design above, or publish with the English image.
6. **Keyword split:** `/es/` = "agencia UGC" (workbook), `/es/ugc-video-agency` = "vídeos UGC / producción de vídeos UGC" (no Planner estimate: a risk, see the SEO map); confirm.
7. **`hreflang="es"` vs `es-ES`** (used `es`).
8. **Language preference storage** (not implemented; needs a Privacy Policy line in both languages).
9. **Testimonials** in the clients' English (verbatim, `lang="en"`) or approved Spanish translations.
10. **Case studies / blog / Referral program** English-only: link labelled "(en inglés)" or translate case studies next.
11. **Native Spanish review** of all copy before launch.
12. **Publishing control:** `es: 'live'` on this branch means merging publishes Spanish including the blocked/blocker items above (the Showcase stays noindex by gate; the rest goes live). Set `'review'` in `src/i18n/locales.js` if you want to merge the code without publishing.

## Integration with main (Batch 2 and the showcase titles are now on `origin/main`)
Update after this branch was cut (from 5bf3b50): `origin/main` is now 61e3652 and already contains SEO/GEO Batch 2 and the Creator Showcase title/caption rewrite. `git merge-tree` against it reports
**7 textual conflicts**: `CLAUDE.md`, `src/OrganicSocialVideoPage.jsx`, `src/components/Footer.jsx`, `src/components/Services.jsx`, `src/components/pricing/PhilosophySection.jsx`,
`src/components/pricing/PricingFinalCTA.jsx`, `src/components/ugc/shared.jsx` (plus `tests/pricing.test.mjs`); `src/content/portfolio.js` auto-merges. All are small hunks where both sides edited the same lines.
**This branch was deliberately not rebased** (not requested; the rebase surfaces the re-translation work below). Next step after your approval: rebase onto main, keep Batch 2's wording inside the `tr()` wrappers,
and update the dictionary.
- Batch 2 reworded English FAQs (home, UGC, spokesperson, organic), `businessKnowledge.js` (service labels etc.) and the homepage service label. Because Spanish is keyed by the exact English sentence, **each reworded
  string makes the Spanish build fail with an exact list of what to re-translate**; nothing goes stale silently.
- Spanish JSON-LD uses page-scoped service ids, so Batch 2's new English service ids do not collide.
- **Showcase:** the showcase titles are in main's `portfolio.js`. This branch translates generic captions by pattern (`src/i18n/es/labels.js`); after the rebase the new evidence-based English titles will pass through
  unchanged (shown as written, in English) until translated. Also, the owner told the showcase session that the **Spanish page will have its own videos**: that is compatible with the language ordering/filter built
  here (Spanish-spoken entries added to `portfolio.js` with `languages: ['es']` appear first), but the Spanish showcase currently shows the shared library. Please confirm how the Spanish-only set should be defined.
