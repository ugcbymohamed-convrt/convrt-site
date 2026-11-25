import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { titleOf, posterUrl, industryLabel, typeLabel, languageLabel, creatorLabel, brandLabel, creditLabel, productionLabel } from '../../content/portfolio.js'
import { useAttachSource, PlayGlyph, PauseGlyph, SoundGlyph } from '../ugc/creatorVideo.jsx'
import { CloseGlyph, Chevron } from './icons.jsx'
import { stepOfArrow } from '../../lib/rtl.js'
import { tr } from '../../i18n/tr.js'

/* The enlarged, vertical viewing experience for ONE video. There is exactly one player on the page: it is mounted only while a card is
   open (so no other video can be playing; opening another card replaces it), and it stops, detaches its stream and goes away on close.

   • Plays with sound as soon as it opens (the click that opened it is the user gesture). If a browser still refuses sound it plays muted and
     the mute button shows that, so the visitor can unmute with one tap. If it cannot start at all, the big play button is there.
   • Controls: play / pause (button, tap on the video, Space), seek bar, mute and a volume slider (not on touch devices, where the hardware
     buttons set the volume), previous / next in the current filter, close (button, Escape or a click on the backdrop).
   • Accessibility: role="dialog" aria-modal, labelled by the title; focus moves in, is trapped, and returns to the card that opened it;
     the page behind does not scroll. Safari / iOS: playsInline (no forced fullscreen), HLS played natively there and through hls.js elsewhere. */

const fmt = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

