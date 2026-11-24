import { forward } from '../../lib/rtl.js'
import { OFFER_PATHS } from '../../config.js'
import { currentLocale } from '../../i18n/locale.js'
import { resolveCta } from '../../i18n/cta.js'
import { money } from '../../i18n/money.js'
import { localizeStat } from '../../i18n/format.js'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../../lib/siteStats.js'
import { withUtm } from '../../lib/analytics.js'
import { SPRINT, SPRINT_PLUS, ORGANIC_STAGES, ORGANIC, ORGANIC_CTA, PRODUCTION_LANGUAGES } from '../../seo/businessKnowledge.js'
import { tr, hrefFor } from '../../i18n/tr.js'

/* SECTION 2: creative philosophy + credibility + the free Roadmap offer, as one cohesive block.
   Left: the philosophy for the selected goal (Paid: the concept-to-variation diagram for the STANDARD Sprint; Organic:
   the Strategy -> Production -> Publishing & engagement -> Optimization sequence). Right: the Free Creative Growth
   Roadmap card (existing flow, no new funnel). Below: the credibility statistics. Both goal variants are always in the
   HTML; `hidden` picks the visible one. */
/* LEFT: the creative testing SYSTEM, drawn as a technical diagram: monochrome (white and grey) with small lime junction points.
   One concept node branches (right-angle connectors) into three variation nodes (A, B, C; SPRINT.variationsPerConcept). Structure and precision, not illustration:
   no colour coding, no video-player shapes. Lines draw in on scroll only where supported and motion is allowed (.branch-draw). */
const GRID_BG = { backgroundImage: 'radial-gradient(rgba(250,250,250,0.075) 1px, transparent 1px)', backgroundSize: '14px 14px' }

function ConceptColumn({ index }) {
  return (
    <li className="flex flex-col items-center">
      <span className="whitespace-nowrap text-[10.5px] font-medium uppercase leading-none tracking-[0.1em] text-ink-muted md:tracking-[0.14em]"><span className="sr-only md:not-sr-only">{tr('Concept')}{' '}</span>{index + 1}</span>
      <svg viewBox="0 0 80 74" className="mt-2 h-auto w-full max-w-[84px]" fill="none" aria-hidden="true">
        <circle cx="40" cy="8" r="5.5" stroke="#fafafa" strokeOpacity="0.9" strokeWidth="1.4" fill="#0a0a0b" />
        <path d="M40 13.5V38M14 38H66M14 38V57M40 38V57M66 38V57" pathLength="1" stroke="#a1a1aa" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="square" className="branch-draw" style={{ '--d': `${index * 70}ms` }} />
        <circle cx="40" cy="38" r="2.2" fill="#d5ff40" />
        {[8, 34, 60].map((x) => (
          <rect key={x} x={x} y="57" width="12" height="12" rx="2.5" stroke="#fafafa" strokeOpacity="0.85" strokeWidth="1.3" fill="#fafafa" fillOpacity="0.07" />
        ))}
      </svg>
      <div className="grid w-full max-w-[84px] grid-cols-3 text-center text-[11px] font-semibold leading-none text-ink-muted">
        <span>A</span>
        <span>B</span>
        <span>C</span>
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
      <h2 className="font-display text-2xl font-bold leading-[1.1] tracking-display text-ink md:text-[26px] lg:text-[28px]">{tr('Different concepts.')}{' '}<span className="text-lime">{tr('Not just different hooks.')}</span>
      </h2>
      <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">{tr('We develop distinct creative angles, then create variations for structured testing.')}</p>
      <div className="mt-6 rounded-2xl border border-white/[0.08] px-2 py-4 md:px-4 md:py-5" style={GRID_BG}>
        <ol className="grid grid-cols-5 gap-1 md:gap-3" aria-label={tr('Creative Testing Sprint structure (illustrative)')}>
          {[0, 1, 2, 3, 4].map((i) => <ConceptColumn key={i} index={i} />)}
        </ol>
      </div>
      <p className="mt-5 font-display text-base font-bold tracking-snug text-lime md:text-lg">
        {SPRINT.concepts} {tr('original concepts')} <span aria-hidden="true">&rarr;</span> {SPRINT.variations} {tr('finished ad versions')}
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">{tr('A concept')}</span> {tr('is a unique ad idea.')}{' '}
        <span className="font-semibold text-ink">{tr('A variation')}</span>{' '}{tr('changes its hook or CTA.')}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-subtle">
        {tr(`Standard Sprint shown. Sprint Plus includes ${SPRINT_PLUS.concepts} concepts and ${SPRINT_PLUS.variations} finished ad versions.`)}
      </p>
    </div>
  )
}

