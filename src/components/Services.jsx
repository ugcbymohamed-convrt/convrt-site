import { useEffect, useRef, useState } from 'react'
import { BOOKING_URL } from '../config.js'

/* ─────────────────────────────────────────────
   SECTION 4 — WHAT WE OFFER
   Asymmetric bento · 4 services
   Default state = 70% intensity · Hover = 120%
───────────────────────────────────────────── */

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

/* ─────────────────────────────────────────────
   Each service carries:
     glowA / glowB  — dual-source radial lighting (rest + hover)
     border / glow  — box-shadow values (rest + hover)
     number         — rest + hover opacity for the bg watermark
     tag / pills    — color at rest + hover
───────────────────────────────────────────── */
const SERVICES = [
  {
    id: 'ugc',
    number: '01',
    tag: 'CREATOR-LED',
    title: 'UGC Ads',
    description: 'Creator-led ads built for Meta, TikTok, and paid social performance.',
    pills: ['Meta', 'TikTok', 'YouTube'],
    icon: IconUGC,
    colSpan: 'lg:col-span-7',
    accent: '#8b5cf6',

    /* Dual radial light sources */
    glowA:      { pos: '8% 12%',   r: '480px', rest: 'rgba(139,92,246,0.22)', hover: 'rgba(139,92,246,0.42)' },
    glowB:      { pos: '90% 88%',  r: '320px', rest: 'rgba(139,92,246,0.10)', hover: 'rgba(139,92,246,0.22)' },

    /* Box-shadow (border ring + outer glow) */
    shadowRest:  '0 0 0 1px rgba(139,92,246,0.32), 0 0 40px -10px rgba(139,92,246,0.28), 0 8px 40px -8px rgba(0,0,0,0.7)',
    shadowHover: '0 0 0 1px rgba(139,92,246,0.65), 0 0 70px -6px rgba(139,92,246,0.55), 0 40px 80px -20px rgba(0,0,0,0.95)',

    /* Icon container */
    iconBgRest:  'rgba(139,92,246,0.20)',
    iconBgHover: 'rgba(139,92,246,0.36)',
    iconBorderRest:  'rgba(139,92,246,0.35)',
    iconBorderHover: 'rgba(139,92,246,0.70)',

    /* Halo behind icon */
    haloRest:  0.22,
    haloHover: 0.40,

    /* Number watermark */
    numRest:  0.07,
    numHover: 0.14,

    /* Tag */
    tagRest:  'rgba(167,139,250,0.80)',
    tagHover: '#a78bfa',

    /* Pills */
    pillBgRest:     'rgba(139,92,246,0.14)',
    pillBgHover:    'rgba(139,92,246,0.28)',
    pillBorderRest:  'rgba(139,92,246,0.28)',
    pillBorderHover: 'rgba(139,92,246,0.60)',
    pillTextRest:   'rgba(167,139,250,0.85)',
    pillTextHover:  '#c4b5fd',

    /* Bottom rule */
    ruleRest:  'linear-gradient(to right, rgba(139,92,246,0.45), rgba(139,92,246,0.10))',
    ruleHover: 'linear-gradient(to right, rgba(139,92,246,0.80), rgba(139,92,246,0.20))',
  },
  {
    id: 'spokesperson',
    number: '02',
    tag: 'TRUST-DRIVEN',
    title: 'Spokesperson Ads',
    description: 'Trust-driven talking creatives that simplify your offer and drive action.',
    pills: ['Authority', 'Retention', 'Action'],
    icon: IconSpokesperson,
    colSpan: 'lg:col-span-5',
    accent: '#ff6a4d',

    glowA:      { pos: '88% 8%',   r: '420px', rest: 'rgba(255,106,77,0.20)', hover: 'rgba(255,106,77,0.38)' },
    glowB:      { pos: '10% 85%',  r: '300px', rest: 'rgba(255,106,77,0.09)', hover: 'rgba(255,106,77,0.20)' },

    shadowRest:  '0 0 0 1px rgba(255,106,77,0.30), 0 0 38px -10px rgba(255,106,77,0.26), 0 8px 40px -8px rgba(0,0,0,0.7)',
    shadowHover: '0 0 0 1px rgba(255,106,77,0.60), 0 0 65px -6px rgba(255,106,77,0.50), 0 40px 80px -20px rgba(0,0,0,0.95)',

    iconBgRest:  'rgba(255,106,77,0.18)',
    iconBgHover: 'rgba(255,106,77,0.32)',
    iconBorderRest:  'rgba(255,106,77,0.32)',
    iconBorderHover: 'rgba(255,106,77,0.65)',

    haloRest:  0.20,
    haloHover: 0.38,

    numRest:  0.07,
    numHover: 0.14,

    tagRest:  'rgba(255,140,112,0.82)',
    tagHover: '#ff8c70',

    pillBgRest:     'rgba(255,106,77,0.13)',
    pillBgHover:    'rgba(255,106,77,0.26)',
    pillBorderRest:  'rgba(255,106,77,0.26)',
    pillBorderHover: 'rgba(255,106,77,0.55)',
    pillTextRest:   'rgba(255,140,112,0.85)',
    pillTextHover:  '#ffb59c',

    ruleRest:  'linear-gradient(to right, rgba(255,106,77,0.42), rgba(255,106,77,0.10))',
    ruleHover: 'linear-gradient(to right, rgba(255,106,77,0.75), rgba(255,106,77,0.18))',
  },
  {
    id: 'social',
    number: '03',
    tag: 'ALWAYS-ON',
    title: 'Social Media Content & Management',
    description: 'Organic content systems designed to build consistency, trust, and reach.',
    pills: ['Instagram', 'TikTok', 'Facebook'],
    icon: IconSocial,
    colSpan: 'lg:col-span-5',
    accent: '#d5ff40',

    glowA:      { pos: '12% 85%',  r: '440px', rest: 'rgba(213,255,64,0.16)', hover: 'rgba(213,255,64,0.32)' },
    glowB:      { pos: '88% 12%',  r: '280px', rest: 'rgba(213,255,64,0.07)', hover: 'rgba(213,255,64,0.16)' },

    shadowRest:  '0 0 0 1px rgba(213,255,64,0.26), 0 0 36px -10px rgba(213,255,64,0.22), 0 8px 40px -8px rgba(0,0,0,0.7)',
    shadowHover: '0 0 0 1px rgba(213,255,64,0.55), 0 0 60px -6px rgba(213,255,64,0.45), 0 40px 80px -20px rgba(0,0,0,0.95)',

    iconBgRest:  'rgba(213,255,64,0.14)',
    iconBgHover: 'rgba(213,255,64,0.28)',
    iconBorderRest:  'rgba(213,255,64,0.28)',
    iconBorderHover: 'rgba(213,255,64,0.60)',

    haloRest:  0.18,
    haloHover: 0.35,

    numRest:  0.07,
    numHover: 0.13,

    tagRest:  'rgba(213,255,64,0.78)',
    tagHover: '#d5ff40',

    pillBgRest:     'rgba(213,255,64,0.11)',
    pillBgHover:    'rgba(213,255,64,0.24)',
    pillBorderRest:  'rgba(213,255,64,0.24)',
    pillBorderHover: 'rgba(213,255,64,0.55)',
    pillTextRest:   'rgba(213,255,64,0.82)',
    pillTextHover:  '#e8ff7a',

    ruleRest:  'linear-gradient(to right, rgba(213,255,64,0.38), rgba(213,255,64,0.08))',
    ruleHover: 'linear-gradient(to right, rgba(213,255,64,0.70), rgba(213,255,64,0.15))',
  },
  {
    id: 'strategy',
    number: '04',
    tag: 'PERFORMANCE-FIRST',
    title: 'Creative Strategy for Organic & Paid',
    description: 'Hooks, angles, scripts, and testing frameworks built around performance psychology.',
    pills: ['Hooks', 'Scripts', 'A/B Testing'],
    icon: IconStrategy,
    colSpan: 'lg:col-span-7',
    accent: '#ec4899',

    glowA:      { pos: '88% 85%',  r: '500px', rest: 'rgba(236,72,153,0.20)', hover: 'rgba(236,72,153,0.38)' },
    glowB:      { pos: '8% 10%',   r: '300px', rest: 'rgba(236,72,153,0.08)', hover: 'rgba(236,72,153,0.18)' },

    shadowRest:  '0 0 0 1px rgba(236,72,153,0.30), 0 0 40px -10px rgba(236,72,153,0.26), 0 8px 40px -8px rgba(0,0,0,0.7)',
    shadowHover: '0 0 0 1px rgba(236,72,153,0.62), 0 0 68px -6px rgba(236,72,153,0.52), 0 40px 80px -20px rgba(0,0,0,0.95)',

    iconBgRest:  'rgba(236,72,153,0.18)',
    iconBgHover: 'rgba(236,72,153,0.32)',
    iconBorderRest:  'rgba(236,72,153,0.32)',
    iconBorderHover: 'rgba(236,72,153,0.65)',

    haloRest:  0.20,
    haloHover: 0.38,

    numRest:  0.07,
    numHover: 0.14,

    tagRest:  'rgba(244,114,182,0.82)',
    tagHover: '#f472b6',

    pillBgRest:     'rgba(236,72,153,0.13)',
    pillBgHover:    'rgba(236,72,153,0.26)',
    pillBorderRest:  'rgba(236,72,153,0.26)',
    pillBorderHover: 'rgba(236,72,153,0.55)',
    pillTextRest:   'rgba(244,114,182,0.85)',
    pillTextHover:  '#f9a8d4',

    ruleRest:  'linear-gradient(to right, rgba(236,72,153,0.42), rgba(236,72,153,0.10))',
    ruleHover: 'linear-gradient(to right, rgba(236,72,153,0.78), rgba(236,72,153,0.18))',
  },
]

