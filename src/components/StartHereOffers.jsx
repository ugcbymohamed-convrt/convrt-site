import { OFFER_PATHS } from '../config.js'
import { trackEvent } from '../lib/analytics.js'

/* ─────────────────────────────────────────────
   MORE WAYS TO GET STARTED
   Two secondary offers beneath the hero's primary CTA. Deliberately
   quieter than the hero: surface-1 cards, hairline borders, lime only
   on the icon tile and the text link — no filled lime buttons.
───────────────────────────────────────────── */

const OFFERS = [
  {
    id: 'hooks',
    icon: IconBook,
    title: '10 Free Ad Hooks',
    description: 'Proven hook frameworks to inspire your next SaaS or e-commerce campaign.',
    cta: 'Get Free Hooks',
    href: OFFER_PATHS.hooks,
    event: 'hooks_library_click',
  },
  {
    id: 'risk-free',
    icon: IconClapper,
    title: <>1 <span className="text-lime">FREE</span> Video Production</>,
    description: 'Try CONVRT risk free. Apply to see if you qualify for a free video ad, plus two bonus hook variations.',
    cta: 'See If You Qualify',
    href: OFFER_PATHS.riskFree,
    event: 'risk_free_trial_click',
  },
]

export default function StartHereOffers() {
  return (
    <section id="start-here" aria-labelledby="start-here-heading" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
              More ways to get started
            </span>
          </div>

          <h2
            id="start-here-heading"
            className="font-display font-bold text-ink tracking-display leading-[1.05] text-4xl md:text-5xl"
          >
            Not ready to book? <span className="text-lime">Start here.</span>
          </h2>

          <p className="mt-4 text-base text-ink-muted max-w-md mx-auto leading-relaxed">
            Grab free creative resources, or let us prove it with a free video before you commit to anything.
          </p>
        </div>

        <ul className="mx-auto grid max-w-4xl grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {OFFERS.map((offer) => (
            <li key={offer.id} className="flex">
              <OfferCard offer={offer} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function OfferCard({ offer }) {
  const Icon = offer.icon
  return (
    <article
      className="group relative flex w-full flex-col rounded-3xl border border-hairline bg-surface-1 p-6 md:p-7
                 transition-[transform,border-color,background-color] duration-200
                 hover:-translate-y-0.5 hover:border-lime/40 hover:bg-surface-2/60
                 has-[:focus-visible]:border-lime/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/50
                 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime/25 bg-lime/10 text-lime">
        <Icon />
      </div>

      <h3 className="mt-6 font-display text-xl md:text-2xl font-semibold tracking-snug text-ink">
        {offer.title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{offer.description}</p>

      {/* Stretched link: the whole card is the tap target, the text link is the semantic anchor. */}
      <a
        href={offer.href}
        onClick={() => trackEvent(offer.event, { location: 'start_here' })}
        className="mt-8 inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-semibold text-lime
                   focus-visible:outline-none
                   after:absolute after:inset-0 after:rounded-3xl after:content-['']"
      >
        {offer.cta}
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          →
        </span>
      </a>
    </article>
  )
}

/* ---------- Icons (26px grid, 1.5 stroke — matches Services icon set) ---------- */

function IconBook() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M13 6.5C11 4.8 8 4.2 4 4.5v14.5c4-.3 7 .3 9 2 2-1.7 5-2.3 9-2V4.5c-4-.3-7 .3-9 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 6.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 9.5h2.5M7 12.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M19.8 2.8l.45 1.15 1.15.45-1.15.45-.45 1.15-.45-1.15-1.15-.45 1.15-.45.45-1.15z" fill="currentColor" />
    </svg>
  )
}

function IconClapper() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="10" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.4 10L2.6 5.9a1.2 1.2 0 01.9-1.4l17.3-3.5a1.2 1.2 0 011.4.9l.7 3.4L3.4 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 9l-1.6-4.4M13.5 7.9L11.9 3.5M19 6.7l-1.6-4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 14.2l5 2.8-5 2.8v-5.6z" fill="currentColor" />
    </svg>
  )
}
