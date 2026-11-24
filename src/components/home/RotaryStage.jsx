import { useCallback, useEffect, useRef, useState } from 'react'
import { tr } from '../../i18n/tr.js'
import { attachHls } from '../../lib/hls.js'
import { posterUrl, hlsUrl, captionOf } from '../../content/portfolio.js'
import { HeroPlayerControls } from '../ugc/CreatorVideoStage.jsx'
import { useAutoplayAllowed } from '../ugc/creatorVideo.jsx'
import { pose, poseStyle, shortestDelta, easeInOutCubic, ROTATION_MS, round4 as f } from '../../lib/rotary.js'

/* THE ROTARY VIDEO STAGE (English homepage, client work).

   Three portrait videos stand on an invisible ELLIPSE above a lit circular platform. Video i sits at the angle (i - position) × 120°: the one at 0° is the large, upright centre video,
   the others stand at ±120° (smaller, farther back, tilted a little toward the centre). Selecting a side video animates `position` to that video's index, so every frame travels along the orbit
   (out, round and back), never in a straight line and never as a crossfade; the third video passes BEHIND the centre. Only transforms are animated, 3 elements, one requestAnimationFrame loop
   that exists only while a rotation is running (no layout, no continuous spinning, nothing moves until the visitor interacts).

   ROTATION RULES  • a click, tap, swipe, arrow key or the small arrows selects a video; the shortest way round is always used (with three videos that is one step)
                   • a selection made mid-rotation retargets from the CURRENT position, so repeated clicks can never leave a broken in-between state; the latest selection wins
                   • the active video stays upright (only the side videos are tilted) and keeps its aspect ratio; the same three <video> elements exist throughout, so nothing is remounted or duplicated
   PLAYBACK        • poster first: no stream is attached until the visitor presses play on the CENTRE video; side videos can only be selected, never played
                   • rotating away pauses the video (it keeps its last frame). The active video carries the SAME player UI as the homepage hero (HeroPlayerControls in components/ugc/CreatorVideoStage.jsx: play button, play/pause, seek bar, sound), shown once it has arrived
                   • everything is paused when the stage leaves the viewport; unmounting (switching client) destroys the stream
   MOTION          • prefers-reduced-motion: the selection changes at once (no orbit)
   The pose maths below is pure and also used for the server-rendered markup, so hydration matches. */

/* Before the visitor has started the video only the big play button is drawn; the control bar appears on hover or keyboard focus, and stays once the video has been started (playing or paused). It is hidden with
   opacity only, so it stays reachable by keyboard (focusing it shows it); on a touchscreen the big play button starts the video and the bar is then permanent. */
const BAR_UNTIL_STARTED = 'pointer-events-none opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'

/* The English stage's poster: an owner-supplied frame (`homeStagePoster`) where there is one, otherwise the video's usual poster. */
const stagePoster = (item) => item.homeStagePoster ?? posterUrl(item)

