import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   Custom VSL controls — replaces the browser's native controls so the
   video no longer dims on hover, and everything is CONVRT lime.

   PROGRESS BAR: purely visual and deliberately non-linear. It moves
   fast at the start and decelerates toward the end (shown = p^0.6),
   so the video feels shorter than it is. It always reaches 100% exactly
   when the video ends. Playback itself is unaffected, and the bar is
   not seekable (typical for a VSL), so the distorted scale never has to
   be mapped back to real time.
───────────────────────────────────────────── */

const LIME = '#d5ff40'
const PROGRESS_EXPONENT = 0.6

export default function VslControls({ videoRef, containerRef, visible, playing, paused }) {
  const barRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)

  useEffect(() => {
    setPipSupported(typeof document !== 'undefined' && !!document.pictureInPictureEnabled)
  }, [])

  // Non-linear progress bar, written straight to the DOM so it stays smooth.
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    if (!playing) {
      bar.style.transform = 'scaleX(0)'
      return
    }
    let raf = null
    const update = () => {
      const v = videoRef.current
      if (v && v.duration) {
        const p = Math.min(Math.max(v.currentTime / v.duration, 0), 1)
        bar.style.transform = `scaleX(${Math.pow(p, PROGRESS_EXPONENT).toFixed(4)})`
      }
    }
    const loop = () => {
      update()
      raf = requestAnimationFrame(loop)
    }
    update()
    if (!paused) raf = requestAnimationFrame(loop)
    return () => { if (raf != null) cancelAnimationFrame(raf) }
  }, [playing, paused, videoRef])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const next = !muted
    v.muted = next
    setMuted(next)
  }

  const changeVolume = (e) => {
    const v = videoRef.current
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (!v) return
    v.volume = val
    if (val > 0 && muted) { v.muted = false; setMuted(false) }
    if (val === 0 && !muted) { v.muted = true; setMuted(true) }
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    const v = videoRef.current
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)
    } else if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else if (el?.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    } else if (v?.webkitEnterFullscreen) {
      v.webkitEnterFullscreen() // iOS Safari: video-only fullscreen
    }
  }

  const togglePip = () => {
    const v = videoRef.current
    if (!v) return
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {})
    else v.requestPictureInPicture?.().catch(() => {})
  }

  const level = muted ? 0 : volume

  return (
    <>
      {/* Top icons — fade with pointer activity */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 md:p-4"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-md p-1" style={{ color: LIME }}>
          <IconButton label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
            {isFullscreen ? (
              <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" />
            ) : (
              <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            )}
          </IconButton>
          {pipSupported && (
            <IconButton label="Picture in picture" onClick={togglePip}>
              <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
              <rect x="8" y="8" width="5" height="3.5" rx="0.8" fill="currentColor" stroke="none" />
            </IconButton>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-md p-1 pr-1.5" style={{ color: LIME }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={level}
            onChange={changeVolume}
            aria-label="Volume"
            className="volume-slider vsl-lime hidden sm:block w-20 cursor-pointer mx-2"
            style={{ background: `linear-gradient(to right, ${LIME} 0%, ${LIME} ${level * 100}%, rgba(255,255,255,0.25) ${level * 100}%, rgba(255,255,255,0.25) 100%)` }}
          />
          <IconButton label={muted || volume === 0 ? 'Unmute' : 'Mute'} onClick={toggleMute}>
            <path d="M2 6v4h2.5L8 13V3L4.5 6H2z" fill="currentColor" />
            {level > 0 && <path d="M10.5 5.5c.9.7 1.3 1.5 1.3 2.5s-.4 1.8-1.3 2.5" />}
            {level > 0.5 && <path d="M12.6 3.5C14 4.6 14.8 6.1 14.8 8s-.8 3.4-2.2 4.5" />}
            {level === 0 && <path d="M10.5 6l4 4M14.5 6l-4 4" />}
          </IconButton>
        </div>
      </div>

      {/* Progress bar — always visible while a video is running */}
      {playing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[5px] bg-white/15">
          <div
            ref={barRef}
            className="h-full w-full origin-left"
            style={{ background: LIME, transform: 'scaleX(0)', boxShadow: '0 0 12px rgba(213,255,64,0.6)', willChange: 'transform' }}
          />
        </div>
      )}
    </>
  )
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:scale-95"
    >
      <svg viewBox="0 0 16 16" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
