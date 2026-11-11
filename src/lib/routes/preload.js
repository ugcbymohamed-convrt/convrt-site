/* Work that must be finished BEFORE a route renders (server) or hydrates (browser), so both produce
   the same first render. Today: a blog article's Markdown body, which is otherwise loaded in an effect. */

export async function preloadForPath(pathname) {
  const m = pathname.replace(/\/$/, '').match(/^\/blog\/([^/]+)$/)
  if (!m) return
  const { loadArticleBody } = await import('../blog/posts.js')
  await loadArticleBody(m[1])
}
