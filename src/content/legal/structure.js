/* Structural fidelity of a legal translation against its English source (pure functions, used by scripts/legal-structure-check.mjs and tests/legal-translations.test.mjs).

   A faithful legal translation keeps, clause for clause: the number and order of sections, the number of paragraphs and list items in each, every link target, every number
   and every identifier (emails, URLs, storage-key and cookie names, tax ID). It cannot prove the MEANING is the same: that is the legal reviewer's job (see the
   clause-level comparison). */

export const DOCS = ['privacy', 'terms', 'legalNotice']

const bodyItems = (section) => section.body.flatMap((b) => (typeof b === 'string' ? [{ kind: 'p', text: b }] : b.list.map((text) => ({ kind: 'li', text }))))
export const itemsOf = (page) => [
  { kind: 'h1', text: page.h1 }, { kind: 'intro', text: page.intro },
  ...page.sections.flatMap((s) => [{ kind: 'h2', text: s.heading }, ...bodyItems(s)]),
]

const LINK_RE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g
export const linkTargets = (text) => [...text.matchAll(LINK_RE)].map((m) => m[2])
const stripLinks = (text) => text.replace(LINK_RE, '$1')
/* Western digit groups (any 0-9 run), URL/host-like strings, e-mail addresses and machine identifiers (convrt_*, _ga*): they must appear in the translation exactly as many times as in English. */
export const identifiers = (text) => {
  const plain = text
  const out = []
  for (const re of [/\d+(?:[.,]\d+)?/g, /(?:https?:\/\/|www\.)[^\s"”)\]|,;،؛]+/g, /[\w.+-]+@[\w-]+\.[\w.-]+/g, /\b_?(?:convrt_|ga_)[\w<>]*|_ga\b|_ga_<[^>]*>/g]) out.push(...(plain.match(re) ?? []))
  return out.map((s) => s.replace(/[.,]$/, '')).sort()
}

/* The English text has a few Latin-digit sequences that are part of a localized date or word in a translation (e.g. "21 November 2026" → "21 de noviembre de 2026"): the digits stay, so the check holds. */
export function compareStructure(en, tr, label = '') {
  const problems = []
  if (!tr) return [`${label}: missing`]
  if (en.sections.length !== tr.sections.length) problems.push(`${label}: ${tr.sections.length} sections, English has ${en.sections.length}`)
  const a = itemsOf(en)
  const b = itemsOf(tr)
  if (a.length !== b.length) problems.push(`${label}: ${b.length} items (headings, paragraphs, list items), English has ${a.length}`)
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i].kind !== b[i].kind) { problems.push(`${label} item ${i}: kind ${b[i].kind}, English ${a[i].kind} (“${a[i].text.slice(0, 50)}…”)`); continue }
    const la = linkTargets(a[i].text).join(' ')
    const lb = linkTargets(b[i].text).join(' ')
    if (la !== lb) problems.push(`${label} item ${i} (“${stripLinks(a[i].text).slice(0, 50)}…”): link targets differ: [${lb}] vs English [${la}]`)
    const ia = identifiers(a[i].text).join(' ')
    let idsB = identifiers(b[i].text)
    /* Documented exception (owner's professional Arabic copy, 27 Nov 2026): the Arabic Legal Notice intro cites the law twice, in Arabic and with its Spanish title in brackets, so '34' and '2002' appear twice. The meaning is unchanged; nothing else may differ. */
    if (label.startsWith('ar/legalNotice') && i === 1) for (const extra of ['2002', '34']) { const k = idsB.lastIndexOf(extra); if (idsB.filter((x) => x === extra).length === 2 && k >= 0) idsB.splice(k, 1) }
    const ib = idsB.join(' ')
    if (ia !== ib) problems.push(`${label} item ${i} (“${stripLinks(a[i].text).slice(0, 50)}…”): numbers/identifiers differ: [${ib}] vs English [${ia}]`)
    if (!b[i].text.trim()) problems.push(`${label} item ${i}: empty`)
  }
  return problems
}
