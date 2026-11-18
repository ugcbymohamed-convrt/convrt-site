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

## The creator portfolio (`src/content/ugcPortfolio.js`)
The list ships **empty**; the page then shows a branded fallback. To add a video, append one object (the file header documents every
field). A video renders only when `approval.status === 'approved'`, `approval.portfolioUse === true` **and**
`approval.creatorConsent === true`. Approval to produce or deliver a video is NOT portfolio permission. A creator's name is shown
only when `creator.showName === true`. Language and industry filters are generated from the data and appear only when there are two
or more values. Playback is tap-to-play; nothing is downloaded until a visitor taps a video.

## Roadmap eligibility
The Free Creative Growth Roadmap is open to brands in every industry. `src/lib/roadmapQuestions.js` lists the industries;
`src/lib/roadmapQualification.js` excludes only "Marketing agency" (not a brand buying creative for itself) and keeps the
timeline and investment-readiness rules and the Calendly step unchanged.
