import { useCallback, useEffect, useRef, useState } from 'react'
import { posterUrl, languageLabel, industryLabel } from '../../content/ugcPortfolio.js'
import { trackEvent } from '../../lib/analytics.js'
import {
  useAttachSource, useAutoplayAllowed, useIdleAfterLoad, PlayGlyph, PauseGlyph, SoundGlyph,
} from './creatorVideo.jsx'

/* HERO VIDEO STAGE. A reusable showcase of up to three approved creator videos (items come from selectDisplayable(), so every
   one has portfolio permission and creator consent). The active video is large and plays (muted, looping); the others sit beside
   it as supporting cards and switch in on tap, swipe, arrow key, the prev/next buttons or the dots.

   Performance: only posters load at first. The active video's player is mounted after the browser is idle and only while the stage
   is on screen, and a video that stops being active is unmounted (its stream is destroyed). Visitors who prefer reduced motion or
   data saving get posters until they press play, and the transitions are switched off. No auto-advance (WCAG 2.2.2). */

const ACCENTS = ['rgba(213,255,64,0.30)', 'rgba(139,92,246,0.34)', 'rgba(255,106,77,0.30)']

const SLOT = {
  center: 'translate(-50%,0) scale(1)',
  right: 'translate(-50%,0) translateX(64%) translateY(7%) scale(0.8) rotate(4deg)',
  left: 'translate(-50%,0) translateX(-64%) translateY(7%) scale(0.8) rotate(-4deg)',
}

function StagePlayer({ item, wantPlay, muted, onPlaying, onProgress }) {
  const ref = useRef(null)
  useAttachSource(ref, item)
  useEffect(() => { if (ref.current) ref.current.muted = muted }, [muted])
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    const sync = () => { if (wantPlay) v.play().catch(() => {}); else v.pause() }
    sync()
    v.addEventListener('canplay', sync)
    return () => v.removeEventListener('canplay', sync)
  }, [wantPlay, item])
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    const play = () => onPlaying(true)
    const pause = () => onPlaying(false)
    const time = () => onProgress(v.duration ? v.currentTime / v.duration : 0)
    v.addEventListener('playing', play)
    v.addEventListener('pause', pause)
    v.addEventListener('timeupdate', time)
    return () => { v.removeEventListener('playing', play); v.removeEventListener('pause', pause); v.removeEventListener('timeupdate', time) }
  }, [onPlaying, onProgress])
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={posterUrl(item)}
      aria-label={item.caption}
      className="absolute inset-0 h-full w-full bg-black object-cover"
    />
  )
}

export default function CreatorVideoStage({ items }) {
  const shown = items.slice(0, 3)
  const n = shown.length
  const [active, setActive] = useState(0)
  const [userIntent, setUserIntent] = useState(null) // null = follow the default, true/false = the visitor pressed play/pause
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [inView, setInView] = useState(false)
  const stageRef = useRef(null)
  const startX = useRef(null)
  const autoplay = useAutoplayAllowed()
  const idle = useIdleAfterLoad()

  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return undefined }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const select = useCallback((i, how) => {
    setActive((cur) => {
      const next = (i + n) % n
      if (next !== cur) { setPlaying(false); setProgress(0); trackEvent('ugc_hero_video_switch', { how }) }
      return next
    })
  }, [n])

  const mountPlayer = userIntent !== null || (autoplay && idle)
  const wantPlay = inView && (userIntent ?? autoplay)
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

  const toggle = () => { const next = !playing; setUserIntent(next); trackEvent('ugc_hero_video_play', { state: next ? 'play' : 'pause' }) }
  const meta = [industryLabel(item.industry), item.languages.map(languageLabel).join(' · ')].filter(Boolean).join(' · ')

  return (
    <div role="group" aria-roledescription="carousel" aria-label="Creator UGC videos" className="mx-auto w-full max-w-[520px]">
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { startX.current = null }}
        className="relative aspect-[10/11] w-full touch-pan-y select-none rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-[background] duration-700 motion-reduce:transition-none"
          style={{ background: `radial-gradient(ellipse 70% 55% at 50% 52%, ${ACCENTS[active % ACCENTS.length]}, transparent 70%)` }}
        />
        {shown.map((it, i) => {
          const rel = (i - active + n) % n
          const slot = rel === 0 ? 'center' : rel === 1 ? 'right' : 'left'
          const isActive = rel === 0
          return (
            <div
              key={it.id}
              className={`absolute top-0 left-1/2 aspect-[9/16] w-[52%] transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none ${isActive ? 'z-20' : 'z-10 opacity-60 brightness-75 hover:opacity-90 hover:brightness-90'}`}
              style={{ transform: SLOT[slot] }}
            >
              <div className={`relative h-full w-full overflow-hidden rounded-[28px] border bg-surface-1 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ${isActive ? 'border-lime/50 ring-1 ring-lime/30' : 'border-hairline-strong'}`}>
                <img
                  src={posterUrl(it)}
                  alt=""
                  width="405"
                  height="720"
                  decoding="async"
                  {...(isActive ? { fetchpriority: 'high' } : { loading: 'lazy' })}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {isActive && mountPlayer && (
                  <StagePlayer key={it.id} item={it} wantPlay={wantPlay} muted={muted} onPlaying={setPlaying} onProgress={setProgress} />
                )}
                {isActive ? (
                  <>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                    {!playing && (
                      <button
                        type="button"
                        onClick={toggle}
                        aria-label={`Play video: ${it.caption}`}
                        className="absolute inset-0 z-10 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/45 text-ink backdrop-blur"><PlayGlyph /></span>
                      </button>
                    )}
                    <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggle}
                        aria-label={playing ? 'Pause video' : 'Play video'}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/55 text-ink backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
                      >
                        {playing ? <PauseGlyph /> : <PlayGlyph className="h-4 w-4" />}
                      </button>
                      <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                        <div className="h-full rounded-full bg-lime" style={{ width: `${Math.round(progress * 100)}%` }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setMuted((m) => !m)}
                        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
                        aria-pressed={!muted}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/55 text-ink backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
                      >
                        <SoundGlyph muted={muted} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => select(i, 'card')}
                    aria-label={`Show video ${i + 1} of ${n}: ${it.caption}`}
                    className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {n > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => select(active - 1, 'button')}
            aria-label="Previous video"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-colors hover:border-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
          >
            <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <ol className="flex items-center">
            {shown.map((it, i) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => select(i, 'dot')}
                  aria-label={`Video ${i + 1} of ${n}`}
                  aria-current={i === active ? 'true' : undefined}
                  className="group flex h-11 w-8 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${i === active ? 'w-6 bg-lime' : 'w-1.5 bg-surface-3 group-hover:bg-ink-subtle'}`} />
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => select(active + 1, 'button')}
            aria-label="Next video"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-colors hover:border-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
          >
            <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
      <p aria-live="polite" className="mt-1 text-center text-sm leading-snug text-ink-muted">
        <span className="font-medium text-ink">{item.caption}</span>
        {meta && <span className="block text-[13px]">{meta}</span>}
      </p>
    </div>
  )
}
