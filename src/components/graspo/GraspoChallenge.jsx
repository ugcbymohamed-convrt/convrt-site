const POINTS = [
  {
    title: 'A technical business, not a lifestyle brand',
    body: 'Printing is a complex, spec-driven B2B service. There is no obvious "content" in paper weight, binding methods or offset color matching, until someone makes it interesting.',
  },
  {
    title: 'Limited local presence in Arabic markets',
    body: 'Graspo had production capability but little brand relevance in the Arabic-speaking markets it wanted to reach. Awareness had to be built from close to zero.',
  },
  {
    title: 'The audience wasn’t casual scrollers',
    body: 'The people who matter here are publishers, print buyers, agencies and business owners, not a general consumer feed. Content had to earn attention from people who make purchasing decisions.',
  },
  {
    title: 'Attention had to lead somewhere',
    body: 'Views and follows are not the goal for a printing business. The content needed to move real prospects toward a quote, a sample request or a sales conversation.',
  },
]

export default function GraspoChallenge() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">The Challenge</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            "Post more on Instagram" was never going to be the strategy.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            Real relevance in new markets, translated into serious commercial interest, not just likes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-6 text-center hover:border-hairline-strong transition-colors"
            >
              <h3 className="font-display font-semibold text-ink text-lg leading-snug">{p.title}</h3>
              <p className="mt-2.5 text-[13.5px] text-ink-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
