import { useInView } from '../caseStudies/shared/useInView.js'

/* Agency-grade qualification language — no "cheapest possible video"
   commodity-marketplace framing. */

const GOOD_FIT = [
  'You’re actively investing in paid social, or preparing to scale it',
  'Your team needs more distinct creative ideas to test',
  'Creative fatigue or production velocity is becoming a bottleneck',
  'You want strategy and execution connected, not handled separately',
  'You have a team capable of launching and learning from creative tests',
]

const NOT_FIT = [
  'You’re not currently in a position to test paid acquisition',
  'You expect a single creative to guarantee performance',
  'You mainly need organic influencer distribution',
  'You want production without any strategic input',
  'Your team can’t currently act on creative learnings',
]

export default function ScaleFit() {
  const [ref, visible] = useInView(0.1)

  return (
    <section className="relative py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-5xl px-5 md:px-8">
        <FadeUp show={visible} delay={0} className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Fit Check</span>
            <span className="h-px w-8 bg-lime" />
          </div>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.15] text-3xl md:text-[40px]">
            Is CONVRT the right creative partner?
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FadeUp show={visible} delay={120}>
            <div className="h-full rounded-3xl border border-lime/20 bg-lime/[0.04] px-7 py-8">
              <h3 className="font-display font-semibold text-ink text-lg">Good fit</h3>
              <ul className="mt-5 space-y-3.5">
                {GOOD_FIT.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-ink-muted leading-relaxed">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-lime" fill="none">
                      <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <FadeUp show={visible} delay={200}>
            <div className="h-full rounded-3xl border border-hairline bg-surface-1/30 px-7 py-8">
              <h3 className="font-display font-semibold text-ink text-lg">Not the right fit — yet</h3>
              <ul className="mt-5 space-y-3.5">
                {NOT_FIT.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-ink-muted leading-relaxed">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
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
