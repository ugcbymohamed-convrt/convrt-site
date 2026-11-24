# Creator Showcase (`/creator-showcase`) and the shared portfolio data

The visible name is **Creator Showcase** (nav, footer, breadcrumb, title); the route is `/creator-showcase` (it was `/our-work` until Nov 2026; `vercel.json` redirects the old URL permanently, so old links keep working).
The H1 is "See what's possible." (the on-page note "Featuring examples from independent creators. Not all videos were produced by CONVRT." was removed on request; the SEO description still says they are examples from independent creators).
**The library shows examples from independent creators, not CONVRT productions.** Never describe it as "our work", "our productions", client
projects or campaign results (a regression test enforces this for copy, metadata and structured data). The homepage client showcases
(Adscale, Elyon, Graspo) are the separate demonstrations of actual CONVRT client work.

The page is a compact hero, then a filterable library of vertical videos. Three places read the same list, so a
video is added **once**, in `src/content/portfolio.js` (the file header documents every field).

| Page | What it shows | Selector |
| --- | --- | --- |
| `/creator-showcase` (Creator Showcase) | every fully approved video, filterable by industry | `selectOurWork()` |
| `/ugc-video-agency` | approved videos with `type: 'ugc'`: hero stage (`placement: 'hero'`, max 3) + gallery (max 10) | `selectHero()` / `selectGallery()` |
| `/spokesperson-video-production` | approved videos with `type: 'spokesperson'`: hero stage (`placement: 'hero'`, max 3) + gallery (max 10); never shares a video with the UGC page | `selectSpokespersonHero()` / `selectSpokespersonGallery()` |
| Homepage client panels (Adscale, Elyon, Graspo) | the videos tagged `showcase: '<panel id>'` (three per panel) | `selectShowcase(id)` |

## Adding a video
1. Upload it to Cloudflare Stream and copy its video id (UID). Optionally add a 540x960 `.webp` thumbnail under `public/portfolio/`.
2. Add an object at the **top** of `PORTFOLIO_ENTRIES`, then put its id in `DISPLAY_ORDER` (right after the array) where it keeps creators alternating: the Showcase, its industry tabs and the galleries follow that list, and `tests/creator-showcase.test.mjs` (`SAME_CREATOR`) fails if one creator's videos end up side by side. The minimum: `id`, `caption`, `industry`, `languages`, `source: { cloudflareId }`,
   `creatorId` and a full `approval` (status `approved`, `portfolioUse: true`, `creatorConsent: true`, who approved it and when).
3. `industry: 'saas'`, `'ecommerce'` or `'services'` files it under that tab. `'other'` means *confirmed* "none of these"; any other
   industry slug (beauty, finance ...) groups under **Other** and keeps its own name on the card. **Unknown industry is `'unclassified'`
   (or omitted): the video is in All Work but under no tab, never under Other, and no label is shown.** Set `type: 'ugc'` for videos that
   belong on the UGC page (an unset type is unknown, not UGC).
4. Run the tests and the build, push the branch, check the Vercel Preview.

That is all: it is now on `/creator-showcase` and, if it is UGC, in the UGC gallery. Add `placement: 'hero'` for the UGC hero stage, or
`showcase: 'elyon'` to put it in a homepage client panel (those panels are per client, each with its own story, so a video appears there
only when tagged).

## Attribution
- `production: 'independent'` (a creator's own example) or `'convrt'` (produced through CONVRT). **Unset = unknown: nothing is claimed.**
  A label ("Independent creator" / "Produced by CONVRT") appears in the player only when set, and structured data names CONVRT as
  `producer` only for `'convrt'`.
- `brand` is shown only when `approval.brandDisplay === true`; `productionCredit` only when `approval.creditDisplay === true`.

## Rules
- A video needs `status: 'approved'` AND `portfolioUse: true` AND `creatorConsent: true` for `/creator-showcase` and the UGC page. Nothing else
  makes it public there. The homepage panels need only `status: 'approved'` plus the `showcase` tag (the client case studies were already
  public before this file existed). The nine Adscale / Elyon / Graspo videos therefore have `portfolioUse: false`: they are on the homepage only.
- A creator name is shown only with `creator.showName: true`;
  `creatorId` is never shown.
- A category tab appears only while it has at least one *classified* video. With no approved videos the page shows a compact empty state, is `noindex`
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

Descriptive titles and their evidence: `docs/creator-showcase-titles.md`. A title must describe what the footage shows (never a brand or creator name without permission); videos whose subject could not be verified carry a format-only title and are listed there for manual identification.
