/* Vite plugin for the CONVRT Insights blog.

   Articles are Markdown files in src/content/blog/<slug>.md (English) and src/content/blog/<es|fr|ar>/<slug>.md
   (other languages; files starting with `_` are ignored). This plugin turns each into JS modules on demand:

     x.md?meta  → validated metadata only  (the blog index imports these; stays tiny)
     x.md?body  → the Markdown body string (only the article page loads this)

   It also:
   • fails dev/build with a clear message when any article is invalid, so a typo can never
     reach production silently;
   • in production builds, strips drafts completely (their text never ships);
   • emits sitemap-blog.xml containing published articles only. */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeCollection } from './src/lib/blog/content.js'
import { selectPublished, BLOG_LOCALES, BLOG_DEFAULT_LOCALE } from './src/lib/blog/schema.js'
import { buildBlogSitemap } from './src/lib/blog/seo.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
export const CONTENT_DIR = path.join(ROOT, 'src/content/blog')
const PUBLIC_DIR = path.join(ROOT, 'public')

const LOCALE_DIRS = BLOG_LOCALES.filter((l) => l !== BLOG_DEFAULT_LOCALE)

/* English articles are src/content/blog/<slug>.md; another language's are src/content/blog/<locale>/<slug>.md (es, fr, ar). */
export function readBlogFiles(dir = CONTENT_DIR) {
  const read = (folder, locale) => {
    if (!fs.existsSync(folder)) return []
    return fs
      .readdirSync(folder)
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .sort()
      .map((f) => ({ filename: f.slice(0, -3), locale, source: fs.readFileSync(path.join(folder, f), 'utf8') }))
  }
  return [...read(dir, BLOG_DEFAULT_LOCALE), ...LOCALE_DIRS.flatMap((l) => read(path.join(dir, l), l))]
}

export const publicFileExists = (p) => fs.existsSync(path.join(PUBLIC_DIR, p.split(/[?#]/)[0]))

export function loadBlogContent(dir = CONTENT_DIR) {
  return analyzeCollection(readBlogFiles(dir), { fileExists: publicFileExists })
}

export default function blogContent() {
  let isBuild = false
  const cache = { stamp: 0, result: null }

  /* Re-analyse only when some article file changed (cheap mtime check). */
  const current = () => {
    const folders = [CONTENT_DIR, ...LOCALE_DIRS.map((l) => path.join(CONTENT_DIR, l))].filter((d) => fs.existsSync(d))
    const files = folders.flatMap((d) => fs.readdirSync(d).map((f) => path.join(d, f)))
    const stamp = files.reduce((n, f) => n + fs.statSync(f).mtimeMs, files.length)
    if (cache.result && cache.stamp === stamp) return cache.result
    cache.stamp = stamp
    cache.result = loadBlogContent()
    return cache.result
  }

  return {
    name: 'convrt-blog-content',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    buildStart() {
      if (!isBuild) return
      const { problems } = current()
      if (problems.length) this.error(`Blog content is invalid:\n  - ${problems.join('\n  - ')}`)
    },
    load(id) {
      const [file, query = ''] = id.split('?')
      if (!file.startsWith(CONTENT_DIR + path.sep) || !file.endsWith('.md')) return null
      if (path.basename(file).startsWith('_')) return null
      this.addWatchFile(file)

      const filename = path.basename(file, '.md')
      const parent = path.basename(path.dirname(file))
      const locale = LOCALE_DIRS.includes(parent) && path.dirname(file) === path.join(CONTENT_DIR, parent) ? parent : BLOG_DEFAULT_LOCALE
      const shown = locale === BLOG_DEFAULT_LOCALE ? filename : `${locale}/${filename}`
      const { analyzed, problems } = current()
      const mine = analyzed.find((a) => a.filename === filename && a.locale === locale)
      const own = problems.filter((p) => p.startsWith(`${shown}.md:`) || p.startsWith(`${shown}:`))
      if (!mine || !mine.meta) this.error(`${shown}.md: ${own.join('; ') || 'could not be read'}`)
      if (own.length) this.error(`${shown}.md is invalid:\n  - ${own.join('\n  - ')}`)

      const stripDraft = isBuild && mine.meta.status !== 'published'
      if (query.includes('meta')) {
        return `export default ${JSON.stringify(stripDraft ? { status: 'draft' } : mine.meta)}`
      }
      if (query.includes('body')) {
        return `export default ${JSON.stringify(stripDraft ? '' : mine.body)}`
      }
      this.error(`${filename}.md must be imported with ?meta or ?body`)
    },
    generateBundle() {
      const { analyzed } = current()
      const metas = analyzed.map((a) => a.meta).filter(Boolean)
      this.emitFile({ type: 'asset', fileName: 'sitemap-blog.xml', source: buildBlogSitemap(selectPublished(metas), { allMetas: metas }) })
    },
  }
}
