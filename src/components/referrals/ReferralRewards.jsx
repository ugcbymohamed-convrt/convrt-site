import { trackEvent } from '../../lib/analytics.js'
import { Check, Reveal, SectionHeader } from '../roadmap/shared.jsx'
import { goToSection } from './shared.jsx'

/* ─────────────────────────────────────────────
   REWARDS — two cards. Each CTA preselects its program in the form (via `onSelect`,
   handled by ReferralsPage → ReferralForm) and scrolls to the form.

   Eligibility and payout conditions stay visible in the cards, and nothing implies
   that every submission earns a reward. Figures are exactly the program terms:
   $150 one-time (Standard) · 10% of the first qualifying project payment (Agency).
───────────────────────────────────────────── */

const CARDS = [
  {
    id: 'standard',
    eyebrow: 'Standard Referrals',
    title: 'Standard Referral',
    amount: '$150',
    amountNote: 'per successful referral',
    blurb:
      'For clients, creators, founders, and professional connections who introduce a brand that becomes a paying CONVRT client.',
    points: [
      'One-time reward per qualifying new client.',
      'Reward becomes eligible after the referred client completes their first qualifying payment and the payment clears.',
      'No limit on the number of eligible referrals.',
      'No recurring commissions.',
    ],
    cta: 'Start Referring',
    accent: {
      text: 'text-lime',
      border: 'border-lime/30 hover:border-lime/60',
      chip: 'border-lime/40 bg-lime/10 text-lime',
      check: 'border-lime/40 bg-lime/10 text-lime',
      glow: 'bg-lime/[0.07]',
      button: 'cta-gradient text-canvas focus-visible:outline-lime',
    },
  },
  {
    id: 'agency',
    eyebrow: 'Agency & Strategic Partners',
    title: 'Agency / Strategic Partner',
    amount: '10%',
    amountNote: 'of the first qualifying project payment',
    blurb:
      'For approved marketing agencies, consultants, and business partners who regularly introduce brands that need video production or creative strategy.',
    points: [
      '10% of the first eligible project payment, excluding taxes, refunds, and third-party pass-through costs.',
      'One-time commission, not a recurring revenue share.',
      'Requires approval by CONVRT before participation.',
      'Not automatically combined with the standard referral reward.',
    ],
    cta: 'Apply as a Partner',
    accent: {
      text: 'text-magenta',
      border: 'border-magenta/30 hover:border-magenta/60',
      chip: 'border-magenta/40 bg-magenta/10 text-magenta',
      check: 'border-magenta/40 bg-magenta/10 text-magenta',
      glow: 'bg-magenta/[0.07]',
      button: 'bg-magenta text-canvas hover:brightness-110 focus-visible:outline-magenta',
    },
  },
]

export default function ReferralRewards({ onSelect }) {
  return (
    <section id="rewards" aria-labelledby="rewards-heading" className="relative scroll-mt-20 py-16 md:scroll-mt-24 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="rewards-heading" eyebrow="Rewards" title="Two ways to earn.">
            Choose the program that fits how you work with brands. Eligibility and payout conditions are shown on each card.
          </SectionHeader>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {CARDS.map((card, i) => (
            <Reveal key={card.id} delay={i * 90} className="h-full">
              <article
                aria-labelledby={`reward-${card.id}-title`}
                className={`ref-card relative flex h-full flex-col overflow-hidden rounded-3xl border bg-surface-1 p-6 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)] sm:p-8 ${card.accent.border}`}
              >
                <div aria-hidden="true" className={`pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-[90px] ${card.accent.glow}`} />

                <div className="relative flex flex-1 flex-col">
                  <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${card.accent.chip}`}>
                    {card.eyebrow}
                  </span>

                  <h3 id={`reward-${card.id}-title`} className="mt-5 font-display text-xl font-bold tracking-snug text-ink">
                    {card.title}
                  </h3>

                  <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`font-display text-6xl font-bold leading-none tracking-display-xl ${card.accent.text}`}>{card.amount}</span>
                    <span className="text-base font-semibold text-ink">{card.amountNote}</span>
                  </p>

                  <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{card.blurb}</p>

                  <ul className="mt-6 space-y-3.5 border-t border-hairline pt-6">
                    {card.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-snug text-ink-muted">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${card.accent.check}`}>
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex-1" />
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent('referrals_apply_click', { location: `reward_${card.id}` })
                      onSelect(card.id)
                    }}
                    className={`group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold
                                transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                                motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100
                                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${card.accent.button}`}
                  >
                    {card.cta}
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-ink-muted">
            Rewards apply only to eligible new clients and are confirmed by CONVRT. Submitting an introduction doesn’t
            guarantee a reward or acceptance into the program.{' '}
            <a
              href="#terms"
              onClick={(e) => { e.preventDefault(); goToSection('terms') }}
              className="font-medium text-ink-muted underline underline-offset-2 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              Read the program terms
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  )
}
