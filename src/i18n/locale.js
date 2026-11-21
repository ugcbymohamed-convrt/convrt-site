/* The locale of the page being rendered. Derived from the URL ONLY (never from the browser's language, a cookie or the visitor's location),
   so the server render, the hydration render and a crawler always agree. Works in the browser and in the build's server entry
   (src/entry-server.jsx sets a global `window.location` before rendering). */

import { DEFAULT_LOCALE } from './locales.js'
import { parsePath } from './paths.js'

export function currentLocale() {
  if (typeof window === 'undefined' || !window.location) return DEFAULT_LOCALE
  return parsePath(window.location.pathname).locale
}

/* React hook form of the same thing: reads the URL; there is no context to provide because the URL is the single source of truth. */
export const useLocale = currentLocale
