import { useEffect, useRef, useState } from 'react'

const ACCENT = '#d5ff40'

const CATEGORIES = [
  { label: 'Book & catalog printing', count: 37, color: '#a3e600' },
  { label: 'B2B cooperation / agency / samples', count: 14, color: '#c2f227' },
  { label: 'Shipping / MOQ questions', count: 10, color: '#d5ff40' },
  { label: 'General printing / pricing', count: 9, color: '#e2ff70' },
  { label: 'Premium / other print', count: 5, color: '#eeffa3' },
]
const TOTAL_LEADS = CATEGORIES.reduce((sum, c) => sum + c.count, 0)

const MONTHS = [
  { label: 'Feb', count: 10 },
  { label: 'Mar', count: 20 },
  { label: 'Apr', count: 6 },
  { label: 'May', count: 30, peak: true },
  { label: 'Jun', count: 9 },
]
const MAX_MONTH = Math.max(...MONTHS.map((m) => m.count))

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

export default function GraspoLeadComposition() {
  const [ref, visible] = useInView()

  return (
    <section className="relative py-16 md:py-24 border-y border-hairline bg-surface-1/20">
      <div ref={ref} className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl mx-auto mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">Lead Composition &amp; Momentum</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            Consistent demand, not
            <br />
            one viral accident.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Category breakdown */}
          <div className="lg:col-span-7 rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9">
            <p className="text-sm font-semibold text-ink mb-1">What the 75 leads were about</p>
            <p className="text-[12px] text-ink-subtle mb-6">By inquiry group, {TOTAL_LEADS} unique leads</p>

            <div className="h-4 w-full rounded-full overflow-hidden flex bg-surface-3 mb-6">
              {CATEGORIES.map((c, i) => (
                <div
                  key={c.label}
                  style={{
                    width: visible ? `${(c.count / TOTAL_LEADS) * 100}%` : '0%',
                    background: c.color,
                    transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[13px] text-ink-muted truncate">{c.label}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-ink tabular-nums shrink-0">
                    {c.count} <span className="text-ink-subtle font-normal">({Math.round((c.count / TOTAL_LEADS) * 100)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly momentum */}
          <div className="lg:col-span-5 rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9">
            <p className="text-sm font-semibold text-ink mb-1">Leads by month</p>
            <p className="text-[12px] text-ink-subtle mb-8">Feb – Jun 2026</p>

            <div className="flex items-end justify-between gap-3 h-40">
              {MONTHS.map((m, i) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end">
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: m.peak ? ACCENT : '#a1a1aa' }}>
                    {m.count}
                  </span>
                  <div
                    className="w-full rounded-t-lg"
                    style={{
                      height: visible ? `${(m.count / MAX_MONTH) * 100}%` : '0%',
                      minHeight: visible ? '4px' : 0,
                      background: m.peak ? ACCENT : '#3f3f46',
                      transition: `height 0.8s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.09}s`,
                    }}
                  />
                  <span className="text-[11px] text-ink-subtle">{m.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[12.5px] text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">May was the strongest month,</span> 30 unique
              leads, as content momentum compounded rather than spiked and faded.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
