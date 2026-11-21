/* Which head a route gets in its static HTML. The same data the page's own useDocumentHead call uses,
   so the pre-rendered head and the post-load head match. Pure: unit-tested. */

import { BLOG_PATH } from '../../config.js'
import { pageHead, canonicalPathFor } from '../../seo/siteSeo.js'
import { articleHead, blogIndexHead } from '../blog/seo.js'
import { isPrivatePath, privateHead } from '../../seo/privateSeo.js'
import { parsePath } from '../../i18n/paths.js'

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
  if (locale !== 'en') return pageHead(basePath, locale)
  // /case-studies renders the default study, so it carries that study's head.
  return pageHead(canonicalPathFor(path))
}
