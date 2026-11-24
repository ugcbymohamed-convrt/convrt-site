/* LOCALE REGISTRY — the single list of languages CONVRT publishes (or is preparing to publish).

   Pure data, no React: used by the app, the build (prerender, sitemap), the tests and the language selector.

   STATUS
   • 'live'     — complete, owner-approved translation: indexable, in the sitemap, reciprocal hreflang, shown in the language selector.
   • 'review'   — the pages are built (reachable by URL, for the owner's review) but held back: noindex, NOT in the sitemap, NO hreflang,
                  NOT offered in the selector. Flip a locale from 'live' to 'review' to withdraw it again without deleting anything.
   • 'prepared' — architecture only (direction, typography, selector slot). NO routes are built, so /fr/… and /ar/… answer with a real
                  HTTP 404 until their translation is finished and the status moves to 'review' / 'live'.
   English is the source language and is always live at the unprefixed URLs (they never change). */

export const DEFAULT_LOCALE = 'en'

export const LOCALES = {
  en: { code: 'en', htmlLang: 'en', dir: 'ltr', prefix: '', nativeName: 'English', englishName: 'English', ogLocale: 'en_US', status: 'live' },
  es: { code: 'es', htmlLang: 'es', dir: 'ltr', prefix: '/es', nativeName: 'Español', englishName: 'Spanish', ogLocale: 'es_ES', status: 'live' },
  // French (France-first, owner decision Nov 2026): fr-FR is the language tag of the pages (html lang, hreflang) and og:locale. Only the pages listed in src/i18n/registry.js exist in French.
  fr: { code: 'fr', htmlLang: 'fr-FR', dir: 'ltr', prefix: '/fr', nativeName: 'Français', englishName: 'French', ogLocale: 'fr_FR', status: 'live' },
  // Arabic: right-to-left. Modern Standard Arabic is the main professional website language (GCC-first positioning); see docs/multilingual-architecture.md.
  ar: { code: 'ar', htmlLang: 'ar', dir: 'rtl', prefix: '/ar', nativeName: 'العربية', englishName: 'Arabic', ogLocale: 'ar_AE', status: 'review' },
}

export const LOCALE_CODES = Object.keys(LOCALES)
export const isLocale = (code) => Object.prototype.hasOwnProperty.call(LOCALES, code)

/* Locales whose routes are BUILT (static HTML written): everything except 'prepared'. */
export const BUILT_LOCALES = LOCALE_CODES.filter((c) => LOCALES[c].status !== 'prepared')
/* Locales that are public: indexable, in the sitemap, in hreflang and in the selector. */
export const LIVE_LOCALES = LOCALE_CODES.filter((c) => LOCALES[c].status === 'live')
export const isLive = (code) => LOCALES[code]?.status === 'live'
export const dirOf = (code) => LOCALES[code]?.dir ?? 'ltr'
export const htmlLangOf = (code) => LOCALES[code]?.htmlLang ?? 'en'

/* Where each language's visitors can be reached. The selector shows ALL four languages (owner requirement); a language that is not
   live is shown as "coming soon" and does not navigate anywhere (see LanguageSelector.jsx). */
export const SELECTOR_ORDER = ['en', 'es', 'fr', 'ar']
