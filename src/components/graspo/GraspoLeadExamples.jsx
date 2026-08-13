const ACCENT = '#d5ff40'

/* Anonymized, drawn directly from the inbound lead tracker.
   Company/contact identifiers removed, kept to the details
   that demonstrate genuine commercial intent. */
const LEADS = [
  {
    tag: 'Book printing',
    title: '10,000-copy book order',
    detail: 'A5 print run inquiry with a direct question about production timeline for the full quantity.',
    status: 'High priority',
  },
  {
    tag: 'B2B cooperation',
    title: 'Saudi printing agency, 5 branches',
    detail: 'An existing digital printing agency requested samples to show its own clients and explore a cooperation arrangement.',
    status: 'Samples sent',
  },
  {
    tag: 'B2B cooperation',
    title: 'Riyadh printing company, facility visit',
    detail: 'A Saudi printing company asked to visit Graspo\'s production facility and requested samples ahead of a potential referral partnership.',
    status: 'Samples delivered · relationship active',
  },
  {
    tag: 'Publishing',
    title: 'Publisher preparing for a regional book fair',
    detail: 'A publishing house met with the team about multiple upcoming titles, timed to be production-ready for a major regional book fair.',
    status: 'Qualified · post-meeting follow-up',
  },
  {
    tag: 'Book printing',
    title: '1,600-copy full-color hardcover run',
    detail: 'Detailed offset specs, paper stock, binding, finishing, provided upfront for a large-format project shipping to Iraq.',
    status: 'Quote sent',
  },
  {
    tag: 'Book printing',
    title: '10,000+ copy religious text order',
    detail: 'A large-volume request for a religious publication, specified and quoted in full.',
    status: 'Offer sent',
  },
]

export default function GraspoLeadExamples() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 text-center">
        <div className="max-w-2xl mx-auto mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">What Those Leads Looked Like</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            Not random Instagram DMs.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            Six real examples from the inbound tracker, anonymized, but unedited in substance.
            Specific quantities, specs and next steps, from people who buy printing for a living.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {LEADS.map((lead) => (
            <div
              key={lead.title}
              className="rounded-3xl border border-hairline bg-surface-1/40 px-6 py-6 flex flex-col items-center text-center hover:border-hairline-strong transition-colors"
            >
              <span
                className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                style={{ background: 'rgba(213,255,64,0.12)', color: ACCENT, border: '1px solid rgba(213,255,64,0.25)' }}
              >
                {lead.tag}
              </span>
              <h3 className="mt-4 font-display font-bold text-ink text-[17px] leading-snug">{lead.title}</h3>
              <p className="mt-2.5 text-[13px] text-ink-muted leading-relaxed flex-1">{lead.detail}</p>
              <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                <span className="text-[11.5px] font-medium text-ink-subtle">{lead.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
