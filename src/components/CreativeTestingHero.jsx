import { BOOKING_URL } from '../config.js'

const PROOF_STATS = [
  { value: '30M+', label: 'Views generated' },
  { value: '1,000+', label: 'Videos produced' },
  { value: '400+', label: 'Clients served' },
  { value: '4', label: 'Languages available' },
]

export default function CreativeTestingHero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
      />

      <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-14 md:px-8 md:pt-20 md:pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          CONVRT Creative Testing Sprint
        </div>

        <h1
          className="mt-6 font-display font-semibold text-ink tracking-display-xl leading-[1.05] md:whitespace-nowrap"
          style={{ fontSize: 'clamp(2.25rem, 4.6vw, 3.5rem)' }}
        >
          Find winning ad concepts <span className="text-lime">faster.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-ink-muted leading-relaxed">
          Most brands do not need more minor variations. They need genuinely different ideas to
          test. CONVRT develops distinct concepts, scripts, hooks, formats, and angles, then
          turns them into platform-ready ads with a clear testing plan.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-gradient group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
          >
            Discuss Your Sprint
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none">
              <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#packages"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-hairline px-7 py-3.5 text-sm font-medium text-ink hover:text-lime hover:border-hairline-strong transition-colors"
          >
            See What&rsquo;s Included
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="mt-8 mx-auto max-w-2xl rounded-2xl border border-hairline bg-hairline overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px">
            {PROOF_STATS.map((stat) => (
              <div key={stat.label} className="bg-surface-1/90 px-4 py-4 text-center">
                <p className="font-display font-bold text-ink text-lg md:text-xl tracking-display tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] text-ink-muted leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
