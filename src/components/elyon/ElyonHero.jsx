import { useEffect, useRef, useState } from 'react'
import { BOOKING_URL } from '../../config.js'
import FadeUp from '../caseStudies/shared/FadeUp.jsx'
import ElyonHeroScene from './ElyonHeroScene.jsx'
import { ACCENT, ACCENT_LIGHT } from './theme.js'

const PROJECT_INFO = [
  { label: 'Client', value: 'Elyon Dubai' },
  { label: 'Industry', value: 'Luxury Fragrance' },
  { label: 'Market', value: 'Dubai, UAE' },
  { label: 'Engagement', value: 'Ongoing Creative Partner' },
]

const TAGS = ['Luxury Fragrance', 'DTC Ecommerce', 'Paid Social', 'UGC', 'Street Interviews', 'Creative Testing']

export default function ElyonHero() {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setInView(true)
  }, [])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden pt-14 pb-4 md:pt-20 md:pb-6"
      style={{ background: 'radial-gradient(120% 100% at 50% 0%, #121009 0%, #0a0a0b 55%)' }}
    >
      {/* Ambient glow — warm champagne, replaces the sitewide lime glow for this study only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: ACCENT }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgba(201,166,104,0.5) 0, transparent 50%),
                             radial-gradient(1px 1px at 80% 20%, rgba(201,166,104,0.4) 0, transparent 50%),
                             radial-gradient(1px 1px at 60% 70%, rgba(201,166,104,0.3) 0, transparent 50%)`,
        }}
      />

      <ElyonHeroScene />

      <div className="relative z-10 mx-auto max-w-5xl px-5 md:px-8 text-center">
        <FadeUp inView={inView} delay={0}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 mb-7 backdrop-blur"
            style={{ borderColor: 'rgba(201,166,104,0.35)', background: 'rgba(201,166,104,0.08)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT_LIGHT }}>
              Elyon Dubai × CONVRT · Case Study
            </span>
          </div>
        </FadeUp>

        <FadeUp inView={inView} delay={90}>
          <h1 className="font-display font-bold text-ink tracking-display-xl leading-[1.08] text-[clamp(1.9rem,4.4vw,3.3rem)] max-w-4xl mx-auto">
            Taking a luxury perfume brand from launch into profitable paid-social creative.
          </h1>
        </FadeUp>

        <FadeUp inView={inView} delay={170}>
          <p className="mt-6 text-base md:text-lg text-ink-muted leading-relaxed max-w-3xl mx-auto">
            Elyon needed creative that could do more than make luxury fragrance look good. It needed
            content capable of turning attention into purchases, so CONVRT built a repeatable mix of
            creator-led ads, street interviews and performance-focused concepts across multiple locations.
          </p>
        </FadeUp>

        <FadeUp inView={inView} delay={220}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-3.5 py-1.5 text-[11.5px] font-medium text-ink-muted"
                style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.03)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeUp>

        <FadeUp inView={inView} delay={280}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas transition-transform duration-150 active:scale-[0.98]"
              style={{ background: `linear-gradient(110deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 60%, ${ACCENT_LIGHT} 100%)` }}
            >
              Book a Creative Call
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="https://ugcbymohamed.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-7 py-3.5 text-sm font-medium text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors"
            >
              See the creative library
            </a>
          </div>
        </FadeUp>

        <ElyonHeroScene mobile />

        <FadeUp inView={inView} delay={340} className="mt-10">
          <div
            className="rounded-3xl border px-6 py-7 md:px-10 md:py-8 backdrop-blur-md"
            style={{ borderColor: 'rgba(201,166,104,0.18)', background: 'rgba(201,166,104,0.05)' }}
          >
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
