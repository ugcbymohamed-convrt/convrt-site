import { useEffect, useRef, useState } from 'react'
import { BOOKING_URL } from '../../config.js'

/* ─────────────────────────────────────────────
   GRASPO CASE STUDY — HERO
   Lime accent, matching CONVRT's sitewide brand
   color (same as the CTA button and favicon).
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

const PROJECT_INFO = [
  { label: 'Client', value: 'Graspo' },
  { label: 'Industry', value: 'Printing & Manufacturing' },
  { label: 'Market', value: 'MENA / Arabic-speaking' },
  { label: 'Reporting Period', value: 'Jan – Jun 2026' },
]

function FadeUp({ children, inView, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function GraspoHero() {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setInView(true)
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24">
      {/* Ambient glow — lime, matches the sitewide brand color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: ACCENT }}
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8 text-center">
        <FadeUp inView={inView} delay={0}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 mb-8 backdrop-blur"
            style={{ borderColor: 'rgba(213,255,64,0.35)', background: 'rgba(213,255,64,0.08)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              Graspo × CONVRT, Case Study
            </span>
          </div>
        </FadeUp>

        <FadeUp inView={inView} delay={90}>
          <p
            className="font-display font-bold tracking-display uppercase text-[clamp(1.1rem,2.4vw,1.5rem)]"
            style={{ color: ACCENT }}
          >
            6 months
          </p>
          <h1 className="mt-2 font-display font-bold text-ink tracking-display-xl leading-[1.05] text-[clamp(1.9rem,5vw,3.6rem)] md:whitespace-nowrap">
            10.7M views. 75 inbound leads.
          </h1>
        </FadeUp>

        <FadeUp inView={inView} delay={180}>
          <p className="mt-7 text-base md:text-lg text-ink-muted leading-relaxed max-w-3xl mx-auto">
            Graspo is an established European printing company. CONVRT built its Arabic-first
            social presence, turning printing expertise into millions of views and real MENA inquiries.
          </p>
        </FadeUp>

        <FadeUp inView={inView} delay={260}>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
              className="cta-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
            >
              Book a Creative Call
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#kpis"
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-7 py-3.5 text-sm font-medium text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors"
            >
              See the numbers
            </a>
          </div>
        </FadeUp>

        <FadeUp inView={inView} delay={340} className="mt-16">
          <div className="rounded-3xl border border-hairline bg-surface-1/50 backdrop-blur-md px-6 py-7 md:px-10 md:py-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
              {PROJECT_INFO.map((item) => (
                <div key={item.label}>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-subtle">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-[14px] leading-snug text-ink font-medium">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
