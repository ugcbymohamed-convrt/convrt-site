/* Small Markdown → AST parser for blog articles (no dependency, no raw HTML).

   The AST is rendered by components/blog/ArticleBody.jsx as React elements, so article
   text can never inject markup or scripts.

   Supported blocks
     ## H2 / ### H3 (a body `# H1` is an error: the article title is the H1)
     paragraphs, - / * bullet lists, 1. numbered lists, > blockquotes, ``` code ```,
     --- rules, | pipe | tables |, standalone images:
       ![alt text](/blog/slug/pic.webp "Optional caption"){width=1200 height=675}
     :::callout Optional title          ← highlighted note; body is normal Markdown
     Text…
     :::
     ::video{src="/blog/slug/clip.mp4" poster="/blog/slug/poster.webp" title="…" caption="…"}
     ::youtube{id="VIDEO_ID" title="…" caption="…"}
   Inline: **bold**, *italic*, `code`, [text](url "title"). */

export class MarkdownError extends Error {}

export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

/* Only these URL shapes are ever turned into href/src. Everything else is dropped. */
export function safeUrl(url) {
  const u = String(url).trim()
  if (/^(https?:\/\/|mailto:)/i.test(u)) return u
  if (u.startsWith('/') && !u.startsWith('//')) return u
  if (u.startsWith('#')) return u
  return null
}

/* ---------- inline ---------- */

export function parseInline(text) {
  const out = []
  let buf = ''
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = '' } }
  let i = 0
  while (i < text.length) {
    const ch = text[i]

    if (ch === '\\' && i + 1 < text.length && /[\\`*_{}[\]()#+\-.!|>~]/.test(text[i + 1])) {
      buf += text[i + 1]
      i += 2
      continue
    }

    if (ch === '`') {
      const end = text.indexOf('`', i + 1)
      if (end > i) {
        flush()
        out.push({ t: 'code', v: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    if (ch === '*' || ch === '_') {
      const double = text.startsWith(ch + ch, i)
      const mark = double ? ch + ch : ch
      const prev = text[i - 1]
      const canOpen = ch === '*' || !prev || /[^A-Za-z0-9]/.test(prev)
      const after = text[i + mark.length]
      if (canOpen && after && !/\s/.test(after)) {
        let end = i + mark.length
        let found = -1
        while ((end = text.indexOf(mark, end)) !== -1) {
          const before = text[end - 1]
          const next = text[end + mark.length]
          const closes = !/\s/.test(before) && (ch === '*' || !next || /[^A-Za-z0-9]/.test(next))
          if (closes && end > i + mark.length) { found = end; break }
          end += mark.length
        }
        if (found !== -1) {
          flush()
          out.push({ t: double ? 'strong' : 'em', c: parseInline(text.slice(i + mark.length, found)) })
          i = found + mark.length
          continue
        }
      }
    }

    if (ch === '[') {
      const close = findClosingBracket(text, i)
      if (close !== -1 && text[close + 1] === '(') {
        const parenEnd = findClosingParen(text, close + 1)
        if (parenEnd !== -1) {
          const label = text.slice(i + 1, close)
          const target = text.slice(close + 2, parenEnd).trim()
          const m = /^(\S+?)(?:\s+"([^"]*)")?$/.exec(target)
          if (m && label) {
            flush()
            out.push({ t: 'link', href: safeUrl(m[1]), title: m[2], c: parseInline(label) })
            i = parenEnd + 1
            continue
          }
        }
      }
    }

    buf += ch
    i++
  }
  flush()
  return out
}

function findClosingBracket(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '\\') { i++; continue }
    if (text[i] === '[') depth++
    else if (text[i] === ']' && --depth === 0) return i
  }
  return -1
}

function findClosingParen(text, open) {
  let depth = 0
  let quoted = false
  for (let i = open; i < text.length; i++) {
    const c = text[i]
    if (c === '"') quoted = !quoted
    if (quoted) continue
    if (c === '(') depth++
    else if (c === ')' && --depth === 0) return i
  }
  return -1
}

export const inlineText = (nodes) =>
  nodes.map((n) => (n.t === 'text' || n.t === 'code' ? n.v : inlineText(n.c ?? []))).join('')

/* ---------- block ---------- */

const ATTR_RE = /([A-Za-z][\w-]*)="([^"]*)"/g
const parseAttrs = (s) => {
  const attrs = {}
  for (const m of s.matchAll(ATTR_RE)) attrs[m[1]] = m[2]
  return attrs
}

const isTableDivider = (l) => l.includes('-') && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(l)
const splitRow = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'))

