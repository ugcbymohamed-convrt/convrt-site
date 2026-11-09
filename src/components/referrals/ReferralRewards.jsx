import { trackEvent } from '../../lib/analytics.js'
import { Check, Reveal, SectionHeader } from '../roadmap/shared.jsx'
import { TermsLink } from './shared.jsx'

/* ─────────────────────────────────────────────
   EVERYONE WINS — two reward cards + the FREE Creative Upgrade strip.

   Each card CTA preselects its program in the form (via `onSelect`, handled by
   ReferralsPage → ReferralForm) and scrolls to the form.

   Figures are exactly the program terms: $150 one-time (Standard, cash or production
   credit) · 10% of the first qualifying project payment, up to $500 per referred client
   (Agency & Strategic). The cap is stated on the card; the full conditions (including what
   the Creative Upgrade is NOT) live in the program terms, not here.
───────────────────────────────────────────── */

const CARDS = [
  {
    id: 'standard',
    eyebrow: 'Standard Referrals',
    title: 'Standard Referral Partner',
    lead: 'Earn',
    amount: '$150',
    note: 'Per client.',
    blurb: 'Earn $150 cash or production credit for every successful referral.',
    points: ['No selling required.', 'Multiple referrals welcome.', 'Paid when the referral becomes an eligible paying client.'],
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
    eyebrow: 'Agency Partners',
    title: 'Agency & Strategic Partner',
    lead: 'Earn',
    amount: '10%',
    note: 'Up to $500 per client. For example, a $5,000 first payment earns $500.',
    blurb: 'Earn 10% of the first qualifying project when you refer a client to CONVRT.',
    points: ['For approved agencies and consultants.', 'One-time commission.', 'We handle production.'],
    cta: 'Become a Partner',
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
          <SectionHeader id="rewards-heading" eyebrow="Everyone wins" title="One Introduction. Two Winners.">
            Choose how you want to earn.
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

                  <p className="mt-3 flex items-baseline gap-3">
                    <span className="text-base font-semibold text-ink">{card.lead}</span>
                    <span className={`font-display text-6xl font-bold leading-none tracking-display-xl sm:text-7xl ${card.accent.text}`}>{card.amount}</span>
                  </p>
                  <p className="mt-2 text-sm leading-snug text-ink-muted">{card.note}</p>

                  <p className="mt-5 text-[15px] leading-relaxed text-ink">{card.blurb}</p>

                  <ul className="mt-5 space-y-3 border-t border-hairline pt-5">
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

        {/* FREE Creative Upgrade strip: the offer only. Restrictions live in the program terms. */}
        <Reveal delay={140}>
          <aside
            aria-labelledby="upgrade-heading"
            className="relative mt-6 overflow-hidden rounded-3xl border border-lime/30 bg-gradient-to-r from-lime/[0.09] via-surface-1 to-magenta/[0.09] p-6 sm:p-8 lg:mt-8"
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className="lg:col-span-6">
                <span className="inline-flex w-fit items-center rounded-full border border-magenta/40 bg-magenta/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-magenta">
                  For the brand you refer
                </span>
                <h3 id="upgrade-heading" className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-display text-ink sm:text-[1.7rem]">
                  Your referral gets a <span className="text-lime">FREE Creative Upgrade</span>
                </h3>
                <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-snug text-ink">
                  2 Extra Ad Variations. On Us.
                </p>
              </div>
              <div className="lg:col-span-6">
                <p className="text-base leading-relaxed text-ink-muted">
                  When your referral starts their first qualifying paid project, we’ll create two additional ad
                  variations at no extra cost.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Made from existing project footage and assets. No additional filming required.
                </p>
              </div>
            </div>
          </aside>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 text-center text-sm leading-relaxed text-ink-muted">
            Rewards apply to eligible new clients and are confirmed by CONVRT.
            <TermsLink>Read the full terms</TermsLink>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
