# /ugc-video-agency: the UGC service page

SEO phase 2. Page: `src/UgcVideoAgencyPage.jsx` (sections in `src/components/ugc/`). Head, canonical and sitemap entry:
`src/seo/siteSeo.js`. JSON-LD (`ugcGraph`): `src/seo/structuredData.js`. FAQ (visible accordion **and** FAQPage JSON-LD):
`src/seo/ugcFaq.js`. Tests: `tests/ugc-page.test.mjs`.

## Where the facts come from
- **Prices, usage rights, extension prices, turnaround, revisions, formats, languages, commitments:**
  `src/seo/businessKnowledge.js` only. The tests fail if a dollar amount is typed into a UGC component or the FAQ.
- **Elyon result and the two testimonials:** `src/content/ugcProof.js`. The 5.28x belongs to ONE creator-led UGC video,
  client-reported, early learning phase (9 purchases, $3,421.25 reported revenue). Do not add a period, spend or other metric
  unless the owner supplies it. Testimonials are verbatim copies of `src/components/Testimonials.jsx` (the tests compare them).
- **Positioning (owner-confirmed, Nov 2026):** CONVRT's UGC videos are 100% human-created, featuring real human creators. This is
  about the UGC service and its finished videos only; do not claim CONVRT never uses AI anywhere. Paid creators are never
  presented as genuine customers. The service is international and multilingual and is not limited to industries or countries.

## Page structure (five sections + a short CTA)
1. **Hero** (`UgcHero.jsx`): the human-led headline, a concise crawlable description of what CONVRT offers, the "Get 5 Free Ad Concepts"
   Roadmap CTA, a secondary Pricing link and an at-a-glance row. With approved videos the right side is the interactive
   `CreatorVideoStage` (active video prominent, two supporting cards, switch by tap, swipe, arrow keys, prev/next or dots). Without
   them the hero is a centred, text-led hero: no illustration, no placeholder footage.
2. **Our best UGC work** (`UgcWork.jsx`): the approved-video portfolio. Renders **nothing** (no section, no placeholder) until
   approved videos exist. Category toggles (SaaS, E-commerce, Apps, Other; only those with videos), an optional language filter,
   a caption and language badge per card, and "Show more" paging.
3. **How we create and test UGC ads** (`UgcProcess.jsx` + `TestingDiagram.jsx`): four stages (Research & Concepts, Creators &
   Scripts, Filming & Editing, Delivery & Creative Testing) with an animated visual, plus an interactive diagram of concepts, two
   finished versions per concept, hook or call-to-action testing and learning. The stage explanations are always in the page text.
4. **Results & client feedback** (`UgcResults.jsx`): the Elyon 5.28x block (with its qualifications, the client's own messages from the
   case study and the case-study link) and the two verbatim testimonials.
5. **FAQ** (`UgcFAQ.jsx`, 14 questions from `src/seo/ugcFaq.js`, with contextual links), then `UgcFinalCTA.jsx`.

Complete pricing and contract detail lives on `/pricing`. The policies of the removed sections (usage rights and extension prices,
raw footage, creator-account ads, commitments, revisions, reshoots, turnaround, shipping and access, formats, languages, best-suited
brands) are answered in the FAQ, from the business data; a test checks each is still on the page.

## The creator portfolio (`src/content/portfolio.js`)
The videos live in **one shared file**, `src/content/portfolio.js`, which also feeds `/our-work` and the homepage client panels
(see `docs/our-work-page.md`). This page shows the approved videos whose `type` is `'ugc'`: those with `placement: 'hero'` fill the
three-phone stage (first = the large centre phone, at most 3) and the rest fill the horizontal gallery (at most 10). A video renders
only when `approval.status === 'approved'`, `approval.portfolioUse === true` **and** `approval.creatorConsent === true`. Approval to
produce or deliver a video is NOT portfolio permission. A creator's name is shown only when `creator.showName === true`.
Playback: posters first; the hero's active video loads after the browser is idle and only while on screen (never for reduced-motion
or data-saver visitors, who press play); gallery cards load a video only after a tap, one at a time.

## Roadmap eligibility
The Free Creative Growth Roadmap is open to brands in every industry. `src/lib/roadmapQuestions.js` lists the industries;
`src/lib/roadmapQualification.js` excludes only "Marketing agency" (not a brand buying creative for itself) and keeps the
timeline and investment-readiness rules and the Calendly step unchanged.

## Visual refinement (hero, How it works, creative testing)

- **Headline:** "Human-led UGC ads. Built for paid social. to convrt." The last word is a slot-reel (convrt, resonate, sell, connect): it rolls vertically in ~640 ms, rests longer on "convrt", reserves the width of the longest word (no layout shift), and is off for reduced-motion / data-saver visitors. The server HTML contains only "to convrt.".
- **Empty hero stage:** the three frames are built like short-form video screens, rotate by themselves every ~3.6 s (stops once a visitor interacts or hovers, off for reduced motion), can be clicked, swiped or driven with arrows and dots, and drift a few pixels toward the mouse. Decorative only (aria-hidden, nothing takes keyboard focus). With approved videos the real stage (no auto-advance) replaces it.
- **How it works / testing scenes:** built from stylised vector creators in `illustrations.jsx` (illustrations, not photos, not real creators, not AI-generated people). No data or performance claims; step 3 of testing is labelled "Conceptual illustration, not real results".
