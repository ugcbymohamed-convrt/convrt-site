/* Translation completeness check (also run by tests/i18n.test.mjs).

   Scans src/ for every literal passed to tr('…') / tr("…") / <T>…</T> and reports the ones a BUILT locale's dictionary lacks. Strings that are only built at
   render time (data-driven sentences, FAQ answers, config text) are covered separately by the build itself, which refuses to write a translated page that
   rendered an untranslated string (vite-plugin-static-routes.js). Run: node scripts/i18n-check.mjs [locale] */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUILT_LOCALES } from '../src/i18n/locales.js'
import { DICTIONARIES } from '../src/i18n/dictionaries.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? (e.name === 'i18n' ? 0 : walk(p, out)) : /\.(jsx?|mjs)$/.test(e.name) && out.push(p) } return out }

export function literalKeys(uses = new Map()) {
  const keys = new Map()
  const add = (k, f) => { if (!keys.has(k)) keys.set(k, f); (uses.get(k) ?? uses.set(k, []).get(k)).push(f) }
  for (const f of walk(ROOT)) {
    const s = fs.readFileSync(f, 'utf8')
    for (const m of s.matchAll(/\btr\(\s*'((?:[^'\\]|\\.)*)'\s*\)/g)) add(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'), f)
    for (const m of s.matchAll(/\btr\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g)) add(m[1].replace(/\\"/g, '"'), f)
    for (const m of s.matchAll(/<T>([^<{}]+)<\/T>/g)) add(m[1].trim(), f)
  }
  return keys
}

/* Pages a language does not have are not its business: a string only a page the language lacks uses is not required in that dictionary. French has every service page now (UGC, Spokesperson,
   SaaS, Organic Social: docs/multilingual-french-release.md), so nothing is excluded for it any more; the map stays so a future language can scope itself the same way. */
const SCOPE_EXCLUDED = {}
export function missingFor(locale) {
  const dict = DICTIONARIES[locale] ?? {}
  const excluded = SCOPE_EXCLUDED[locale] ?? []
  const uses = new Map()
  const keys = literalKeys(uses)
  // a string is required when ANY file that uses it belongs to a page the language has (the first file found is not enough: several pages share strings)
  return [...keys].map(([k, f]) => [k, uses.get(k).find((u) => !excluded.some((re) => re.test(path.relative(ROOT, u)))) ?? f, uses.get(k).some((u) => !excluded.some((re) => re.test(path.relative(ROOT, u))))]).filter(([k, , needed]) => !(k in dict) && needed).map(([k, f]) => [k, f]).map(([k, f]) => ({ key: k, file: path.relative(ROOT, f) }))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const locales = process.argv[2] ? [process.argv[2]] : BUILT_LOCALES.filter((l) => l !== 'en')
  let bad = 0
  for (const l of locales) {
    const miss = missingFor(l)
    bad += miss.length
    console.log(`${l}: ${miss.length} missing`)
    for (const m of miss) console.log(`  ${JSON.stringify(m.key)}  (${m.file})`)
  }
  process.exit(bad ? 1 : 0)
}
