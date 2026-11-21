/* Main sitemap (sitemap.xml). Pure functions, unit-tested in tests/seo.test.mjs.

   The page list comes from the SEO manifest (src/seo/siteSeo.js), so the sitemap can never list a
   noindex page or a duplicate URL: a page appears only when it is indexable AND its own canonical.
   Pages behind an `*_INDEXABLE` flag join automatically when the flag flips to `true`.

   • Blog articles (and /blog once indexable) live in sitemap-blog.xml, referenced from robots.txt.
   • No <lastmod>: the repo has no reliable per-page modified dates, and a wrong date is worse
     than none. */

import { SITE_URL } from '../../config.js'
import { SITE_SEO, canonicalPathFor, sitemapRoutes } from '../../seo/siteSeo.js'
import { LIVE_LOCALES, DEFAULT_LOCALE } from '../../i18n/locales.js'
import { TRANSLATED_PATHS } from '../../i18n/registry.js'
import { isReleased } from '../../i18n/release.js'
import { localizedPath } from '../../i18n/paths.js'

export const SITEMAP_ENTRIES = Object.entries(SITE_SEO)
  .filter(([path]) => canonicalPathFor(path) === path)
  .map(([path, e]) => ({ path, indexable: e.indexable }))

/* Translated pages: only locales that are 'live', only pages with a complete translation, and only while the English equivalent is indexable
   (a translation is never promoted when its source is not). Each is its own canonical URL: /es/, /es/pricing, ... */
export const localizedSitemapPaths = () =>
  LIVE_LOCALES.filter((l) => l !== DEFAULT_LOCALE).flatMap((l) =>
    (TRANSLATED_PATHS[l] ?? []).filter((bp) => SITE_SEO[bp]?.indexable && canonicalPathFor(bp) === bp && isReleased(l, bp)).map((bp) => localizedPath(l, bp)))

export const sitemapPaths = (entries) =>
  entries ? entries.filter((e) => e.indexable).map((e) => e.path) : [...sitemapRoutes(), ...localizedSitemapPaths()]

export function buildSitemap(paths = sitemapPaths(), siteUrl = SITE_URL) {
  const body = paths.map((p) => `  <url><loc>${siteUrl}${p === '/' ? '/' : p}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}
