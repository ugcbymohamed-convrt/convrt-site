import { CREATOR_EXAMPLES_NOTE } from '../../content/attribution.js'
import { tr } from '../../i18n/tr.js'

/* SECTION 1: a short, text-only hero. The H1 and one sentence, then the library starts straight away: no statistics, no service copy,
   no phone mock-ups. Dark canvas, white type, lime only on the last word and a faint glow.

   The attribution line under the intro (CREATOR_EXAMPLES_NOTE) says the videos are examples from independent creators and not necessarily CONVRT
   productions; it was added in the SEO/GEO Batch 1 (owner decision, Nov 2026) so the visible copy matches the SEO description. */
export default function OurWorkHero() {
  return (
    <section aria-labelledby="our-work-heading" className="relative overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[320px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.06] blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-8">
        <h1 id="our-work-heading" className="max-w-4xl font-display text-[2.4rem] font-bold leading-[1.03] tracking-display-xl text-ink sm:text-5xl md:text-6xl">
          {tr("See what's")} <span className="text-lime">{tr('possible.')}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:mt-5 md:text-lg">{tr('Explore real creator videos across')}{' '}<span className="whitespace-nowrap">{tr('e-commerce')}</span>{tr(', SaaS, services and more.')}</p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-muted">{tr(CREATOR_EXAMPLES_NOTE)}</p>
      </div>
    </section>
  )
}
