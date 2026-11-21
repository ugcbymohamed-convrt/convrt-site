/* Source-reading tests pin the ENGLISH copy as it is written in a component. Components now wrap English text for translation (tr('…') / <T>…</T>); this
   helper reads a file with those wrappers removed, so a test still sees the text exactly as an English reader would, and the English copy stays pinned. */
import fs from 'node:fs'

const unq = (t) => t.replace(/\\'/g, "'").replace(/\\"/g, '"')

export function normalizeI18n(src) {
  return src
    // attribute: aria-label={tr('x')} → aria-label="x"
    .replace(/=\{tr\('((?:[^'\\]|\\.)*)'\)\}/g, (_, t) => `="${unq(t)}"`)
    .replace(/=\{tr\("((?:[^"\\]|\\.)*)"\)\}/g, (_, t) => `="${unq(t)}"`)
    // text followed by the explicit space the wrapper keeps: {tr('x')}{' '} → x␠
    .replace(/\{tr\('((?:[^'\\]|\\.)*)'\)\}\{' '\}/g, (_, t) => `${unq(t)} `)
    .replace(/\{tr\("((?:[^"\\]|\\.)*)"\)\}\{' '\}/g, (_, t) => `${unq(t)} `)
    .replace(/\{tr\('((?:[^'\\]|\\.)*)'\)\}/g, (_, t) => unq(t))
    .replace(/\{tr\("((?:[^"\\]|\\.)*)"\)\}/g, (_, t) => unq(t))
    .replace(/\{tr\(`((?:[^`\\]|\\.)*)`\)\}/g, (_, t) => t)
    .replace(/<T>([^<{}]+)<\/T>/g, '$1')
    .replace(/\btr\('((?:[^'\\]|\\.)*)'\)/g, (_, t) => `'${t}'`)
    .replace(/\btr\("((?:[^"\\]|\\.)*)"\)/g, (_, t) => `"${t}"`)
}
export const readSource = (file) => normalizeI18n(fs.readFileSync(file, 'utf8'))