/* ── IntersectionObserver ── */
function useInView(threshold = 0.1) {
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

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */
export default function Services() {
  const [wrapRef, sectionVisible] = useInView(0.08)

  return (
    <section id="services" className="relative overflow-hidden py-16 md:py-20">

      {/* ── Section-level ambient depth ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -right-48 h-[700px] w-[700px] rounded-full bg-violet/[0.05] blur-[150px]" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-coral/[0.045] blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[900px] rounded-full bg-lime/[0.025] blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: NOISE_BG, backgroundSize: '180px 180px' }} />
      </div>

      <div ref={wrapRef} className="relative mx-auto max-w-7xl px-5 md:px-8">

        {/* ── Header ── */}
        <div
          className="mb-14"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'none' : 'translateY(28px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">What We Offer</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <h2 className="font-display font-bold text-ink tracking-display leading-[1.02] text-4xl md:text-5xl lg:text-[62px]">
              Built for modern<br />
              <span className="text-lime">paid social.</span>
            </h2>
            <p className="text-[15px] text-ink-muted leading-relaxed max-w-sm lg:text-right pb-1">
              We create content engineered for attention,<br className="hidden lg:block" />
              retention, and conversion — from strategy to production.
            </p>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} sectionVisible={sectionVisible} />
          ))}
        </div>

        {/* ── CTA strip ── */}
        <div
          className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-3xl border border-hairline bg-surface-1/40 backdrop-blur-md px-8 py-7"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.7s 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.7s 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div>
            <p className="font-display font-semibold text-ink text-xl leading-tight">Not sure which service fits?</p>
            <p className="mt-1.5 text-sm text-ink-muted">We'll tell you exactly what you need in a free 20-minute call.</p>
          </div>
          <a href={BOOKING_URL} className="cta-gradient shrink-0 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas">
            Book a Creative Call
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
              <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   ServiceCard
   Layer stack:
   1. Dual-source radial glow (always visible, intensifies on hover)
   2. Noise grain
   3. Large background number watermark
   4. Shine sweep (fires once on hover entry)
   5. Content z-10
   No arrow — bottom is a glowing gradient rule only
