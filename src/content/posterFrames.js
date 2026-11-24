/* POSTER FRAMES: the still frame shown before playback for every video on the site, one entry per Cloudflare Stream video (the id is the Stream uid), in SECONDS.

   WHY. A poster is the first thing a visitor sees of a video; the default frame (the first one) is often a half-transition, a mid-word caption or a blank. Each frame below was chosen by looking at ten
   candidates taken across the video: a clear, natural face with open eyes where there is one, a recognisable product, good light and composition, no half-cut and as little stray caption as the
   footage allows. They are real frames of the real footage (Cloudflare Stream thumbnails), never generated images.

   HOW IT IS USED. Same-origin posters (public/portfolio/*.webp, the hero stages, galleries and the Showcase) are re-exported from these frames by scripts/poster-frames.py; videos that point at Stream
   thumbnails (the homepage client panels, the two case studies, the /scale video) read the time through streamPoster() below. Every place that shows the same video therefore shows the same frame.
   To change a frame: edit the number here, run `python3 scripts/poster-frames.py`, and commit the regenerated images. Nothing is uploaded or re-encoded on Cloudflare, and no account setting changes.
   A video that is not listed keeps its current poster (the Roadmap explainer keeps its deliberately chosen 25.6 s frame). Inventory and contact sheet: docs/video-thumbnails.md. */

