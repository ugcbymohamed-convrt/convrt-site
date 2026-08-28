import { useInView } from '../caseStudies/shared/useInView.js'
import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT, ACCENT_LIGHT } from './theme.js'

/* ─────────────────────────────────────────────
   PERFORMANCE
   Two verified, SEPARATE performance snapshots from
   two different time periods — kept visually distinct
   so they are never read as one combined dataset.
───────────────────────────────────────────── */

const PROOF_BASE = '/case-studies/elyon/proof'

export default function ElyonPerformance() {
  const [ref, visible] = useInView(0.1)

  return (
    <section className="relative py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="max-w-2xl mx-auto mb-12 md:mb-14 text-center">
          <Eyebrow label="Performance" accent={ACCENT} className="mb-6" />
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            Creative that didn't just get watched.
            <br />
            It sold perfume.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            Two verified snapshots from two different moments in the campaign. They are kept separate
            below on purpose, not added together.
          </p>
        </div>

        {/* ── Snapshot 1: early test ── */}
        <div
          className="rounded-[32px] border px-6 py-8 md:px-12 md:py-10"
          style={{
            borderColor: 'rgba(201,166,104,0.18)',
            background: 'linear-gradient(160deg, rgba(201,166,104,0.07) 0%, rgba(255,255,255,0.015) 100%)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            Performance Snapshot 1 &middot; Early Test
          </p>

          <div className="mt-7 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
            <Stat value="$229.89" label="Ad Spend" visible={visible} delay={80} />
            <Arrow />
            <Stat value="$835" label="Purchase Value" visible={visible} delay={180} />
            <Arrow />
            <Stat value="3.63x" label="Average ROAS" accent visible={visible} delay={280} big />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <MiniStat label="Top creative" value="5.10x ROAS" visible={visible} delay={380} />
            <MiniStat label="Second strong creative" value="3.17x ROAS" visible={visible} delay={440} />
          </div>

          <p className="mt-6 text-center text-[12.5px] text-ink-subtle leading-relaxed max-w-lg mx-auto">
            Four creatives, over two days, on a cold ad account still in the learning phase with an
            unoptimised setup.
          </p>

          <ProofBadge src={`${PROOF_BASE}/proof-early-test.webp`} label="Client-verified via WhatsApp" />
        </div>

        {/* ── Divider callout ── */}
        <div className="my-8 flex items-center justify-center gap-3 text-ink-subtle">
          <span className="h-px w-10" style={{ background: 'rgba(201,166,104,0.25)' }} />
          <span className="text-[11px] uppercase tracking-[0.18em]">A separate result, weeks later</span>
          <span className="h-px w-10" style={{ background: 'rgba(201,166,104,0.25)' }} />
        </div>

        {/* ── Snapshot 2: standout single creative ── */}
        <div
          className="relative overflow-hidden rounded-[32px] border px-6 py-10 md:px-12 md:py-14 text-center"
          style={{
            borderColor: 'rgba(201,166,104,0.30)',
            background: 'radial-gradient(120% 140% at 50% 0%, rgba(201,166,104,0.14) 0%, rgba(10,10,11,0.4) 65%)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s 0.15s cubic-bezier(0.22,1,0.36,1), transform 0.8s 0.15s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            Performance Snapshot 2 &middot; Standout Result
          </p>
          <h3
            className="mt-4 font-display font-bold leading-[1.05] text-[clamp(1.7rem,5vw,3.2rem)]"
            style={{ color: ACCENT_LIGHT }}
          >
            One creative. Nine sales.
          </h3>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-14">
            <BigStat value="$3,421.25" label="Revenue" visible={visible} delay={260} />
            <BigStat value="9" label="Purchases" visible={visible} delay={340} />
            <BigStat value="5.28x" label="ROAS" accent visible={visible} delay={420} />
          </div>

          <p className="mt-7 text-[13px] text-ink-muted leading-relaxed max-w-md mx-auto">
            The client sent these Meta results directly, unprompted, because the creative was
            performing strongly.
          </p>

          <ProofBadge src={`${PROOF_BASE}/proof-nine-sales.webp`} label="Client-verified via WhatsApp" center />
        </div>
      </div>
    </section>
  )
}

/* Small, secondary proof artifact, a real cropped client message,
   shown quiet enough that the numbers stay the star of the section. */
function ProofBadge({ src, label, center = false }) {
  return (
    <div className={`mt-6 flex items-center gap-2.5 ${center ? 'justify-center' : 'justify-center'}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={64}
        height={36}
        className="h-9 w-16 shrink-0 rounded-md border object-cover"
        style={{ borderColor: 'rgba(201,166,104,0.3)' }}
      />
      <span className="text-[10.5px] uppercase tracking-[0.12em] text-ink-subtle">{label}</span>
    </div>
  )
}

function Stat({ value, label, visible, delay = 0, accent = false, big = false }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.6s ${delay}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      <span
        className={`font-display font-bold tabular-nums leading-none ${big ? 'text-[clamp(2rem,5vw,3rem)]' : 'text-[clamp(1.6rem,4vw,2.3rem)]'}`}
        style={{ color: accent ? ACCENT : '#ffffff' }}
      >
        {value}
      </span>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        {label}
      </span>
    </div>
  )
}

function BigStat({ value, label, visible, delay = 0, accent = false }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.94)',
        transition: `opacity 0.7s ${delay}ms cubic-bezier(0.22,1,0.36,1), transform 0.7s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      <span
        className="font-display font-black tabular-nums leading-none text-[clamp(2.4rem,7vw,4.2rem)]"
        style={{ color: accent ? ACCENT : '#ffffff' }}
      >
        {value}
      </span>
      <span className="mt-3 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
        {label}
      </span>
    </div>
  )
}

function MiniStat({ label, value, visible, delay = 0 }) {
  return (
    <div
      className="rounded-2xl border px-4 py-4 text-center"
      style={{
        borderColor: 'rgba(201,166,104,0.16)',
        background: 'rgba(255,255,255,0.02)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.55s ${delay}ms cubic-bezier(0.22,1,0.36,1), transform 0.55s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      <p className="text-[11px] text-ink-subtle">{label}</p>
      <p className="mt-1 font-display font-bold text-lg" style={{ color: ACCENT }}>{value}</p>
    </div>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 12" className="h-3 w-6 shrink-0 rotate-90 md:rotate-0 text-ink-subtle" fill="none" aria-hidden="true">
      <path d="M0 6h20M20 6l-5-5M20 6l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
