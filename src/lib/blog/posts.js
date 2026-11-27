/* Runtime access to blog articles. The ONLY file that touches import.meta.glob.

   • Metadata for every article is bundled (small, eager) so the index can list them.
   • An article's Markdown body is a separate lazy chunk, fetched only on /blog/<slug>.
   • The index never contains a hard-coded article list: add a file to src/content/blog/
     and it appears. Drafts never appear in the index; in `npm run dev` a draft can be
     previewed by its direct URL. In production builds drafts are stripped by
     vite-plugin-blog.js, so their content is not in the bundle at all. */

import { selectPublished, publishedIn, translationsOf, BLOG_DEFAULT_LOCALE } from './schema.js'

/* import.meta.glob arguments must be literals, so the patterns are written out twice. English articles are src/content/blog/<slug>.md, the other languages
   src/content/blog/<es|fr|ar>/<slug>.md. Files starting with `_` (the template) are excluded. */
const metaModules = import.meta.glob(['/src/content/blog/*.md', '/src/content/blog/es/*.md', '/src/content/blog/fr/*.md', '/src/content/blog/ar/*.md', '!/src/content/blog/**/_*.md'], {
  query: '?meta',
  import: 'default',
  eager: true,
})
const bodyModules = import.meta.glob(['/src/content/blog/*.md', '/src/content/blog/es/*.md', '/src/content/blog/fr/*.md', '/src/content/blog/ar/*.md', '!/src/content/blog/**/_*.md'], {
  query: '?body',
  import: 'default',
})

const allMeta = Object.values(metaModules).filter((m) => m && m.slug)

/* Published articles of one language (English by default), newest first. */
export function getPublishedArticles(today, locale = BLOG_DEFAULT_LOCALE) {
  return publishedIn(allMeta, locale, today)
}

/* Published article by slug in a language; in dev also drafts (for previewing before publishing). */
export function getArticleMeta(slug, today, locale = BLOG_DEFAULT_LOCALE) {
  const published = getPublishedArticles(today, locale).find((a) => a.slug === slug)
  if (published) return { meta: published, draft: false }
  if (import.meta.env.DEV) {
    const draft = allMeta.find((a) => a.slug === slug && (a.locale ?? BLOG_DEFAULT_LOCALE) === locale)
    if (draft) return { meta: draft, draft: true }
  }
  return null
}

/* The genuine published translations of an article (itself included), for hreflang and the language links. Empty when there are fewer than two. */
export const getTranslations = (meta, today) => translationsOf(meta, allMeta, today)

const bodyCache = new Map()
const keyOf = (slug, locale) => `${locale}/${slug}`

/* Already-loaded Markdown body, or null. Lets the article page's FIRST render include the body when it
   was preloaded (prerender and hydration both do this), so server and client markup match. */
export const getLoadedBody = (slug, locale = BLOG_DEFAULT_LOCALE) => bodyCache.get(keyOf(slug, locale)) ?? null

export function loadArticleBody(slug, locale = BLOG_DEFAULT_LOCALE) {
  const suffix = locale === BLOG_DEFAULT_LOCALE ? `/src/content/blog/${slug}.md` : `/src/content/blog/${locale}/${slug}.md`
  const key = Object.keys(bodyModules).find((k) => k === suffix)
  return key ? bodyModules[key]().then((md) => { bodyCache.set(keyOf(slug, locale), md); return md }) : Promise.resolve(null)
}
