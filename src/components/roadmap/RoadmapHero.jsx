import { ApplyButton } from './shared.jsx'

/* ─────────────────────────────────────────────
   HERO — offer + illustrative Roadmap preview.
   The preview is a clearly-labelled EXAMPLE: it does not depict a real
   client, ad, or result.
───────────────────────────────────────────── */

const DETAILS = [
  { label: 'Angle', value: 'Problem → Solution' },
  { label: 'Format', value: 'Creator-led Video' },
  { label: 'Hook Direction', value: 'Show the friction' },
  { label: 'Objective', value: 'Demonstrate product value' },
]

export default function RoadmapHero() {
  return (
    <section aria-labelledby="roadmap-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
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

          {/* Preview */}
          <div className="min-w-0 lg:col-span-5">
            <RoadmapPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function RoadmapPreview() {
  return (
    <figure className="mx-auto w-full max-w-[480px] lg:max-w-none" aria-label="Example Creative Growth Roadmap concept">
      <div className="relative pb-9">
        {/* Hints of concepts 02–05 stacked behind — decorative only */}
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-0 top-8 rounded-3xl border border-hairline bg-surface-1/50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-3 bottom-[18px] top-4 rounded-3xl border border-hairline bg-surface-1/80"
        />

        {/* Main concept card */}
        <div className="relative overflow-hidden rounded-3xl border border-hairline-strong bg-surface-1 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

          {/* Document header */}
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Creative Growth Roadmap
            </p>
            <span className="shrink-0 rounded-full border border-lime/40 bg-lime/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
              Example
            </span>
          </div>

          <div className="px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
            {/* Concept counter */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Concept <span className="text-lime">01</span> <span className="text-ink-subtle">/ 05</span>
              </p>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-1 w-7 rounded-full bg-lime" />
                <span className="h-1 w-4 rounded-full bg-surface-3" />
                <span className="h-1 w-4 rounded-full bg-surface-3" />
                <span className="h-1 w-4 rounded-full bg-surface-3" />
                <span className="h-1 w-4 rounded-full bg-surface-3" />
              </div>
            </div>

            <p className="mt-5 font-display text-[1.6rem] font-bold leading-[1.1] tracking-display text-ink sm:text-[1.9rem]">
              The Before / After Transformation
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Show the frustration customers experience before discovering the product, then contrast it
              with the desired outcome.
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-2.5">
              {DETAILS.map((d) => (
                <div key={d.label} className="min-w-0 rounded-2xl border border-hairline bg-canvas/60 px-3.5 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">{d.label}</dt>
                  <dd className="mt-1 text-[13px] font-medium leading-snug text-ink">{d.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 flex gap-2 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-subtle">
              <span aria-hidden="true" className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
              Illustrative example. Not a tested ad or a real client result.
            </p>
          </div>
        </div>
      </div>

      <figcaption className="text-center text-xs text-ink-subtle">
        One sample concept. Your roadmap is built around your own brand.
      </figcaption>
    </figure>
  )
}
