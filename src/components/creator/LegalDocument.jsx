import { LEGAL_STATUS, OWNER_FLAG, PRIVACY, longDate } from '../../content/creatorLegal.js'

/* Online versions of the two creator documents, in the site's dark style. They render the SAME structures that are
   stored with each acceptance (the personalised agreement document) or hashed with it (the privacy notice), so what a
   creator reads is what is recorded. No version numbers are shown to creators.
   Any "[OWNER TO CONFIRM …]" marker is highlighted: those are open legal points, shown on purpose. */

function DraftNotice() {
  if (LEGAL_STATUS.approved) return null
  return (
    <p className="mb-6 rounded-xl border border-amber/30 bg-amber/10 px-4 py-2.5 text-sm text-amber">
      <strong className="font-semibold">Draft awaiting final approval.</strong> {LEGAL_STATUS.note}
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
          <div className="mt-5 flex min-h-[28px] items-baseline justify-between gap-3 border-b border-hairline-strong pb-1 font-semibold text-ink">
            <span>{doc.convrt?.name || ''}</span>
            {doc.convrt?.taxId && <span className="text-xs">NIF: {doc.convrt.taxId}</span>}
          </div>
          <p className="mt-1 text-xs text-ink-subtle">Full legal name</p>
          <div className="mt-5 min-h-[34px] border-b border-hairline-strong pb-1 font-serif text-xl italic text-ink">{doc.convrt?.signature || ''}</div>
          <p className="mt-1 text-xs text-ink-subtle">Signature</p>
          <div className="mt-5 min-h-[28px] border-b border-hairline-strong pb-1 text-ink-subtle">{doc.convrt ? (doc.convrt.signedAt ? longDate(doc.convrt.signedAt) : 'Dated when you submit') : ''}</div>
          <p className="mt-1 text-xs text-ink-subtle">Date</p>
        </div>
      </div>
    </article>
  )
}

/* "[OWNER TO CONFIRM: item]" markers become small "To be confirmed" tags: visibly not final, without developer wording. */
function Tagged({ text }) {
  const i = text.indexOf(OWNER_FLAG)
  if (i === -1) return text
  const j = text.indexOf(']', i)
  const item = text.slice(i + OWNER_FLAG.length, j).replace(/^:\s*/, '')
  return (
    <>
      {text.slice(0, i).replace(/\s+$/, '')}{' '}
      <span className="inline-flex translate-y-[-1px] items-center rounded-md border border-amber/30 bg-amber/10 px-1.5 py-[1px] text-[12px] font-medium text-amber">To be confirmed: {item}</span>
      <Tagged text={text.slice(j + 1)} />
    </>
  )
}

const H2 = 'text-[17px] font-semibold tracking-snug text-ink'

function PrivacySection({ s, level }) {
  const hLevel = Math.min(level + 1, 6)
  const paras = s.paragraphs || []
  const content = (
    <>
      <Heading level={hLevel} className={`${H2} ${s.panel ? 'flex items-center gap-2.5' : ''}`}>
        {s.panel && <span aria-hidden="true" className="h-4 w-[3px] rounded-full bg-lime" />}
        {s.heading}
      </Heading>
      <div className="mt-2.5 space-y-2.5">
        {paras.map((p, i) => (
          <p key={i} className={s.panel && i === 0 && s.prohibit ? 'font-medium text-ink' : ''}><Tagged text={p} /></p>
        ))}
        {s.bullets && (
          s.prohibit ? (
            <ul className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {s.bullets.map((b, i) => (
                <li key={i} className="flex gap-2.5"><span aria-hidden="true" className="mt-[3px] text-[13px] leading-none text-coral/80">✕</span><span>{b}</span></li>
              ))}
            </ul>
          ) : (
            <ul className="list-disc space-y-1.5 pl-5 marker:text-ink-subtle">
              {s.bullets.map((b, i) => <li key={i}><Tagged text={b} /></li>)}
            </ul>
          )
        )}
        {(s.after || []).map((p, i) => <p key={`a${i}`}><Tagged text={p} /></p>)}
      </div>
    </>
  )
  return s.panel ? (
    <section id={s.id} className="mt-6 rounded-2xl border border-hairline bg-surface-1 px-5 py-4">{content}</section>
  ) : (
    <section id={s.id} className="mt-6">{content}</section>
  )
}

/* One consistent document: same width, heading scale and spacing throughout; the two protection sections are subtle
   panels near the top (small lime accent only). */
export function PrivacyView({ document: doc = PRIVACY, headingLevel = 2 }) {
  return (
    <article className="text-[15px] leading-[1.6] text-ink-muted">
      <DraftNotice />
      <Heading level={headingLevel} className="text-2xl font-bold tracking-snug text-ink">{doc.title}</Heading>
      {doc.intro && <p className="mt-2">{doc.intro}</p>}
      {doc.sections.map((s) => <PrivacySection key={s.id} s={s} level={headingLevel} />)}
    </article>
  )
}