function Player({ item, color }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [time, setTime] = useState({ cur: 0, dur: 0 })
  const [failed, setFailed] = useState(false)

  useAttachSource(ref, item)

  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    let started = false
    const tryPlay = () => {
      v.play().catch((err) => {
        // Only a sound refusal (Safari without a fresh gesture) falls back to muted playback; any other failure (such as the request being
        // interrupted while the stream attaches) leaves the sound setting alone and waits for canplay or the play button.
        if (err && err.name === 'NotAllowedError' && !v.muted) { v.muted = true; setMuted(true); v.play().catch(() => {}) }
      })
    }
    const onPlaying = () => { started = true; setPlaying(true) }
    const onPause = () => setPlaying(false)
    const onCanPlay = () => { if (!started) tryPlay() }
    const onTime = () => setTime({ cur: v.currentTime, dur: v.duration || 0 })
    const onVolume = () => { setMuted(v.muted); setVolume(v.volume) }
    const onError = () => setFailed(true)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('pause', onPause)
    v.addEventListener('canplay', onCanPlay)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('durationchange', onTime)
    v.addEventListener('volumechange', onVolume)
    v.addEventListener('error', onError)
    tryPlay()
    return () => {
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('canplay', onCanPlay)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('durationchange', onTime)
      v.removeEventListener('volumechange', onVolume)
      v.removeEventListener('error', onError)
      // Closing (or switching video) stops playback and releases the stream.
      v.pause()
    }
  }, [item])

  const toggle = () => { const v = ref.current; if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause() }
  const toggleMute = () => { const v = ref.current; if (v) v.muted = !v.muted }
  const setVol = (x) => { const v = ref.current; if (!v) return; v.volume = x; v.muted = x === 0 }
  const seek = (x) => { const v = ref.current; if (v && Number.isFinite(v.duration)) v.currentTime = x }
  const pct = time.dur ? (time.cur / time.dur) * 100 : 0

  return (
    <>
      <video
        ref={ref}
        playsInline
        preload="none"
        poster={posterUrl(item)}
        aria-label={titleOf(item)}
        onClick={toggle}
        className="absolute inset-0 h-full w-full cursor-pointer bg-black object-contain"
      />
      {failed && <p role="alert" className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl bg-black/70 p-4 text-center text-sm text-ink">{tr('This video could not be loaded. Please try again.')}</p>}
      {!playing && !failed && (
        <button type="button" onClick={toggle} aria-label={tr('Play')} className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-ink backdrop-blur transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none">
          <PlayGlyph className="h-6 w-6" />
        </button>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
        {/* Player controls keep their normal left-to-right layout on every page, Arabic included. */}
        <div dir="ltr" className="flex items-center gap-2.5 rounded-full bg-black/55 py-1 pl-1.5 pr-3 backdrop-blur-md">
          <button type="button" onClick={toggle} aria-label={playing ? tr('Pause') : tr('Play')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-ink transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
            {playing ? <PauseGlyph /> : <PlayGlyph className="h-3.5 w-3.5" />}
          </button>
          <input
            type="range"
            aria-label={tr('Seek')}
            aria-valuetext={`${fmt(time.cur)} of ${fmt(time.dur)}`}
            min="0"
            max={time.dur || 0}
            step="0.1"
            value={time.cur}
            onChange={(e) => seek(Number(e.target.value))}
            className="ugc-seek min-w-0 flex-1"
            style={{ '--p': `${pct}%` }}
          />
          <span className="hidden shrink-0 text-[11px] tabular-nums text-ink-muted min-[380px]:inline">{fmt(time.cur)}</span>
          <button type="button" onClick={toggleMute} aria-label={muted ? tr('Unmute') : tr('Mute')} aria-pressed={muted} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-ink transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
            <SoundGlyph muted={muted || volume === 0} />
          </button>
          <input
            type="range"
            aria-label={tr('Volume')}
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => setVol(Number(e.target.value))}
            className="volume-slider hidden w-16 shrink-0 cursor-pointer [@media(hover:hover)]:block"
            style={{ background: `linear-gradient(to right, #fafafa ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) ${(muted ? 0 : volume) * 100}%)`, accentColor: color }}
          />
        </div>
      </div>
    </>
  )
}

export default function VideoLightbox({ item, color, onClose, onPrev, onNext }) {
  const dialog = useRef(null)
  const closeBtn = useRef(null)
  const opener = useRef(null)
  const title = titleOf(item)
  const who = [brandLabel(item), creatorLabel(item), creditLabel(item)].filter(Boolean).join(' · ')
  // Only what is confirmed: an unknown industry, type or production is simply not mentioned.
  const meta = [industryLabel(item.industry), typeLabel(item), productionLabel(item), ...(item.languages ?? []).map(languageLabel)].filter(Boolean).join(' · ')

  /* focus in on open, back to the opening card on close; lock the page behind */
  useEffect(() => {
    opener.current = document.activeElement
    closeBtn.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      const el = opener.current
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus({ preventScroll: true })
    }
  }, [])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); return }
    const onRange = e.target instanceof HTMLInputElement
    const step = stepOfArrow(e.key)
    if (step < 0 && onPrev && !onRange) { e.preventDefault(); onPrev() }
    if (step > 0 && onNext && !onRange) { e.preventDefault(); onNext() }
    if (e.key === 'Tab' && dialog.current) {
      const nodes = [...dialog.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { e.preventDefault(); first.focus() }
    }
  }, [onClose, onPrev, onNext])

  const navBtn = 'hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/50 text-ink backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:flex'

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={onKeyDown}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ '--cat': color }}
      className="fixed inset-0 z-[100] flex items-center justify-center gap-4 bg-black/90 p-3 backdrop-blur-sm ow-fade"
    >
      <button ref={closeBtn} type="button" onClick={onClose} aria-label={tr('Close video')} className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/60 text-ink backdrop-blur transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:right-5 md:top-5">
        <CloseGlyph className="h-[18px] w-[18px]" />
      </button>

      {onPrev ? <button type="button" onClick={onPrev} aria-label={tr('Previous video')} className={navBtn}><Chevron dir={-1} /></button> : <span className="hidden w-11 md:block" aria-hidden="true" />}

      <div
        className="relative aspect-[9/16] max-w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
        style={{ height: 'min(88vh, 880px, calc((100vw - 24px) * 16 / 9))' }}
      >
        <Player key={item.id} item={item} color={color} />
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent p-4 pr-16">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {who ? `${who} · ` : ''}{meta}
          </p>
        </div>
      </div>

      {onNext ? <button type="button" onClick={onNext} aria-label={tr('Next video')} className={navBtn}><Chevron dir={1} /></button> : <span className="hidden w-11 md:block" aria-hidden="true" />}
    </div>,
    document.body,
  )
}
