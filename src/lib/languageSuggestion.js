/* LANGUAGE SUGGESTION for visitors in Spain (Spanish), in France or any other French-speaking country (French) and in an Arabic-speaking country (Arabic): a small, dismissible hint on ENGLISH pages. A progressive enhancement only.

   What it is NOT: a redirect. No page, URL, canonical, hreflang, sitemap entry, metadata or JSON-LD changes, and the prerendered HTML never contains the hint (it is mounted in its own React root
   after the page has loaded and hydrated), so crawlers and visitors outside Spain receive exactly the same page as before. Both languages stay independently reachable and indexable.

   When it appears (all must hold): an English page that exists as a prerendered public page (not the 404 page, not the private pages, not the legal pages), the language is live, the visitor has no stored
   language choice (src/lib/languagePreference.js), and the server says the request came from that language's country (GET /api/visitor-country, which reads Vercel's x-vercel-ip-country header and answers
   { spain, france, french, arabic, known } with `Cache-Control: private, no-store`). If the lookup works and says no, nothing is shown. ONLY when the server cannot place the request at all (known: false: the lookup failed or no
   country was available) is the browser's preferred-language list used instead, and only if its first supported language is one of ours. No browser location permission, no external geolocation service,
   no IP address stored, no tracking events. A new language is added to SUGGESTIBLE below together with its country in api/_lib/geo.js and its card text in src/components/LanguageSuggestion.jsx. */

import { parsePath } from '../i18n/paths.js'
import { isLive, DEFAULT_LOCALE } from '../i18n/locales.js'
import { switchTarget } from '../i18n/switch.js'
import { PATHS, KNOWN_PATHS } from '../routes.js'
import { BLOG_PATH } from '../config.js'
import { readLanguageChoice } from './languagePreference.js'

export const GEO_ENDPOINT = '/api/visitor-country'
/* The legal pages stay out of it (English-only documents). Only pages in the public route table (and published blog articles) are eligible, so the private invitation-only pages never are. */
const LEGAL = new Set([PATHS.privacy, PATHS.terms, PATHS.legalNotice])
const isPublicPage = (basePath) => KNOWN_PATHS.includes(basePath) || basePath.startsWith(`${BLOG_PATH}/`)

/* The languages we suggest: each with the visitor flag the server answers for its country. */
export const SUGGESTIBLE = { fr: 'french', es: 'spain', ar: 'arabic' }

/* Where the suggestion's link goes for this English page and language: the equivalent translated page when it exists and is released, otherwise the language's homepage. Null = do not offer. */
export function suggestionTargetFor(locale, pathname) {
  const { locale: current, basePath } = parsePath(pathname)
  if (current !== DEFAULT_LOCALE || !isLive(locale)) return null
  if (!isPublicPage(basePath) || LEGAL.has(basePath)) return null
  return { href: switchTarget(locale, basePath) }
}
/* The Spanish destination (kept for existing callers and tests). */
export const suggestionTarget = (pathname) => suggestionTargetFor('es', pathname)

/* Asks the server where this request came from. Any failure (network, status, bad JSON, timeout) is "unknown": { spain: false, france: false, french: false, arabic: false, known: false }. */
export async function visitorGeo(fetchImpl = (typeof fetch === 'undefined' ? undefined : fetch), timeoutMs = 4000) {
  const none = { spain: false, france: false, french: false, arabic: false, known: false }
  if (!fetchImpl) return none
  const ctrl = typeof AbortController === 'undefined' ? null : new AbortController()
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null
  try {
    const res = await fetchImpl(GEO_ENDPOINT, { method: 'GET', cache: 'no-store', credentials: 'same-origin', signal: ctrl?.signal })
    if (!res.ok) return none
    const j = await res.json()
    return { spain: j?.spain === true, france: j?.france === true, french: j?.french === true, arabic: j?.arabic === true, known: j?.known === true }
  } catch {
    return none
  } finally {
    if (timer) clearTimeout(timer)
  }
}
/* Asks the server whether this request came from Spain (kept for existing callers and tests). */
export const visitorIsInSpain = async (fetchImpl, timeoutMs) => (await visitorGeo(fetchImpl, timeoutMs)).spain

/* The first of the browser's preferred languages that we offer, or null. Only used when the server could not place the request. */
export function preferredSuggestible(win, candidates) {
  const list = win?.navigator?.languages?.length ? win.navigator.languages : [win?.navigator?.language]
  for (const tag of list) {
    const code = String(tag ?? '').slice(0, 2).toLowerCase()
    if (candidates.includes(code)) return code
    if (code && code !== DEFAULT_LOCALE) return null // the visitor's own first choice is another language we do not offer: do not suggest a different one
  }
  return null
}

/* Called once from src/main.jsx after the page has loaded. Resolves the suggested language code when the suggestion was mounted, false otherwise. */
export async function startLanguageSuggestion({ win = window, doc = document, fetchImpl, mount } = {}) {
  const targets = Object.fromEntries(Object.keys(SUGGESTIBLE).map((l) => [l, suggestionTargetFor(l, win.location.pathname)]).filter(([, t]) => t))
  if (!Object.keys(targets).length || readLanguageChoice(win)) return false
  const geo = await visitorGeo(fetchImpl)
  const byCountry = Object.keys(targets).find((l) => geo[SUGGESTIBLE[l]])
  const locale = byCountry ?? (geo.known ? null : preferredSuggestible(win, Object.keys(targets)))
  if (!locale) return false
  if (readLanguageChoice(win)) return false // chosen in another tab while we asked
  const { mountLanguageSuggestion } = mount ? { mountLanguageSuggestion: mount } : await import('../components/mountLanguageSuggestion.jsx')
  mountLanguageSuggestion(doc, targets[locale].href, locale)
  return locale
}
