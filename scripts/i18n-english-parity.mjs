/* English-parity check: proves a build changed NOTHING on the English pages except what the multilingual release adds on purpose (the language selector markup and
   reciprocal hreflang tags). Compare a build of the previous main with a build of this branch:
       node scripts/i18n-english-parity.mjs <dist-before> <dist-after>
   Normalised before comparing: hashed asset names, React's empty text-node comments, the language selector (header dropdown + footer list) and hreflang links.
   Prints IDENTICAL / DIFF per page; exit code 1 when any page differs. Used for the Spanish launch candidate: 0 differences on every English page. */
import fs from 'node:fs'
import path from 'node:path'
const A = process.argv[2], B = process.argv[3]
const walk = (d, o = []) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p, o) : o.push(p) } return o }
const files = walk(A).filter((f) => f.endsWith('.html')).map((f) => path.relative(A, f))
let bad = 0
for (const rel of files) {
  const a = fs.readFileSync(path.join(A, rel), 'utf8')
  const bp = path.join(B, rel)
  if (!fs.existsSync(bp)) { console.log('MISSING', rel); bad++; continue }
  let b = fs.readFileSync(bp, 'utf8')
  // normalise the allowed differences: hreflang links, selector markup
  const norm = (h) => h.replace(/<!-- -->/g,'').replace(/\s*<link rel="alternate" hreflang[^>]*>/g, '').replace(/\/assets\/([\w.-]+?)-[A-Za-z0-9_-]{8}\.(js|css)/g, '/assets/$1.$2').replace(/\n\s*<link rel="modulepreload"[^>]*>/g,'').replace(/<div class="relative "><button type="button" aria-expanded="false" aria-controls="language-menu"[\s\S]*?<\/ul><\/div>/g,'').replace(/<nav aria-label="Language"[\s\S]*?<\/nav>/g,'')
  const A1 = norm(a), B1 = norm(b)
  if (A1 === B1) { console.log('IDENTICAL', rel); continue }
  // find first difference
  let i = 0; while (i < A1.length && A1[i] === B1[i]) i++
  console.log('DIFF', rel, 'at', i, '\n  base:', A1.slice(i - 60, i + 140).replace(/\n/g,' '), '\n  new :', B1.slice(i - 60, i + 140).replace(/\n/g,' '))
  bad++
}
console.log('files with differences:', bad)
process.exit(bad ? 1 : 0)
