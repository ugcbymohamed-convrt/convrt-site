// Usage: node scripts/legal-review-export.mjs <outDir>
// Writes the REVIEW material for the Spanish, French and Arabic legal translations from the real modules (src/content/legal/*.js) and the English source (src/content/trustPages.js):
//   legal-<locale>.md                  the complete translated documents, readable
//   comparison-<locale>.html           clause-level comparison, English | translation, with the translator's review notes under each clause (Arabic is right-to-left)
//   comparison-<locale>.md             the same comparison as Markdown
// plus 00-README.md (how to review, counts, the points that need a lawyer). It reads notes-<locale>.json from the same folder when present (review notes written during translation).
// The output folder is NOT inside the repository. These are review drafts: not legally certified, not independently validated.
import fs from 'node:fs'
import path from 'node:path'
import { TRUST_CONTENT } from '../src/content/trustPages.js'
import { legalContext } from '../src/content/legal/context.js'
import { DOCS, itemsOf } from '../src/content/legal/structure.js'
import LEGAL_ES from '../src/content/legal/es.js'
import LEGAL_FR from '../src/content/legal/fr.js'
import LEGAL_AR from '../src/content/legal/ar.js'
import { frTypography } from '../src/i18n/fr/typography.js'

const out = process.argv[2]
if (!out) { console.error('usage: node scripts/legal-review-export.mjs <outDir>'); process.exit(2) }
fs.mkdirSync(out, { recursive: true })
const ctx = legalContext()
const BUILD = { es: LEGAL_ES, fr: LEGAL_FR, ar: LEGAL_AR }
const NAME = { es: 'Spanish', fr: 'French', ar: 'Arabic' }
const DOC_TITLE = { privacy: 'Privacy Policy', terms: 'Terms and Conditions', legalNotice: 'Legal Notice' }
const plain = (s) => s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, label, target) => `${label} <${target}>`)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const html = (s) => esc(s).replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, label, target) => `<span class="lnk">${label}</span> <span class="tgt">&lt;${target}&gt;</span>`)

/* Items grouped per section: [{heading, items:[{kind,text}]}], with the h1 and intro first. */
function grouped(page) {
  const all = itemsOf(page)
  const groups = [{ heading: '(title and introduction)', sectionIndex: -1, items: all.slice(0, 2) }]
  let cur = null, idx = -1
  for (const it of all.slice(2)) {
    if (it.kind === 'h2') { idx++; cur = { heading: it.text, sectionIndex: idx, items: [] }; groups.push(cur) } else cur.items.push(it)
  }
  return groups
}

