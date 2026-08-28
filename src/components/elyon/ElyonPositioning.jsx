import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'

const PRINCIPLES = [
  {
    number: '01',
    title: 'Protect the premium brand',
    body: 'Every format still had to feel like Elyon, not a generic template dressed up with a logo.',
  },
  {
    number: '02',
    title: 'Build for purchases, not views',
    body: 'Creative was evaluated against spend, purchases and ROAS, not likes or watch time.',
  },
  {
    number: '03',
    title: 'Turn winners into systems',
    body: 'Strong results became the starting point for the next batch of variations and production.',
  },
]

export default function ElyonPositioning() {
  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* LEFT — headline + framing */}
          <div className="lg:col-span-5">
            <Eyebrow label="The Approach" accent={ACCENT} className="mb-6" />
            <h2 className="font-display font-bold text-ink tracking-display leading-[1.08] text-3xl md:text-[40px]">
              Built as a performance system, not a one-off production.
            </h2>
            <p className="mt-5 text-[15px] md:text-base text-ink-muted leading-relaxed">
              CONVRT ran Elyon's creative as a repeatable engine, strategy, production and iteration
              working together, so every result fed the next batch instead of ending with delivery.
            </p>
          </div>

          {/* RIGHT — stacked principles */}
          <div className="lg:col-span-7 flex flex-col divide-y" style={{ borderColor: 'transparent' }}>
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.number}
                className={`flex items-start gap-5 py-6 ${i === 0 ? 'pt-0' : ''}`}
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,166,104,0.14)' }}
              >
                <span
                  className="shrink-0 font-display font-bold tabular-nums leading-none text-2xl md:text-3xl"
                  style={{ color: ACCENT, opacity: 0.65 }}
                >
                  {p.number}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-ink text-lg md:text-xl leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] md:text-[14px] text-ink-muted leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
