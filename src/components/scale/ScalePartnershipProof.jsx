import { useInView } from '../caseStudies/shared/useInView.js'

/* ─────────────────────────────────────────────
   Replaces the old marketplace-style review cards. No Fiverr, no
   star ratings, and nothing centered on Mohamed personally — this is
   proof of the PARTNERSHIP, stated as fact wherever possible.

   Elyon and Adscale: their original quotes ("Mohamed was amazing…",
   "Working with Mohamad…") speak primarily about Mohamed personally,
   so per instructions they aren't reused here — the relationship
   facts they support (repeat engagement, scope, cadence) are stated
   directly instead, without inventing anything not already verified
   elsewhere on the site (Testimonials.jsx / ElyonMetrics.jsx).

   Talk360's original quote is genuinely brand-level (no personal name
   in it), so it's kept verbatim as the one direct quote in this
   section, unaltered.
───────────────────────────────────────────── */

const PARTNERS = [
  {
    id: 'elyon',
    logo: '/clients/elyon.png',
    client: 'Elyon Dubai',
    scope: 'Luxury Fragrance · Paid Social',
    proof: 'Ongoing creative partner since launch — 160+ creatives produced across 4 production locations.',
    quote: null,
    logoRounded: false,
  },
  {
    id: 'adscale',
    logo: '/clients/adscale.png',
    client: 'Adscale',
    scope: 'SaaS · Paid Social',
    proof: 'Second engagement and counting — UGC built specifically to scale paid ads.',
    quote: null,
    logoRounded: false,
  },
  {
    id: 'talk360',
    logo: '/clients/talk360.jpg',
    client: 'Talk360',
    scope: 'Mobile App · International',
    proof: null,
    quote: 'The videos are amazing again. Every time we work together the quality just keeps getting better. Fast delivery, great communication, and the content performs exactly the way we need it to. This is our third order and it won’t be the last.',
    logoRounded: true,
  },
]

export default function ScalePartnershipProof() {
  const [ref, visible] = useInView(0.1)

  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[380px] w-[640px] rounded-full bg-lime/[0.04] blur-[150px]"
      />

      <div ref={ref} className="relative mx-auto max-w-6xl px-5 md:px-8">
        <FadeUp show={visible} delay={0} className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Partnership Proof</span>
          </div>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.1] text-3xl md:text-[42px]">
            Clients that keep coming back.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PARTNERS.map((p, i) => (
            <FadeUp key={p.id} show={visible} delay={110 + i * 90}>
              <div className="h-full flex flex-col gap-5 rounded-3xl border border-hairline bg-surface-1/40 backdrop-blur-md px-6 py-7">
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={p.logo}
                    alt={`${p.client} logo`}
                    className="h-9 w-auto object-contain"
                    style={{ borderRadius: p.logoRounded ? '10px' : 0, maxWidth: p.logoRounded ? '36px' : '110px' }}
                  />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 text-[10.5px] font-semibold text-lime whitespace-nowrap">
                    Repeat Partner
                  </span>
                </div>

                <div className="flex-1">
                  {p.quote ? (
                    <blockquote className="text-[14px] leading-[1.7] text-ink-subtle">"{p.quote}"</blockquote>
                  ) : (
                    <p className="text-[14px] leading-[1.7] text-ink-muted">{p.proof}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-hairline">
                  <p className="text-sm font-semibold text-ink">{p.client}</p>
                  <p className="text-[12px] text-ink-muted mt-0.5">{p.scope}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
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
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
