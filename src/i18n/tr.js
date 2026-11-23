/* TRANSLATION HELPERS for bespoke components.

   Pattern: the ENGLISH string stays in the component, wrapped in tr(...):
       const tr = useTr()
       <h2>{tr('What We Offer')}</h2>
   • English: tr() returns its argument untouched, so English pages are identical to before by construction.
   • Other locales: the string is looked up in that locale's dictionary (src/i18n/<locale>/*.js, merged in dictionaries.js).
   • A missing entry falls back to the English string (a page must never render blank), is reported by console.warn in development, and is caught by
     tests/i18n.test.mjs, which scans every tr('...') call in src/ and fails when the dictionary of a BUILT locale lacks it.
   • Arguments must be plain string literals (the completeness scan reads the source). Text with numbers from the business data uses the helpers in
     src/i18n/<locale>/ (for example formatMoneyEs) instead of string keys. */

import { currentLocale } from './locale.js'
import { DEFAULT_LOCALE } from './locales.js'
import { DICTIONARIES } from './dictionaries.js'
import { localizedPath } from './paths.js'
import { hasTranslation } from './registry.js'
import { hasPriceTokens, resolvePriceTokens } from './pricing.js'

export function translate(locale, text) {
  if (locale === DEFAULT_LOCALE) return text
  const hit = DICTIONARIES[locale]?.[text]
  if (hit !== undefined) return hasPriceTokens(hit) ? resolvePriceTokens(locale, hit) : hit
  // Record the miss: the build (vite-plugin-static-routes.js) refuses to write a translated page that rendered any untranslated string.
  ;(globalThis.__i18nMisses ||= new Set()).add(`${locale}: ${text}`)
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') console.warn(`[i18n] missing ${locale} translation: ${text}`)
  return text
}

/* tr = (englishText) => text in the current page's language. */
export function useTr() {
  const locale = currentLocale()
  return (text) => translate(locale, text)
}

/* Link to the equivalent page in the visitor's language when that translation exists; otherwise the English page (never a dead /es/… URL). */
export function localHref(basePath, locale = currentLocale()) {
  if (locale === DEFAULT_LOCALE || !hasTranslation(locale, basePath)) return basePath
  return localizedPath(locale, basePath)
}
/* Localize an internal href that may carry a hash or query ('/pricing#packages' → '/es/pricing#packages'). External URLs, mailto: and anchors are untouched. */
export function hrefFor(href, locale = currentLocale()) {
  if (!href || !href.startsWith('/')) return href
  const [path, ...rest] = href.split('#')
  return `${localHref(path, locale)}${rest.length ? `#${rest.join('#')}` : ''}`
}
/* A page that exists only in English, seen from a translated page: its link is labelled "(in English)" and marked hrefLang="en" (a clearly labelled language fallback, never a silent switch of language). */
export const englishOnly = (basePath, locale = currentLocale()) => locale !== DEFAULT_LOCALE && !hasTranslation(locale, basePath)
export const useHref = () => {
  const locale = currentLocale()
  return (basePath) => localHref(basePath, locale)
}

/* tr for code that is not a component or does not want a hook: reads the page's language from the URL on every call (same result as useTr). */
export const tr = (text) => translate(currentLocale(), text)

/* <T>English text</T>: a component form of tr() for JSX that is created at module load (page config objects, constant arrays). Module-level code runs once,
   before any page language is known, so it must not call tr() itself; <T> translates when the element is RENDERED. */
export function T({ children }) {
  return tr(typeof children === 'string' ? children : String(children))
}
