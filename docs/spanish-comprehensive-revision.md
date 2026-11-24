# Spanish comprehensive revision (Review 3, 2026-11-24)

Branch `feat/es-visual-parity-review-1` (Preview only; not merged, not deployed to Production). `origin/main` (English design review: founder stage, editorial reviews, creators carousel, navigation) was merged in first, so the Spanish homepage now shares the English components.
English output is unchanged: `node scripts/i18n-english-parity.mjs <main dist> dist` reports every English page IDENTICAL; only `/es/` pages differ.

## What changed
| Area | How |
|---|---|
| Homepage composition | `App.jsx`: Spanish uses the English order (founder stage → services → free video → process → creators → reviews → final CTA → FAQ). `Credibility.jsx` draws logos only for `es` too. |
| Founder stage | `IndustryShowcase.jsx` is locale-aware. Spanish groups live in `src/content/homeShowcase.js` (`SHOWCASE_GROUPS_ES`): **Elyon Dubai** (client) and **E-commerce / UGC** (`kind: 'portfolio'`: no logo, a "Portfolio" tag, a visible caption; never a client). Headline "Más de 500 clientes. Una experiencia que marca la diferencia." with the owner attribution "Experiencia acumulada del fundador en CONVRT y otros proyectos creativos." |
| Videos (ES-2) | Six videos uploaded to Cloudflare Stream and registered in `src/content/portfolio.js` (`es-showcase-*`, `showcase: 'elyon-es' | 'mixed-es'`, Spanish site only, `portfolioUse`/`creatorConsent` false so they never reach /creator-showcase). Posters: Stream thumbnails at the frames in `posterFrames.js`. Source-file → Stream-id map: `CONVRT/Claude/es-visual-parity-review-1/es2-private-map.csv` (outside the repo). |
| Reviews | `src/i18n/es/reviews.js` (owner-approved Spanish text) rendered by the English `ClientReviews.jsx` (`currentLocale() === 'es'`). No English original, no disclosure line. Provenance stays in `src/content/reviews.js`. The old `es/testimonials.js` was removed. |
| Copy | Dictionary values in `src/i18n/es/dict-*.js` (hero, services cards, process, free video, final CTA, FAQ questions, footer). Service card titles use `esTitle` in `Services.jsx`. Hero offer line uses new keys ("5 ad concepts for your brand." / "Free."). "Consigue 5 conceptos gratis" is the label of every 5-concepts CTA. |
| Free video page | `/es/risk-free-trial` (existing, functional, still `noindex`): new H1 "Prueba nuestra producción con un vídeo gratis", new lead and CTA. Form, MailerLite/Resend, anti-bot and validation untouched. |
| Cleanup | Spanish creator cards no longer show "UGC · Español" (language suffix dropped for non-English); the carousel note is one short line ("Ejemplos de creadores independientes."). The long attribution sentence stays on the Creator Showcase and the service pages. |

## Deliberate decisions / open items
- The hero H1 stays the owner-approved animated "Creatividades diseñadas para ___" (the suggested static "Vídeos que captan la atención…" would remove the rolling word).
- The reviews' section heading "Colaboraciones que duran" is the (visually hidden) H2, exactly like the English design; the visible eyebrow is "Clientes que vuelven".
- The three Elyon videos carry **English burned-in captions** ("SPANISH GIRLS TRYING ELYON DUBAI", word-by-word subtitles); the owner described them as Spanish street interviews (recorded as `languages: ['es']`), but the spoken language was not machine-verified.
- The E-commerce / UGC group holds three different brands (a gym bag, watches, a fitness app); no brand name is shown. The owner's label "E-commerce / UGC" is kept although one of the three is an app.
- "I'm a creator" (English Google Form) is not offered from the Spanish stage.
- 50%+ returning clients: still the owner-confirmed figure with its attribution; the repository records no source or definition for it (see `PUBLIC_CLAIMS`).
- Legal links in the footer are labelled "(en inglés)"; no Spanish legal documents exist.

Tests: `tests/spanish-visual-parity.test.mjs` (Review 3 section), updated pinned tests in `i18n`, `home-redesign`, `creator-showcase`, `spanish-editorial`.
