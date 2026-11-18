import { trackEvent } from '../../lib/analytics.js'
import {
  formatMoney, SPRINT, SPRINT_PLUS, CUSTOM_PACKAGES, PARTNERSHIP_TERMS, SINGLE_VIDEOS, USAGE_RIGHTS, packageEquation,
} from '../../seo/businessKnowledge.js'
import { Section, Head, Reveal, Tick, TextLink } from './shared.jsx'

/* SECTION 7: pricing. Every figure and term is read from src/seo/businessKnowledge.js (the same data as /pricing and the
   JSON-LD). Recurring and one-off are shown as separate, labelled lines so they are never confused. Nothing is hidden
   behind a toggle: the whole section is in the static HTML. Deliverables use the shared "finished ad versions" wording. */

function Package({ pkg, highlight = false, extra }) {
  const facts = [
    packageEquation(pkg),
    `${pkg.turnaroundBusinessDays} business days of production, from script approval`,
    `${pkg.revisionRoundsPerConcept} revision rounds per concept and ${pkg.usageMonthsIncluded} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights`,
    ...(extra ? [extra] : []),
  ]
  return (
    <div className={`flex h-full flex-col rounded-3xl border p-6 ${highlight ? 'border-lime/40 bg-lime/[0.04]' : 'border-hairline-strong bg-surface-1'}`}>
      <h3 className="font-display text-xl font-semibold tracking-snug text-ink">{pkg.name}</h3>
      <p className="mt-1 text-[15px] text-ink-muted">{pkg.cardDescription}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-hairline bg-canvas/40 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Recurring</dt>
          <dd className="font-display text-2xl font-bold tabular-nums text-ink">{formatMoney(pkg.monthly)}<span className="text-sm font-medium text-ink-muted">/month</span></dd>
        </div>
        <div className="rounded-2xl border border-hairline bg-canvas/40 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">One-off</dt>
          <dd className="font-display text-2xl font-bold tabular-nums text-ink">{formatMoney(pkg.oneOff)}<span className="block text-sm font-medium text-ink-muted">one creative batch</span></dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-2">
        {facts.map((f) => (
          <li key={f} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-muted"><Tick /><span>{f}</span></li>
        ))}
      </ul>
    </div>
  )
}

export default function UgcPricing() {
  const custom = CUSTOM_PACKAGES.paid
  return (
    <Section id="pricing" label="ugc-pricing-heading" glow>
      <Reveal>
        <Head
          id="ugc-pricing-heading"
          eyebrow="Pricing"
          title="Transparent pricing, built around testing."
          intro={`Our UGC production packages start at ${formatMoney(SPRINT.monthly)} a month. Prefer a single production batch? One-off packages start at ${formatMoney(SPRINT.oneOff)}. Prices are in US dollars and exclude VAT.`}
        />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 lg:grid-cols-3 lg:gap-5">
        <Reveal className="h-full"><Package pkg={SPRINT} /></Reveal>
        <Reveal delay={90} className="h-full"><Package pkg={SPRINT_PLUS} highlight extra={SPRINT_PLUS.extraDetail} /></Reveal>
        <Reveal delay={180} className="h-full">
          <div className="flex h-full flex-col rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md">
            <h3 className="font-display text-xl font-semibold tracking-snug text-ink">{custom.name}</h3>
            <p className="mt-1 text-[15px] text-ink-muted">{custom.description}</p>
            <p className="mt-4 font-display text-2xl font-bold text-ink">{custom.priceLabel}</p>
            <p className="mt-1 text-[15px] text-ink-muted">{custom.note}</p>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-4 md:mt-5">
        <div className="grid grid-cols-1 gap-4 rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:grid-cols-2 md:gap-8">
          <div className="space-y-2.5 text-[15px] leading-relaxed text-ink-muted">
            <p><span className="font-semibold text-ink">Recurring:</span> {PARTNERSHIP_TERMS.monthly}</p>
            <p><span className="font-semibold text-ink">One-off:</span> {PARTNERSHIP_TERMS.oneOff}</p>
          </div>
          <div className="space-y-2.5 text-[15px] leading-relaxed text-ink-muted">
            <p>
              <span className="font-semibold text-ink">What shapes the price:</span> the number of concepts, the creator and language, formats
              beyond those included, usage beyond {USAGE_RIGHTS.includedMonths} months and add-ons such as raw footage.
            </p>
            <p>
              {SINGLE_VIDEOS.statement} One video can&rsquo;t tell you what works, so each package gives you enough creative variety to learn from.
              Packages cover creative production, not media buying.
            </p>
          </div>
        </div>
      </Reveal>

      <p className="mt-6 text-center text-[15px] text-ink-muted">
        <TextLink href="/pricing#packages" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'pricing' })}>Compare all packages and terms</TextLink>
        <span aria-hidden="true" className="mx-3">·</span>
        <TextLink href="/pricing#pricing-faq" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'pricing-faq' })}>Read the full pricing FAQ</TextLink>
      </p>
    </Section>
  )
}
