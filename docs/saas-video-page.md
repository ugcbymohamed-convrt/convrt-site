# /saas-video-production: the SaaS Video Production service page

Page: `src/SaasVideoPage.jsx`. Content: `src/content/saasPage.js` (hero, stages, formats, gallery, proof, final CTA). FAQ (visible accordion **and** FAQPage
JSON-LD): `src/seo/saasFaq.js`. Head, canonical, sitemap: `src/seo/siteSeo.js`. JSON-LD (`saasGraph`): `src/seo/structuredData.js`. Visuals:
`src/components/saas/SaasScenes.jsx` (the four "How it works" scenes) and `src/components/saas/SaasFormats.jsx` ("One product. Different ways to bring it to
life."). Tests: `tests/saas-page.test.mjs`. English only for now; copy, metadata and video selection are separate from the components so a localised
version can swap them later (no localised page, redirect or `hreflang` exists).

## It is the UGC / Spokesperson architecture, fed different content
| Section | Component | SaaS config |
|---|---|---|
| Hero (headline reel, CTAs, two offer cards, three-phone stage) | `ugc/UgcHero.jsx` | `SAAS_HERO` |
| How it works (four stages) | `ugc/UgcProcess.jsx` → `ProcessSection` | `SAAS_STAGES` + scenes in `saas/SaasScenes.jsx` |
| "One product. Different ways to bring it to life." | `saas/SaasFormats.jsx` on the shared `FormatStage` shell (`spokesperson/DeliveryStyles.jsx`) | `SAAS_FORMAT_STEPS` |
| Showcase gallery (optional format filter) | `ugc/UgcGallery.jsx` | `SAAS_GALLERY` |
| What to expect / proof | `spokesperson/SpokespersonProof.jsx` | `SAAS_EXPECTATIONS`, `SAAS_PROOF` |
| FAQ | `ugc/UgcFAQ.jsx` | `SAAS_FAQ` |
| Final CTA | `ugc/UgcFinalCTA.jsx` | `SAAS_CTA` |

The only shared code touched: `DeliveryStyles.jsx` now exports `FormatStage` (the interaction shell) and the Spokesperson page renders exactly as before through it.

## Videos (src/content/portfolio.js)
- A video is on this page when its `type` is `'saas'` **or** its entry lists `alsoOn: { saas: 'hero' | 'gallery' }`. Nothing else reaches the page: no UGC, organic,
  homepage-client or spokesperson video appears because of what it shows. `alsoOn` works for every service page (`ugc`, `spokesperson`, `organic`, `saas`): one entry, one
  Cloudflare id, several pages, each with its own placement. Use it only for a video the owner approved for both pages.
- **Current videos (2026-11-20, from `Desktop > UGC PAGE VIDEOS > SaaS`):** eight independent-creator UGC examples for software brands, not explainers, demos or CONVRT-produced work
  (no production credit, brand or language is shown). Hero, centre first: `saas-creator-1` (PDF Expert example, carries a burned-in "UGC EXAMPLE" watermark), `saas-creator-2`
  (Move Plnr example), then `creator-04` (TechCrypto, via `alsoOn`). Gallery: `creator-01` (Norton), `creator-15` (Dan & Tabatha), `creator-07` (CTA1), `creator-13` (HOOK1) and `creator-10` (HOOK2-3), via `alsoOn` (every SaaS-industry clip in the Creator Showcase SaaS folder). The two `saas-creator-*`
  clips were uploaded to Cloudflare Stream on 2026-11-20; the other three were already on the site as UGC examples, so they are shared, not re-uploaded. To change the hero
  order, move the entries in `PORTFOLIO` or change an `alsoOn` placement.
- Three hero slots (first = centre phone) and up to ten gallery cards; the empty-slot template is at the top of `PORTFOLIO`. Recommended order for the hero:
  1 human-led product explainer · 2 software demo / app walkthrough · 3 animated / motion-graphics video. No Cloudflare id exists yet, so none was invented.
- Optional `format` (`explainer | demo | presenter | animated | ad`, `SAAS_FORMATS`) drives a filter that appears only when two or more formats have an approved video.
  Set it only once the owner confirmed it.
- Set `production: 'convrt'` only for work CONVRT produced. Independent creators' examples are never presented as CONVRT productions.
- Approved SaaS videos also appear on `/creator-showcase` automatically (as Spokesperson videos do); that page is the Creator Showcase, so leave `production` unset unless confirmed.

## Indexing
`noindex` and out of the sitemap until at least one approved SaaS video exists (now satisfied, so the page is indexable) (same gate as Spokesperson, Organic Social and `/creator-showcase`); the canonical is always its
own URL. Adding the first approved video flips both with no other change. The approved keyword plan says to build this page "after distinct portfolio and demand
validation", which is why the gate matters.

## Facts and claims
- No SaaS price, turnaround, revision allowance, usage right, video quantity or deliverable is stated. SaaS demos and explainers are **custom packages**
  (`CUSTOM_PACKAGES.paid`); the Sprint price and deliverables are never applied to them. Structured data has a Service but **no Offer**.
- **Proof is empty on purpose.** No SaaS-specific result or testimonial is verified. The UGC page's Elyon figure is not used; Adscale's quote is about UGC ads, so it
  is not used either without the owner's say-so. Until then the page shows a compact "What to expect" strip of published business terms.
- The free Roadmap gives five ad concepts; nothing on the page says it includes a free explainer or demo video.
- SEO: primary "SaaS video production"; supporting terms are used naturally (explainer, product demo, app walkthrough, SaaS video ads). The keyword research only has
  Google Keyword Planner buckets (50 to 500 searches/month), so no volume is quoted.
