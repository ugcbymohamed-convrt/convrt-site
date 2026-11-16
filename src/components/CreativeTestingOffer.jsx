import { useState } from 'react'
import { GRASPO_FOLLOWING } from '../lib/siteStats.js'
import { TAX } from '../seo/businessKnowledge.js'
import { PaidCards, OrganicCards, BillingSwitch } from './pricing/PricingCards.jsx'
import PartnershipTerms from './pricing/PartnershipTerms.jsx'
import SharedBenefits from './pricing/SharedBenefits.jsx'

/* ─────────────────────────────────────────────
   PRICING — Paid Social + Organic Social
   Heading, service switch, (paid) billing switch, then
   three equal pricing cards per service. All figures
   come from src/seo/businessKnowledge.js.
───────────────────────────────────────────── */

const SERVICES = [
  { id: 'paid', label: 'Paid Social' },
  { id: 'organic', label: 'Organic Social' },
]

export default function CreativeTestingOffer({ service, onServiceChange }) {
  /* Monthly is the default; both billing options' prices are always in the DOM (see PricingCards.jsx). */
  const [billing, setBilling] = useState('monthly')

  /* BOTH service panels are always in the DOM (the inactive one carries `hidden`), so the prerendered HTML
     contains every package and price; the tabs only decide which one a visitor sees. The `hidden` attribute
     is on a plain wrapper: a Tailwind display class on the same element would override it. */
  return (
    <section id="packages" className="relative overflow-hidden py-8 md:py-12">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-6 md:mb-7 max-w-4xl text-center">
          <h2
            className="font-display font-bold leading-[1.05] tracking-display text-ink"
            style={{ fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)' }}
          >
            Choose your creative <span className="text-lime">partnership.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            Different brands. Different creative needs. Find the right production package for your next stage of growth.
          </p>
        </div>

        <ServiceSwitch value={service} onChange={onServiceChange} />

        <div id="service-panel-paid" role="tabpanel" aria-labelledby="service-tab-paid" hidden={service !== 'paid'}>
          <div className="pricing-panel-in">
            <BillingSwitch value={billing} onChange={setBilling} />
            <PaidCards billing={billing} />
          </div>
          <PartnershipTerms />
          <SharedBenefits />
          <p className="mx-auto mt-8 max-w-2xl text-center text-[13px] leading-relaxed text-ink-muted">
            Pricing is based on the confirmed production scope. Additional languages, creators, locations, long-form
            videos, horizontal production, creator-account advertising permissions, extended usage rights and other
            specialist production needs are quoted separately.
          </p>
        </div>

        <div id="service-panel-organic" role="tabpanel" aria-labelledby="service-tab-organic" hidden={service !== 'organic'}>
          <div className="pricing-panel-in">
            <OrganicCards />
          </div>
          <p className="mx-auto mt-7 md:mt-9 max-w-3xl text-center text-[13px] leading-relaxed text-ink-muted">
            Pricing covers the full organic content workflow: strategy, production, editing, scheduling, publishing,
            community management and optimization, across your selected platforms. Community management means social
            media engagement and brand relationship management; customer support is not included. {TAX.statement}
          </p>
          <GraspoProof />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Service switch — segmented toggle between
   Paid Social and Organic Social. Follows the
   WAI-ARIA tabs pattern (roving tabindex, arrow-key
   navigation) since it swaps a content panel below it.
───────────────────────────────────────────── */
function ServiceSwitch({ value, onChange }) {
  const activeIndex = SERVICES.findIndex((s) => s.id === value)

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const dir = event.key === 'ArrowRight' ? 1 : -1
    const next = SERVICES[(activeIndex + dir + SERVICES.length) % SERVICES.length]
    onChange(next.id)
    document.getElementById(`service-tab-${next.id}`)?.focus()
  }

  return (
    <div className="mb-8 md:mb-10 flex justify-center">
      <div
        role="tablist"
        aria-label="Select service type"
        onKeyDown={handleKeyDown}
        className="inline-grid grid-cols-2 rounded-full border border-hairline bg-surface-1/60 p-1 backdrop-blur-md"
      >
        {SERVICES.map((option) => {
          const isActive = option.id === value
          return (
            <button
              key={option.id}
              id={`service-tab-${option.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`service-panel-${option.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(option.id)}
              className={`whitespace-nowrap rounded-full px-5 md:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-lime text-canvas shadow-[0_0_22px_rgba(213,255,64,0.35)]'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Graspo proof — compact organic-results block.
   Figures sourced from the Graspo case study
   (GraspoMetrics.jsx / GraspoAudience.jsx).
───────────────────────────────────────────── */
const GRASPO_STATS = [
  { value: '10.7M+', label: 'Organic Views' },
  { value: GRASPO_FOLLOWING.facebook, label: 'Facebook Followers' },
  { value: GRASPO_FOLLOWING.instagram, label: 'Instagram Followers' },
  { value: '75+', label: 'Inbound Leads' },
]

function GraspoProof() {
  return (
    <div className="pricing-panel-in mt-6 md:mt-8 rounded-[24px] md:rounded-[28px] border border-hairline bg-surface-1/60 backdrop-blur-md p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
        <div className="md:max-w-xs">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle mb-2">
            Proven with organic social
          </p>
          <h3 className="font-display font-bold text-ink tracking-display leading-[1.15] text-xl md:text-2xl">
            Organic social that actually gets watched.
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5 flex-1">
          {GRASPO_STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-display font-bold text-lime tracking-display text-2xl md:text-[28px] tabular-nums leading-none">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[11.5px] text-ink-muted leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-hairline flex justify-center md:justify-end">
        <a
          href="/case-studies/graspo"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime hover:text-lime-light transition-colors"
        >
          See how we grew Graspo
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  )
}
