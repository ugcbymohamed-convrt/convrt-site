import { GRASPO_STATS, ELYON_STATS } from '../lib/siteStats.js'

/* ─────────────────────────────────────────────
   RESULTS STRIP — verified outcomes from the two case studies, shown right
   under the hero. Every figure is quoted from its case study with the same
   context (period, sample, what the number is NOT); nothing here is new data.
   Figures live in src/lib/siteStats.js.
───────────────────────────────────────────── */

const g = GRASPO_STATS.report
const e = ELYON_STATS

const RESULTS = [
  {
    id: 'graspo',
    brand: 'Graspo',
    context: `Organic social · ${g.window}`,
    stats: [
      { value: g.leads, label: 'inbound enquiries' },
      { value: g.highPriority, label: 'high-priority opportunities' },
      { value: g.advanced, label: 'at an advanced, quotation stage' },
    ],
    note: 'Enquiries tracked from a full organic content system (strategy, production, localization and inbound handling). Not confirmed sales or revenue.',
    href: '/case-studies',
    cta: 'Graspo case study',
  },
  {
    id: 'elyon',
    brand: 'Elyon Dubai',
    context: 'Paid social · Meta Ads Manager snapshots',
    stats: [
      { value: e.creatives, label: 'creatives produced to date' },
      { value: e.standout.roas, label: `ROAS on one creative (${e.standout.purchases} purchases)` },
      { value: e.earlyTest.avgRoas, label: `average ROAS, ${e.earlyTest.days}-day test on ${e.earlyTest.spend} spend` },
    ],
    note: 'Short test snapshots shared by the client, not sustained campaign averages. ROAS compares purchase value with ad spend and is not profit.',
    href: '/case-studies?case=elyon',
    cta: 'Elyon case study',
  },
]

export default function ResultsStrip() {
  return (
    <section aria-labelledby="results-strip-heading" className="relative pb-12 md:pb-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2
          id="results-strip-heading"
          className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle"
        >
          Results from client work
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {RESULTS.map((r) => (
            <article key={r.id} className="flex flex-col rounded-3xl border border-hairline bg-surface-1/60 px-5 py-6 backdrop-blur-md sm:px-7">
              <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-lg font-bold tracking-display text-ink">{r.brand}</h3>
                <p className="text-xs text-ink-subtle">{r.context}</p>
              </header>

              <dl className="mt-5 grid grid-cols-3 gap-3 sm:gap-5">
                {r.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-2xl font-bold leading-none tracking-display text-lime tabular-nums sm:text-[28px]">
                      {s.value}
                    </dd>
                    <p className="mt-2 text-[11.5px] leading-snug text-ink-muted" aria-hidden="true">{s.label}</p>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-[12px] leading-relaxed text-ink-subtle">{r.note}</p>
              <a
                href={r.href}
                className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-lime transition-colors hover:text-lime-light"
              >
                {r.cta}
                <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