const BLOCK_START = /^(#{1,6}\s|>|```|:::|::(video|youtube)\{|---+\s*$|\s*([-*]|\d+\.)\s+|!\[)/

export function parseMarkdown(source) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const ids = new Map()
  const uniqueId = (text) => {
    const base = slugifyHeading(text)
    const n = (ids.get(base) ?? 0) + 1
    ids.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }

  const parse = (ls, offset = 0) => {
    const blocks = []
    let i = 0
    const fail = (msg, at = i) => { throw new MarkdownError(`body line ${at + 1 + offset}: ${msg}`) }

    while (i < ls.length) {
      const line = ls[i]
      if (line.trim() === '') { i++; continue }

      // fenced code
      const fence = /^```\s*([\w-]*)\s*$/.exec(line)
      if (fence) {
        const start = i
        const buf = []
        i++
        while (i < ls.length && !/^```\s*$/.test(ls[i])) buf.push(ls[i++])
        if (i >= ls.length) fail('code block is not closed with ```', start)
        i++
        blocks.push({ type: 'code', lang: fence[1], text: buf.join('\n') })
        continue
      }

      // headings
      const h = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
      if (h) {
        const level = h[1].length
        if (level === 1) fail('use ## for sections: the article title is the page H1')
        if (level > 3) fail('use only ## and ### headings')
        const inline = parseInline(h[2])
        blocks.push({ type: 'heading', level, id: uniqueId(inlineText(inline)), inline })
        i++
        continue
      }

      if (/^---+\s*$/.test(line)) { blocks.push({ type: 'hr' }); i++; continue }

      // callout
      const callout = /^:::callout(?:\s+(.*))?$/.exec(line.trim())
      if (callout) {
        const start = i
        const inner = []
        i++
        while (i < ls.length && ls[i].trim() !== ':::') inner.push(ls[i++])
        if (i >= ls.length) fail('callout is not closed with :::', start)
        i++
        blocks.push({
          type: 'callout',
          title: callout[1]?.trim() || '',
          children: parse(inner, offset + start + 1),
        })
        continue
      }
      if (line.startsWith(':::')) fail(`unknown or stray "${line.trim()}" (use :::callout … :::)`)

      // video / youtube embeds
      const embed = /^::(video|youtube)\{(.*)\}\s*$/.exec(line.trim())
      if (embed) {
        const a = parseAttrs(embed[2])
        if (!a.title) fail(`::${embed[1]} needs a title="…" (used for accessibility)`)
        if (embed[1] === 'video') {
          const src = a.src && safeUrl(a.src)
          if (!src) fail('::video needs src="/path.mp4" or an https:// URL')
          blocks.push({ type: 'video', src, poster: a.poster && safeUrl(a.poster), title: a.title, caption: a.caption })
        } else {
          if (!/^[\w-]{6,20}$/.test(a.id ?? '')) fail('::youtube needs id="VIDEO_ID"')
          blocks.push({ type: 'youtube', id: a.id, title: a.title, caption: a.caption })
        }
        i++
        continue
      }

      // standalone image
      const img = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(?:\{([^}]*)\})?\s*$/.exec(line.trim())
      if (img) {
        const src = safeUrl(img[2])
        if (!src) fail(`image URL "${img[2]}" is not allowed`)
        if (!img[1].trim()) fail('every image needs alt text: ![describe the image](…)')
        const dims = Object.fromEntries([...(img[4] ?? '').matchAll(/(width|height)=(\d+)/g)].map((m) => [m[1], Number(m[2])]))
        blocks.push({ type: 'image', alt: img[1].trim(), src, caption: img[3], ...dims })
        i++
        continue
      }

      // blockquote
      if (line.startsWith('>')) {
        const start = i
        const inner = []
        while (i < ls.length && ls[i].startsWith('>')) inner.push(ls[i++].replace(/^>\s?/, ''))
        blocks.push({ type: 'blockquote', children: parse(inner, offset + start) })
        continue
      }

      // table
      if (line.includes('|') && i + 1 < ls.length && isTableDivider(ls[i + 1])) {
        const header = splitRow(line)
        const aligns = splitRow(ls[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left'))
        i += 2
        const rows = []
        while (i < ls.length && ls[i].trim() !== '' && ls[i].includes('|')) rows.push(splitRow(ls[i++]))
        blocks.push({
          type: 'table',
          aligns,
          header: header.map(parseInline),
          rows: rows.map((r) => header.map((_, c) => parseInline(r[c] ?? ''))),
        })
        continue
      }

      // lists
      const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line)
      if (li) {
        const ordered = /\d/.test(li[2])
        const items = []
        while (i < ls.length) {
          const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(ls[i])
          if (m && /\d/.test(m[2]) === ordered) {
            items.push([m[3]])
            i++
          } else if (ls[i].trim() !== '' && /^\s{2,}\S/.test(ls[i]) && items.length) {
            items[items.length - 1].push(ls[i].trim())
            i++
          } else break
        }
        blocks.push({ type: 'list', ordered, items: items.map((it) => parseInline(it.join(' '))) })
        continue
      }

      // paragraph
      const buf = [line.trim()]
      i++
      while (i < ls.length && ls[i].trim() !== '' && !BLOCK_START.test(ls[i]) && !(ls[i].includes('|') && ls[i + 1] && isTableDivider(ls[i + 1]))) {
        buf.push(ls[i++].trim())
      }
      blocks.push({ type: 'paragraph', inline: parseInline(buf.join(' ')) })
    }
    return blocks
  }

  const blocks = parse(lines)
  const toc = []
  const walk = (bs) => bs.forEach((b) => {
    if (b.type === 'heading') toc.push({ id: b.id, level: b.level, text: inlineText(b.inline) })
    if (b.children) walk(b.children)
  })
  walk(blocks)
  return { blocks, toc }
}
