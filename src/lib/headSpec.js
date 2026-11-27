/* What a page's <head> should contain, as plain data. ONE definition used by both:
   • useDocumentHead (client): upserts these tags after load, and removes them when the page unmounts
   • the prerenderer (build): writes the same tags into each route's static HTML
   so the HTML a crawler reads and the head a browser ends up with are identical by construction.

   Params are the ones useDocumentHead has always taken (see that file). */

import { LOCALES } from '../i18n/locales.js'

/* hreflang code → Open Graph locale ('en' → en_US, 'es' → es_ES, 'fr-FR' → fr_FR, 'ar' → ar_AR). */
const OG_BY_HREFLANG = Object.fromEntries(Object.values(LOCALES).map((l) => [l.htmlLang, l.ogLocale]))

export function buildHeadSpec({ title, description, url, noindex = false, robots, image, imageAlt, imageWidth, imageHeight, type = 'website', jsonLd, ogTitle, ogDescription, lang, dir, ogLocale, alternates }) {
  const metas = [] // { attr: 'name' | 'property', key, content }
  const add = (attr, key, content) => metas.push({ attr, key, content })

  add('name', 'description', description)
  add('property', 'og:title', ogTitle ?? title)
  add('property', 'og:description', ogDescription ?? description)
  add('property', 'og:type', type)
  if (url) add('property', 'og:url', url)
  add('property', 'og:site_name', 'CONVRT')
  // Language metadata exists only on translated pages (and on English pages that HAVE a translation); pages without it are byte-identical to before.
  // A page that HAS a translation states its own language (English included: en_US, what consumers assumed anyway) and lists the other languages it exists in (og:locale:alternate), straight
  // from its hreflang set, so the two can never disagree. Pages without a translation are byte-identical to before.
  const pageLocale = ogLocale ?? (alternates?.length ? OG_BY_HREFLANG[lang ?? 'en'] : undefined)
  if (pageLocale) add('property', 'og:locale', pageLocale)
  for (const a of alternates ?? []) {
    const o = OG_BY_HREFLANG[a.hreflang]
    if (o && o !== pageLocale) add('property', 'og:locale:alternate', o)
  }
  add('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  add('name', 'twitter:title', ogTitle ?? title)
  add('name', 'twitter:description', ogDescription ?? description)
  if (image) {
    add('property', 'og:image', image)
    add('name', 'twitter:image', image)
    if (imageWidth) add('property', 'og:image:width', String(imageWidth))
    if (imageHeight) add('property', 'og:image:height', String(imageHeight))
    if (imageAlt) {
      add('property', 'og:image:alt', imageAlt)
      add('name', 'twitter:image:alt', imageAlt)
    }
  }
  const robotsValue = robots ?? (noindex ? 'noindex' : '')
  if (robotsValue) add('name', 'robots', robotsValue)

  return {
    title,
    metas,
    canonical: url || null,
    jsonLd: jsonLd ? [].concat(jsonLd) : [],
    // Reciprocal hreflang annotations: [{ hreflang, href }], including the page itself and 'x-default'. Empty when the page has no live translation.
    alternates: alternates ? [...alternates] : [],
    // <html lang> and <html dir>. Undefined on pages that keep the shell's defaults (lang="en", no dir).
    lang: lang || null,
    dir: dir || null,
  }
}

/* Marks JSON-LD written into the static HTML, so the client hook can replace (not duplicate) it. */
export const STATIC_JSONLD_ATTR = 'data-blog-jsonld'
export const STATIC_JSONLD_VALUE = 'static'
