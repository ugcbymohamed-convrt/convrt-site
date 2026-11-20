# /social-media-video-production: the Organic Social Video Production & Management page

Page: `src/OrganicSocialVideoPage.jsx`. Content: `src/content/organicSocialPage.js` (hero, stages, content system, gallery, proof, packages copy, final CTA).
FAQ (visible accordion **and** FAQPage JSON-LD): `src/seo/organicSocialFaq.js`. Head, canonical, sitemap: `src/seo/siteSeo.js`. JSON-LD
(`organicSocialGraph`): `src/seo/structuredData.js`. Tests: `tests/organic-social-page.test.mjs`.

## URL
`/social-media-video-production`, the URL in the approved service-page map (`KEYWORDS/UGC-service-page-proposal.md` §E.7 lists `/spokesperson-video-production`,
`/social-media-video-production` and `/es/`). It also matches the strongest researched phrase ("social media video production", 500 US searches a month in the Keyword Planner
export, low competition). The brief proposed `/organic-social-video-production`; to switch, change `PATHS.socialMediaVideoProduction` in `src/routes.js` (every other file reads it).
Primary cluster: *social media video production*, supported naturally by *organic social*, *short-form video*, *community management* and *content plan*. "Organic" stays in the title,
H1 and copy so the page does not compete with the UGC page (paid) or the Spokesperson page.

## It is the same architecture, fed different content
| Section | Component | Organic config |
|---|---|---|
| Hero (headline reel, CTAs, two offer cards, three-phone stage) | `ugc/UgcHero.jsx` | `ORGANIC_HERO` |
| Showcase gallery + content-style filter (after the content system) | `ugc/UgcGallery.jsx` (new optional `filter` config) | `ORGANIC_GALLERY` |
| How it works (four stages) | `ugc/UgcProcess.jsx` → `ProcessSection` | `ORGANIC_PAGE_STAGES` + scenes in `organic/OrganicScenes.jsx` |
| "Not just more posts. A content system." | `organic/ContentSystem.jsx` (same interaction system as `ugc/TestingDiagram.jsx`) | `ORGANIC_SYSTEM` |
| Proof | `spokesperson/SpokespersonProof.jsx` (now configuration-driven; Spokesperson output unchanged) | `ORGANIC_PROOF` |
| Packages | `organic/OrganicPackages.jsx` (light pointer to `/pricing#organic`) | `ORGANIC_PACKAGES_COPY` + `ORGANIC` data |
| FAQ | `ugc/UgcFAQ.jsx` | `ORGANIC_SOCIAL_FAQ` |
| Final CTA | `ugc/UgcFinalCTA.jsx` | `ORGANIC_PAGE_CTA` |

Shared scene primitives (skeleton lines, tags, colours) live in `src/components/scenes/sceneKit.jsx`; the Spokesperson scenes import them too.

## Videos: separate from the other service pages, always
Videos come from `src/content/portfolio.js` through `selectOrganicHero()` / `selectOrganicGallery()`: an entry must have `type: 'organic'` and the full approval
(`status: 'approved'`, `portfolioUse: true`, `creatorConsent: true`). `placement: 'hero'` fills the three-phone stage (first = centre, at most 3), everything else the gallery
(at most 10, four across on desktop). UGC, spokesperson and the homepage client (`type: 'social'`, e.g. Graspo) videos can never appear here. **Seven videos are live** (supplied 2026-11-20, Desktop > "Organic page videos"): `organic-hero-1..3` (HERO1-3; hero 1 is the centre phone) and `organic-gal-1..4` (DOWN-SECTION-1-4), on Cloudflare Stream with hand-picked
thumbnails in `public/portfolio/organic-*.webp`. They carry neutral titles; languages are assumed (`en`) from the on-screen captions, industry is `other`, and no brand, creator, production credit or content style was supplied, so none is set.
They also appear on `/our-work` (the shared portfolio). To add more: copy an entry (placement `hero` for the stage, anything else is the gallery, at most 10). On preview hosts with no organic videos the layout cards return.

### Content-style filter
Educational · Entertaining · Product-focused · Founder-led (`ORGANIC_STYLES`) are *suggested* styles, not a classification. A video carries `style` only once the owner confirms it; a chip appears only
for a style an approved video carries, and the row only when at least two styles are present. No existing video has a style. `/our-work` has no style (or service) filter, so the gallery button goes
to `/our-work`; point it at a filtered view only once one exists.

## Indexing
`noindex` and left out of the sitemap until at least one organic video is approved (now satisfied: the page is indexable and in the sitemap) (same rule as `/our-work` and the Spokesperson page); the canonical is always its own URL. Adding the first approved
organic video flips both with no other change. Do not flip anything else without the owner's go-ahead.

## Facts and claims
- Prices, post cadence, platforms (Facebook, Instagram, TikTok), the six-month initial commitment, "community management excludes customer support" and "terms after six months per agreement" all come from
  `src/seo/businessKnowledge.js` (`ORGANIC`, `ORGANIC_COMMITMENT`, `CARD_NOTES`, `CUSTOM_PACKAGES`) at render time. Nothing commercial is typed in a component or FAQ sentence.
- No video counts, turnaround times, response times, reporting schedule or guaranteed results exist for Organic, so none are stated. Scenes show a workflow only (no figures, likes or growth).
- **Proof:** the only organic proof is the published Graspo case study (10.7M views, 3.4M accounts reached, 75 unique inbound leads; Meta Business Suite and Graspo's inbound tracker, 1 Jan to 19 Jun 2026), with its
  qualifiers. A test ties the figures to the case-study source. The UGC page's Elyon 5.28x (a paid result) and its testimonials are not used. There is no organic testimonial yet, so none is shown; add one to
  `ORGANIC_PROOF.testimonials` only when verified and permitted.
- **CTAs (revision 2):** the hero's and final CTA's primary button is "Discuss Your Content Strategy" → `BOOKING_URL` (the existing site-wide Calendly discovery call that `/scale` and the Roadmap booking use),
  opened in a new tab with the visitor's stored UTM parameters (`external: true` in `ORGANIC_HERO.primary` / `ORGANIC_PAGE_CTA.primary`; the markup is a plain link). The Roadmap ("Get 5 Free Ad Concepts") is a
  paid-ads offer, so it is not the organic hero action; it stays in the global header and the proof section. Because "Your next 5 ad concepts. Tailored to your brand. On us." and "Free strategy session ... fit check"
  describe the Roadmap, they are removed on this page (`leadIn: null`, `note: null`); the other pages keep them. The header CTA is unchanged.
- **Package terms** were verified against the Pricing page and `businessKnowledge.js` (revision 2): prices, post cadence, platforms, six-month commitment, community-management scope and exclusions all agree. One nuance
  is recorded in the delivery report (the scope says content is distributed "across agreed platforms" while the Pricing card, FAQ and panels say Facebook, Instagram and TikTok).

## Content system visual (revision 2)
Same component and interaction (`organic/ContentSystem.jsx`, three states, Plan / Produce / Publish & Learn), larger stage (`max-w-4xl`, up to 29rem tall; stacked below `lg`) and video-first scenes: Plan = pillars → four vertical
video concepts → the calendar they land in; Produce = footage → Cut / Captions / Graphics → three overlapping finished vertical videos; Publish & Learn = finished videos drop (`org-drop`) into the publishing calendar, then a slim
Review strip names Reach, Watch time and Engagement (names only, no numbers) and loops to the next plan. Thumbnails are the owner-supplied illustrative portraits. Swap them for real organic thumbnails only when approved
organic videos exist.
