import { BOOKING_URL } from '../config.js'

/* ─────────────────────────────────────────────
   PRICING — Paid Social + Organic Social
   Service switcher above a shared package-card
   architecture. Three-column composition for Paid
   Social (editorial panel + 2 packages); two-column
   composition for Organic Social (2 packages).
───────────────────────────────────────────── */

const BUILT_FOR = [
  'Apps',
  'SaaS companies',
  'Digital services',
  'E-commerce brands',
  'Teams actively running paid-social campaigns',
]

const STANDARD_FEATURES = [
  'Creative research and concept development',
  '5 distinct creative concepts',
  '5 complete scripts',
  'Scripts approved before filming',
  'Up to 10 final ad variations',
  'Multiple hooks or angle variations',
  '1 creator or spokesperson',
  'Creator-led or spokesperson production',
  'Professional editing',
  'Platform-ready delivery',
  'Production in one selected language: English, Spanish, French, or Arabic',
  'Organized testing recommendations',
]

const PLUS_FEATURES = [
  'Expanded creative research',
  '8 distinct creative concepts',
  '8 complete scripts',
  'Scripts approved before filming',
  'Up to 20 final ad variations',
  'Additional hook, angle, and format variations',
  'Up to 2 creators or spokespersons',
  'Creator-led and spokesperson production',
  'Professional editing',
  'Platform-ready delivery',
  'Production in one selected language: English, Spanish, French, or Arabic',
  'Expanded testing recommendations',
  'Priority production scheduling',
]

const ORGANIC_LIGHT_FEATURES = [
  'Organic content strategy',
  'Content research & ideation',
  'Concepts & scripting',
  'Planned monthly content production',
  'Short-form video editing',
  'Captions & platform adaptation',
  'Publishing & scheduling',
  'Performance review & optimization',
]

const ORGANIC_GROWTH_FEATURES = [
  'Organic content strategy',
  'Content research & ideation',
  'Concepts & scripting',
  'Planned monthly content production',
  'Short-form video editing',
  'Captions & platform adaptation',
  'Publishing & scheduling',
  'Higher creative testing cadence',
  'More formats, hooks & creative angles tested',
  'Performance review & optimization',
]

const PLATFORM_NOTE = 'Instagram, TikTok, Facebook and LinkedIn available depending on strategy.'

const SERVICES = [
  { id: 'paid', label: 'Paid Social' },
  { id: 'organic', label: 'Organic Social' },
]

