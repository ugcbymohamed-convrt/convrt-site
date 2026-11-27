/* Locale → content. One place that says how a language reads shared content, so components and JSON-LD builders never disagree.

   FAQ, page configs and any other English data that is shown as text are localized by LOOKUP, not by copying: every visible string passes through the
   language's dictionary (src/i18n/<locale>/dict-*.js, keys = the exact English sentence). When the English source changes (for example a price in the business
   data, or SEO/GEO Batch 2 rewording an answer), the old key no longer matches: the build then refuses to write the translated page until the Spanish is updated.
   That is the drift guard: a Spanish page can never silently show a stale or mismatched claim. */

import { HOME_FAQ } from '../seo/homeFaq.js'
import { translate, hrefFor, englishOnly, isFallbackPath, T } from './tr.js'
import { editorial } from './editorial.js'
import { localizeStat } from './format.js'
import { OFFER_PATHS, REFERRALS_PATH } from '../config.js'
import { flowAvailable } from './cta.js'
import { DEFAULT_LOCALE } from './locales.js'

const localizeHref = (href, locale) => hrefFor(href, locale)

/* Arabic: a link to a page that exists only in English says so in its label (a clearly labelled language fallback), unless the translation already does. */
const arabicLabel = (l, locale) => {
  const label = translate(locale, l.label)
  return locale === 'ar' && l.href.startsWith('/') && englishOnly(l.href.split('#')[0].split('?')[0], locale) && !label.includes('بالإنجليزية') ? `${label} ${translate(locale, '(in English)')}` : label
}
/* A link whose target exists only in English says so in languages that declare a fallback note (French: « (en anglais) »); languages whose every target is translated are unchanged. */
const withNote = (label, href, locale) => {
  const note = editorial(locale)?.fallbackNote
  return note && href.startsWith('/') && isFallbackPath(href.split('#')[0].split('?')[0], locale) ? `${label} (${note})` : label
}
const localizeLink = (l, locale) => (l ? { ...l, label: locale === 'ar' ? arabicLabel(l, locale) : withNote(translate(locale, l.label), l.href, locale), href: localizeHref(l.href, locale) } : l)

/* A link into a flow that is not translated for this language is dropped (never a link from a Spanish page into an English form). */
const FLOW_OF = { [OFFER_PATHS.roadmap]: 'roadmap', [OFFER_PATHS.hooks]: 'hooks', [OFFER_PATHS.riskFree]: 'riskFree', [REFERRALS_PATH]: 'referrals' }
const linkAvailable = (l, locale) => !FLOW_OF[l.href.split('#')[0]] || flowAvailable(locale, FLOW_OF[l.href.split('#')[0]])

/* One FAQ list (items shaped { q, a: string|string[], link?, moreLinks?, links? }) in a language. Order, count and links are the English ones. */
/* Arabic (owner, 2026-11-26): no VAT wording on public Arabic marketing pages, so the pricing FAQ's VAT question is not shown in Arabic. The visible accordion and the FAQPage JSON-LD both read this list,
   so the two stay identical. English, Spanish and French keep the item. */
const OMITTED_FAQ = { ar: new Set(['vat']) }

export function localizeFaq(items, locale) {
  if (locale === DEFAULT_LOCALE) return items
  return items.filter((item) => !OMITTED_FAQ[locale]?.has(item.id)).map((item) => ({
    ...item,
    q: translate(locale, item.q),
    a: Array.isArray(item.a) ? item.a.map((p) => translate(locale, p)) : translate(locale, item.a),
    ...(item.link && linkAvailable(item.link, locale) ? { link: localizeLink(item.link, locale) } : { link: undefined }),
    ...(item.moreLinks ? { moreLinks: item.moreLinks.filter((l) => linkAvailable(l, locale)).map((l) => localizeLink(l, locale)) } : {}),
    ...(item.links ? { links: item.links.filter((l) => linkAvailable(l, locale)).map((l) => localizeLink(l, locale)) } : {}),
  }))
}

/* Keys that are never text: ids, routes, analytics names, CSS/selector hooks. Everything else that is a string leaf is translated. */
const NON_TEXT_KEYS = new Set(['className', 'style', 'quote', 'id', 'headingId', 'href', 'src', 'track', 'trackPrefix', 'stagePrefix', 'prefix', 'field', 'event', 'external', 'type', 'color', 'accent', 'icon', 'key', 'slug', 'name_en'])
const looksLikeCode = (v) => /^(\/|https?:|mailto:|#|[a-z0-9_-]+$)/.test(v) && !/\s/.test(v)

/* Deep-translates a content/config object: every string leaf that is text goes through the dictionary; ids, URLs and tracking names are left alone.
   `overrides` replaces whole keys (arrays of headline words, sizers ...) that cannot be translated string by string. */
export function localizeConfig(value, locale, overrides = {}, key = '') {
  if (locale === DEFAULT_LOCALE) return value
  if (typeof value === 'string') {
    if (!value.trim() || NON_TEXT_KEYS.has(key) || looksLikeCode(value)) return value // an empty string is not text
    // Figures ("10.7M", "75", "5.28x") change notation only, never value.
    if (/^\d[\d.,]*[KM]?x?\+?$/.test(value)) return localizeStat(locale, value)
    return translate(locale, value)
  }
  if (Array.isArray(value)) return value.map((v) => localizeConfig(v, locale, {}, key))
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    if (value.$$typeof && value.type === T) return value // a <T> element translates itself when it renders: translating its text here as well would look the translation up again
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (Object.prototype.hasOwnProperty.call(overrides, k)) out[k] = overrides[k]
      else if (k === 'href') out[k] = localizeHref(v, locale)
      else out[k] = localizeConfig(v, locale, {}, k)
    }
    return out
  }
  return value // numbers, booleans, null, React elements, functions
}

export const homeFaqFor = (locale) => localizeFaq(HOME_FAQ, locale)
