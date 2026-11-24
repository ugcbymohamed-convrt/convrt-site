# Video thumbnails: inventory and chosen frames

Every Cloudflare Stream video shown on the site has a poster: the still frame visitors see before playback. The frame for each video is chosen once, in `src/content/posterFrames.js` (seconds into the video),
and used everywhere the same video appears. The same-origin posters (`public/portfolio/*.webp`) are re-exported from those frames by `python3 scripts/poster-frames.py`; the homepage client panels, the case studies
and the /scale video read the time through `streamPoster()`. Frames are real frames of the real footage (Cloudflare Stream thumbnails, <https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/>); nothing is
generated, uploaded or changed on Cloudflare. Selection: ten candidates per video across its length, reviewed for a clear natural face with open eyes where there is one, a recognisable product, good light and composition,
no half-cut or motion blur, and as little stray caption as the footage allows (many videos have burned-in subtitles on every frame, so a small caption is sometimes unavoidable).

**87 videos have a chosen frame.** Contact sheet of the chosen frames: `docs/video-thumbnail-contact-sheet.jpg` (the 12 Arabic videos, added 2026-11-23, were chosen from six candidates per video taken across its length; their frames are listed below).

Not changed: the Roadmap explainer keeps its deliberately chosen 25.6 s frame; the self-hosted Adscale clip (`/showcase/adscale-creator.mp4`) is not on Stream and keeps its poster.

