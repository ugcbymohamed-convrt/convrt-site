/* Locale-aware path helpers. Pure functions (browser, build and tests).

   URL scheme (owner-confirmed): English stays at the unprefixed URLs; every other language lives under its prefix, using the SAME slugs
   as English unless validated search intent justifies a different one:
     /pricing  →  /es/pricing   (and /fr/pricing, /ar/pricing when those translations exist)
     /         →  /es/          (canonical form keeps the trailing slash for the language home) */

import { LOCALES, DEFAULT_LOCALE, isLocale } from './locales.js'
import { TRANSLATED_PATHS } from './registry.js'

const trimSlash = (p) => p.replace(/\/+$/, '') || '/'

/* '/es/pricing' → { locale: 'es', basePath: '/pricing' };  '/es' or '/es/' → { locale: 'es', basePath: '/' };  '/pricing' → { locale: 'en', basePath: '/pricing' }.
   Any known language prefix is recognised, including languages that are not built yet ('/fr/x' → locale 'fr'), so the app can answer them with
   a localized "not found" instead of treating them as English pages. */
export function parsePath(pathname) {
  const p = trimSlash(pathname || '/')
  const m = p.match(/^\/([a-z]{2})(\/.*)?$/)
  if (m && isLocale(m[1]) && m[1] !== DEFAULT_LOCALE) return { locale: m[1], basePath: m[2] ? trimSlash(m[2]) : '/' }
  return { locale: DEFAULT_LOCALE, basePath: p }
}

/* The URL path for a base path in a locale: ('es', '/pricing') → '/es/pricing'; ('es', '/') → '/es/'; ('en', '/pricing') → '/pricing'. */
export function localizedPath(locale, basePath) {
  if (!isLocale(locale) || locale === DEFAULT_LOCALE) return basePath
  const prefix = LOCALES[locale].prefix
  return basePath === '/' ? `${prefix}/` : `${prefix}${basePath}`
}

/* Every built localized path (all non-English locales' translated routes), as route keys ('/es', '/es/pricing'). Used by the build and the route tests. */
export function allLocalizedPaths(locales = Object.keys(TRANSLATED_PATHS)) {
  return locales.flatMap((l) => (TRANSLATED_PATHS[l] ?? []).map((bp) => routeKey(localizedPath(l, bp))))
}

/* A path as App.jsx / the prerenderer key it (no trailing slash except the root): '/es/' → '/es'. */
export const routeKey = (pathname) => trimSlash(pathname)
