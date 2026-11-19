import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import VslControls from '../scale/VslControls.jsx'
import { ApplyButton } from './shared.jsx'
import {
  ROADMAP_VIDEO_HLS,
  ROADMAP_VIDEO_POSTER,
  ROADMAP_VIDEO_POSTER_SMALL,
  ROADMAP_VIDEO_POSTER_SIZE,
} from '../../content/roadmapVideo.js'

/* ─────────────────────────────────────────────
   ROADMAP VIDEO — the video-first top of /creative-growth-roadmap.

   Same player as /scale, minus everything scroll-driven:
   • Controls and the decorative progress line are the SAME component as /scale
     (components/scale/VslControls.jsx, unchanged). The line moves fast early and
     slows toward the end (shown = p^0.6) but always reaches 100% exactly when the
     video ends. It is purely visual: the video plays at normal speed, nothing is
     skipped, and (as on /scale) the bar is not a seek control. "Rewind 10 seconds"
     is the only seeking, and it uses the real playback position.
   • The frame has a fixed size. There is no scroll listener, no transform, no
     sticky/pinned section: visitors simply scroll past it.
   • Nothing is downloaded until Play: the <video> has no src and preload="none",
     the poster is a small same-origin WebP, and hls.js is imported on demand
     (never on Safari/iOS, which play HLS natively). No autoplay.
───────────────────────────────────────────── */

const NATIVE_HLS = 'application/vnd.apple.mpegurl'

let hlsLibPromise
const loadHlsLib = () => (hlsLibPromise ||= import('hls.js').then((m) => m.default))

