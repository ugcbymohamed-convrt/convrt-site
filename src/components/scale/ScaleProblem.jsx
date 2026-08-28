import { useInView } from '../caseStudies/shared/useInView.js'

const SYMPTOMS = [
  'Too few new concepts entering the testing queue',
  'Endless variations of the same idea, not new ones',
  'Creators who execute but don’t think strategically',
  'Production cycles too slow to keep up with spend',
  'Creative fatigue eating into performance week over week',
  'Creative decisions made on taste, not on testing',
]

export default function ScaleProblem() {
  const [ref, visible] = useInView(0.15)

  return (
    <section className="relative py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-4xl px-5 md:px-8 text-center">
        <FadeUp show={visible} delay={0}>
          <div className="inline-flex items-center gap-2.5 mb-6">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">The Bottleneck</span>
          </div>
        </FadeUp>

        <FadeUp show={visible} delay={90}>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.1] text-3xl md:text-[44px]">
            More ads aren't the answer. <span className="text-lime">Better bets are.</span>
          </h2>
        </FadeUp>

        <FadeUp show={visible} delay={180}>
          <p className="text-balance mt-6 text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Paid acquisition needs a continuous supply of new creative hypotheses. Media buyers can
            optimize targeting, budgets and bidding, but weak or exhausted creative eventually becomes
            the ceiling on growth. In practice, that looks like:
          </p>
        </FadeUp>

        <FadeUp show={visible} delay={260}>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            {SYMPTOMS.map((s) => (
              <div
                key={s}
                className="flex items-start gap-3 rounded-2xl border border-hairline bg-surface-1/40 px-5 py-4"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                <span className="text-[13.5px] text-ink-muted leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
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
        transform: show ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
