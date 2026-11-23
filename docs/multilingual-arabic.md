# Arabic site (`/ar/`): UAE + Saudi Arabia, one shared website

Branch `arabic-localization`, cut from `origin/main` `afc0da4` (Production after the Spanish release). **Preview only, not merged.** English and Spanish are unchanged except for the
language selector and `hreflang`; French is untouched (no French page, no French branch merged).

## Decisions (owner brief, 2026-11-23)
| | |
|---|---|
| Language / markets | Arabic, **one** shared website for the UAE and Saudi Arabia. `hreflang="ar"` only; no `ar-AE` / `ar-SA`, no `/ae/`, `/sa/`, no Dubai or Riyadh pages. |
| Pages | `/ar/` · `/ar/ugc-video-agency` (the **only** Arabic service page) · `/ar/pricing` · `/ar/creator-showcase` · `/ar/creative-growth-roadmap` (noindex, like English) · `/ar/risk-free-trial` (noindex, held). |
| Currency | USD, the same approved figures as English. Amounts are **read from the business data** (`src/i18n/ar/pricing.js` builds the config from `PRICE_ITEMS`), so Arabic can never disagree with English. No AED / SAR, no exchange rate, no IP-based currency. |
| Layout | Full RTL: `<html lang="ar" dir="rtl">` in the static HTML. |
| Voice | Professional, natural Modern Standard Arabic with Gulf-friendly marketing vocabulary. No dialect except where a creator video's language is the point. |
| Release | Preview only. `locales.js` has `ar: 'live'` **on this branch**; merging it makes Arabic indexable. Withdraw by setting `'review'` (noindex, no sitemap, no hreflang, no selector entry). |

## How it plugs into the existing i18n system (no component duplication)
- `src/i18n/locales.js` (`ar` live, `ogLocale: ar_AR`, country-neutral) · `registry.js` (`TRANSLATED_PATHS.ar`) · `release.js` (Arabic gates) · `cta.js` (`ar: roadmap + riskFree`, never hooks/referrals).
- Dictionary `src/i18n/ar/dict-*.js` (English sentence → Arabic, 790 entries) merged by `src/i18n/ar/index.js`. The build refuses to write an Arabic page with an untranslated string; `node scripts/i18n-check.mjs ar` checks every literal `tr()` of the Arabic pages
  (`OUT_OF_SCOPE.ar` lists the source files of pages that are not translated: SaaS, Spokesperson, Organic, About/Contact/legal, case studies, blog, referrals, hooks, /scale, private creator pages).
- Per-language data: `ar/seo.js` (titles/descriptions), `ar/structuredData.js` + `ar/jsonld-parts.js` + `ar/pages-registry.js` (JSON-LD, USD offers), `ar/services.js`, `ar/hero.js` (UGC H1), `ar/labels.js` (portfolio labels, editorial lines), `ar/money.js`, `ar/pricing.js`. Shared hooks that were Spanish-only are now per-language:
  `src/i18n/editorial.js`, `PORTFOLIO` label tables, `HOME_HERO` map, rotating words, `localizeStat`.
- **Never type a price in the dictionary**: use `{{price:key}}` (the tests fail on a typed `$` amount). Never translate a client quote (`lang="en"` + `dir="ltr"` inside the RTL page). Western digits everywhere.
- Links to pages that exist only in English (Spokesperson, SaaS, Organic, case studies, legal) are labelled **«(بالإنجليزية)»** and the service cards/footer links carry `hrefLang="en"` (`englishOnly()` in `src/i18n/tr.js`, `arabicLabel()` in `content.js`).

## RTL layer
1. **Mirroring without touching English markup.** `scripts/postcss-rtl-flip.js` (last PostCSS step) appends, after every rule that sets a left/right property, a copy under `[dir="rtl"]` with the sides swapped (margins, paddings, `left/right`,
   border sides and radii, `text-align`, `float`, `transform-origin`, `object/background-position`, horizontal `linear-gradient(to right|left …)`). It keeps `left:50%` (centring idiom), skips `@keyframes`, is idempotent, and preserves the cascade order so `md:ml-0` still beats `ml-4`.
2. **Behaviour CSS cannot express** lives in `src/lib/rtl.js`: `stepOfArrow` (the arrow meaning "next" is ← in Arabic), `stepOfSwipe`, `scrollOffset`/`scrollAlong` (RTL `scrollLeft` is 0 → negative), `forward()` (→ / ←). Used by the UGC gallery, the Showcase tabs and lightbox, the three-phone stage (the next phone sits on the reading-direction side), the pricing tablists and chevrons.
3. **SVG illustrations**: `text-anchor` start/end are swapped for Arabic so labels keep their designed positions (`index.css`).
4. **Type**: IBM Plex Sans Arabic (SIL OFL), self-hosted Arabic subset, weights 400/500/600/700, `font-display: swap`, `unicode-range` so it downloads only when a page has Arabic. Inter keeps Latin, digits and prices (brand names and `$3,000` look identical in every language). `letter-spacing: normal !important` and a taller line-height under `:lang(ar)`.
5. Mixed text: Latin names (CONVRT, UGC, Sprint, Meta, TikTok) stay Latin inside Arabic sentences; `<bdi>` isolates figures and package names in data-built sentences; e-mail / URL / phone inputs are LTR; English quotes are `dir="ltr"`.
6. `main.jsx` also sets `lang`/`dir` at runtime for translated pages (no-op on prerendered pages; guarantees RTL in the dev server).