const summary = {}
for (const l of ['es', 'fr', 'ar']) {
  const built = BUILD[l]({ ...ctx, analyticsActive: false })
  const notesFile = path.join(out, `notes-${l}.json`)
  const notes = fs.existsSync(notesFile) ? JSON.parse(fs.readFileSync(notesFile, 'utf8')) : []
  const fix = (s) => (l === 'fr' ? frTypography(s) : s)
  const rtl = l === 'ar'
  let md = `# ${NAME[l]} legal documents: complete translation (REVIEW DRAFT)\n\nTranslated from the English documents on convrt.studio. **Not legally certified and not independently validated.** Nothing here is published: see the README. Links are shown as \`label <target>\`.\n\n`
  let cmpMd = `# ${NAME[l]}: clause-level comparison with the English source (REVIEW DRAFT)\n\nFor every clause: the English text, the translation, and the review notes written while translating (⚠ = a professional legal reviewer should look at it).\n\n`
  let cmpHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${NAME[l]} legal translation: comparison</title><style>
body{font:15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:1180px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}h1{font-size:1.6rem}h2{margin-top:2.4rem;border-bottom:2px solid #111;padding-bottom:.3rem}h3{margin:1.6rem 0 .4rem;font-size:1.05rem;background:#f1f1f1;padding:.4rem .6rem}
table{width:100%;border-collapse:collapse;table-layout:fixed}td{vertical-align:top;border:1px solid #ddd;padding:.5rem .7rem}td.n{width:2.6rem;color:#888;text-align:center}.tr{background:#fcfcf4}.lnk{text-decoration:underline}.tgt{color:#888;font-size:.8em;direction:ltr;unicode-bidi:isolate}
.note{margin:.4rem 0 1rem;padding:.6rem .8rem;border-left:4px solid #bbb;background:#f7f7f7;font-size:.9em}.note.legal{border-color:#c0392b;background:#fdf0ee}.note.src{border-color:#d68910;background:#fef5e7}.tag{font-weight:700;text-transform:uppercase;font-size:.72em;letter-spacing:.05em}
.warn{background:#fff3cd;border:1px solid #e0c36a;padding:.7rem 1rem;margin-bottom:1.5rem}</style></head><body>
<h1>${NAME[l]} legal documents: clause-level comparison</h1><p class="warn"><b>REVIEW DRAFT.</b> Not legally certified; not independently validated. Left column: the English source as published. Right column: the translation. Coloured boxes: points a professional legal reviewer should look at (red), differences in the English source itself (orange) and terminology choices (grey).</p>`
  let counts = { clauses: 0, notes: notes.length, legal: notes.filter((n) => n.legalReview).length }
  for (const d of DOCS) {
    const en = TRUST_CONTENT[d], tr = built[d]
    const gE = grouped(en), gT = grouped(tr)
    md += `\n---\n\n## ${fix(tr.h1)}\n\n${fix(plain(tr.intro))}\n`
    cmpMd += `\n---\n\n## ${DOC_TITLE[d]}  ↔  ${fix(tr.h1)}\n`
    cmpHtml += `<h2>${DOC_TITLE[d]} &nbsp;↔&nbsp; <span ${rtl ? 'dir="rtl"' : ''}>${esc(fix(tr.h1))}</span></h2>`
    gE.forEach((g, gi) => {
      const t = gT[gi]
      if (gi > 0) md += `\n### ${fix(t.heading)}\n\n` + t.items.map((it) => (it.kind === 'li' ? `- ${fix(plain(it.text))}` : fix(plain(it.text)))).join('\n').replace(/\n(?=[^-])/g, '\n\n') + '\n'
      cmpMd += `\n### ${gi === 0 ? 'Title and introduction' : `${gi}. ${g.heading}`}\n\n`
      cmpHtml += `<h3>${gi === 0 ? 'Title and introduction' : `${gi}. ${esc(g.heading)}`} &nbsp;<small>(${esc(fix(t.heading))})</small></h3><table>`
      g.items.forEach((it, k) => {
        counts.clauses++
        const tt = t.items[k]
        const mark = it.kind === 'li' ? '• ' : ''
        cmpMd += `**EN** ${mark}${plain(it.text)}\n\n**${l.toUpperCase()}** ${mark}${fix(plain(tt.text))}\n\n`
        cmpHtml += `<tr><td class="n">${gi === 0 ? '' : `${gi}.${k + 1}`}</td><td>${mark}${html(it.text)}</td><td class="tr" ${rtl ? 'dir="rtl"' : ''}>${mark}${html(fix(tt.text))}</td></tr>`
      })
      cmpHtml += '</table>'
      for (const n of notes.filter((x) => x.doc === d && x.sectionIndex === g.sectionIndex)) {
        const cls = n.severity === 'source-issue' ? 'src' : n.legalReview ? 'legal' : ''
        cmpMd += `> ${n.legalReview ? '⚠ ' : ''}**${n.severity}**: ${n.note}${n.englishExcerpt ? `\n> *EN*: “${n.englishExcerpt}”` : ''}${n.translationChoice ? `\n> *${l.toUpperCase()}*: “${n.translationChoice}”` : ''}\n\n`
        cmpHtml += `<div class="note ${cls}"><span class="tag">${n.legalReview ? '⚠ legal review · ' : ''}${esc(n.severity)}</span><br>${esc(n.note)}${n.englishExcerpt ? `<br><i>EN:</i> “${esc(n.englishExcerpt)}”` : ''}${n.translationChoice ? `<br><i>${l.toUpperCase()}:</i> <span ${rtl ? 'dir="rtl"' : ''}>“${esc(fix(n.translationChoice))}”</span>` : ''}</div>`
      }
    })
  }
  cmpHtml += '</body></html>'
  fs.writeFileSync(path.join(out, `legal-${l}.md`), md)
  fs.writeFileSync(path.join(out, `comparison-${l}.md`), cmpMd)
  fs.writeFileSync(path.join(out, `comparison-${l}.html`), cmpHtml)
  summary[l] = counts
}

const bySeverity = (l) => {
  const f = path.join(out, `notes-${l}.json`)
  if (!fs.existsSync(f)) return ''
  const n = JSON.parse(fs.readFileSync(f, 'utf8'))
  return ['ambiguity', 'terminology', 'legal-review', 'source-issue'].map((s) => `${s} ${n.filter((x) => x.severity === s).length}`).join(' · ')
}
fs.writeFileSync(path.join(out, '00-README.md'), `# Legal translations: review pack (REVIEW DRAFT, nothing published)

Spanish, French and Arabic Privacy Policy, Terms and Conditions and Legal Notice, translated from the English documents published on convrt.studio (src/content/trustPages.js, effective date "21 November 2026" preserved in each).
**Not legally certified. Not independently validated. Not published.** The pages are built on the Preview deployment for reading, marked "translation under review", noindex, out of the sitemap and hreflang, and not linked from the footer or forms until \`LEGAL_TRANSLATIONS_APPROVED\` (src/config.js) is set to true.

## Files
| File | What it is |
|---|---|
| legal-es.md · legal-fr.md · legal-ar.md | the complete translated documents |
| comparison-es.html · comparison-fr.html · comparison-ar.html | clause-by-clause comparison (English | translation) with the review notes under each clause: **open these in a browser** (Arabic is right-to-left) |
| comparison-*.md | the same comparison as Markdown |
| notes-*.json | the raw review notes (doc, section, severity, whether a lawyer should look, English excerpt, translation choice) |

## Counts
${['es', 'fr', 'ar'].map((l) => `- ${NAME[l]}: ${summary[l].clauses} clauses compared; ${summary[l].notes} review notes (${summary[l].legal} flagged for professional legal review). ${bySeverity(l)}`).join('\n')}

## What was checked automatically (tests/legal-translations.test.mjs)
Same number and order of sections, paragraphs and list items as the English; every link target, number, URL, e-mail, cookie/storage-key name, the NIF and the postal address identical to the English; the effective date kept; no English-precedence clause, no new governing law, jurisdiction, retention period or transfer mechanism; Arabic in formal Modern Standard Arabic with Western digits. **This proves structure, not meaning**: whether each sentence carries exactly the same legal effect needs a lawyer.

## The English source itself: see the notes marked "source-issue" and docs/contact-about-legal-localization.md in the repository (decisions needed from the owner).
`)
console.log('written to', out, summary)
