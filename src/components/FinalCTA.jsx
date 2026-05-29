import { useRef, useEffect, useState } from 'react'
import { BOOKING_URL, CONTACT_EMAIL } from '../config.js'

/* ─────────────────────────────────────────────
   FINAL CTA — Cinematic close
   Last impression before footer
───────────────────────────────────────────── */

const PROOF_PILLS = [
  { value: '750+', label: 'Creatives produced' },
  { value: '30M+', label: 'Views generated' },
  { value: '50%+', label: 'of clients return for more' },
]

function FadeUp({ children, inView, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms,
                     transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function FinalCTA() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.15 },
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-36"
    >
      {/* ── Layered lime glow — more intense than other sections ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.08) 0%, transparent 60%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.10) 0%, transparent 55%)' }}
      />

      {/* ── Very subtle noise texture overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />


      <div className="relative mx-auto max-w-4xl px-5 md:px-8 text-center">

        {/* ── Eyebrow ── */}
        <FadeUp inView={inView} delay={0}>
          <div className="inline-flex items-center gap-2.5 mb-8">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">
              Let's create together
            </span>
            <span className="h-px w-8 bg-lime" />
          </div>
        </FadeUp>

        {/* ── Main headline ── */}
        <FadeUp inView={inView} delay={100}>
          <h2
            className="font-display font-bold tracking-display leading-[1.04] mb-7"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            <span className="text-ink">Good brands deserve </span>
            <br className="hidden sm:block" />
            <span className="text-lime">better creatives.</span>
          </h2>
        </FadeUp>

        {/* ── Supporting text ── */}
        <FadeUp inView={inView} delay={220}>
          <p
            className="text-ink-muted leading-relaxed mx-auto mb-12"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', maxWidth: '36rem' }}
          >
            Whether you need paid social creatives, UGC, spokesperson ads,
            or a long-term creative partner, we build content designed for
            modern attention.
          </p>
        </FadeUp>

        {/* ── CTA buttons ── */}
        <FadeUp inView={inView} delay={340}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">

            {/* Primary — lime */}
            <a
              href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              className="group relative inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-semibold text-canvas overflow-hidden"
              style={{
                background: '#d5ff40',
                boxShadow: btnHovered
                  ? '0 0 0 1px #d5ff40, 0 8px 40px -8px rgba(213,255,64,0.6), 0 20px 60px -20px rgba(213,255,64,0.3)'
                  : '0 0 0 1px rgba(213,255,64,0.4), 0 4px 24px -4px rgba(213,255,64,0.3)',
                transform: btnHovered ? 'scale(1.03) translateY(-1px)' : 'scale(1) translateY(0)',
                transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Shimmer sweep on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
                  transform: btnHovered ? 'translateX(100%)' : 'translateX(-100%)',
                  transition: 'transform 0.5s ease',
                }}
              />
              <span className="relative">Book a Discovery Call</span>
              <svg viewBox="0 0 12 12" className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            {/* Secondary — ghost */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group inline-flex items-center gap-2 rounded-full border border-hairline px-7 py-4 text-[15px] font-medium text-ink-subtle hover:text-ink hover:border-white/20 transition-all duration-300"
            >
              Send us an email
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity duration-300" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </FadeUp>

        {/* ── Social proof pills ── */}
        <FadeUp inView={inView} delay={480}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PROOF_PILLS.map((pill, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-sm font-bold text-lime tabular-nums">{pill.value}</span>
                <span className="text-xs text-ink-muted">{pill.label}</span>
              </div>
            ))}
          </div>
        </FadeUp>

      </div>
    </section>
  )
}
