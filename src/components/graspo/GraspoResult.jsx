const ACCENT = '#d5ff40'

export default function GraspoResult() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-8 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">The Bigger Result</span>
        </div>

        <h2 className="font-display font-bold text-ink tracking-display leading-[1.08] text-3xl md:text-[42px]">
          Social media stopped being a publishing
          channel and became a{' '}
          <span style={{ color: ACCENT }}>market-entry engine.</span>
        </h2>

        <p className="mt-7 text-[15px] md:text-base text-ink-muted leading-relaxed">
          Over six months, Graspo went from limited visibility in Arabic-speaking markets to
          10.7M organic views and a recognizable presence in Saudi Arabia, Iraq, Morocco, Egypt
          and across the wider MENA region. More importantly, that attention landed with the
          right people: 75 unique inbound leads, 26 qualified as high priority, and 10 that
          reached an advanced, quotation-ready stage, publishers, print agencies and buyers
          who found Graspo through the content itself.
        </p>
        <p className="mt-5 text-[15px] md:text-base text-ink-muted leading-relaxed">
          None of this required paid amplification. It required a content system: strategy,
          Arabic-first production, and inbound handling working as one operation instead of
          three disconnected efforts.
        </p>
      </div>
    </section>
  )
}
