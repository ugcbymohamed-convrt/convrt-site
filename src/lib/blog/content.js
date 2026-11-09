/* Validates article source files. Pure (no fs): the Vite plugin and tests pass file
   contents in, so the same rules guard `npm run dev`, `npm run build` and `node --test`. */

import { parseFrontmatter, FrontmatterError } from './frontmatter.js'
import { parseMarkdown, MarkdownError } from './markdown.js'
import { validateFrontmatter, validateCollection } from './schema.js'

function walk(blocks, visit) {
  for (const b of blocks) {
    visit(b)
    if (b.children) walk(b.children, visit)
  }
}

function inlineLinks(nodes, out) {
  for (const n of nodes) {
    if (n.t === 'link') out.push(n.href)
    if (n.c) inlineLinks(n.c, out)
  }
}

/* Every link href and local media path used by a parsed body. */
export function collectReferences(blocks) {
  const links = []
  const media = []
  walk(blocks, (b) => {
    if (b.inline) inlineLinks(b.inline, links)
    if (b.type === 'list') b.items.forEach((it) => inlineLinks(it, links))
    if (b.type === 'table') [b.header, ...b.rows].flat().forEach((c) => inlineLinks(c, links))
    if (b.type === 'image') media.push(b.src)
    if (b.type === 'video') { media.push(b.src); if (b.poster) media.push(b.poster) }
  })
  return { links, media }
}

export function analyzeArticle(source, filename) {
  const errors = []
  let parsed
  try {
    parsed = parseFrontmatter(source)
  } catch (e) {
    if (e instanceof FrontmatterError) return { errors: [e.message], meta: null, body: '', blocks: [] }
    throw e
  }
  const { errors: fmErrors, meta } = validateFrontmatter(parsed.data, filename)
  errors.push(...fmErrors)

  let blocks = []
  try {
    blocks = parseMarkdown(parsed.body).blocks
  } catch (e) {
    if (e instanceof MarkdownError) errors.push(e.message)
    else throw e
  }
  if (meta.status === 'published' && parsed.body.trim().length < 1) {
    errors.push('a published article needs a body')
  }
  return { errors, meta, body: parsed.body, blocks }
}

/* files: [{ filename: 'my-article', source: '---\n…' }]
   fileExists(publicPath): optional, checks local media under /public. */
export function analyzeCollection(files, { fileExists } = {}) {
  const analyzed = files.map((f) => ({ ...f, ...analyzeArticle(f.source, f.filename) }))
  const problems = []
  for (const a of analyzed) for (const e of a.errors) problems.push(`${a.filename}.md: ${e}`)

  const metas = analyzed.map((a) => a.meta).filter(Boolean)
  for (const e of validateCollection(metas)) problems.push(e)

  const slugs = new Set(metas.map((m) => m.slug))
  for (const a of analyzed) {
    if (!a.meta) continue
    const { links, media } = collectReferences(a.blocks)
    for (const href of links) {
      if (href === null) problems.push(`${a.filename}.md: a link has an unsupported URL (use /path, #anchor, https:// or mailto:)`)
      else if (/^\/blog\/[^/#?]+/.test(href) && !slugs.has(href.split(/[/#?]/)[2])) {
        problems.push(`${a.filename}.md: internal link ${href} points to an article that does not exist`)
      }
    }
    if (fileExists) {
      const local = [a.meta.image, a.meta.ogImage, ...media].filter((p) => p && p.startsWith('/'))
      for (const p of local) {
        if (!fileExists(p)) problems.push(`${a.filename}.md: file ${p} was not found in /public`)
      }
    }
  }
  return { analyzed, problems }
}
