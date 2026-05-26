import { useState, useRef, useEffect } from 'react'
import { BOOKING_URL } from '../config.js'

/* ─────────────────────────────────────────────
   SECTION 3 — CASE STUDIES / CREATIVE SHOWCASE
   Videos hosted on YouTube (Shorts)
───────────────────────────────────────────── */
const CASES = [
  {
    id: 'elyon',
    tab: 'E-commerce',
    logo: { src: '/clients/elyon.png', alt: 'Elyon Dubai', w: 600, h: 226 },
    title: '100+ creatives tested.\nMultiple winners found.',
    body: "We have created over 100 pieces of content with Elyon Dubai. Since their launch back in 2025, we have tested multiple concepts & variations. So far, we've already found many formats that are killing it for Elyon. When the product is of quality, it's so much easier to make genuine content that resonates with people.",
    videos: ['FN8_o7jIrDM', 'tcp0SErAHOk', 'SyIu0CM5GZ8'],
    accentColor: '#f59e0b',
  },
  {
    id: 'adscale',
    tab: 'SaaS',
    logo: { src: '/clients/adscale.png', alt: 'Adscale', w: 531, h: 149 },
    title: "Long-form creatives\nthat can't be skipped.",
    body: 'If you think long creatives are not a thing, check these out. These are not just creatives, they build trust, they scream confidence, and they show "we know what we\'re doing". Aesthetic transitions, catchy visuals and a delivery so engaging that it makes it almost impossible to skip.',
    videos: ['SuYTkK7jju4', '552nJGX4AyY', 'qNULZMcy_1A'],
    accentColor: '#3b82f6',
  },
  {
    id: 'graspo',
    tab: 'Printing',
    logo: { src: '/clients/graspo.png', alt: 'Graspo', w: 619, h: 279, height: 62 },
    title: '6 million views.\nIn less than 2 months.',
    body: "We have generated over 6 million views for Graspo in less than 2 months. And yes, it took 6 months of content testing beforehand to figure out what really clicks and what doesn't. Today, Graspo has over 10k followers on Facebook and almost 4k on Instagram.",
    videos: ['Qj6c6-O7hOk', 'IoXPeuH7KbI', 'iwqk3-lDBEk'],
    accentColor: '#10b981',
  },
]

