/* SECTION 1: a short, text-only hero. The H1, one sentence and one quiet line of transparency, then the library starts straight away:
   no statistics, no service copy, no phone mock-ups. Dark canvas, white type, lime only on the last word and a faint glow.

   The note says what the page is: examples from independent creators. The videos here show creator styles and formats; they are not
   all CONVRT productions, and the page never claims they are. */
export default function OurWorkHero() {
  return (
    <section aria-labelledby="our-work-heading" className="relative overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[320px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.06] blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-8">
        <h1 id="our-work-heading" className="max-w-4xl font-display text-[2.4rem] font-bold leading-[1.03] tracking-display-xl text-ink sm:text-5xl md:text-6xl">
          See what&apos;s <span className="text-lime">possible.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:mt-5 md:text-lg">
          Explore real creator videos across <span className="whitespace-nowrap">e-commerce</span>, SaaS, services and more.
        </p>
        <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted/80 md:text-sm">
          Featuring examples from independent creators. Not all videos were produced by CONVRT.
        </p>
      </div>
    </section>
  )
}
