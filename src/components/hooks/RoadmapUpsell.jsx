import { OFFER_PATHS } from '../../config.js'
import { Reveal } from './shared.jsx'

/* SECTION 2 — one compact next step for visitors who want more than a hook
   library: the Free Creative Growth Roadmap. */

export default function RoadmapUpsell() {
  return (
    <section aria-labelledby="roadmap-upsell-heading" className="relative overflow-hidden py-14 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[900px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.07] blur-[130px]"
      />
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <h2
          id="roadmap-upsell-heading"
          className="font-display text-[1.9rem] font-bold leading-[1.1] tracking-display text-ink sm:text-4xl md:text-[2.75rem]"
        >
          Want Us to Handle the Hooks <span className="text-lime">AND the Full Ad Concepts?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
          Get 5 personalized ad concepts built around your brand, audience, and growth goals. We’ll develop the creative
          directions and walk you through them in a free strategy session.
        </p>
        <div className="mt-8 flex flex-col items-stretch sm:items-center">
          <a
            href={OFFER_PATHS.roadmap}
            className="cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
          >
            Get My 5 Free Ad Concepts
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
          </a>
          <p className="mt-4 text-sm text-ink-subtle">For qualifying SaaS and e-commerce brands. No obligation.</p>
        </div>
      </Reveal>
    </section>
  )
}