function Phone({ item, i, n, active, moving, inView, autoMode, onSelect, setEl, setShade }) {
  const ref = useRef(null)
  const [armed, setArmed] = useState(false) // the visitor pressed play once: the stream is attached from then on
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false) // sound is on: the visitor asked for this video
  const [progress, setProgress] = useState(0)
  const autoStarted = useRef(false) // the front video has already been started by reaching it
  const userPaused = useRef(false) // the visitor paused it: never resume it for them

  useEffect(() => {
    if (!armed) return undefined
    const v = ref.current
    if (!v) return undefined
    v.muted = muted // sound state first: an automatic start is always muted (browsers only allow muted autoplay)
    let hls = null
    if (item.source.cloudflareId) hls = attachHls(v, hlsUrl(item), { fastStart: true })
    else v.src = item.source.mp4
    const play = () => { v.play().catch((err) => { if (err && err.name === 'NotAllowedError' && !v.muted) { v.muted = true; setMuted(true); v.play().catch(() => {}) } }) }
    play()
    v.addEventListener('canplay', play, { once: true })
    const on = () => setPlaying(true)
    const off = () => setPlaying(false)
    const time = () => setProgress(v.duration ? v.currentTime / v.duration : 0)
    v.addEventListener('playing', on)
    v.addEventListener('pause', off)
    v.addEventListener('timeupdate', time)
    return () => { v.removeEventListener('canplay', play); v.removeEventListener('playing', on); v.removeEventListener('pause', off); v.removeEventListener('timeupdate', time); hls?.destroy(); setPlaying(false); if (!hls) { v.removeAttribute('src'); v.load() } }
  }, [armed, item])

  useEffect(() => { if (ref.current) ref.current.muted = muted }, [muted, armed])
  useEffect(() => { if (!active) { ref.current?.pause?.(); userPaused.current = true } }, [active]) // rotating away pauses it and it never restarts by itself

  /* PLAY WHEN REACHED. The first time the stage scrolls into view, the FRONT video starts by itself, muted (the hero's sound button is there to turn sound on). Only that one video, only once the
     visitor reaches it (nothing loads before), never for prefers-reduced-motion / data-saver visitors, and never again after they pause it. It pauses when the stage leaves the screen and resumes when it comes
     back (unless the visitor paused it). Rotating to another video never starts that one: a side video is only selected. */
  useEffect(() => {
    if (!active || moving) return
    if (inView && autoMode && !armed && !autoStarted.current) {
      autoStarted.current = true
      setMuted(true)
      setArmed(true)
    } else if (armed) {
      const v = ref.current
      if (!v) return
      if (!inView) v.pause()
      else if (autoMode && autoStarted.current && !userPaused.current && v.paused) v.play().catch(() => {})
    }
  }, [inView, autoMode, active, moving, armed])

  const toggle = () => {
    if (!armed) { autoStarted.current = true; userPaused.current = false; setArmed(true); return }
    const v = ref.current
    if (!v) return
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}) }
    else { userPaused.current = true; v.pause() }
  }
  const seek = (fraction) => {
    const v = ref.current
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return
    v.currentTime = fraction * v.duration
    setProgress(fraction)
  }

  return (
    <div ref={setEl} className="absolute left-1/2 top-1/2 w-full will-change-transform" style={poseStyle(pose(i, 0, n))}>
      <div
        className={`group relative aspect-[9/16] rounded-[12%/6.7%] p-[2.5%] ring-1 transition-[box-shadow] duration-500 motion-reduce:transition-none ${active ? 'ring-lime/70' : 'ring-white/25 group-hover:ring-lime/40'}`}
        style={{ background: 'linear-gradient(150deg, #a9ac9a 0%, #3a3c33 28%, #17181a 55%, #4a4d40 100%)', boxShadow: active ? '0 0 0 1.5px rgba(213,255,64,0.85), 0 0 20px 3px rgba(213,255,64,0.6), 0 0 54px 5px rgba(213,255,64,0.3), 0 40px 60px -20px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)' : '0 18px 30px -18px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)' }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[10%/5.6%] bg-black">
          <img src={stagePoster(item)} alt={captionOf(item)} width="405" height="720" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" className="absolute inset-0 h-full w-full object-cover" />
          {armed && (
            <video ref={ref} playsInline preload="none" poster={stagePoster(item)} aria-label={captionOf(item)} className="absolute inset-0 h-full w-full bg-black object-cover" />
          )}
          <span ref={setShade} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: f(pose(i, 0, n).shade) }} />
          {active && !moving && (
            <HeroPlayerControls item={item} playing={playing} muted={muted} progress={progress} barClass={armed ? '' : BAR_UNTIL_STARTED} onTogglePlay={toggle} onToggleMute={() => setMuted((m) => !m)} onSeek={seek} />
          )}
          {!active && (
            <button
              type="button"
              onClick={onSelect}
              aria-label={`${tr('Show video')} ${i + 1} ${tr('of')} ${n}`}
              className="absolute inset-0 z-10 cursor-pointer bg-lime/0 transition-colors duration-300 hover:bg-lime/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime motion-reduce:transition-none"
            />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[10%/5.6%] ring-1 ring-inset ring-white/10" />
        </div>
      </div>
    </div>
  )
}

