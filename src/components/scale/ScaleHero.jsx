import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { usePrefersReducedMotion } from '../caseStudies/shared/usePrefersReducedMotion.js'
import { trackEvent } from '../../lib/analytics.js'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'
import VslControls from './VslControls.jsx'
import { softGlow } from '../../lib/glow.js'

/* ─────────────────────────────────────────────
   VSL is hosted on Cloudflare Stream — same pattern as the homepage
   hero (HERO_HLS in components/Hero.jsx). Nothing is fetched until the
   visitor presses play: the <video> has no src and preload="none" until
   then, so the VSL costs the page nothing on load. Set VSL_VIDEO_ID to
   '' to fall back to the "being finalized" placeholder state.

   SCROLL MECHANIC — fixes the earlier "dead scroll" bug. Progress is
   driven by the OUTER section's own measured height, not a fixed
   pixel constant:

     pinDistance = section.offsetHeight - viewportHeight
     progress    = clamp01(-rect.top / pinDistance)

   That guarantees progress hits exactly 1.0 the instant the sticky
   wrapper is about to release — there is no leftover scroll distance
   where the video sits frozen before the next section arrives.
───────────────────────────────────────────── */
const VSL_VIDEO_ID = 'a5e60be52e693016bb47bed4c801eb5f'
const VSL_HLS = VSL_VIDEO_ID ? `https://videodelivery.net/${VSL_VIDEO_ID}/manifest/video.m3u8` : ''
const VSL_POSTER = VSL_VIDEO_ID ? `https://videodelivery.net/${VSL_VIDEO_ID}/thumbnails/thumbnail.jpg?height=720` : ''

