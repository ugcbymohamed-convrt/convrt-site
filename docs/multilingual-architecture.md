# Multilingual architecture (en · es · fr · ar)

Branch `multilingual-foundation-es`, cut from `origin/main` 5bf3b50 (the trust/privacy release). English is the source language and its URLs, canonicals, sitemap
entries and approved copy are unchanged. Spanish is a complete launch candidate. French and Arabic are **prepared, not published**.

## URL scheme
| Language | URLs | Status (`src/i18n/locales.js`) |
|---|---|---|
| English | unchanged (`/`, `/pricing`, …) | live |
| Spanish | `/es/` and `/es/<same slug>` | live (flip to `'review'` to withdraw: noindex, no sitemap, no hreflang, no selector) |
| French | `/fr/…` | prepared: no routes are built, so `/fr/…` is a real HTTP 404 |
| Arabic | `/ar/…` (right-to-left) | prepared: same |

A page exists in a language **only** when it is listed in `src/i18n/registry.js` (`TRANSLATED_PATHS`). That one list builds the static HTML, the sitemap entry, the reciprocal
hreflang and the selector link. Nothing else can route to a translation, so an unfinished page cannot leak.

## How a request becomes a language
`src/i18n/locale.js` reads the **URL only** (never the browser language, a cookie or the visitor's location), identically in the browser and in the build's server entry, so
prerender and hydration always agree. `src/App.jsx` parses `/es/pricing` into `{locale:'es', basePath:'/pricing'}` and routes `basePath` through the same table as English.
A path that is not translated, or a language that is not built, renders the not-found page (the host answers 404).

## Content
Three mechanisms, all English-sourced so English output is identical by construction:
1. **`tr('English text')`** (`src/i18n/tr.js`) in components. English returns the string untouched. Other languages look it up in `src/i18n/<locale>/dict-*.js` (keys = the exact English string).
   `<T>…</T>` is the same for JSX created at module load. Component code must call `tr` at render time, never at import time.
2. **`localizeConfig(config, locale, overrides)`** and **`localizeFaq(items, locale)`** (`src/i18n/content.js`) translate page configs and FAQ lists leaf by leaf through the same dictionary,
   leaving ids, URLs and analytics names alone. Data-driven sentences (prices, counts, months) are translated as whole sentences, so a changed figure changes the key.
3. **Per-locale data modules** where a lookup is not enough: SEO (`es/seo.js`), headline words (`es/hero.js`), labels/captions (`es/labels.js`), money (`es/money.js`), JSON-LD (`es/structuredData.js`, `es/jsonld-parts.js`).

**Completeness and drift guard.** (a) The build refuses to write a translated page if anything rendered, or any head/JSON-LD text, missed the dictionary
(`vite-plugin-static-routes.js`: "Untranslated strings (N): …"; set `I18N_MISSES_FILE=<path>` to also get them as JSON). (b) `node scripts/i18n-check.mjs es` scans every literal `tr()` in the source,
catching states a static render cannot reach (closed panels, scene steps). (c) `tests/i18n.test.mjs` pins both, plus figure parity between each English sentence and its translation.
When English copy changes (for example SEO/GEO Batch 2) the old key no longer matches and the Spanish build fails until the translation is updated: a Spanish page can never silently show a stale claim.

## Head, SEO, structured data
`pageHead(basePath, locale = currentLocale())` (`src/seo/siteSeo.js`) returns the localized head: own title/description/OG, **self-referencing canonical**, `og:locale`, `html lang`/`dir`,
and the reciprocal **hreflang** set (`en`, `es`, `x-default` = English) from `alternatesFor()` (`src/i18n/seo.js`). hreflang exists only for indexable pages that have a live translation;
English pages with a translation carry the same set (reciprocity); everything else has none. The Organization node and its `@id` are **identical in every language**; each Spanish page has its
own `WebPage` (`inLanguage: es`), breadcrumb, FAQPage (generated from the Spanish FAQ it shows) and page-scoped Spanish `Service` nodes. The `WebSite` node is referenced by `@id`, not redefined.

## Release gates (`src/i18n/release.js`)
A page can be built but not released: blocked pages are noindex, out of the sitemap, out of hreflang, and the selector falls back to the language home. The Spanish Showcase is gated on having approved Spanish-language videos (its own creators and videos, never the English library); `node scripts/es-launch-readiness.mjs` lists every remaining blocker. Videos shown on a non-English page are limited to entries whose `languages` include that language (`forPageLanguage`), and an entry may carry `i18n: { es: { title, caption } }` copy written for that page.

## Language selector
`src/components/LanguageSelector.jsx` (header dropdown, mobile-menu list, crawlable footer list). Every option is a plain link to the equivalent page when it exists (`src/i18n/switch.js`), otherwise that
language's home; no redirect and no detection. Since the language suggestion for visitors in Spain (`docs/language-suggestion.md`) a click on an option also stores the visitor's explicit choice (`convrt_language`, first-party localStorage, listed in the Privacy Policy), only so that suggestion is not shown again; the page language still comes from the URL alone. French and Arabic appear automatically the day their status becomes `'live'`.

## Conversion flows
`src/i18n/cta.js` says, per language, which conversion flows exist (`LOCALIZED_FLOWS`). English has all of them. **Spanish has the Roadmap** (`/es/creative-growth-roadmap`): labels, descriptions, validation errors,
outcomes and the Calendly gate are translated, while option *values* stay English (the qualification logic compares them exactly) and no backend, analytics or Calendly behaviour changed (the Roadmap is client-side
only; there is no consent box). Risk-free trial, Free Hooks and Referral remain English-only: for Spanish their CTAs are omitted or become the booking call (same Calendly link, new tab, `rel=noopener`), and FAQ
links into them are dropped. French and Arabic have no flows. To localize another flow: translate its components with `tr()`, build the page into `TRANSLATED_PATHS`, then flip its flag (CTAs switch by themselves).

## Pricing per language
English prices are the business data (USD). Each other language has its own explicitly approved pricing configuration (`src/i18n/<locale>/pricing.js`: currency, notation, `status`, one amount per price in `PRICE_ITEMS`), registered in `src/i18n/pricing.js`. Dictionary sentences carry `{{price:key}}` tokens, never numbers; `money()` throws for a price without a key; pending pricing shows a placeholder, omits Offers and blocks the priced pages (`src/i18n/release.js`). Spanish is EUR with owner-approved amounts: `docs/multilingual-spanish-eur-pricing.md`.

## Right-to-left readiness (Arabic)
`languages.ar.dir = 'rtl'`; the build writes `<html lang="ar" dir="rtl">` for any built RTL locale; `src/index.css` has an Arabic font stack, `letter-spacing: normal` and line-height rules scoped to
`:lang(ar)` / `dir="rtl"` (no effect on LTR pages, tested). Tailwind's `rtl:` variant and logical utilities (`start/end`) are available. Still to do before Arabic ships: self-host an Arabic web font, audit
physical-direction classes (`left/right`, `ml/mr`, `text-left`) in shared components, and review mixed Arabic/Latin terminology. See `docs/multilingual-french-arabic-backlog.md`.

## Tooling added
- `scripts/i18n-check.mjs` — dictionary completeness for literal `tr()` calls.
- `scripts/i18n-english-parity.mjs` — proves English pages are unchanged between two builds.
- Prerender is now UTF-8 safe (`src/entry-server.jsx` decodes the whole stream once and drops stray NUL bytes React can emit beside multi-byte characters; it was latent for English because it is ASCII).
