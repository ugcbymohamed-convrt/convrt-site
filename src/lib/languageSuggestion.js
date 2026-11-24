/* LANGUAGE SUGGESTION for visitors in Spain (Spanish) and in Arabic-speaking countries (Arabic): a small, dismissible hint on ENGLISH pages. A progressive enhancement only.

   What it is NOT: a redirect. No page, URL, canonical, hreflang, sitemap entry, metadata or JSON-LD changes, and the prerendered HTML never contains the hint (it is mounted in its own React root
   after the page has loaded and hydrated), so crawlers and visitors outside Spain receive exactly the same page as before. Both languages stay independently reachable and indexable.

   When it appears (all must hold): an English page that exists as a prerendered public page (not the 404 page, not the private pages, not the legal pages), Spanish is a live language, the visitor has no stored
   language choice (src/lib/languagePreference.js), and the server says the request came from Spain (GET /api/visitor-country, which reads Vercel's x-vercel-ip-country header and answers
   { spain: true|false } with `Cache-Control: private, no-store`). If the lookup fails, is slow or says no, nothing is shown. No browser location permission, no external geolocation service,
   no IP address stored, no tracking events. */

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

/* Where "Ver en español" / «عرض بالعربية» goes for this English page: the equivalent page in that language when it exists and is released, otherwise that language's homepage. Null = do not offer. */
export function suggestionTarget(pathname, lang = 'es') {
  const { locale, basePath } = parsePath(pathname)
  if (locale !== DEFAULT_LOCALE || !isLive(lang)) return null
  if (!isPublicPage(basePath) || LEGAL.has(basePath)) return null
  return { href: switchTarget(lang, basePath) }
}

/* Asks the server which suggestion (if any) this request is eligible for: 'es' (Spain), 'ar' (an Arabic-speaking country) or null. Any failure (network, status, bad JSON, timeout) is null. */
export async function visitorSuggestedLanguage(fetchImpl = (typeof fetch === 'undefined' ? undefined : fetch), timeoutMs = 4000) {
  if (!fetchImpl) return null
  const ctrl = typeof AbortController === 'undefined' ? null : new AbortController()
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null
  try {
    const res = await fetchImpl(GEO_ENDPOINT, { method: 'GET', cache: 'no-store', credentials: 'same-origin', signal: ctrl?.signal })
    if (!res.ok) return null
    const body = await res.json()
    return body?.spain === true ? 'es' : body?.arabic === true ? 'ar' : null
  } catch {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/* Kept for callers that only care about Spain. */
export const visitorIsInSpain = async (fetchImpl, timeoutMs) => (await visitorSuggestedLanguage(fetchImpl, timeoutMs)) === 'es'

/* Called once from src/main.jsx after the page has loaded. Resolves true when the suggestion was mounted. */
export async function startLanguageSuggestion({ win = window, doc = document, fetchImpl, mount } = {}) {
  if (!suggestionTarget(win.location.pathname, 'es') && !suggestionTarget(win.location.pathname, 'ar')) return false
  if (readLanguageChoice(win)) return false
  const lang = await visitorSuggestedLanguage(fetchImpl)
  const target = lang && suggestionTarget(win.location.pathname, lang)
  if (!target) return false
  if (readLanguageChoice(win)) return false // chosen in another tab while we asked
  const { mountLanguageSuggestion } = mount ? { mountLanguageSuggestion: mount } : await import('../components/mountLanguageSuggestion.jsx')
  mountLanguageSuggestion(doc, target.href, lang)
  return true
}
