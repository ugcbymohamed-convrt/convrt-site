import { useInView } from '../caseStudies/shared/useInView.js'
import { ACCENT } from './theme.js'
import { useTr } from '../../i18n/tr.js'
import { ELYON_METRICS as METRICS } from '../../caseStudies/data.js'
import { roasStat, isEnglish, ltrRun } from '../caseStudies/format.js'


export default function ElyonMetrics() {
  const tr = useTr()
  const [wrapRef, visible] = useInView()

  return (
    <section className="relative pt-4 pb-12 md:pt-6 md:pb-16 scroll-mt-24">
      <div ref={wrapRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className="relative overflow-hidden rounded-3xl border px-6 py-7"
              style={{
                borderColor: 'rgba(201,166,104,0.16)',
                background: 'rgba(201,166,104,0.04)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(18px)',
                transition: `opacity 0.6s ${i * 70}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${i * 70}ms cubic-bezier(0.22,1,0.36,1)`,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-[0.14] blur-2xl"
                style={{ background: ACCENT }}
              />
              <p
                className="relative font-display font-bold tracking-display leading-none text-[clamp(1.9rem,4vw,2.6rem)] tabular-nums"
                style={{ color: ACCENT }}
              >
                {ltrRun(roasStat(m.value))}
              </p>
              <p className="relative mt-3 text-[13px] font-semibold text-ink">{tr(m.label)}</p>
              <p className="relative mt-1 text-[11.5px] text-ink-subtle">{tr(m.sub)}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-ink-subtle">
          {tr('160+ spans every batch, format and follow-up variation produced since launch, not a single delivery. Source: client-shared Meta Ads Manager results and internal production tracker.')}
        </p>
        {/* Spanish only: the limitation the UGC page states for the same results (docs/spanish-case-studies.md). The English page is unchanged. */}
        {!isEnglish() && (
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-ink-subtle">
            {tr('ROAS figures are reported by the client and relate to specific creatives and moments; they are not typical and not guaranteed.')}
          </p>
        )}
      </div>
    </section>
  )
}
