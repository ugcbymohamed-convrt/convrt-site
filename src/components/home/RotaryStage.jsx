import { useCallback, useEffect, useRef, useState } from 'react'
import { attachHls } from '../../lib/hls.js'
import { posterUrl, hlsUrl, captionOf } from '../../content/portfolio.js'
import { PlayGlyph } from '../ugc/creatorVideo.jsx'
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
                   • rotating away pauses the video (it keeps its last frame; native controls: pause, volume, fullscreen, seek, appear on the active video once it has arrived)
                   • everything is paused when the stage leaves the viewport; unmounting (switching client) destroys the stream
   MOTION          • prefers-reduced-motion: the selection changes at once (no orbit)
   The pose maths below is pure and also used for the server-rendered markup, so hydration matches. */

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d={dir < 0 ? 'M8 2L4 6l4 4' : 'M4 2l4 4-4 4'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function Phone({ item, i, n, active, moving, onSelect, setEl, setShade }) {
  const ref = useRef(null)
  const [armed, setArmed] = useState(false) // the visitor pressed play once: the stream is attached from then on

  useEffect(() => {
    if (!armed) return undefined
    const v = ref.current
    if (!v) return undefined
    let hls = null
    if (item.source.cloudflareId) hls = attachHls(v, hlsUrl(item), { fastStart: true })
    else v.src = item.source.mp4
    const play = () => { v.play().catch(() => {}) }
    play()
    v.addEventListener('canplay', play, { once: true })
    return () => { v.removeEventListener('canplay', play); hls?.destroy(); if (!hls) { v.removeAttribute('src'); v.load() } }
  }, [armed, item])

  useEffect(() => { if (!active) ref.current?.pause?.() }, [active])

  return (
    <div ref={setEl} className="absolute left-1/2 top-1/2 w-full will-change-transform" style={poseStyle(pose(i, 0, n))}>
      <div
        className={`group relative aspect-[9/16.7] rounded-[24px] bg-[#0b0b0c] p-[4px] ring-1 transition-[box-shadow,--tw-ring-color] duration-500 motion-reduce:transition-none md:rounded-[32px] md:p-[5px] ${active ? 'ring-lime/60' : 'ring-white/15 group-hover:ring-lime/40'}`}
        style={{ boxShadow: active ? '0 40px 70px -26px rgba(0,0,0,0.95), 0 0 70px -22px rgba(213,255,64,0.38)' : '0 30px 56px -26px rgba(0,0,0,0.9)' }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-black md:rounded-[27px]">
          <img src={posterUrl(item)} alt={captionOf(item)} width="405" height="720" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" className="absolute inset-0 h-full w-full object-cover" />
          {armed && (
            <video ref={ref} playsInline preload="none" poster={posterUrl(item)} controls={active && !moving} aria-label={captionOf(item)} className="absolute inset-0 h-full w-full bg-black object-cover" />
          )}
          <span ref={setShade} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: f(pose(i, 0, n).shade) }} />
          {active && !armed && (
            <button
              type="button"
              onClick={() => setArmed(true)}
              aria-label={`Play video ${i + 1} of ${n}: ${captionOf(item)}`}
              className="absolute inset-0 z-10 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-lime/60 bg-lime/20 text-ink backdrop-blur transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"><PlayGlyph className="h-6 w-6" /></span>
            </button>
          )}
          {!active && (
            <button
              type="button"
              onClick={onSelect}
              aria-label={`Show video ${i + 1} of ${n}`}
              className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime"
            />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[20px] ring-1 ring-inset ring-white/10 md:rounded-[27px]" />
        </div>
      </div>
    </div>
  )
}

/* The lit circular platform and the curved studio around it: CSS gradients, borders and shadows only (no image, no canvas, no WebGL). Purely decorative. */
function Environment() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
      {/* curved architecture */}
      <div className="absolute left-1/2 top-[-14%] h-[118%] w-[150%] -translate-x-1/2 rounded-[50%] border border-white/[0.05]" />
      <div className="absolute left-1/2 top-[4%] h-[96%] w-[120%] -translate-x-1/2 rounded-[50%] border border-white/[0.07]" style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 58%, rgba(213,255,64,0.075), transparent 70%)' }} />
      {/* ring light behind the videos */}
      <div className="absolute left-1/2 top-[3%] h-[34%] w-[84%] -translate-x-1/2 rounded-[50%]" style={{ border: '2px solid transparent', borderTopColor: 'rgba(224,255,110,0.7)', boxShadow: '0 -22px 60px -18px rgba(213,255,64,0.4)', WebkitMaskImage: 'linear-gradient(180deg,#000 0%,transparent 58%)', maskImage: 'linear-gradient(180deg,#000 0%,transparent 58%)' }} />
      {/* platform: glow ring, lit top surface with a visible edge, contact shadow */}
      <div className="absolute bottom-[0%] left-1/2 h-[26%] w-[98%] -translate-x-1/2 rounded-[50%] border border-lime/20" style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(213,255,64,0.13), rgba(10,10,11,0) 66%)', boxShadow: '0 0 90px -24px rgba(213,255,64,0.4)' }} />
      <div className="absolute bottom-[4.5%] left-1/2 h-[19%] w-[78%] -translate-x-1/2 rounded-[50%]" style={{ background: 'linear-gradient(180deg,#262a1b 0%,#0e0f0b 72%)', boxShadow: 'inset 0 2px 0 rgba(224,255,110,0.65), inset 0 -12px 26px rgba(0,0,0,0.65), 0 9px 0 -1px #15170f, 0 10px 0 0 rgba(213,255,64,0.32), 0 26px 44px -12px #000' }} />
      <div className="absolute bottom-[9.5%] left-1/2 h-[7%] w-[30%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-xl" />
      <div className="absolute bottom-[11%] left-1/2 h-[4%] w-[46%] -translate-x-1/2 rounded-[50%] blur-lg" style={{ background: 'radial-gradient(ellipse, rgba(213,255,64,0.45), transparent 70%)' }} />
    </div>
  )
}

