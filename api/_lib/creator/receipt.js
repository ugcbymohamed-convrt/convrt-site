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