function OrganicPhilosophy() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold leading-[1.1] tracking-display text-ink md:text-[26px] lg:text-[28px]">{tr('Consistency. Content.')}{' '}<span className="text-lime">{tr('Real connections.')}</span>
      </h2>
      <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">{tr('A video-first approach to building your organic presence.')}</p>
      <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={tr('Our organic approach')}>
        {ORGANIC_STAGES.map((st, i) => (
          <li key={st.id} className="relative rounded-2xl border border-hairline bg-black/25 px-3.5 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-lime">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {SEQ_ICONS[st.id]}
              </svg>
            </span>
            <p className="mt-2.5 font-display text-[13.5px] font-semibold leading-snug text-ink">{tr(st.sequenceLabel)}</p>
            {i < ORGANIC_STAGES.length - 1 && (
              <span aria-hidden="true" className="absolute -right-[11px] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-canvas text-[11px] text-lime sm:flex">&rarr;</span>
            )}
          </li>
        ))}
      </ol>
      <a href={hrefFor('/case-studies/graspo')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime transition-colors hover:text-lime-light">{tr('See how we grew Graspo')}{' '}<span aria-hidden="true">{forward()}</span>
      </a>
    </div>
  )
}

/* RIGHT: a creative PITCH-BOARD, deliberately the opposite of the left diagram: expressive, editorial, overlapping. Three
   illustrative mock ads (creator-led lifestyle, SaaS product demo, bold product ad) drawn as lightweight inline SVG. They are
   made-up mockups, not client work: no logos, no results, no testimonials. Static, no animation, no external assets. */
