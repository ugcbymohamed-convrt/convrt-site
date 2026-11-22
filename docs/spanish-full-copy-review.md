# Spanish full copy review (eight pages)

Branch `spanish-full-copy-review`, cut from `multilingual-foundation-es` **b80857e** (the homepage session's committed Spanish homepage, CTAs, free-video page and thumbnails). Not merged, not deployed to
Production. Source of truth: the eight approved editorial documents (UGC, SaaS, Organic, Creator Showcase, Pricing, Spokesperson, About, Roadmap).

## What changed, and how
Spanish is keyed by the exact English sentence, so almost all of this is **new Spanish values for existing English keys** (`src/i18n/es/dict-services.js`, `dict-pricing.js`, `dict-roadmap.js`,
`dict-showcase.js`). English files and English output are unchanged (`node scripts/i18n-english-parity.mjs`: every English page IDENTICAL). Where one English key is shared by several pages,
or where the editorial copy has a different structure from the English page, there is a small Spanish-only hook:

| What | Where |
|---|---|
| H1 lines, rolling word and secondary CTA of the four service heroes | `src/i18n/es/hero.js` |
| Spanish FAQ headings (“Todo lo que necesitas saber sobre …”), page-specific stage titles, final-CTA paragraph (+ UGC note), section intros, testimonials note, Organic packages note | `src/i18n/es/labels.js` (read by `UgcFAQ`, `PricingFAQ`, `UgcProcess`, `UgcFinalCTA`, `UgcResults`, `TestingDiagram`, `DeliveryStyles` (shared by SaaS), `ContentSystem`, `OrganicPackages`; each guarded by `currentLocale() === 'es'`) |
| Spanish About page (the editorial text is re-structured, not a translation of the English sections) | `src/i18n/es/about.js`, rendered by `src/TrustPage.jsx` in place of the English sections |
| 18 Spanish video titles/captions | `src/content/portfolio.js` |
| UGC type tab (Spanish only) and Spanish language chip (“Español”) | `portfolio.js` (`ES_UGC_CATEGORY`, not in `CATEGORIES`, so English tabs and `tests/creator-showcase.test.mjs` are untouched), `ourwork/icons.jsx`, `VideoCard.jsx`, `UgcGallery.jsx` |
| Spanish JSON-LD names and the Organic Offer terms | `src/i18n/es/pages-registry.js` |

## Owner decision needed: Organic commitment (six vs three months)
The business data (`ORGANIC_COMMITMENT`) and the English Organic/Pricing pages state an **initial six-month** commitment for Organic; the Pricing page states **three months** for monthly Paid Social.
Nothing contractual was changed. On the **Spanish Organic page** the period is no longer stated: the package note reads “Precios sin IVA. Consulta las condiciones de contratación y permanencia en la
página de tarifas.”, the two FAQ answers that quoted it are neutral, and its JSON-LD Offers say the same (test: `tests/spanish-editorial.test.mjs`).
Still stating six months (approved commercial data, left as is): the Spanish **Pricing** page (Organic cards, “Compromiso inicial”, “Social orgánico” FAQ and info panel), the Spanish JSON-LD
package nodes on `/es/pricing`, and the **homepage FAQ** “¿Ofrecéis colaboraciones mensuales?” (homepage session; its English key is `Do you offer monthly retainers?`). Confirm the real term, then change
`ORGANIC_COMMITMENT` once and restore the Organic wording.

## Facts checked
- **Elyon “160+ creatives”** is supported: claims register id `elyon-creatives` (`published-client-reported`), the count published on the Elyon case study (“spans every batch, format and follow-up variation produced since launch”).
  The Spanish About says “más de 160 creativos producidos” next to the single-ad 5,28x ROAS and states the ROAS is one piece, not a campaign average. Revenue stays “3.421,25 USD” (never EUR).
- **Founder statistics** (1.200+ vídeos, 500+ clientes, 40 M+ visualizaciones, 50 %+ clientes recurrentes) are built from `CONVRT_STATS` and attributed to the founder's combined professional experience.
- About: Almería is named only as the studio's base; no street address, offices, awards, reviews, ratings, team size or founding date; no LocalBusiness schema; on-location filming stays “sujeto al alcance, disponibilidad y, cuando proceda, presupuesto”.
- **Pricing**: the 13 approved EUR amounts, per-version figures (183/217 € and 153/183 €), Offers (EUR) and the billing switch were re-verified in the browser and by tests. “creativos de testeo” → “versiones finales de anuncio”; “por variación” → “por versión”.
- **Roadmap privacy**: the qualification is client-side (no request to our backend; the Calendly iframe is not loaded until the visitor clicks). Analytics events carry no answers, **but the qualification outcome
  (`roadmap_qualified` etc.) is sent as an event name when tracking is allowed**, so “Your answers stay in your browser and are only used to check fit” is not strictly accurate. The Spanish page now says
  “Nota de privacidad: consulta cómo tratamos los datos de tu solicitud en nuestra Política de privacidad (en inglés).” The English page is unchanged. Questions, option values, USD brackets, rules, Calendly, noindex and sitemap exclusion are unchanged.

## Deliberate compromises
- **Shared keys (one Spanish string for several places).** Scene micro-labels (“Público”, “Objetivo”), “Producción multilingüe”, the gallery disclaimer (“Estos vídeos son muestras de creadores independientes que ilustran distintos
  estilos y enfoques…”), the “Descubrir …” links on the Showcase (“Producción de vídeos UGC / Spokesperson →” kept), “Demo de producto” (SaaS and Roadmap card 04), “Contenido orgánico” (FAQ tab and usage-rights chip) and
  “Empezar” (all four package cards, not “Empezar con Sprint”) use one wording where the documents differ per page.
- **Shared with the homepage session:** `/es/risk-free-trial` reuses the five-question labels of the Roadmap, so it now shows the same new wording (“¿Qué opción describe mejor tu negocio?”, “SaaS o software”, “0 de 6 preguntas respondidas”, …).
  Two strings the homepage also shows were deliberately **not** changed (founder-experience footnote, “Qué ocurre después”).
- **Copy without an existing slot** was added only where it is a plain paragraph (FAQ intro on UGC, one-sentence intros of four sections, final-CTA paragraph, testimonials note). Not added (would need new design): the
  concept-card descriptions 01-04 on the Roadmap, the Roadmap closing block, the Pricing “Nuestra experiencia” heading, the Showcase intermediate-CTA paragraph and “Explora los vídeos.” heading, per-card “Empezar con Sprint/Sprint Plus”.
- **Video title validated against footage** (frames sampled from all 18): the approved title for the UGC travel video, “Presentación de un alojamiento y su entorno”, does not match it (a creator travelling by scooter past volcanoes
  and rice fields, showing a mobile app; no accommodation appears). It is titled “Viaje por paisajes con una aplicación en el móvil”. “Presentador/Presentadora” and “Spokesperson” follow the gender of the person shown.
- Spokesperson hero label: Showcase title “Spokesperson hablando a cámara en exteriores”, page caption “Presentador hablando a cámara en exteriores.” (both documents, two fields).
- The page's secondary CTAs: UGC and Spokesperson keep the Creator Showcase (it holds the Spanish UGC and Spokesperson samples); SaaS scrolls to `#saas-formats`, Organic to `#how-it-works`.
- “5 conceptos gratis” and the Organic CTA (“Hablemos de tus redes” → the existing discovery-call booking link) were already wired; the Organic label is the shared `Discuss Your Content Strategy` value.

## Integration with the homepage session
Likely textual conflicts (both branches edit them): `src/i18n/es/dict-services.js`, `dict-pricing.js`, `dict-roadmap.js`, `dict-showcase.js`, `src/i18n/es/labels.js`, `src/content/portfolio.js` (titles/captions), `CLAUDE.md` (add a pointer
to this file). No header, footer, global CTA, thumbnail (`posterFrames.js`, `streamPoster`) or poster file was touched. After merging, re-run `npm test`, `npm run build` and
`node scripts/i18n-english-parity.mjs <main dist> dist`.

## Tests
`tests/spanish-editorial.test.mjs` (new, builds the site): the four headlines, anchors and CTA destinations, FAQ counts and visible-equals-JSON-LD, no six-month claim on the Organic page, Graspo/Elyon figures, About
data attribution and no invented claims, Roadmap option values/privacy wording/noindex, the 13 EUR amounts, Showcase tabs and 18 samples.
