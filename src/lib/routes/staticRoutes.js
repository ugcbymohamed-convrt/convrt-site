/* Pure helpers for the build step that makes unknown URLs return a real HTTP 404
   (see vite-plugin-static-routes.js). Unit-tested in tests/routes.test.mjs. */

import { KNOWN_PATHS, PRIVATE_PATH_LIST } from '../../routes.js'
import { BLOG_PATH } from '../../config.js'
import { allLocalizedPaths } from '../../i18n/paths.js'
import { BUILT_LOCALES } from '../../i18n/locales.js'
import { articlePath, BLOG_DEFAULT_LOCALE } from '../blog/schema.js'

/* '/pricing' → 'pricing/index.html'; '/' → 'index.html'; '/es/' → 'es/index.html'. */
export const routeFile = (path) => (path === '/' ? 'index.html' : `${path.replace(/^\/|\/$/g, '')}/index.html`)

/* Every URL path that must answer 200: the fixed pages, one per published blog article, and the blog index of every language that has a published article.
   `published` = the metadata of the published articles ({ slug, locale }); a plain string is an English slug (kept for older callers). A language without a published article gets no blog route at all,
   so an empty blog page can never be built, indexed or listed (the Arabic index is the one exception: it already exists as a noindex masthead). */
export function allRoutePaths(published = []) {
  const items = published.map((p) => (typeof p === 'string' ? { slug: p, locale: BLOG_DEFAULT_LOCALE } : p))
  const articles = items.map((m) => articlePath(m.slug, m.locale ?? BLOG_DEFAULT_LOCALE))
  const indexes = items.filter((m) => (m.locale ?? BLOG_DEFAULT_LOCALE) !== BLOG_DEFAULT_LOCALE).map((m) => `/${m.locale}${BLOG_PATH}`)
  return [...new Set([...KNOWN_PATHS, ...allLocalizedPaths(BUILT_LOCALES.filter((l) => l !== 'en')), ...PRIVATE_PATH_LIST, ...indexes, ...articles])]
}

/* 404.html = the app shell with its head adjusted for "page not found". The shell still boots the
   React app, which sees the unknown path and renders NotFoundPage, so people get the branded page
   while crawlers and browsers get the 404 status. */
export function notFoundHtml(indexHtml) {
  const title = 'Page not found | CONVRT'
  let html = indexHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    '<meta name="description" content="This page could not be found." />\n    <meta name="robots" content="noindex, follow" />',
  )
  if (!html.includes('name="robots"')) throw new Error('notFoundHtml: could not inject robots meta (index.html changed shape?)')
  return html
}
