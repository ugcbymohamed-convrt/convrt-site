import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   ORGANIC DISTRIBUTION
   Platform split + organic proof + top content —
   all pulled directly from the Meta Business Suite
   "Content overview" screenshot (Jan 1 – Jun 19 2026).
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'
const IG_COLOR = '#d5ff40'
const FB_COLOR = '#3b82f6'

const IG_VIEWS = 6_275_727
const FB_VIEWS = 4_385_948
const TOTAL_VIEWS = IG_VIEWS + FB_VIEWS
const IG_PCT = (IG_VIEWS / TOTAL_VIEWS) * 100
const FB_PCT = 100 - IG_PCT

const TOP_CONTENT = [
  { views: 7_500_000, label: '7.5M views', note: 'A common printing mistake, called out' },
  { views: 1_900_000, label: '1.9M views', note: 'Meet the machine, in one take' },
  { views: 1_200_000, label: '1.2M views', note: 'The part that matters most' },
  { views: 84_200, label: '84.2K views', note: 'Setting the standard, on the floor' },
  { views: 31_300, label: '31.3K views', note: 'The mistake that can\'t be undone' },
]
const MAX_TOP = TOP_CONTENT[0].views

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

export default function GraspoDistribution() {
  const [ref, visible] = useInView()

  return (
    <section className="relative py-16 md:py-24">
      <div ref={ref} className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl mx-auto mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">Organic Distribution</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            The content didn't need
            <br />
            media spend to travel.
          </h2>
        </div>

        {/* Views over time — recreates the real growth curve shape from the
            Meta Business Suite analytics (Jan 1 – Jun 19 2026): flat baseline,
            one sharp breakout spike in April, a smaller bump in late May. */}
        <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9 mb-8 lg:mb-10">
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-sm font-semibold text-ink">Views over time</p>
            <p className="text-xs text-ink-subtle">Jan 1 – Jun 19 2026</p>
          </div>

          <div className="relative w-full" style={{ height: 'clamp(140px, 22vw, 200px)' }}>
            <svg viewBox="0 0 1000 220" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,195 C100,193 180,190 250,188 C300,187 320,180 340,170 C355,150 360,60 370,25 C378,15 385,18 392,42 C400,95 410,160 430,185 C500,190 560,188 600,186 C650,183 680,150 700,140 C720,135 740,150 760,175 C820,188 900,192 1000,193 L1000,220 L0,220 Z"
                fill="url(#viewsFill)"
              />
              <path
                d="M0,195 C100,193 180,190 250,188 C300,187 320,180 340,170 C355,150 360,60 370,25 C378,15 385,18 392,42 C400,95 410,160 430,185 C500,190 560,188 600,186 C650,183 680,150 700,140 C720,135 740,150 760,175 C820,188 900,192 1000,193"
                fill="none"
                stroke={ACCENT}
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 1600,
                  strokeDashoffset: visible ? 0 : 1600,
                  transition: 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.1s',
                }}
              />
            </svg>
            <div
              className="absolute flex flex-col items-center"
              style={{ left: '37%', top: '2%', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 1.2s' }}
            >
              <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap" style={{ background: 'rgba(213,255,64,0.15)', border: '1px solid rgba(213,255,64,0.35)', color: ACCENT }}>
                One breakout video
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-ink-subtle">
            <span>Jan 1</span>
            <span>Feb 20</span>
            <span>Apr 11</span>
            <span>May 31</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Platform split */}
          <div className="lg:col-span-7 rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-sm font-semibold text-ink">Views by platform</p>
              <p className="text-xs text-ink-subtle">10.7M total</p>
            </div>

            <div className="mt-5 h-4 w-full rounded-full overflow-hidden flex bg-surface-3">
              <div
                style={{
                  width: visible ? `${IG_PCT}%` : '0%',
                  background: IG_COLOR,
                  transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 0.1s',
                }}
              />
              <div
                style={{
                  width: visible ? `${FB_PCT}%` : '0%',
                  background: FB_COLOR,
                  transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 0.25s',
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: IG_COLOR }} />
                  <span className="text-xs font-semibold text-ink-muted">Instagram</span>
                </div>
                <p className="mt-1.5 font-display font-bold text-2xl text-ink tabular-nums">6.27M</p>
                <p className="text-[11px] text-ink-subtle">{IG_PCT.toFixed(0)}% of total views</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: FB_COLOR }} />
                  <span className="text-xs font-semibold text-ink-muted">Facebook</span>
                </div>
                <p className="mt-1.5 font-display font-bold text-2xl text-ink tabular-nums">4.39M</p>
                <p className="text-[11px] text-ink-subtle">{FB_PCT.toFixed(0)}% of total views</p>
              </div>
            </div>

            {/* Organic proof */}
            <div
              className="mt-7 flex items-start gap-3 rounded-2xl px-5 py-4"
              style={{ background: 'rgba(213,255,64,0.08)', border: '1px solid rgba(213,255,64,0.25)' }}
            >
              <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(213,255,64,0.18)' }}>
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none"><path d="M4 10.5l4 4 8-9" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                <span className="font-semibold text-ink">100% organic on Instagram.</span> All 6.27M
                Instagram views came from organic reach, <span className="tabular-nums">$0</span> spent
                on paid amplification for that distribution.
              </p>
            </div>
          </div>

          {/* Top content */}
          <div className="lg:col-span-5 rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9">
            <p className="text-sm font-semibold text-ink mb-6">Top-performing content by views</p>
            <div className="space-y-4">
              {TOP_CONTENT.map((c, i) => (
                <div key={c.label}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[12px] text-ink-muted">{c.note}</span>
                    <span className="text-[12px] font-semibold text-ink tabular-nums">{c.label}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: visible ? `${(c.views / MAX_TOP) * 100}%` : '0%',
                        background: ACCENT,
                        opacity: 1 - i * 0.12,
                        transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.08}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
