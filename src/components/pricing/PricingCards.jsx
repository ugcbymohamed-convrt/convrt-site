import { OFFER_PATHS } from '../../config.js'
import { currentLocale } from '../../i18n/locale.js'
import { resolveCta } from '../../i18n/cta.js'
import { money } from '../../i18n/money.js'
import { perVariationText } from '../../i18n/pricing.js'
import {
  SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, CUSTOM_PACKAGES, BILLING_OPTIONS, formatMoney, pricePerVariation, creatorsLine,
  END_TO_END,
} from '../../seo/businessKnowledge.js'
import { tr } from '../../i18n/tr.js'

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
/* The end-to-end production benefit: a compact two-line note between the deliverable summary and the checklist. A small lime mark on a
   dark chip (readable on both the light and the lime card). `endToEndSpace` gives the Custom card an equal invisible slot from lg up,
   so the three checklists still start on one line. */
const END_TO_END_BOX = 'mt-3 lg:min-h-[89px] xl:min-h-[73px]'
function EndToEnd({ tone }) {
  return (
    <div className={`${END_TO_END_BOX} rounded-xl px-3 py-2 ${TONES[tone].chip}`}>
      <p className="flex items-center gap-2 text-[13px] font-semibold leading-tight">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-canvas text-lime">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="12" height="8.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M2.3 5L2 3.3l10.6-1.9.4 1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 7.8l2.6 1.5L7 10.8V7.8z" fill="currentColor" />
          </svg>
        </span>
        {tr(END_TO_END.title)}
      </p>
      <p className={`mt-1 text-[12px] leading-snug ${TONES[tone].muted}`}>{tr(END_TO_END.text)}</p>
    </div>
  )
}

function PricingCard({ tone, id, label, badge, description, price, sub, features, note, ctaLabel, tallSub = false, descMin = 'lg:min-h-[69px]', subMin, className = '', endToEnd = false, endToEndSpace = false }) {
  const t = TONES[tone]
  // Other languages: a CTA into the English-only Roadmap becomes the booking call (src/i18n/cta.js).
  const cta = resolveCta(currentLocale(), { href: OFFER_PATHS.roadmap, label: 'Book a Creative Call' })
  return (
    <article
      aria-labelledby={`${id}-label`}
      className={`relative flex h-full flex-col rounded-[26px] md:rounded-[30px] p-5 md:p-6 lg:p-7 transition-transform duration-300 hover:-translate-y-1 ${t.root} ${className}`}
      style={tone === 'dark' ? DARK_STYLE : undefined}
    >
      <div className="flex min-h-[32px] items-center justify-between gap-3">
        <h2 id={`${id}-label`} className={`inline-flex items-center rounded-full px-4 py-1.5 font-display text-[15px] font-bold tracking-snug ${t.pill}`}>
          {tr(label)}
        </h2>
        {badge && (
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${t.badge}`}>{tr(badge)}</span>
        )}
      </div>

      <p className={`mt-4 text-[14px] leading-relaxed ${descMin} ${t.muted}`}>{tr(description)}</p>

      <div className="mt-5 flex min-h-[56px] items-end font-display font-bold leading-none tracking-display">{price}</div>
      <div className={`mt-3 ${subMin ?? (tallSub ? 'lg:min-h-[60px]' : 'min-h-[34px]')}`}>{sub}</div>

      {endToEnd && <EndToEnd tone={tone} />}
      {endToEndSpace && <div aria-hidden="true" className={`hidden lg:block ${END_TO_END_BOX}`} />}

      <div className={`mt-4 h-px ${t.divider}`} />

      <ul className="mt-4 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[14px] leading-snug">
            <CheckIcon className={t.check} />
            <span>{tr(f)}</span>
          </li>
        ))}
      </ul>

      {note && <p className={`mt-5 text-[12px] leading-relaxed ${t.muted}`}>{tr(note)}</p>}

      <div className={`mt-6 h-px ${t.divider}`} />

      <a
        href={cta.href}
        {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform duration-150 active:scale-[0.98] ${t.cta}`}
      >
        {tr(cta.redirected && ctaLabel === 'Get 5 Free Ad Concepts' ? cta.label : ctaLabel)}
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
        // Spanish prices ("3.250 €/proyecto") are wider than the English ones: between 1024 and 1279px the three-column card is narrower than the 52px price, so non-English pages step the size down there.
        <span key={o.id} hidden={billing !== o.id} data-billing={o.id} className={currentLocale() === 'en' ? 'text-[44px] md:text-[52px]' : 'text-[44px] md:text-[52px] lg:text-[40px] xl:text-[52px]'}>
          {money(pkg[o.id])}
          <span className="ml-1.5 text-base font-medium tracking-normal opacity-60 md:text-lg">{tr(o.unit)}</span>
        </span>
      ))}
    </>
  )
}

const LetsTalk = () => <span className="text-[40px] md:text-[46px]">{tr('Let’s talk.')}</span>

/* The original two-pill row under the price, texts swapped (owner, Nov 2026): the lime pill (black chip with lime text on the lime card)
   carries the package size, the grey pill carries the price per variation. The per-variation figure is derived from the package price
   (not a price for single videos) and follows the billing option shown, so both variants are rendered (the inactive one is `hidden`),
   like the price. The two pills share a line and wrap only when the card is too narrow for both. */
