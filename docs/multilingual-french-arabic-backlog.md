# French and Arabic: research inventory and implementation backlog

Status: architecture prepared, nothing published (`status: 'prepared'` in `src/i18n/locales.js`; no routes are built; no selector entry; no hreflang; no dictionary). **No French or Arabic keyword volume,
market-size or creator-availability claim exists in this repository, and none may be added without research and owner verification.**

## What is ready (no duplication needed)
- Locale registry, path helpers, routing and 404 behaviour for `/fr/…` and `/ar/…`; hreflang, canonical, sitemap and selector pick up a language the moment its status becomes `'live'` and its pages are in `TRANSLATED_PATHS`.
- `src/i18n/<locale>/` dictionary layout, `tr()`, `localizeConfig()`, `localizeFaq()`, the "untranslated string" build guard, `scripts/i18n-check.mjs`, the English-parity script and the i18n tests (extend `tests/i18n.test.mjs` per language).
- Arabic: `dir="rtl"` written into the static HTML for a built RTL locale; RTL-scoped CSS (font stack, no letter-spacing, line-height) that cannot affect LTR pages.
- The shared components are language-neutral; Spanish needed no component duplication, so French and Arabic need none either.

## French (France-first) — to do
1. **Research (not started):** French Keyword Planner export (agence UGC, agence de contenu, tarifs UGC, vidéos explicatives SaaS, vidéo avec présentateur), France SERP/competitor validation (same method as `docs/multilingual-spanish-seo-map.md`), customer-language review. Do not reuse Spanish volumes.
2. **Positioning:** native professional French for brands in France; "vidéos UGC pour la publicité sociale", "contenu organique", "vidéos avec présentateur", "vidéo SaaS". No invented offices or French-market results.
3. **Creator segmentation:** French-speaking creators only where `languages` data confirms it (the owner keeps French creator folders; none is mapped to a portfolio entry yet). Same owner-review list method as Spanish.
4. **Copy:** same nine pages; same drift-guarded dictionary (`src/i18n/fr/*`); French money notation ("3 000 USD", narrow no-break space) in `src/i18n/fr/money.js`; French number/typography rules (espaces insécables before « : ; ? ! »).
5. **Same blockers as Spanish:** localized conversion flows, legal set, OG image text, owner approval.

## Arabic (GCC-first) — to do
1. **Research (not started):** Arabic Keyword Planner exports for UAE and Saudi Arabia (the owner already holds English UAE/UK/US sets; no Arabic export exists); GCC SERP validation (وكالة UGC، إنتاج فيديو إعلاني، فيديو تعريفي لـ SaaS …); local competitors; pricing expectations in USD vs AED/SAR (prices stay USD by decision, but display convention must be agreed).
2. **Language policy:** Modern Standard Arabic as the professional website language; creator showcase may offer Gulf Arabic and Moroccan Darija **only where the data verifies the creator's dialect** (English FAQ already states both dialect options; the portfolio has no Arabic-labelled video today).
3. **GCC positioning:** UAE and Saudi first without excluding other Arabic-speaking clients; no office, licence or location claims; the Graspo (Arabic-first organic) and Elyon Dubai case studies are verified proof that may be translated once permission/wording is checked.
4. **RTL/mobile/typography work before launch:** self-host an Arabic font (subset, `font-display`), audit physical-direction Tailwind classes in shared components (`left/right`, `ml/mr`, `text-left`, translate-x animations, arrows `→`/chevrons), mirror carousels/scrollers, check the 3-phone stage and pricing cards in RTL, Arabic-Indic vs Western digits policy, mixed Arabic/English terminology (UGC, ROAS, SaaS) with `dir="auto"`/`<bdi>`, Arabic quotation marks, line-height/size scale, hyphenation off.
5. **Mixed terminology:** keep Latin brand and package names (Creative Testing Sprint, Sprint Plus) inside Arabic sentences; decide transliteration vs Latin for UGC/ROAS.
6. **Selector:** the Arabic option is shown as «العربية» with `lang="ar" dir="rtl"` already.
7. **Same blockers as Spanish** (flows, legal set, OG image, approval).

## Order (owner-confirmed): Spanish → French → Arabic
