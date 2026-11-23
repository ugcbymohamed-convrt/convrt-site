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
    // The Free Creative Growth Roadmap application (noindex like the English page, so never in the sitemap or hreflang): translated end to end.
    '/creative-growth-roadmap',
    // The 1 FREE video application (noindex like the English page and, on top of that, held by a release gate until the owner and the lawyer have reviewed it: src/i18n/release.js).
    '/risk-free-trial',
  ],
  // French and Arabic: nothing is translated yet, so nothing is routed. See docs/multilingual-french-arabic-backlog.md.
  fr: [],
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
  ],
}

export const hasTranslation = (locale, basePath) => (TRANSLATED_PATHS[locale] ?? []).includes(basePath)
