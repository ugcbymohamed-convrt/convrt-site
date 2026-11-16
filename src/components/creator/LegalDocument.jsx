import { LEGAL_STATUS, OWNER_FLAG } from '../../content/creatorLegal.js'

/* Renders AGREEMENT / PRIVACY from src/content/creatorLegal.js. Any "[OWNER TO CONFIRM …]" marker is highlighted so
   unresolved legal details are impossible to miss. */
function Flagged({ text }) {
  const i = text.indexOf(OWNER_FLAG)
  if (i === -1) return text
  const j = text.indexOf(']', i)
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-amber/20 px-1 text-amber">{text.slice(i, j + 1)}</mark>
      <Flagged text={text.slice(j + 1)} />
    </>
  )
}

export default function LegalDocument({ doc, headingLevel = 2, showDraftNotice = true, version }) {
  const H = `h${headingLevel}`
  const Sub = `h${Math.min(headingLevel + 1, 6)}`
  return (
    <div className="text-[15px] leading-relaxed text-ink-muted">
      {showDraftNotice && !LEGAL_STATUS.approved && (
        <p className="mb-5 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
          <strong>Draft awaiting final approval.</strong> {LEGAL_STATUS.note}
        </p>
      )}
      <H className="text-xl font-semibold tracking-snug text-ink">{doc.title}</H>
      {version && <p className="mt-1 text-xs text-ink-subtle">Version {version}</p>}
      {doc.intro && <p className="mt-4"><Flagged text={doc.intro} /></p>}
      {doc.sections.map((s) => (
        <section key={s.id} className="mt-6">
          <Sub className="text-base font-semibold text-ink">{s.heading}</Sub>
          {(s.paragraphs || []).map((p, i) => <p key={i} className="mt-2"><Flagged text={p} /></p>)}
          {s.bullets && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-lime">
              {s.bullets.map((b, i) => <li key={i}><Flagged text={b} /></li>)}
            </ul>
          )}
          {(s.after || []).map((p, i) => <p key={`a${i}`} className="mt-2"><Flagged text={p} /></p>)}
        </section>
      ))}
    </div>
  )
}
