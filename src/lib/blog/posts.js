/* Runtime access to blog articles. The ONLY file that touches import.meta.glob.

   • Metadata for every article is bundled (small, eager) so the index can list them.
   • An article's Markdown body is a separate lazy chunk, fetched only on /blog/<slug>.
   • The index never contains a hard-coded article list: add a file to src/content/blog/
     and it appears. Drafts never appear in the index; in `npm run dev` a draft can be
     previewed by its direct URL. In production builds drafts are stripped by
     vite-plugin-blog.js, so their content is not in the bundle at all. */

import { selectPublished } from './schema.js'

/* import.meta.glob arguments must be literals, so the pattern is written out twice.
   Files starting with `_` (the template) are excluded. */
const metaModules = import.meta.glob(['/src/content/blog/*.md', '!/src/content/blog/_*.md'], {
  query: '?meta',
  import: 'default',
  eager: true,
})
const bodyModules = import.meta.glob(['/src/content/blog/*.md', '!/src/content/blog/_*.md'], {
  query: '?body',
  import: 'default',
})

const allMeta = Object.values(metaModules).filter((m) => m && m.slug)

export function getPublishedArticles(today) {
  return selectPublished(allMeta, today)
}

/* Published article by slug; in dev also drafts (for previewing before publishing). */
export function getArticleMeta(slug, today) {
  const published = getPublishedArticles(today).find((a) => a.slug === slug)
  if (published) return { meta: published, draft: false }
  if (import.meta.env.DEV) {
    const draft = allMeta.find((a) => a.slug === slug)
    if (draft) return { meta: draft, draft: true }
  }
  return null
}

export function loadArticleBody(slug) {
  const key = Object.keys(bodyModules).find((k) => k.endsWith(`/${slug}.md`))
  return key ? bodyModules[key]() : Promise.resolve(null)
}
