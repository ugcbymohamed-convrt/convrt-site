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
4. **Type**: IBM Plex Sans Arabic (SIL OFL), self-hosted Arabic subset, weights 400/500/600/700, `font-display: swap`, `unicode-range` so it downloads only when a page has Arabic. (Noto Kufi Arabic was tried on 2026-11-24 and reverted on 2026-11-25 at the owner's request.) Inter keeps Latin, digits and prices (brand names and `$3,000` look identical in every language). `letter-spacing: normal !important` and a taller line-height under `:lang(ar)`.
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
Fifteen creator videos (twelve Arabic, three English-captioned) (Cloudflare Stream `AR-CREATOR-nn`, uploaded 2026-11-23) in `src/content/portfolio.js` (`languages: ['ar']`, `onlyIn: ['ar']`), three of them the hero stage (and the homepage stage), nine in the gallery/Showcase. Poster frames in `posterFrames.js` (+ `public/portfolio/ar-*.webp`).
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

Added 2026-11-24 on the owner's request (they have English on-screen captions; tagged `languages: ['en']`, so Arabic cards and the Showcase language filter say «الإنجليزية»; no audio transcript was run). Third-party names/logos that appear in the footage are never named in the copy:

| Entry | Stream id | Upload name | Placement | Caption (describes the footage only) |
|---|---|---|---|---|
| `ar-ugc-10` | `0cf5d2139e0769332c053ac71984ca14` | -06 (IMG_0769) | gallery + Showcase | عرض قميص بقصّة واسعة من الأمام والخلف مع لقطة قريبة للقماش |
| `ar-ugc-11` | `7359123313ee51b95976e3ae6adc331e` | -09 (IMG_4545) | gallery + Showcase | صانع محتوى يشرح منصة لإدارة علاقات العملاء أمام الكاميرا |
| `ar-ugc-12` | `60c9247e04b35d3dde12aa6c918aa1d6` | -12 (IMG_7827) | gallery + Showcase | جولة داخل شقة في برج سكني مع لقطات للمبنى والمرافق |

Owner check: IMG_4545 shows a company logo and IMG_7827 a developer logo and a «May 2026» date on screen (client/third-party content); confirm they are fit to show.

## Revision 2 (owner brief, 2026-11-23): design parity with the English homepage, four service pages, Graspo case study

The English site is the visual source of truth; `origin/main` (English design review #1, the services dropdown, the footer) was merged into `arabic-localization`.

**What changed**
- **Homepage = the English composition** (`App.jsx`, `Credibility.jsx`: `en || ar`): hero, logo strip + founder headline, the cinematic client stage, services, process, creator carousel, reviews, final CTA. Components are shared and locale-aware, never copied:
  `IndustryShowcase` (client data from `SHOWCASE_INDUSTRIES_AR` in `src/content/homeShowcase.js`: Graspo = الطباعة, One Royal = التداول, nothing else), `RotaryStage` (the stage scene is a `dir="ltr"` island; the ring is mirrored with `pose(..., mirror)` so the NEXT video stands on the left;
  arrows and swipe use `stepOfArrow` / `stepOfSwipe`; videos are never flipped), `ClientReviews` (Arabic wording in `src/i18n/ar/reviews.js`), `HomeCreators` (Arabic videos tagged `homeCreator`).
- **Navigation**: brighter Arabic labels (CSS, `:lang(ar) header nav a`), lime hover/focus; CTA = «احصل على 5 أفكار إعلانية مجانًا» everywhere (nav, hero, Roadmap, pricing, services).
- **Hero**: rolling-word baseline fixed at the cause (an `overflow:hidden` inline-block takes its bottom edge as baseline; Arabic now clips with `clip-path`, and `.ugc-reel` aligns on the baseline with the headline's own line height; verified by a probe at 390/1440 for every word). Subtitle: فيديوهات Spokesperson, محتوى عضوي.
  Offer line «أفكارك الإعلانية الخمس التالية، مخصصة لعلامتك التجارية. مجانًا.» (مجانًا in lime). Secondary CTA «مكتبة الفيديوهات». Free offers under the CTAs: the free video (links to the Arabic application) and the 10 hooks as a «قريبًا» tile (not a link: `src/i18n/ar/heroOffers.js`).
- **Four Arabic service pages** (`/ar/ugc-video-agency`, `/ar/spokesperson-video-production`, `/ar/social-media-video-production`, `/ar/saas-video-production`): the existing configuration-driven pages with Arabic dictionary entries (`dict-pages.js`, translated from the approved Spanish sentences), Arabic H1s (`ar/hero.js`), FAQs, JSON-LD, hreflang, sitemap. The SaaS page has NO video gallery (text-led layout, no placeholders).
- **Graspo case study** `/ar/case-studies/graspo` (superseded by Revision 4: the same components as English; formerly `GraspoCaseStudyArPage.jsx` + `graspoCaseAr.js`; the header of that file lists exactly what is used and what is left out).
- **Videos** (`portfolio.js`, all `languages: ['ar']` + `onlyIn: ['ar']`): Mohamed ×3 (`AR-MOHAMED-01..03`), One Royal ×3 (Mohamed presenting, `AR-ONEROYAL-01..03`), Graspo ×3 (the same Stream videos as the English Graspo panel, copied as Arabic-only entries so the English pages are untouched).
- **RTL layer bug fixed**: the mirror used to ADD the swapped side without removing the original (`ml-5` gave a margin on both sides, `border-l` a border on both). The plugin now resets the original side in a rule one `:not()` below the mirrored value, so elements with both `ml-*` and `mr-*` keep both mirrored values. Also fixed: an escaped `\:before` inside a Tailwind class name was mistaken for a pseudo-element.

**Evidence rules applied**
- **View counts** (`views` on a portfolio entry, rendered by `ViewsBadge`): only the figures the English Graspo case study already publishes for the same Stream ids (7.5M, 1.2M, 295K; Meta Business Suite, Jan to Jun 2026). The owner's brief said "about 7M, 5M and 3M": the records support 7.5M / 1.2M / 295K (and 1.9M in the top-content list), so those are shown; nothing is summed per video or inferred from file names, and no badge says anything but views.
- The Arabic case study leaves out the English study's lead figures (75 / 26 / 10), funnel and lead examples (their evidence is an internal tracker and client messages); no lead, ROAS, revenue or conversion claim is made in Arabic.
- Reviews: the three published English reviews, translated at the owner's request (this overrides "never translate a client quote" for that section only); no label, no stars, no extra praise. A native reader should confirm the wording.

**Open items for the owner** (see also the list above)
1. A One Royal LOGO file is not in the repository or the owner's folders: the selector shows the name as text. Supply `public/clients/oneroyal.(png|svg)` and set it as `logo` in `SHOWCASE_INDUSTRIES_AR`.
2. Confirm creator/brand consent for the Mohamed, One Royal and Graspo videos (they were approved by the brief; recorded in `AR_BRAND_APPROVAL`). One Royal script 3 shows sample profit figures on screen (client content, not a site claim): confirm it is fit to show.
3. Classification: the One Royal videos are `spokesperson` (a presenter to camera); Mohamed's bag and clothing videos are `ugc`, the app video `spokesperson`. Change `type` if you see them differently. Spoken language `ar` is set from the Arabic captions; the audio was not transcribed.
4. The Sharjah book-fair clip in the Mohamed folder features third parties (an author and a publisher's staff) and was NOT uploaded.
5. Graspo's case-study lead/funnel sections stay English-only; say if the Arabic page should carry them with their evidence.

## Owner / legal review before Production
1. Confirm creator consent + portfolio use for the 12 Arabic videos (and the spoken language of each: Arabic was set from the on-screen Arabic captions, no audio transcription was possible here).
2. Arabic **free-video application** (`/ar/risk-free-trial`): consent wording, eligibility and hedges need owner + lawyer review (`AR_FREE_VIDEO_REVIEWED` in `release.js`, currently `false`: noindex, no sitemap/hreflang).
3. **VAT / tax wording**: Arabic repeats the existing English term "All prices exclude VAT; applicable taxes are calculated on your business location and tax status". No UAE/Saudi tax rule or registration is stated; confirm whether local wording is wanted.
4. Legal pages stay English (labelled «بالإنجليزية»): a translation is a legal decision (`docs/multilingual-legal-translation-review.md`).
5. OG share image (`public/og/convrt-og-ar.png`, 1200×630) does not exist: Arabic pages reuse the English-text image until it is made (`AR_OG_IMAGE_READY`).
6. Copy review by a native Gulf reader: terminology list below; the dialect FAQ ("Gulf and Moroccan Arabic") is a faithful translation of the existing English answer and the supply must be confirmed.
7. Booking (Calendly) and the Roadmap/Qualification option **values** stay English by design (the qualification logic compares them); labels are Arabic.

## Terminology (fixed across the dictionary)
creator = صانع محتوى / صناع المحتوى · concept = فكرة إبداعية (أفكار) · hook = الافتتاحية · version = نسخة · usage rights = حقوق الاستخدام · raw footage = اللقطات الخام · Free Creative Growth Roadmap = خطة نمو إبداعية مجانية ·
"Get 5 Free Ad Concepts" = احصل على 5 أفكار إعلانية مخصصة (five personalised **concepts**, not five videos) · Spokesperson video = فيديو بمقدّم · organic social = المحتوى العضوي للسوشيال ميديا. Package names and UGC/SaaS/Meta/TikTok/Snapchat stay Latin.

## Tests and tooling
- `node --test tests/arabic.test.mjs` (new, 25 tests: locale/pages, USD parity with English, contract terms, dictionary parity and banned phrases, creator data, RTL helpers, the PostCSS plugin, fonts, then a real build: lang/dir, canonical, hreflang reciprocity, sitemap, JSON-LD, price text, quotes, English/Spanish unchanged).
- Existing suites updated where they pinned "Arabic is not built" (`i18n`, `routes`, `seo-batch-2`, `spanish-eur-pricing`, `ugc-page`, `video-posters`).
- `node scripts/i18n-check.mjs ar` · `node scripts/i18n-english-parity.mjs <dist-before> <dist-after>` (English must differ only by the selector and hreflang).


## Revision 3 (owner brief 2026-11-24): Noto Kufi Arabic, copy, logo strip, Graspo stage, new hero video

- **Font**: Noto Kufi Arabic was applied and then REVERTED (2026-11-25, owner: the previous font looks better); the site uses IBM Plex Sans Arabic again, with the weights and hero size of Revision 2. The fixed rolling-word slot (sized by the widest word as drawn) and its roomier clip box stay.
- **Copy**: every replacement of the brief is in `src/i18n/ar/dict-*.js` (hero subtitle, free offers, services heading, process steps, creator heading and CTA, Elyon review in `reviews.js`, final CTA, FAQ heading). Service tags are their own Arabic wording (`pillsAr` in `Services.jsx`). The services supporting sentence sits under the heading (Arabic only). The final CTA headline is two lines.
  Step 4 keeps «ضمن النطاق المتفق عليه»: the brief's wording alone could read as unlimited revisions.
- **Hooks**: «افتتاحيات/افتتاحية» became «هوكات/هوك» across the Arabic files (ad hooks only). Code identifiers and routes keep `hook`.
- **Logo strip**: the cause was direction. Under `direction: rtl` the w-max track is anchored at the right edge while the animation moves it left, so the strip was half empty and jumped on loop. The marquee now carries `dir="ltr"` (Arabic only), like English.
- **Graspo stage**: the three Arabic Graspo entries now have same-origin posters (`public/portfolio/ar-graspo-1..3.webp`, from `posterFrames.js`) so the side frames never depend on a live Stream thumbnail request.
- **Hero video**: the centre phone of the Arabic home hero is `ARABIC-with-Dubbed-Text.mp4` (owner's file, 2026-11-24, replaced `CONVRT_AD_GULF_ARABIC_FINAL.mp4`; transcoded from 4K HEVC to 1080x1920 H.264 for the 200 MB upload limit; Stream `afdb58ebb92354534b513dabca0d64f5`, 61 s, poster frame 8 s; every frame carries the burned-in «مدبلج إلى العربية» badge; the earlier Stream video `b9e0e422…` is no longer referenced). The side videos are unchanged. Presenter, consent and production credit are not recorded.
- **All languages**: the long creator-library paragraph (`CREATOR_EXAMPLES_NOTE`) is gone from the Creator Showcase hero and the homepage creator carousel (the service-page galleries keep it). The founder-experience footnote and asterisks are no longer repeated in the homepage stat strip (`<FinalCTA attributed />`); the attribution stays under the founder headline, on the pricing page and on the case-study pages. French is not built on this branch: its dictionary lives on `french-localization` and needs the same two removals when merged.
- **Tone**: the conversational register is applied to headlines, CTAs, process and service cards; FAQ answers, pricing conditions, usage rights, commitments, consent and form instructions stay in precise standard Arabic. «لسا» and «بلّش» (approved by the owner) lean Levantine; Gulf alternatives are «للحين/توّني» and «ابدأ»: owner to decide.


## Revision 4 (owner brief 2026-11-25): native Gulf copy and English parity on every other Arabic page

- **Font**: the brief said "keep Noto Kufi", but the owner had just switched back to IBM Plex Sans Arabic (2026-11-25); Plex stays until told otherwise.
- **Graspo case study**: `/ar/case-studies/graspo` renders the SAME components as the English study (`src/components/graspo/*`), so the paper animation, the charts, the audience, funnel and lead sections are the English ones. Their strings go through `tr()`; the Arabic is `src/i18n/ar/dict-graspo.js`. The hero paper scene runs as a `dir="ltr"` island (objects, not text: never mirrored, never crossing the heading); the views-over-time chart and its axis are LTR too. Figures are the English study's own (`localizeStat` gives «10.7 مليون»; `statNode` sets the unit smaller). Only two English parts are swapped for Arabic: the "next case study" card (Elyon has no Arabic page) and the related-service line.
- **Copy**: H1s are in `src/i18n/ar/hero.js`; headings, steps, FAQ questions and CTAs of the four service pages, pricing, Showcase, Roadmap and free-video application are in the `dict-*.js` files (rewritten shorter, Gulf-friendly; contract, price, usage-rights and consent wording stays precise). The five FAQ headings are complete Arabic sentences, so their shared lime tail «answered.» is a declared empty line.
- **UGC reviews**: the approved Arabic reviews (`src/i18n/ar/reviews.js`, `ugc` + `full`), no "originally English" line. **Galleries**: no repeated language word on Arabic cards, no long disclaimer on the Arabic service-page galleries. **Showcase**: Arabic number agreement (`src/i18n/ar/plural.js`), only the Graspo case study linked.
- **Organic calendar graphics**: the five weekday initials are Arabic (`src/i18n/ar/weekdays.js`), same slots and animation.
- **Pricing audit (2026-11-25)**: Arabic reads `src/seo/businessKnowledge.js` through price tokens. Sprint $3,000 monthly / $3,500 one-off, 5 concepts × 3 versions = 15, 10 business days, 2 rounds per concept, 6 months usage, up to 3 creators; Sprint Plus $5,000 / $6,000, 10 × 3 = 30, 15 days, up to 5 creators; paid monthly = 3-month initial commitment then month-to-month with 30 days' notice; Organic Light $1,500 and Organic Growth $2,500 per month with a 6-month initial commitment. No discrepancy between the English page and the Arabic one.
- **Not reproducible with real assets**: the Arabic Organic page has no "showcase" gallery (no approved Arabic organic videos beyond the three Graspo ones already on the hero stage); the Roadmap page has no explainer video (English one only); the SaaS page has no gallery by design.


## Revision 5 (owner brief 2026-11-25): the Arabic menu is the English menu; Refer & Earn in Arabic

- **Menu** (`src/components/Nav.jsx`, footer `Footer.jsx`): Arabic lists the English menu in the English order: Services, Creator Showcase («مكتبة الفيديوهات»), Case Studies («دراسات الحالة», the Arabic Graspo study), Pricing, Blog («المدونة», English-only, `hrefLang="en"`), Contact, Refer & Earn («أحِل واربح»). «How it works» is no longer in the Arabic menu (English has none).
- **Services dropdown (Arabic)**: فيديوهات UGC · فيديوهات Spokesperson · فيديوهات SaaS · فيديوهات عضوية للسوشل ميديا (the owner's wording and order, `SERVICE_MENU_AR`).
- **/ar/referrals**: the English Referral Partner Program page, same components (`src/components/referrals/*`) with `tr()`; Arabic in `src/i18n/ar/dict-referrals.js`. The form posts to the same endpoint with the same English field values (only labels are translated); the optional marketing checkbox is shown in English only (its versioned legal wording has no Arabic version). Like English, the page is `noindex` and out of the sitemap (`REFERRALS_INDEXABLE`). The program terms are a plain-language summary that needs the same legal review as the English terms.


## Revision 6 (owner brief 2026-11-25)

- **Font**: the brief says "keep Noto Kufi", but the owner switched back to IBM Plex Sans Arabic the same day; Plex stays until told otherwise.
- **Graspo paper animation**: it did not move in Arabic because the gust is driven by the hero's distance from the top of the page, and the Arabic page has no "Case Studies" switcher above the hero (the hero starts at 97 px instead of 471 px), so the sequence had already finished when the page loaded. `GraspoHeroScene` now takes `offsetPx`; `GraspoHero` passes the English start point shifted by that difference, so the same sheet transforms play over the same scrolling distance (checked by sampling the transforms at scroll 0/200/400/600: identical numbers in English and Arabic). The scene stays a `dir="ltr"` island.
- **Rolling headline words** (`.ugc-reel`, Arabic): taller cell (1.7em, text centred, negative block margins so the line box is unchanged) and an open horizontal clip window, so dots, marks and the last letter (المشاهدة) are never cut; the slot sizers were corrected.
- **Organic pricing (Arabic)**: `OrganicPackages.jsx` renders its own Arabic cards: Organic Light lime, Organic Growth magenta (+ «موصى بها»), three compact lines below, link «قارن الباقات والتفاصيل».
- **/ar/blog**: `BlogPageAr.jsx` (same masthead as English, in Arabic). Arabic articles live in `src/content/blogAr.js` (empty: nothing is invented, English articles are never shown as Arabic). The page is reachable (menu and footer link to it) but gated in `release.js` (noindex, out of the sitemap and hreflang) until an Arabic article exists. Article pages for Arabic still need their route generation in `vite-plugin-blog.js` when the first article is approved.
- **Library**: `diversifyByCreator` alternates creators (not the same creator within a desktop row) and is re-applied after every filter, Arabic only.

## Placement revision (owner folder "Videos Placement/Arabic", 2026-11-25)

The owner's folder shows, with screenshots, where each Arabic video goes and which frame is its thumbnail. What was done:

**Heroes (three videos each, stage order = centre, right, left; the stage sits on the left side of the page in RTL)**
| Page | Centre | Right | Left |
|---|---|---|---|
| Home | the dubbed Arabic ad (unchanged) | `ar-ugc-hero-1` (digital-service creator) | `ar-ugc-5` (chocolate) |
| UGC | `ar-ugc-8` | `ar-mohamed-clothing` | `ar-mohamed-bag` |
| Spokesperson | `ar-ugc-hero-2` | `ar-ugc-1` | `ar-oneroyal-2` |
| SaaS | `ar-ugc-hero-1` | `ar-mohamed-zory` | `ar-ugc-6` |
| Organic | `ar-graspo-1` | `ar-graspo-3` | `ar-graspo-2` |

The Spokesperson, SaaS and Organic pages have **no carousel** (all their videos are in the hero). Their `type` therefore follows the page: `ar-ugc-hero-2`, `ar-ugc-1` are `spokesperson`; `ar-ugc-hero-1`, `ar-ugc-6`, `ar-mohamed-zory` are `saas`.

**UGC carousel (4 cards, the owner's follow-up 2026-11-25: "those are the only 4 UGC videos I want in the carousel")**: `ar-ugc-5` (chocolate), `ar-mohamed-clothing-2` (new, `2.mp4`), `ar-ugc-2` (tea), `ar-mohamed-bottle` (new, `4.mp4`). The six former "carousel-only" videos (`ar-ugc-7`, `ar-oneroyal-3`, `ar-ugc-9`, `ar-oneroyal-1`, `ar-ugc-3`, `ar-ugc-4`) are `showcaseOnly: true`: in the Creator Showcase, on no page. `ar-ugc-10` (the English-captioned shirt video) is `unlisted: true`: the UGC tab then has seven Milad and six Mohamed videos, which alternate exactly; an eighth Milad video would put two side by side (the owner's rule: reduce that creator's videos). It stays on Stream and in the data; clear `unlisted` to bring it back (and accept one pair).

**New videos**: `2.mp4` (clothing, in a car; a clothing brand's logo appears on screen) and `4.mp4` (a water bottle). Re-encoded from 4K to 1080 p and uploaded to Cloudflare Stream as `AR-MOHAMED-04` (`573acd81…`) and `AR-MOHAMED-05` (`ed635c7d…`). They are filed under the creator id `ar-mohamed` (same person and same room as the existing Mohamed videos), but **no name is shown** because the folder does not say who presents: the owner should confirm. Poster frames: 19.2 s for the clothing video (owner-chosen from a screenshot, 2026-11-25) and 9.0 s for the bottle video (no screenshot was supplied).

**Removed**: `ar-ugc-hero-3` ("To remove from all website"). `ar-ugc-11` (IMG_4545, CRM) and `ar-ugc-12` (IMG_7827, apartment walkthrough) moved to the **English** site: new entries `en-milad-saas-1` (English SaaS carousel + English Creator Showcase) and `en-milad-spokesperson-1` (English Spokesperson carousel + English Creator Showcase), creator id `cv-en-c03`, appended to the English display order without moving any other English video.

**Thumbnails**: each screenshot was matched frame by frame against its Stream video (the time shown in the screenshot's player is the frame), and `posterFrames.js` now holds exactly those frames. The three Arabic Graspo posters use `POSTER_FRAME_OVERRIDES` (0.9 s, 3.2 s, 12.8 s) so the shared Graspo frames used by the English homepage panels and case study do not change.

**Creator Showcase (Arabic)**: 22 videos (the heroes of the four pages, the four carousel videos and the six showcase-only ones), in the curated order `AR_SHOWCASE_ORDER` (no runtime shuffling), found by a search that forbids the same creator in two neighbouring cards in All Videos and in every tab. Mohamed has eight videos and Milad eight; the Graspo videos have separate creator ids. Four tabs by type: فيديوهات UGC (13), فيديوهات Spokesperson (3), فيديوهات SaaS (3), فيديوهات عضوية (3). `tests/arabic.test.mjs` checks the order, the tabs and the adjacency.

**Home creator carousel**: the eight hero videos of the UGC, Spokesperson and SaaS pages that are not in the home hero, alternating UGC, Spokesperson, SaaS, never the same creator twice in a row (`homeCreator` 1 to 8).

**Players**: the seek bar and the control pill keep their normal left-to-right layout on Arabic pages (`dir="ltr"` on the control bars and on the native-controls video).

**Spelling**: «صُنّاع» is now «صناع» across the Arabic copy.
