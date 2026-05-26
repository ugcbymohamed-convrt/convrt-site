import { useRef, useEffect, useState } from 'react'
import { BOOKING_URL } from '../config.js'

/* ─────────────────────────────────────────────
   SECTION — MEET THE FOUNDER
   Photo: /public/founder.jpg
   Place between HowItWorks and FinalCTA in App.jsx
───────────────────────────────────────────── */

/* Story broken into cinematic blocks with pacing delays */
const STORY_BLOCKS = [
  {
    text: "Back in 2024, AI was already replacing most of my freelance work. Copywriting, localization, skills I'd spent years building were suddenly worth less than a $20/month subscription. At the same time, my baby girl was about to be born. I had no backup plan and no time to waste.",
    delay: 320,
  },
  {
    text: "I bought a ring light, a tripod, and started filming with products I already had at home. I built a small portfolio, started pitching brands, and had no idea it would completely change my life. I still remember negotiating my first retainer while holding my one-day-old daughter in my arms.",
    delay: 480,
  },
  {
    text: "In my faith, we believe every newborn brings blessings to the parents. I didn't just believe it, I genuinely lived it. The first client came through word of mouth. Three more reached out that same week. What started as survival became a real process.",
    delay: 640,
  },
  {
    text: "Today CONVRT works with returning clients and long-term retainers across e-commerce, SaaS, and retail. 750+ creatives produced, millions of views generated, and honestly, I feel like I'm only getting started.",
    delay: 800,
  },
]

/* ── Staggered fade-up helper ── */
function FadeUp({ children, inView, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms,
                     transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function Founder() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.12 },
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="founder"
      ref={sectionRef}
      className="relative overflow-hidden py-16 md:py-24"
    >
      {/* ── Section ambient glow — lime left, subtle ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-60 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-lime/[0.055] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-lime/[0.03] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* ══ LEFT — cinematic founder photo ══ */}
          <div className="lg:col-span-5 xl:col-span-5">
            {/*
              Three-layer reveal triggered by the section IntersectionObserver:
                1. Outer wrapper  — translateY(36px) scale(1.04) → rest  (lifts + zooms out)
                2. Glow halo      — opacity 0 → 0.6  (blooms in with 500 ms delay)
                3. Photo frame    — clip-path inset shrinks from 8% top → 0  (curtain wipe)
            */}
            <div
              className="relative"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0) scale(1)' : 'translateY(36px) scale(1.04)',
                transition: inView
                  ? 'opacity 0.9s 0.05s cubic-bezier(0.22,1,0.36,1), transform 1.2s 0.05s cubic-bezier(0.25,1,0.5,1)'
                  : 'none',
              }}
            >

              {/* Outer glow halo — blooms in after the photo appears */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[36px] pointer-events-none blur-2xl"
                style={{
                  background: 'radial-gradient(ellipse at 40% 60%, rgba(213,255,64,0.14) 0%, transparent 70%)',
                  opacity: inView ? 0.60 : 0,
                  transition: 'opacity 1.6s 0.5s ease',
                }}
              />

              {/* Photo frame — curtain-wipe via clip-path */}
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: '28px',
                  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06) inset',
                  clipPath: inView ? 'inset(0% 0% 0% 0% round 28px)' : 'inset(8% 0% 2% 0% round 28px)',
                  transition: inView ? 'clip-path 1.1s 0.1s cubic-bezier(0.22,1,0.36,1)' : 'none',
                }}
              >
                  <img
                    src="/founder.jpg?v=3"
                    alt="Mohamed — Founder of CONVRT"
                    className="block w-full"
                    style={{
                      aspectRatio: '3 / 4',
                      objectFit: 'cover',
                      objectPosition: 'center 12%',
                      display: 'block',
                    }}
                    draggable="false"
                  />

                  {/* Cinematic dark gradient — bottom fade to canvas */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(10,10,11,0.72) 0%, rgba(10,10,11,0.18) 45%, transparent 70%)',
                    }}
                  />

                  {/* Subtle left-edge shadow for depth */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to right, rgba(10,10,11,0.28) 0%, transparent 30%)',
                    }}
                  />

                  {/* Name plate — bottom of photo */}
                  <div className="absolute bottom-0 inset-x-0 z-10 p-6">
                    <p className="text-sm font-semibold text-white/90 tracking-wide">Mohamed</p>
                    <p className="text-xs text-white/50 mt-0.5 tracking-wide">Founder, CONVRT</p>
                  </div>

                  {/* Glass highlight ring */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{ borderRadius: '28px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
                  />
                </div>

            </div>
          </div>

          {/* ══ RIGHT — editorial story ══ */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-8 lg:pl-4 items-center lg:items-start text-center lg:text-left">

            {/* Eyebrow label */}
            <FadeUp inView={inView} delay={120}>
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                  Meet the Founder
                </span>
              </div>
            </FadeUp>

            {/* Headline */}
            <FadeUp inView={inView} delay={200}>
              <h2
                className="font-display font-bold text-ink tracking-display leading-[1.06]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
              >
                AI replaced my freelance career.{' '}
                <span className="text-lime">Right before my daughter was born.</span>
              </h2>
            </FadeUp>

            {/* Story blocks */}
            <div className="flex flex-col gap-5">
              {STORY_BLOCKS.map((block, i) => (
                <FadeUp key={i} inView={inView} delay={block.delay}>
                  <p className="leading-[1.8] text-[15px] text-ink-muted">
                    {block.text}
                  </p>
                </FadeUp>
              ))}
            </div>

            {/* Founder attribution line */}
            <FadeUp inView={inView} delay={1020}>
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="h-px flex-1 bg-hairline max-w-[48px]" />
                <span className="text-[13px] text-ink-muted font-medium tracking-wide">
                  Mohamed — Founder of CONVRT
                </span>
              </div>
            </FadeUp>

            {/* CTA */}
            <FadeUp inView={inView} delay={1100}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2">
                <a
                  href={BOOKING_URL}
                  className="cta-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
                >
                  Book a creative call
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <span className="text-[13px] text-ink-muted">
                  or reach us at{' '}
                  <a href="mailto:hello@convrt.studio" className="text-ink hover:text-lime transition-colors underline underline-offset-2 decoration-hairline">
                    hello@convrt.studio
                  </a>
                </span>
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ── Floating stat badge — mirrors Hero's FloatingStat ── */
function StatBadge({ value, label, className = '', accent = false }) {
  return (
    <div
      className={`z-20 rounded-2xl border border-hairline bg-surface-1/85 px-4 py-3 backdrop-blur-md shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] ${className}`}
    >
      <p
        className="text-xl font-bold tracking-tight leading-none"
        style={{ color: accent ? '#d5ff40' : '#fafafa' }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-ink-muted leading-tight">{label}</p>
    </div>
  )
}
