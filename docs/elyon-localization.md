# Elyon Dubai case study in four languages (Nov 2026)

One study, one set of components (`src/components/elyon/*`), four languages. The English study is the reference for every fact; figures live in `src/caseStudies/data.js` and are never retyped.

## URLs
| Language | URL | Notes |
|---|---|---|
| English | `/case-studies/elyon` | unchanged |
| Spanish | `/es/case-studies/elyon` | existed (Review 1) |
| French | `/fr/case-studies/elyon` | existed (Revision 4) |
| Arabic | `/ar/case-studies/elyon` | **new**: `src/i18n/ar/dict-elyon.js`, SEO in `ar/seo.js`, JSON-LD in `ar/pages-registry.js` + `ar/structuredData.js` |

`/<locale>/case-studies` renders the default study (Graspo), canonicalises to `/<locale>/case-studies/graspo`, has no hreflang and is not in the sitemap. Since this change it exists in Arabic too (until then the Arabic page was Graspo-only and `Nav`/`Footer` pointed straight at it through `arHref`). It carries the switcher, so an Arabic visitor reaches Elyon from the menu in one click.
Reciprocal hreflang (en, es, fr-FR, ar, x-default = English) comes from the registry (`TRANSLATED_PATHS`); the sitemap lists the four study URLs.

## Facts that must stay apart (all languages)
- **3.63×** = average ROAS of the *early four-creative test* (spend $229.89, purchase value $835; top creative 5.10×, second 3.17×).
- **5.28×** = ROAS of ONE standout creative, weeks later (9 purchases, $3,421.25 revenue).
- Both are client-reported (Meta Ads Manager results sent over WhatsApp), relate to specific creatives and moments, are not an account-wide average and not a guarantee. They are never added together or described as one window; the 5.28× is never called an average. `tests/arabic-elyon.test.mjs` fails if one rendered element contains both numbers.
- USD stays USD: English `$835`, Spanish `835 USD`, French `835 USD` (narrow no-break space thousands, `fr/money.js`), Arabic `$835` (`formatMoneyAr`). `usd()` in `components/caseStudies/format.js` picks the notation.

## Arabic editorial decisions
- Client: **«إيليون دبي»** in all visible text (hero, breadcrumb, switcher, alt text, conclusion, SEO titles). The logo, the `Elyon Dubai` handle, URLs, image file names and the JSON-LD organisation name keep the Latin name.
- Terms: UGC, ROAS (written «العائد على الإنفاق الإعلاني (ROAS)» at first mention), الكونسيبت, لقاءات في الشارع; a single advertisement is «إعلان», a variation «نسخة». No dialect.
- Hero secondary CTA «شاهد الفيديوهات التي أنتجناها» scrolls to `#elyon-videos` on the same page (all four languages; label wording from the owner).
- RTL specifics: the bottle scene is a `dir="ltr"` island (like the Graspo paper scene); the spend → value → ROAS arrows and the three-stage arrows are turned; figures with a trailing sign go through `ltrRun()` (a `<bdi dir="ltr">`) and the two dictionary strings that mix «5.28×» with Arabic words carry an LRI/PDI isolate; switcher arrow keys follow `stepOfArrow`.
- Elyon stays champagne gold (no lime).

## Discoverability (Elyon = paid-advertising proof, Graspo = organic proof)
Arabic: Case Studies menu entry and footer → `/ar/case-studies`; UGC page proof + FAQ link; Creator Showcase guide (both studies); referral page; the homepage client stage keeps its two clients and adds a visually hidden crawlable link to the Elyon study (`SHOWCASE_EXTRA_LINKS_AR`); no new homepage section. The Spanish and French menus already reached their studies.

## ES / FR audit (2026-11-26)
Both studies are complete (same eleven sections as English, same figures, 3,63× and 5,28× kept apart, hero CTA labels as briefed). Fixed: French USD amounts used Spanish notation (`3.421,25`) and now read `3 421,25 USD`; French mini-stats mixed `×` and `x` (now `x`, like the rest of the French page); the Spanish dictionary lacked the key `Elyon Dubai` (the component had special-cased it). Left as authored (owner copy): ES/FR conclusion paragraphs say "some creatives reached up to 5,28×" while the card above says "a single standout creative" (consistent with "up to"; English has the same sentence).

## Tests
`node --test tests/arabic-elyon.test.mjs` (head, hreflang, sitemap, figures, claim separation, CTA, RTL markers, JSON-LD, links, ES/FR checks), plus the updated `arabic.test.mjs`, `i18n.test.mjs`, `es-case-studies.test.mjs`, `routes.test.mjs`. `scripts/i18n-check.mjs` no longer excludes the Elyon components for Arabic.
