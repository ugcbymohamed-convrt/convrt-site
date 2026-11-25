# Multilingual video library (Spanish, French; Arabic on its own branch): one registry, one workflow

**English is out of scope.** Nothing in this system changes an English page: English keeps its hand-set `DISPLAY_ORDER`, its poster frames, galleries and filters (proved by the English parity check against `main` and by `tests/video-library.test.mjs`).

## The one source of truth
Every video is one entry in `src/content/portfolio.js`. The fields that matter here:

| field | meaning |
|---|---|
| `id`, `source.cloudflareId`, `creatorId` | the video, its Stream asset, the verified (opaque) creator id |
| `languages`, `onlyIn` | the confirmed SPOKEN language, and the language site that may show it (`['es']`, `['fr']`) |
| `type` | the PRIMARY content type: `ugc` · `spokesperson` · `organic` · `saas` (by format and purpose, never by the advertised company) |
| `secondary` | extra types the video genuinely is (e.g. a creator walking through an app: `type: 'ugc'`, `secondary: ['saas']`). Classification only: it feeds the Creator Showcase filters and never puts a video on a service page |
| `industry` | `unclassified` until the owner confirms |
| `placement`, `alsoOn` | which service-page slot it takes (`hero` stage / `gallery`) |
| `title`, `caption`, `i18n` | short natural localized title (not a word-for-word translation) |
| `review` | a sentence saying what a person must confirm: while present the video is **held** (shown nowhere) |
| `approval` | permissions (`approved`, `portfolioUse`, `creatorConsent`); nothing is shown without them |
| `homeCreator`, `showcase` | curated homepage placements (never touched automatically) |
| poster frame | `src/content/posterFrames.js` (seconds, one per Stream uid) |

## What fills which page (automatically)
* **Service galleries** read `type` (and `alsoOn`) through the selectors, filtered by `src/content/galleryPolicy.js`, the single table of which slots each language has:
  Spanish: UGC hero + gallery, Spokesperson hero stage only, Organic Social and SaaS none. French: UGC hero + gallery, the other three pages text-led. (Arabic: set when the Arabic branch adopts this system: UGC, Spokesperson gallery, Organic Social = the Graspo project videos, SaaS none.)
  Turning a gallery on later is one `true` in that file; the already-classified videos fill it.
* **Creator Showcase** lists every approved video of the language under filters computed from the data: **UGC**, **Spokesperson**, **SaaS**, **Organic Social** (each tab only while a video of that type exists, counts computed). A video is under each of its types (`type` + `secondary`).
* **Order**: `src/content/creatorOrder.js` spreads creators (deterministic, stable, nothing dropped): no creator back to back when the pool allows, and spread across a four-wide row as far as the pool allows. It runs after the filters and before "Show more". The founder's videos are spread like any prolific creator.
* Homepage hero stages, client stages, creator carousels and case-study sequences are **curated**: they are verified, never reassigned automatically.

## Onboarding a new video (repeatable)
1. **Upload** to Cloudflare Stream (existing workflow, `~/.cf-stream-token`; never commit the file or the token).
2. **Look at it**: `python3 scripts/video-contact-sheet.py <stream-uid> --out <dir>` writes a sheet of real frames (nothing is downloaded, uploaded or re-encoded). Decide the spoken language, the creator, the primary type and any secondary type from the footage, not the filename.
3. **Register** one entry at the top of `PORTFOLIO_ENTRIES` (see the header of `portfolio.js`). If anything is uncertain (language, type, creator), add `review: '…'`: the video stays hidden.
4. **Poster**: pick the best frame from the sheet (clear expressive face with open eyes, product visible, good light, no blur, little caption), add it to `posterFrames.js`, run `python3 scripts/poster-frames.py`, commit only the new image.
5. **Validate**: `node scripts/video-registry.mjs validate` (ERRORs fail: missing language, type, creator, poster frame, title, permissions), then `node scripts/video-registry.mjs inventory --write` to refresh `docs/video-library-inventory.md`.
6. **Approve** (`approval` with the owner's confirmation) and remove `review`. The eligible galleries and the Showcase filters populate by themselves.
The site never classifies anything at load time, and no key, token or admin page is exposed: classification happens here, once, with a person looking.

## Audit notes (Nov 2026, Spanish and French; inventory in `docs/video-library-inventory.md`)
* 36 Spanish/French videos were inspected frame by frame (38 Stream assets including the two homepage CONVRT ads). Eleven posters were re-chosen (listed below); the rest were already strong.
* Re-chosen frames (seconds, was → now): fr-mohamed-route-facile 1.9 → 23.7 · fr-mohamed-tripmap 22.1 → 21.3 · fr-ugc-hero-3 2.1 → 20.0 · fr-ugc-1 18.6 → 31.0 · es-ugc-hero-2 23.8 → 6.1 · es-ugc-hero-3 3.9 → 17.5 · es-ugc-2 15.8 → 30.8 · es-ugc-4 28.9 → 33.2 · es-ugc-5 7.1 → 18.2 · es-spokesperson-hero-3 8.2 → 5.3 · es-spokesperson-3 14.5 → 41.8.
* Kept on purpose: the curated stage frames (French FIXD landscape trio, Spanish Elyon and mixed groups: owner-picked frames) and the two homepage CONVRT ads.
* Secondary SaaS (app/software visibly shown): fr-ugc-hero-3, es-ugc-3, es-ugc-5, es-spokesperson-hero-2, es-spokesperson-hero-3.
* **Left for manual review (not guessed)**: fr-ugc-1 (a presenter-led, brand-signed roofing video: UGC today, maybe Spokesperson); fr-ugc-2 (a mobile game app: UGC, maybe SaaS); fr-mohamed-skycop (a service with app screens: UGC, maybe SaaS); es-ugc-hero-2 (two creators presenting a service whose sector is not stated); every video's `industry` (all still `unclassified`); no Organic Social style or format is set for any video (needs the owner).
