# English website premium design review #1 (Nov 2026)

Branch `english-design-review-1`, cut from Production `main` (afc0da4). One pass, one Preview. English pages only: the Spanish homepage HTML is byte-identical to Production (modulo hashed asset names), and the unmerged Spanish review branch is not included.

## What changed (English only)

| Area | Where | Notes |
|---|---|---|
| Founder statement | `src/components/Credibility.jsx`, `FOUNDER_EXPERIENCE.captionShort` in `src/lib/siteStats.js` | Two-line headline ("…across ecommerce, SaaS, apps and consumer markets."), one-line disclosure ("Founder experience across CONVRT Studio and other creative production work."), CTAs removed, no bottom rule. The long caption stays for Spanish and the claims register. |
| Industry showcase | `src/components/home/IndustryShowcase.jsx`, `src/content/homeShowcase.js` | Replaces the old "Case Studies / Work that speaks" intro and tabs on the English homepage. The old `CaseStudies.jsx` is still used by the Spanish homepage. |
| Closing CTAs | `ShowcaseCtas` in `IndustryShowcase.jsx` | Same destinations as before (`primaryAction('en')` → Roadmap, creator Google Form), larger. |
| Creator carousel | `src/components/home/HomeCreators.jsx` (lazy), reuses `components/ugc/UgcGallery.jsx` | Eight videos tagged `homeCreator` in `src/content/portfolio.js` (`selectHomeCreators()`). |
| Reviews | `src/components/home/ClientReviews.jsx`, `src/content/reviews.js` | Verbatim excerpts + the full originals behind "Read full review". `Testimonials.jsx` (Spanish) reads the same source. |
| SaaS hero | `src/content/saasPage.js` (`SAAS_VIDEO_ORDER`), `portfolio.js` (`spokesperson-gal-1` → `alsoOn.saas: 'hero'`, `saas-creator-1` → `placement: 'gallery'`) | |
| Spokesperson hero | `src/content/spokespersonPage.js` (`SPOKESPERSON_VIDEO_ORDER`) | |

## Homepage order (English)
Hero → founder statement + logo marquee → industry showcase + CTAs → Services → How It Works → creator carousel → client reviews → final CTA → FAQ.

