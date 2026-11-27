/* Which head a route gets in its static HTML. The same data the page's own useDocumentHead call uses,
   so the pre-rendered head and the post-load head match. Pure: unit-tested. */

import { BLOG_PATH } from '../../config.js'
import { pageHead, canonicalPathFor } from '../../seo/siteSeo.js'
import { articleHead, blogIndexHead, localizedBlogIndexHead } from '../blog/seo.js'
import { translationsOf, BLOG_DEFAULT_LOCALE } from '../blog/schema.js'
import { isPrivatePath, privateHead } from '../../seo/privateSeo.js'
import { parsePath } from '../../i18n/paths.js'
import { withoutAlternates } from '../../caseStudies/head.js'

/* @param {string} path           a path from allRoutePaths()
   @param {object[]} publishedMetas  metadata of PUBLISHED blog articles (see schema.js selectPublished) */
export function headParamsFor(path, publishedMetas = []) {
  if (isPrivatePath(path)) return privateHead(path)
  const { locale, basePath } = parsePath(path)
  const inLocale = (l) => publishedMetas.filter((m) => (m.locale ?? BLOG_DEFAULT_LOCALE) === l)
  // Blog (every language): /blog, /es/blog … and /blog/<slug>, /es/blog/<slug> …
  if (basePath === BLOG_PATH) return locale === BLOG_DEFAULT_LOCALE ? blogIndexHead(inLocale(BLOG_DEFAULT_LOCALE)) : localizedBlogIndexHead(locale, inLocale(locale))
  if (basePath.startsWith(`${BLOG_PATH}/`)) {
    const slug = basePath.slice(BLOG_PATH.length + 1)
    const meta = inLocale(locale).find((m) => m.slug === slug)
    if (!meta) throw new Error(`headParamsFor: no published ${locale} article "${slug}"`)
    return articleHead(meta, translationsOf(meta, publishedMetas)) // hreflang only between genuine published translations
  }
  // Translated pages: /es/pricing → the Spanish head of the English base path /pricing.
  // /es/case-studies and /fr/case-studies are the default study's duplicate: they carry that study's head (canonical = the study), like their English twin.
  const canonical = canonicalPathFor(basePath)
  const head = pageHead(canonical, locale)
  // the duplicate has no hreflang of its own (it is not the canonical page).
  return canonical === basePath ? head : withoutAlternates(head)
}
