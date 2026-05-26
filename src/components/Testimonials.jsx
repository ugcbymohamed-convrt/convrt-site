import { useRef, useEffect, useState } from 'react'

/* ─────────────────────────────────────────────
   SECTION — SOCIAL PROOF / TESTIMONIALS
   Place after CaseStudies, before Services in App.jsx
───────────────────────────────────────────── */

const REVIEWS = [
  {
    id: 'elyon',
    logo: '/clients/elyon.png',
    brand: 'Elyon Dubai',
    category: 'Luxury Fragrance · E-commerce',
    country: 'UAE',
    flag: '🇦🇪',
    stars: 5,
    badge: 'Repeat Client',
    text: "Mohamed understood the concept really well and actually exceeded my expectations with the quality. The videos are high quality, delivered on time, and the communication throughout was excellent. I've already ordered again, looking forward to continuing this partnership.",
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.12)',
    logoFilter: 'brightness(0) invert(1)',
    logoOpacity: 0.85,
    logoRounded: false,
  },
  {
    id: 'adscale',
    logo: '/clients/adscale.png',
    brand: 'Adscale',
    category: 'SaaS · Paid Social',
    country: 'Israel',
    flag: '🇮🇱',
    stars: 5,
    badge: 'Repeat Client',
    text: "Working with Mohamad was an absolute pleasure. He's professional, creative, and truly understands what makes content perform. The UGC videos he created were exactly what we needed to scale our ads. We've already come back for a second order and plan to continue working together long-term.",
    accentColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.12)',
    logoFilter: 'brightness(0) invert(1)',
    logoOpacity: 0.85,
    logoRounded: false,
  },
  {
    id: 'talk360',
    logo: '/clients/talk360.jpg',
    brand: 'Talk360',
    category: 'Mobile App · International',
    country: 'Netherlands',
    flag: '🇳🇱',
    stars: 5,
    badge: 'Repeat Client',
    text: "The videos are amazing again. Every time we work together the quality just keeps getting better. Fast delivery, great communication, and the content performs exactly the way we need it to. This is our third order and it won't be the last.",
    accentColor: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.12)',
    logoFilter: 'none',
    logoOpacity: 1,
    logoRounded: true,
  },
]

/* ── Staggered fade-up helper ── */
function FadeUp({ children, inView, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms,
                     transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function StarRow({ count = 5, color = '#d5ff40' }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" className="h-4 w-4" fill={color}>
          <path d="M8 1.25l1.74 3.53 3.89.57-2.82 2.74.67 3.87L8 9.99l-3.48 1.97.67-3.87L2.37 5.35l3.89-.57L8 1.25z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review, inView, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <FadeUp inView={inView} delay={delay} className="h-full">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative h-full flex flex-col rounded-3xl border border-hairline overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          transition: 'border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease',
          borderColor: hovered ? `${review.accentColor}55` : 'rgba(255,255,255,0.07)',
          boxShadow: hovered
            ? `0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px ${review.accentColor}33 inset, 0 -80px 120px -40px ${review.glowColor} inset`
            : '0 20px 60px -20px rgba(0,0,0,0.4)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        {/* Ambient glow blob — top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-[260px] w-[260px] rounded-full blur-[80px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${review.glowColor} 0%, transparent 70%)`,
            opacity: hovered ? 1 : 0.4,
          }}
        />

        <div className="relative z-10 flex flex-col gap-6 p-7 flex-1">

          {/* ── Top row: logo + badge ── */}
          <div className="flex items-start justify-between gap-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={review.logo}
                alt={`${review.brand} logo`}
                className="h-10 w-auto object-contain"
                style={{
                  filter: review.logoFilter,
                  opacity: review.logoOpacity,
                  borderRadius: review.logoRounded ? '12px' : '0',
                  maxWidth: review.logoRounded ? '40px' : '120px',
                }}
              />
            </div>

            {/* Repeat Client badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide flex-shrink-0"
              style={{
                background: 'rgba(213,255,64,0.1)',
                border: '1px solid rgba(213,255,64,0.25)',
                color: '#d5ff40',
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: '#d5ff40' }}
              />
              {review.badge}
            </div>
          </div>

          {/* ── Stars ── */}
          <StarRow count={review.stars} color="#d5ff40" />

          {/* ── Review text ── */}
          <blockquote className="flex-1 text-[15px] leading-[1.78] text-ink-subtle">
            {review.text}
          </blockquote>

          {/* ── Bottom row: brand info ── */}
          <div className="pt-2 border-t border-hairline">
            <p className="text-sm font-semibold text-ink">{review.brand}</p>
            <p className="text-[12px] text-ink-muted mt-0.5">{review.category}</p>
          </div>

        </div>
      </div>
    </FadeUp>
  )
}

export default function Testimonials() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.1 },
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative overflow-hidden py-16 md:py-24"
    >
      {/* ── Ambient background glows ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-lime/[0.04] blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-lime/[0.03] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">

        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14 gap-5">
          <FadeUp inView={inView} delay={0}>
            <div className="inline-flex items-center gap-2.5">
              <span className="h-px w-8 bg-lime" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                Client Reviews
              </span>
              <span className="h-px w-8 bg-lime" />
            </div>
          </FadeUp>

          <FadeUp inView={inView} delay={100}>
            <h2
              className="font-display font-bold text-ink tracking-display leading-[1.06] max-w-2xl"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
            >
              Trusted by brands that{' '}
              <span className="text-lime">came back</span>
              {' '}for more.
            </h2>
          </FadeUp>

          <FadeUp inView={inView} delay={200}>
            <p className="text-ink-muted text-base leading-relaxed max-w-xl">
              Most of our clients come back for additional creatives, testing, and long-term collaboration.
            </p>
          </FadeUp>
        </div>

        {/* ── Review cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {REVIEWS.map((review, i) => (
            <ReviewCard
              key={review.id}
              review={review}
              inView={inView}
              delay={320 + i * 100}
            />
          ))}
        </div>


      </div>
    </section>
  )
}
