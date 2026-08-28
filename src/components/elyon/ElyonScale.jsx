import { useInView } from '../caseStudies/shared/useInView.js'
import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'

const STAGES = [
  { step: '01', tag: 'Initial Batch', value: '30', label: 'Interview-style deliverables' },
  { step: '02', tag: 'Expansion', value: '22', label: 'Spanish-language interviews' },
  { step: '03', tag: 'Ongoing Library', value: '160+', label: 'Creatives to date' },
]

export default function ElyonScale() {
  const [ref, visible] = useInView()

  return (
    <section
      className="relative py-14 md:py-20 border-y"
      style={{ borderColor: 'rgba(201,166,104,0.12)', background: 'rgba(201,166,104,0.02)' }}
    >
      <div ref={ref} className="mx-auto max-w-5xl px-5 md:px-8 text-center">
        <Eyebrow label="Scale" accent={ACCENT} className="mb-6" />
        <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
          When a creative wins,
          <br />
          you don't stop. You build around it.
        </h2>

        <div className="mt-12 flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-0">
          {STAGES.map((s, i) => (
            <div key={s.step} className="flex flex-1 items-stretch">
              <div
                className="flex-1 rounded-3xl border px-6 py-7 sm:rounded-none sm:border-y sm:border-l sm:first:rounded-l-3xl sm:last:rounded-r-3xl sm:last:border-r"
                style={{
                  borderColor: 'rgba(201,166,104,0.16)',
                  background: 'rgba(255,255,255,0.02)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.6s ${i * 110}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${i * 110}ms cubic-bezier(0.22,1,0.36,1)`,
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
                  {s.step} &middot; {s.tag}
                </p>
                <p className="mt-3 font-display font-bold tabular-nums leading-none text-[clamp(1.9rem,4vw,2.6rem)] text-ink">
                  {s.value}
                </p>
                <p className="mt-2 text-[13px] text-ink-muted">{s.label}</p>
              </div>

              {i < STAGES.length - 1 && (
                <div
                  className="hidden shrink-0 items-center justify-center px-2 sm:flex"
                  style={{
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.5s ${i * 110 + 200}ms ease`,
                  }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                    <path d="M2 8h10M9 4l4 4-4 4" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-[15px] text-ink-muted leading-relaxed max-w-2xl mx-auto">
          As results landed, production scope kept growing across new locations and formats.
          Performance opened the conversation for a{' '}
          <span className="font-semibold text-ink">7-video weekly creative cadence.</span>
        </p>
      </div>
    </section>
  )
}
