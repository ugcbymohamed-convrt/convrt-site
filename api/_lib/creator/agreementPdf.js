/* The signed Creator Portfolio Agreement as a real A4 PDF (pdf-lib), laid out like CONVRT's reference agreement:
   lime top bar, CONVRT logo, title + subtitle, parties line, five numbered sections, acceptance, and two signature
   columns (CREATOR / CONVRT STUDIO), with a "CONVRT Studio | www.convrt.studio" footer.

   • Drawn from the structured `document` that was stored with the acceptance (never from today's template), so a
     signed copy always shows exactly what that creator accepted.
   • No version number, hash, database id or private URL is drawn. The submission reference and acceptance date are in
     the footer, the covered videos are listed by filename.
   • One page when the whole agreement fits at a comfortable size (9.6 / 9.3 / 9 pt, never smaller). Otherwise the
     covered videos move to a clearly labelled second page ("Record of materials"); the legal text is never clipped.
   • Fonts: Inter (Latin, Latin Extended, Cyrillic) is embedded and chosen per character, so names mixing plain and
     accented letters work. A name in a script Inter does not cover (e.g. Arabic, Chinese, Greek) throws
     UnsupportedTextError, and the caller falls back to the printable HTML copy instead of drawing wrong glyphs.
   • The CONVRT side of the signature block stays EMPTY unless a countersignature was actually recorded. */

import { PDFDocument, rgb, degrees } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { LOGO_PATHS } from '../../../src/lib/creator/logoPaths.js'
import { LEGAL_STATUS, CONTRACTING_PARTY, longDate } from '../../../src/content/creatorLegal.js'
import { FONT_DATA } from './fontData.js'

export class UnsupportedTextError extends Error {
  constructor(sample) {
    super('unsupported_text')
    this.name = 'UnsupportedTextError'
    this.sample = sample
  }
}

const A4 = { w: 595.2756, h: 841.8898 }
const M = { l: 44, r: 44, top: 0, bottom: 52 }
const COLORS = { ink: rgb(0.07, 0.07, 0.07), muted: rgb(0.36, 0.36, 0.38), rule: rgb(0.82, 0.82, 0.84), lime: rgb(0.835, 1, 0.251), draft: rgb(0.78, 0.2, 0.15) }
const LOGO_BOX = { x: 161.8239, y: 146.02, w: 847.856, h: 167.234 }
const BODY_SIZES = [9.6, 9.3, 9]
const LOGO_W = 132
const LH = 1.4 // body line height
const ROW = 31 // vertical pitch of the signature rows

const FONT_FILES = {
  latin: ['inter-latin-400-normal.woff', 'inter-latin-700-normal.woff'],
  latinExt: ['inter-latin-ext-400-normal.woff', 'inter-latin-ext-700-normal.woff'],
  cyrillic: ['inter-cyrillic-400-normal.woff', 'inter-cyrillic-700-normal.woff'],
}
const fileCache = {}
const readFont = (name) => (fileCache[name] ||= Buffer.from(FONT_DATA[name], 'base64'))

const PUNCT = new Set([0x2019, 0x2018, 0x201c, 0x201d, 0x2014, 0x2013, 0x2026, 0x00a0])

async function loadFamilies(pdf) {
  pdf.registerFontkit(fontkit)
  const families = []
  for (const [key, [regular, bold]] of Object.entries(FONT_FILES)) {
    const r = await pdf.embedFont(readFont(regular), { subset: true })
    const b = await pdf.embedFont(readFont(bold), { subset: true })
    families.push({ key, regular: r, bold: b, chars: new Set(r.getCharacterSet()) })
  }
  return families
}

/* Date/time text: always UTC (the server clock), so the copy never depends on where it is generated. */
export const formatDate = longDate
export function formatTime(iso) {
  return `${new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`
}

/* @param {object} record a stored submission (see service.submit)
   @param {{ trace?: string[] }} [opts] trace receives every string drawn (used by tests to compare with the accepted text)
   @returns {Promise<{ bytes: Uint8Array, meta: { pages: number, bodySize: number, maxX: number, scheduleOnSecondPage: boolean } }>} */
