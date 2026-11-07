import { trackEvent } from '../../lib/analytics.js'
import { scrollToApply } from '../../lib/roadmapForm.js'
import { Check } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   HERO — leads with the offer ("1 FREE Video Production"), then the
   risk-free framing, one CTA that scrolls to the application, and a card of
   what's included.
───────────────────────────────────────────── */

const INCLUDED = [
  { title: '1 video produced by CONVRT', note: 'Built around your brand, offer and audience.' },
  { title: '2 bonus hook variations', note: 'Extra openings to test against the original.' },
  { title: 'Zero risk, no obligation', note: 'Use it, test it, then decide if we’re a fit.' },
]

export default function RiskFreeHero() {
  return (
    <section aria-labelledby="risk-free-h1" className="relative overflow-hidden">
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
                Risk-Free Trial · By Application
              </span>
            </div>

            <h1
              id="risk-free-h1"
              className="mt-6 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.6rem] min-[400px]:text-[3.2rem] sm:text-[3.6rem] md:text-[4.2rem] lg:text-[3.4rem] xl:text-[4.2rem]"
            >
              <span className="block">1 <span className="text-lime">FREE</span></span>
              <span className="block">Video Production</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              <span className="font-semibold text-ink">Try CONVRT risk free. See if you qualify.</span>
              <br />
              Apply for a complimentary video ad produced by our team, with two bonus hook variations to test. We
              review every application and invite the right-fit brands to a short call before anything goes into
              production.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-start">
              <a
                href="#apply"
                onClick={(e) => {
                  e.preventDefault()
                  trackEvent('risk_free_apply_click', { location: 'hero' })
                  scrollToApply()
                }}
                className="cta-gradient group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas sm:w-auto
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                See If You Qualify
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
              </a>
              <div className="text-sm leading-relaxed text-ink-subtle">
                <p>Takes about two minutes. No obligation.</p>
                <p>Limited availability, reviewed by our team. Subject to fit and production conditions.</p>
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="min-w-0 lg:col-span-5">
            <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">What you get</p>
              <ul className="mt-5 space-y-5">
                {INCLUDED.map((item) => (
                  <li key={item.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block font-display text-[17px] font-bold leading-snug tracking-snug text-ink">{item.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{item.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