const HIGHLIGHT = { light: 'bg-lime text-canvas', lime: 'bg-canvas text-lime' }
const PerVariation = ({ tone, pkg, billing }) => (
  <>
    {BILLING_OPTIONS.map((o) => (
      <span key={o.id} hidden={billing !== o.id} data-billing={o.id}>
        <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-[7px] text-[11.5px] font-bold leading-none ${TONES[tone].chip}`}>
          {currentLocale() === 'en' ? pricePerVariation(pkg, o.id).text : perVariationText(currentLocale(), pkg[o.id])} {tr('per variation')}
        </span>
      </span>
    ))}
  </>
)

const Variations = ({ tone, count, line, per }) => (
  <>
    <div className="flex flex-wrap items-center gap-1">
      <span className={`inline-flex items-baseline gap-1 whitespace-nowrap rounded-lg px-1.5 py-[7px] text-[11.5px] font-semibold leading-none ${HIGHLIGHT[tone]}`}>
        <span className="font-display text-[16px] font-bold tracking-snug">{count}</span>{' '}{tr('testing creatives')}</span>
      {per}
    </div>
    {line && <p className={`mt-2 text-[12.5px] leading-snug ${TONES[tone].muted}`}>{tr(line)}</p>}
  </>
)

const Supporting = ({ tone, children }) => (
  <span className={`inline-flex items-center rounded-2xl px-3.5 py-1.5 text-sm font-semibold leading-snug ${TONES[tone].chip}`}>{typeof children === 'string' ? tr(children) : children}</span>
)

const days = (n) => `${n} business days turnaround`
const usage = (m) => `${m} months of worldwide usage rights`
const revisions = (n) => `${n} revision rounds per creative concept`

export function PaidCards({ billing }) {
  const sprintFeatures = [
    `${SPRINT.concepts} distinct creative concepts`,
    `${SPRINT.concepts} complete scripts`,
    `${SPRINT.variationsPerConcept} versions per concept, changing the hook or CTA`,
    creatorsLine(SPRINT),
    days(SPRINT.turnaroundBusinessDays),
    usage(SPRINT.usageMonthsIncluded),
    revisions(SPRINT.revisionRoundsPerConcept),
    END_TO_END.checklistItem,
  ]
  /* Sprint Plus (approved offer): 10 concepts, 10 scripts, 3 versions per concept = 30 finished ad versions. */
  const plusFeatures = [
    `${SPRINT_PLUS.concepts} distinct creative concepts`,
    `${SPRINT_PLUS.scripts} complete scripts`,
    `${SPRINT_PLUS.variationsPerConcept} versions per concept, changing the hook or CTA`,
    creatorsLine(SPRINT_PLUS),
    days(SPRINT_PLUS.turnaroundBusinessDays),
    usage(SPRINT_PLUS.usageMonthsIncluded),
    revisions(SPRINT_PLUS.revisionRoundsPerConcept),
    END_TO_END.checklistItem,
  ]
  /* One line under the price for both cards (owner: the two packages differ in volume and price only). */
  const conceptLine = (p) => `${p.concepts} unique concepts with ${p.variationsPerConcept} hook or CTA variations per concept`
  const PAID_DESC = 'lg:min-h-[46px]'
  const PAID_SUB = 'lg:min-h-[80px]'
  const custom = CUSTOM_PACKAGES.paid
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <PricingCard
        tone="light" id="card-sprint" label="Sprint" description={SPRINT.cardDescription}
        price={<BillingPrice pkg={SPRINT} billing={billing} />}
        sub={<Variations tone="light" count={SPRINT.variations} line={conceptLine(SPRINT)} per={<PerVariation tone="light" pkg={SPRINT} billing={billing} />} />}
        features={sprintFeatures} note={SPRINT.extraDetail} ctaLabel="Get started" descMin={PAID_DESC} subMin={PAID_SUB} endToEnd
      />
      <PricingCard
        tone="lime" id="card-sprint-plus" label="Sprint Plus" badge="Deeper testing" description={SPRINT_PLUS.cardDescription}
        price={<BillingPrice pkg={SPRINT_PLUS} billing={billing} />}
        sub={<Variations tone="lime" count={SPRINT_PLUS.variations} line={conceptLine(SPRINT_PLUS)} per={<PerVariation tone="lime" pkg={SPRINT_PLUS} billing={billing} />} />}
        features={plusFeatures} note={SPRINT_PLUS.extraDetail} ctaLabel="Get started" descMin={PAID_DESC} subMin={PAID_SUB} endToEnd
      />
      <PricingCard
        tone="dark" id="card-custom" label={custom.name} description={custom.description}
        price={<LetsTalk />} sub={<Supporting tone="dark">{custom.supportingLabel}</Supporting>}
        features={custom.features} note={custom.note} ctaLabel={custom.cta} descMin={PAID_DESC} subMin={PAID_SUB} endToEndSpace
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
        price={<span className="text-[44px] md:text-[52px]">{money(ORGANIC.light.monthly)}<span className="ml-1.5 text-base font-medium tracking-normal opacity-60 md:text-lg">{tr('/month')}</span></span>}
        sub={<Cadence tone="light" text={ORGANIC.light.cadence} />}
        features={shared([])} ctaLabel="Get started" tallSub
      />
      <PricingCard
        tone="lime" id="card-organic-growth" label={ORGANIC.growth.name} badge="Recommended"
        description="Higher-cadence organic content production, with more room to test formats, hooks, and creative directions."
        price={<span className="text-[44px] md:text-[52px]">{money(ORGANIC.growth.monthly)}<span className="ml-1.5 text-base font-medium tracking-normal opacity-60 md:text-lg">{tr('/month')}</span></span>}
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
      role="radiogroup" aria-label={tr('Billing option')} onKeyDown={onKeyDown}
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
            {tr(o.label)}
          </button>
        )
      })}
    </div>
  )
}
