/* Pure helpers for the build step that makes unknown URLs return a real HTTP 404
   (see vite-plugin-static-routes.js). Unit-tested in tests/routes.test.mjs. */

import { KNOWN_PATHS, PRIVATE_PATH_LIST } from '../../routes.js'
import { BLOG_PATH } from '../../config.js'
import { allLocalizedPaths } from '../../i18n/paths.js'
import { BUILT_LOCALES } from '../../i18n/locales.js'

/* '/pricing' → 'pricing/index.html'; '/' → 'index.html'; '/es/' → 'es/index.html'. */
export const routeFile = (path) => (path === '/' ? 'index.html' : `${path.replace(/^\/|\/$/g, '')}/index.html`)

/* Every URL path that must answer 200: the fixed pages plus one per published blog article. */
export const allRoutePaths = (publishedSlugs = []) => [...KNOWN_PATHS, ...allLocalizedPaths(BUILT_LOCALES.filter((l) => l !== 'en')), ...PRIVATE_PATH_LIST, ...publishedSlugs.map((s) => `${BLOG_PATH}/${s}`)]

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
