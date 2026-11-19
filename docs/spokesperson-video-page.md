# /spokesperson-video-production: the Spokesperson service page

Page: `src/SpokespersonVideoPage.jsx`. Content: `src/content/spokespersonPage.js` (hero, stages, formats, gallery, proof, final CTA).
FAQ (visible accordion **and** FAQPage JSON-LD): `src/seo/spokespersonFaq.js`. Head, canonical, sitemap: `src/seo/siteSeo.js`. JSON-LD
(`spokespersonGraph`): `src/seo/structuredData.js`. Tests: `tests/spokesperson-page.test.mjs`.

## It is the UGC page's architecture, fed different content
The page is assembled from the same configuration-driven components as `/ugc-video-agency` (each has the UGC content as its default, so the UGC page is unchanged):

| Section | Component | Spokesperson config |
|---|---|---|
| Hero (headline reel, CTAs, two offer cards, three-phone stage) | `ugc/UgcHero.jsx` (`UGC_HERO` default) | `SPOKESPERSON_HERO` |
| How it works (four stages) | `ugc/UgcProcess.jsx` → `ProcessSection` | `SPOKESPERSON_STAGES` + scenes in `spokesperson/SpokespersonScenes.jsx` |
| "One message. Different ways to deliver it." | `spokesperson/DeliveryStyles.jsx` (same interaction system as `ugc/TestingDiagram.jsx`) | `SPOKESPERSON_STYLES` |
| Showcase gallery | `ugc/UgcGallery.jsx` (`UGC_GALLERY` default) | `SPOKESPERSON_GALLERY` |
| Proof | `spokesperson/SpokespersonProof.jsx` | `SPOKESPERSON_PROOF`, `SPOKESPERSON_EXPECTATIONS` |
| FAQ | `ugc/UgcFAQ.jsx` (`UGC_FAQ_CONFIG` default) | `SPOKESPERSON_FAQ` |
| Final CTA | `ugc/UgcFinalCTA.jsx` (`UGC_CTA` default) | `SPOKESPERSON_CTA` |

Change layout, animation or styling once in the shared component and both pages follow.

## Videos: separate from the UGC page, always
Videos come from `src/content/portfolio.js` only, through `selectSpokespersonHero()` / `selectSpokespersonGallery()`: an entry must have
`type: 'spokesperson'` and the full approval (`status: 'approved'`, `portfolioUse: true`, `creatorConsent: true`). `placement: 'hero'` fills the
three-phone stage (first = centre, at most 3), everything else the gallery (at most 10). The UGC selectors only return `type: 'ugc'`, so the two
pages can never share a video, and a video is never shown here just because someone speaks on camera in it. Nothing falls back to UGC footage.
Approved spokesperson videos also appear on `/our-work` automatically. With none, the hero shows the three empty phone frames and the gallery is
absent. On Vercel preview hosts only, the gallery shows ten neutral empty frames (no portraits) so the layout can be reviewed.

## Indexing
The page is `noindex` and left out of the sitemap until at least one spokesperson video is approved (same rule as `/our-work`); the canonical is
always its own URL. Adding the first approved video flips both with no other change.

## Facts and claims
- Prices, turnaround, revisions, usage rights, formats and languages come from `src/seo/businessKnowledge.js`. No spokesperson-specific price,
  turnaround or allowance exists, so none is stated: the FAQ quotes the published package terms and says custom projects are scoped individually.
  The structured data has a Service but **no Offer**.
- "Real human presenters" is the owner's positioning for this service (brief, Nov 2026); it is scoped to spokesperson videos only.
- **Proof is empty on purpose.** The UGC page's Elyon 5.28x and its two testimonials describe UGC work and are not used. Add verified
  spokesperson results or testimonials to `SPOKESPERSON_PROOF` (shape in `spokespersonPage.js`); until then the page shows a compact "What to expect"
  strip of published business terms.
- The "formats" section never says a package includes all three styles; scope depends on the package or custom brief.
- The scene portraits are the owner-supplied photographs (`public/creators/portrait-*.webp`), labelled illustrative.
