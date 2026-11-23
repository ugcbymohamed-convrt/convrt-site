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

### The 12 videos in use
| Entry | Stream id | Upload name (source file) | Placement | Caption (describes the footage only) |
|---|---|---|---|---|
| `ar-ugc-hero-1` | `442dfb5fe6a49dffd032ecd920414512` | AR-CREATOR-01 (default.mp4) | hero stage (home + UGC page) | صانع محتوى يشرح خدمة رقمية أمام الكاميرا |
| `ar-ugc-hero-2` | `e76683d744c46ecfe8e1fb53b273b926` | -02 (default-2) | hero stage (home + UGC page) | صانعة محتوى تقدّم خدمة تعليمية أمام الكاميرا |
| `ar-ugc-hero-3` | `7f68e3f6c92e70395cad4876fcb389a8` | -03 (default-3) | hero stage (home + UGC page) | صانع محتوى يعرض مزايا منتج برسوم توضيحية |
| `ar-ugc-1` | `6d550ed3188d606de1b28dfd389c3abd` | -04 (default-4) | gallery + Showcase | صانع محتوى يتحدث عن فكرة مشروع بخلفيات مرئية |
| `ar-ugc-2` | `ad0e4e3babf8a7dc94a67df48d48399a` | -05 (IMG_0181) | gallery + Showcase | عرض منتج شاي وتجربة تحضيره |
| `ar-ugc-3` | `49313eccb88e9b95a4985d59777d8e41` | -07 (IMG_1073) | gallery + Showcase | عرض عطر أمام الكاميرا |
| `ar-ugc-4` | `a073ed5202bdd7c83de8312cefa3e419` | -08 (IMG_4287) | gallery + Showcase | جولة تعريفية في مشروع عقاري |
| `ar-ugc-5` | `10c436de7f9b0c5bfbdee723aff56659` | -10 (IMG_5289) | gallery + Showcase | عرض منتجات شوكولاتة في الهواء الطلق |
| `ar-ugc-6` | `fa580c253a9bb4d64b04c1226de96819` | -11 (IMG_7416) | gallery + Showcase | صانع محتوى يشرح خدمة تقنية للجمهور |
| `ar-ugc-7` | `0241249ccf242630f097d03ac8cc11b9` | -13 (IMG_8504) | gallery + Showcase | مقطع بأسلوب الحياة يعرض خدمة عبر تطبيق |
| `ar-ugc-8` | `002d9dab913f13496e6513e4a7761ec9` | -14 (IMG_9010) | gallery + Showcase | فيديو يشرح فكرة محتوى المستخدمين بأسلوب بصري |
| `ar-ugc-9` | `583c9f5132d0cfe0f2eb26ea1df73446` | -15 (IMG_9881) | gallery + Showcase | عرض منتج رياضي واستخداماته |

Not used (English on-screen captions): `0cf5d213…` (-06, IMG_0769), `73591233…` (-09, IMG_4545), `60c9247e…` (-12, IMG_7827). They remain on Stream and can be deleted by the owner.

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
