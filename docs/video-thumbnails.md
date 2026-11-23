# Video thumbnails: inventory and chosen frames

Every Cloudflare Stream video shown on the site has a poster: the still frame visitors see before playback. The frame for each video is chosen once, in `src/content/posterFrames.js` (seconds into the video),
and used everywhere the same video appears. The same-origin posters (`public/portfolio/*.webp`) are re-exported from those frames by `python3 scripts/poster-frames.py`; the homepage client panels, the case studies
and the /scale video read the time through `streamPoster()`. Frames are real frames of the real footage (Cloudflare Stream thumbnails, <https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/>); nothing is
generated, uploaded or changed on Cloudflare. Selection: ten candidates per video across its length, reviewed for a clear natural face with open eyes where there is one, a recognisable product, good light and composition,
no half-cut or motion blur, and as little stray caption as the footage allows (many videos have burned-in subtitles on every frame, so a small caption is sometimes unavoidable).

**80 videos have a chosen frame.** Contact sheet of the chosen frames: `docs/video-thumbnail-contact-sheet.jpg`.

Not changed: the Roadmap explainer keeps its deliberately chosen 25.6 s frame; the self-hosted Adscale clip (`/showcase/adscale-creator.mp4`) is not on Stream and keeps its poster.

| Stream id | Frame | Appears in |
|---|---|---|
| `0346ed08…` | 22.6s | portfolio:fr-ugc-hero-2 [fr]; home-hero-fr:home-hero-fr-right |
| `04b0b981…` | 24.5s | portfolio:es-ugc-1 [es]; home-hero-es:home-hero-es-right |
| `06d0cf7f…` | 0.4s | home-hero-fr:home-hero-fr-main |
| `08abef50…` | 37.5s | portfolio:showcase-adscale-2 (home panel adscale) |
| `0905b814…` | 10.6s | portfolio:showcase-elyon-2 (home panel elyon); elyon case study: Street Interview |
| `0b429c9c…` | 5.6s | portfolio:saas-creator-2 |
| `0d3a810e…` | 14.8s | portfolio:spokesperson-hero-3 |
| `0d98f3a5…` | 6.8s | portfolio:creator-15 |
| `1188b434…` | 12.9s | portfolio:ugc-gal-3 |
| `15dd5505…` | 9s | portfolio:showcase-graspo-1 (home panel graspo); graspo case study 295K |
| `18619920…` | 1.6s | portfolio:creator-17 |
| `1941b043…` | 8.2s | portfolio:es-spokesperson-hero-3 [es] |
| `1fc1374c…` | 1.7s | portfolio:ugc-hero-3 |
| `20c642c7…` | 1.6s | home-hero:home-hero-main |
| `250a9cb5…` | 3.6s | portfolio:spokesperson-gal-3 |
| `2bb321f0…` | 27.5s | portfolio:organic-gal-1 |
| `3058e60f…` | 4.8s | portfolio:creator-05 |
| `33a4063e…` | 5.6s | portfolio:ugc-hero-1; home-hero:home-hero-ugc-1 |
| `3616606e…` | 3.6s | portfolio:showcase-graspo-2 (home panel graspo); graspo case study 1.2M |
| `3866056a…` | 7.1s | portfolio:es-ugc-5 [es] |
| `3a41e0f7…` | 9.1s | portfolio:ugc-gal-5 |
| `3e6b7af6…` | 15.8s | portfolio:es-ugc-2 [es]; home-hero-es:home-hero-es-left |
| `424622b3…` | 6.1s | portfolio:creator-09 |
| `490a0502…` | 3s | portfolio:fr-showcase-fixd-2 (home panel fixd) [fr] |
| `4af34968…` | 27.3s | portfolio:es-spokesperson-6 [es] |
| `5639f5ff…` | 19.6s | portfolio:fr-mohamed-skycop [fr] |
| `5904f418…` | 5.5s | home-hero-es:home-hero-es-main |
| `5b1058e9…` | 2.1s | portfolio:fr-ugc-hero-3 [fr] |
| `5fc04645…` | 1.5s | portfolio:creator-12 |
| `63446474…` | 18.7s | portfolio:ugc-hero-2; home-hero:home-hero-ugc-2 |
| `6426e524…` | 10.1s | portfolio:es-spokesperson-hero-1 [es] |
| `654557e3…` | 4.8s | portfolio:es-spokesperson-hero-2 [es] |
| `6c04c13d…` | 4.5s | portfolio:es-ugc-hero-1 [es] |
| `6e56f6ab…` | 0.6s | portfolio:creator-16 |
| `749e2ad5…` | 39.4s | portfolio:ugc-gal-7 |
| `75e7a204…` | 3.9s | portfolio:es-ugc-hero-3 [es] |
| `79b1cd5d…` | 10.4s | portfolio:ugc-gal-4 |
| `7c467561…` | 1.9s | portfolio:organic-hero-2 |
| `7c681c01…` | 18.6s | portfolio:fr-ugc-1 [fr] |
| `80fc9992…` | 28.3s | portfolio:saas-creator-1 |
| `816d3169…` | 23.8s | portfolio:es-ugc-hero-2 [es] |
| `8766cb0a…` | 10.1s | portfolio:es-ugc-6 [es] |
| `8797ae3f…` | 3.4s | portfolio:fr-mohamed-comma [fr] |
| `8b15247d…` | 10.2s | portfolio:ugc-gal-6 |
| `8d4dbbea…` | 69.4s | portfolio:showcase-adscale-1 (home panel adscale) |
| `8d8051df…` | 24.8s | portfolio:creator-06 |
| `93584825…` | 3.9s | portfolio:creator-10 |
| `9bbc9020…` | 1s | portfolio:creator-02 |
| `9e6cb843…` | 5.4s | portfolio:showcase-elyon-3 (home panel elyon); elyon case study: Performance Concept |
| `9e721f7d…` | 10.2s | portfolio:es-spokesperson-5 [es] |
| `9eedb31e…` | 3s | portfolio:fr-showcase-fixd-1 (home panel fixd) [fr] |
| `a273a9e7…` | 6.3s | portfolio:fr-ugc-2 [fr] |
| `a4a52503…` | 1.9s | portfolio:fr-mohamed-route-facile [fr] |
| `a5e60be5…` | 9.2s | /scale video |
| `a71733d4…` | 15.8s | portfolio:spokesperson-gal-4 |
| `adbf89cb…` | 11.4s | portfolio:spokesperson-gal-2 |
| `b3db2280…` | 3.1s | portfolio:spokesperson-hero-1 |
| `b5c4b833…` | 11.7s | portfolio:es-spokesperson-2 [es] |
| `b73842a4…` | 14s | portfolio:ugc-gal-8 |
| `c0c30e58…` | 39.9s | portfolio:spokesperson-hero-2 |
| `c118345b…` | 3.2s | portfolio:es-ugc-3 [es] |
| `c1379ace…` | 4.6s | portfolio:showcase-graspo-3 (home panel graspo); graspo case study 7.5M |
| `c1dd083d…` | 17.6s | portfolio:fr-ugc-hero-1 [fr]; home-hero-fr:home-hero-fr-left |
| `c3adc980…` | 4.1s | portfolio:es-spokesperson-4 [es] |
| `c7c85203…` | 0.8s | portfolio:organic-gal-2 |
| `c8914f7a…` | 14.9s | portfolio:ugc-gal-1 |
| `c8ed4698…` | 1.4s | portfolio:organic-gal-4 |
| `cc23b5a0…` | 11.7s | portfolio:organic-hero-1 |
| `cd6654c2…` | 16.7s | portfolio:creator-04 |
| `d9613dac…` | 5.9s | portfolio:organic-hero-3 |
| `e4e8c66b…` | 22.1s | portfolio:fr-mohamed-tripmap [fr] |
| `e67c49d0…` | 2.1s | portfolio:organic-gal-3 |
| `e767742b…` | 35.3s | portfolio:spokesperson-gal-1 |
| `f1e72563…` | 6.1s | portfolio:creator-08 |
| `f4739a0b…` | 28.9s | portfolio:es-ugc-4 [es] |
| `f7a73932…` | 14.5s | portfolio:es-spokesperson-3 [es] |
| `fa02007b…` | 26.4s | portfolio:showcase-elyon-1 (home panel elyon); elyon case study: Creator-Led Ad |
| `fc89d8e3…` | 11s | portfolio:creator-11 |
| `ff256a46…` | 9.9s | portfolio:ugc-gal-2 |
| `fff13512…` | 7.6s | portfolio:es-spokesperson-1 [es] |