export async function renderAgreementPdf(record, { trace } = {}) {
  const acc = record.acceptance
  const doc = acc.agreement.document
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${doc.title} (${record.id})`)
  pdf.setAuthor('CONVRT Studio')
  pdf.setCreator('CONVRT Studio')
  pdf.setProducer('CONVRT Studio')
  pdf.setCreationDate(new Date(acc.acceptedAt))
  pdf.setModificationDate(new Date(acc.acceptedAt))

  const families = await loadFamilies(pdf)
  const latin = families[0]
  /* Splits a string into runs, each in the first embedded Inter subset that has the character. */
  const runsOf = (str) => {
    const out = []
    for (const ch of str) {
      const cp = ch.codePointAt(0)
      const fam = families.find((f) => f.chars.has(cp))
      if (!fam) throw new UnsupportedTextError(str.slice(0, 20))
      if (out.length && out[out.length - 1].fam === fam) out[out.length - 1].text += ch
      else out.push({ fam, text: ch })
    }
    return out
  }
  const widthOf = (str, size, bold) => runsOf(str).reduce((w, r) => w + (bold ? r.fam.bold : r.fam.regular).widthOfTextAtSize(r.text, size), 0)

  const innerW = A4.w - M.l - M.r
  let meta = { pages: 0, bodySize: 0, maxX: 0, scheduleOnSecondPage: false }
  const log = (t) => trace && trace.push(t)

  /* Splits into lines that fit `maxW`, breaking very long words by character. */
  function wrap(text, size, maxW, bold = false) {
    const out = []
    let line = ''
    for (const word of String(text).split(/\s+/).filter(Boolean)) {
      const trial = line ? `${line} ${word}` : word
      if (widthOf(trial, size, bold) <= maxW) { line = trial; continue }
      if (line) out.push(line)
      if (widthOf(word, size, bold) <= maxW) { line = word; continue }
      let chunk = ''
      for (const ch of word) {
        if (widthOf(chunk + ch, size, bold) > maxW) { out.push(chunk); chunk = ch } else chunk += ch
      }
      line = chunk
    }
    if (line) out.push(line)
    return out
  }

  const bodyText = (s) => s.paragraphs.join(' ')

  // The content that must appear on page 1 (everything but, possibly, the covered-videos list).
  function measure(size, inlineMaterials) {
    const lh = size * LH
    let h = 0
    h += lh * wrap(`Parties: ${doc.parties}`, size, innerW).length + 10
    for (const s of doc.sections) h += size + 4 + lh * wrap(bodyText(s), size, innerW).length + 8
    h += lh * wrap(`Acceptance: ${doc.acceptance}`, size, innerW).length + 8
    if (inlineMaterials) {
      h += size + 5
      for (const m of doc.materials) h += lh * wrap(`Video ${m.slot}  ${m.label}`, size - 0.3, innerW - 8).length
      h += 8
    }
    return h
  }
  // Vertical budget, from the same numbers the drawing code uses: header block, then content, then the signature block
  // (its lowest label must stay above the footer rule).
  const LOGO_H = (LOGO_BOX.h * LOGO_W) / LOGO_BOX.w
  const HEADER_H = 34 + LOGO_H + 30 + 17 + 12 + 18
  const SIGN_NEED = 6 + 34 + 2 * ROW + 11 + 2 // lowest label baseline: 2 row gaps below the first line
  const available = A4.h - HEADER_H - SIGN_NEED - (M.bottom + 6)
  let size = null
  let inline = false
  for (const inlineTry of [true, false]) {
    for (const s of BODY_SIZES) {
      if (measure(s, inlineTry) <= available) { size = s; inline = inlineTry; break }
    }
    if (size) break
  }
  meta.fit = { available: Math.round(available), need: BODY_SIZES.flatMap((s) => [true, false].map((i) => `${s}${i ? ' inline' : ''}: ${Math.round(measure(s, i))}`)) }
  const overflow = !size
  if (overflow) { size = BODY_SIZES[BODY_SIZES.length - 1]; inline = false }
  meta.bodySize = size
  meta.scheduleOnSecondPage = !inline && doc.materials.length > 0

  /* ───────── drawing helpers ───────── */
  const pages = []
  let page
  let y
  const newPage = () => {
    page = pdf.addPage([A4.w, A4.h])
    pages.push(page)
    page.drawRectangle({ x: 0, y: A4.h - 7, width: A4.w, height: 7, color: COLORS.lime })
    y = A4.h - 34
    if (!LEGAL_STATUS.approved) {
      const t = 'DRAFT: NOT FOR PRODUCTION USE'
      const w = widthOf(t, 7.5, true)
      page.drawText(t, { x: A4.w - M.r - w, y: A4.h - 28, size: 7.5, font: latin.bold, color: COLORS.draft })
      log(t)
    }
  }
  const text = (str, { x = M.l, size: sz, bold = false, color = COLORS.ink, skew = 0, dy = 0 }) => {
    let cx = x
    for (const r of runsOf(str)) {
      const f = bold ? r.fam.bold : r.fam.regular
      page.drawText(r.text, { x: cx, y: y + dy, size: sz, font: f, color, ySkew: skew ? degrees(skew) : undefined })
      cx += f.widthOfTextAtSize(r.text, sz)
    }
    meta.maxX = Math.max(meta.maxX, cx)
    log(str)
  }
  const rule = (yy, x1 = M.l, x2 = A4.w - M.r, thickness = 0.7) =>
    page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness, color: COLORS.rule })

  function header() {
    // Logo (real paths), black, top-left.
    const k = LOGO_W / LOGO_BOX.w
    LOGO_PATHS.forEach((d) => page.drawSvgPath(d, { x: M.l - LOGO_BOX.x * k, y: y + LOGO_BOX.y * k, scale: k, color: COLORS.ink, borderWidth: 0 }))
    y -= LOGO_BOX.h * k + 30
    text(doc.title, { size: 25, bold: true })
    y -= 17
    text(doc.subtitle, { size: 10.5, color: COLORS.muted })
    y -= 12
    rule(y)
    y -= 18
  }

  /* A paragraph with an optional bold lead-in ("Parties:"), wrapped to the content width. */
  function paragraph(lead, body, sz, gap) {
    const lh = sz * LH
    const full = lead ? `${lead} ${body}` : body
    const lines = wrap(full, sz, innerW)
    lines.forEach((line, i) => {
      if (lead && i === 0 && line.startsWith(lead)) {
        text(lead, { size: sz, bold: true })
        const lw = widthOf(`${lead} `, sz, true)
        text(line.slice(lead.length + 1), { x: M.l + lw, size: sz })
      } else text(line, { size: sz })
      y -= lh
    })
    y -= gap
  }

  function sectionBlock(s, sz) {
    text(`${s.n} ${s.heading}`, { size: sz + 1, bold: true })
    y -= sz + 4
    const lh = sz * LH
    for (const line of wrap(bodyText(s), sz, innerW)) {
      text(line, { size: sz })
      y -= lh
    }
    y -= 8
  }

  function materialsBlock(sz) {
    text('Covered videos', { size: sz, bold: true })
    y -= sz + 5
    const lh = sz * LH
    for (const m of doc.materials) {
      const label = `Video ${m.slot}`
      text(label, { size: sz - 0.3, bold: true })
      const lw = 44
      const lines = wrap(m.label, sz - 0.3, innerW - lw - 8)
      lines.forEach((line, i) => { text(line, { x: M.l + lw, size: sz - 0.3 }); y -= lh })
      if (!lines.length) y -= lh
    }
    y -= 8
  }

  /* Two-column signature area (CREATOR / CONVRT STUDIO). CONVRT's column is blank unless a countersignature exists. */
  function signatureBlock() {
    const gap = 26
    const colW = (innerW - gap) / 2
    const xs = [M.l, M.l + colW + gap]
    // CONVRT's side: pre-filled (name, NIF, typed signature, date) when the document carries it; otherwise a recorded
    // countersignature if there is one; otherwise blank.
    const counter = doc.convrt ? { ...doc.convrt } : acc.countersignature || null
    const cols = [
      { head: 'CREATOR', name: acc.legalName, sig: acc.signature, date: acc.acceptedAt, time: true, sigLabel: 'Signature (typed electronic signature)' },
      { head: 'CONVRT STUDIO', name: counter?.name || '', nif: counter?.taxId || '', sig: counter?.signature || counter?.name || '', date: counter?.signedAt || '', time: false, sigLabel: 'Signature' },
    ]
    rule(y + 12)
    y -= 6
    const top = y
    cols.forEach((c, i) => {
      y = top
      text(c.head, { x: xs[i], size: 9.5, bold: true })
      let yy = top - 34
      const rows = [
        { label: 'Full legal name', value: c.name, style: 'name' },
        { label: c.sigLabel, value: c.sig, style: 'sig' },
        { label: 'Date', value: c.date ? `${longDate(c.date)}${c.time ? `, ${formatTime(c.date)}` : ''}` : '', style: 'date' },
      ]
      rows.forEach((r) => {
        if (r.value) {
          let sz = r.style === 'sig' ? 15 : 10
          while (sz > 7 && widthOf(r.value, sz, r.style === 'name') > colW - 4) sz -= 0.5
          y = yy + 4
          let val = r.value
          while (widthOf(val, sz, false) > colW - 4 && val.length > 1) val = val.slice(0, -1)
          text(val === r.value ? val : `${val.slice(0, -1)}…`, { x: xs[i] + 2, size: sz, bold: r.style === 'name', skew: r.style === 'sig' ? 12 : 0 })
          if (r.style === 'name' && c.nif) {
            const nif = `NIF: ${c.nif}`
            text(nif, { x: xs[i] + colW - widthOf(nif, 9, true) - 2, size: 9, bold: true })
          }
        }
        page.drawLine({ start: { x: xs[i], y: yy }, end: { x: xs[i] + colW, y: yy }, thickness: 0.8, color: rgb(0.62, 0.62, 0.64) })
        y = yy - 11
        text(r.label, { x: xs[i], size: 7.8, color: COLORS.muted })
        yy -= ROW
      })
    })
    y = top - 3 * ROW - 8
  }

  function footer(n, total) {
    rule(M.bottom - 4)
    y = M.bottom - 20
    text(`${CONTRACTING_PARTY.tradeName} | ${CONTRACTING_PARTY.website}`, { size: 8.3, color: COLORS.muted })
    const right = `Ref. ${record.id} | ${formatDate(acc.acceptedAt)} | ${n} / ${total}`
    const w = widthOf(right, 8.3, false)
    text(right, { x: A4.w - M.r - w, size: 8.3, color: COLORS.muted })
  }

  /* ───────── page 1 ───────── */
  newPage()
  header()
  paragraph('Parties:', doc.parties, size, 10)
  for (const s of doc.sections) {
    if (y - (size * LH * wrap(bodyText(s), size, innerW).length + size + 8) < M.bottom + SIGN_NEED) newPage()
    sectionBlock(s, size)
  }
  paragraph('Acceptance:', doc.acceptance, size, 8)
  if (inline && doc.materials.length) materialsBlock(size)
  if (y - SIGN_NEED < M.bottom) newPage()
  signatureBlock()

  /* ───────── supplementary page: record of materials ───────── */
  if (!inline && doc.materials.length) {
    newPage()
    y -= 6
    text('Record of materials', { size: 18, bold: true })
    y -= 18
    text('The permission in this agreement covers only the following three approved videos.', { size: 10, color: COLORS.muted })
    y -= 12
    rule(y)
    y -= 24
    materialsBlock(10)
    y -= 10
    const facts = [
      ['Submission reference', record.id],
      ['Accepted', `${formatDate(acc.acceptedAt)}, ${formatTime(acc.acceptedAt)}`],
      ['Public display name', acc.displayName],
    ]
    for (const [k, v] of facts) {
      text(k, { size: 9.5, bold: true })
      text(v, { x: M.l + 150, size: 9.5 })
      y -= 16
    }
  }

  pages.forEach((p, i) => {
    page = p
    footer(i + 1, pages.length)
  })
  meta.pages = pages.length
  const bytes = await pdf.save()
  return { bytes, meta }
}
