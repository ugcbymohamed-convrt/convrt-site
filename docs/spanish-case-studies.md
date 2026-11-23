# Spanish case studies (Graspo, Elyon Dubai)

Branch `feat/es-case-studies`, cut from production `main` afc0da4. Not pushed, not merged.

## Routes
`/es/case-studies` (the duplicate default study: canonical `/es/case-studies/graspo`, no hreflang, not in the sitemap, exactly like English), `/es/case-studies/graspo`, `/es/case-studies/elyon`.
Added by listing them in `TRANSLATED_PATHS` (`src/i18n/registry.js`): static HTML, sitemap entries (the two studies), reciprocal hreflang en/es/x-default, selector link, Spanish menu/footer "Casos de éxito" all follow from that. Heads: `src/i18n/es/seo.js`; JSON-LD: `caseStudyGraphEs` in `src/i18n/es/structuredData.js` (WebPage `inLanguage: es`, two-level breadcrumb, the Spanish service page's Service node; no Article, rating or dates; Organization identical).

## What was translated and where
The English components are reused (`tr()`), no second page system. Spanish text: `src/i18n/es/dict-casestudies.js` (keyed by the English sentence). Sentences built from data: `src/i18n/es/casestudies.js`. Figures, chart data and labels live in `src/caseStudies/data.js` (English source, read by the components and by `tests/es-case-studies.test.mjs`); notation helpers in `src/components/caseStudies/format.js` (`10,7 M`, `14,2 %`, `3.421,25 USD`; value never changes).
Spanish-only layout tweaks (never in the English HTML): the Graspo H1 stacks its two sentences instead of `whitespace-nowrap`; funnel rows and lead-category labels wrap instead of truncating; the switcher descriptor may wrap; the money suffix `USD` is a smaller span.

## Preserved metrics and their sources
- Graspo: 10.7M views, 3.4M accounts reached, 65K interactions, platform split, top content, countries, demographics: Meta Business Suite, 1 Jan – 19 Jun 2026. 75 unique inbound leads, 26 high priority, 10 quotation stage, lead categories and months: Graspo's inbound tracker. Current following: `GRASPO_FOLLOWING` (`src/lib/siteStats.js`).
- Elyon Dubai (client-reported, USD, never converted): early test $229.89 spend, $835 purchase value, 3.63x average, 5.10x and 3.17x (WhatsApp); standout creative 9 purchases, $3,421.25, 5.28x (also `ELYON_PROOF`); 160+ creatives and 4 locations (production tracker); 30 interview deliverables, 22 Spanish-language interviews, 7-video weekly cadence.
- Client WhatsApp screenshots are English images: the card header says "(captura en inglés)". The case studies contain no written testimonial, so none is translated.
- Multilingual context kept only where the English page states it: Arabic-first production (Graspo), 22 Spanish-language interviews (Elyon).

## Spanish-only additions (owner decision)
Two short limitation lines that English does not show on the case-study pages (the same limitation is already published on the Organic and UGC pages): Graspo "corresponden a un cliente y un periodo concretos… no son habituales ni constituyen una garantía"; Elyon "Los datos de ROAS los comunica el cliente…". Decide whether English should get them too.

## Link labels
Links to the case studies were labelled "(en inglés)" while the studies were English-only. The labels are overridden (`LINK_LABEL_OVERRIDES` at the end of `dict-casestudies.js`, merged last) so `dict-pricing/services/showcase/home/trust/geo` stay untouched; copy those values into their files when convenient, then delete the overrides. `src/i18n/es/about.js`, the homepage panel (`CaseStudies.jsx`), `PhilosophySection.jsx` and the footer now link with `hrefFor()`.

## Owner must decide / ambiguities in the English source (not changed)
1. Graspo hero says "6 months" and the result says "over six months", while the reporting period is 1 Jan – 19 Jun 2026 (about 5.6 months).
2. The top-5 content items sum to about 10.72M, a little above the 10.66M platform total (rounding of 7.5M / 1.9M / 1.2M).
3. Elyon: "Even during an early learning phase, individual creatives reached as high as 5.28x ROAS" (plural, and implies the early phase) versus snapshot 2 labelled "a separate result, weeks later" and a single creative; the early test's best creative is 5.10x. Kept as written; consider rewording the English.
4. Elyon H1 claims "profitable" paid-social creative; ROAS alone does not show profit.
5. Language of the Graspo / Elyon videos is not stated on the pages, so it is not labelled.
