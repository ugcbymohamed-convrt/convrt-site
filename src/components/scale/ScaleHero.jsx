import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../caseStudies/shared/usePrefersReducedMotion.js'
import { trackEvent } from '../../lib/analytics.js'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'

/* ─────────────────────────────────────────────
   VSL not recorded yet. Set VSL_SRC to the hosted mp4/HLS URL once it
   exists (same Cloudflare Stream pattern as the homepage hero — see
   HERO_HLS in components/Hero.jsx) and the player lights up with no
   other changes.

   SCROLL MECHANIC — fixes the earlier "dead scroll" bug. Progress is
   driven by the OUTER section's own measured height, not a fixed
   pixel constant:

     pinDistance = section.offsetHeight - viewportHeight
     progress    = clamp01(-rect.top / pinDistance)

   That guarantees progress hits exactly 1.0 the instant the sticky
   wrapper is about to release — there is no leftover scroll distance
   where the video sits frozen before the next section arrives.
───────────────────────────────────────────── */
const VSL_SRC = ''

export default function ScaleHero() {
  const sectionRef = useRef(null)
  const copyRef = useRef(null)
  const frameRef = useRef(null)
  const videoRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  const [entered, setEntered] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const milestonesRef = useRef(new Set())

  useEffect(() => {
    trackEvent('landing_page_view', { page: 'scale' })
    const t = setTimeout(() => setEntered(true), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const frame = frameRef.current
    if (!section || !copy || !frame || reducedMotion) return

    let pinDistance = 1
    let rafId = null

    const measure = () => {
      pinDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
    }

    const apply = (p) => {
      const copyFade = Math.min(p / 0.6, 1)
      copy.style.opacity = String(1 - copyFade * 0.85)
      copy.style.transform = `translateY(${(-copyFade * 50).toFixed(1)}px)`

      const isMobile = window.innerWidth < 768
      const maxScale = isMobile ? 1.08 : 1.48
      const scale = 1 + p * (maxScale - 1)
      frame.style.transform = `translateY(${(-p * 36).toFixed(1)}px) scale(${scale.toFixed(4)})`
      frame.style.borderRadius = `${(28 - p * 18).toFixed(1)}px`
      frame.style.boxShadow = `0 ${40 + p * 50}px ${100 + p * 70}px -20px rgba(0,0,0,${(0.7 + p * 0.15).toFixed(2)})`
    }

    const compute = () => {
      rafId = null
      const rect = section.getBoundingClientRect()
      const scrolled = -rect.top
      const p = scrolled < 0 ? 0 : scrolled > pinDistance ? 1 : scrolled / pinDistance
      apply(p)
    }

    const requestTick = () => { if (rafId == null) rafId = requestAnimationFrame(compute) }
    const onResize = () => { measure(); requestTick() }

    measure()
    compute()
    window.addEventListener('scroll', requestTick, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', requestTick)
      window.removeEventListener('resize', onResize)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [reducedMotion])

  const handlePlay = () => {
    trackEvent('vsl_play', { page: 'scale' })
    if (!VSL_SRC) {
      setShowComingSoon(true)
      return
    }
    setShowComingSoon(false)
    setPlaying(true)
    videoRef.current?.play().catch(() => {})
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = (v.currentTime / v.duration) * 100
    ;[25, 50, 75].forEach((m) => {
      if (pct >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m)
        trackEvent('vsl_progress', { page: 'scale', percent: m })
      }
    })
  }

  const handleEnded = () => {
    if (!milestonesRef.current.has(100)) {
      milestonesRef.current.add(100)
      trackEvent('vsl_complete', { page: 'scale' })
    }
    setPlaying(false)
  }

  return (
    <section
      id="watch"
      ref={sectionRef}
      className="relative"
      style={{ height: reducedMotion ? 'auto' : 'clamp(135vh, 160vh, 175vh)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/[0.09] blur-[160px]"
      />

      <div
        className={reducedMotion ? 'relative pt-10 pb-16 md:pt-14 md:pb-20' : 'sticky top-[72px] md:top-[96px] flex flex-col items-center justify-center overflow-hidden'}
        style={reducedMotion ? undefined : { minHeight: 'calc(100vh - 72px)' }}
      >
        <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
          {/* ── Copy ── */}
          <div ref={copyRef} className="mx-auto max-w-2xl text-center" style={{ willChange: 'transform, opacity' }}>
            <FadeIn show={entered} delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                Performance Creative for Paid Social
              </div>
            </FadeIn>

            <FadeIn show={entered} delay={90}>
              <h1 className="text-balance mt-6 font-display font-bold text-ink tracking-display-xl leading-[1.08] text-[34px] sm:text-[42px] md:text-[48px]">
                Your creative sets the ceiling on paid growth.
              </h1>
            </FadeIn>

            <FadeIn show={entered} delay={170}>
              <p className="text-balance mt-5 text-base md:text-lg text-ink-muted leading-relaxed max-w-lg mx-auto">
                CONVRT develops, produces and iterates paid-social creative built to find what
                converts, then makes more of it.
              </p>
            </FadeIn>

            <FadeIn show={entered} delay={240}>
              <p className="mt-7 text-sm font-medium text-ink-subtle">
                A message from CONVRT's founder.
              </p>
            </FadeIn>
          </div>

          {/* ── VSL frame ── */}
          <FadeIn show={entered} delay={300} className="mt-8 md:mt-10">
            <div
              ref={frameRef}
              className="relative mx-auto aspect-video w-full max-w-[62vw] min-w-[320px] overflow-hidden rounded-[28px] border border-hairline-strong bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75)]"
              style={{ willChange: 'transform, border-radius' }}
            >
              {VSL_SRC ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={VSL_SRC}
                  playsInline
                  muted={false}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  onPause={() => setPlaying(false)}
                />
              ) : (
                <FounderPlaceholderArt />
              )}

              {!playing && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label="Play the CONVRT founder video"
                  className="group absolute inset-x-0 top-0 bottom-14 md:bottom-16 flex items-center justify-center"
                >
                  <span className="relative flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover:scale-[1.06] group-active:scale-95">
                    <span className="absolute inset-0 rounded-full bg-lime/25 blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-70" />
                    <span className="absolute inset-0 rounded-full border border-lime/30 bg-white/10 backdrop-blur-md" />
                    <svg viewBox="0 0 24 24" className="relative h-7 w-7 md:h-8 md:w-8 translate-x-0.5 fill-white">
                      <path d="M7 4l14 8-14 8V4z" />
                    </svg>
                  </span>
                </button>
              )}

              {showComingSoon && (
                <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-canvas/90 backdrop-blur-md border border-hairline px-5 py-4">
                  <p className="flex-1 text-[13px] text-ink-muted leading-snug">
                    This video is being finalized. In the meantime, happy to walk you through it live.
                  </p>
                  <DiscoveryCallButton location="vsl_coming_soon" size="sm" variant="inverse" className="shrink-0" />
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* Intentional placeholder — dark cinematic canvas, subtle lime glow and
   grain, no stock photography. Reads as designed, not "coming soon." */
function FounderPlaceholderArt() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: 'radial-gradient(120% 140% at 50% 30%, #16160f 0%, #0a0a0b 60%, #050505 100%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[90px]"
        style={{ background: '#d5ff40' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
          mixBlendMode: 'overlay',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 pb-6 md:pb-8">
        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-lime">
          Founder Briefing
        </span>
        <span className="text-[12px] md:text-[13px] text-white/55">Mohamed — Founder, CONVRT</span>
      </div>
    </div>
  )
}

function FadeIn({ children, show, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
