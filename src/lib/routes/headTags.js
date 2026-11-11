/* Turns a head spec (src/lib/headSpec.js) into HTML, and injects a rendered page into the app shell.
   Pure string functions, unit-tested in tests/prerender.test.mjs. */

import { STATIC_JSONLD_ATTR, STATIC_JSONLD_VALUE } from '../headSpec.js'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// JSON inside <script>: "<" must not be able to close the tag.
const jsonForScript = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

export function headSpecToHtml(spec) {
  const lines = [`<title>${esc(spec.title)}</title>`]
  for (const { attr, key, content } of spec.metas) lines.push(`<meta ${attr}="${esc(key)}" content="${esc(content)}" />`)
  if (spec.canonical) lines.push(`<link rel="canonical" href="${esc(spec.canonical)}" />`)
  for (const item of spec.jsonLd) {
    lines.push(`<script type="application/ld+json" ${STATIC_JSONLD_ATTR}="${STATIC_JSONLD_VALUE}">${jsonForScript(item)}</script>`)
  }
  return lines.map((l) => `    ${l}`).join('\n')
}

/* Head tags the shell (index.html) carries as defaults, which every prerendered route replaces. */
const MANAGED_META = ['description', 'og:title', 'og:description', 'og:type', 'og:url', 'og:site_name', 'twitter:card', 'twitter:title', 'twitter:description', 'og:image', 'twitter:image', 'robots']

export function stripManagedHead(html) {
  let out = html.replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/, '')
  for (const key of MANAGED_META) {
    const re = new RegExp(`[ \\t]*<meta\\s+(?:name|property)="${key.replace(/[:]/g, ':')}"[^>]*?/>\\r?\\n?`, 'g')
    out = out.replace(re, '')
  }
  out = out.replace(/[ \t]*<link\s+rel="canonical"[^>]*?\/>\r?\n?/g, '')
  return out
}

/* shell + route head + server-rendered markup → the route's HTML file. */
export function injectPage(shell, { headHtml, bodyHtml, ssrPath }) {
  const viewport = shell.match(/<meta\s+name="viewport"[^>]*?\/>/)
  if (!viewport) throw new Error('injectPage: <meta name="viewport"> not found in index.html')
  if (!shell.includes('<div id="root"></div>')) throw new Error('injectPage: <div id="root"></div> not found in index.html')
  let html = stripManagedHead(shell)
  html = html.replace(/(<meta\s+name="viewport"[^>]*?\/>)/, `$1\n${headHtml}`)
  html = html.replace('<div id="root"></div>', () => `<div id="root" data-ssr-path="${esc(ssrPath)}">${bodyHtml}</div>`)
  return html
}