| Stream id | Frame | Appears in |
|---|---|---|
| `002d9dab…` | 10.3s | portfolio:ar-ugc-8 [ar] |
| `0241249c…` | 14.5s | portfolio:ar-ugc-7 [ar] |
| `04b0b981…` | 24.5s | portfolio:es-ugc-1 [es]; home-hero-es:home-hero-es-right |
| `08abef50…` | 37.5s | portfolio:showcase-adscale-2 (home panel adscale) |
| `0905b814…` | 10.6s | portfolio:showcase-elyon-2 (home panel elyon); elyon case study: Street Interview |
| `0b429c9c…` | 5.6s | portfolio:saas-creator-2 |
| `0d3a810e…` | 14.8s | portfolio:spokesperson-hero-3 |
| `0d8c53ad…` | 6.4s | portfolio:en-josh-ugc-2 |
| `0d98f3a5…` | 6.8s | portfolio:creator-15 |
| `10c436de…` | 6.4s | portfolio:ar-ugc-5 [ar] |
| `1188b434…` | 12.9s | portfolio:ugc-gal-3 |
| `15dd5505…` | 9s | portfolio:ar-graspo-3 (home panel graspo) [ar]; portfolio:showcase-graspo-1 (home panel graspo); graspo case study 295K |
| `18619920…` | 1.6s | portfolio:creator-17 |
| `1941b043…` | 8.2s | portfolio:es-spokesperson-hero-3 [es] |
| `1bb5e1f6…` | 27.7s | portfolio:ar-mohamed-bag [ar] |
| `1fc1374c…` | 1.7s | portfolio:ugc-hero-3 |
| `20c642c7…` | 1.6s | home-hero:home-hero-main |
| `250a9cb5…` | 3.6s | portfolio:spokesperson-gal-3 |
| `2a37b139…` | 7.8s | portfolio:en-mohamed-ugc-2 |
| `2bb321f0…` | 2.25s | portfolio:organic-gal-1 |
| `3058e60f…` | 4.8s | portfolio:creator-05 |
| `33a4063e…` | 5.6s | portfolio:ugc-hero-1; home-hero:home-hero-ugc-1 |
| `3616606e…` | 3.6s | portfolio:ar-graspo-2 (home panel graspo) [ar]; portfolio:showcase-graspo-2 (home panel graspo); graspo case study 1.2M |
| `3866056a…` | 7.1s | portfolio:es-ugc-5 [es] |
| `3a41e0f7…` | 9.1s | portfolio:ugc-gal-5 |
| `3e6b7af6…` | 15.8s | portfolio:es-ugc-2 [es]; home-hero-es:home-hero-es-left |
| `424622b3…` | 0.4s | portfolio:creator-09 |
| `442dfb5f…` | 13s | portfolio:ar-ugc-hero-1 [ar] |
| `49313ecc…` | 7.3s | portfolio:ar-ugc-3 [ar] |
| `4af34968…` | 27.3s | portfolio:es-spokesperson-6 [es] |
| `583c9f51…` | 6.4s | portfolio:ar-ugc-9 [ar] |
| `5904f418…` | 5.5s | home-hero-es:home-hero-es-main (Spanish CONVRT ad) |
| `5f7b145c…` | 5.7s | portfolio:en-mohamed-spokesperson-2 |
| `5fc04645…` | 1.5s | portfolio:creator-12 |
| `63446474…` | 18.7s | portfolio:ugc-hero-2; home-hero:home-hero-ugc-2 |
| `6426e524…` | 10.1s | portfolio:es-spokesperson-hero-1 [es] |
| `654557e3…` | 4.8s | portfolio:es-spokesperson-hero-2 [es] |
| `6c04c13d…` | 4.5s | portfolio:es-ugc-hero-1 [es] |
| `6d550ed3…` | 33.2s | portfolio:ar-ugc-1 [ar] |
| `6e56f6ab…` | 0.6s | portfolio:creator-16 |
| `749e2ad5…` | 39.4s | portfolio:ugc-gal-7 |
| `75e7a204…` | 3.9s | portfolio:es-ugc-hero-3 [es] |
| `79b1cd5d…` | 1.8s | portfolio:ugc-gal-4 |
| `7c467561…` | 1.9s | portfolio:organic-hero-2 |
| `7f68e3f6…` | 24.9s | portfolio:ar-ugc-hero-3 [ar]; home-hero-ar:home-hero-ar-right |
| `80fc9992…` | 28.3s | portfolio:saas-creator-1 |
| `816d3169…` | 23.8s | portfolio:es-ugc-hero-2 [es] |
| `871ea801…` | 5.8s | portfolio:ar-oneroyal-2 (home panel oneroyal) [ar] |
| `8766cb0a…` | 10.1s | portfolio:es-ugc-6 [es] |
| `889f8b61…` | 1.2s | portfolio:en-mohamed-spokesperson-1 |
| `8b15247d…` | 0.4s | portfolio:ugc-gal-6 |
| `8bc61e80…` | 11.6s | portfolio:ar-oneroyal-3 (home panel oneroyal) [ar] |
| `8d4dbbea…` | 69.4s | portfolio:showcase-adscale-1 (home panel adscale) |
| `8d8051df…` | 24.8s | portfolio:creator-06 |
| `93584825…` | 3.9s | portfolio:creator-10 |
| `9bbc9020…` | 1s | portfolio:creator-02 |
| `9e6cb843…` | 5.4s | portfolio:showcase-elyon-3 (home panel elyon); elyon case study: Performance Concept |
| `9e721f7d…` | 10.2s | portfolio:es-spokesperson-5 [es] |
| `9e7fca5c…` | 6.5s | portfolio:ar-mohamed-clothing [ar] |
| `a073ed52…` | 20.8s | portfolio:ar-ugc-4 [ar] |
| `a256f8f4…` | 18.8s | portfolio:ar-oneroyal-1 (home panel oneroyal) [ar] |
| `a290d76b…` | 3.3s | portfolio:en-josh-ugc-1 |
| `a32cb282…` | 22.2s | portfolio:ar-mohamed-zory [ar] |
| `a37d5452…` | kept | Roadmap explainer (keeps its chosen 25.6 s same-origin poster) |
| `a5e60be5…` | 9.2s | /scale video |
| `a71733d4…` | 15.8s | portfolio:spokesperson-gal-4 |
| `ad0e4e3b…` | 30.4s | portfolio:ar-ugc-2 [ar] |
| `adbf89cb…` | 11.4s | portfolio:spokesperson-gal-2 |
| `b3db2280…` | 3.1s | portfolio:spokesperson-hero-1 |
| `b5c4b833…` | 11.7s | portfolio:es-spokesperson-2 [es] |
| `b73842a4…` | 14s | portfolio:ugc-gal-8 |
| `afdb58eb…` | 8s | home-hero-ar:home-hero-ar-main [ar] |
| `c0c30e58…` | 39.9s | portfolio:spokesperson-hero-2 |
| `c118345b…` | 3.2s | portfolio:es-ugc-3 [es] |
| `c1379ace…` | 4.6s | portfolio:ar-graspo-1 (home panel graspo) [ar]; portfolio:showcase-graspo-3 (home panel graspo); graspo case study 7.5M |
| `c3adc980…` | 4.1s | portfolio:es-spokesperson-4 [es] |
| `c7c85203…` | 0.8s | portfolio:organic-gal-2 |
| `c8914f7a…` | 14.9s | portfolio:ugc-gal-1 |
| `c8ed4698…` | 1.4s | portfolio:organic-gal-4 |
| `cc23b5a0…` | 11.7s | portfolio:organic-hero-1 |
| `cd6654c2…` | 16.7s | portfolio:creator-04 |
| `d0c08b8a…` | 7.2s | portfolio:en-josh-saas-1 |
| `d2edf70e…` | 2.8s | portfolio:en-mohamed-ugc-1 |
| `d9613dac…` | 5.9s | portfolio:organic-hero-3 |
| `e67c49d0…` | 2.1s | portfolio:organic-gal-3 |
| `e76683d7…` | 15.6s | portfolio:ar-ugc-hero-2 [ar]; home-hero-ar:home-hero-ar-left |
| `e767742b…` | 35.3s | portfolio:spokesperson-gal-1 |
| `f1e72563…` | 6.1s | portfolio:creator-08 |
| `f4739a0b…` | 28.9s | portfolio:es-ugc-4 [es] |
| `f7a73932…` | 14.5s | portfolio:es-spokesperson-3 [es] |
| `fa02007b…` | 26.4s | portfolio:showcase-elyon-1 (home panel elyon); elyon case study: Creator-Led Ad |
| `fa580c25…` | 39.6s | portfolio:ar-ugc-6 [ar] |
| `fc89d8e3…` | 11s | portfolio:creator-11 |
| `ff256a46…` | 9.9s | portfolio:ugc-gal-2 |
| `fff13512…` | 7.6s | portfolio:es-spokesperson-1 [es] |