export default function RotaryStage({ items, label }) {
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

  /* pause every video when the stage scrolls out of view */
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) el.querySelectorAll('video').forEach((v) => v.pause()) }, { threshold: 0.05 })
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
  const pad = (v) => String(v).padStart(2, '0')

  return (
    <div ref={root} className="relative">
      <div
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
        className="relative h-[372px] touch-pan-y select-none [perspective:1500px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime/70 min-[420px]:h-[410px] md:h-[500px] lg:h-[560px]"
      >
        <Environment />
        <div className="absolute left-1/2 top-[43%] aspect-[9/16.7] w-[150px] -translate-x-1/2 -translate-y-1/2 min-[420px]:w-[168px] md:w-[212px] lg:w-[250px]">
          {items.map((item, i) => (
            <Phone
              key={item.id}
              item={item}
              i={i}
              n={n}
              active={i === active}
              moving={moving}
              onSelect={() => select(i)}
              setEl={(el) => { phoneEls.current[i] = el }}
              setShade={(el) => { shadeEls.current[i] = el }}
            />
          ))}
        </div>
      </div>

      {n > 1 && (
        <div className="mt-1 flex items-center justify-center gap-4 md:pointer-events-none md:absolute md:inset-x-0 md:top-[43%] md:mt-0 md:justify-between">
          <button type="button" onClick={() => select(activeRef.current - 1)} aria-label="Previous video" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-ink-muted backdrop-blur transition-colors hover:border-lime/60 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:pointer-events-auto"><Chevron dir={-1} /></button>
          <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums text-ink-muted md:sr-only" aria-live="polite"><span className="text-ink">{pad(active + 1)}</span> / {pad(n)}</span>
          <button type="button" onClick={() => select(activeRef.current + 1)} aria-label="Next video" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-ink-muted backdrop-blur transition-colors hover:border-lime/60 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:pointer-events-auto"><Chevron dir={1} /></button>
        </div>
      )}
    </div>
  )
}
