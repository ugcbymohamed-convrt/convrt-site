import { useInView } from '../caseStudies/shared/useInView.js'

/* ─────────────────────────────────────────────
   Makes "starting with CONVRT" concrete instead of leaving the only
   proposition as "book a call and maybe hire us." References the
   real, live Creative Testing Sprint offer (src/components/
   CreativeTestingOffer.jsx / CreativeTestingHero.jsx) — name and
   timeline verified against that page, no pricing restated here to
   keep this landing page's own commercial framing consistent with
   its FAQ answer on cost.
───────────────────────────────────────────── */

export default function ScaleFirstEngagement() {
  const [ref, visible] = useInView(0.15)

  return (
    <section className="relative py-12 md:py-16">
      <div ref={ref} className="mx-auto max-w-4xl px-5 md:px-8">
        <FadeUp show={visible} delay={0}>
          <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-10 md:py-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime mb-3">Lower-Risk Entry</p>
                <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.15] text-2xl md:text-[32px]">
                  You can test the relationship before you scale it.
                </h2>
                <p className="mt-4 text-[15px] text-ink-muted leading-relaxed max-w-xl">
                  Most engagements start as a focused Creative Testing Sprint: a defined batch of
                  concepts, scripts and production built around your paid-social goals, not an
                  open-ended retainer. It's how you see how CONVRT thinks and delivers before
                  deciding how far to take it.
                </p>
                <p className="mt-4 text-[13px] text-ink-subtle">
                  Typical first sprint: about 10 business days from script approval to delivery.
                </p>
              </div>

              <a
                href="/pricing"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-ink hover:text-lime hover:border-hairline-strong transition-colors whitespace-nowrap"
              >
                See what's included
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

function FadeUp({ children, show, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
