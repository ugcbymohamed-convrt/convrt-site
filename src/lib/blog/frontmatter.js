/* Minimal YAML-subset frontmatter parser for blog articles — no dependency.

   An article file is:

     ---
     key: value
     list:
       - item
     faq:
       - q: Question?
         a: Answer.
     ---
     Markdown body…

   Supported values: plain / "double-quoted" / 'single-quoted' strings, true / false,
   null, inline arrays [a, b], block lists of scalars, block lists of one-level maps,
   and folded/literal blocks (`key: >-` / `key: |`). Anything else throws with the
   line number, so a typo fails the build instead of silently publishing wrong data.
   Quote any value that contains `#` or starts with a quote/bracket. */

const KEY_RE = /^([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.*)|\s*)$/

export class FrontmatterError extends Error {}

function scalar(raw, line) {
  const v = raw.trim()
  if (v === '') return ''
  if (v === 'true') return true
  if (v === 'false') return false
  if (v === 'null' || v === '~') return null
  if (v.startsWith('"')) {
    if (v.length < 2 || !v.endsWith('"')) throw new FrontmatterError(`line ${line}: unterminated double-quoted string`)
    try {
      return JSON.parse(v)
    } catch {
      throw new FrontmatterError(`line ${line}: invalid escape in double-quoted string`)
    }
  }
  if (v.startsWith("'")) {
    if (v.length < 2 || !v.endsWith("'")) throw new FrontmatterError(`line ${line}: unterminated single-quoted string`)
    return v.slice(1, -1).replace(/''/g, "'")
  }
  if (v.startsWith('[')) {
    if (!v.endsWith(']')) throw new FrontmatterError(`line ${line}: unterminated inline array`)
    const inner = v.slice(1, -1).trim()
    if (!inner) return []
    const items = []
    let cur = ''
    let quote = null
    for (const ch of inner) {
      if (quote) {
        cur += ch
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'") {
        quote = ch
        cur += ch
      } else if (ch === ',') {
        items.push(cur)
        cur = ''
      } else cur += ch
    }
    items.push(cur)
    return items.map((s) => scalar(s, line))
  }
  return v
}

const indentOf = (s) => s.length - s.trimStart().length

/* Collect the indented lines that follow a `key: >-` / `key: |` header. */
function block(lines, start, parentIndent, style) {
  const out = []
  let i = start
  while (i < lines.length && (lines[i].trim() === '' || indentOf(lines[i]) > parentIndent)) {
    out.push(lines[i])
    i++
  }
  while (out.length && out[out.length - 1].trim() === '') out.pop()
  const base = Math.min(...out.filter((l) => l.trim()).map(indentOf), Infinity)
  const text = out.map((l) => (l.trim() === '' ? '' : l.slice(base)))
  const joined = style.startsWith('>') ? text.join('\n').replace(/([^\n])\n(?!\n)/g, '$1 ').replace(/\n\n/g, '\n') : text.join('\n')
  return { value: joined, next: i }
}

export function parseFrontmatter(source) {
  const text = source.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  if (!text.startsWith('---\n')) {
    throw new FrontmatterError('file must start with a `---` frontmatter block')
  }
  const end = text.indexOf('\n---', 4)
  if (end === -1) throw new FrontmatterError('frontmatter block is not closed with `---`')
  const afterFence = text.indexOf('\n', end + 1)
  const body = afterFence === -1 ? '' : text.slice(afterFence + 1)
  const lines = text.slice(4, end).split('\n')
  const data = {}

  let i = 0
  const lineNo = (idx) => idx + 2 // +1 for 1-based, +1 for the opening fence
  while (i < lines.length) {
    const raw = lines[i]
    if (raw.trim() === '' || raw.trim().startsWith('#')) { i++; continue }
    if (indentOf(raw) !== 0) throw new FrontmatterError(`line ${lineNo(i)}: unexpected indentation`)
    const m = KEY_RE.exec(raw)
    if (!m) throw new FrontmatterError(`line ${lineNo(i)}: expected "key: value"`)
    const key = m[1]
    const rest = m[2] ?? ''
    if (key in data) throw new FrontmatterError(`line ${lineNo(i)}: duplicate key "${key}"`)

    if (/^[>|][+-]?$/.test(rest.trim())) {
      const { value, next } = block(lines, i + 1, 0, rest.trim())
      data[key] = value
      i = next
      continue
    }
    if (rest.trim() !== '') {
      data[key] = scalar(rest, lineNo(i))
      i++
      continue
    }

    // Empty value: a block list follows (or the value is empty).
    i++
    const items = []
    while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#') || indentOf(lines[i]) > 0)) {
      const li = lines[i]
      if (li.trim() === '' || li.trim().startsWith('#')) { i++; continue }
      const t = li.trim()
      if (!t.startsWith('- ') && t !== '-') throw new FrontmatterError(`line ${lineNo(i)}: expected a "- " list item`)
      const itemIndent = indentOf(li)
      const content = t === '-' ? '' : t.slice(2)
      const mapMatch = KEY_RE.exec(content)
      if (mapMatch && !content.startsWith('"') && !content.startsWith("'")) {
        const obj = {}
        const addPair = (k, v, ln, idx) => {
          if (/^[>|][+-]?$/.test(v.trim())) {
            const b = block(lines, idx + 1, itemIndent + 1, v.trim())
            obj[k] = b.value
            return b.next
          }
          obj[k] = scalar(v, ln)
          return idx + 1
        }
        i = addPair(mapMatch[1], mapMatch[2] ?? '', lineNo(i), i)
        while (i < lines.length && lines[i].trim() !== '' && indentOf(lines[i]) > itemIndent && !lines[i].trim().startsWith('- ')) {
          const pm = KEY_RE.exec(lines[i].trim())
          if (!pm) throw new FrontmatterError(`line ${lineNo(i)}: expected "key: value"`)
          i = addPair(pm[1], pm[2] ?? '', lineNo(i), i)
        }
        items.push(obj)
      } else {
        items.push(scalar(content, lineNo(i)))
        i++
      }
    }
    data[key] = items.length ? items : ''
  }
  return { data, body }
}
