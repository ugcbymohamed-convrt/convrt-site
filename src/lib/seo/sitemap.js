/* Main sitemap (sitemap.xml). Pure functions, unit-tested in tests/seo.test.mjs.

   • Always-indexable pages are listed here. `/case-studies` is deliberately NOT listed: it
     renders the same default study as `/case-studies/graspo` (a duplicate). Which URL should
     be canonical is a pending decision (SEO phase 2).
   • Pages behind an `*_INDEXABLE` flag in config.js join the sitemap automatically the moment
     the flag is flipped to `true`, so the sitemap can never list a noindex page.
   • Blog articles (and /blog once indexable) live in sitemap-blog.xml, referenced from robots.txt.
   • No <lastmod>: the repo has no reliable per-page modified dates, and a wrong date is worse
     than none. */

import {
  SITE_URL, OFFER_PATHS, REFERRALS_PATH,
  ROADMAP_INDEXABLE, FREE_HOOKS_INDEXABLE, RISK_FREE_INDEXABLE, REFERRALS_INDEXABLE,
} from '../../config.js'

export const SITEMAP_ENTRIES = [
  { path: '/', indexable: true },
  { path: '/pricing', indexable: true },
  { path: '/case-studies/graspo', indexable: true },
  { path: '/case-studies/elyon', indexable: true },
  { path: OFFER_PATHS.roadmap, indexable: ROADMAP_INDEXABLE },
  { path: OFFER_PATHS.hooks, indexable: FREE_HOOKS_INDEXABLE },
  { path: OFFER_PATHS.riskFree, indexable: RISK_FREE_INDEXABLE },
  { path: REFERRALS_PATH, indexable: REFERRALS_INDEXABLE },
]

export const sitemapPaths = (entries = SITEMAP_ENTRIES) => entries.filter((e) => e.indexable).map((e) => e.path)

export function buildSitemap(paths = sitemapPaths(), siteUrl = SITE_URL) {
  const body = paths.map((p) => `  <url><loc>${siteUrl}${p === '/' ? '/' : p}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}
