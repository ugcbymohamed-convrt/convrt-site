import { OFFER_PATHS } from '../config.js'
import { CONVRT_STATS } from '../lib/siteStats.js'
import { PRODUCTION_LANGUAGES } from '../seo/businessKnowledge.js'

/* Compact pricing hero: the packages start well within the first screen. */
const PROOF_STATS = [
  { value: CONVRT_STATS.views, label: 'Views generated' },
  { value: CONVRT_STATS.videos, label: 'Videos produced' },
  { value: CONVRT_STATS.clients, label: 'Clients served' },
  { value: String(PRODUCTION_LANGUAGES.core.length), label: 'Core production languages' },
]

export default function CreativeTestingHero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[360px] w-[800px] -translate-x-1/2 rounded-full bg-lime/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-8 pb-7 md:px-8 md:pt-9 md:pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          UGC &amp; video production pricing
        </div>

        <h1
          className="mt-4 font-display font-semibold text-ink tracking-display-xl leading-[1.06]"
          style={{ fontSize: 'clamp(1.9rem, 3.7vw, 2.7rem)' }}
        >
          More concepts. Better creative. <span className="text-lime">Clear pricing.</span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-[15px] md:text-base text-ink-muted leading-relaxed">
          Human-led video ads and social content, built around your brand and creative goals. Full production,
          transparent pricing and no surprises.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href={OFFER_PATHS.roadmap}
            className="cta-gradient group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-canvas"
          >
            Get 5 Free Ad Concepts
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none">
              <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#packages"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-hairline px-7 py-3 text-sm font-medium text-ink hover:text-lime hover:border-hairline-strong transition-colors"
          >
            Explore Packages
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="mt-5 mx-auto max-w-2xl rounded-2xl border border-hairline bg-hairline overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px">
            {PROOF_STATS.map((stat) => (
              <div key={stat.label} className="bg-surface-1/90 px-3 py-3 text-center">
                <p className="font-display font-bold text-ink text-base md:text-lg tracking-display tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-ink-muted leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
