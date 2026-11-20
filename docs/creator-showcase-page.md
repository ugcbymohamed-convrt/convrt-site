# Our Work (`/creator-showcase`) and the shared portfolio data

`/creator-showcase` is the video portfolio: a compact hero, then a filterable library of vertical videos. Three places read the same list, so a
video is added **once**, in `src/content/portfolio.js` (the file header documents every field).

| Page | What it shows | Selector |
| --- | --- | --- |
| `/creator-showcase` | every fully approved video, filterable by industry | `selectOurWork()` |
| `/ugc-video-agency` | approved videos with `type: 'ugc'`: hero stage (`placement: 'hero'`, max 3) + gallery (max 10) | `selectHero()` / `selectGallery()` |
| `/spokesperson-video-production` | approved videos with `type: 'spokesperson'`: hero stage (`placement: 'hero'`, max 3) + gallery (max 10); never shares a video with the UGC page | `selectSpokespersonHero()` / `selectSpokespersonGallery()` |
| Homepage client panels (Adscale, Elyon, Graspo) | the videos tagged `showcase: '<panel id>'` (three per panel) | `selectShowcase(id)` |

## Adding a video
1. Upload it to Cloudflare Stream and copy its video id (UID). Optionally add a 540x960 `.webp` thumbnail under `public/portfolio/`.
2. Add an object at the **top** of `PORTFOLIO` (newest first). The minimum: `id`, `caption`, `industry`, `languages`, `source: { cloudflareId }`,
   `creatorId` and a full `approval` (status `approved`, `portfolioUse: true`, `creatorConsent: true`, who approved it and when).
3. `industry: 'saas'`, `'ecommerce'` or `'services'` files it under that tab; any other slug groups under **Other**. `type` defaults to `'ugc'`.
4. Run the tests and the build, push the branch, check the Vercel Preview.

That is all: it is now on `/creator-showcase` and, if it is UGC, in the UGC gallery. Add `placement: 'hero'` for the UGC hero stage, or
`showcase: 'elyon'` to put it in a homepage client panel (those panels are per client, each with its own story, so a video appears there
only when tagged).

## Rules
- A video needs `status: 'approved'` AND `portfolioUse: true` AND `creatorConsent: true` for `/creator-showcase` and the UGC page. Nothing else
  makes it public there. The homepage panels need only `status: 'approved'` plus the `showcase` tag (the client case studies were already
  public before this file existed). The nine Adscale / Elyon / Graspo videos therefore have `portfolioUse: false`: they are on the homepage only.
- `brand` is shown on the card: add it only with the brand's permission. A creator name is shown only with `creator.showName: true`;
  `creatorId` is never shown.
- A category tab appears only while it has at least one video. With no approved videos the page shows a compact empty state, is `noindex`
  and is left out of the sitemap (`SITE_SEO['/creator-showcase'].indexable` follows the data).
- `VideoObject` structured data is emitted only for a displayable video that has a real `uploadDate` (and optionally `description`).
  Without it, none is written. Never invent dates.

## How it works
- Categories, colours and the order of the tabs: `CATEGORIES` in `portfolio.js` (colours reuse the site's lime, magenta and amber tokens).
- The library (`src/components/ourwork/PortfolioLibrary.jsx`) renders 12 cards per page ("Show more" adds 12), four per row on desktop,
  three on tablets, two on phones, all 9:16. The first row is prioritised; the rest of the thumbnails are lazy-loaded.
- There is one player (`VideoLightbox.jsx`), mounted only while a card is open, reusing the site's Cloudflare/HLS helper (`useAttachSource`,
  `src/lib/hls.js`: native HLS on Safari/iOS, hls.js elsewhere). Closing stops and releases the stream.
- Language filtering is prepared (`languages`, `buildFacets`, `matchesFilters` in `portfolio.js`) but no filter row is shown.
- Tests: `tests/creator-showcase.test.mjs`; the portfolio gate is also covered by `tests/ugc-page.test.mjs`.
