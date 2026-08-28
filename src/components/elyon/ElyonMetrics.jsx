import { useInView } from '../caseStudies/shared/useInView.js'
import { ACCENT } from './theme.js'

const METRICS = [
  { value: '160+', label: 'Creatives Produced', sub: 'Full library, and counting' },
  { value: '4', label: 'Production Locations', sub: 'Prague, Almería, Granada, Marbella' },
  { value: '5.28x', label: 'Peak ROAS', sub: 'Single standout creative' },
  { value: '3.63x', label: 'Average ROAS', sub: 'Early four-creative test' },
]

export default function ElyonMetrics() {
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
                {m.value}
              </p>
              <p className="relative mt-3 text-[13px] font-semibold text-ink">{m.label}</p>
              <p className="relative mt-1 text-[11.5px] text-ink-subtle">{m.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-ink-subtle">
          160+ spans every batch, format and follow-up variation produced since launch, not a single
          delivery. Source: client-shared Meta Ads Manager results and internal production tracker.
        </p>
      </div>
    </section>
  )
}