───────────────────────────────────────────── */
function ServiceCard({ service, index, sectionVisible }) {
  const [hovered, setHovered] = useState(false)
  const [shining, setShining] = useState(false)
  const IconComponent = service.icon
  const s = service   /* shorthand */

  function onEnter() {
    setHovered(true)
    setShining(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setShining(true)))
  }
  function onLeave() { setHovered(false); setShining(false) }

  const t = (ms, prop) => `${prop} 0.5s ${ms}ms cubic-bezier(0.22,1,0.36,1)`

  return (
    <article
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`${s.colSpan} group relative overflow-hidden rounded-[28px] cursor-default min-h-[280px] flex flex-col`}
      style={{
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
        transition: `opacity 0.6s ${80 + index * 110}ms cubic-bezier(0.22,1,0.36,1),
                     transform 0.6s ${80 + index * 110}ms cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      <div
        className="relative flex flex-col flex-1 p-8 md:p-9 rounded-[28px] overflow-hidden"
        style={{
          background: '#0c0c0f',
          boxShadow: hovered ? s.shadowHover : s.shadowRest,
          transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
          transition: 'box-shadow 0.5s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* ── Layer 1: Dual radial glow — ALWAYS VISIBLE ── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ transition: 'background 0.6s ease' }}>
          {/* Primary source */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(${s.glowA.r} circle at ${s.glowA.pos}, ${hovered ? s.glowA.hover : s.glowA.rest}, transparent 70%)`,
              transition: 'background 0.6s ease',
            }}
          />
          {/* Secondary source — opposite corner for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(${s.glowB.r} circle at ${s.glowB.pos}, ${hovered ? s.glowB.hover : s.glowB.rest}, transparent 65%)`,
              transition: 'background 0.6s ease',
            }}
          />
        </div>

        {/* ── Layer 2: Noise grain ── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.032]" style={{ backgroundImage: NOISE_BG, backgroundSize: '150px 150px' }} />

        {/* ── Layer 3: Large background number ── */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -bottom-6 -right-2 font-display font-black leading-none"
          style={{
            fontSize: 'clamp(90px, 13vw, 155px)',
            color: s.accent,
            opacity: hovered ? s.numHover : s.numRest,
            transition: 'opacity 0.5s ease',
            lineHeight: 1,
          }}
        >
          {s.number}
        </span>

        {/* ── Layer 4: Shine sweep ── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          {shining && (
            <div
              className="service-card-shine absolute top-0 bottom-0 w-[55%]"
              style={{ background: `linear-gradient(105deg, transparent, ${s.accent}20, transparent)` }}
            />
          )}
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col flex-1 gap-0">

          {/* Icon + tag row */}
          <div className="flex items-start justify-between mb-7">
            {/* Icon with ambient halo */}
            <div className="relative">
              <div
                aria-hidden="true"
                className={hovered ? 'icon-breathe' : ''}
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  borderRadius: '50%',
                  background: s.accent,
                  opacity: hovered ? undefined : s.haloRest,
                  filter: 'blur(16px)',
                  transition: 'opacity 0.4s ease',
                }}
              />
              <div
                className="relative h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: hovered ? s.iconBgHover : s.iconBgRest,
                  border: `1px solid ${hovered ? s.iconBorderHover : s.iconBorderRest}`,
                  transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                  transition: 'background 0.4s, border 0.4s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <IconComponent
                  color={hovered ? s.accent : s.tagRest}
                  size={26}
                />
              </div>
            </div>

            {/* Tag */}
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] mt-1.5"
              style={{
                color: hovered ? s.tagHover : s.tagRest,
                transition: 'color 0.4s ease',
              }}
            >
              {s.tag}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-display font-bold tracking-display leading-[1.06]"
            style={{
              fontSize: 'clamp(1.45rem, 2.4vw, 1.85rem)',
              color: hovered ? '#ffffff' : '#e4e4e7',
              transition: 'color 0.3s ease',
            }}
          >
            {s.title}
          </h3>

          {/* Description */}
          <p
            className="mt-3 text-[13.5px] leading-relaxed"
            style={{
              color: hovered ? '#a1a1aa' : '#71717a',
              transition: 'color 0.3s ease',
              maxWidth: '34ch',
            }}
          >
            {s.description}
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {s.pills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  background: hovered ? s.pillBgHover : s.pillBgRest,
                  border: `1px solid ${hovered ? s.pillBorderHover : s.pillBorderRest}`,
                  color: hovered ? s.pillTextHover : s.pillTextRest,
                  transition: 'all 0.4s ease',
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-[24px]" />

          {/* Bottom rule only — no arrow */}
          <div
            className="h-px w-full mt-5 rounded-full"
            style={{
              background: hovered ? s.ruleHover : s.ruleRest,
              transition: 'background 0.5s ease',
            }}
          />
        </div>
      </div>
    </article>
  )
}

