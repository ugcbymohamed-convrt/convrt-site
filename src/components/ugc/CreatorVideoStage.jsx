import { useCallback, useEffect, useRef, useState } from 'react'
import { attachHls } from '../../lib/hls.js'
import { posterUrl, hlsUrl, languageLabel, industryLabel } from '../../content/ugcPortfolio.js'
import { trackEvent } from '../../lib/analytics.js'
import { useAutoplayAllowed, useIdleAfterLoad, PlayGlyph, PauseGlyph, SoundGlyph } from './creatorVideo.jsx'

/* THE HERO PHONE STAGE (same visual language and the same rotate-on-click behaviour as the homepage's CaseStudies phone carousel).

   Three overlapping smartphone frames: one large active video in the centre, two slightly smaller phones behind it on either side.
   Click (or tap, swipe, or use the arrow keys / prev / next / dots) on a side phone and it moves to the centre while the old centre
   phone takes the matching side position; position, scale, depth and opacity animate together in 560 ms.

   Media rules (every one is enforced here):
   • Items are approved portfolio videos only (selectDisplayable). With none, <PhoneShowcaseFallback> shows the same frames empty, rotating by itself.
   • Exactly one video can play: only the active phone is ever told to play; every other video is paused (and shows its own frame).
   • No audio by itself: videos start muted. Once the visitor turns sound on it stays on as they move between videos (if a browser refuses
     to start a video with sound, that video plays muted and the sound button shows it).
   • Nothing downloads until needed: posters first; a video's source is attached only after it has been active AND the browser is idle,
     and never for reduced-motion / data-saver visitors until they press play. A paused phone keeps its source, so it can resume.
   • Playback pauses when the hero leaves the viewport and when the tab is hidden.
   • Transitions are switched off for prefers-reduced-motion. There is no automatic advance (only the empty fallback demonstrates
     the rotation by itself). Subtle mouse parallax (a few pixels) for mouse users only. */

const MS = 560 // transition time (within the requested 400–650 ms)

const SLOT = {
  center: 'translate3d(-50%,-50%,0) scale(1) rotateY(0deg)',
  right: 'translate3d(-50%,-50%,0) translateX(var(--off)) scale(0.8) rotateY(-15deg)',
  left: 'translate3d(-50%,-50%,0) translateX(calc(var(--off) * -1)) scale(0.8) rotateY(15deg)',
}
/* Responsive size of the centre phone, and how far (as a share of one phone's width) the side phones sit from it. Sized so the three
   phones never overflow their column or the viewport. */
export const STAGE_SIZE = 'w-[192px] [--off:54%] min-[420px]:w-[214px] min-[420px]:[--off:52%] md:w-[250px] md:[--off:60%] lg:w-[224px] lg:[--off:56%] xl:w-[276px] xl:[--off:58%]'
const ACCENTS = ['rgba(213,255,64,0.26)', 'rgba(139,92,246,0.32)', 'rgba(255,106,77,0.26)']

/* Smartphone frame: same bezel, radius, island and glass edge as the homepage hero phones. */
export function PhoneShell({ active = false, className = '', children }) {
  return (
    <div
      className={`relative h-full w-full rounded-[34px] bg-[#0a0a0a] p-[7px] transition-shadow duration-500 motion-reduce:transition-none md:rounded-[44px] md:p-[10px] ${className}`}
      style={{
        boxShadow: active
          ? '0 50px 90px -25px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.09), 0 0 80px -24px rgba(213,255,64,0.32)'
          : '0 30px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-black md:rounded-[34px]">
        {children}
        <div aria-hidden="true" className="absolute left-1/2 top-1.5 z-20 h-[18px] w-[70px] -translate-x-1/2 rounded-full bg-black md:top-2 md:h-[22px] md:w-[88px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[27px] ring-1 ring-inset ring-white/10 md:rounded-[34px]" />
      </div>
    </div>
  )
}

/* Floor shadow and light under the phones: depth, not decoration that moves. */
function Lighting({ accent }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[150%] -translate-x-1/2 -translate-y-1/2 ugc-breathe transition-[background] duration-700 motion-reduce:transition-none" style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${accent}, transparent 70%)` }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-3 left-1/2 h-8 w-[110%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-xl" />
    </>
  )
}

/* Subtle pointer parallax for mouse users: the whole stage drifts a few pixels toward the cursor and eases back. No tilt, no float,
   nothing for touch or reduced-motion visitors. It writes two CSS variables straight to the element (no React renders). */
function useParallax(ref, enabled) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return undefined
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2
      el.style.setProperty('--mx', `${(x * 9).toFixed(1)}px`)
      el.style.setProperty('--my', `${(y * 5).toFixed(1)}px`)
    }
    const leave = () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px') }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [ref, enabled])
}
/* Preview-host only (usePreviewHost): stand-in screens for reviewing the layout before the approved videos exist. */
const PREVIEW_PORTRAITS = ['/creators/portrait-1.webp', '/creators/portrait-4.webp', '/creators/portrait-3.webp']
const DRIFT = { transform: 'translate3d(var(--mx,0px), var(--my,0px), 0)', transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }

