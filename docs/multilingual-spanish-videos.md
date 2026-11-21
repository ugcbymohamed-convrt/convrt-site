# Spanish videos: what is needed, and how they reach the site

The Spanish pages never reuse the English library. Spanish-speaking creators exist, but this repository records **no** Spanish-language video yet
(`node scripts/es-launch-readiness.mjs` prints the current count). Until one is approved the Spanish Creator Showcase stays launch-blocked
(`noindex`, no sitemap entry, no hreflang, language selector falls back to the Spanish home) and the Spanish service-page galleries stay empty.
Nothing is generated, guessed or translated to fill the gap.

## 1. Per-video information the owner must supply

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
