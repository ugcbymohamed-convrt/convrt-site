import { LEGAL_STATUS, OWNER_FLAG, PRIVACY } from '../../content/creatorLegal.js'

/* Online versions of the two creator documents, in the site's dark style. They render the SAME structures that are
   stored with each acceptance (the personalised agreement document) or hashed with it (the privacy notice), so what a
   creator reads is what is recorded. No version numbers are shown to creators.
   Any "[OWNER TO CONFIRM …]" marker is highlighted: those are open legal points, shown on purpose. */

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

function DraftNotice() {
  if (LEGAL_STATUS.approved) return null
  return (
    <p className="mb-6 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
      <strong>Draft awaiting final approval.</strong> {LEGAL_STATUS.note}
    </p>
  )
}

const Heading = ({ level, className, children }) => {
  const H = `h${level}`
  return <H className={className}>{children}</H>
}

/* @param {{ document: object, signature?: string, headingLevel?: number }} props
   `document` comes from buildAgreementDocument(): the parties line, five sections, covered videos, acceptance. */
export function AgreementView({ document: doc, signature = '', headingLevel = 2 }) {
  const typed = String(signature || '').trim()
  return (
    <article className="text-[15px] leading-relaxed text-ink-muted">
      <DraftNotice />
      <header className="border-b border-hairline pb-4">
        <Heading level={headingLevel} className="text-2xl font-bold tracking-snug text-ink">{doc.title}</Heading>
        <p className="mt-1 text-sm text-ink-subtle">{doc.subtitle}</p>
      </header>

      <p className="mt-5"><strong className="font-semibold text-ink">Parties:</strong> {doc.parties}</p>

      {doc.sections.map((s) => (
        <section key={s.n} className="mt-6">
          <Heading level={Math.min(headingLevel + 1, 6)} className="flex items-baseline gap-3 text-base font-semibold text-ink">
            <span className="font-mono text-[13px] text-lime">{s.n}</span>
            {s.heading}
          </Heading>
          <div className="mt-2 space-y-2.5">
            {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      ))}

      {doc.materials.length > 0 && (
        <section className="mt-6">
          <Heading level={Math.min(headingLevel + 1, 6)} className="text-base font-semibold text-ink">Covered videos</Heading>
          <ul className="mt-2 space-y-1.5">
            {doc.materials.map((m) => (
              <li key={m.slot} className="flex gap-3"><span className="w-16 shrink-0 font-semibold text-ink">Video {m.slot}</span><span className="min-w-0 break-words">{m.label}</span></li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6"><strong className="font-semibold text-ink">Acceptance:</strong> {doc.acceptance}</p>

      <div className="mt-7 grid grid-cols-1 gap-8 border-t border-hairline pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink">Creator</p>
          <div className="mt-5 min-h-[28px] border-b border-hairline-strong pb-1 font-semibold text-ink">{doc.creatorName || ''}</div>
          <p className="mt-1 text-xs text-ink-subtle">Full legal name</p>
          <div className="mt-5 min-h-[34px] border-b border-hairline-strong pb-1 font-serif text-xl italic text-ink">{typed}</div>
          <p className="mt-1 text-xs text-ink-subtle">Signature (typed electronic signature)</p>
          <div className="mt-5 min-h-[28px] border-b border-hairline-strong pb-1 text-ink-subtle">{typed ? 'Recorded when you submit' : ''}</div>
          <p className="mt-1 text-xs text-ink-subtle">Date</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink">CONVRT Studio</p>
          {['Full legal name', 'Signature', 'Date'].map((l) => (
            <div key={l}>
              <div className="mt-5 min-h-[28px] border-b border-hairline-strong" />
              <p className="mt-1 text-xs text-ink-subtle">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export function PrivacyView({ document: doc = PRIVACY, headingLevel = 2 }) {
  return (
    <article className="text-[15px] leading-relaxed text-ink-muted">
      <DraftNotice />
      <Heading level={headingLevel} className="text-2xl font-bold tracking-snug text-ink">{doc.title}</Heading>
      {doc.intro && <p className="mt-3"><Flagged text={doc.intro} /></p>}
      {doc.sections.map((s) => {
        const body = (
          <>
            <Heading level={Math.min(headingLevel + 1, 6)} className="text-lg font-semibold text-ink">{s.heading}</Heading>
            {(s.paragraphs || []).map((p, i) => (
              <p key={i} className={`mt-2 ${s.highlight && i === 0 ? 'font-semibold text-ink' : ''}`}><Flagged text={p} /></p>
            ))}
            {s.bullets && (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-lime">
                {s.bullets.map((b, i) => <li key={i}><Flagged text={b} /></li>)}
              </ul>
            )}
            {(s.after || []).map((p, i) => <p key={`a${i}`} className="mt-3"><Flagged text={p} /></p>)}
          </>
        )
        return s.highlight ? (
          <section key={s.id} id={s.id} className="mt-6 rounded-3xl border border-lime/40 bg-lime/5 p-5 md:p-6">{body}</section>
        ) : (
          <section key={s.id} id={s.id} className="mt-7">{body}</section>
        )
      })}
    </article>
  )
}
