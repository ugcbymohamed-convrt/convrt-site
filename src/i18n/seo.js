/* Locale-aware head data. Pure (no React, no import of siteSeo.js, so there is no import cycle): src/seo/siteSeo.js calls these.

   • alternatesFor(): the reciprocal hreflang set for a page, shared by the English page and its translations.
   • localizedHead(): the full head parameters of a translated page. */

import { SITE_URL, OG_IMAGE } from '../config.js'
import { LOCALES, LIVE_LOCALES, DEFAULT_LOCALE, isLive } from './locales.js'
import { isReleased } from './release.js'
import { localizedPath } from './paths.js'
import { ES_SEO, ES_OG_IMAGE_ALT, ES_OG_IMAGE_READY, ES_OG_IMAGE_PATH } from './es/seo.js'
import { FR_SEO } from './fr/seo.js'
import { AR_SEO } from './ar/seo.js'

export const SEO_BY_LOCALE = { es: ES_SEO, fr: FR_SEO, ar: AR_SEO }
export const OG_IMAGE_ALT_BY_LOCALE = { es: ES_OG_IMAGE_ALT }

/* Absolute URL of a page in a locale. English '/' stays '/', Spanish home is '/es/'. */
export const absoluteUrl = (locale, basePath) => `${SITE_URL}${localizedPath(locale, basePath)}`

/* The live locales that have a COMPLETE translation of this base path, English first. */
export const liveLocalesFor = (basePath) => LIVE_LOCALES.filter((l) => l === DEFAULT_LOCALE || isReleased(l, basePath))

/* Reciprocal hreflang annotations for a base path: every live translation + English + x-default (English). Empty unless the page is indexable AND has at least
   one live translation, so a page without a translation, an unfinished language or a noindex page never gets hreflang. The SAME array is used for the English
   page and each translation, which is what makes the annotations reciprocal. */
export function alternatesFor(basePath, enEntry) {
  const locales = liveLocalesFor(basePath)
  if (locales.length < 2 || !enEntry?.indexable) return []
  return [
    ...locales.map((l) => ({ hreflang: LOCALES[l].htmlLang, href: absoluteUrl(l, basePath) })),
    { hreflang: 'x-default', href: absoluteUrl(DEFAULT_LOCALE, basePath) },
  ]
}

/* Head parameters for a translated page (the shape useDocumentHead / buildHeadSpec take).
   • canonical = the page's own localized URL (never the English one);
   • indexable only while the locale is live AND the English equivalent is indexable;
   • Spanish copy falls back to nothing: a missing entry throws, so a typo or half-translated page cannot ship. */
export function localizedHead({ basePath, locale, enEntry, jsonLd }) {
  const seo = SEO_BY_LOCALE[locale]?.[basePath]
  if (!seo) throw new Error(`localizedHead: no ${locale} SEO entry for "${basePath}"`)
  const indexable = isLive(locale) && Boolean(enEntry?.indexable) && isReleased(locale, basePath)
  return {
    title: seo.title,
    description: seo.description,
    url: absoluteUrl(locale, basePath),
    image: locale === 'es' && ES_OG_IMAGE_READY ? `${SITE_URL}${ES_OG_IMAGE_PATH}` : OG_IMAGE.url,
    imageAlt: OG_IMAGE_ALT_BY_LOCALE[locale] ?? OG_IMAGE.alt,
    imageWidth: OG_IMAGE.width,
    imageHeight: OG_IMAGE.height,
    ...(seo.ogTitle ? { ogTitle: seo.ogTitle } : {}),
    ...(seo.ogDescription ? { ogDescription: seo.ogDescription } : {}),
    ...(indexable ? {} : { robots: 'noindex, follow' }),
    lang: LOCALES[locale].htmlLang,
    dir: LOCALES[locale].dir,
    ogLocale: LOCALES[locale].ogLocale,
    alternates: isLive(locale) && isReleased(locale, basePath) ? alternatesFor(basePath, enEntry) : [],
    ...(jsonLd ? { jsonLd } : {}),
  }
}
