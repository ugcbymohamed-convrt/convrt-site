/* Main sitemap (sitemap.xml). Pure functions, unit-tested in tests/seo.test.mjs.

   The page list comes from the SEO manifest (src/seo/siteSeo.js), so the sitemap can never list a
   noindex page or a duplicate URL: a page appears only when it is indexable AND its own canonical.
   Pages behind an `*_INDEXABLE` flag join automatically when the flag flips to `true`.

   • Blog articles (and /blog once indexable) live in sitemap-blog.xml, referenced from robots.txt.
   • No <lastmod>: the repo has no reliable per-page modified dates, and a wrong date is worse
     than none. */

import { SITE_URL } from '../../config.js'
import { SITE_SEO, canonicalPathFor, sitemapRoutes } from '../../seo/siteSeo.js'

export const SITEMAP_ENTRIES = Object.entries(SITE_SEO)
  .filter(([path]) => canonicalPathFor(path) === path)
  .map(([path, e]) => ({ path, indexable: e.indexable }))

export const sitemapPaths = (entries) =>
  entries ? entries.filter((e) => e.indexable).map((e) => e.path) : sitemapRoutes()

export function buildSitemap(paths = sitemapPaths(), siteUrl = SITE_URL) {
  const body = paths.map((p) => `  <url><loc>${siteUrl}${p === '/' ? '/' : p}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}
