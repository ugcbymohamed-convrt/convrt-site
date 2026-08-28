import { useInView } from '../caseStudies/shared/useInView.js'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'
import { trackEvent } from '../../lib/analytics.js'

/* ─────────────────────────────────────────────
   Outcome-led, not explainer-led — the full Challenge/Approach story
   lives on the actual case-study pages these link to. Here we only
   need enough context to make the metric believable.

   Elyon leads because it's the paid-acquisition result (ROAS). Graspo
   is retained but reordered: its lead metric is now the qualified
   inbound leads it generated (a commercial outcome), with the organic
   view count demoted to a secondary line rather than the headline —
   per the requirement to keep vanity/organic metrics lower in the
   hierarchy on a paid-acquisition page. Figures match
   ElyonMetrics.jsx / GraspoMetrics.jsx exactly.
───────────────────────────────────────────── */

const STUDIES = [
  {
    id: 'elyon',
    accent: '#c9a668',
    accentSoft: 'rgba(201,166,104,0.10)',
    accentBorder: 'rgba(201,166,104,0.25)',
    logo: '/clients/elyon.png',
    brand: 'Elyon Dubai',
    category: 'Luxury Fragrance · Paid Social',
    context: 'Paid-social creative that took a launch-stage fragrance brand to a verified 5.28x ROAS.',
    metricValue: '5.28x',
    metricLabel: 'Peak ROAS on a standout creative',
    subStat: { value: '160+', label: 'Creatives produced' },
    href: '/case-studies/elyon',
  },
  {
    id: 'graspo',
    accent: '#d5ff40',
    accentSoft: 'rgba(213,255,64,0.08)',
    accentBorder: 'rgba(213,255,64,0.22)',
    logo: '/clients/graspo.png',
    brand: 'Graspo',
    category: 'Printing & Manufacturing · Content System',
    context: 'An Arabic-first content system that turned a printing company into real sales conversations.',
    metricValue: '75',
    metricLabel: 'Qualified inbound leads generated',
    subStat: { value: '10.7M', label: 'Organic views (secondary)' },
    href: '/case-studies/graspo',
  },
]

export default function ScaleCaseStudies() {
  const [ref, visible] = useInView(0.08)

  return (
    <section className="relative py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeUp show={visible} delay={0} className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Proof</span>
            <span className="h-px w-8 bg-lime" />
          </div>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.1] text-3xl md:text-[42px]">
            Don't take our word for it.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STUDIES.map((s, i) => (
            <FadeUp key={s.id} show={visible} delay={120 + i * 90}>
              <article
                className="relative h-full flex flex-col overflow-hidden rounded-3xl border px-7 py-8"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full blur-[70px]"
                  style={{ background: s.accentSoft }}
                />

                <div className="relative flex items-center justify-between gap-3">
                  <img src={s.logo} alt={s.brand} className="h-8 w-auto object-contain [filter:brightness(0)_invert(1)] opacity-85" />
                  <span
                    className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                    style={{ borderColor: s.accentBorder, background: s.accentSoft, color: s.accent }}
                  >
                    {s.category}
                  </span>
                </div>

                <div className="relative mt-7">
                  <p
                    className="font-display font-bold tracking-display-xl leading-none text-[clamp(2.8rem,7.5vw,3.9rem)] tabular-nums"
                    style={{ color: s.accent }}
                  >
                    {s.metricValue}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted leading-snug max-w-[28ch]">{s.metricLabel}</p>
                </div>

                <div className="relative mt-4 flex items-center gap-2 text-xs text-ink-subtle">
                  <span className="font-semibold text-ink">{s.subStat.value}</span>
                  {s.subStat.label}
                </div>

                <p className="relative mt-6 text-[13.5px] text-ink-muted leading-relaxed flex-1">{s.context}</p>

                <a
                  href={s.href}
                  onClick={() => trackEvent('case_study_click', { page: 'scale', study: s.id })}
                  className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-lime transition-colors"
                >
                  View full case study
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </article>
            </FadeUp>
          ))}
        </div>

        <FadeUp show={visible} delay={300} className="mt-9 text-center">
          <DiscoveryCallButton location="case_studies" />
        </FadeUp>
      </div>
    </section>
  )
}

function FadeUp({ children, show, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
