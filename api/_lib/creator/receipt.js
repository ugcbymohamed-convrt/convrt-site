/* The creator's signed copy of the agreement: a self-contained, printable HTML document built from the stored
   acceptance record (the exact text they accepted, not the current text). */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/* "- item" lines become <ul> blocks; other lines become paragraphs. */
function textToHtml(text) {
  const out = []
  let inList = false
  for (const line of String(text).split('\n')) {
    if (line.startsWith('- ')) {
      if (!inList) out.push('<ul>')
      inList = true
      out.push(`<li>${esc(line.slice(2))}</li>`)
      continue
    }
    if (inList) out.push('</ul>')
    inList = false
    const t = line.trim()
    if (!t) continue
    // The stored text writes section headings in capitals (e.g. PURPOSE): show them as headings.
    const isHeading = t.length <= 60 && t === t.toUpperCase() && /\p{L}/u.test(t)
    out.push(isHeading ? `<h3>${esc(t)}</h3>` : `<p>${esc(line)}</p>`)
  }
  if (inList) out.push('</ul>')
  return out.join('\n')
}

export function renderReceipt(sub) {
  const a = sub.acceptance
  const boxes = a.checkboxes.map((c) => `<li>☑ ${esc(c.text)}</li>`).join('')
  const videos = sub.assets.videos.map((v) => `<li>Video ${v.slot}: ${esc(v.uid)}</li>`).join('')
  const photo = sub.assets.photo ? `<li>Profile photo (SHA-256): ${esc(sub.assets.photo.sha256)}</li>` : ''
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<title>Creator Portfolio Agreement — ${esc(sub.id)}</title>
<style>
body{font:15px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;max-width:760px;margin:32px auto;padding:0 20px}
h1{font-size:22px}h2{font-size:15px;margin:22px 0 6px;text-transform:uppercase;letter-spacing:.04em}
.box{border:1px solid #ccc;border-radius:8px;padding:14px 16px;margin:16px 0;background:#fafafa}
dt{font-weight:600;float:left;clear:left;width:200px}dd{margin:0 0 6px 210px;overflow-wrap:anywhere;word-break:break-word}
li{overflow-wrap:anywhere}h3{font-size:14px;margin:18px 0 4px;letter-spacing:.03em}
ul{padding-left:20px;margin:6px 0}
.sig{font:italic 22px Georgia,serif;margin:6px 0}
@media print{.box{background:#fff}}
</style></head><body>
<h1>Signed copy — CONVRT Studio Creator Portfolio Agreement</h1>
<div class="box"><dl>
<dt>Submission reference</dt><dd>${esc(sub.id)}</dd>
<dt>Public display name</dt><dd>${esc(a.displayName)}</dd>
<dt>Full legal name</dt><dd>${esc(a.legalName)}</dd>
<dt>Accepted on (server time)</dt><dd>${esc(a.acceptedAt)}</dd>
<dt>Agreement version</dt><dd>${esc(a.agreement.version)} (SHA-256 ${esc(a.agreement.sha256)})</dd>
<dt>Privacy notice version</dt><dd>${esc(a.privacy.version)}</dd>
</dl>
<div class="sig">${esc(a.signature)}</div>
<small>Typed electronic signature (a simple electronic signature, not a qualified or certified one).</small></div>
<h2>Statements accepted</h2><ul>${boxes}</ul>
<h2>Submitted materials covered by this acceptance</h2><ul>${videos}${photo}</ul>
<h2>Agreement text accepted</h2>
<div class="box">${textToHtml(a.agreement.text)}</div>
<p><small>Your submission was received for review. Nothing is published until CONVRT approves it, and you can ask for removal at any time.</small></p>
</body></html>`
}

/* Printable HTML copy of a NEW-format signed agreement. Used only when the PDF cannot be drawn (a name in a script the
   embedded fonts do not cover). Same content as the PDF: parties, five sections, covered videos, acceptance, signatures. */
export function renderAgreementHtml(sub) {
  const a = sub.acceptance
  const d = a.agreement.document
  const date = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const time = (iso) => `${new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`
  const sections = d.sections.map((s) => `<h2>${esc(s.n)} ${esc(s.heading)}</h2><p>${s.paragraphs.map(esc).join(' ')}</p>`).join('\n')
  const videos = d.materials.length
    ? `<h2>Covered videos</h2><ul>${d.materials.map((m) => `<li><strong>Video ${esc(m.slot)}</strong> ${esc(m.label)}</li>`).join('')}</ul>`
    : ''
  const counter = a.countersignature
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<title>${esc(d.title)}</title>
<style>
@page{size:A4;margin:16mm}
body{font:11px/1.45 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;max-width:720px;margin:24px auto;padding:0 18px;border-top:6px solid #d5ff40}
h1{font-size:24px;margin:22px 0 2px}.sub{color:#555;margin:0 0 10px;font-size:12px}
h2{font-size:12px;margin:14px 0 3px}p{margin:0 0 6px}ul{margin:4px 0 8px;padding-left:18px}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:18px;border-top:1px solid #ccc;padding-top:10px}
.line{border-bottom:1px solid #999;min-height:24px;padding:2px 2px;overflow-wrap:anywhere}.lab{font-size:9px;color:#666;margin:2px 0 14px}
.sig{font:italic 17px Georgia,serif}.foot{margin-top:22px;border-top:1px solid #ccc;padding-top:6px;color:#555;font-size:9px;display:flex;justify-content:space-between}
</style></head><body>
<h1>${esc(d.title)}</h1><p class="sub">${esc(d.subtitle)}</p>
<p><strong>Parties:</strong> ${esc(d.parties)}</p>
${sections}
${videos}
<p><strong>Acceptance:</strong> ${esc(d.acceptance)}</p>
<div class="sign">
<div><strong>CREATOR</strong><div class="line" style="margin-top:14px"><strong>${esc(a.legalName)}</strong></div><div class="lab">Full legal name</div>
<div class="line sig">${esc(a.signature)}</div><div class="lab">Signature (typed electronic signature)</div>
<div class="line">${esc(date(a.acceptedAt))}, ${esc(time(a.acceptedAt))}</div><div class="lab">Date</div></div>
<div><strong>CONVRT STUDIO</strong><div class="line" style="margin-top:14px">${counter ? `<strong>${esc(counter.name)}</strong>` : ''}</div><div class="lab">Full legal name</div>
<div class="line sig">${counter ? esc(counter.signature || counter.name) : ''}</div><div class="lab">Signature</div>
<div class="line">${counter ? esc(date(counter.signedAt)) : ''}</div><div class="lab">Date</div></div>
</div>
<div class="foot"><span>CONVRT Studio | www.convrt.studio</span><span>Ref. ${esc(sub.id)} | ${esc(date(a.acceptedAt))}</span></div>
</body></html>`
}
