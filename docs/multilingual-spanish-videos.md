# Spanish videos: what is integrated, and how to add more

**State (2026-11-22):** 18 Spanish videos from the owner's folders (`~/Desktop/SPANISH`: `UGC`, `Spokesperson`, `Main Page`) are uploaded to Cloudflare Stream and live in `src/content/portfolio.js` as Spanish-only entries
(`languages: ['es']` + `onlyIn: ['es']`). The owner confirmed in chat that all 18 are approved for the website and that the creators agreed to portfolio display. The Spanish Creator Showcase gate has therefore lifted
(indexable, sitemap, reciprocal hreflang).

| Page | What it shows |
|---|---|
| `/es/` hero stage | Front (the existing CONVRT ad, byte-identical to the English homepage video; its on-screen captions are English, so it keeps `languages: ['en']` and the stage labels it "Inglés", the owner's explicit choice), then Left and Right (Spanish; the same Stream videos as `es-ugc-2` and `es-ugc-1`) |
| `/es/ugc-video-agency` | hero stage = the 3 `UGC/HERO-*` videos; gallery = `VIDEOS-SECTION-1..6` |
| `/es/spokesperson-video-production` | hero stage = the 3 `Spokesperson/HERO-*` videos; gallery = `VIDEOS-SECTION-1..6` |
| `/es/saas-video-production`, `/es/social-media-video-production` | **no videos** (owner decision): text-led hero, no phones, no gallery |
| `/es/creator-showcase` | all 18, with the type tabs, "Mostrar más" paging and the lightbox player |

Files: the folders hold 19 files but 18 unique videos on Stream plus the existing English ad: `Main Page/Left` = `UGC/VIDEOS-SECTION-2-2` and `Main Page/Right` = `UGC/VIDEOS-SECTION-1-1` (byte-identical), uploaded once.
Creators are identified in the code only by opaque ids (`es-c01` … `es-c06`); the id-to-name map, the original file in `CREATORS/Spanish` and each Stream id are kept privately in
`CONVRT/Claude/multilingual-es/spanish-videos-private-map.csv` (outside the repository; a test fails if a creator name appears in the repository). Names, brands and credits are not shown. No upload date is
recorded, so none of these videos emits `VideoObject` markup. `es-c06` (UGC-style presenter with headphones, `Spokesperson/VIDEOS-SECTION-3`) has no match in the CREATORS folder: the creator is unidentified.

**Adding a genuine SaaS or Organic Spanish video later:** add a `type: 'saas'` (or `'organic'`) entry with `languages: ['es']`, `onlyIn: ['es']` and `placement: 'hero'` or `'gallery'`. The text-led hero turns back into the phone stage and the gallery section
appears by itself; nothing else changes (tests/i18n.test.mjs proves the switch).

## 1. Per-video information (for any further video)

One entry per video in `src/content/portfolio.js` (the file's header is the full field reference). Everything marked **required** is a fact only the
owner or the creator can confirm; none of it may be invented.

| Field | Required | Value / rule |
|---|---|---|
| `id` | yes | unique slug, e.g. `es-ugc-skincare-01` |
| `source` | yes | Cloudflare Stream id (`{ cloudflareId }`) or `{ mp4 }` plus a `poster` (540×960 webp) |
| `creatorId` | yes | opaque internal id (never displayed) |
| `languages` | yes | `['es']`: the **confirmed** spoken language. An unset language is never guessed into Spanish |
| `onlyIn` | yes | `['es']`: keeps the video on Spanish pages only, so no English page, indexable flag or English JSON-LD changes |
| `type` | yes | `ugc` / `spokesperson` / `organic` / `saas`: decides which Spanish service gallery also shows it |
| `placement` | no | `hero` or `gallery` (default `gallery`) |
| `industry` | no | confirmed industry slug, else `unclassified` |
| `caption` | yes | one honest sentence **in Spanish** (accessible name) |
| `i18n.es.title` / `i18n.es.caption` | no | the Spanish card title and caption when `caption` is English; Spanish copy is written for the video, never machine-translated from an English one |
| `production` | no | `independent` (the creator's own example) or `convrt`; leave out when unknown |
| `uploadDate` | no | real ISO date; only videos with one get VideoObject markup |
| `approval.status` | yes | `'approved'` |
| `approval.portfolioUse` | yes | `true` only after the brand or owner approved it for CONVRT's website |
| `approval.creatorConsent` | yes | `true` only after the creator agreed to portfolio display |
| `approval.approvedBy`, `approvedOn` | yes | who confirmed it, and when |
| `approval.brandDisplay`, `creditDisplay`, `creator.showName` | no | each `true` only with the explicit permission; otherwise the brand, credit and name stay hidden |

Per creator, also needed before a video goes live: the creator's written consent to appear on the Spanish site, and the language they actually speak
in the footage (the review sheet `creator-language-owner-review.csv` in the private report folder lists the creators whose language is unknown).

### Template (do not paste until every value is confirmed)

```js
{
  id: 'es-ugc-<topic>-01',
  caption: 'Una frase honesta que describe el vídeo.',
  type: 'ugc',
  industry: 'unclassified',            // or a confirmed industry
  languages: ['es'],
  onlyIn: ['es'],
  production: 'independent',           // only if confirmed
  source: { cloudflareId: '<stream id>' },
  creatorId: '<opaque id>',
  uploadDate: '<YYYY-MM-DD>',          // only if known
  approval: { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: '<owner>', approvedOn: '<YYYY-MM-DD>' },
},
```

Upload to Cloudflare Stream exactly as for the English library (see the private Cloudflare reference); no site code changes are needed.

## 2. What happens automatically once one exists

* `/es/creator-showcase` lifts its launch gate (`src/i18n/release.js`: gate = no approved Spanish video) and joins the sitemap with hreflang, **provided the
  English Showcase is itself indexable** (the Spanish page follows the English indexability flag).
* The video also appears in the matching Spanish service gallery (`/es/ugc-video-agency`, `/es/spokesperson-video-production`,
  `/es/social-media-video-production`, `/es/saas-video-production`) through the same selectors the English pages use, filtered by `forPageLanguage`.
* English pages, the English indexable flags (`ENGLISH_LIBRARY`) and the English VideoObject JSON-LD are untouched (`tests/i18n.test.mjs` proves it).
* A Spanish service page whose English twin has no approved video stays `noindex`, because the Spanish page follows the English page's flag. Say so
  to the owner if a Spanish-only gallery should make a page indexable: that is a one-line change in `src/seo/siteSeo.js`, deliberately not made.

## 3. Roadmap explainer video (separate asset)

The English Roadmap page opens with a spoken-English explainer (`src/content/roadmapVideo.js`). It has no Spanish audio or captions, so it is **hidden on
`/es/creative-growth-roadmap`** (the page works without it). To show it in Spanish the owner needs a Spanish version: Spanish audio recorded by the
owner, or burned-in Spanish captions, uploaded as its own HLS manifest plus poster. Wiring it is a small change in `RoadmapPage.jsx` and
`roadmapVideo.js`, made only when the asset exists.

## 4. Spanish share image (separate asset)

`public/og/convrt-og-es.png`, 1200×630 PNG, Spanish wording, same visual system as `public/og/convrt-og.png`. Suggested text: "CONVRT · Vídeos UGC y
creatividades de alto rendimiento". Then set `ES_OG_IMAGE_READY = true` in `src/i18n/es/seo.js`; a test fails if the flag is on and the file is missing or the
wrong size. Until then Spanish pages share the English image.
