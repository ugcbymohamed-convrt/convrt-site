/* Where the language selector sends a visitor. Pure: unit-tested in tests/i18n.test.mjs.

   • The selector only ever links to pages that EXIST in the target language (registry.js) and only to languages that are live.
   • The equivalent page when it exists (/pricing → /es/pricing), otherwise the target language's homepage (an English-only page such as /blog or a
     case study falls back to /es/), never a URL that would 404.
   • No browser-language detection, no geolocation, no cookie and no redirect is involved: every option is an ordinary link. */

import { LOCALES, SELECTOR_ORDER, isLive, DEFAULT_LOCALE } from './locales.js'
import { hasTranslation } from './registry.js'
import { localizedPath } from './paths.js'

export function switchTarget(toLocale, basePath) {
  if (toLocale === DEFAULT_LOCALE) return basePath
  return hasTranslation(toLocale, basePath) ? localizedPath(toLocale, basePath) : localizedPath(toLocale, '/')
}

/* The options to show: live languages only, in the owner's order (English, Español, Français, العربية). French and Arabic appear here by themselves
   the day their status becomes 'live' (src/i18n/locales.js); nothing else needs to change. `exact` = the page exists in that language. */
export function languageOptions(currentLocale, basePath) {
  return SELECTOR_ORDER.filter(isLive).map((code) => ({
    code,
    label: LOCALES[code].nativeName,
    htmlLang: LOCALES[code].htmlLang,
    dir: LOCALES[code].dir,
    href: switchTarget(code, basePath),
    exact: code === DEFAULT_LOCALE || hasTranslation(code, basePath),
    current: code === currentLocale,
  }))
}