export default function CreativeTestingOffer({ service, onServiceChange }) {
  return (
    <section id="packages" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="mb-6 md:mb-8 text-center text-xs md:text-sm font-medium uppercase tracking-[0.14em] text-ink-subtle">
          {service === 'paid'
            ? 'A structured creative test, not another batch of minor variations.'
            : 'Consistent social content built to earn attention, not fill a calendar.'}
        </p>

        <ServiceSwitch value={service} onChange={onServiceChange} />

        <div className="rounded-[32px] md:rounded-[40px] border border-hairline bg-surface-1/60 backdrop-blur-md p-4 sm:p-5 md:p-6">
          {service === 'paid' ? (
            <div
              key="paid"
              id="service-panel-paid"
              role="tabpanel"
              aria-labelledby="service-tab-paid"
              className="pricing-panel-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.85fr_1fr_1fr] gap-4 md:gap-5 items-stretch"
            >
              <EditorialPanel className="md:col-span-2 lg:col-span-1" />

              <PackageCard
                variant="standard"
                name="Creative Testing Sprint"
                price="From €2,500"
                priceSuffix="/month"
                supportingLine="A focused first sprint for brands that need stronger creative diversity."
                features={STANDARD_FEATURES}
                timeline="Approximately 10 business days after script approval."
                ctaLabel="Discuss Your Sprint"
              />

              <PackageCard
                variant="plus"
                badge="Deeper Testing"
                name="Creative Testing Sprint Plus"
                price="From €4,500"
                priceSuffix="/month"
                supportingLine="For brands that need more concepts, creators, and testing depth."
                features={PLUS_FEATURES}
                timeline="Approximately 15 business days after script approval."
                ctaLabel="Discuss Your Sprint"
              />
            </div>
          ) : (
            <div
              key="organic"
              id="service-panel-organic"
              role="tabpanel"
              aria-labelledby="service-tab-organic"
              className="pricing-panel-in grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch"
            >
              <PackageCard
                variant="standard"
                name="Organic Light"
                price="€1,500"
                priceSuffix="/month"
                supportingLine="Full-service organic content, from strategy and production to editing and publishing."
                cadenceLine="2 posts per week, approximately 9 original posts per month, adapted and distributed across your selected platforms"
                features={ORGANIC_LIGHT_FEATURES}
                footerLabel="Platforms"
                footerValue="Distribution across up to 3 selected platforms"
                footerNote={PLATFORM_NOTE}
                ctaLabel="Discuss Your Plan"
              />

              <PackageCard
                variant="plus"
                badge="Recommended"
                name="Organic Growth"
                price="€2,000"
                priceSuffix="/month"
                supportingLine="Higher-cadence organic content production, with more room to test formats, hooks, and creative directions."
                cadenceLine="3 posts per week, 13 original posts per month, adapted and distributed across your selected platforms"
                features={ORGANIC_GROWTH_FEATURES}
                footerLabel="Platforms"
                footerValue="Distribution across up to 3 selected platforms"
                footerNote={PLATFORM_NOTE}
                ctaLabel="Discuss Your Plan"
              />
            </div>
          )}
        </div>

        <p className="mt-6 md:mt-8 mx-auto max-w-2xl text-center text-[13px] text-ink-muted leading-relaxed">
          {service === 'paid'
            ? 'Pricing is based on the confirmed production scope. Additional languages, creators, locations, raw footage, paid-media usage requirements, specialist production needs, and extensive revisions may affect the final quote.'
            : 'Pricing covers the full organic content workflow: strategy, production, editing, publishing, and optimization, across your selected platforms.'}
        </p>

        {service === 'organic' && <GraspoProof />}
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
   Editorial panel — offer framing + abstract visual
───────────────────────────────────────────── */
function EditorialPanel({ className = '' }) {
  return (
    <div
      className={`rounded-[24px] md:rounded-[28px] bg-surface-2 border border-hairline p-7 md:p-8 flex flex-col h-full ${className}`}
    >
      <h2 className="font-display font-bold text-ink tracking-display leading-[1.08] text-2xl md:text-[28px]">
        Stop testing the same ad in different clothes.
      </h2>

      <p className="mt-4 text-sm text-ink-muted leading-relaxed">
        Changing the opening sentence, caption, or background does not create a genuinely new
        test.
      </p>
      <p className="mt-3 text-sm text-ink-muted leading-relaxed">
        CONVRT develops distinct creative directions built around different customer problems,
        promises, formats, creators, and conversion angles.
      </p>

      <ConceptTree />

      <div className="mt-6 md:mt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle mb-3">
          Built for
        </p>
        <ul className="space-y-2">
          {BUILT_FOR.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Abstract concept-testing visual
   5 concept cards, each branching into two smaller
   hook / angle / format variation chips
───────────────────────────────────────────── */
const ACCENTS = ['#8b5cf6', '#ff6a4d', '#d5ff40', '#ec4899', '#ffb547']
const NODE_CENTERS = [40, 135, 230, 325, 420]

function ConceptTree() {
  return (
    <div className="mt-7 rounded-2xl border border-hairline bg-black/25 px-4 pt-6 pb-5">
      <svg viewBox="0 0 460 231" className="w-full h-auto" role="img" aria-hidden="true">
        {NODE_CENTERS.map((cx, i) => {
          const accent = ACCENTS[i]
          return (
            <g key={cx}>
              <path
                d={`M ${cx - 16} 50 C ${cx - 16} 115, ${cx - 22} 150, ${cx - 22} 197`}
                stroke={accent}
                strokeWidth="1.6"
                strokeOpacity="0.5"
                fill="none"
              />
              <path
                d={`M ${cx + 16} 50 C ${cx + 16} 115, ${cx + 22} 150, ${cx + 22} 197`}
                stroke={accent}
                strokeWidth="1.6"
                strokeOpacity="0.5"
                fill="none"
              />
              <rect
                x={cx - 32}
                y="16"
                width="64"
                height="34"
                rx="11"
                fill={accent}
                fillOpacity="0.14"
                stroke={accent}
                strokeWidth="1.8"
              />
              <circle cx={cx} cy="33" r="4" fill={accent} />
              <rect
                x={cx - 38}
                y="197"
                width="32"
                height="16"
                rx="6"
                fill={accent}
                fillOpacity="0.85"
              />
              <rect
                x={cx + 6}
                y="197"
                width="32"
                height="16"
                rx="6"
                fill={accent}
                fillOpacity="0.85"
              />
            </g>
          )
        })}
      </svg>
      <p className="mt-3 text-center text-[13px] font-semibold text-ink">
        5 concepts <span className="text-lime">&rarr;</span> 10 testable assets
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Package card — standard (near-white) or plus (lime)
───────────────────────────────────────────── */
function PackageCard({
  variant,
  badge,
  name,
  price,
  priceSuffix,
  supportingLine,
  cadenceLine,
  features,
  timeline,
  footerLabel = 'Typical delivery',
  footerValue,
  footerNote,
  ctaLabel,
}) {
  const isPlus = variant === 'plus'
  const footerText = footerValue ?? timeline

  return (
    <div
      className={`relative rounded-[24px] md:rounded-[28px] p-7 md:p-8 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 ${
        isPlus ? 'bg-lime text-canvas shadow-[0_25px_70px_-24px_rgba(213,255,64,0.55)]' : 'bg-ink text-canvas'
      }`}
    >
      {badge && (
        <span className="inline-flex w-fit items-center rounded-full bg-canvas/10 border border-canvas/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-canvas mb-4">
          {badge}
        </span>
      )}

      <h3 className="font-display font-bold tracking-display leading-[1.1] text-xl md:text-[22px]">
        {name}
      </h3>

      <p className="mt-3 font-display font-bold tracking-display text-3xl md:text-4xl">
        {price}
        {priceSuffix && (
          <span className="ml-1 text-base md:text-lg font-semibold tracking-display opacity-60">
            {priceSuffix}
          </span>
        )}
      </p>

      {cadenceLine && (
        <p className="mt-2 text-[13px] font-semibold leading-relaxed opacity-80">{cadenceLine}</p>
      )}

      <p className="mt-3 text-sm leading-relaxed opacity-70">{supportingLine}</p>

      <div className="mt-6 h-px bg-canvas/12" />

      <ul className="mt-6 space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 pt-5 border-t border-canvas/12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">
          {footerLabel}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed opacity-80">{footerText}</p>
        {footerNote && (
          <p className="mt-1 text-[11.5px] leading-relaxed opacity-55">{footerNote}</p>
        )}
      </div>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-canvas px-6 py-3.5 text-sm font-semibold text-ink transition-transform duration-150 active:scale-[0.98] hover:bg-[#1c1c20]"
      >
        {ctaLabel}
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Graspo proof — compact organic-results block.
   Figures sourced from the Graspo case study
   (GraspoMetrics.jsx / GraspoAudience.jsx).
───────────────────────────────────────────── */
const GRASPO_STATS = [
  { value: '10.7M+', label: 'Organic Views' },
  { value: '20K+', label: 'Facebook Followers' },
  { value: '8K+', label: 'Instagram Followers' },
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