function PitchBoard() {
  return (
    <div className="mx-auto max-w-[380px]">
      <svg viewBox="0 0 360 214" className="h-auto w-full" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pb-warm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a3326" />
            <stop offset="1" stopColor="#1d1511" />
          </linearGradient>
          <radialGradient id="pb-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#e0b080" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e0b080" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* B: SaaS product demo (back, centre) */}
        <g transform="rotate(1.5 182 70)">
          <rect x="101" y="17" width="168" height="116" rx="10" fill="#000" opacity="0.35" />
          <rect x="98" y="12" width="168" height="116" rx="10" fill="#15171c" stroke="#fafafa" strokeOpacity="0.14" />
          <circle cx="109" cy="22" r="2" fill="#fafafa" opacity="0.35" /><circle cx="116" cy="22" r="2" fill="#fafafa" opacity="0.25" /><circle cx="123" cy="22" r="2" fill="#fafafa" opacity="0.15" />
          <text x="258" y="24.5" textAnchor="end" fontSize="6.5" fontWeight="600" letterSpacing="1.1" fill="#fafafa" opacity="0.5">{tr('PRODUCT DEMO')}</text>
          <rect x="105" y="33" width="28" height="88" rx="6" fill="#fafafa" opacity="0.05" />
          <rect x="110" y="40" width="18" height="3.5" rx="1.75" fill="#fafafa" opacity="0.45" />
          <rect x="110" y="49" width="14" height="3.5" rx="1.75" fill="#fafafa" opacity="0.2" />
          <rect x="110" y="58" width="16" height="3.5" rx="1.75" fill="#fafafa" opacity="0.2" />
          <rect x="142" y="36" width="58" height="6" rx="3" fill="#fafafa" opacity="0.7" />
          <rect x="142" y="47" width="36" height="4" rx="2" fill="#fafafa" opacity="0.22" />
          {[16, 24, 20, 32, 44].map((h, i) => (
            <rect key={i} x={144 + i * 17} y={104 - h} width="11" height={h} rx="2.5" fill={i === 4 ? '#d5ff40' : '#fafafa'} opacity={i === 4 ? 1 : 0.14} />
          ))}
          <path d="M148 88C162 80 170 84 182 74S206 70 228 62" stroke="#fafafa" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <text x="142" y="119" fontSize="8.5" fontWeight="600" fill="#fafafa" opacity="0.85">{tr('See it in action')}</text>
          <circle cx="212" cy="84" r="10" stroke="#d5ff40" strokeOpacity="0.8" strokeWidth="1.3" fill="none" />
          <path d="M208 76l11 7-4.6 1.4-2.2 4.4z" fill="#fafafa" />
        </g>

        {/* A: creator-led lifestyle ad (portrait, front left) */}
        <g transform="translate(20 0) rotate(-5 62 104)">
          <rect x="17" y="24" width="98" height="172" rx="14" fill="#000" opacity="0.4" />
          <rect x="14" y="18" width="98" height="172" rx="14" fill="url(#pb-warm)" stroke="#fafafa" strokeOpacity="0.14" />
          <circle cx="76" cy="78" r="46" fill="url(#pb-glow)" />
          <rect x="22" y="26" width="82" height="2.5" rx="1.25" fill="#fafafa" opacity="0.22" />
          <rect x="22" y="26" width="34" height="2.5" rx="1.25" fill="#fafafa" opacity="0.9" />
          <text x="22" y="42" fontSize="6.5" fontWeight="600" letterSpacing="1.1" fill="#fafafa" opacity="0.55">{tr('CREATOR-LED')}</text>
          <path d="M28 160C28 128 45 116 63 116S98 128 98 160V170H28z" fill="#fafafa" opacity="0.16" />
          <circle cx="63" cy="96" r="15" fill="#e0c3a8" />
          <path d="M48 93C49 80 58 76 66 77S79 82 78 93C73 86 58 85 48 93z" fill="#3a2a22" />
          <circle cx="102" cy="112" r="5.5" fill="#fafafa" opacity="0.16" /><circle cx="102" cy="130" r="5.5" fill="#fafafa" opacity="0.16" />
          <rect x="22" y="152" width="82" height="24" rx="7" fill="#d5ff40" />
          <text x="63" y="168" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0a0a0b">{tr('It just works.')}</text>
        </g>

        {/* C: bold product-focused ad (front right) */}
        <g transform="translate(-12 0) rotate(5 290 120)">
          <rect x="235" y="50" width="116" height="150" rx="12" fill="#000" opacity="0.4" />
          <rect x="232" y="44" width="116" height="150" rx="12" fill="#f2f2ee" />
          <text x="244" y="78" fontSize="21" fontWeight="800" letterSpacing="-0.6" fill="#0a0a0b">{tr('MADE')}</text>
          <text x="244" y="97" fontSize="21" fontWeight="800" letterSpacing="-0.6" fill="#0a0a0b">{tr('TO BE')}</text>
          <rect x="240" y="102" width="68" height="22" rx="4" fill="#d5ff40" />
          <text x="244" y="119" fontSize="21" fontWeight="800" letterSpacing="-0.6" fill="#0a0a0b">{tr('SEEN.')}</text>
          <ellipse cx="316" cy="182" rx="20" ry="3.5" fill="#0a0a0b" opacity="0.18" />
          <rect x="309" y="124" width="14" height="10" rx="3" fill="#0a0a0b" />
          <rect x="301" y="132" width="30" height="50" rx="9" fill="#0a0a0b" />
          <rect x="304" y="148" width="24" height="20" rx="4" fill="#d5ff40" />
          <rect x="308" y="154" width="16" height="3" rx="1.5" fill="#0a0a0b" />
          <rect x="308" y="160" width="10" height="3" rx="1.5" fill="#0a0a0b" opacity="0.5" />
          <text x="244" y="58" fontSize="6.5" fontWeight="600" letterSpacing="1.1" fill="#0a0a0b" opacity="0.55">{tr('PRODUCT-LED')}</text>
        </g>
      </svg>
    </div>
  )
}