## Search plan (research: owner's UAE + Saudi Arabic Keyword Planner exports; volumes are rounded directional Google estimates and are never summed)
| Page | Intent | Title |
|---|---|---|
| `/ar/` | broad: فيديوهات إعلانية، محتوى للسوشيال ميديا، فيديوهات بمقدّمين، إعلانات فيديو للمتاجر الإلكترونية | إنتاج فيديوهات إعلانية وUGC للعلامات التجارية |
| `/ar/ugc-video-agency` | وكالة UGC · إنتاج / تصوير فيديوهات UGC · صناعة محتوى UGC · إعلانات UGC | وكالة UGC \| إنتاج فيديوهات UGC للإعلانات |
| `/ar/pricing` | أسعار فيديوهات UGC · حقوق الاستخدام | أسعار فيديوهات UGC وباقات الإنتاج الإعلاني |
The Saudi query «تصميم اعلانات سناب شات» (~500, ambiguous intent: design / video / media buying) is **not** a target and no Snapchat page exists: CONVRT does not manage ad accounts.
Direct Google-Sheet access was not used in this run; the targeting above follows the verified findings in the brief and the local keyword exports under `~/Desktop/CONVRT/KEYWORDS/{UAE,SAUDI}`.

## Creator videos
Twelve Arabic-speaking creator videos (Cloudflare Stream `AR-CREATOR-nn`, uploaded 2026-11-23) in `src/content/portfolio.js` (`languages: ['ar']`, `onlyIn: ['ar']`), three of them the hero stage (and the homepage stage), nine in the gallery/Showcase. Poster frames in `posterFrames.js` (+ `public/portfolio/ar-*.webp`).
- Creator names, nationalities, dialects, brands, credits and dates are **not** shown or invented; `production` is unset (the pages say these are independent creators' examples, not necessarily CONVRT productions).
- Three clips from the same folder (`AR-CREATOR-06`, `-09`, `-12`) have **English** on-screen captions, so they were uploaded but are **not used**.
- The approval flags rest on the brief's wording ("approved Arabic-speaking creators"): the owner should confirm portfolio permission and creator consent for each creator before Production.

## Owner / legal review before Production
1. Confirm creator consent + portfolio use for the 12 Arabic videos (and the spoken language of each: Arabic was set from the on-screen Arabic captions, no audio transcription was possible here).
2. Arabic **free-video application** (`/ar/risk-free-trial`): consent wording, eligibility and hedges need owner + lawyer review (`AR_FREE_VIDEO_REVIEWED` in `release.js`, currently `false`: noindex, no sitemap/hreflang).
3. **VAT / tax wording**: Arabic repeats the existing English term "All prices exclude VAT; applicable taxes are calculated on your business location and tax status". No UAE/Saudi tax rule or registration is stated; confirm whether local wording is wanted.
4. Legal pages stay English (labelled «بالإنجليزية»): a translation is a legal decision (`docs/multilingual-legal-translation-review.md`).
5. OG share image (`public/og/convrt-og-ar.png`, 1200×630) does not exist: Arabic pages reuse the English-text image until it is made (`AR_OG_IMAGE_READY`).
6. Copy review by a native Gulf reader: terminology list below; the dialect FAQ ("Gulf and Moroccan Arabic") is a faithful translation of the existing English answer and the supply must be confirmed.
7. Booking (Calendly) and the Roadmap/Qualification option **values** stay English by design (the qualification logic compares them); labels are Arabic.

## Terminology (fixed across the dictionary)
creator = صانع محتوى / صُنّاع المحتوى · concept = فكرة إبداعية (أفكار) · hook = الافتتاحية · version = نسخة · usage rights = حقوق الاستخدام · raw footage = اللقطات الخام · Free Creative Growth Roadmap = خطة نمو إبداعية مجانية ·
"Get 5 Free Ad Concepts" = احصل على 5 أفكار إعلانية مخصصة (five personalised **concepts**, not five videos) · Spokesperson video = فيديو بمقدّم · organic social = المحتوى العضوي للسوشيال ميديا. Package names and UGC/SaaS/Meta/TikTok/Snapchat stay Latin.

## Tests and tooling
- `node --test tests/arabic.test.mjs` (new, 25 tests: locale/pages, USD parity with English, contract terms, dictionary parity and banned phrases, creator data, RTL helpers, the PostCSS plugin, fonts, then a real build: lang/dir, canonical, hreflang reciprocity, sitemap, JSON-LD, price text, quotes, English/Spanish unchanged).
- Existing suites updated where they pinned "Arabic is not built" (`i18n`, `routes`, `seo-batch-2`, `spanish-eur-pricing`, `ugc-page`, `video-posters`).
- `node scripts/i18n-check.mjs ar` · `node scripts/i18n-english-parity.mjs <dist-before> <dist-after>` (English must differ only by the selector and hreflang).