## Industry showcase: how it works and what is verified
- Fixed order SaaS · E-commerce · Printing; a vertical tab list from `lg` (active industry large with a lime bar), three equal tabs on mobile. Arrow keys / Home / End move between tabs.
- **SaaS = Adscale** (verified: the previous homepage SaaS tab, the `portfolio.js` note and Adscale's own review all file it under SaaS). No Adscale case study or measured result exists, so the entry has none and links to `/saas-video-production`. **E-commerce = Elyon Dubai** (`/case-studies/elyon`), **Printing = Graspo** (`/case-studies/graspo`). All wording already existed on the live site.
- Videos are the `showcase: 'adscale' | 'elyon' | 'graspo'` portfolio entries (first three). Nothing plays until a tap, one video at a time (shared `Player`).
- Crawlable: all three clients' text and links are in the prerendered HTML (inactive panels are `hidden`), and both case-study links are always visible under the navigation.

## Creator carousel
Rule: approved with full consent (`portfolioUse` and `creatorConsent` true), spoken language **confirmed** English, tagged `homeCreator: 1..8`. Order: spokesperson-hero-2, ugc-gal-1, ugc-gal-7, spokesperson-hero-1, ugc-gal-3, ugc-gal-2, ugc-hero-3, spokesperson-gal-2. Left out on purpose: `creator-05` (on hold), `ugc-gal-5` (language to verify), `ugc-hero-1` (same footage as `saas-creator-2`), and every video with no recorded language (the `creator-xx` set: confirm the language in `portfolio.js` to make them eligible). The standing "independent creators, not CONVRT productions" note stays under the heading.

## Reviews
No star graphics (no rating source is on record; CLAUDE.md forbids invented ratings), no counts, platforms, links or badges. "Repeat Client" is kept because each review documents a repeat order ("ordered again", "second order", "third order").

## Video order
SaaS hero (front-centre first): spokesperson-gal-1 (founder presenter, Lusion screen) · saas-creator-2 · creator-04. SaaS gallery: spokesperson-gal-3 · spokesperson-hero-1 · **saas-creator-1 (third)** · creator-15 · creator-10. Spokesperson hero: spokesperson-hero-2 (front) · spokesperson-hero-1 · spokesperson-hero-3; gallery unchanged. Orders are page-level (`orderedBy` in `portfolio.js`), so `/creator-showcase` and the UGC page keep the shared file order. No Cloudflare asset was uploaded or duplicated.

## Tests
`tests/home-redesign.test.mjs` (14 tests) plus updated assertions in `founder-experience`, `creator-showcase` and `ugc-page` tests.

---

## Revision #2 (Nov 2026): cinematic founder/client stage and editorial reviews

Supersedes the founder block, industry-showcase layout and reviews layout described above (the data, claims and rules in those sections still apply).

- **Founder + client work** (`src/components/home/IndustryShowcase.jsx`, `RotaryStage.jsx`, `src/lib/rotary.js`): "Worked with 500+ clients" (figure from `siteStats.js`) with the owner-approved disclosure on the left; three of the active client's videos on a lit circular platform made of CSS only; client selector (Adscale · SaaS, Elyon Dubai · E-commerce, Graspo · Printing) under the stage; the two main CTAs under that. The logo marquee stays in `Credibility.jsx` (English: logos only; the Spanish homepage is unchanged).
- **Rotary stage:** video `i` stands on an ellipse at angle `(i - position) x 120deg`; selecting a side video animates `position` (requestAnimationFrame, ease-in-out cubic, up to 720 ms), so frames travel along the orbit and the third video passes behind. The active video is upright; only side videos tilt. Only `transform`, `z-index` and a shade overlay's `opacity` change per frame. A selection made mid-rotation retargets from the current position (latest wins). Click, tap, swipe, arrow keys and the small arrows all work; `prefers-reduced-motion` changes the selection at once. Videos: poster first, the stream attaches only after pressing play on the centre video (native controls then), rotating away pauses, leaving the viewport pauses, switching client unmounts (destroys the stream).
- **Client switch:** a short fade (190 ms), the stage re-mounts on the new client's first video; client text and links for all three clients stay in the HTML.
- **Reviews** (`ClientReviews.jsx`): one featured quote in an editorial system serif (`font-editorial`, a system font stack: no font file was added), vector opening mark, lime rule, vertical client list (Adscale default), long lime rule. All three reviews are in the HTML (inactive ones invisible and `inert`, stacked in one grid cell so nothing shifts); excerpts verbatim; full originals behind "Read full review"; no stars.
- Spanish and every other page: unchanged (only the English homepage differs from Production, plus the SaaS and Spokesperson hero orders from revision #1).

---

## Revision #3 (Nov 2026): strict visual correction of the founder / client-work scene

Rebuilt to the approved reference image as a visual specification (`src/components/home/IndustryShowcase.jsx`, `StudioEnvironment.jsx`, `RotaryStage.jsx`, `src/lib/rotary.js`).

- **One scene on a fixed 1436 x 560 design grid** (`lg:aspect-[1436/560]`): everything inside is positioned in percentages of it and text in container-query units, so the composition keeps the reference proportions at any desktop width (capped at 1500 px). Below `lg` the same scene is shown at a legible scale (cropped at its sides, side videos peeking) with the text above and the selector and buttons below.
- **Environment (CSS only, never animated):** dark curved walls with a lit olive wall on the right, the sweeping lime ring light in the ceiling, a glossy olive-grey floor, and a two-tier raised podium with visible front faces and a continuous lit rim. Nothing is an image, canvas or WebGL.
- **Videos:** the featured frame is 200 of the reference's 1436 px (13.93 % of the scene width); side videos are about 76 % of it, mirrored, tilted, hanging slightly lower. Rotation is unchanged (see Revision #2) and only moves the videos.
- **Text:** eyebrow, "Worked with / 500+ clients" and the disclosure only. The client description, the SaaS link and the case-study list are no longer drawn; their destinations (`/saas-video-production`, `/case-studies/elyon`, `/case-studies/graspo`) stay in the HTML as a visually hidden "Client case studies and service page" navigation that appears when a keyboard user focuses a link.
- **Selector and buttons:** the selector overlaps the podium front; the two buttons are centred under it, at the reference size.

---

## Revision #4 (Nov 2026): larger videos

The founder / client-work stage was too compressed, so the scene now grows instead of fitting one screen.

- **Sizes:** on the 1436 px design grid the featured video is 320 px wide (22.28 %; 321 px at 1440, 334 px at 1920) and the side videos about 250 px (78 %; 257 px at 1440), with a clear gap between frames. Aspect ratios are unchanged. The design grid is now 1436 x 896 (`xl:aspect-[1436/896]`): the section is about 1010 px tall at 1440 and no height, `vh` or overflow constraint shrinks it; the buttons may sit below the first screen.
- **Room:** `StudioEnvironment.jsx` scales the whole reference room by K = 1.6 about the new stage centre (podium, ring light, walls, floor, shadows), so the look is unchanged at the larger size. The headline block sits in a narrower left column (about 17 % of the width) and the stage is shifted right to give the videos room.
- **Responsive:** the on-scene layout now starts at `xl` (1280 px); below it the text stacks above the scene, which is shown at a large scale and centred on the stage (about 312 px featured at 1024, 274 px at 768, 217 px on a 390 px phone with the side videos peeking in; swipe, tap on a side video or the arrow keys bring one forward). The selector overlaps the podium front and the buttons stack under it. No horizontal overflow at 1920, 1440, 1280, 1024, 768, 390 and 360.

---

## Revision #5 (Nov 2026): centred composition

The founder / client-work section is one symmetrical, centred composition on a single vertical axis (no left-text / right-videos split):

1. centred eyebrow "FOUNDER EXPERIENCE", 2. centred headline "Worked with 500+ clients" (one line from `sm`, two on a phone), 3. centred disclosure, then 4. the stage (three true 9:16 videos on a lit podium), 5. the client selector tucked against the podium front, 6. the two CTAs close beneath it.

- **Videos:** featured 310 px wide (24.22 % of the 1280 px design grid), sides 85 % of it (263 px), a clear gap between frames, one uniform scale so the frames are never squashed (every frame is exactly 9:16); tilt is a gentle 17 degrees.
- **Scene:** `StudioEnvironment.jsx` is re-fitted (K = 1.55, 1280 x 740 grid, centre axis); the podium is slimmer so it supports the videos; the green glow and wall seams are calmer.
- **Spacing:** text-to-stage gap about 40 px, selector overlapping the podium, buttons 28-32 px under it; no absolute overlays, everything is in normal flow (the section is about 1070 px tall on a large desktop).
- **Responsive:** the scene scales with the page down to 900 px, then is shown larger than the screen and centred on the featured video (218 px at 768, 217 px on a 390 px phone with the side videos peeking in; swipe, tap on a side video or the arrow keys bring one forward). No horizontal overflow at 1920, 1440, 1280, 1024, 768, 390 and 360.

---

## Revision #6 (Nov 2026): final polish

- **Equal-height cards:** the three videos are now equal portrait screens on one top line and one baseline (side cards 97 % of the featured one, no vertical offset, gentle 12 degree tilt, a little more space between frames); the featured one is distinguished by its frame, glow and controls.
- **Active glow:** a soft, blurred lime backlight sits behind the featured slot (`RotaryStage.jsx`); it stays put while the videos rotate in front of it.
- **Hero player UI:** the featured video uses the hero's controls (play button, bottom pill with play / pause, seek bar, sound). They were extracted unchanged into `HeroPlayerControls` in `components/ugc/CreatorVideoStage.jsx`, which the hero stage itself now renders too (the UGC, Spokesperson, SaaS, Spanish and homepage-hero HTML is identical to before). The hero player has no time read-out, so none was added.
- **Brand selector:** larger logos (about 1.65 x), 15 px industry labels, taller cards, wider container.
- **Spacing:** the buttons sit clearly lower under the selector (48 px, 64 px from `md`).

---

## Revision #7 (Nov 2026): the active video is dominant

- **Layering:** the featured card is the front layer (z 100). The side cards are 94 % of its size, tuck about 6 % of a width behind it (`x` offset 0.905 widths), tilt 14 degrees and recede a little (26 % shade); they stay large, true 9:16 and fully recognisable.
- **Backlight:** a clearly visible blurred lime glow (`RotaryStage.jsx`, 170 % x 128 % of the featured card, brightest at its edge, fading outward) sits at z 60, between the supporting cards and the featured card, so it radiates from behind the front card and lights the neighbours' inner edges without covering the video. The featured frame also gets a lime edge glow and a dark depth shadow onto the cards behind it.
- The hero-style player stays on the active card only; the podium was slimmed to the tighter arrangement. Rotation, selector, CTAs and responsive behaviour are unchanged.

---

## Revision #8 (Nov 2026): closer to the hero composition

- **Hierarchy:** one featured card (320 px wide, 569 px tall at the 1280 grid) and two clearly supporting cards at about 80 % (258 px), the proportion the hero stage uses; uniform scale so the side cards are never squashed (true 9:16), tilted 17 degrees, dimmed 24 %, and tucked about 7 % of a width behind the featured card.
- **Halo (explicit fix for the earlier, too faint glow):** two layers behind the featured card in an unclipped holder: a wide soft lime aura (z 55, `blur(28px)`) and a lime LED ring hugging the card edges (z 60, 7 px border, `blur(9px)`, `0 0 46px 10px` outer glow), plus a lime edge glow (`0 0 22px 3px`, `0 0 60px 6px`) and a dark depth shadow on the featured frame itself. The stage wrapper has 40 px of headroom (`pt-10`) so the halo is not cut off at the top. The halo sits between the supporting cards (z 25) and the featured card (z 100): visible around the top, sides and corners, never over the video.
- Hero-style player stays on the featured card only; podium and side shadows re-fitted; rotation, selector and CTAs unchanged.

---

## Revision #9 (Nov 2026): three small refinements

- **Softer glow:** the aura, ring glow and frame glow are about 20 % less intense (the aura also reaches less far to the sides); the thin bright lime edge stays.
- **Control bar on demand:** before a video is started only the big play button is drawn. The bottom bar (play / pause, seek, sound) shows on hover or keyboard focus (hidden with opacity only, so it stays reachable by keyboard) and stays once the video has been started, so on a touchscreen one tap on the play button starts it and the bar is then permanent. This is a new `barClass` option of the shared `HeroPlayerControls` (default none, so the hero is unchanged).
- **Side videos:** clicking (or tapping, swiping, or using the arrow keys) a side video brings it to the centre and the halo, active ring and player controls are then on it; it is playable but never autoplays. Side cards now tint lime on hover to show they are selectable.
