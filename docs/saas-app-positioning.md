# SaaS & App Video Production: repositioning (Nov 2026)

Owner brief (2026-11-26): the existing SaaS service is relevant to SaaS companies, mobile apps, web apps, software and digital platforms, so it is now named for both. **Copy and metadata only: no visual redesign, no new page, no URL change.** `/saas-video-production` (and `/es|/fr|/ar/saas-video-production`) keep their URL, canonical, hreflang and sitemap entry.

## Names and hero copy (owner-supplied, exact)
| | Service name / page title | Nav and card label | H1 |
|---|---|---|---|
| en | SaaS & App Video Production | SaaS & App Videos | Videos that explain your software or app. |
| es | Producción de vídeos para SaaS y aplicaciones | Vídeos para SaaS y aplicaciones | Vídeos que explican tu software o aplicación. |
| fr | Production vidéo pour SaaS et applications | Vidéos SaaS et applications | Des vidéos qui expliquent votre logiciel ou votre application. |
| ar | فيديوهات برامج SaaS أو التطبيقات | فيديوهات برامج SaaS والتطبيقات | فيديوهات تشرح تطبيقك أو برنامجك |

The hero description of each language is the owner's text, verbatim. The headline is one fixed sentence on two lines: the rolling last word of the other service heroes is not used here (`words: []` in `SAAS_HERO` and in `src/i18n/{es,fr,ar}/hero.js`; `UgcHero` draws the reel only when `words` is non-empty). The per-word entrance reveal is unchanged.

## Where the wording lives
- English page: `src/content/saasPage.js`, FAQ `src/seo/saasFaq.js`, head `src/seo/siteSeo.js`, JSON-LD `src/seo/structuredData.js` + `src/seo/businessKnowledge.js` (core service `saas`, `ADDITIONAL_EXPERTISE`, custom-package feature, `PRODUCT_REQUIREMENTS.saas`).
- References elsewhere: nav (`Nav.jsx`, `src/i18n/menu.js`), homepage service card (`Services.jsx`), homepage hero line and FAQ, pricing custom-package line, trust/About pages, Spokesperson and UGC FAQ links, Risk-Free form option ("SaaS or app demo / Explainer"), referral benefit title, Creator Showcase type label and format link, Arabic blog card.
- Translations: `src/i18n/{es,fr,ar}/` dictionaries (keys are the exact English sentences), `seo.js`, `labels.js`, `structuredData.js`, `pages-registry.js`, `services.js`, `about.js` (es).

## Deliberately NOT renamed
- Client industry / video category labels that accurately say SaaS: the Creator Showcase industry tab "SaaS", the Arabic Showcase type tab «فيديوهات SaaS» (owner-chosen), the "SaaS · Paid Social" review category, the "SaaS / Software" business-type options, the free hooks "SaaS & Software" track, blog category "SaaS Video Marketing".
- The Organization JSON-LD description (owner-verbatim: "…SaaS video production…"): it does not contradict the new name; the owner decides whether to widen it.
- Slugs, URLs, canonical, hreflang, sitemap, `siteSeo` indexing gate.

## Open for the SEO/GEO phase (no keyword research was done or claimed)
Final title/description wording and primary keywords per language; whether to widen the Organization description; whether a future URL should say "app"; the French primary-keyword record (`FR_PRIMARY_KEYWORDS`) now holds the owner's service name; Arabic SaaS-page FAQ answers not touched by this pass were left as they were.
