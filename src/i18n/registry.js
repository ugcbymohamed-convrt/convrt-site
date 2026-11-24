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
    // The Referral Partner Program (noindex like the English page while its launch gate is closed: src/config.js REFERRALS_INDEXABLE).
    '/referrals',
  ],
  // French: only the Referral Partner Program page is translated so far (the complete French site lives on french-localization). Its locale is in 'review' status. See docs/multilingual-referrals-fr-ar.md.
  fr: ['/referrals'],
  // Arabic (one shared website for the UAE and Saudi Arabia, USD): the homepage, the FOUR service pages (UGC, Spokesperson, Organic Social, SaaS), the Graspo case study, pricing, the Creator
  // Showcase and the two application flows. About, Contact, the Elyon case study and the legal pages stay English-only: links to them keep their English URL (never a dead /ar/ URL).
  ar: [
    '/',
    '/ugc-video-agency',
    '/spokesperson-video-production',
    '/social-media-video-production',
    '/saas-video-production',
    '/case-studies/graspo',
    '/pricing',
    '/creator-showcase',
    '/creative-growth-roadmap',
    '/risk-free-trial',
    '/referrals',
    '/blog', // the Arabic blog index (src/BlogPageAr.jsx); Arabic articles are listed in src/content/blogAr.js
  ],
}

export const hasTranslation = (locale, basePath) => (TRANSLATED_PATHS[locale] ?? []).includes(basePath)
