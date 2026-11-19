import { OFFER_PATHS } from '../../config.js'
import {
  SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, CUSTOM_PACKAGES, BILLING_OPTIONS, formatMoney, pricePerVariation,
} from '../../seo/businessKnowledge.js'

/* The three-column pricing cards (Paid Social: Sprint / Sprint Plus / Custom; Organic: Light / Growth / Custom).
   Every number comes from src/seo/businessKnowledge.js. Both billing options are always in the DOM (the inactive
   price carries `hidden`), so the prerendered HTML contains the monthly AND the one-off prices. Every CTA goes to the
   approved Creative Growth Roadmap flow. */

const TONES = {
  light: {
    root: 'bg-ink text-canvas',
    muted: 'text-canvas/65',
    divider: 'bg-canvas/12',
    check: 'text-canvas',
    pill: 'border border-transparent bg-canvas text-ink',
    chip: 'bg-canvas/[0.07] ring-1 ring-inset ring-canvas/10',
    badge: 'border-canvas/25 bg-canvas/10 text-canvas',
    cta: 'bg-canvas text-ink hover:bg-[#1c1c20]',
  },
  lime: {
    root: 'bg-lime text-canvas shadow-[0_25px_70px_-24px_rgba(213,255,64,0.55)]',
    muted: 'text-canvas/70',
    divider: 'bg-canvas/15',
    check: 'text-canvas',
    pill: 'border border-transparent bg-canvas text-ink',
    chip: 'bg-canvas/10 ring-1 ring-inset ring-canvas/15',
    badge: 'border-canvas/25 bg-canvas/10 text-canvas',
    cta: 'bg-canvas text-ink hover:bg-[#1c1c20]',
  },
  dark: {
    root: 'text-ink border',
    muted: 'text-ink/65',
    divider: 'bg-white/10',
    check: 'text-lime',
    pill: 'border border-lime/35 bg-lime/10 text-lime',
    chip: 'bg-white/[0.06] ring-1 ring-inset ring-white/10',
    badge: 'border-white/15 bg-white/5 text-ink/80',
    cta: 'bg-lime text-canvas hover:bg-lime-light',
  },
}

