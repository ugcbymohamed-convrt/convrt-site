import { useEffect, useRef, useState } from 'react'
import { attachHls } from '../lib/hls.js'
import { usePressFeedback } from '../lib/usePressFeedback.js'
import { OFFER_PATHS } from '../config.js'
import { trackEvent } from '../lib/analytics.js'

/* Secondary offers — Level 2 in the hero's attention hierarchy. Each has its own
   accent (lime for the video offer, pink for the hooks library) so the
   two are recognisable at a glance, but both stay well below the primary CTA. */
const SECONDARY_OFFERS = [
  {
    id: 'video',
    icon: IconClapper,
    title: <>1 <span className="text-lime">FREE</span> Video</>,
    description: 'Try our production risk-free.',
    cta: 'See if you qualify',
    href: OFFER_PATHS.riskFree,
    event: 'risk_free_trial_click',
    card: 'border-lime/30 bg-lime/[0.06] hover:border-lime/60 hover:bg-lime/[0.09] hover:shadow-[0_14px_34px_-18px_rgba(213,255,64,0.55)] focus-visible:outline-lime',
    iconTile: 'border-lime/30 bg-lime/10 text-lime',
    ctaText: 'text-lime',
  },
  {
    id: 'hooks',
    icon: IconBolt,
    title: <>10 <span className="text-[#F472B6]">FREE</span> Ad Hooks</>,
    description: 'Fresh hooks for your next ads.',
    cta: 'Get free hooks',
    href: OFFER_PATHS.hooks,
    event: 'hooks_library_click',
    card: 'border-[#F472B6]/35 bg-[#EC4899]/[0.08] hover:border-[#F472B6]/70 hover:bg-[#EC4899]/[0.14] hover:shadow-[0_14px_34px_-16px_rgba(236,72,153,0.6)] focus-visible:outline-[#F472B6]',
    iconTile: 'border-[#F472B6]/35 bg-[#EC4899]/15 text-[#F472B6]',
    ctaText: 'text-[#F472B6]',
  },
]

