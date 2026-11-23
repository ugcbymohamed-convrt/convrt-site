# Spanish visual & conversion parity, Review 1

Branch `feat/es-visual-parity-review-1`, cut from Production `main` **afc0da4** (which already contains the language suggestion). Not merged, not deployed to Production.
English output is unchanged (`node scripts/i18n-english-parity.mjs <main dist> dist`: English pages differ only by the language selector and hreflang).

## What changed
| Area | How |
|---|---|
| Homepage hero | New Spanish H1 / description / offer line (`dict-home.js`), rolling words in `Hero.jsx` (`ROTATING_WORDS_ES`). |
| Offer cards | `SecondaryOffer` (`Hero.jsx`) is locale-aware. "1 vídeo GRATIS" links to the existing `/es/risk-free-trial`; "10 hooks GRATIS" is a visible, non-clickable block (`aria-disabled`, "Próximamente", no link). `UgcHero` shows the same cards on the Spanish service pages. The separate homepage free-video block was removed. |
| Creator carousel | `src/content/homeCreators.js` (eight ids, stable order) + `CreatorsShowcase.jsx` reusing `UgcGallery` (poster-only, lazy). Replaces "Casos de éxito" on the Spanish homepage; English keeps it. |
| Testimonials | `src/i18n/es/testimonials.js`, shown with the disclosure "Testimonios originales en inglés, traducidos al español." |
| Roadmap | Spanish copy in `dict-roadmap.js`; locale-specific H1 sizes in `RoadmapHero.jsx` so it stays on three lines. |
| Pricing | H1, subtitle, "Montaje de vídeos", FAQ tab labels; `PricingFAQ` tabs: one row on desktop, horizontal scroll below `md` (Spanish only); bottom organic CTA reads "Hablemos de tu estrategia" (same destination). |
| UGC / service heroes | `src/i18n/es/hero.js`, `dict-services.js`; locale-specific H1 sizes and `text-wrap: balance` in `UgcHero.jsx`. |

## Deliberate decisions
- The six creators are identified only by `creatorId` (es-c01..es-c06); no creator name is shown or stored. The owner called one of them "Luis"; the private map does not name him, and the owner **confirmed (2026-11-23) that creator es-c06 (the podcast presenter) is the one meant**. No name is shown or stored.
- "Creatividades diseñadas para conectar." is the owner's headline and the only approved exception to the "creativos" terminology rule.
- The 10 free hooks have no Spanish page; the card stays a non-link until `LOCALIZED_FLOWS.es.hooks` is set on purpose.
- `/es/risk-free-trial` stays release-gated (`noindex`, not in sitemap/hreflang) although the hero now links to it; its consent differs from English (the Spanish page omits the marketing-consent checkbox pending review).
- Mobile (360 px): long Spanish H1s wrap onto more lines than English (balanced, no horizontal overflow, no `nowrap`).

## Tests
`tests/spanish-visual-parity.test.mjs` (builds the site): hero copy, card behaviour, carousel, testimonials, pricing, Roadmap, UGC. Pinned tests in `tests/i18n.test.mjs`, `tests/pricing.test.mjs` and `tests/spanish-editorial.test.mjs` were updated for the intended copy changes.
