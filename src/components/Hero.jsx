import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { BOOKING_URL } from '../config.js'

const ROTATING_WORDS = ['convert', 'resonate', 'sell', 'connect']

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient lime glow — replaces the old violet/coral wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[40%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-14 md:px-8 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left column — text */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Paid social + Organic creative studio
            </div>

            <h1 className="mt-5 md:mt-6 font-display font-semibold text-ink tracking-display-xl leading-[1.02] text-[40px] sm:text-[50px] md:text-[54px] lg:text-[60px] xl:text-[70px]">
              <span className="block">Performance creatives</span>
              <span className="block">
                engineered to <RotatingWord words={ROTATING_WORDS} />
              </span>
            </h1>

            <p className="mt-5 md:mt-6 max-w-xl text-base md:text-lg text-ink-muted leading-relaxed">
              UGC ads, spokesperson videos, and creative strategy for brands that scale on paid social.
            </p>

            <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-5">
              <a
                href={BOOKING_URL}
                className="cta-gradient group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-canvas"
              >
                Book a Creative Call
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-lime transition-colors"
              >
                See the process
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          {/* Right column — phones cluster + emojis + stats */}
          <div className="lg:col-span-6">
            <PhonesStage />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Rotating headline word ---------- */

function RotatingWord({ words }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, 2200)
    return () => clearInterval(id)
  }, [words.length])

  // Pick the longest word to set a stable container width — no layout shift.
  const widest = words.reduce((a, b) => (a.length >= b.length ? a : b), '')

  return (
    <span className="relative inline-block align-baseline overflow-hidden pb-[0.12em]">
      {/* Invisible sizing element — reserves space for the widest word + underline padding */}
      <span className="invisible whitespace-pre">{widest}</span>

      {/* Animated word + underline, both bound to the current word so the
          underline tracks the word's width and sits flush under it */}
      <span
        key={index}
        className="animate-word-in absolute inset-0 flex items-baseline justify-start"
      >
        <span className="relative text-lime">
          {words[index]}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-[0.04em] h-[0.08em] rounded-full bg-lime"
          />
        </span>
      </span>
    </span>
  )
}

/* ---------- Phones + decoration stage ---------- */

function PhonesStage() {
  return (
    <div className="relative">
      {/* Phones cluster — side phones tucked behind the center */}
      <div className="relative z-10 flex items-center justify-center">
        <PhoneStatic
          src="/hero-side-1.png"
          alt="UGC spokesperson video sample 1"
          tilt="-9deg"
          className="hidden md:block opacity-90 -mr-10 lg:-mr-14 translate-y-4"
        />
        <PhoneMockup />
        <PhoneStatic
          src="/hero-side-2.png"
          alt="UGC spokesperson video sample 2"
          tilt="9deg"
          className="hidden md:block opacity-90 -ml-10 lg:-ml-14 translate-y-4"
        />
      </div>

      {/* Flying emojis — rise up only in the OUTER zones (left 0–22% and right 78–100%)
          so they pass alongside the side phones but never cross the center video phone */}
      <FlyingEmoji emoji="🔥" className="bottom-2 left-[2%] text-3xl md:text-4xl" tilt="-8deg" delay="0s" drift="-8px" />
      <FlyingEmoji emoji="💸" className="bottom-2 right-[2%] text-3xl md:text-4xl" tilt="10deg" delay="1.1s" drift="10px" />
      <FlyingEmoji emoji="📈" className="bottom-2 left-[14%] text-3xl md:text-4xl" tilt="-12deg" delay="2.3s" drift="-4px" />
      <FlyingEmoji emoji="💯" className="bottom-2 right-[14%] text-3xl md:text-4xl" tilt="8deg" delay="0.5s" drift="4px" />
      <FlyingEmoji emoji="✨" className="bottom-2 left-[8%] text-2xl md:text-3xl" tilt="5deg" delay="3.4s" drift="-6px" />
      <FlyingEmoji emoji="🚀" className="bottom-2 right-[8%] text-2xl md:text-3xl" tilt="-10deg" delay="1.8s" drift="6px" />

      {/* Floating stats around the cluster */}
      <FloatingStat
        className="top-4 left-0 md:left-2 lg:left-4"
        value="30M+"
        label="Views generated"
      />
      <FloatingStat
        className="top-6 right-2 md:top-8 md:-right-8 lg:-right-12"
        value="1k+"
        label="Videos produced"
      />
      <FloatingStat
        className="-bottom-4 md:-bottom-5 left-1/2 -translate-x-1/2"
        value="400+"
        label="Happy clients"
      />
    </div>
  )
}

