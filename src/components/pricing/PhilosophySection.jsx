import { OFFER_PATHS } from '../../config.js'
import { CONVRT_STATS } from '../../lib/siteStats.js'
import { SPRINT, SPRINT_PLUS, ORGANIC_STAGES, ORGANIC, ORGANIC_CTA, PRODUCTION_LANGUAGES } from '../../seo/businessKnowledge.js'
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
        We develop distinct creative angles, then create variations for structured testing.
      </p>
      <ol className="mt-6 grid grid-cols-5 gap-1.5 md:gap-3" aria-label="Creative Testing Sprint structure (illustrative)">
        {ConceptAccents.map((accent, i) => <ConceptColumn key={accent} index={i} accent={accent} />)}
      </ol>
      <p className="mt-5 font-display text-base font-bold tracking-snug text-lime md:text-lg">
        {SPRINT.concepts} original concepts <span aria-hidden="true">&rarr;</span> {SPRINT.variations} ad variations
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">A concept</span> is a unique ad idea.{' '}
        <span className="font-semibold text-ink">A variation</span> changes its hook or CTA.
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-subtle">
        Standard Sprint shown. Sprint Plus includes {SPRINT_PLUS.concepts} concepts and {SPRINT_PLUS.variations} ad variations.
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
        A video-first approach to building your organic presence.
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

/* A creative moodboard: five idea cards for five different ADVERTISING ANGLES (illustrative examples, not promised categories).
   Deliberately unlike the concept diagram on the left: no play buttons, no branching, no video thumbnails. Static CSS + inline
   SVG icons, no animation. */
const ANGLE_ICONS = {
  Problem: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5M12 16v.01" /></>,
  Product: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></>,
  Demo: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M9 20.5h6" /><path d="M10 8.5l5 3-2.2.9-.9 2.2z" /></>,
  Story: <><path d="M4 5h16v10H9l-4 4v-4H4z" /></>,
  Offer: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1" /></>,
}
const ANGLES_BOARD = [
  { label: 'Problem', span: 'col-span-2', rot: -1.6, bars: ['72%', '48%'] },
  { label: 'Product', span: 'col-span-2', rot: 1.2, bars: ['58%', '80%'] },
  { label: 'Demo', span: 'col-span-2', rot: -0.8, bars: ['84%', '40%'] },
  { label: 'Story', span: 'col-span-3', rot: 1.4, bars: ['66%', '86%', '44%'] },
  { label: 'Offer', span: 'col-span-3', rot: -1.2, bars: ['52%', '78%', '60%'] },
]

function Moodboard() {
  return (
    <div className="mx-auto max-w-[360px]">
      <ul className="grid grid-cols-6 gap-2.5 px-1" aria-label="Example creative angles">
        {ANGLES_BOARD.map((a, i) => {
          const c = ConceptAccents[i]
          return (
            <li
              key={a.label}
              className={`${a.span} rounded-xl border p-2.5`}
              style={{ borderColor: `${c}80`, background: `${c}14`, transform: `rotate(${a.rot}deg)` }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: c, color: '#0a0a0b' }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ANGLE_ICONS[a.label]}
                </svg>
              </span>
              <p className="mt-2 text-[12px] font-semibold leading-none text-ink">{a.label}</p>
              <div className="mt-2 space-y-1" aria-hidden="true">
                {a.bars.map((w, j) => (
                  <span key={j} className="block h-[5px] rounded-full" style={{ width: w, background: j === 0 ? c : '#8a8a86', opacity: j === 0 ? 0.75 : 0.35 }} />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-2.5 text-center text-[11px] text-ink-subtle">Example creative angles</p>
    </div>
  )
}

function RoadmapCard() {
  return (
    <div className="rounded-[24px] border border-lime/25 bg-gradient-to-br from-lime/[0.09] via-surface-1/60 to-surface-1/40 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">Your free Creative Growth Roadmap</p>
      <h3 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-display text-ink md:text-[26px]">
        Your next <span className="text-lime">5 winning ad concepts.</span>
      </h3>
      <div className="mt-4"><Moodboard /></div>
      <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">
        Five personalized creative ideas for your brand, built around your product and audience.
      </p>
      <p className="mt-2.5 flex items-center gap-2 text-[13px] text-ink-muted">
        <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-lime" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 8.2l2 2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Completely free. No obligation.
      </p>
      <a
        href={OFFER_PATHS.roadmap}
        className="cta-gradient group mt-4 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas"
      >
        Get 5 Free Ad Concepts
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}

/* Shown instead of the Roadmap card when Organic Social is selected: the Roadmap offers FREE AD concepts (a paid-ads offer), so it
   is not presented as an organic deliverable. Route: the existing contact email (see ORGANIC_CTA in businessKnowledge.js). */
function OrganicOfferCard() {
  const o = ORGANIC_CTA.promo
  return (
    <div className="rounded-[24px] border border-lime/25 bg-gradient-to-br from-lime/[0.09] via-surface-1/60 to-surface-1/40 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">{o.eyebrow}</p>
      <h3 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-display text-ink md:text-[26px]">{o.headline}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {ORGANIC.platforms.map((p) => (
          <li key={p} className="rounded-full border border-hairline-strong bg-surface-2 px-3 py-1 text-[12.5px] font-medium text-ink">{p}</li>
        ))}
      </ul>
      <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{o.text}</p>
      <a
        href={ORGANIC_CTA.href}
        className="cta-gradient group mt-5 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas"
      >
        {ORGANIC_CTA.label}
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12">
          <div>
            <div hidden={service !== 'paid'}><PaidPhilosophy /></div>
            <div hidden={service !== 'organic'}><OrganicPhilosophy /></div>
          </div>
          <div>
            <div hidden={service !== 'paid'}><RoadmapCard /></div>
            <div hidden={service !== 'organic'}><OrganicOfferCard /></div>
          </div>
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
