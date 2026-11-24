/* Checks a French dictionary file against the list of English keys it must cover.
   Usage: node scripts/fr-dict-check.mjs <dict.js> <keys.json>
   Rules: every key present and no extra key; values are non-empty strings; no hand-typed currency amount ($, €, USD) where the English has dollar amounts (a {{price:…}} / {{perVariation:…}}
   token must stand in for each); every plain number of the English sentence (outside its dollar amounts) survives in the French; typographic apostrophes only; no banned filler phrases. */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const [dictFile, keysFile] = process.argv.slice(2)
const dict = (await import(pathToFileURL(path.resolve(dictFile)).href)).default
const keys = keysFile ? JSON.parse(fs.readFileSync(keysFile, 'utf8')) : Object.keys(dict)
const problems = []
const BANNED = [/r[ée]volutionn/i, /solutions innovantes/i, /maximis\w+ (votre|son|leur) potentiel/i, /meilleure agence/i, /leader/i, /n[°o]\s?1\b/i]
const DOLLAR = /\$\d[\d,]*(?:\.\d+)?/g
const nums = (s) => (s.replace(/\{\{[^}]*\}\}/g, ' ').match(/\d+/g) ?? []).sort()

for (const k of keys) {
  if (!(k in dict)) { problems.push(`MISSING: ${k.slice(0, 90)}`); continue }
  const v = dict[k]
  if (typeof v !== 'string' || !v.trim()) { problems.push(`EMPTY: ${k.slice(0, 90)}`); continue }
  const dollars = k.match(DOLLAR) ?? []
  const tokens = v.match(/\{\{(?:price|perVariation):[A-Za-z0-9.]+\}\}/g) ?? []
  if (dollars.length && tokens.length < 1) problems.push(`NO PRICE TOKEN (English has ${dollars.join(', ')}): ${k.slice(0, 70)}`)
  if (!dollars.length && tokens.length) problems.push(`UNEXPECTED TOKEN: ${k.slice(0, 70)}`)
  if (/[$€]|USD|EUR\b/.test(v.replace(/\{\{[^}]*\}\}/g, ''))) problems.push(`HAND-TYPED CURRENCY in: ${v.slice(0, 80)}`)
  const en = nums(k.replace(DOLLAR, ' '))
  const fr = nums(v)
  for (const n of en) if (!fr.includes(n)) problems.push(`NUMBER ${n} lost: ${k.slice(0, 60)} → ${v.slice(0, 60)}`)
  if (/'/.test(v)) problems.push(`STRAIGHT APOSTROPHE (use ’): ${v.slice(0, 80)}`)
  if (k.includes('\n') !== v.includes('\n')) problems.push(`LINE BREAK mismatch: ${k.slice(0, 60)}`)
  for (const re of BANNED) if (re.test(v)) problems.push(`BANNED phrase ${re}: ${v.slice(0, 80)}`)
}
for (const k of Object.keys(dict)) if (!keys.includes(k)) problems.push(`EXTRA key: ${k.slice(0, 90)}`)
console.log(`${keys.length} keys, ${Object.keys(dict).length} entries, ${problems.length} problems`)
for (const p of problems) console.log('  ' + p)
process.exit(problems.length ? 1 : 0)