export default function Hero() {
  const primaryPress = usePressFeedback()
  const ghostPress = usePressFeedback()
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
          {/* Left column — headline → description → primary CTA → compact secondary offers */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <h1 className="font-display font-semibold text-ink tracking-display-xl leading-[1.02] text-[48px] sm:text-[50px] md:text-[54px] lg:text-[60px] xl:text-[70px]">
              <span className="block">Performance creatives</span>
              <span className="block">
                engineered to <HighlightWord>convert</HighlightWord>
              </span>
            </h1>

            <p className="mt-6 md:mt-8 max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-ink-muted leading-relaxed">
              Human-led UGC and spokesperson videos for paid ads, plus engaging content for your social channels.
            </p>

            {/* Level 1 — the primary action: one value-prop line tied tightly to the button.
                Vertical rhythm of this column: 24 / 32 headline→description, 24 description→offer,
                12 offer→button, 32 / 40 button→secondary, 12 label→cards. */}
            <div className="mt-6">
              <p className="mb-3 text-balance text-[15px] md:text-base font-medium leading-snug text-ink">
                Your next 5 ad concepts. Tailored to your brand. <span className="text-lime">On us.</span>
              </p>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <a
                  href={OFFER_PATHS.roadmap}
                  onClick={() => trackEvent('hero_creative_roadmap_click', { location: 'hero' })}
                  {...primaryPress}
                  className="cta-gradient hero-cta group inline-flex w-full sm:w-auto min-h-[64px] md:min-h-[68px] items-center justify-center gap-2.5
                             rounded-full px-6 md:px-7 lg:px-6 xl:px-7 py-4 text-base md:text-[17px] font-bold tracking-snug text-canvas
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                >
                  Get 5 Free Ad Concepts
                  <svg viewBox="0 0 12 12" className="h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" aria-hidden="true">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="/case-studies"
                  onClick={() => trackEvent('hero_see_our_work_click', { location: 'hero' })}
                  {...ghostPress}
                  className="hero-cta-ghost group inline-flex w-full sm:w-auto min-h-[48px] sm:min-h-[64px] md:min-h-[68px] items-center justify-center gap-2
                             rounded-full border border-hairline-strong bg-surface-2 px-6 md:px-7 lg:px-5 xl:px-7 py-3 sm:py-4 text-base md:text-[17px] font-semibold tracking-snug text-ink
                             hover:border-ink-muted
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  See Our Work
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" aria-hidden="true">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Level 2 — compact secondary offers under a quiet, left-aligned label */}
            <div className="mt-8 md:mt-10 max-w-xl mx-auto lg:mx-0">
              <p className="text-left text-[13px] text-ink-muted">Other ways to get started</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {SECONDARY_OFFERS.map((offer) => (
                  <SecondaryOffer key={offer.id} offer={offer} />
                ))}
              </div>
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

/* ---------- Secondary offer module ----------
   The whole card is the link. On phones the icon sits beside three stacked text
   lines (short card); from sm up the icon shares a row with the title so two
   cards fit side by side in the left column without wrapping. */

function SecondaryOffer({ offer }) {
  const Icon = offer.icon
  return (
    <a
      href={offer.href}
      onClick={() => trackEvent(offer.event, { location: 'hero' })}
      className={`group grid grid-cols-[auto_1fr] items-center gap-x-3 rounded-2xl border p-3.5 sm:p-4
                  transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5
                  motion-reduce:transition-none motion-reduce:hover:translate-y-0
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${offer.card}`}
    >
      <span className={`col-start-1 row-start-1 row-span-3 sm:row-span-1 flex h-10 w-10 items-center justify-center rounded-xl border sm:h-9 sm:w-9 ${offer.iconTile}`}>
        <Icon />
      </span>
      <span className="col-start-2 row-start-1 text-[15px] sm:text-base font-semibold leading-tight tracking-snug text-ink">{offer.title}</span>
      <span className="col-start-2 row-start-2 mt-0.5 text-[13px] leading-snug text-ink-muted sm:col-start-1 sm:col-span-2 sm:mt-2.5">{offer.description}</span>
      <span className={`col-start-2 row-start-3 mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold sm:col-start-1 sm:col-span-2 ${offer.ctaText}`}>
        {offer.cta}
        <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  )
}

function IconClapper() {
  return (
    <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="10" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.4 10L2.6 5.9a1.2 1.2 0 01.9-1.4l17.3-3.5a1.2 1.2 0 011.4.9l.7 3.4L3.4 10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M11 14.2l5 2.8-5 2.8v-5.6z" fill="currentColor" />
    </svg>
  )
}

function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ---------- Highlighted headline word ----------
   Lime text with the brand underline. Same underline geometry the old rotating
   word used, so the headline keeps its look and its line height. */

function HighlightWord({ children }) {
  return (
    <span className="relative inline-block align-baseline pb-[0.12em]">
      <span className="relative text-lime">
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-[0.04em] h-[0.08em] rounded-full bg-lime"
        />
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
          src="/hero-side-1.webp"
          alt="UGC spokesperson video sample 1"
          tilt="-9deg"
          className="opacity-80 md:opacity-90 -mr-5 md:-mr-10 lg:-mr-14 translate-y-4"
        />
        <PhoneMockup />
        <PhoneStatic
          src="/hero-side-2.webp"
          alt="UGC spokesperson video sample 2"
          tilt="9deg"
          className="opacity-80 md:opacity-90 -ml-5 md:-ml-10 lg:-ml-14 translate-y-4"
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
      className={`relative z-10 w-[82px] md:w-[160px] lg:w-[190px] xl:w-[210px] aspect-[9/19.5] rounded-[20px] md:rounded-[36px] lg:rounded-[40px] bg-[#0a0a0a] p-[5px] md:p-[8px] lg:p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[16px] md:rounded-[28px] lg:rounded-[32px] bg-black">
        <img
          src={src}
          alt={alt}
          width="660"
          height="1170"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />

        {/* Dynamic Island */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1 md:top-1.5 lg:top-2 -translate-x-1/2 h-[11px] md:h-[22px] lg:h-[24px] w-[40px] md:w-[78px] lg:w-[88px] rounded-full bg-black z-10"
        />

        {/* Glass-edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[16px] md:rounded-[28px] lg:rounded-[32px] ring-1 ring-white/10"
        />
      </div>

      {/* Outer body highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[20px] md:rounded-[36px] lg:rounded-[40px] ring-1 ring-white/5"
      />
    </div>
  )
}

/* ---------- Center phone with looping video + controls ---------- */

const HERO_VIDEO_ID = '20c642c760e1937953fc33e98f3d859f'
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
    const tryPlay = () => { video.play().catch(() => {}) }
    const stream = attachHls(video, HERO_HLS, { onReady: tryPlay })
    return stream.destroy
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
          poster="https://videodelivery.net/20c642c760e1937953fc33e98f3d859f/thumbnails/thumbnail.jpg?time=0s&height=600"
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
