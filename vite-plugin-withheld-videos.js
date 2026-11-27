/* Build step: keeps WITHHELD portfolio videos out of everything the public build ships.

   Which entries: those of src/content/portfolio.js that no page may show, decided from the source text itself (never a hand-kept list):
     • approval.status is anything other than 'approved' (an on-hold video, e.g. waiting for a display authorization),
     • `unlisted: true` (kept in the data, shown nowhere),
     • a `review` hold.
   What is removed from the PUBLIC build (the source records stay exactly as they are, so nothing is lost and the owner can release a video by editing one field):
     • the entry itself (its id, title, creator id, Cloudflare Stream id and poster path) from the client JavaScript;
     • its frame line in src/content/posterFrames.js;
     • its same-origin poster image (dist/portfolio/<name>) from the output folder.
   Tests and the static-route renderer read the real sources; no page ever rendered these entries, so the prerendered HTML is unaffected.
   After the build, a check fails the build if any withheld Stream id, id or poster name is still in a shipped JavaScript, HTML, XML or JSON file. */

import fs from 'node:fs'
import path from 'node:path'

const PORTFOLIO = 'src/content/portfolio.js'
const POSTER_FRAMES = 'src/content/posterFrames.js'

const prop = (obj, name) => obj.properties.find((p) => p.type === 'Property' && !p.computed && (p.key.name === name || p.key.value === name))
const literal = (n) => (n && n.type === 'Literal' ? n.value : undefined)

/* The withheld entries of a portfolio source, read from its syntax tree. */
export function findWithheld(code, parse) {
  const ast = parse(code)
  const found = []
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return
    if (node.type === 'VariableDeclarator' && node.id?.name === 'PORTFOLIO_ENTRIES' && node.init?.type === 'ArrayExpression') {
      for (const el of node.init.elements) {
        if (el?.type !== 'ObjectExpression') continue
        const approval = prop(el, 'approval')?.value
        const status = approval?.type === 'ObjectExpression' ? literal(prop(approval, 'status')?.value) : undefined
        const unlisted = literal(prop(el, 'unlisted')?.value) === true
        const review = prop(el, 'review') !== undefined
        const onHold = status !== undefined && status !== 'approved'
        if (!(onHold || unlisted || review)) continue
        const id = literal(prop(el, 'id')?.value)
        const source = prop(el, 'source')?.value
        const streamId = source?.type === 'ObjectExpression' ? literal(prop(source, 'cloudflareId')?.value) : undefined
        const poster = literal(prop(el, 'poster')?.value)
        found.push({ id, streamId, poster, start: el.start, end: el.end })
      }
      return
    }
    for (const k of Object.keys(node)) {
      const v = node[k]
      if (Array.isArray(v)) v.forEach(visit)
      else if (v && typeof v === 'object') visit(v)
    }
  }
  visit(ast)
  return found
}

/* Removes the [start, end) ranges of `code`, plus the comma after each (and, for a one-per-line list, the rest of that line when it is only a comment). */
export function removeRanges(code, ranges) {
  let out = code
  for (const r of [...ranges].sort((a, b) => b.start - a.start)) {
    let end = r.end
    const tail = out.slice(end).match(/^[ \t]*,?([ \t]*(?:\/\/[^\n]*)?)(\n|$)/)
    end = tail ? end + tail[0].length : out.slice(end).match(/^[ \t]*,/) ? end + out.slice(end).match(/^[ \t]*,/)[0].length : end
    let start = r.start
    const lineStart = out.lastIndexOf('\n', start - 1) + 1
    if (/^[ \t]*$/.test(out.slice(lineStart, start))) start = lineStart // the entry starts its own line: drop the indentation with it
    out = out.slice(0, start) + out.slice(end)
  }
  return out
}

export default function withheldVideos() {
  let root, outDirConfig
  let withheld = []
  return {
    name: 'convrt-withheld-videos',
    apply: 'build',
    configResolved(config) { root = config.root; outDirConfig = config.build.outDir },
    buildStart() {
      if (this.meta?.watchMode) return
      const file = path.join(root, PORTFOLIO)
      withheld = findWithheld(fs.readFileSync(file, 'utf8'), (c) => this.parse(c))
    },
    transform(code, id) {
      const rel = path.relative(root, id.split('?')[0])
      if (rel === PORTFOLIO) {
        const own = findWithheld(code, (c) => this.parse(c))
        return { code: removeRanges(code, own), map: null }
      }
      if (rel === POSTER_FRAMES && withheld.length) {
        const ids = new Set(withheld.map((w) => w.streamId).filter(Boolean))
        const ast = this.parse(code)
        const ranges = []
        const visit = (n) => {
          if (!n || typeof n.type !== 'string') return
          if (n.type === 'Property' && ids.has(literal(n.key))) { ranges.push({ start: n.start, end: n.end }); return }
          for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach(visit); else if (v && typeof v === 'object') visit(v) }
        }
        visit(ast)
        return { code: removeRanges(code, ranges), map: null }
      }
      return null
    },
    closeBundle: {
      order: 'pre',
      handler() {
        const outDir = path.resolve(root, outDirConfig)
        if (!fs.existsSync(outDir) || !withheld.length) return
        for (const w of withheld) {
          if (w.poster) fs.rmSync(path.join(outDir, w.poster.replace(/^\//, '')), { force: true })
        }
        // Verification: nothing about a withheld entry may remain in a public text file.
        const needles = withheld.flatMap((w) => [w.id, w.streamId, w.poster && path.basename(w.poster)]).filter(Boolean)
        const leaks = []
        const walk = (dir) => {
          for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, f.name)
            if (f.isDirectory()) walk(p)
            else if (/\.(js|mjs|html|xml|json|txt|css)$/.test(f.name)) {
              const text = fs.readFileSync(p, 'utf8')
              for (const n of needles) if (text.includes(n)) leaks.push(`${path.relative(outDir, p)} contains ${n}`)
            } else if (needles.includes(f.name)) leaks.push(`${path.relative(outDir, p)} is a withheld asset`)
          }
        }
        walk(outDir)
        if (leaks.length) throw new Error(`Withheld video data reached the public build:\n  ${leaks.join('\n  ')}`)
      },
    },
  }
}
