import { trackEvent } from '../../lib/analytics.js'
import { Check, Reveal, SectionHeader } from '../roadmap/shared.jsx'
import { goToSection } from './shared.jsx'

/* ─────────────────────────────────────────────
   EVERYONE WINS — two reward cards + the FREE Creative Upgrade strip.

   Each card CTA preselects its program in the form (via `onSelect`, handled by
   ReferralsPage → ReferralForm) and scrolls to the form.

   Figures are exactly the program terms: $150 one-time (Standard, cash or production
   credit) · 10% of the first qualifying project payment, capped at $500 per referred client
   (Agency & Strategic). The cap is stated on the card, in the terms and in the FAQ.
   The Creative Upgrade is deliberately specific about what it is and isn't: two additional
   EDIT-BASED variations of the approved project assets, on the first qualifying PAID video
   project. It is not a new production, not exchangeable for cash, and it is separate from
   the free Roadmap / free production trial / free hooks offers.
───────────────────────────────────────────── */

const CARDS = [
  {
    id: 'standard',
    eyebrow: 'Standard Referrals',
    title: 'Standard Referral Partner',
    lead: 'Earn',
    amount: '$150',
    blurb: 'Introduce a brand that becomes a CONVRT client and receive $150 cash or production credit.',
    points: [
      'One-time reward.',
      'Eligible new clients only.',
      'No selling required.',
      'Unlimited eligible introductions.',
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
    title: 'Agency & Strategic Partner',
    lead: 'Earn',
    amount: '10%',
    cap: 'up to $500',
    capNote: 'Per referred client. For example, a $5,000 first payment earns $500, the maximum.',
    blurb:
      'Connect your clients with high-quality video production and earn 10% of their first qualifying project payment, up to $500.',
    points: [
      'Designed for agencies and consultants.',
      'First qualifying project only. Capped at $500 per referred client.',
      'Dedicated approval process.',
      'Potential for deeper collaboration.',
    ],
    cta: 'Become an Agency Partner',
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

/* The fine print, kept next to the offer instead of hidden in the terms. */
export const UPGRADE_POINTS = [
  'Additional to the standard deliverables of the package they buy. Variations already included in the package don’t count.',
  'Edit-based variations made from the approved footage, voiceover and graphics: new hooks, openings, text overlays or CTA endings.',
  'Not a new production: no extra filming, creator sourcing or shoot days, and no new video concepts are included.',
  'Applies to the first qualifying paid video project. Not exchangeable for cash, and it doesn’t automatically stack with the free production trial.',
  'Eligibility and delivery specifications are confirmed before purchase. No specific results are promised.',
]

export default function ReferralRewards({ onSelect }) {
  return (
    <section id="rewards" aria-labelledby="rewards-heading" className="relative scroll-mt-20 py-16 md:scroll-mt-24 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="rewards-heading" eyebrow="Everyone wins" title="One Introduction. Two Winners.">
            When you introduce the right brand to CONVRT, everyone gets something valuable.
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
                    <span className="text-base font-semibold text-ink">{card.lead}</span>
                    <span className={`font-display text-6xl font-bold leading-none tracking-display-xl ${card.accent.text}`}>{card.amount}</span>
                    {card.cap && (
                      <span className={`font-display text-2xl font-bold leading-none tracking-snug sm:text-3xl ${card.accent.text}`}>{card.cap}</span>
                    )}
                  </p>
                  {card.capNote && <p className="mt-2 text-sm leading-snug text-ink-muted">{card.capNote}</p>}

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
                      trackEvent('referral_cta_click', { location: `reward_${card.id}` })
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

        {/* FREE Creative Upgrade strip */}
        <Reveal delay={140}>
          <aside
            aria-labelledby="upgrade-heading"
            className="relative mt-6 overflow-hidden rounded-3xl border border-lime/30 bg-gradient-to-r from-lime/[0.09] via-surface-1 to-magenta/[0.09] p-6 sm:p-8 lg:mt-8"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className="lg:col-span-5">
                <span className="inline-flex w-fit items-center rounded-full border border-magenta/40 bg-magenta/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-magenta">
                  For the brand you refer
                </span>
                <h3 id="upgrade-heading" className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-display text-ink sm:text-[1.7rem]">
                  Your referral gets a <span className="text-lime">FREE Creative Upgrade</span>
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink-muted">
                  Two additional ready-to-test video ad variations on their first qualifying paid project.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  It’s a separate bonus for paid production, not an extra free video, and it’s different from the Free
                  Creative Growth Roadmap, the Free Video Production Trial and the 10 Free Ad Hooks.
                </p>
              </div>
              <ul className="space-y-3 lg:col-span-7">
                {UPGRADE_POINTS.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-snug text-ink-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-ink-muted">
            Rewards apply only to eligible new clients and are confirmed by CONVRT. Submitting an introduction doesn’t
            guarantee a reward or acceptance into the program.
            <a
              href="#terms"
              onClick={(e) => { e.preventDefault(); goToSection('terms') }}
              className="mx-auto mt-1 flex min-h-[44px] w-fit items-center font-medium text-ink-muted underline underline-offset-2 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              Read the program terms
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
