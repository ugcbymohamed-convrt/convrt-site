import { useInView } from '../caseStudies/shared/useInView.js'

/* ─────────────────────────────────────────────
   Every figure here is attached to the specific engagement it came
   from — verified against src/components/elyon/ElyonMetrics.jsx and
   src/components/graspo/GraspoMetrics.jsx, the same numbers used on
   the live case-study pages. No marketplace badges, no anonymous
   volume stats — a growth buyer should see a result and a name in
   the same breath.
───────────────────────────────────────────── */

const PROOF = [
  { value: '5.28x', label: 'Peak ROAS on a standout creative', client: 'Elyon Dubai · Paid Social' },
  { value: '160+', label: 'Creatives produced across 4 locations', client: 'Elyon Dubai · Ongoing Partner' },
  { value: '75', label: 'Qualified inbound leads generated', client: 'Graspo · Content System' },
]

export default function ScaleTrustBridge() {
  const [ref, visible] = useInView(0.1)

  return (
    <section className="relative py-12 md:py-16">
      <div ref={ref} className="mx-auto max-w-4xl px-5 md:px-8">
        <FadeUp show={visible} delay={0}>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-ink-subtle">
            Proof, attached to real engagements
          </p>
        </FadeUp>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {PROOF.map((p, i) => (
            <FadeUp key={p.client} show={visible} delay={100 + i * 90}>
              <div className="h-full rounded-2xl border border-hairline bg-surface-1/40 px-6 py-6 text-center">
                <p className="font-display font-bold tracking-display text-lime leading-none text-[clamp(1.9rem,4.5vw,2.4rem)] tabular-nums">
                  {p.value}
                </p>
                <p className="mt-2.5 text-[13px] text-ink-muted leading-snug">{p.label}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">{p.client}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

function FadeUp({ children, show, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