function RoadmapCard() {
  const rcta = resolveCta(currentLocale(), { href: OFFER_PATHS.roadmap, label: 'Get 5 Free Ad Concepts' })
  return (
    <div className="rounded-[24px] border border-lime/25 bg-gradient-to-br from-lime/[0.09] via-surface-1/60 to-surface-1/40 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">{tr('Your free Creative Growth Roadmap')}</p>
      <h3 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-display text-ink md:text-[26px]">{currentLocale() === 'es' ? <>{tr('5 ad concepts for your brand.')}{' '}<span className="text-lime">{tr('Free.')}</span></> : <>{tr('Your next')}{' '}<span className="text-lime">{tr('5 winning ad concepts.')}</span></>}
      </h3>
      <div className="mt-4"><PitchBoard /></div>
      <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{tr('Five personalized creative ideas for your brand, built around your product and audience.')}</p>
      <p className="mt-2.5 flex items-center gap-2 text-[13px] text-ink-muted">
        <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-lime" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 8.2l2 2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>{tr('Completely free. No obligation.')}</p>
      {rcta.redirected && <p className="mt-2 text-[12.5px] leading-relaxed text-ink-subtle">{tr('The online Roadmap application is not available in this language yet. Book a free 20-minute strategy call (subject to a short fit check, no obligation) and we explain how to get your five ad concepts.')}</p>}
      <a
        href={rcta.href}
        {...(rcta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="cta-gradient group mt-4 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas"
      >{tr(rcta.redirected ? rcta.label : 'Get 5 Free Ad Concepts')}<svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}

/* Shown instead of the Roadmap card when Organic Social is selected: the Roadmap offers FREE AD concepts (a paid-ads offer), so it
   is not presented as an organic deliverable. Route: the organic strategy call, the same destination as the Organic Social page (see ORGANIC_CTA in businessKnowledge.js). */
function OrganicOfferCard() {
  const o = ORGANIC_CTA.promo
  return (
    <div className="rounded-[24px] border border-lime/25 bg-gradient-to-br from-lime/[0.09] via-surface-1/60 to-surface-1/40 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">{tr(o.eyebrow)}</p>
      <h3 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-display text-ink md:text-[26px]">{tr(o.headline)}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {ORGANIC.platforms.map((p) => (
          <li key={p} className="rounded-full border border-hairline-strong bg-surface-2 px-3 py-1 text-[12.5px] font-medium text-ink">{p}</li>
        ))}
      </ul>
      <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{tr(o.text)}</p>
      <a
        href={ORGANIC_CTA.href}
        {...(ORGANIC_CTA.external ? { target: '_blank', rel: 'noopener noreferrer', onClick: (e) => { e.currentTarget.href = withUtm(ORGANIC_CTA.href) } } : {})}
        className="cta-gradient group mt-5 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas"
      >
        {tr(ORGANIC_CTA.label)}
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}

/* `founder`: the figure is the founder's combined professional experience (see siteStats.js), marked with an asterisk and explained under the row. */
const STATS = [
  { value: CONVRT_STATS.views, label: 'Views generated', founder: true },
  { value: CONVRT_STATS.videos, label: 'Videos produced', founder: true },
  { value: CONVRT_STATS.clients, label: 'Clients served', founder: true },
  { value: String(PRODUCTION_LANGUAGES.core.length), label: 'Core production languages' },
]

export default function PhilosophySection({ service }) {
  return (
    <section id="philosophy" aria-label={tr('Our creative approach')} className="relative overflow-hidden py-9 md:py-12">
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
              <p className="font-display text-xl font-bold leading-none tracking-display tabular-nums text-ink md:text-2xl">{localizeStat(currentLocale(), s.value)}</p>
              <p className="mt-1.5 text-[11.5px] leading-tight text-ink-muted">{tr(s.label)}{s.founder && <span aria-hidden="true">*</span>}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-[11.5px] leading-snug text-ink-muted">* {tr(FOUNDER_EXPERIENCE.footnote)}</p>
      </div>
    </section>
  )
}