/* ─────────────────────────────────────────────
   Main section
───────────────────────────────────────────── */
export default function CaseStudies() {
  const [activeId, setActiveId] = useState('elyon')
  const active = CASES.find((c) => c.id === activeId)

  return (
    <section id="showcase" className="relative overflow-hidden py-14 md:py-20">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full opacity-[0.04] blur-[100px] bg-lime"
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* ── Section heading — centered, prominent ── */}
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
              Case Studies
            </span>
          </div>

          <h2 className="font-display font-bold text-ink tracking-display leading-[1.02] text-5xl md:text-6xl lg:text-[72px]">
            Work that speaks
            <br />
            <span className="text-lime">for itself.</span>
          </h2>

          <p className="mt-5 text-base text-ink-muted max-w-md mx-auto leading-relaxed">
            Real brands, real budgets — three case studies from clients who trusted us with their creative.
          </p>
        </div>

        {/* ── Tab strip — centered ── */}
        <div
          className="flex justify-center gap-2 overflow-x-auto pb-1 mb-10 md:mb-14"
          style={{ scrollbarWidth: 'none' }}
        >
          {CASES.map((c) => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={[
                  'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-lime text-canvas shadow-[0_0_22px_rgba(213,255,64,0.4)] scale-[1.04]'
                    : 'bg-surface-1 text-ink-muted border border-hairline hover:border-hairline-strong hover:text-ink hover:scale-[1.02]',
                ].join(' ')}
              >
                {c.tab}
              </button>
            )
          })}
        </div>

        {/* ── Main panel — re-keyed on tab switch so animations re-fire ── */}
        <div
          key={activeId}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          {/* LEFT — staggered text block */}
          <div className="lg:col-span-5 flex flex-col gap-7">

            {/* Brand logo */}
            <div className="cs-fade-up" style={{ animationDelay: '0ms' }}>
              <img
                src={active.logo.src}
                alt={active.logo.alt}
                style={{
                  height: `${active.logo.height ?? 44}px`,
                  width: 'auto',
                  maxWidth: '200px',
                  filter: 'brightness(0) invert(1)',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
                draggable="false"
              />
            </div>

            {/* Hairline divider */}
            <div className="cs-fade-up h-px bg-hairline w-12" style={{ animationDelay: '30ms' }} />

            {/* Title */}
            <h3
              className="cs-fade-up font-display font-bold text-ink tracking-display leading-[1.08] text-[clamp(1.85rem,3vw,2.6rem)] whitespace-pre-line"
              style={{ animationDelay: '60ms' }}
            >
              {active.title}
            </h3>

            {/* Body */}
            <p
              className="cs-fade-up text-[15px] text-ink-muted leading-[1.75]"
              style={{ animationDelay: '120ms' }}
            >
              {active.body}
            </p>

            {/* CTA */}
            <a
              href={BOOKING_URL}
              className="cs-fade-up cta-gradient mt-1 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
              style={{ animationDelay: '190ms' }}
            >
              Get creatives like these
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* RIGHT — 3D phone carousel */}
          <div className="lg:col-span-7">
            <PhoneCarousel
              videos={active.videos}
              brandId={activeId}
              accentColor={active.accentColor}
            />
          </div>
        </div>

        {/* ── Nav dots ── */}
        <div className="flex justify-center gap-2.5 mt-12">
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              aria-label={`View ${c.tab}`}
              className={[
                'h-1.5 rounded-full transition-all duration-500',
                c.id === activeId ? 'w-6 bg-lime' : 'w-1.5 bg-surface-3 hover:bg-ink-subtle',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PhoneCarousel
   — order = [leftVideoIdx, centerVideoIdx, rightVideoIdx]
   — clicking a side phone rotates it to center
───────────────────────────────────────────── */
function PhoneCarousel({ videos, brandId, accentColor }) {
  const [order, setOrder] = useState([1, 0, 2])
  const [hoveredPos, setHoveredPos] = useState(null)
  const [phoneOffset, setPhoneOffset] = useState(158)

  /* Responsive side-phone offset */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setPhoneOffset(w < 640 ? 105 : w < 1024 ? 148 : 185)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  /* Reset order & hover on brand switch */
  useEffect(() => {
    setOrder([1, 0, 2])
    setHoveredPos(null)
  }, [brandId])

  function clickPosition(pos) {
    if (pos === 0) setOrder(([l, c, r]) => [r, l, c])
    else if (pos === 2) setOrder(([l, c, r]) => [c, r, l])
    setHoveredPos(null)
  }

  return (
    <div
      className="relative w-full select-none"
      style={{ height: '700px', perspective: '1400px', perspectiveOrigin: '50% 50%' }}
    >
      {/* Per-brand ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 58%, ${accentColor}1c 0%, transparent 68%)`,
          transition: 'background 0.9s ease',
        }}
      />

      {[0, 1, 2].map((videoIdx) => {
        const pos = order.indexOf(videoIdx)
        return (
          <PhoneUnit
            key={videoIdx}
            youtubeId={videos[videoIdx]}
            pos={pos}
            phoneOffset={phoneOffset}
            isHovered={hoveredPos === pos && pos !== 1}
            onClick={() => pos !== 1 && clickPosition(pos)}
            onHover={() => pos !== 1 && setHoveredPos(pos)}
            onHoverEnd={() => setHoveredPos(null)}
          />
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PhoneUnit
   — pos 0 = left, 1 = center, 2 = right
   — Phone frame matches Hero section exactly:
     outer bezel (#0a0a0a, thick padding, large radius)
     inner screen (overflow-hidden, inner radius)
     large Dynamic Island pill
     multi-layer shadow + glass-edge rings
───────────────────────────────────────────── */

/* Phone frame constants — mirror Hero's PhoneMockup */
const PHONE_W      = 280   /* matches Hero's lg:w-[280px] center phone */
const OUTER_RADIUS = 48    /* matches Hero's rounded-[48px] */
const INNER_RADIUS = 38    /* matches Hero's rounded-[38px] */
const BEZEL        = 12    /* matches Hero's md:p-[12px] */
const DI_H         = 28    /* matches Hero's md:h-[28px] */
const DI_W         = 110   /* matches Hero's md:w-[110px] */

function PhoneUnit({ youtubeId, pos, phoneOffset, isHovered, onClick, onHover, onHoverEnd }) {
  const isCenter = pos === 1
  const isLeft   = pos === 0

  const SCALE_SIDE       = 0.78
  const SCALE_SIDE_HOVER = 0.86
  const ROT_Y            = 20
  const ROT_Y_HOVER      = 11

  let transform
  if (isCenter) {
    transform = 'translate(-50%, -50%) scale(1) rotateY(0deg)'
  } else if (isLeft) {
    const s = isHovered ? SCALE_SIDE_HOVER : SCALE_SIDE
    const r = isHovered ? ROT_Y_HOVER      : ROT_Y
    transform = `translate(calc(-50% - ${phoneOffset}px), -50%) scale(${s}) rotateY(${r}deg)`
  } else {
    const s = isHovered ? SCALE_SIDE_HOVER : SCALE_SIDE
    const r = isHovered ? ROT_Y_HOVER      : ROT_Y
    transform = `translate(calc(-50% + ${phoneOffset}px), -50%) scale(${s}) rotateY(-${r}deg)`
  }

  const zIndex     = isCenter ? 20 : 10
  const opacity    = isCenter ? 1  : isHovered ? 0.90 : 0.62
  const brightness = isCenter ? 1  : isHovered ? 0.88 : 0.65

  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&playsinline=1`

  return (
    <div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        width: `${PHONE_W}px`,
        transform,
        zIndex,
        opacity,
        filter: `brightness(${brightness})`,
        transition: 'transform 0.65s cubic-bezier(0.34, 1.18, 0.64, 1), opacity 0.5s ease, filter 0.5s ease',
        cursor: isCenter ? 'default' : 'pointer',
        willChange: 'transform, opacity',
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <div className={isCenter ? 'phone-float' : undefined} style={{ width: '100%' }}>

        {/* ── OUTER PHONE BODY ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9 / 19.5',
            borderRadius: `${OUTER_RADIUS}px`,
            background: '#0a0a0a',
            padding: `${BEZEL}px`,
            boxShadow: isCenter
              ? `0 40px 100px -20px rgba(0,0,0,0.80), inset 0 0 0 1px rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.05)`
              : `0 24px 60px -15px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.05)`,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              borderRadius: `${OUTER_RADIUS}px`,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
              pointerEvents: 'none',
            }}
          />

          {/* ── INNER SCREEN ── */}
          <div
            style={{
              position: 'relative',
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              borderRadius: `${INNER_RADIUS}px`,
              background: '#000',
            }}
          >
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none', pointerEvents: isCenter ? 'auto' : 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              title={`Video ${youtubeId}`}
            />

            {/* Dynamic Island */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                height: `${DI_H}px`,
                width: `${DI_W}px`,
                borderRadius: '9999px',
                background: '#000',
                pointerEvents: 'none',
              }}
            />

            {/* Side phone swap arrow */}
            {!isCenter && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.22s ease' }}
              >
                <div className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-sm border border-white/15 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  {isLeft ? (
                    <svg viewBox="0 0 12 12" className="h-4 w-4 text-white" fill="none">
                      <path d="M9 6H3M3 6L5.5 3.5M3 6l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 12 12" className="h-4 w-4 text-white" fill="none">
                      <path d="M3 6h6M9 6L6.5 3.5M9 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* Screen glass-edge ring */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                borderRadius: `${INNER_RADIUS}px`,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                pointerEvents: 'none',
                zIndex: 30,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
