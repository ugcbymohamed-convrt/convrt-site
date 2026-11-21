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
- [x] Creator Showcase: language ordering/filter mechanism ready, no Spanish-speaker claims (no verified data)
- [x] Language selector (header, mobile menu, footer); no detection/redirect/storage
- [x] Conversion CTAs → booking call + email; English-only flows blocked; consent/forms untouched; privacy links kept (English, labelled)
- [x] English pages byte-identical except the selector and hreflang tags (`scripts/i18n-english-parity.mjs`: 0 differences)
- [x] Full suite 671 existing + 27 new tests pass; build passes; 404 model: `/fr`, `/ar`, `/es/<missing>`, `/es/privacy` → 404
- [ ] Native-Spanish reviewer pass (written as natural Spain-Spanish marketing copy: "tú" to the reader, "vosotros" for the studio in FAQ questions, "vídeo", "testeo")
- [ ] Spanish OG image (the shared 1200×630 image contains English text; every Spanish page currently reuses it, alt text is Spanish)
- [ ] Spanish conversion flows and legal set (below)

## Decisions needed from the owner before publication
1. **Prices in USD for Spain.** Kept as instructed, shown "3.000 USD" with "sin IVA". Spanish buyers compare in EUR: confirm USD-only is acceptable, or approve a displayed EUR reference (not implemented; would change commercial claims).
2. **Conversion flows.** Roadmap, 1 FREE Video, Free Hooks and Referral are English-only with API-coupled labels, so they are blocked for Spanish. Spanish CTAs open the Calendly booking in a new tab. Choose: (a) launch booking-only; (b) translate the Roadmap first (largest win; needs Spanish options, errors, qualification outcomes, confirmation, a localized/subtitled video and a Spanish consent text with its own version); (c) later for the others. Note: the Spanish "How it works" still describes the free Roadmap step (translated from the verified English) while the CTA books a call, so visitors skip the Roadmap qualification form; decide whether to reword that step or localize the Roadmap.
3. **Legal pages.** English-only Privacy/Terms/Legal Notice are linked from Spanish pages, labelled "(en inglés)". Reviewed Spanish drafts exist (outside the repo) with open legal questions: see `docs/multilingual-legal-translation-review.md`. Recommend publishing lawyer-reviewed Spanish versions before indexing.
4. **Home vs UGC page keyword split.** Workbook maps "agencia UGC" to `/es/`; the UGC page targets "vídeos UGC / producción de vídeos UGC" to avoid cannibalisation. Confirm.
5. **`hreflang="es"` vs `es-ES`.** Used `es` (Spanish content, Spain-focused tone, not geo-restricted).
6. **Remember explicit language choice.** Not implemented: the Privacy Policy lists browser storage exhaustively, so a stored preference needs a line in the policy (both languages). The choice is "remembered" by the URL itself (Spanish pages link to Spanish pages).
7. **Testimonials** stay in the clients' English; approve Spanish translations (with client permission) or keep.
8. **Case studies / blog / "Referral Program"** are English-only: omitted from the Spanish menu; case-study links are labelled "(en inglés)". Translate case studies later?
9. **Creator languages.** No Spanish-spoken video is recorded (see `creator-language-owner-review.csv` outside the repo). Provide verified Spanish videos and consents.
10. **Pre-existing English inconsistency (not Spanish-specific):** the site says "free 20-minute strategy call" while the booking link is the Calendly `30min` event. The Spanish page repeats the English claim; please verify.
11. **Sequence with SEO/GEO Batch 2** (next section).

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
