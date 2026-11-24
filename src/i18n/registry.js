/* WHICH PAGES EXIST IN WHICH LANGUAGE.

   A locale gets a page only when the translation is COMPLETE. Listing a base (English) path here is the one act that:
   • builds /<locale><path> as static HTML (src/routes.js → allRoutePaths),
   • adds it to the sitemap and to reciprocal hreflang (while the locale is 'live'),
   • lets the language selector link to it.
   A page that is missing here is never linked, never in hreflang and never in the sitemap: the selector falls back to the locale's homepage.

   Keys are the ENGLISH ("base") paths from src/routes.js. */

export const TRANSLATED_PATHS = {
  es: [
    '/',
    '/ugc-video-agency',
    '/spokesperson-video-production',
    '/social-media-video-production',
    '/saas-video-production',
    '/pricing',
    '/creator-showcase',
    '/about',
    '/contact',
    // The case studies. /case-studies renders the default study (Graspo) and canonicalises to it, exactly as in English (src/seo/siteSeo.js).
    '/case-studies',
    '/case-studies/graspo',
    '/case-studies/elyon',
    // The Free Creative Growth Roadmap application (noindex like the English page, so never in the sitemap or hreflang): translated end to end.
    '/creative-growth-roadmap',
    // The 1 FREE video application (noindex like the English page and, on top of that, held by a release gate until the owner and the lawyer have reviewed it: src/i18n/release.js).
    '/risk-free-trial',
    '/referrals',
  ],
  // French (France-first, Nov 2026): the homepage, the four service pages (UGC, spokesperson, organic social, SaaS: native French, no video galleries, see
  // docs/multilingual-french-release.md), pricing, the creator showcase, the case studies, the two conversion flows and the Referral Partner Program. Everything else (About, Contact, blog, legal)
  // is deliberately not translated yet: French pages link to the English page and say so.
  fr: [
    '/',
    '/ugc-video-agency',
    '/spokesperson-video-production',
    '/social-media-video-production',
    '/saas-video-production',
    '/pricing',
    '/creator-showcase',
    '/case-studies',
    '/case-studies/graspo',
    '/case-studies/elyon',
    '/creative-growth-roadmap',
    '/risk-free-trial',
    '/referrals',
  ],
  // Arabic: on this branch only the Referral Partner Program page (its locale is in 'review' status); the complete Arabic site lives on arabic-localization.
  ar: ['/referrals'],
}

export const hasTranslation = (locale, basePath) => (TRANSLATED_PATHS[locale] ?? []).includes(basePath)
