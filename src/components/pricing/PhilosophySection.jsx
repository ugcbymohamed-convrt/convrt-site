import { OFFER_PATHS } from '../../config.js'
import { CONVRT_STATS } from '../../lib/siteStats.js'
import { SPRINT, ORGANIC_STAGES, PRODUCTION_LANGUAGES } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from './shared.jsx'

/* SECTION 2: creative philosophy + credibility + the free Roadmap offer, as one cohesive block.
   Left: the philosophy for the selected goal (Paid: the concept-to-variation diagram for the STANDARD Sprint; Organic:
   the Strategy -> Production -> Publishing & engagement -> Optimization sequence). Right: the Free Creative Growth
   Roadmap card (existing flow, no new funnel). Below: the credibility statistics. Both goal variants are always in the
   HTML; `hidden` picks the visible one. */
const ANGLES = ['Problem-led', 'Social proof', 'Product in use', 'Objection handling', 'Offer-led']

/* One concept: a play tile, a bracket that splits into two, and two variation chips (A, B). */
function ConceptColumn({ index, accent }) {
  return (
    <li className="flex flex-col items-center" title={ANGLES[index]}>
      <svg viewBox="0 0 56 42" width="56" height="42" className="h-[38px] w-[50px] md:h-[42px] md:w-[56px]" aria-hidden="true">
        <rect x="1.5" y="1.5" width="53" height="39" rx="10" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="2" />
        <path d="M23 12.5l17 8.5-17 8.5z" fill={accent} />
      </svg>
      <span className="mt-1.5 text-[11.5px] font-medium leading-none text-ink md:text-[12.5px]">Concept {index + 1}</span>
      <svg viewBox="0 0 64 24" preserveAspectRatio="none" className="mt-1.5 h-5 w-[58px] md:w-[64px]" fill="none" aria-hidden="true">
        <path d="M32 0V8M16 8H48M16 8V24M48 8V24" pathLength="1" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="branch-draw" style={{ '--d': `${index * 70}ms` }} />
      </svg>
      <div className="flex gap-1.5">
        {['A', 'B'].map((v) => (
          <div key={v} className="flex flex-col items-center">
            <svg viewBox="0 0 28 36" className="h-[32px] w-[25px] md:h-[36px] md:w-[28px]" aria-hidden="true">
              <rect width="28" height="36" rx="7" fill={accent} />
              <path d="M10 11l9 7-9 7z" fill="#0a0a0b" />
            </svg>
            <span className="mt-1 text-[11px] font-semibold leading-none text-ink-muted">{v}</span>
          </div>
        ))}
      </div>
    </li>
  )
}

const SEQ_ICONS = {
  strategy: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /></>,
  production: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10.5l4-2.5v8l-4-2.5" /></>,
  publishing: <><path d="M21 4L10 14M21 4l-6.5 17-3.5-7-7-3.5z" /></>,
  optimization: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
}

function PaidPhilosophy() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold leading-[1.1] tracking-display text-ink md:text-[26px] lg:text-[28px]">
        Different concepts. <span className="text-lime">Not just different hooks.</span>
      </h2>
      <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">
        We develop genuinely different creative angles, then create variations designed for structured testing.
      </p>
      <ol className="mt-6 grid grid-cols-5 gap-1.5 md:gap-3" aria-label="Creative Testing Sprint structure (illustrative)">
        {ConceptAccents.map((accent, i) => <ConceptColumn key={accent} index={i} accent={accent} />)}
      </ol>
      <p className="mt-5 font-display text-base font-bold tracking-snug text-lime md:text-lg">
        {SPRINT.concepts} original concepts <span aria-hidden="true">&rarr;</span> {SPRINT.variations} ad variations
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">A concept</span> is a distinct advertising idea or angle.{' '}
        <span className="font-semibold text-ink">A variation</span> changes the hook or CTA within a concept.
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-subtle">
        Standard Sprint shown. Your concepts are tailored to your brand. Sprint Plus distributes its variations across its
        concepts according to the creative testing strategy.
      </p>
    </div>
  )
}

function OrganicPhilosophy() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold leading-[1.1] tracking-display text-ink md:text-[26px] lg:text-[28px]">
        Consistency. Content. <span className="text-lime">Real connections.</span>
      </h2>
      <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">
        A consistent, video-first approach to organic social growth.
      </p>
      <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Our organic approach">
        {ORGANIC_STAGES.map((st, i) => (
          <li key={st.id} className="relative rounded-2xl border border-hairline bg-black/25 px-3.5 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-lime">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {SEQ_ICONS[st.id]}
              </svg>
            </span>
            <p className="mt-2.5 font-display text-[13.5px] font-semibold leading-snug text-ink">{st.sequenceLabel}</p>
            {i < ORGANIC_STAGES.length - 1 && (
              <span aria-hidden="true" className="absolute -right-[11px] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-canvas text-[11px] text-lime sm:flex">&rarr;</span>
            )}
          </li>
        ))}
      </ol>
      <a href="/case-studies/graspo" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime transition-colors hover:text-lime-light">
        See how we grew Graspo <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}

function RoadmapCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-[24px] border border-lime/25 bg-gradient-to-br from-lime/[0.09] via-surface-1/60 to-surface-1/40 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">Your free Creative Growth Roadmap</p>
          <h3 className="mt-2 font-display text-xl font-bold leading-tight tracking-display text-ink md:text-2xl">Not sure where to start?</h3>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime/10 text-lime">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" />
          </svg>
        </span>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">Get 5 personalized ad concepts for your brand, completely free.</p>
      <a
        href={OFFER_PATHS.roadmap}
        className="cta-gradient group mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas"
      >
        Get 5 Free Ad Concepts
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}

const STATS = [
  { value: CONVRT_STATS.views, label: 'Views generated' },
  { value: CONVRT_STATS.videos, label: 'Videos produced' },
  { value: CONVRT_STATS.clients, label: 'Clients served' },
  { value: String(PRODUCTION_LANGUAGES.core.length), label: 'Core production languages' },
]

export default function PhilosophySection({ service }) {
  return (
    <section id="philosophy" aria-label="Our creative approach" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12 lg:items-stretch">
          <div>
            <div hidden={service !== 'paid'}><PaidPhilosophy /></div>
            <div hidden={service !== 'organic'}><OrganicPhilosophy /></div>
          </div>
          <RoadmapCard />
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-4 md:mt-10">
          {STATS.map((s) => (
            <li key={s.label} className="bg-surface-1/90 px-3 py-4 text-center">
              <p className="font-display text-xl font-bold leading-none tracking-display tabular-nums text-ink md:text-2xl">{s.value}</p>
              <p className="mt-1.5 text-[11.5px] leading-tight text-ink-muted">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