export const POSTER_FRAMES = {
  '37d2799756ba9cc827b3381b034474ce': 2.5, // portfolio:es-showcase-elyon-1 (Spanish homepage stage, group Elyon Dubai): the "Spanish girls trying Elyon Dubai" title frame
  '8cc42ca3f0a33667eb14cf5e2449b4ad': 9.5, // portfolio:es-showcase-elyon-2
  'dc0a340190fc4cd310e24448dda4f170': 11.9, // portfolio:es-showcase-elyon-3
  '3bf715996728cd9e862d848878665f92': 15.9, // portfolio:es-showcase-mixed-1 (group E-commerce / UGC)
  '220122131040d62f1ce2d96ea9f98615': 10.0, // portfolio:es-showcase-mixed-2
  'b4daf32122e679f3af1c6ccc07eec8a7': 5.9, // portfolio:es-showcase-mixed-3
  '6c04c13dbb9ff7042f30e028b7394fe6': 4.5, // portfolio:es-ugc-hero-1 [es]
  '816d316906f79fe216d6f62079a0047f': 23.8, // portfolio:es-ugc-hero-2 [es]
  '75e7a204d0d4d2c75fe1ad19f0348461': 3.9, // portfolio:es-ugc-hero-3 [es]
  '04b0b9817dea7ad5f29e67d98499e8a4': 24.5, // portfolio:es-ugc-1 [es]; home-hero-es:home-hero-es-right
  '3e6b7af68da8f3258c2d6f4893b142bd': 15.8, // portfolio:es-ugc-2 [es]; home-hero-es:home-hero-es-left
  'c118345b54c4a9a6fc3a319b2a66e5db': 3.2, // portfolio:es-ugc-3 [es]
  'f4739a0bd536b672933a522bb5a6b779': 28.9, // portfolio:es-ugc-4 [es]
  '3866056a8606c49abad3aa2e7dfee6f6': 7.1, // portfolio:es-ugc-5 [es]
  '8766cb0a94b775b2c9bc50005d03fb9c': 10.1, // portfolio:es-ugc-6 [es]
  '6426e524291b27be4e42a93f51155029': 10.1, // portfolio:es-spokesperson-hero-1 [es]
  '654557e3f08432a3b05cf115d05b0c0d': 4.8, // portfolio:es-spokesperson-hero-2 [es]
  '1941b043cd48c685b59f4c3299003daa': 8.2, // portfolio:es-spokesperson-hero-3 [es]
  'fff13512cc21b7386a7b0a998e06047c': 7.6, // portfolio:es-spokesperson-1 [es]
  'b5c4b83376e5a02b0f0d87de7bd17f30': 11.7, // portfolio:es-spokesperson-2 [es]
  'f7a739320888ea494053b02f6eb84989': 14.5, // portfolio:es-spokesperson-3 [es]
  'c3adc98013a1a85a8b5bf6f6c410818f': 4.1, // portfolio:es-spokesperson-4 [es]
  '9e721f7dfa716703db3c3aa731d34e48': 10.2, // portfolio:es-spokesperson-5 [es]
  '4af34968812800c11e7c6f4121f65d9e': 27.3, // portfolio:es-spokesperson-6 [es]
  '80fc999238285c7f73757c78d9bcd8e7': 28.3, // portfolio:saas-creator-1
  '0b429c9cebb978105af85bdfb766d992': 5.6, // portfolio:saas-creator-2
  'e767742bb12024437e9df368cedbfba2': 35.3, // portfolio:spokesperson-gal-1
  'adbf89cb6c07bb06e708c2a03e4cf2f6': 11.4, // portfolio:spokesperson-gal-2
  'cc23b5a0e85bdbadf89a7e097891a622': 11.7, // portfolio:organic-hero-1
  '1861992017574fb69bdf5c4db91e56d2': 1.6, // portfolio:creator-17
  '250a9cb5f26c74728d775086879251d1': 3.6, // portfolio:spokesperson-gal-3
  '3a41e0f797a707576ff9af9fb9fb6a81': 9.1, // portfolio:ugc-gal-5
  'b3db228064bde5cd076d22d9c938c2b0': 3.1, // portfolio:spokesperson-hero-1
  '7c4675614e9381fe40ae686f5cfb3a00': 1.9, // portfolio:organic-hero-2
  '749e2ad503f5db79d69086a47c59edd0': 39.4, // portfolio:ugc-gal-7
  'a71733d42f59d1cec7034c1daa0258ea': 15.8, // portfolio:spokesperson-gal-4
  'cd6654c2daf9e65bb1a1db2588a86f44': 16.7, // portfolio:creator-04
  'fc89d8e3119f2480e3bfaf1e19e20326': 11.0, // portfolio:creator-11
  'd9613dac26e702b0f7edc1acca8e73ea': 5.9, // portfolio:organic-hero-3
  'f1e725634fe6bd8b059048a33612658d': 6.1, // portfolio:creator-08
  '0d98f3a55ebd26c9b400e348d02972d9': 6.8, // portfolio:creator-15
  '93584825751798b27840b85a2ad43a6a': 3.9, // portfolio:creator-10
  '2bb321f0b45175d4b4a0b6e3f79206c9': 27.5, // portfolio:organic-gal-1
  '33a4063ee0e8dafe3379f0a97817036e': 5.6, // portfolio:ugc-hero-1; home-hero:home-hero-ugc-1
  '3058e60f87200babb0b6c60606923e1b': 4.8, // portfolio:creator-05
  'c8914f7a0db3ac9f5ffd0721115dbe20': 14.9, // portfolio:ugc-gal-1
  'c7c85203ea049a339796bffbef6f1b06': 0.8, // portfolio:organic-gal-2
  'c0c30e58489efad67789cdba1b58df23': 39.9, // portfolio:spokesperson-hero-2
  '8d8051df7b4e99d1fed68fc3dea44f4d': 24.8, // portfolio:creator-06
  '424622b3fffd8a0a2a20ad6bf274a0db': 6.1, // portfolio:creator-09
  '0d3a810ee068bd311f13ffd4d7a7f3d6': 14.8, // portfolio:spokesperson-hero-3
  '6e56f6abcb371853fe557c52a7eb494a': 0.6, // portfolio:creator-16
  'e67c49d0d1cff6e3f160b4dbe6b1cea1': 2.1, // portfolio:organic-gal-3
  '79b1cd5d22e9f13587ab547e438e29ef': 10.4, // portfolio:ugc-gal-4
  '1188b4341860779830fa7365b1442959': 12.9, // portfolio:ugc-gal-3
  '63446474698139b4ac17c1f053212242': 18.7, // portfolio:ugc-hero-2; home-hero:home-hero-ugc-2
  'c8ed4698b9b20ccb49b84c2a5977d008': 1.4, // portfolio:organic-gal-4
  '9bbc90204d84630436a29bdd9ef3be17': 1.0, // portfolio:creator-02
  'b73842a409de5f4f6ae9d72733ea1152': 14.0, // portfolio:ugc-gal-8
  '8b15247d9a422614898b8bbb54591025': 10.2, // portfolio:ugc-gal-6
  'ff256a4643515d29b61c1f210c06476d': 9.9, // portfolio:ugc-gal-2
  '1fc1374cdfe428d10bfc40ad4eff9693': 1.7, // portfolio:ugc-hero-3
  '5fc046452d354eba0cff717239c4bee8': 1.5, // portfolio:creator-12
  '8d4dbbeabac272bddb23068c91037af8': 69.4, // portfolio:showcase-adscale-1 (home panel adscale)
  '08abef50c734085f25f345cdde4b1e33': 37.5, // portfolio:showcase-adscale-2 (home panel adscale)
  'fa02007b36fae2b3bb68c97cdd00e9fc': 26.4, // portfolio:showcase-elyon-1 (home panel elyon); elyon: Creator-Led Ad
  '0905b814e2ba3950197b5bfe1cefae38': 10.6, // portfolio:showcase-elyon-2 (home panel elyon); elyon: Street Interview
  '9e6cb8438c9b0c1ab8b55953718eddde': 5.4, // portfolio:showcase-elyon-3 (home panel elyon); elyon: Performance Concept
  '15dd5505109f6821ccdcb13fc3cdc1fd': 9.0, // portfolio:showcase-graspo-1 (home panel graspo); graspo 295K
  '3616606e3ca6d1a85c8a57d7cc2f656f': 3.6, // portfolio:showcase-graspo-2 (home panel graspo); graspo 1.2M
  'c1379ace38f2fa19ef2a45de1bb5d4b1': 4.6, // portfolio:showcase-graspo-3 (home panel graspo); graspo 7.5M
  '20c642c760e1937953fc33e98f3d859f': 1.6, // home-hero:home-hero-main
  '5904f4189ee4726cb4d7e4272a8b915b': 5.5, // home-hero-es:home-hero-es-main (Spanish CONVRT ad; clear face, open eyes, coffee cup, no caption on screen)
  'a5e60be52e693016bb47bed4c801eb5f': 9.2, // scale VSL (poster, no time)
}

/* A Stream thumbnail for a video id at its chosen frame (the first frame when none is listed). height = pixel height of the returned image. */
export const streamPoster = (id, { height = 720 } = {}) => `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg?time=${POSTER_FRAMES[id] ?? 0}s&height=${height}`