function FlyingEmoji({ emoji, className = '', tilt = '0deg', delay = '0s', drift = '0px' }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-[15] select-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] animate-fly-up ${className}`}
      style={{ '--tilt': tilt, '--x-drift': drift, animationDelay: delay }}
    >
      {emoji}
    </span>
  )
}

function FloatingStat({ value, label, className = '' }) {
  return (
    <div
      className={`absolute z-30 rounded-2xl border border-hairline bg-surface-1/80 px-3.5 py-2.5 backdrop-blur-md shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] ${className}`}
    >
      <p className="text-lg md:text-xl font-semibold tracking-display text-ink leading-none">
        {value}
      </p>
      <p className="mt-1 text-[11px] md:text-xs text-ink-muted leading-tight">{label}</p>
    </div>
  )
}

/* ---------- Static side phone (image only, no controls) ---------- */

function PhoneStatic({ src, alt, tilt = '0deg', className = '' }) {
  return (
    <div
      style={{ transform: `rotate(${tilt})` }}
      className={`relative z-10 w-[160px] md:w-[170px] lg:w-[190px] xl:w-[210px] aspect-[9/19.5] rounded-[36px] md:rounded-[40px] bg-[#0a0a0a] p-[8px] md:p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[28px] md:rounded-[32px] bg-black">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />

        {/* Dynamic Island */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1.5 md:top-2 -translate-x-1/2 h-[22px] md:h-[24px] w-[78px] md:w-[88px] rounded-full bg-black z-10"
        />

        {/* Glass-edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] md:rounded-[32px] ring-1 ring-white/10"
        />
      </div>

      {/* Outer body highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[36px] md:rounded-[40px] ring-1 ring-white/5"
      />
    </div>
  )
}

/* ---------- Center phone with looping video + controls ---------- */

const HERO_VIDEO_ID = '52559a16bde25920724239e737b62373'
const HERO_HLS = `https://videodelivery.net/${HERO_VIDEO_ID}/manifest/video.m3u8`

function PhoneMockup() {
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.8)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showVolume, setShowVolume] = useState(false)
  const [playing, setPlaying] = useState(true)

  /* HLS setup */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let hls
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HERO_HLS
    } else if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(HERO_HLS)
      hls.attachMedia(video)
    }
    return () => hls && hls.destroy()
  }, [])

  /* Video events */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => setProgress(video.currentTime)
    const onLoadedMetadata = () => setDuration(video.duration || 0)
    const onEnded = () => setProgress(0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('ended', onEnded)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
    video.volume = volume
  }, [muted, volume])

  const toggleMute = () => setMuted(m => { const next = !m; if (!next) setShowVolume(true); return next })
  const togglePlay = () => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause() }
  const handleSeek = (e) => {
    const video = videoRef.current
    const track = progressRef.current
    if (!video || !track || !duration) return
    const rect = track.getBoundingClientRect()
    video.currentTime = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) / rect.width * duration
  }

  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <div className="relative z-20 w-[240px] sm:w-[260px] md:w-[260px] lg:w-[280px] xl:w-[300px] aspect-[9/19.5] rounded-[44px] md:rounded-[48px] bg-[#0a0a0a] p-[10px] md:p-[12px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_0_0_1px_rgba(255,255,255,0.08)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[44px] md:rounded-[48px] ring-1 ring-white/5" />

      <div className="relative h-full w-full overflow-hidden rounded-[36px] md:rounded-[38px] bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster="https://videodelivery.net/52559a16bde25920724239e737b62373/thumbnails/thumbnail.jpg?time=0s&height=600"
          autoPlay loop muted playsInline preload="auto"
          aria-label="CONVRT performance creative — UGC ad sample"
        />

        <div aria-hidden="true" className="absolute left-1/2 top-2 md:top-2.5 -translate-x-1/2 h-[26px] md:h-[28px] w-[100px] md:w-[110px] rounded-full bg-black z-20" />

        {/* Volume control */}
        <div className="absolute top-14 right-4 z-30 flex items-center gap-1.5" onMouseEnter={() => !muted && setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
          <div className={`flex items-center overflow-hidden transition-all duration-300 ${!muted && showVolume ? 'w-[88px] opacity-100' : 'w-0 opacity-0'}`}>
            <div className="flex h-9 items-center rounded-full bg-black/55 backdrop-blur-md px-3">
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume" className="volume-slider w-16 cursor-pointer"
                style={{ background: `linear-gradient(to right, #fafafa 0%, #fafafa ${volume * 100}%, rgba(255,255,255,0.25) ${volume * 100}%, rgba(255,255,255,0.25) 100%)` }}
              />
            </div>
          </div>
          <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="h-9 w-9 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center transition-colors hover:bg-black/75 active:scale-95">
            {muted ? <SpeakerMutedIcon /> : <SpeakerOnIcon level={volume} />}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute inset-x-4 bottom-5 z-30">
          <div className="flex items-center gap-2.5 rounded-full bg-black/55 backdrop-blur-md pl-1.5 pr-3 py-1.5">
            <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}
              className="h-8 w-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95">
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div ref={progressRef} onClick={handleSeek} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
              className="group relative flex-1 h-1 cursor-pointer rounded-full bg-white/20 transition-[height] duration-150 hover:h-1.5">
              <div className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-100 ease-linear" style={{ width: `${pct}%` }} />
              <div className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[36px] md:rounded-[38px] ring-1 ring-white/10 z-10" />
      </div>
    </div>
  )
}

/* ---------- Icons ---------- */
function SpeakerMutedIcon() {
  return <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14.5 7.5l4 4M18.5 7.5l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function SpeakerOnIcon({ level = 1 }) {
  return <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" />{level > 0.05 && <path d="M14 8c.8.6 1.3 1.3 1.3 2s-.5 1.4-1.3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}{level > 0.5 && <path d="M16.6 5.6c1.7 1.2 2.6 2.7 2.6 4.4s-.9 3.2-2.6 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}</svg>
}
function PlayIcon() {
  return <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 ml-0.5" fill="currentColor" aria-hidden="true"><path d="M4 3l9 5-9 5V3z" /></svg>
}
function PauseIcon() {
  return <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></svg>
}
