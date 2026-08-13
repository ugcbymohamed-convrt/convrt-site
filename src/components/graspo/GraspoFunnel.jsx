import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   ATTENTION → DEMAND
   The central narrative of the page: verified,
   ordered stages from views down to advanced
   commercial opportunities. Widths are illustrative
   (log-scaled for legibility, not linear) — the
   numbers themselves are what carry the story.
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

const STAGES = [
  { value: '10.7M', label: 'Total views', desc: 'Facebook + Instagram, Jan–Jun 2026', pct: 100 },
  { value: '3.4M', label: 'Accounts reached', desc: 'Unique people who saw the content', pct: 74 },
  { value: '60', label: 'Unique inbound leads', desc: 'Real inquiries across Meta, email & WhatsApp', pct: 46 },
  { value: '26', label: 'High-priority opportunities', desc: 'Qualified for active follow-up', pct: 30 },
  { value: '10', label: 'Advanced / quotation-stage', desc: 'Offer sent or being prepared, samples shipped, or moved to WhatsApp/sales', pct: 18 },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

export default function GraspoFunnel() {
  const [ref, visible] = useInView()

  return (
    <section className="relative py-16 md:py-24">
      <div ref={ref} className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">Attention → Demand</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            The social funnel, start to finish.
          </h2>
          <p className="mt-6 text-[15px] text-ink-muted leading-relaxed">
            This is the funnel observed during the management period, not a claim that every
            view produced an inquiry. It's what happened between a content strategy and a sales team's inbox.
          </p>
        </div>

        <div className="space-y-3">
          {STAGES.map((s, i) => (
            <div key={s.label} className="relative">
              <div
                className="relative overflow-hidden rounded-2xl border border-hairline bg-surface-1/40"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(14px)',
                  transition: `opacity 0.6s ${i * 110}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${i * 110}ms cubic-bezier(0.22,1,0.36,1)`,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: visible ? `${s.pct}%` : '0%',
                    background: 'rgba(213,255,64,0.10)',
                    borderRight: '1px solid rgba(213,255,64,0.25)',
                    transition: `width 0.9s ${i * 110 + 150}ms cubic-bezier(0.22,1,0.36,1)`,
                  }}
                />
                <div className="relative flex items-center justify-between gap-4 px-6 py-4 md:px-8 md:py-5">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <span
                      className="shrink-0 font-display font-bold tabular-nums"
                      style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: i === 0 ? ACCENT : '#ffffff' }}
                    >
                      {s.value}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">{s.label}</p>
                      <p className="text-[11.5px] text-ink-subtle truncate">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
                    <path d="M6 2v8M2.5 7L6 10.5 9.5 7" stroke="#52525b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
