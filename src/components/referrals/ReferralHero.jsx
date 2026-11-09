import { trackEvent } from '../../lib/analytics.js'
import { scrollToApply } from '../../lib/roadmapForm.js'
import { Arrow, ScrollCta, goToSection } from './shared.jsx'

/* ─────────────────────────────────────────────
   HERO — headline, supporting copy, two CTAs (form / explanation), one credibility
   line and a lightweight CSS + SVG "You Refer → We Create → You Get Rewarded" graphic.

   Credibility line: uses ONLY the production figure already published on the
   homepage (Founder section: "750+ creatives produced"). Nothing new is claimed.
───────────────────────────────────────────── */

const JOURNEY = [
  {
    title: 'You Refer',
    note: 'Introduce a brand that needs better-performing video ads.',
    tone: 'lime',
    icon: (
      <path d="M4 12h12m0 0-5-5m5 5-5 5M20 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'We Create',
    note: 'We review the fit and, when it makes sense, make the ads.',
    tone: 'ink',
    icon: (
      <>
        <rect x="3.5" y="6" width="17" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.5 9.7v4.6l4-2.3-4-2.3Z" fill="currentColor" />
      </>
    ),
  },
  {
    title: 'You Get Rewarded',
    note: 'Receive your reward once the program conditions are met.',
    tone: 'magenta',
    icon: (
      <>
        <path d="M4.5 10.5h15v9h-15v-9ZM3.5 7h17v3.5h-17V7ZM12 7v12.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 7C10 7 8 6.2 8 4.7 8 3.6 9 3 10 3.4c1.2.5 2 2 2 3.6Zm0 0c2 0 4-.8 4-2.3 0-1.1-1-1.7-2-1.3-1.2.5-2 2-2 3.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </>
    ),
  },
]

const TONE = {
  lime: 'border-lime/50 bg-lime/10 text-lime',
  ink: 'border-hairline-strong bg-surface-2 text-ink',
  magenta: 'border-magenta/50 bg-magenta/10 text-magenta',
}

export default function ReferralHero() {
  return (
    <section aria-labelledby="referrals-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/3 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 -right-40 h-[420px] w-[520px] rounded-full bg-magenta/[0.07] blur-[150px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur sm:rounded-full">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted min-[400px]:text-[11px] min-[400px]:tracking-[0.16em] sm:text-xs sm:tracking-[0.18em]">
                Referral Partner Program
              </span>
            </div>

            <h1
              id="referrals-h1"
              className="mt-6 font-display font-bold text-ink tracking-display-xl leading-[1.05] text-[2.5rem] min-[400px]:text-[3rem] sm:text-[3.6rem] md:text-[4.2rem] lg:text-[3.4rem] xl:text-[4.2rem]"
            >
              Great Connections Deserve <span className="text-lime">Great Rewards.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Know a brand that needs better-performing video ads? Introduce them to CONVRT and get rewarded when
              they become a client.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <ScrollCta
                href="#apply"
                variant="primary"
                className="w-full sm:w-auto min-h-[56px] md:min-h-[60px]"
                onGo={() => {
                  trackEvent('referrals_apply_click', { location: 'hero' })
                  scrollToApply()
                }}
              >
                Become a Referral Partner <Arrow />
              </ScrollCta>
              <ScrollCta
                href="#how-it-works"
                variant="ghost"
                className="w-full sm:w-auto min-h-[56px] md:min-h-[60px]"
                onGo={() => {
                  trackEvent('referrals_how_it_works_click', { location: 'hero' })
                  goToSection('how-it-works')
                }}
              >
                See How It Works
              </ScrollCta>
            </div>

            <p className="mt-6 flex max-w-xl items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">750+ creatives produced</span> by CONVRT for
                e-commerce, SaaS and retail brands, including returning clients and long-term retainers.
              </span>
            </p>
          </div>

          {/* Journey graphic */}
          <div className="min-w-0 lg:col-span-5">
            <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">The referral journey</p>
              <ol className="mt-6" aria-label="The referral journey: You Refer, We Create, You Get Rewarded">
                {JOURNEY.map((step, i) => {
                  const last = i === JOURNEY.length - 1
                  return (
                    <li key={step.title} className={`relative flex items-start gap-4 ${last ? '' : 'pb-9'}`}>
                      <span className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${TONE[step.tone]}`}>
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">{step.icon}</svg>
                      </span>
                      {!last && (
                        <span
                          aria-hidden="true"
                          className="absolute left-6 top-14 bottom-1.5 w-px -translate-x-1/2 overflow-hidden bg-hairline-strong"
                        >
                          <span
                            className="ref-pulse absolute inset-x-0 top-0 block h-full bg-gradient-to-b from-transparent via-lime to-transparent"
                            style={{ animationDelay: `${i * 1.2}s` }}
                          />
                        </span>
                      )}
                      <div className="min-w-0 pt-0.5">
                        <p className="font-display text-xl font-bold leading-tight tracking-snug text-ink">
                          <span className="mr-2 text-sm font-semibold tabular-nums text-ink-muted" aria-hidden="true">0{i + 1}</span>
                          {step.title}
                        </p>
                        <p className="mt-1.5 text-sm leading-snug text-ink-muted">{step.note}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
