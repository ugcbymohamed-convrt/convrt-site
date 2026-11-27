# Final copy and design refinements (2026-11-26)

Branch `feat/final-copy-design-refinements`, cut from Production `main` (ddb09ea). Preview only: not merged, not deployed to Production. Done before the multilingual SEO/GEO phase; no SEO work was started here.

## What changed
| Brief item | Where |
|---|---|
| 1 Spanish terminology: "creatividades" → "creativos", "gancho(s)" → "hook(s)", pricing model = concepto / variante / hook / CTA / creativo / testeo creativo | `src/i18n/es/*` (dict-pricing, dict-services, dict-home, dict-scenes, dict-roadmap, dict-riskfree, dict-referrals, seo.js, jsonld-parts.js, labels.js). The homepage headline is now "Creativos diseñados para conectar" (`'engineered to'` agrees in gender). "creatividad" as a general skill and "estrategia/dirección creativa" are untouched. Deliverable counts keep their numbers: "15 variantes finales", "183 € por variante" (prices unchanged). |
| 2 Spanish Creator Showcase guide = English | `ShowcaseFormats.jsx`: the Spanish page now renders the same section as English (heading, intro, four cards, case-study line) with the owner's Spanish copy; links go to the Spanish service pages and the Spanish Graspo/Elyon studies. Spanish does not filter the cards by the videos present (the Spanish library only holds UGC and Spokesperson videos). |
| 3 Graspo strategy heading | `GraspoStrategy.jsx` + `dict-casestudies.js`: "De experiencia industrial / a un contenido que conecta." Two balanced lines from `md`, natural wrapping below (no forced break on phones), heading container wider than the paragraph, `text-balance`. |
| 4 Graspo attention-to-demand | `GraspoFunnel.jsx` + dictionary: new heading and paragraph; heading `max-w-3xl`, paragraph `max-w-2xl`, balanced, more space before the funnel. Same layout fix for every language (copy of other languages unchanged). |
| 5 Graspo conclusion, 4 languages | `GraspoResult.jsx` → shared `CaseStudyConclusion.jsx` (lime theme). |
| 6 Elyon secondary CTA | `ElyonHero.jsx`: in-page link `#elyon-videos` (smooth scroll, `scroll-mt` for the fixed header, instant under `prefers-reduced-motion`, focus moves to the section heading, hash added to the URL, no new tab, no navigation). Anchor on `ElyonShowcase.jsx`. Primary CTA untouched. Labels: EN/ES/FR rendered; AR label added to the Arabic dictionary. |
| 7 Elyon conclusion, 4 languages | `ElyonResult.jsx` → the same component, gold theme (champagne gold, amber glow). 5.28x is the hero figure with its qualification and a standing note (client-reported, specific creatives, not an average, not a guarantee). |
| 8-10 Pricing | "Tu aliado creativo. A tu medida." (white + lime, as before), "Escalar mis campañas", "3 variantes por concepto, con distintos hooks o CTA." Sprint and Sprint Plus terms, quantities and prices unchanged. |
| 11-12 Contact | The contact block (`FinalCTA`, `id="contact"`) and FAQ heading are shared by the homepage; new Spanish paragraph and "Lo que suelen preguntarnos / las marcas." (lime second half). Non-English paragraph gets a wider measure and balanced lines. |
| 13 Referral heading | `ReferralRewards.jsx`: for Spanish only, "Una presentación." white + "Dos ganadores." in `text-lime`, no new dictionary key (the one entry is split at its sentence break), the lime half cannot break across lines. |

## Shared conclusion component
`src/components/caseStudies/CaseStudyConclusion.jsx` (themes `lime` and `gold`) + copy per language in `src/i18n/caseStudyConclusions.js`. Figures come from `src/caseStudies/data.js` (never retyped): Graspo = the funnel's 10.7M / 75 / 26 / 10, Elyon = peak ROAS 5.28x, 160+ creatives, 4 locations. The old "related service" line under each study is replaced by the card's conversion area (same destinations, same `case_study_related_click` analytics event). RTL needs no special code. The entrance (rise + fade) is armed on the client only, below the fold, and never under reduced motion; the prerendered HTML is fully visible.

## Decisions to confirm
- **Spanish card copy vs the library:** the Spanish library only contains UGC and Spokesperson videos, but the four cards (software/apps, organic) are shown as the owner specified; the cards describe services and link to the service pages.
- **Graspo "advanced" tile:** the Spanish tile says "En fase avanzada" (the old "en fase de presupuesto" implied quotations). English and French keep their approved labels ("quotation-stage" / "devis").
- **Zero paid promotion:** the Spanish paragraphs supplied do not mention it, so it is kept as a one-line note under the figures ("Distribución orgánica, sin promoción de pago. No todas las visualizaciones ni todos los contactos se tradujeron en ventas."). English, French and Arabic keep it in their strategy paragraph.
- **Elyon in Arabic:** there is no Arabic Elyon page (`src/i18n/registry.js`), so the Arabic Elyon conclusion and CTA label are prepared but nothing renders them.
- **English/French conclusions:** the owner supplied Spanish copy only; English and French reuse their approved sentences (the long Graspo paragraph is split, the figures it listed are the tiles). The Elyon standing ROAS note is new text in English and French (translated from the approved Spanish caveat).
- **Terminology:** "versiones/variaciones" of a concept became "variantes" on the pricing and service pages; the referral offer's "2 variaciones de anuncio" (a different offer) and the case-study prose were left as they are.

## Verification
Full suite, English parity script (only the two case-study pages differ in English, as intended), screenshots at 360/390/768/1024/1440/1920 in `CONVRT/Claude/final-copy-design-refinements/shots`.
