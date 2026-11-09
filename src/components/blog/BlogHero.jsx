/* CONVRT Insights masthead. Compact on purpose: headline, one line of copy, and (only while
   there are no published articles) the Coming Soon badge + line. The right-hand artwork is
   pure SVG and hidden below lg. */

export default function BlogHero({ comingSoon }) {
  return (
    <section aria-labelledby="blog-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(213,255,64,0.11) 0%, transparent 62%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 hidden h-[420px] w-[420px] rounded-full lg:block"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-8 md:px-8 md:pb-12 md:pt-12 lg:pb-14">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2.5">
              <span className="h-px w-8 bg-lime" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">CONVRT Insights</span>
            </div>

            <h1
              id="blog-h1"
              className="mt-5 font-display font-bold leading-[1.02] tracking-display-xl text-ink text-[2.6rem] min-[400px]:text-[3.1rem] sm:text-6xl lg:text-[4.4rem]"
            >
              <span className="block">Better Creative.</span>
              <span className="block text-lime">Smarter Growth.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Insights on video ads, creative strategy, SaaS marketing, and the ideas behind content that converts.
            </p>

            {comingSoon && (
              <div className="mt-7 flex flex-col items-start gap-3">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-lime/35 bg-lime/[0.07] px-4 py-1.5">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-lime opacity-60 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Coming soon</span>
                </span>
                <p className="max-w-lg text-sm leading-relaxed text-ink-muted md:text-[15px]">
                  We’re putting together practical guides, creative breakdowns, and strategies worth sharing.
                </p>
              </div>
            )}
          </div>

          <MastheadArt />
        </div>
      </div>
    </section>
  )
}

/* Three offset "pages" — an editorial stack with a lime and a pink accent. */
function MastheadArt() {
  return (
    <div aria-hidden="true" className="hidden lg:col-span-4 lg:block">
      <svg viewBox="0 0 320 300" className="mx-auto h-auto w-full max-w-[320px]" fill="none">
        <g transform="rotate(-8 130 150)">
          <rect x="40" y="36" width="170" height="220" rx="18" fill="#131316" stroke="#26262b" strokeWidth="2" />
          <rect x="58" y="58" width="134" height="84" rx="10" fill="#1c1c20" />
          <rect x="58" y="158" width="100" height="9" rx="4.5" fill="#34343a" />
          <rect x="58" y="176" width="134" height="7" rx="3.5" fill="#26262b" />
          <rect x="58" y="192" width="118" height="7" rx="3.5" fill="#26262b" />
        </g>
        <g transform="rotate(4 190 160)">
          <rect x="108" y="52" width="170" height="220" rx="18" fill="#17171b" stroke="#34343a" strokeWidth="2" />
          <rect x="126" y="74" width="134" height="84" rx="10" fill="#d5ff40" />
          <path d="M178 98 L206 116 L178 134 Z" fill="#0a0a0b" />
          <rect x="126" y="174" width="96" height="9" rx="4.5" fill="#F472B6" />
          <rect x="126" y="192" width="134" height="7" rx="3.5" fill="#34343a" />
          <rect x="126" y="208" width="104" height="7" rx="3.5" fill="#26262b" />
        </g>
        <circle cx="268" cy="44" r="7" fill="#F472B6" />
        <circle cx="40" cy="272" r="5" fill="#d5ff40" />
      </svg>
    </div>
  )
}
