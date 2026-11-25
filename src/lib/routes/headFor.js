/* Which head a route gets in its static HTML. The same data the page's own useDocumentHead call uses,
   so the pre-rendered head and the post-load head match. Pure: unit-tested. */

import { BLOG_PATH } from '../../config.js'
import { pageHead, canonicalPathFor } from '../../seo/siteSeo.js'
import { articleHead, blogIndexHead, arabicBlogHead } from '../blog/seo.js'
import { AR_ARTICLES } from '../../content/blogAr.js'
import { isPrivatePath, privateHead } from '../../seo/privateSeo.js'
import { parsePath } from '../../i18n/paths.js'
import { withoutAlternates } from '../../caseStudies/head.js'

/* @param {string} path           a path from allRoutePaths()
   @param {object[]} publishedMetas  metadata of PUBLISHED blog articles (see schema.js selectPublished) */
export function headParamsFor(path, publishedMetas = []) {
  if (isPrivatePath(path)) return privateHead(path)
  if (path === BLOG_PATH) return blogIndexHead(publishedMetas)
  if (path.startsWith(`${BLOG_PATH}/`)) {
    const slug = path.slice(BLOG_PATH.length + 1)
    const meta = publishedMetas.find((m) => m.slug === slug)
    if (!meta) throw new Error(`headParamsFor: no published article "${slug}"`)
    return articleHead(meta)
  }
  // Translated pages: /es/pricing → the Spanish head of the English base path /pricing.
  const { locale, basePath } = parsePath(path)
  if (locale === 'ar' && basePath === BLOG_PATH) return arabicBlogHead(AR_ARTICLES)
  // /es/case-studies and /fr/case-studies are the default study's duplicate: they carry that study's head (canonical = the study), like their English twin.
  const canonical = canonicalPathFor(basePath)
  const head = pageHead(canonical, locale)
  // the duplicate has no hreflang of its own (it is not the canonical page).
  return canonical === basePath ? head : withoutAlternates(head)
}