export default function RoadmapVideo() {
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const hlsRef = useRef(null)
  const attachedRef = useRef(false)
  const milestonesRef = useRef(new Set())
  const hideTimerRef = useRef(null)
  const pointerTypeRef = useRef('mouse')
  const wasVisibleRef = useRef(false)

  const [starting, setStarting] = useState(false) // Play pressed, first frames not yet playing
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => () => {
    hlsRef.current?.destroy()
    clearTimeout(hideTimerRef.current)
  }, [])

  // Controls fade in on pointer / touch / keyboard activity and out after a short idle (as on /scale).
  const showControls = () => {
    setControlsVisible(true)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500)
  }
  const hideControlsSoon = () => {
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 600)
  }

  // Warm the hls.js chunk the moment the visitor shows intent, so Play starts without waiting for it.
  const warm = () => {
    const v = videoRef.current
    if (v && !v.canPlayType(NATIVE_HLS)) loadHlsLib().catch(() => {})
  }

  const resetSource = () => {
    const video = videoRef.current
    hlsRef.current?.destroy()
    hlsRef.current = null
    attachedRef.current = false
    if (video) {
      video.removeAttribute('src')
      video.load()
    }
  }

  const fail = () => {
    resetSource()
    setStarting(false)
    setPlaying(false)
    setPaused(false)
    setLoadError(true)
  }

  // Attach the HLS source lazily, on first play only. On the native-HLS path (Safari, iOS) nothing is
  // awaited, so video.play() still runs inside the tap/click.
  const attachSource = async (video) => {
    if (attachedRef.current) return true
    attachedRef.current = true
    if (video.canPlayType(NATIVE_HLS)) {
      video.src = ROADMAP_VIDEO_HLS
      return true
    }
    try {
      const Hls = await loadHlsLib()
      if (!Hls.isSupported()) throw new Error('hls unsupported')
      const hls = new Hls({ capLevelToPlayerSize: true })
      hlsRef.current = hls
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) fail() })
      hls.loadSource(ROADMAP_VIDEO_HLS)
      hls.attachMedia(video)
      return true
    } catch {
      fail()
      return false
    }
  }

  const handlePlay = async () => {
    const video = videoRef.current
    if (!video) return
    if (!milestonesRef.current.has('played')) {
      milestonesRef.current.add('played')
      trackEvent('vsl_play', { page: 'roadmap' })
    }
    setLoadError(false)
    setStarting(true)
    if (!(await attachSource(video))) return
    video.play().catch(() => setStarting(false))
  }

  const togglePlayPause = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = (v.currentTime / v.duration) * 100 // real playback position, not the decorative bar
    ;[25, 50, 75].forEach((m) => {
      if (pct >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m)
        trackEvent('vsl_progress', { page: 'roadmap', percent: m })
      }
    })
  }

  const handleEnded = () => {
    if (!milestonesRef.current.has(100)) {
      milestonesRef.current.add(100)
      trackEvent('vsl_complete', { page: 'roadmap' })
    }
    // Replaying an hls.js stream from its ended state throws a sticky DEMUXER_ERROR in Chromium
    // (same as /scale): tear the player down so the next Play attaches a fresh source. The poster and
    // big Play button come back, which is the replay affordance.
    resetSource()
    setPaused(false)
    setPlaying(false)
    setStarting(false)
  }

  const showPlayButton = !playing || paused

  return (
    <section aria-label="Watch: how your free Creative Growth Roadmap works" className="relative">
      <div className="relative mx-auto max-w-7xl px-5 pt-3 pb-8 md:px-8 md:pt-4 md:pb-12">
        <div className="mb-4 flex justify-center md:mb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime sm:text-xs">Watch this first</span>
          </div>
        </div>

        {/* Fixed-size frame: 16:9 (the video's own ratio), capped by width and by viewport height so it
            always fits on screen with the header. No scroll-driven size, position or radius. */}
        <div
          className="relative mx-auto aspect-video w-full overflow-hidden rounded-[20px] border border-hairline-strong bg-black shadow-[0_30px_80px_-24px_rgba(0,0,0,0.8)] ring-1 ring-lime/[0.07] md:rounded-[28px]"
          style={{ maxWidth: 'min(100%, 1040px, max(480px, calc((100svh - 230px) * 1.7778)))' }}
          onPointerEnter={warm}
        >
          {!playing && (
            <>
              <img
                src={ROADMAP_VIDEO_POSTER}
                srcSet={`${ROADMAP_VIDEO_POSTER_SMALL} 640w, ${ROADMAP_VIDEO_POSTER} 1280w`}
                sizes="(min-width: 1120px) 1040px, 100vw"
                width={ROADMAP_VIDEO_POSTER_SIZE.width}
                height={ROADMAP_VIDEO_POSTER_SIZE.height}
                alt=""
                fetchpriority="high"
                decoding="async"
                draggable="false"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.7) 0%, rgba(10,10,11,0.05) 45%, rgba(10,10,11,0.25) 100%)' }}
              />
              <div className="pointer-events-none absolute left-3 top-3 hidden items-center gap-2 rounded-full bg-black/50 px-3.5 py-2 backdrop-blur-md sm:flex md:left-5 md:top-5">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                <span className="text-[12px] font-medium text-white/85">Your Free Creative Growth Roadmap</span>
              </div>
            </>
          )}

          {/* Player layer: the <video> is always mounted (Play must call video.play() synchronously inside
              the click), the controls only once playback has started. */}
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
            onFocusCapture={() => { if (playing) showControls() }}
            onKeyDown={() => { if (playing) showControls() }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full cursor-pointer object-contain"
              aria-label="Free Creative Growth Roadmap video"
              preload="none"
              playsInline
              onPlaying={() => { setStarting(false); setPlaying(true); setPaused(false) }}
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
            {playing && (
              <VslControls
                videoRef={videoRef}
                containerRef={playerRef}
                visible={controlsVisible || paused}
                playing={playing}
                paused={paused}
              />
            )}
          </div>

          {loadError && (
            <div className="absolute inset-x-4 bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-hairline bg-canvas/90 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center md:inset-x-6 md:bottom-6">
              <p className="flex-1 text-[13px] leading-snug text-ink-muted">
                The video couldn’t load. You can still apply for your free Roadmap below.
              </p>
              <ApplyButton location="video_error" className="shrink-0 !min-h-[44px] !px-5 !py-2.5 !text-[14px]" />
            </div>
          )}

          {showPlayButton && (
            <button
              type="button"
              onClick={handlePlay}
              onFocus={warm}
              disabled={starting}
              aria-label={paused ? 'Resume the video' : 'Play the Free Creative Growth Roadmap video'}
              className={`group absolute inset-x-0 flex items-center justify-center focus-visible:outline-none ${
                playing ? 'bottom-20 top-16' : 'bottom-14 top-0 md:bottom-16'
              }`}
            >
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover:scale-[1.06] group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-lime group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:h-24 md:w-24">
                <span className="absolute inset-0 rounded-full bg-lime/25 opacity-70 blur-xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                <span className="absolute inset-0 rounded-full border border-lime/30 bg-white/10 backdrop-blur-md" aria-hidden="true" />
                {starting ? (
                  <span
                    role="status"
                    aria-label="Loading video"
                    className="relative h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-lime motion-reduce:animate-none"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" className="relative h-7 w-7 translate-x-0.5 fill-white md:h-8 md:w-8" aria-hidden="true">
                    <path d="M7 4l14 8-14 8V4z" />
                  </svg>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