const ChevronLeft = () => <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
const ChevronRight = () => <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>

/* ── Fallback (no approved videos yet): the same three frames, empty, but alive. They are built like short-form video screens (profile
   line, caption lines, side buttons as quiet outlines), the stage rotates by itself every few seconds so the switching is obvious,
   and a visitor can click a side phone, swipe, or use the arrows and dots to bring any phone to the centre. No stand-in footage,
   no play button and no creator claim. It is decoration, so it is hidden from assistive technology and none of it takes focus. ── */
export function PhoneShowcaseFallback({ portraits = false }) {
  const [active, setActive] = useState(0)
  const [taken, setTaken] = useState(false) // the visitor has taken over: stop rotating by itself
  const [hover, setHover] = useState(false)
  const autoplay = useAutoplayAllowed()
  const stageRef = useRef(null)
  const startX = useRef(null)
  useParallax(stageRef, autoplay)

  useEffect(() => {
    if (!autoplay || taken || hover) return undefined
    const t = window.setInterval(() => { if (!document.hidden) setActive((a) => (a + 1) % 3) }, 3600)
    return () => window.clearInterval(t)
  }, [autoplay, taken, hover])

  const pick = (i) => { setTaken(true); setActive((i + 3) % 3) }
  const tones = [ACCENTS[1], ACCENTS[0], ACCENTS[2]]

  return (
    <div aria-hidden="true" className="mx-auto w-full">
      <div
        ref={stageRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onPointerDown={(e) => { startX.current = e.clientX }}
        onPointerUp={(e) => {
          if (startX.current == null) return
          const dx = e.clientX - startX.current
          startX.current = null
          if (Math.abs(dx) > 45) pick(active + (dx < 0 ? 1 : -1))
        }}
        className="relative mx-auto flex w-full touch-pan-y select-none justify-center py-5 [perspective:1400px]"
      >
        <div className={`relative aspect-[9/19.5] ${STAGE_SIZE}`} style={DRIFT}>
          <Lighting accent={tones[active]} />
          {tones.map((tone, i) => {
            const rel = (i - active + 3) % 3
            const slot = rel === 0 ? 'center' : rel === 1 ? 'right' : 'left'
            const isActive = rel === 0
            return (
              <div
                key={i}
                onClick={isActive ? undefined : () => pick(i)}
                className={`group absolute left-1/2 top-1/2 w-full aspect-[9/19.5] will-change-transform transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isActive ? 'z-20' : 'z-10 cursor-pointer opacity-90'}`}
                style={{ transform: SLOT[slot], transitionDuration: `${MS}ms` }}
              >
                <PhoneShell active={isActive}>
                  {portraits ? (
                    <>
                      <img src={PREVIEW_PORTRAITS[i]} alt="" width="600" height="750" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} draggable="false" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.7) 100%)' }} />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 transition-[background] duration-700 motion-reduce:transition-none" style={{ background: `radial-gradient(120% 70% at 50% 18%, ${tone}, transparent 70%), linear-gradient(180deg, #17171b 0%, #0b0b0d 100%)` }} />
                      <img src="/convrt-logo.svg" alt="" width="120" height="47" className="absolute left-1/2 top-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 opacity-30" style={{ filter: 'brightness(0) invert(1)' }} draggable="false" />
                    </>
                  )}
                  {/* short-form video chrome, drawn as quiet skeletons */}
                  <div className="absolute inset-x-[10%] bottom-[7%] flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5"><span className="h-5 w-5 shrink-0 rounded-full bg-white/15" /><span className="h-1.5 w-1/3 rounded-full bg-white/20" /></div>
                      <span className="block h-1.5 w-11/12 rounded-full bg-white/12" />
                      <span className="block h-1.5 w-2/3 rounded-full bg-white/12" />
                    </div>
                    <div className="flex flex-col items-center gap-2.5">
                      {[0, 1, 2].map((k) => <span key={k} className="h-5 w-5 rounded-full border border-white/20 bg-white/[0.07]" />)}
                    </div>
                  </div>
                  <div className="absolute inset-x-[10%] bottom-[3%] h-[3px] overflow-hidden rounded-full bg-white/15">
                    <span key={`${active}-${isActive}`} className={`block h-full rounded-full bg-lime/80 ${isActive && autoplay && !taken ? 'ugc-progress' : ''}`} style={isActive ? (autoplay && !taken ? { animationDuration: '3600ms' } : { width: '35%' }) : { width: '0%' }} />
                  </div>
                  {!isActive && <div className="pointer-events-none absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:opacity-0 motion-reduce:transition-none" />}
                </PhoneShell>
                {!isActive && <span className="pointer-events-none absolute inset-0 rounded-[34px] ring-2 ring-lime/0 transition-[box-shadow] duration-300 group-hover:ring-lime/60 md:rounded-[44px]" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-3">
        <button type="button" tabIndex={-1} onClick={() => pick(active - 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-colors hover:border-lime/60 hover:text-lime"><ChevronLeft /></button>
        <div className="flex items-center">
          {[0, 1, 2].map((i) => (
            <button key={i} type="button" tabIndex={-1} onClick={() => pick(i)} className="flex h-10 w-8 items-center justify-center">
              <span className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${i === active ? 'w-6 bg-lime' : 'w-1.5 bg-surface-3'}`} />
            </button>
          ))}
        </div>
        <button type="button" tabIndex={-1} onClick={() => pick(active + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-colors hover:border-lime/60 hover:text-lime"><ChevronRight /></button>
      </div>
      <p className="mx-auto mt-1 flex items-center justify-center gap-1.5 text-[13px] text-ink-muted">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-lime" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V5.5a1.5 1.5 0 013 0V10m0-1.5a1.5 1.5 0 013 0V11m0-1a1.5 1.5 0 013 0v4.5c0 3-2 5.5-5 5.5h-1.5c-2 0-3.2-.8-4.3-2.3L5 14.5a1.4 1.4 0 012.2-1.7L9 14.5" /></svg>
        Tap a side phone to bring it forward
      </p>
    </div>
  )
}

/* One phone. The <video> element exists from the start (so a paused phone keeps its last frame and never flashes back to the poster),
   but its source is attached only when `load` is true. */
function StagePhone({ item, slot, n, index, active, load, wantPlay, muted, playing, nudge, onSelect, onPlaying, onProgress, onTogglePlay, onToggleMute, onSoundBlocked, progress }) {
  const ref = useRef(null)

  useEffect(() => {
    const v = ref.current
    if (!v || !load) return undefined
    if (item.source.cloudflareId) {
      const hls = attachHls(v, hlsUrl(item), { fastStart: true })
      return () => hls.destroy()
    }
    v.src = item.source.mp4
    return () => { v.removeAttribute('src'); v.load() }
  }, [load, item])

  useEffect(() => { if (ref.current) ref.current.muted = muted }, [muted])
  /* Jump to any point: the seek bar sets the position as a fraction of the duration (ignored until the video's length is known). */
  const seek = (fraction) => {
    const v = ref.current
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return
    v.currentTime = fraction * v.duration
    onProgress(fraction)
  }
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    const sync = () => {
      if (!(active && wantPlay)) { v.pause(); return }
      v.play().catch((err) => {
        // Only when the browser refuses sound (e.g. Safari without a fresh tap): play this video muted and let the button show that.
        // Any other failure (such as the play request being interrupted while the stream attaches) must not touch the sound setting.
        if (err && err.name === 'NotAllowedError' && !v.muted) { v.muted = true; onSoundBlocked(); v.play().catch(() => {}) }
      })
    }
    sync()
    v.addEventListener('canplay', sync)
    return () => v.removeEventListener('canplay', sync)
  }, [active, wantPlay, load, item, onSoundBlocked])
  useEffect(() => {
    const v = ref.current
    if (!v || !active) return undefined
    const on = () => onPlaying(true)
    const off = () => onPlaying(false)
    const time = () => onProgress(v.duration ? v.currentTime / v.duration : 0)
    v.addEventListener('playing', on)
    v.addEventListener('pause', off)
    v.addEventListener('timeupdate', time)
    return () => { v.removeEventListener('playing', on); v.removeEventListener('pause', off); v.removeEventListener('timeupdate', time) }
  }, [active, onPlaying, onProgress])

  return (
    <div
      className={`absolute left-1/2 top-1/2 w-full aspect-[9/19.5] will-change-transform transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${active ? 'z-20' : 'z-10 opacity-90'}`}
      style={{ transform: SLOT[slot], transitionDuration: `${MS}ms` }}
    >
      <PhoneShell active={active}>
        <img
          src={posterUrl(item)}
          alt=""
          width="540"
          height="1170"
          decoding="async"
          {...(active ? { fetchpriority: 'high' } : { loading: 'lazy' })}
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster={posterUrl(item)}
          aria-label={item.caption}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* the inactive phones are dimmed with an overlay (cheaper to animate than a filter) */}
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-black transition-opacity motion-reduce:transition-none ${active ? 'opacity-0' : 'opacity-40'}`} style={{ transitionDuration: `${MS}ms` }} />

        {active ? (
          <>
            {!playing && (
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={`Play video: ${item.caption}`}
                className="group absolute inset-0 z-10 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime"
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/45 text-ink backdrop-blur transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none ${nudge ? 'ugc-nudge' : ''}`}>
                  <PlayGlyph />
                </span>
              </button>
            )}
            <div className="absolute inset-x-3 bottom-3.5 z-20 md:inset-x-4 md:bottom-5" onPointerDown={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 rounded-full bg-black/55 py-1.5 pl-1.5 pr-1.5 backdrop-blur-md">
                <button
                  type="button"
                  onClick={onTogglePlay}
                  aria-label={playing ? 'Pause video' : 'Play video'}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:h-10 md:w-10"
                >
                  {playing ? <PauseGlyph /> : <PlayGlyph className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  value={Math.round(progress * 1000)}
                  onChange={(e) => seek(Number(e.target.value) / 1000)}
                  onKeyDown={(e) => e.stopPropagation()}
                  aria-label="Seek video"
                  className="ugc-seek min-w-0 flex-1"
                  style={{ '--p': `${Math.round(progress * 1000) / 10}%` }}
                />
                <button
                  type="button"
                  onClick={onToggleMute}
                  aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
                  aria-pressed={!muted}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:h-10 md:w-10"
                >
                  <SoundGlyph muted={muted} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`Show video ${index + 1} of ${n}: ${item.caption}`}
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime"
          />
        )}
      </PhoneShell>
    </div>
  )
}

export default function CreatorVideoStage({ items }) {
  const shown = items.slice(0, 3)
  const n = shown.length
  const [active, setActive] = useState(0)
  const [userIntent, setUserIntent] = useState(null) // null = default, true / false = the visitor pressed play / pause
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [inView, setInView] = useState(true) // the hero is above the fold: assume visible until the observer says otherwise
  const [tabVisible, setTabVisible] = useState(true)
  const [loaded, setLoaded] = useState(() => new Set())
  const [nudge, setNudge] = useState(false)
  const stageRef = useRef(null)
  const startX = useRef(null)
  const autoplay = useAutoplayAllowed()
  const idle = useIdleAfterLoad()
  useParallax(stageRef, autoplay)

  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return undefined }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    const on = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  /* Attach a video's source only once it is the active video and the browser is idle (or the visitor pressed play). */
  const mayLoad = userIntent !== null || (autoplay && idle)
  const activeId = shown[active].id
  useEffect(() => {
    if (mayLoad) setLoaded((s) => (s.has(activeId) ? s : new Set(s).add(activeId)))
  }, [mayLoad, activeId])

  /* A single, one-time invitation: the first time the visitor scrolls a little while the video is still waiting for a press, the
     play button glows lime for a moment. Not for reduced-motion visitors. No scroll hijacking: a passive listener, used once. */
  useEffect(() => {
    if (!autoplay || playing) return undefined
    let done = false
    let t = 0
    const onScroll = () => {
      if (done || window.scrollY < 60) return
      done = true
      setNudge(true)
      t = window.setTimeout(() => setNudge(false), 2600)
      window.removeEventListener('scroll', onScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(t) }
  }, [autoplay, playing])

  const select = useCallback((i, how) => {
    setActive((cur) => {
      const next = (i + n) % n
      if (next !== cur) {
        setPlaying(false); setProgress(0); setUserIntent(null)
        trackEvent('ugc_hero_video_switch', { how })
      }
      return next
    })
  }, [n])

  const soundBlocked = useCallback(() => setMuted(true), [])
  const wantPlay = inView && tabVisible && (userIntent ?? autoplay)
  const item = shown[active]
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select(active + 1, 'key') }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(active - 1, 'key') }
  }
  const onPointerDown = (e) => { startX.current = e.clientX }
  const onPointerUp = (e) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 45) select(active + (dx < 0 ? 1 : -1), 'swipe')
  }
  const togglePlay = () => { const next = !playing; setUserIntent(next); setNudge(false); trackEvent('ugc_hero_video_play', { state: next ? 'play' : 'pause' }) }
  const meta = [industryLabel(item.industry), item.languages.map(languageLabel).join(' · ')].filter(Boolean).join(' · ')

  return (
    <div role="group" aria-roledescription="carousel" aria-label="Creator UGC videos" className="mx-auto w-full">
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { startX.current = null }}
        className="relative mx-auto flex w-full touch-pan-y select-none justify-center rounded-3xl py-5 [perspective:1400px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      >
        <div className={`relative aspect-[9/19.5] ${STAGE_SIZE}`} style={DRIFT}>
          <Lighting accent={ACCENTS[active % ACCENTS.length]} />
          {shown.map((it, i) => {
            const rel = (i - active + n) % n
            const slot = rel === 0 ? 'center' : rel === 1 ? 'right' : 'left'
            const isActive = rel === 0
            return (
              <StagePhone
                key={it.id}
                item={it}
                slot={slot}
                n={n}
                index={i}
                active={isActive}
                load={loaded.has(it.id)}
                wantPlay={wantPlay}
                muted={muted}
                playing={playing}
                nudge={nudge}
                progress={progress}
                onSelect={() => select(i, 'phone')}
                onPlaying={setPlaying}
                onProgress={setProgress}
                onTogglePlay={togglePlay}
                onToggleMute={() => setMuted((m) => !m)}
                onSoundBlocked={soundBlocked}
              />
            )
          })}
        </div>
      </div>

      {n > 1 && (
        <div className="mt-1 flex items-center justify-center gap-3">
          <button type="button" onClick={() => select(active - 1, 'button')} aria-label="Previous video" className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-colors hover:border-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
            <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <ol className="flex items-center">
            {shown.map((it, i) => (
              <li key={it.id}>
                <button type="button" onClick={() => select(i, 'dot')} aria-label={`Video ${i + 1} of ${n}`} aria-current={i === active ? 'true' : undefined} className="group flex h-11 w-8 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
                  <span className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${i === active ? 'w-6 bg-lime' : 'w-1.5 bg-surface-3 group-hover:bg-ink-subtle'}`} />
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => select(active + 1, 'button')} aria-label="Next video" className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-colors hover:border-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
            <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        <span className="font-medium text-ink">{item.caption}</span>
        {meta && <span className="block text-[13px]">{meta}</span>}
      </p>
    </div>
  )
}
