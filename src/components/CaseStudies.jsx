import { useState, useRef, useEffect, useCallback } from 'react'
import Hls from 'hls.js'
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
    videos: ['fa02007b36fae2b3bb68c97cdd00e9fc', '0905b814e2ba3950197b5bfe1cefae38', '9e6cb8438c9b0c1ab8b55953718eddde'],
    accentColor: '#f59e0b',
  },
  {
    id: 'adscale',
    tab: 'SaaS',
    logo: { src: '/clients/adscale.png', alt: 'Adscale', w: 531, h: 149 },
    title: "Long-form creatives\nthat can't be skipped.",
    body: 'If you think long creatives are not a thing, check these out. These are not just creatives, they build trust, they scream confidence, and they show "we know what we\'re doing". Aesthetic transitions, catchy visuals and a delivery so engaging that it makes it almost impossible to skip.',
    videos: ['8d4dbbeabac272bddb23068c91037af8', '08abef50c734085f25f345cdde4b1e33', 'e3fe66bacac503de0a0be989a3a4ed4b'],
    accentColor: '#3b82f6',
  },
  {
    id: 'graspo',
    tab: 'Printing',
    logo: { src: '/clients/graspo.png', alt: 'Graspo', w: 619, h: 279, height: 62 },
    title: '6 million views.\nIn less than 2 months.',
    body: "We have generated over 6 million views for Graspo in less than 2 months. And yes, it took 6 months of content testing beforehand to figure out what really clicks and what doesn't. Today, Graspo has over 10k followers on Facebook and almost 4k on Instagram.",
    videos: ['15dd5505109f6821ccdcb13fc3cdc1fd', '3616606e3ca6d1a85c8a57d7cc2f656f', 'c1379ace38f2fa19ef2a45de1bb5d4b1'],
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
          <div className="lg:col-span-5 flex flex-col gap-7 items-center lg:items-start text-center lg:text-left">

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
                  objectPosition: 'center',
                }}
                draggable="false"
              />
            </div>

            {/* Hairline divider */}
            <div className="cs-fade-up h-px bg-hairline w-12" style={{ animationDelay: '30ms' }} />

            {/* Title */}
            <h3
              className="cs-fade-up font-display font-bold text-ink tracking-display leading-[1.08] text-[clamp(1.85rem,3vw,2.6rem)] whitespace-pre-line text-center lg:text-left"
              style={{ animationDelay: '60ms' }}
            >
              {active.title}
            </h3>

            {/* Body */}
            <p
              className="cs-fade-up text-[15px] text-ink-muted leading-[1.75] text-center lg:text-left"
              style={{ animationDelay: '120ms' }}
            >
              {active.body}
            </p>

            {/* CTA */}
            <a
              href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
              className="cs-fade-up cta-gradient mt-1 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
              style={{ animationDelay: '190ms' }}
            >
              Get creatives like these
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            {activeId === 'graspo' && (
              <a
                href="/case-studies"
                className="cs-fade-up text-xs text-ink-subtle hover:text-lime underline underline-offset-2 transition-colors"
                style={{ animationDelay: '220ms' }}
              >
                Read the full Graspo case study →
              </a>
            )}
            {activeId === 'elyon' && (
              <a
                href="/case-studies?case=elyon"
                className="cs-fade-up text-xs text-ink-subtle hover:text-lime underline underline-offset-2 transition-colors"
                style={{ animationDelay: '220ms' }}
              >
                Read the full Elyon Dubai case study →
              </a>
            )}
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
  const videoRefs = useRef([null, null, null])
  const [phoneOffset, setPhoneOffset] = useState(158)

  const stableVideoRefs = useRef([
    (el) => { videoRefs.current[0] = el },
    (el) => { videoRefs.current[1] = el },
    (el) => { videoRefs.current[2] = el },
  ])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setPhoneOffset(w < 640 ? 105 : w < 1024 ? 148 : 185)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    setOrder([1, 0, 2])
    setHoveredPos(null)
  }, [brandId])

  /* Drive playback: center plays, sides pause */
  useEffect(() => {
    const centerIdx = order[1]
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return
      if (i === centerIdx) { ref.currentTime = 0; ref.play().catch(() => {}) }
      else ref.pause()
    })
  }, [order, brandId])

  function clickPosition(pos) {
    if (pos === 0) setOrder(([l, c, r]) => [r, l, c])
    else if (pos === 2) setOrder(([l, c, r]) => [c, r, l])
    setHoveredPos(null)
  }

  return (
    <div className="relative w-full select-none" style={{ height: '700px', perspective: '1400px', perspectiveOrigin: '50% 50%' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 75% 55% at 50% 58%, ${accentColor}1c 0%, transparent 68%)`, transition: 'background 0.9s ease' }} />
      {[0, 1, 2].map((videoIdx) => {
        const pos = order.indexOf(videoIdx)
        return (
          <PhoneUnit
            key={videoIdx}
            videoId={videos[videoIdx]}
            pos={pos}
            phoneOffset={phoneOffset}
            isHovered={hoveredPos === pos && pos !== 1}
            onClick={() => pos !== 1 && clickPosition(pos)}
            onHover={() => pos !== 1 && setHoveredPos(pos)}
            onHoverEnd={() => setHoveredPos(null)}
            videoRef={stableVideoRefs.current[videoIdx]}
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

function PhoneUnit({ videoId, pos, phoneOffset, isHovered, onClick, onHover, onHoverEnd, videoRef }) {
  const isCenter = pos === 1
  const isLeft   = pos === 0

  const SCALE_SIDE = 0.78, SCALE_SIDE_HOVER = 0.86, ROT_Y = 20, ROT_Y_HOVER = 11

  let transform
  if (isCenter) transform = 'translate(-50%, -50%) scale(1) rotateY(0deg)'
  else if (isLeft) { const s = isHovered ? SCALE_SIDE_HOVER : SCALE_SIDE; const r = isHovered ? ROT_Y_HOVER : ROT_Y; transform = `translate(calc(-50% - ${phoneOffset}px), -50%) scale(${s}) rotateY(${r}deg)` }
  else { const s = isHovered ? SCALE_SIDE_HOVER : SCALE_SIDE; const r = isHovered ? ROT_Y_HOVER : ROT_Y; transform = `translate(calc(-50% + ${phoneOffset}px), -50%) scale(${s}) rotateY(-${r}deg)` }

  const zIndex = isCenter ? 20 : 10
  const isMobile = phoneOffset === 105   /* 105 = xs breakpoint, 148 = sm–md, 185 = lg+ */
  const opacity    = isCenter ? 1 : isHovered ? 0.90 : (isMobile ? 0.85 : 0.62)
  const brightness = isCenter ? 1 : isHovered ? 0.88 : (isMobile ? 0.88 : 0.65)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const internalRef = useRef(null)

  const combinedRef = useCallback((el) => {
    internalRef.current = el
    if (typeof videoRef === 'function') videoRef(el)
  }, [videoRef])

  /* HLS setup */
  useEffect(() => {
    const el = internalRef.current
    if (!el) return
    const src = `https://videodelivery.net/${videoId}/manifest/video.m3u8`
    let hls
    if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src
    } else if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(el)
    }
    return () => hls && hls.destroy()
  }, [videoId])

  useEffect(() => { const el = internalRef.current; if (el) el.muted = muted }, [muted])

  useEffect(() => {
    const el = internalRef.current
    if (!el) return
    const onTime  = () => setProgress(el.currentTime)
    const onMeta  = () => setDuration(el.duration || 0)
    const onPlay  = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onReady = () => setLoaded(true)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('canplay', onReady)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('canplay', onReady)
    }
  }, [])

  const togglePlay = useCallback(() => { const el = internalRef.current; if (!el) return; el.paused ? el.play().catch(() => {}) : el.pause() }, [])
  const toggleMute = useCallback((e) => { e.stopPropagation(); setMuted(m => !m) }, [])
  const seek = useCallback((e) => {
    e.stopPropagation()
    const el = internalRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    el.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }, [duration])

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="absolute" style={{ left: '50%', top: '50%', width: `${PHONE_W}px`, transform, zIndex, opacity, filter: `brightness(${brightness})`, transition: 'transform 0.65s cubic-bezier(0.34, 1.18, 0.64, 1), opacity 0.5s ease, filter 0.5s ease', cursor: isCenter ? 'default' : 'pointer', willChange: 'transform, opacity' }}
      onClick={onClick} onMouseEnter={onHover} onMouseLeave={onHoverEnd}>
      <div className={isCenter ? 'phone-float' : undefined} style={{ width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '9 / 19.5', borderRadius: `${OUTER_RADIUS}px`, background: '#0a0a0a', padding: `${BEZEL}px`, boxShadow: isCenter ? `0 40px 100px -20px rgba(0,0,0,0.80), inset 0 0 0 1px rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.05)` : `0 24px 60px -15px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.05)` }}>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: `${OUTER_RADIUS}px`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', borderRadius: `${INNER_RADIUS}px`, background: '#000' }}>

            <video ref={combinedRef} className="absolute inset-0 w-full h-full object-cover"
              poster={`https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=0s&height=600`}
              loop muted playsInline preload="auto"
              onClick={isCenter ? togglePlay : undefined} style={{ cursor: isCenter ? 'pointer' : 'default' }} />

            {!loaded && <div className="absolute inset-0 animate-pulse" style={{ background: '#111114', borderRadius: `${INNER_RADIUS}px` }} />}

            <div aria-hidden="true" style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, height: `${DI_H}px`, width: `${DI_W}px`, borderRadius: '9999px', background: '#000' }} />

            {isCenter && (
              <>
                <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
                  className="absolute top-14 right-3 z-30 h-9 w-9 rounded-full flex items-center justify-center bg-black/55 backdrop-blur-md text-white transition-colors hover:bg-black/75 active:scale-95">
                  {muted
                    ? <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14.5 7.5l4 4M18.5 7.5l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    : <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14 8c.8.6 1.3 1.3 1.3 2s-.5 1.4-1.3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M16.6 5.6c1.7 1.2 2.6 2.7 2.6 4.4s-.9 3.2-2.6 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
                </button>
                <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
                  className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${playing ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                  <span className="h-14 w-14 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform duration-150 hover:scale-110">
                    {playing
                      ? <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor"><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></svg>
                      : <svg viewBox="0 0 16 16" className="h-5 w-5 ml-0.5" fill="currentColor"><path d="M4 3l9 5-9 5V3z" /></svg>}
                  </span>
                </button>
                <div className="absolute inset-x-3 bottom-5 z-30">
                  <div className="flex items-center gap-2.5 rounded-full bg-black/55 backdrop-blur-md pl-1.5 pr-3 py-1.5">
                    <button type="button" onClick={togglePlay} className="h-8 w-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95">
                      {playing ? <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor"><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></svg> : <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 ml-0.5" fill="currentColor"><path d="M4 3l9 5-9 5V3z" /></svg>}
                    </button>
                    <div className="group relative flex-1 h-1 cursor-pointer rounded-full bg-white/20 transition-[height] duration-150 hover:h-1.5" onClick={seek} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="absolute left-0 top-0 h-full rounded-full bg-white" style={{ width: `${pct}%`, transition: 'width 0.1s linear' }} />
                      <div className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isCenter && (
              <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.22s ease' }}>
                <div className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-sm border border-white/15 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  {isLeft
                    ? <svg viewBox="0 0 12 12" className="h-4 w-4 text-white" fill="none"><path d="M9 6H3M3 6L5.5 3.5M3 6l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg viewBox="0 0 12 12" className="h-4 w-4 text-white" fill="none"><path d="M3 6h6M9 6L6.5 3.5M9 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
              </div>
            )}

            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: `${INNER_RADIUS}px`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)', pointerEvents: 'none', zIndex: 10 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