const DARK_STYLE = {
  background: 'linear-gradient(165deg, #202025 0%, #141417 62%, #101012 100%)',
  borderColor: 'rgba(213,255,64,0.18)',
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-[3px] h-4 w-4 shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* One pricing card. `price` and `sub` are nodes so the paid cards can carry both billing variants. */
function PricingCard({ tone, id, label, badge, description, price, sub, features, note, ctaLabel, tallSub = false, descMin = 'lg:min-h-[69px]', subMin, className = '' }) {
  const t = TONES[tone]
  return (
    <article
      aria-labelledby={`${id}-label`}
      className={`relative flex h-full flex-col rounded-[26px] md:rounded-[30px] p-5 md:p-6 lg:p-7 transition-transform duration-300 hover:-translate-y-1 ${t.root} ${className}`}
      style={tone === 'dark' ? DARK_STYLE : undefined}
    >
      <div className="flex min-h-[32px] items-center justify-between gap-3">
        <h2 id={`${id}-label`} className={`inline-flex items-center rounded-full px-4 py-1.5 font-display text-[15px] font-bold tracking-snug ${t.pill}`}>
          {label}
        </h2>
        {badge && (
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${t.badge}`}>{badge}</span>
        )}
      </div>

      <p className={`mt-4 text-[14px] leading-relaxed ${descMin} ${t.muted}`}>{description}</p>

      <div className="mt-5 flex min-h-[56px] items-end font-display font-bold leading-none tracking-display">{price}</div>
      <div className={`mt-3 ${subMin ?? (tallSub ? 'lg:min-h-[60px]' : 'min-h-[34px]')}`}>{sub}</div>

      <div className={`mt-4 h-px ${t.divider}`} />

      <ul className="mt-4 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[14px] leading-snug">
            <CheckIcon className={t.check} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {note && <p className={`mt-5 text-[12px] leading-relaxed ${t.muted}`}>{note}</p>}

      <div className={`mt-6 h-px ${t.divider}`} />

      <a
        href={OFFER_PATHS.roadmap}
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform duration-150 active:scale-[0.98] ${t.cta}`}
      >
        {ctaLabel}
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </article>
  )
}

/* Monthly or one-off price with its unit. Both variants rendered; the inactive one is `hidden`. */
function BillingPrice({ pkg, billing }) {
  return (
    <>
      {BILLING_OPTIONS.map((o) => (
        <span key={o.id} hidden={billing !== o.id} data-billing={o.id} className="text-[44px] md:text-[52px]">
          {formatMoney(pkg[o.id])}
          <span className="ml-1.5 text-base font-medium tracking-normal opacity-60 md:text-lg">{o.unit}</span>
        </span>
      ))}
    </>
  )
}

const LetsTalk = () => <span className="text-[40px] md:text-[46px]">Let&rsquo;s talk.</span>

/* The value highlight directly under the total: what one finished ad version costs at the billing option shown. A small lime mark
   (lime highlighter on the light card, black chip with lime text on the lime card): clearly more prominent than the supporting
   copy, clearly smaller than the package price. Both billing variants are rendered (the inactive one is `hidden`), like the price. */
const HIGHLIGHT = { light: 'bg-lime text-canvas', lime: 'bg-canvas text-lime' }
const PerVariation = ({ tone, pkg, billing }) => (
  <p className="mb-2">
    {BILLING_OPTIONS.map((o) => (
      <span key={o.id} hidden={billing !== o.id} data-billing={o.id}>
        <span className={`inline-flex items-baseline gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold leading-none ${HIGHLIGHT[tone]}`}>
          Just <span className="font-display text-[17px] font-bold tracking-snug">{pricePerVariation(pkg, o.id).text}</span> per variation
        </span>
      </span>
    ))}
  </p>
)

const Variations = ({ tone, count, line, per }) => (
  <>
    {per}
    <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold ${TONES[tone].chip}`}>
      {count} finished ad versions
    </span>
    {line && <p className={`mt-1.5 text-[12.5px] leading-snug ${TONES[tone].muted}`}>{line}</p>}
  </>
)

const Supporting = ({ tone, children }) => (
  <span className={`inline-flex items-center rounded-2xl px-3.5 py-1.5 text-sm font-semibold leading-snug ${TONES[tone].chip}`}>{children}</span>
)

const days = (n) => `${n} business days turnaround`
const usage = (m) => `${m} months of worldwide usage rights`
const revisions = (n) => `${n} revision rounds per creative concept`

export function PaidCards({ billing }) {
  const sprintFeatures = [
    `${SPRINT.concepts} distinct creative concepts`,
    `${SPRINT.concepts} complete scripts`,
    `${SPRINT.variationsPerConcept} versions per concept, changing the hook or CTA`,
    '1 creator or spokesperson',
    days(SPRINT.turnaroundBusinessDays),
    usage(SPRINT.usageMonthsIncluded),
    revisions(SPRINT.revisionRoundsPerConcept),
  ]
  /* Sprint Plus (approved offer): 10 concepts, 10 scripts, 3 versions per concept = 30 finished ad versions. */
  const plusFeatures = [
    `${SPRINT_PLUS.concepts} distinct creative concepts`,
    `${SPRINT_PLUS.scripts} complete scripts`,
    `${SPRINT_PLUS.variationsPerConcept} versions per concept, changing the hook or CTA`,
    'Up to 2 creators or spokespeople',
    days(SPRINT_PLUS.turnaroundBusinessDays),
    usage(SPRINT_PLUS.usageMonthsIncluded),
    revisions(SPRINT_PLUS.revisionRoundsPerConcept),
    'Priority production scheduling',
  ]
  const PAID_DESC = 'lg:min-h-[46px]'
  const PAID_SUB = 'lg:min-h-[116px]'
  const custom = CUSTOM_PACKAGES.paid
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <PricingCard
        tone="light" id="card-sprint" label="Sprint" description={SPRINT.cardDescription}
        price={<BillingPrice pkg={SPRINT} billing={billing} />}
        sub={<Variations tone="light" per={<PerVariation tone="light" pkg={SPRINT} billing={billing} />} count={SPRINT.variations} line={`${SPRINT.concepts} concepts × ${SPRINT.variationsPerConcept} versions each`} />}
        features={sprintFeatures} ctaLabel="Get started" descMin={PAID_DESC} subMin={PAID_SUB}
      />
      <PricingCard
        tone="lime" id="card-sprint-plus" label="Sprint Plus" badge="Deeper testing" description={SPRINT_PLUS.cardDescription}
        price={<BillingPrice pkg={SPRINT_PLUS} billing={billing} />}
        sub={<Variations tone="lime" per={<PerVariation tone="lime" pkg={SPRINT_PLUS} billing={billing} />} count={SPRINT_PLUS.variations} line={SPRINT_PLUS.valueLine} />}
        features={plusFeatures} note={SPRINT_PLUS.extraDetail} ctaLabel="Get started" descMin={PAID_DESC} subMin={PAID_SUB}
      />
      <PricingCard
        tone="dark" id="card-custom" label={custom.name} description={custom.description}
        price={<LetsTalk />} sub={<Supporting tone="dark">{custom.supportingLabel}</Supporting>}
        features={custom.features} note={custom.note} ctaLabel={custom.cta} descMin={PAID_DESC} subMin={PAID_SUB}
        className="md:col-span-2 lg:col-span-1"
      />
    </div>
  )
}

export function OrganicCards() {
  const shared = (extra) => [
    'Organic content strategy',
    'Content research & ideation',
    'Concepts & scripting',
    'Planned monthly content production',
    'Short-form video editing',
    'Captions & platform adaptation',
    ...extra,
    ORGANIC.includedInBoth[0],
    ORGANIC.includedInBoth[1],
    'Performance review & optimization',
    `${ORGANIC_COMMITMENT.initialMonths}-month initial commitment`,
    `${ORGANIC.platforms.slice(0, -1).join(', ')} & ${ORGANIC.platforms.at(-1)} distribution`,
  ]
  const custom = CUSTOM_PACKAGES.organic
  const Cadence = ({ tone, text }) => <Supporting tone={tone}>{text}</Supporting>
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <PricingCard
        tone="light" id="card-organic-light" label={ORGANIC.light.name}
        description="Full-service organic content, from strategy and production to editing and publishing."
        price={<span className="text-[44px] md:text-[52px]">{formatMoney(ORGANIC.light.monthly)}<span className="ml-1.5 text-base font-medium tracking-normal opacity-60 md:text-lg">/month</span></span>}
        sub={<Cadence tone="light" text={ORGANIC.light.cadence} />}
        features={shared([])} ctaLabel="Get started" tallSub
      />
      <PricingCard
        tone="lime" id="card-organic-growth" label={ORGANIC.growth.name} badge="Recommended"
        description="Higher-cadence organic content production, with more room to test formats, hooks, and creative directions."
        price={<span className="text-[44px] md:text-[52px]">{formatMoney(ORGANIC.growth.monthly)}<span className="ml-1.5 text-base font-medium tracking-normal opacity-60 md:text-lg">/month</span></span>}
        sub={<Cadence tone="lime" text={ORGANIC.growth.cadence} />}
        features={shared(['Higher creative testing cadence', 'More formats, hooks & creative angles tested'])} ctaLabel="Get started" tallSub
      />
      <PricingCard
        tone="dark" id="card-organic-custom" label={custom.name} description={custom.description}
        price={<LetsTalk />} sub={<Supporting tone="dark">{custom.supportingLabel}</Supporting>}
        features={custom.features} note={custom.note} ctaLabel={custom.cta} tallSub
        className="md:col-span-2 lg:col-span-1"
      />
    </div>
  )
}

/* Compact billing selector (Paid Social only), a secondary control in the header row above the cards.
   A radio group: arrow keys move the selection. */
export function BillingSwitch({ value, onChange }) {
  const idx = BILLING_OPTIONS.findIndex((o) => o.id === value)
  const onKeyDown = (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
    const next = BILLING_OPTIONS[(idx + dir + BILLING_OPTIONS.length) % BILLING_OPTIONS.length]
    onChange(next.id)
    document.getElementById(`billing-${next.id}`)?.focus()
  }
  return (
    <div
      role="radiogroup" aria-label="Billing option" onKeyDown={onKeyDown}
      className="inline-grid grid-cols-2 rounded-full border border-hairline bg-surface-1/70 p-0.5"
    >
      {BILLING_OPTIONS.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id} id={`billing-${o.id}`} type="button" role="radio" aria-checked={active}
            tabIndex={active ? 0 : -1} onClick={() => onChange(o.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 ${
              active ? 'bg-lime text-canvas' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
