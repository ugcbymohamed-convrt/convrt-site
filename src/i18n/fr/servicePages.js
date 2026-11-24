/* FRENCH SERVICE PAGES: NO VIDEOS (owner decision, Nov 2026). /fr/spokesperson-video-production, /fr/social-media-video-production and /fr/saas-video-production are text-led: no three-phone
   hero stage, no showcase gallery, no placeholders, no "coming soon" section. Those pages ask `serviceVideos()` (src/i18n/serviceVideos.js) for their videos, which returns [] while this is
   false, so the hero turns text-led (UgcHero) and the gallery renders nothing, whatever the portfolio holds. English and Spanish are not affected.
   To add a French gallery later: (1) add French-language approved videos to src/content/portfolio.js for the page's type (`languages: ['fr']`, `onlyIn: ['fr']`, see
   docs/multilingual-french-release.md), (2) set this to true. The stage and the gallery then return by themselves. */
export const FR_SERVICE_PAGE_VIDEOS = false