export default function ScaleHero() {
  const sectionRef = useRef(null)
  const copyRef = useRef(null)
  const frameRef = useRef(null)
  const stickyRef = useRef(null)
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

    // The pin starts when the section's top reaches the sticky offset (= header
    // height) and ends when its bottom meets the sticky wrapper's bottom, so
    // the scroll distance is section height minus wrapper height. Progress is
    // measured over exactly that range: it starts the instant the visitor
    // scrolls (no dead zone under the header) and hits 1 at the moment of release.
    const stickyOffset = () => (window.innerWidth < 768 ? 72 : 96)
    const measure = () => {
      pinDistance = Math.max(section.offsetHeight - stickyRef.current.offsetHeight, 1)
    }

    // The video re-centres itself in the visible area (below the header) as it
    // grows, so at full size its whole frame — including the progress bar at
    // the bottom edge — is on screen on any viewport height, not pushed
    // below the fold by the hero copy above it.
    let appliedTy = 0
    const apply = (p) => {
      const copyFade = Math.min(p / 0.6, 1)
      copy.style.opacity = String(1 - copyFade * 0.85)
      copy.style.transform = `translateY(${(-copyFade * 50).toFixed(1)}px)`

      const isMobile = window.innerWidth < 768
      const navH = isMobile ? 72 : 96
      // Never let the grown video exceed the visible height (header and a small
      // margin excluded) — on wide, short screens 92vw would otherwise be taller
      // than the viewport and push the bottom controls off screen.
      const fitScale = (window.innerHeight - navH - 32) / frame.offsetHeight
      const maxScale = Math.min(isMobile ? 1.08 : 1.48, Math.max(1, fitScale))
      const scale = 1 + p * (maxScale - 1)

      // Measure the frame's resting centre relative to the sticky container, so
      // the result doesn't change as the page scrolls (including after release).
      const rect = frame.getBoundingClientRect()
      const stickyRect = stickyRef.current.getBoundingClientRect()
      const baseCenter = navH + (rect.top + rect.height / 2 - appliedTy - stickyRect.top)
      const targetCenter = navH + (window.innerHeight - navH) / 2
      const ty = Math.min(0, targetCenter - baseCenter) * p
      appliedTy = ty

      frame.style.transform = `translateY(${ty.toFixed(1)}px) scale(${scale.toFixed(4)})`
      frame.style.borderRadius = `${(28 - p * 18).toFixed(1)}px`
      frame.style.boxShadow = `0 ${40 + p * 50}px ${100 + p * 70}px -20px rgba(0,0,0,${(0.7 + p * 0.15).toFixed(2)})`
    }

    const compute = () => {
      rafId = null
      measure() // cheap, and keeps the range correct as fonts/images settle layout
      const rect = section.getBoundingClientRect()
      const scrolled = stickyOffset() - rect.top
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

  const hlsRef = useRef(null)
  const attachedRef = useRef(false)
  const [posterOk, setPosterOk] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [paused, setPaused] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const playerRef = useRef(null)
  const hideTimerRef = useRef(null)
  const pointerTypeRef = useRef('mouse')
  const wasVisibleRef = useRef(false)

  useEffect(() => () => {
    hlsRef.current?.destroy()
    clearTimeout(hideTimerRef.current)
  }, [])

  // Controls fade in on pointer/touch activity and out after a short idle.
  const showControls = () => {
    setControlsVisible(true)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500)
  }
  const hideControlsSoon = () => {
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 600)
  }
  const togglePlayPause = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  // Attach the HLS source lazily, on first play only.
  const attachSource = (video) => {
    if (attachedRef.current) return
    attachedRef.current = true
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VSL_HLS
    } else if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setLoadError(true) })
      hls.loadSource(VSL_HLS)
      hls.attachMedia(video)
    } else {
      setLoadError(true)
    }
  }

  const handlePlay = () => {
    const firstPlay = !milestonesRef.current.has('played')
    if (firstPlay) {
      milestonesRef.current.add('played')
      trackEvent('vsl_play', { page: 'scale' })
    }
    if (!VSL_HLS) {
      setShowComingSoon(true)
      return
    }
    const video = videoRef.current
    if (!video) return
    setLoadError(false)
    attachSource(video)
    video.play().then(() => setPlaying(true)).catch(() => {})
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
    // Replaying an hls.js stream from its ended state throws a sticky
    // DEMUXER_ERROR in Chromium. Tear the player down so the next play
    // attaches a fresh source instead.
    const video = videoRef.current
    hlsRef.current?.destroy()
    hlsRef.current = null
    attachedRef.current = false
    if (video) {
      video.removeAttribute('src')
      video.load()
    }
    setPaused(false)
    setPlaying(false)
  }

  return (
    <section
      id="watch"
      ref={sectionRef}
      className="relative overflow-x-clip"
      style={{ height: reducedMotion ? 'auto' : 'clamp(135vh, 160vh, 175vh)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[448px] left-1/2 h-[1160px] w-[1740px] -translate-x-1/2 soft-glow" style={{ background: softGlow('#d5ff40', 0.09, 1100, 520, 160) }}
      />

      <div
        ref={stickyRef}
        className={reducedMotion ? 'relative pt-10 pb-16 md:pt-14 md:pb-20' : 'sticky top-[72px] md:top-[96px] flex flex-col items-center justify-center overflow-x-clip'}
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
              className="relative mx-auto aspect-video w-full min-w-[320px] overflow-hidden rounded-[28px] border border-hairline-strong bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75)]"
              // 62vw on normal desktops. On wide-but-short screens the starting size is
              // capped by viewport height so the video still has room to grow into.
              style={{ maxWidth: 'min(62vw, calc((100vh - 128px) * 1.28))', willChange: 'transform, border-radius' }}
            >
              {/* Base layer: designed placeholder — also the fallback if the poster can't load */}
              <FounderPlaceholderArt />

              {VSL_HLS && (
                <>
                  {posterOk && !playing && (
                    <>
                      <img
                        src={VSL_POSTER}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        draggable="false"
                        onError={() => setPosterOk(false)}
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.7) 0%, rgba(10,10,11,0.05) 45%, rgba(10,10,11,0.25) 100%)' }}
                      />
                      <div className="pointer-events-none absolute top-3 left-3 md:top-5 md:left-5 flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md px-3.5 py-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                        <span className="text-[12px] font-medium text-white/85">Mohamed — Founder, CONVRT</span>
                      </div>
                    </>
                  )}
                  <div
                    ref={playerRef}
                    className="absolute inset-0 bg-black [&:fullscreen_video]:object-contain"
                    style={{ pointerEvents: playing ? 'auto' : 'none', opacity: playing ? 1 : 0 }}
                    onPointerDown={(e) => {
                      pointerTypeRef.current = e.pointerType
                      wasVisibleRef.current = controlsVisible
                      if (playing) showControls()
                    }}
                    onPointerMove={() => { if (playing) showControls() }}
                    onPointerLeave={() => { if (playing) hideControlsSoon() }}
                  >
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full cursor-pointer object-cover"
                      preload="none"
                      playsInline
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                      onPlay={() => setPaused(false)}
                      onPause={(e) => { if (!e.currentTarget.ended) setPaused(true) }}
                      onClick={() => {
                        // On touch, the first tap just reveals the controls.
                        if (pointerTypeRef.current === 'touch' && !wasVisibleRef.current) return
                        togglePlayPause()
                      }}
                    />
                    <VslControls
                      videoRef={videoRef}
                      containerRef={playerRef}
                      visible={controlsVisible || paused}
                      playing={playing}
                      paused={paused}
                    />
                  </div>
                </>
              )}

              {loadError && (
                <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6 z-10 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-canvas/90 backdrop-blur-md border border-hairline px-5 py-4">
                  <p className="flex-1 text-[13px] text-ink-muted leading-snug">
                    The video couldn't load. Happy to walk you through it live instead.
                  </p>
                  <DiscoveryCallButton location="vsl_error" size="sm" variant="inverse" className="shrink-0" />
                </div>
              )}

              {(!playing || paused) && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label="Play the CONVRT founder video"
                  className={`group absolute inset-x-0 flex items-center justify-center ${playing ? 'top-16 bottom-20' : 'top-0 bottom-14 md:bottom-16'}`}
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
        className="pointer-events-none absolute left-1/2 top-1/2 h-[calc(70%+360px)] w-[calc(70%+360px)] -translate-x-1/2 -translate-y-1/2 soft-glow"
        style={{ background: softGlow('#d5ff40', 0.16, 700, 700, 90) }}
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
