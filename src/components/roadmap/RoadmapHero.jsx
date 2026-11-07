import { ApplyButton } from './shared.jsx'
import ConceptCardsVisual from './ConceptCardsVisual.jsx'
import { softGlow } from '../../lib/glow.js'

/* ─────────────────────────────────────────────
   HERO — the offer, one CTA, and an animated stage of floating concept
   cards (see ConceptCardsVisual.jsx).
───────────────────────────────────────────── */

export default function RoadmapHero() {
  return (
    <section aria-labelledby="roadmap-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[480px] left-1/2 h-[1200px] w-[1740px] -translate-x-1/2 soft-glow" style={{ background: softGlow('#d5ff40', 0.1, 1100, 560, 160) }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur sm:rounded-full">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted min-[400px]:text-[11px] min-[400px]:tracking-[0.16em] sm:text-xs sm:tracking-[0.18em]">
                Free Creative Strategy · By Application
              </span>
            </div>

            <h1 className="mt-6 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.2rem] min-[400px]:text-[2.75rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[2.75rem] xl:text-[3.6rem]">
              <span className="block">Your Next 5 Ad Concepts.</span>
              <span className="block">Built for Your Brand.</span>
              <span className="block text-lime">On Us.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              <span className="font-semibold text-ink">Stop guessing what ad to create next.</span>
              <br />
              Get five personalized advertising concepts built around your brand, audience, and growth
              goals, presented in a free creative strategy session with CONVRT.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-start">
              <ApplyButton location="hero" className="w-full sm:w-auto" />
              <div className="text-sm leading-relaxed text-ink-subtle">
                <p>For qualifying SaaS and e-commerce brands. No obligation.</p>
                <p>Takes about a minute. Qualifying brands can book right away.</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="min-w-0 lg:col-span-5">
            <ConceptCardsVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