/* ─────────────────────────────────────────────
   Icons — 26 × 26 viewBox, color + size props
───────────────────────────────────────────── */
function IconUGC({ color = '#71717a', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect x="6" y="2" width="14" height="22" rx="3" stroke={color} strokeWidth="1.6" />
      <rect x="8.5" y="5" width="9" height="13" rx="1.2" stroke={color} strokeWidth="1.3" />
      <path d="M11.5 9.5l4 2-4 2V9.5z" fill={color} />
      <path d="M11.5 20h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 4l.5 1.3 1.3.5-1.3.5L21 7.6l-.5-1.3-1.3-.5 1.3-.5L21 4z" fill={color} />
    </svg>
  )
}

function IconSpokesperson({ color = '#71717a', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <circle cx="10" cy="8" r="4" stroke={color} strokeWidth="1.6" />
      <path d="M3 24c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 9.5a3.5 3.5 0 010 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20.5 7a7 7 0 010 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconSocial({ color = '#71717a', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2.5" stroke={color} strokeWidth="1.5" />
      <rect x="14" y="2" width="10" height="10" rx="2.5" stroke={color} strokeWidth="1.5" />
      <rect x="2" y="14" width="10" height="10" rx="2.5" stroke={color} strokeWidth="1.5" />
      <rect x="14" y="14" width="10" height="10" rx="2.5" stroke={color} strokeWidth="1.5" />
      <path d="M16.5 19h5M16.5 21.5h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="22.5" cy="4" r="2" fill={color} />
    </svg>
  )
}

function IconStrategy({ color = '#71717a', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <circle cx="12" cy="14" r="10" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="14" r="5.5" stroke={color} strokeWidth="1.4" />
      <circle cx="12" cy="14" r="1.8" fill={color} />
      <path d="M18 3l-2.5 5H19L15.5 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