export default function RotaryStage({ items, label, autoPlayOnView = false }) {
  const n = items.length
  const [active, setActive] = useState(0)
  const [moving, setMoving] = useState(false)
  const posRef = useRef(0)
  const activeRef = useRef(0)
  const raf = useRef(0)
  const root = useRef(null)
  const phoneEls = useRef([])
  const shadeEls = useRef([])
  const drag = useRef(null)
  const [inView, setInView] = useState(false)
  const autoAllowed = useAutoplayAllowed()

  const apply = useCallback((pos) => {
    for (let i = 0; i < n; i += 1) {
      const p = pose(i, pos, n)
      const el = phoneEls.current[i]
      if (el) { const st = poseStyle(p); el.style.transform = st.transform; el.style.zIndex = String(st.zIndex) }
      const sh = shadeEls.current[i]
      if (sh) sh.style.opacity = String(f(p.shade))
    }
  }, [n])

  const select = useCallback((target) => {
    const t = ((target % n) + n) % n
    const from = posRef.current
    const d = shortestDelta(from, t, n)
    cancelAnimationFrame(raf.current)
    activeRef.current = t
    setActive(t)
    if (Math.abs(d) < 1e-3) { posRef.current = t; apply(t); setMoving(false); return }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { posRef.current = t; apply(t); setMoving(false); return }
    setMoving(true)
    const dur = Math.round(Math.min(ROTATION_MS, 380 + 340 * Math.abs(d)))
    const t0 = performance.now()
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      const p = from + d * easeInOutCubic(k)
      posRef.current = p
      apply(p)
      if (k < 1) raf.current = requestAnimationFrame(tick)
      else { posRef.current = t; apply(t); setMoving(false) }
    }
    raf.current = requestAnimationFrame(tick)
  }, [n, apply])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  /* is the stage on screen? (drives play-when-reached and pauses every video when it leaves the screen) */
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (!e.isIntersecting) el.querySelectorAll('video').forEach((v) => v.pause()) }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select(activeRef.current + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(activeRef.current - 1) }
  }
  const onPointerDown = (e) => { drag.current = { x: e.clientX, moved: false } }
  const onPointerMove = (e) => { if (drag.current && Math.abs(e.clientX - drag.current.x) > 10) drag.current.moved = true }
  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 45) select(activeRef.current + (dx < 0 ? 1 : -1))
  }

  return (
    <div
      ref={root}
      id="showcase-stage"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null }}
      onClickCapture={(e) => { if (drag.current?.moved) { e.preventDefault(); e.stopPropagation() } }}
      className="absolute inset-0 touch-pan-y select-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime/60"
    >
      {/* the three videos: the holder is the CENTRE video's box as a share of the scene (24.22 % = 320 of the 1280 px grid); everything else is measured in its own width. Every frame is exactly 9:16 */}
      <div className="absolute aspect-[9/16] -translate-x-1/2 -translate-y-1/2 [perspective:1500px]" style={{ left: '50%', top: '41.2%', width: '25%' }}>
        {/* THE ACTIVE-VIDEO HALO. Two layers behind the featured card, both in the holder (which is NOT clipped: no overflow-hidden ancestor between here and the scene's own edges):
            1 a wide, soft lime aura (z 55); 2 a lime LED ring hugging the card's edges (z 60), blurred, so a bright halo is visible around the top, sides and corners and falls off outward.
            Both sit BETWEEN the supporting cards (z <= 25... they are lit from behind) and the featured card (z 100): the halo never covers the featured video. They stay put; the videos rotate through them. */}
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[134%] w-[164%] -translate-x-1/2 -translate-y-1/2 rounded-[46%]" style={{ zIndex: 55, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(213,255,64,0.4) 0%, rgba(213,255,64,0.27) 55%, rgba(213,255,64,0.1) 78%, rgba(213,255,64,0) 100%)', filter: 'blur(28px)' }} />
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-[13%/7.3%]" style={{ zIndex: 60, border: '7px solid rgba(213,255,64,0.9)', boxShadow: '0 0 40px 8px rgba(213,255,64,0.48), inset 0 0 22px rgba(213,255,64,0.4)', filter: 'blur(9px)' }} />
        {items.map((item, i) => (
          <Phone
            key={item.id}
            item={item}
            i={i}
            n={n}
            active={i === active}
            moving={moving}
            inView={inView}
            autoMode={autoPlayOnView && autoAllowed && i === 0}
            onSelect={() => select(i)}
            setEl={(el) => { phoneEls.current[i] = el }}
            setShade={(el) => { shadeEls.current[i] = el }}
          />
        ))}
      </div>
      {/* status and the two keyboard controls: not drawn (the reference shows none); arrow keys, swipe and a click on a side video are the visible ways, these are for assistive technology */}
      <span className="sr-only" aria-live="polite">{`${tr('Video')} ${active + 1} ${tr('of')} ${n}`}</span>
      {n > 1 && (
        <>
          <button type="button" onClick={() => select(activeRef.current - 1)} className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-2 focus-visible:left-2 focus-visible:z-30 focus-visible:rounded-full focus-visible:bg-black focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:text-lime">{tr('Previous video')}</button>
          <button type="button" onClick={() => select(activeRef.current + 1)} className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-2 focus-visible:right-2 focus-visible:z-30 focus-visible:rounded-full focus-visible:bg-black focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:text-lime">{tr('Next video')}</button>
        </>
      )}
    </div>
  )
}
